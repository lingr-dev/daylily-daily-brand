import type { Metadata } from "next";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { BeliefTile } from "@/components/BeliefTile";
import { Container } from "@/components/Container";
import { getBeliefIndex, getBeliefs } from "@/lib/beliefs";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { components } from "@/slices";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBeliefIndex();

  return buildMetadata({
    data: page.data,
    fallbackTitle: "萱草主张",
    path: "/beliefs/",
  });
}

export default async function BeliefsIndexPage() {
  const [page, posts, settings] = await Promise.all([
    getBeliefIndex(),
    getBeliefs(),
    getSettings(),
  ]);

  return (
    <>
      <SliceZone
        slices={page.data.slices}
        components={components}
        context={{ settings }}
      />

      <Container className="py-section">
        {posts.length === 0 ? (
          <p className="text-content-secondary">暂无内容。</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <BeliefTile
                  href={`/beliefs/${post.uid}/`}
                  title={asText(post.data.title)}
                  excerpt={post.data.excerpt}
                  cover={post.data.cover}
                  topic={post.data.topic}
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
