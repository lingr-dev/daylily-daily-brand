/**
 * 构建期图片本地化。
 *
 * 遍历 Prismic 仓库里的全部文档，找出所有图片字段，让 imgix 按宽度阶梯出图，
 * 下载到 public/_img/，并产出 manifest 供 <PrismicImage> 拼 srcset。
 *
 * 为什么必须做：见 src/lib/prismic-image.ts 顶部说明。
 *
 * 运行（Node 24 原生跑 TS，不需要额外的 TS runner）：
 *   node scripts/localize-images.ts
 *   pnpm images
 *
 * 幂等：已存在且非空的文件会跳过，所以重复运行只补新增的图。
 * CI 里建议把 public/_img/ 做成缓存目录，避免每次构建重下全部图片。
 */
import { createClient } from "@prismicio/client";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  IMAGE_FORMAT,
  OG_IMAGE_FORMAT,
  buildImgixUrl,
  buildOgImgixUrl,
  imageKey,
  widthsFor,
  type ImageManifest,
} from "../src/lib/prismic-image.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "_img");
const MANIFEST_PATH = join(ROOT, "src", "generated", "image-manifest.json");

/** 并发下载数。imgix 侧要现场转码，压太高只会排队并触发限流。 */
const CONCURRENCY = 8;

type FoundImage = {
  key: string;
  url: string;
  width: number;
  height: number;
};

async function main() {
  const config = JSON.parse(
    await readFile(join(ROOT, "prismic.config.json"), "utf8"),
  ) as { repositoryName: string };

  const repositoryName =
    process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || config.repositoryName;

  if (repositoryName.startsWith("PLACEHOLDER")) {
    console.error(
      "尚未连接 Prismic 仓库，跳过图片本地化。\n" +
        "先设好 prismic.config.json 的 repositoryName，详见 README「连接 Prismic」。",
    );
    process.exit(1);
  }

  const client = createClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN || undefined,
    fetchOptions: { cache: "no-store" },
  });

  // 预发构建要本地化的是该 Release 里的图片，不是 master 的
  const releaseLabel = process.env.PRISMIC_RELEASE_LABEL;
  const releaseId = process.env.PRISMIC_RELEASE_ID;
  if (releaseLabel || releaseId) {
    const ref = releaseId
      ? await client.getReleaseByID(releaseId)
      : await client.getReleaseByLabel(releaseLabel!);
    client.queryContentFromRef(ref.ref);
    console.log(`内容取自 Release「${ref.label}」`);
  }

  console.log(`拉取 ${repositoryName} 的全部文档 ...`);
  const documents = await client.dangerouslyGetAll();
  console.log(`共 ${documents.length} 篇文档`);

  const found = new Map<string, FoundImage>();
  for (const doc of documents) {
    collectImages(doc, found);
  }
  console.log(`发现 ${found.size} 张待本地化图片`);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(dirname(MANIFEST_PATH), { recursive: true });

  const manifest: ImageManifest = {};
  const jobs: Array<() => Promise<void>> = [];
  let downloaded = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const image of found.values()) {
    const widths = widthsFor(image.width);
    manifest[image.key] = {
      w: image.width,
      h: image.height,
      widths,
      ext: IMAGE_FORMAT,
    };

    const download = (filename: string, url: string) => {
      jobs.push(async () => {
        const target = join(OUT_DIR, filename);

        if (await isNonEmptyFile(target)) {
          skipped++;
          return;
        }

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          await writeFile(target, Buffer.from(await response.arrayBuffer()));
          downloaded++;
        } catch (error) {
          failures.push(`${filename}: ${(error as Error).message}`);
        }
      });
    };

    for (const width of widths) {
      download(
        `${image.key}-${width}.${IMAGE_FORMAT}`,
        buildImgixUrl(image.url, width),
      );
    }

    // 任何一张图都可能被选作 meta_image，所以统一出一份 OG jpeg。
    // 每图多一个文件，品牌站规模下开销可忽略。
    download(`${image.key}-og.${OG_IMAGE_FORMAT}`, buildOgImgixUrl(image.url));
  }

  await runWithConcurrency(jobs, CONCURRENCY);

  // 排序后写入，manifest 的 diff 才稳定可读
  const sorted: ImageManifest = {};
  for (const key of Object.keys(manifest).sort()) {
    sorted[key] = manifest[key];
  }
  await writeFile(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);

  console.log(
    `完成：新下载 ${downloaded} 个文件，命中缓存跳过 ${skipped} 个，manifest ${Object.keys(sorted).length} 条`,
  );

  if (failures.length > 0) {
    // 缺图必须让构建失败：静默漏掉一张图，线上就是一个跨境请求
    console.error(`\n${failures.length} 个文件下载失败：`);
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }
}

/**
 * 递归找出文档里所有图片字段。
 *
 * 不按模型结构硬编码路径，而是识别形状 —— Prismic 的图片值一律是
 * `{ url, dimensions: { width, height }, ... }`。这样 slice、group、
 * 缩略图、meta_image 全部自动覆盖，模型改了也不用改这里。
 */
function collectImages(node: unknown, found: Map<string, FoundImage>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectImages(item, found);
    return;
  }

  if (node === null || typeof node !== "object") return;

  const candidate = node as {
    url?: unknown;
    dimensions?: { width?: unknown; height?: unknown } | null;
  };

  if (
    typeof candidate.url === "string" &&
    candidate.dimensions &&
    typeof candidate.dimensions.width === "number" &&
    typeof candidate.dimensions.height === "number"
  ) {
    const key = imageKey(candidate.url);
    if (!found.has(key)) {
      found.set(key, {
        key,
        url: candidate.url,
        width: candidate.dimensions.width,
        height: candidate.dimensions.height,
      });
    }
    // 图片值内部不会再嵌图片，但缩略图是它的兄弟键，继续遍历同级即可
  }

  for (const value of Object.values(node)) {
    collectImages(value, found);
  }
}

async function isNonEmptyFile(path: string): Promise<boolean> {
  try {
    const info = await stat(path);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function runWithConcurrency(
  jobs: Array<() => Promise<void>>,
  limit: number,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      await job();
    }
  });
  await Promise.all(workers);
}

await main();
