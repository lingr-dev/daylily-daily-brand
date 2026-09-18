import Link from "next/link";
import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicImage } from "@/components/PrismicImage";
import { formatDate } from "@/lib/format";

/**
 * 主张索引宫格的一格。
 *
 * 和 NewsCard 分开：新闻是封面信息流，主张是口径目录。
 * 主题眉标才是格子的识别符；日期退到摘要下方，没有主题就不要假造一个。
 */
export function BeliefTile({
  href,
  title,
  excerpt,
  cover,
  topic,
  publishedAt,
}: {
  href: string;
  title: string;
  excerpt: string | null;
  cover: ImageField<never>;
  topic: string | null;
  publishedAt: string | null;
}) {
  const date = formatDate(publishedAt);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-sand bg-surface-container transition-colors hover:border-hair"
    >
      {isFilled.image(cover) && (
        <div className="bg-sand-wash">
          <PrismicImage
            field={cover}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
            className="h-auto w-full"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {topic && (
          <p className="text-caption font-medium text-brand-deep">{topic}</p>
        )}
        <h3
          className={
            topic
              ? "mt-2 text-lg font-semibold leading-snug text-content-primary transition-colors group-hover:text-brand-deep"
              : "text-lg font-semibold leading-snug text-content-primary transition-colors group-hover:text-brand-deep"
          }
        >
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-content-secondary">
            {excerpt}
          </p>
        )}
        {date && (
          <p className="mt-auto pt-4 text-caption text-content-muted">
            <time dateTime={publishedAt ?? undefined}>{date}</time>
          </p>
        )}
      </div>
    </Link>
  );
}
