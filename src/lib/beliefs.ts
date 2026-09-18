import { type Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

/** 宫格按发布日期倒序 —— 排序在构建期完成，产物里就是最终顺序。 */
const orderings = [
  { field: "my.belief.published_at", direction: "desc" as const },
];

let cachedIndex: Promise<Content.BeliefIndexDocument> | undefined;

/**
 * 主张栏目单例。缺了这篇，/beliefs 构建失败。
 */
export function getBeliefIndex(): Promise<Content.BeliefIndexDocument> {
  cachedIndex ??= createClient()
    .getSingle("belief_index")
    .catch((error: unknown) => {
      throw new Error(
        [
          "读取 Prismic 的 belief_index 单例失败。",
          "",
          "需要先在 Prismic 后台创建并发布一篇 Belief Index 文档",
          "（这是单例类型，只会有一篇）。主张栏目的标题和引言都取自它。",
          "",
          `原始错误：${error instanceof Error ? error.message : String(error)}`,
        ].join("\n"),
      );
    });

  return cachedIndex;
}

export function getBeliefs(): Promise<Content.BeliefDocument[]> {
  return createClient().getAllByType("belief", { orderings });
}
