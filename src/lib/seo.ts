import type { Metadata } from "next";
import { isFilled, type ImageField, type KeyTextField } from "@prismicio/client";
import { imageKey, ogImagePath } from "@/lib/prismic-image";
import { site } from "@/lib/site";

/** 所有 page 类型的 SEO & Metadata 标签页都是这三个字段。 */
type SeoFields = {
  meta_title: KeyTextField;
  meta_description: KeyTextField;
  meta_image: ImageField<never>;
};

type BuildMetadataInput = {
  data: SeoFields;
  /** meta_title 为空时的兜底标题 */
  fallbackTitle?: string | null;
  /** 该页的 canonical 路径，如 "/about/" */
  path: string;
};

/**
 * 由 Prismic 的 SEO 字段拼出 Next 的 Metadata。
 *
 * OG 图刻意指向本站的 jpeg 副本而非 Prismic 源：抓取器在国内访问海外域名
 * 常常超时，那结果就是分享出去没有卡片图。详见 src/lib/prismic-image.ts。
 */
export function buildMetadata({
  data,
  fallbackTitle,
  path,
}: BuildMetadataInput): Metadata {
  const title = data.meta_title || fallbackTitle || undefined;
  const description = data.meta_description || site.description;

  const images = isFilled.image(data.meta_image)
    ? [
        {
          url: ogImagePath(imageKey(data.meta_image.url)),
          width: data.meta_image.dimensions.width,
          height: data.meta_image.dimensions.height,
          alt: data.meta_image.alt ?? title ?? site.name,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: title ?? site.name,
      description,
      url: path,
      images,
    },
  };
}
