import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { PrismicImage } from "@/components/PrismicImage";
import { RichText } from "@/components/RichText";

export type TestimonialProps = SliceComponentProps<Content.TestimonialSlice>;

export default function Testimonial({ slice }: TestimonialProps) {
  const { heading, items } = slice.primary;
  const filled = items.filter((item) => isFilled.richText(item.quote));

  if (filled.length === 0) return null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        {isFilled.richText(heading) && (
          <div className="max-w-2xl">
            <RichText field={heading} />
          </div>
        )}

        <ul
          className={`grid gap-6 ${
            filled.length >= 3 ? "lg:grid-cols-3" : "sm:grid-cols-2"
          } ${isFilled.richText(heading) ? "mt-12" : ""}`}
        >
          {filled.map((item, index) => (
            <li
              key={index}
              className="flex flex-col rounded-card border border-hair bg-surface-container p-6"
            >
              <blockquote className="flex-1 [&_p]:text-base [&_p]:text-content-primary">
                <RichText field={item.quote} />
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3">
                {isFilled.image(item.author_avatar) && (
                  <PrismicImage
                    field={item.author_avatar}
                    sizes="40px"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  {item.author_name && (
                    <p className="text-sm font-medium text-content-primary">
                      {item.author_name}
                    </p>
                  )}
                  {item.author_title && (
                    <p className="text-xs text-content-muted">
                      {item.author_title}
                    </p>
                  )}
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
