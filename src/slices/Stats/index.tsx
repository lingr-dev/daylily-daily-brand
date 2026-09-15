import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { RichText } from "@/components/RichText";

export type StatsProps = SliceComponentProps<Content.StatsSlice>;

/** 完整 class 字符串查表 —— 拼出来的动态类名不会被 Tailwind 收集。 */
const columnClasses = [
  "",
  "sm:grid-cols-1",
  "sm:grid-cols-2",
  "sm:grid-cols-3",
  "sm:grid-cols-2 lg:grid-cols-4",
] as const;

function gridClassFor(count: number): string {
  return columnClasses[Math.min(count, 4)] ?? columnClasses[4];
}

export default function Stats({ slice }: StatsProps) {
  const { heading, items } = slice.primary;

  if (items.length === 0 && !isFilled.richText(heading)) return null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        <div className="rounded-card border border-hair bg-surface-container px-6 py-12 md:px-12">
          {isFilled.richText(heading) && (
            <div className="max-w-2xl">
              <RichText field={heading} />
            </div>
          )}

          {items.length > 0 && (
            <dl
              className={`grid gap-x-8 gap-y-10 ${gridClassFor(items.length)} ${
                isFilled.richText(heading) ? "mt-12" : ""
              }`}
            >
              {items.map((item, index) => (
                <div key={index}>
                  <dd className="text-title-1 font-semibold tracking-tight text-brand-deep">
                    {item.value}
                  </dd>
                  <dt className="mt-2 text-base font-medium text-content-primary">
                    {item.label}
                  </dt>
                  {item.description && (
                    <p className="mt-1 text-sm leading-relaxed text-content-secondary">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </section>
  );
}
