import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { RichText } from "@/components/RichText";

export type FaqProps = SliceComponentProps<Content.FaqSlice>;

/**
 * 折叠面板用原生 <details>，与站内其他交互保持一致：零客户端 JS，
 * 键盘和读屏开箱可用。
 */
export default function Faq({ slice }: FaqProps) {
  const { heading, items } = slice.primary;
  const filled = items.filter((item) => item.question);

  if (filled.length === 0) return null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        <div className="mx-auto max-w-3xl">
          {isFilled.richText(heading) && <RichText field={heading} />}

          <div
            className={`divide-y divide-line border-y border-line ${
              isFilled.richText(heading) ? "mt-10" : ""
            }`}
          >
            {filled.map((item, index) => (
              <details key={index} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                {isFilled.richText(item.answer) && (
                  <div className="mt-3 [&_p]:text-sm">
                    <RichText field={item.answer} />
                  </div>
                )}
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
