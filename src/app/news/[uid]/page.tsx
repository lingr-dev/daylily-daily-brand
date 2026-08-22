import type { Metadata } from "next";
import Link from "next/link";
import { asText, isFilled } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { Container } from "@/components/Container";
import { PrismicImage } from "@/components/PrismicImage";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function NewsPostPage({
  params,
}: PageProps<"/news/[uid]">) {
  const { uid } = await params;
  const post = await createClient().getByUID("news_post", uid);
  const publishedAt = formatDate(post.data.published_at);

  return (
    <article>
      <Container className="py-section">
        <Link
          href="/news/"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← 返回新闻动态
        </Link>

        <header className="mt-8 max-w-3xl">
          {publishedAt && (
            <p className="text-sm text-ink-subtle">
              <time dateTime={post.data.published_at ?? undefined}>
                {publishedAt}
              </time>
            </p>
          )}
          <h1 className="mt-3 text-display-sm font-semibold text-ink">
            {asText(post.data.title)}
          </h1>
          {post.data.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              {post.data.excerpt}
            </p>
          )}
        </header>

        {isFilled.image(post.data.cover) && (
          <div className="mt-10 overflow-hidden rounded-card bg-surface-strong">
            <PrismicImage
              field={post.data.cover}
              sizes="(min-width: 1152px) 1152px, 100vw"
              priority
              className="h-auto w-full"
            />
          </div>
        )}
      </Container>

      <SliceZone slices={post.data.slices} components={components} />
    </article>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/news/[uid]">): Promise<Metadata> {
  const { uid } = await params;
  const post = await createClient().getByUID("news_post", uid);

  return buildMetadata({
    data: post.data,
    fallbackTitle: asText(post.data.title),
    path: `/news/${uid}/`,
  });
}

export async function generateStaticParams() {
  const posts = await createClient().getAllByType("news_post");

  return posts.map((post) => ({ uid: post.uid }));
}
