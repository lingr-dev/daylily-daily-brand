import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { RichText } from "@/components/RichText";

export type CtaBannerProps = SliceComponentProps<Content.CtaBannerSlice>;

export default function CtaBanner({ slice }: CtaBannerProps) {
  const { heading, body, primary_link, secondary_link } = slice.primary;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        <div className="rounded-card bg-content-primary px-6 py-14 text-center md:px-12">
          {isFilled.richText(heading) && (
            <div className="mx-auto max-w-2xl">
              <RichText
                field={heading}
                components={{
                  heading2: ({ children }) => (
                    <h2 className="text-3xl font-semibold text-content-inverse md:text-4xl">
                      {children}
                    </h2>
                  ),
                }}
              />
            </div>
          )}

          {isFilled.richText(body) && (
            <div className="mx-auto mt-5 max-w-xl [&_p]:text-sand">
              <RichText field={body} />
            </div>
          )}

          {(isFilled.link(primary_link) || isFilled.link(secondary_link)) && (
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {isFilled.link(primary_link) && (
                <Button
                  field={primary_link}
                  variant="primary"
                  className="bg-surface-container text-content-primary hover:bg-sand-wash"
                />
              )}
              {isFilled.link(secondary_link) && (
                <Button
                  field={secondary_link}
                  variant="secondary"
                  className="border-content-secondary text-sand hover:border-sand hover:bg-content-body"
                />
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
