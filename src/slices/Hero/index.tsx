import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { PrismicImage } from "@/components/PrismicImage";
import { RichText } from "@/components/RichText";

export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * 页面头部区块。两个变体：
 *   default   —— 纯文字，居左，适合内页
 *   withImage —— 左文右图，适合首页
 */
export default function Hero({ slice }: HeroProps) {
  const { eyebrow, heading, body, primary_link, secondary_link } =
    slice.primary;

  const actions = (
    <>
      {isFilled.link(primary_link) && (
        <Button field={primary_link} variant="primary" />
      )}
      {isFilled.link(secondary_link) && (
        <Button field={secondary_link} variant="secondary" />
      )}
    </>
  );

  const text = (
    <div>
      {eyebrow && (
        <p className="text-sm font-medium text-brand-600">{eyebrow}</p>
      )}

      {isFilled.richText(heading) && (
        <div className="mt-4">
          <RichText
            field={heading}
            components={{
              heading1: ({ children }) => (
                <h1 className="text-display-sm font-semibold text-ink md:text-display lg:text-display-lg">
                  {children}
                </h1>
              ),
            }}
          />
        </div>
      )}

      {isFilled.richText(body) && (
        <div className="mt-6 max-w-xl text-lg [&_p]:text-lg">
          <RichText field={body} />
        </div>
      )}

      {(isFilled.link(primary_link) || isFilled.link(secondary_link)) && (
        <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
      )}
    </div>
  );

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section-lg"
    >
      <Container>
        {slice.variation === "withImage" &&
        isFilled.image(slice.primary.image) ? (
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {text}
            <div className="overflow-hidden rounded-card bg-surface-strong">
              <PrismicImage
                field={slice.primary.image}
                sizes="(min-width: 1024px) 34rem, 90vw"
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">{text}</div>
        )}
      </Container>
    </section>
  );
}
