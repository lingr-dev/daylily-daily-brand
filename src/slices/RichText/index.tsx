import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { RichText as RichTextRenderer } from "@/components/RichText";

export type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

/**
 * 正文区块。宽度收窄到易读的行长（中文约 30-40 字/行），
 * 不跟随 Container 的最大宽度。
 */
export default function RichText({ slice }: RichTextProps) {
  if (!isFilled.richText(slice.primary.content)) return null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        <div className="max-w-2xl">
          <RichTextRenderer field={slice.primary.content} />
        </div>
      </Container>
    </section>
  );
}
