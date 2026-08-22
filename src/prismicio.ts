import {
  createClient as baseCreateClient,
  type ClientConfig,
} from "@prismicio/client";
import prismicConfig from "../prismic.config.json";

/**
 * Prismic 集成 —— 已按「纯静态导出」改造。
 *
 * 与官方 `prismic gen setup` 生成的版本相比有三处刻意的差异，改动理由见
 * docs/tech-research.md 第 12 节：
 *
 * 1. 移除 `enableAutoPreviews()`。它依赖请求期的 cookie / Draft Mode，
 *    而 `output: 'export'` 下没有运行时，Draft Mode 不可用。
 * 2. 移除 /api/preview、/api/exit-preview、/api/revalidate 三个 Route Handler。
 *    它们在静态导出下会直接让构建失败。
 * 3. 新增 Release ref 支持。预发站用同一份代码、指定某个 Release 构建，
 *    以此换回「发布前看整站真实效果」的能力。
 */

export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || prismicConfig.repositoryName;

const accessToken = process.env.PRISMIC_ACCESS_TOKEN || undefined;

/**
 * 预发构建目标。两者留空则构建 master ref（已发布内容），即生产站。
 * 查询非 master ref 需要一个「允许访问其他 ref」的 access token。
 */
const releaseLabel = process.env.PRISMIC_RELEASE_LABEL || undefined;
const releaseId = process.env.PRISMIC_RELEASE_ID || undefined;

/** 当前构建是否为预发（Release）构建。用于在页面上打预发标记。 */
export const isReleaseBuild = Boolean(releaseLabel || releaseId);

/**
 * Release ref 只解析一次。
 *
 * `createClient()` 在构建期会被每个页面、每个需要取数的 slice 各调一次，
 * 若不缓存，一次构建会对 Prismic 发出成百上千次重复的 ref 查询。
 */
let cachedReleaseRef: Promise<string> | undefined;

function resolveReleaseRef(): Promise<string> {
  cachedReleaseRef ??= (async () => {
    const client = baseCreateClient(repositoryName, {
      accessToken,
      fetchOptions: { cache: "force-cache" },
    });

    const ref = releaseId
      ? await client.getReleaseByID(releaseId)
      : await client.getReleaseByLabel(releaseLabel!);

    console.log(
      `[prismic] 预发构建，内容取自 Release「${ref.label}」(${ref.id})`,
    );

    return ref.ref;
  })();

  return cachedReleaseRef;
}

export const createClient = (config: ClientConfig = {}) => {
  if (repositoryName.startsWith("PLACEHOLDER")) {
    throw new Error(
      [
        "尚未连接 Prismic 仓库。",
        "",
        "1. npx prismic login",
        "2. npx prismic repo create <仓库名> --lang zh-cn   （或在 Prismic 后台创建）",
        "3. 把 prismic.config.json 的 repositoryName 改成该仓库名",
        "4. npx prismic push                                （推送本地内容模型）",
        "",
        "详见 README.md「连接 Prismic」一节。",
      ].join("\n"),
    );
  }

  return baseCreateClient(repositoryName, {
    accessToken,
    routes: prismicConfig.routes,
    /**
     * 构建期取数：force-cache 让同一份查询在整次构建中只打一次网络请求，
     * 显著减少 API 调用数与构建时长。
     */
    fetchOptions: { cache: "force-cache" },
    ...(isReleaseBuild ? { ref: resolveReleaseRef } : {}),
    ...config,
  });
};
