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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isReleaseBuild) return [];

  const client = createClient();

  const [pages, posts] = await Promise.all([
    client.getAllByType("page"),
    client.getAllByType("news_post"),
  ]);

  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/news/"), changeFrequency: "weekly", priority: 0.8 },
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
