import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { PrismicImage } from "@/components/PrismicImage";

export type LogoWallProps = SliceComponentProps<Content.LogoWallSlice>;

export default function LogoWall({ slice }: LogoWallProps) {
  const { heading, logos } = slice.primary;
  const filled = logos.filter((item) => isFilled.image(item.logo));

  if (filled.length === 0) return null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        {heading && (
          <p className="text-center text-sm text-content-muted">{heading}</p>
        )}

        <ul
          className={`flex flex-wrap items-center justify-center gap-x-12 gap-y-8 ${
            heading ? "mt-10" : ""
          }`}
        >
          {filled.map((item, index) => {
            const logo = (
              <PrismicImage
                field={item.logo}
                sizes="160px"
                /* 统一灰度、悬停恢复彩色 —— 让风格各异的客户 logo 在一起不打架 */
                className="h-8 w-auto opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:h-10"
              />
            );

            return (
              <li key={index}>
                {isFilled.link(item.link) ? (
                  <PrismicNextLink
                    field={item.link}
                    aria-label={item.name ?? undefined}
                  >
                    {logo}
                  </PrismicNextLink>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
