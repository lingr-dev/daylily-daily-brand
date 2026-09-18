import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { createClient, isReleaseBuild } from "@/prismicio";

/**
 * sitemap.xml 在构建期生成为静态文件，静态导出下正常工作。
 *
 * 预发构建返回空 —— 预发站不该被收录。
 *
 * 注意：sitemap 协议要求绝对 URL，且 `metadataBase` 不作用于这里的 url 字段，
 * 必须自己拼站点根地址。
 */

const absolute = (path: string) => new URL(path, site.url).toString();
/** 静态导出下 metadata route 必须显式声明 force-static */
export const dynamic = "force-static";

/**
 * 一批文档里最近的发布时间。
 *
 * 用在 /changelog 上：release_note 没有自己的 URL（全部渲染在那一页里），
 * 所以它们不进 sitemap，但它们的发布时间正是那一页的最后更新时间。
 * ISO 时间戳按字典序排就是按时间排。
 */
function latestPublication(
  documents: readonly { last_publication_date: string }[],
): string | undefined {
  return documents
    .map((document) => document.last_publication_date)
    .sort()
    .at(-1);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isReleaseBuild) return [];

  const client = createClient();

  const [pages, posts, releases] = await Promise.all([
    client.getAllByType("page"),
    client.getAllByType("news_post"),
    /* 与 /changelog 页面用的是同一条查询，force-cache 下不会多打一次请求。 */
    client.getAllByType("release_note"),
  ]);

  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/news/"), changeFrequency: "weekly", priority: 0.8 },
    {
      url: absolute("/changelog/"),
      lastModified: latestPublication(releases),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...pages.map((page) => ({
      url: absolute(`/${page.uid}/`),
      lastModified: page.last_publication_date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absolute(`/news/${post.uid}/`),
      lastModified: post.last_publication_date,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
