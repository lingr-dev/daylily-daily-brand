import type { MetadataRoute } from "next";
import { createClient } from "@/prismicio";
import { isReleaseBuild } from "@/prismicio";

/**
 * sitemap.xml 在构建期生成为静态文件，静态导出下正常工作。
 *
 * 预发构建返回空 —— 预发站不该被收录。
 */
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
    { url: "/", changeFrequency: "weekly", priority: 1 },
    { url: "/news/", changeFrequency: "weekly", priority: 0.8 },
    ...pages.map((page) => ({
      url: `/${page.uid}/`,
      lastModified: page.last_publication_date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `/news/${post.uid}/`,
      lastModified: post.last_publication_date,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
