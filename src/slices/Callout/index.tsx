import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { RichText } from "@/components/RichText";

export type CalloutProps = SliceComponentProps<Content.CalloutSlice>;

/**
 * 一段需要单独拎出来说的话，图标在左、文字在右的窄卡。
 *
 * 刻意做成「浮在章节底部」而不依赖所在章节的背景色 —— slice 架构里没有
 * 「章节」这个概念，相邻 slice 之间的底色随时可能换（见迁移方案 §9 第 1 条）。
 */
export default function Callout({ slice }: CalloutProps) {
  const { icon, title, body } = slice.primary;

  if (!title && !isFilled.richText(body)) return null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="pb-section"
    >
      <Container>
        <div className="mx-auto flex max-w-3xl items-start gap-5 rounded-xl border border-sand bg-surface-container p-6 shadow-brand-sm lg:gap-6 lg:p-10">
          {icon && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-sand-wash text-brand-deep lg:h-14 lg:w-14">
              <Icon name={icon} className="h-6 w-6 lg:h-7 lg:w-7" />
            </span>
          )}

          <div>
            {title && (
              <p className="text-title-3 font-semibold text-content-primary">
                {title}
              </p>
            )}
            {isFilled.richText(body) && (
              <div className={`[&_p]:text-body-sm ${title ? "mt-2" : ""}`}>
                <RichText field={body} />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
