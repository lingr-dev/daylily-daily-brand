import { isFilled, type Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

/**
 * 站点设置（Prismic `settings` 单例）。
 *
 * 导航、页脚、备案号、联系方式都归编辑掌握 —— 品牌站的价值就在于这些不需要
 * 找开发改代码。
 *
 * module 级缓存：构建期每个页面都要拿设置，虽然 fetch 层已有 force-cache，
 * 但省掉重复的 promise 链和 JSON 解析仍然值得。
 */
let cached: Promise<Content.SettingsDocument> | undefined;

export function getSettings(): Promise<Content.SettingsDocument> {
  cached ??= createClient()
    .getSingle("settings")
    .catch((error: unknown) => {
      throw new Error(
        [
          "读取 Prismic 的 settings 单例失败。",
          "",
          "如果这是新仓库，需要先在 Prismic 后台创建并发布一篇 Settings 文档",
          "（Settings 是单例类型，只会有一篇）。导航、页脚、备案号都取自它。",
          "",
          `原始错误：${error instanceof Error ? error.message : String(error)}`,
        ].join("\n"),
      );
    });

  return cached;
}

/** 取可用的导航项，过滤掉编辑留空的条目。 */
export function filledLinks<T>(links: readonly T[] | null | undefined): T[] {
  if (!links) return [];
  return links.filter((link) => isFilled.link(link as never));
}
