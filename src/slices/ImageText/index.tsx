import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { PrismicImage } from "@/components/PrismicImage";
import { RichText } from "@/components/RichText";

export type ImageTextProps = SliceComponentProps<Content.ImageTextSlice>;

/**
 * 图文并排。两个变体只差图片在左还是在右。
 *
 * 用 order 而不是调换 DOM 顺序：小屏永远「图在上、文在下」，
 * 阅读顺序和读屏顺序都保持一致。
 */
export default function ImageText({ slice }: ImageTextProps) {
  const { heading, body, image, link } = slice.primary;
  const imageFirst = slice.variation === "imageLeft";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {isFilled.image(image) && (
            <div
              className={`overflow-hidden rounded-card bg-sand-wash ${
                imageFirst ? "lg:order-first" : "lg:order-last"
              }`}
            >
              <PrismicImage
                field={image}
                sizes="(min-width: 1024px) 34rem, 90vw"
                className="h-auto w-full"
              />
            </div>
          )}

          <div>
            {isFilled.richText(heading) && <RichText field={heading} />}
            {isFilled.richText(body) && (
              <div className="mt-5">
                <RichText field={body} />
              </div>
            )}
            {isFilled.link(link) && (
              <div className="mt-8">
                <Button field={link} variant="secondary" />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
