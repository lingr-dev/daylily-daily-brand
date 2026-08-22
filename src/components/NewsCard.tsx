import Link from "next/link";
import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicImage } from "@/components/PrismicImage";
import { formatDate } from "@/lib/format";

export function NewsCard({
  href,
  title,
  excerpt,
  cover,
  publishedAt,
}: {
  href: string;
  title: string;
  excerpt: string | null;
  cover: ImageField<never>;
  publishedAt: string | null;
}) {
  const date = formatDate(publishedAt);

  return (
    <Link href={href} className="group block">
      {isFilled.image(cover) && (
        <div className="overflow-hidden rounded-card bg-surface-strong">
          <PrismicImage
            field={cover}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
            className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className={isFilled.image(cover) ? "mt-5" : undefined}>
        {date && (
          <p className="text-xs text-ink-subtle">
            <time dateTime={publishedAt ?? undefined}>{date}</time>
          </p>
        )}
        <h3 className="mt-2 text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand-600">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
