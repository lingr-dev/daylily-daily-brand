import type { Metadata } from "next";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { Container } from "@/components/Container";
import { NewsCard } from "@/components/NewsCard";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/** 列表页按发布日期倒序 —— 排序在构建期完成，产物里就是最终顺序。 */
const orderings = [
  { field: "my.news_post.published_at", direction: "desc" as const },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await createClient().getSingle("news_index");

  return buildMetadata({
    data: page.data,
    fallbackTitle: "新闻动态",
    path: "/news/",
  });
}

export default async function NewsIndexPage() {
  const client = createClient();
  const [page, posts] = await Promise.all([
    client.getSingle("news_index"),
    client.getAllByType("news_post", { orderings }),
  ]);

  return (
    <>
      <SliceZone slices={page.data.slices} components={components} />

      <Container className="py-section">
        {posts.length === 0 ? (
          <p className="text-content-secondary">暂无内容。</p>
        ) : (
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <NewsCard
                  href={`/news/${post.uid}/`}
                  title={asText(post.data.title)}
                  excerpt={post.data.excerpt}
                  cover={post.data.cover}
                  publishedAt={post.data.published_at}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
