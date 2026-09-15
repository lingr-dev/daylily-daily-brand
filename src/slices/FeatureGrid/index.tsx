import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { PrismicImage } from "@/components/PrismicImage";
import { RichText } from "@/components/RichText";

export type FeatureGridProps = SliceComponentProps<Content.FeatureGridSlice>;

/**
 * 三个变体：
 *   default —— 无边框列表，图标是上传的图片。内页通用。
 *   card    —— 卡片化，图标改用内联 SVG（Select 选名字）。落地页「我们做的是减法」。
 *   quote   —— 卡片 + 顶部色条 + 一句产品原话。落地页「藏在细节里的温柔」。
 *
 * 变体之间字段不继承，所以这里按 slice.variation 分支取字段 ——
 * TypeScript 也只有在收窄之后才知道 item.icon 是 Image 还是 Select。
 */

/** 列数用完整 class 字符串查表，拼出来的 `lg:grid-cols-${n}` 不会被 Tailwind 收集。 */
const columnClasses: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/** 顶部色条按序轮换，让三张卡各有各的调子，与原型一致。 */
const accentBars = ["bg-marketing-jade", "bg-marketing-peach", "bg-content-muted"];

export default function FeatureGrid({ slice }: FeatureGridProps) {
  const anchorId =
    slice.variation === "default" ? undefined : slice.primary.anchor_id || undefined;

  return (
    <section
      id={anchorId}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        {slice.variation === "quote" ? (
          <QuoteVariation slice={slice} />
        ) : (
          <IconVariation slice={slice} />
        )}
      </Container>
    </section>
  );
}

/** default 与 card 共用同一套「标题 + 引言 + N 列条目」骨架，只差条目的外观。 */
function IconVariation({
  slice,
}: {
  slice: Extract<Content.FeatureGridSlice, { variation: "default" | "card" }>;
}) {
  const { heading, body, columns, items } = slice.primary;
  const isCard = slice.variation === "card";
  const gridClass = columnClasses[columns ?? "3"] ?? columnClasses["3"];

  return (
    <>
      {(isFilled.richText(heading) || isFilled.richText(body)) && (
        <div className={isCard ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
          {isFilled.richText(heading) && <RichText field={heading} />}
          {isFilled.richText(body) && (
            <div className="mt-4">
              <RichText field={body} />
            </div>
          )}
        </div>
      )}

      {items.length > 0 && (
        <ul
          className={`mt-12 grid ${
            isCard ? "gap-6 lg:gap-8" : "gap-x-8 gap-y-10"
          } ${gridClass}`}
        >
          {items.map((item, index) => (
            <li
              key={index}
              className={
                isCard
                  ? "rounded-xl border border-sand bg-surface-container p-8 shadow-brand-sm transition-shadow hover:shadow-brand-md lg:p-10"
                  : undefined
              }
            >
              <ItemIcon slice={slice} item={item} />
              {item.title && (
                <h3 className="mt-5 text-title-3 font-semibold text-content-primary">
                  {item.title}
                </h3>
              )}
              {isFilled.richText(item.description) && (
                <div className={`mt-3 ${isCard ? "" : "[&_p]:text-sm"}`}>
                  <RichText field={item.description} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * 图标的两种来源。收窄到具体变体之后 TypeScript 才认得字段类型：
 * default 是上传的图片，card 是选出来的图标名。
 */
function ItemIcon({
  slice,
  item,
}: {
  slice: Extract<Content.FeatureGridSlice, { variation: "default" | "card" }>;
  item: Content.FeatureGridSliceDefaultPrimaryItemsItem | Content.FeatureGridSliceCardPrimaryItemsItem;
}) {
  if (slice.variation === "card") {
    const icon = (item as Content.FeatureGridSliceCardPrimaryItemsItem).icon;
    if (!icon) return null;
    return (
      <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-sand-wash text-brand-deep">
        <Icon name={icon} className="h-8 w-8" />
      </span>
    );
  }

  const icon = (item as Content.FeatureGridSliceDefaultPrimaryItemsItem).icon;
  if (!isFilled.image(icon)) return null;
  return (
    <PrismicImage field={icon} sizes="48px" className="h-12 w-12 object-contain" />
  );
}

/** 顶部色条 + 图标 + 标题 + 一句产品原话 + 说明。 */
function QuoteVariation({
  slice,
}: {
  slice: Extract<Content.FeatureGridSlice, { variation: "quote" }>;
}) {
  const { heading, items } = slice.primary;

  return (
    <>
      {isFilled.richText(heading) && (
        <div className="mx-auto max-w-2xl text-center">
          <RichText field={heading} />
        </div>
      )}

      {items.length > 0 && (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {items.map((item, index) => (
            <li
              key={index}
              className="relative flex flex-col items-center overflow-hidden rounded-xl border border-sand bg-sand-wash p-8 text-center lg:p-10"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-1.5 ${
                  accentBars[index % accentBars.length]
                }`}
              />
              {item.icon && (
                <Icon name={item.icon} className="h-10 w-10 text-brand-deep" />
              )}
              {item.title && (
                <h3 className="mt-5 text-title-3 font-semibold text-content-primary">
                  {item.title}
                </h3>
              )}
              {item.quote && (
                <p className="mt-5 rounded-lg border border-sand bg-surface-container px-5 py-4 text-content-body italic">
                  「{item.quote}」
                </p>
              )}
              {isFilled.richText(item.description) && (
                <div className="mt-5 [&_p]:text-sm">
                  <RichText field={item.description} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
