import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { PrismicImage } from "@/components/PrismicImage";
import { RichText } from "@/components/RichText";

export type FeatureGridProps = SliceComponentProps<Content.FeatureGridSlice>;

/**
 * 列数用完整 class 字符串查表，而不是拼 `lg:grid-cols-${n}` ——
 * Tailwind 靠扫描源码收集 class，拼出来的动态类名不会被生成。
 */
const columnClasses: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export default function FeatureGrid({ slice }: FeatureGridProps) {
  const { heading, body, columns, items } = slice.primary;
  const gridClass = columnClasses[columns ?? "3"] ?? columnClasses["3"];

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        {(isFilled.richText(heading) || isFilled.richText(body)) && (
          <div className="max-w-2xl">
            {isFilled.richText(heading) && <RichText field={heading} />}
            {isFilled.richText(body) && (
              <div className="mt-4">
                <RichText field={body} />
              </div>
            )}
          </div>
        )}

        {items.length > 0 && (
          <ul className={`mt-12 grid gap-x-8 gap-y-10 ${gridClass}`}>
            {items.map((item, index) => (
              <li key={index}>
                {isFilled.image(item.icon) && (
                  <PrismicImage
                    field={item.icon}
                    sizes="48px"
                    className="h-12 w-12 object-contain"
                  />
                )}
                {item.title && (
                  <h3
                    className={`text-lg font-semibold text-content-primary ${
                      isFilled.image(item.icon) ? "mt-5" : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                )}
                {isFilled.richText(item.description) && (
                  <div className="mt-2 [&_p]:text-sm">
                    <RichText field={item.description} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
