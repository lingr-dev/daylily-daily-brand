import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { PrismicImage } from "@/components/PrismicImage";
import { RichText } from "@/components/RichText";

export type MediaCardsProps = SliceComponentProps<Content.MediaCardsSlice>;

/**
 * 「章节标题 + N 列图文卡」。
 *
 * 一个 slice 承担落地页的两块，区别只在列数与图文顺序：
 *   2 列 + textFirst  —— 「一家人的今天」：先说清楚，再给一张界面图佐证
 *   3 列 + imageFirst —— 「改动有商量」：先给三张界面图，图下各一句说明
 *
 * 顺序用 flex-col-reverse 而不是调换 DOM：阅读顺序与读屏顺序始终是
 * 文字在前，视觉顺序由样式决定。
 */

/** 完整 class 字符串查表 —— 拼出来的 `lg:grid-cols-${n}` 不会被 Tailwind 收集。 */
const columnClasses: Record<string, string> = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
};

export default function MediaCards({ slice }: MediaCardsProps) {
  const { heading, body, columns, layout, anchor_id, items } = slice.primary;
  const gridClass = columnClasses[columns ?? "3"] ?? columnClasses["3"];
  const imageFirst = layout !== "textFirst";

  return (
    <section
      id={anchor_id || undefined}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        {(isFilled.richText(heading) || isFilled.richText(body)) && (
          <div className="mx-auto max-w-3xl text-center">
            {isFilled.richText(heading) && <RichText field={heading} />}
            {isFilled.richText(body) && (
              <div className="mt-6 [&_p]:text-body-lg">
                <RichText field={body} />
              </div>
            )}
          </div>
        )}

        {items.length > 0 && (
          <ul className={`mt-12 grid gap-10 lg:gap-12 ${gridClass}`}>
            {items.map((item, index) => {
              const hasText =
                Boolean(item.eyebrow) ||
                Boolean(item.title) ||
                isFilled.richText(item.body);

              return (
                <li
                  key={index}
                  className={`flex gap-6 ${
                    imageFirst ? "flex-col" : "flex-col-reverse"
                  }`}
                >
                  {isFilled.image(item.image) ? (
                    <PrismicImage
                      field={item.image}
                      sizes="(min-width: 1024px) 24rem, (min-width: 768px) 45vw, 90vw"
                      className="h-auto w-full rounded-xl border border-sand"
                    />
                  ) : (
                    <ImagePlaceholder label="界面图" />
                  )}

                  {hasText && (
                    <div>
                      {item.eyebrow && (
                        <span className="inline-block rounded-pill bg-sand-wash px-4 py-1.5 text-body-sm font-semibold text-brand-deep">
                          {item.eyebrow}
                        </span>
                      )}
                      {item.title && (
                        <h3
                          className={`text-title-2 font-semibold text-content-primary ${
                            item.eyebrow ? "mt-4" : ""
                          }`}
                        >
                          {item.title}
                        </h3>
                      )}
                      {isFilled.richText(item.body) && (
                        <div className="mt-3">
                          <RichText field={item.body} />
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
