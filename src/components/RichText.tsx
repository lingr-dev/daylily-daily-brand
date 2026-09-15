import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type JSXMapSerializer,
  type PrismicRichTextProps,
} from "@prismicio/react";
import { PrismicImage } from "@/components/PrismicImage";

/**
 * 富文本的统一排版规则。
 *
 * 集中在这里而不是让每个 slice 各写一套 `[&_p]:mt-4` 之类的 selector hack ——
 * 排版是设计系统的一部分，应该只有一处定义。
 */
const serializer: JSXMapSerializer = {
  heading2: ({ children }) => (
    <h2 className="mt-12 text-2xl font-semibold text-content-primary first:mt-0 md:text-3xl">
      {children}
    </h2>
  ),
  heading3: ({ children }) => (
    <h3 className="mt-10 text-xl font-semibold text-content-primary first:mt-0">
      {children}
    </h3>
  ),
  heading4: ({ children }) => (
    <h4 className="mt-8 text-lg font-semibold text-content-primary first:mt-0">
      {children}
    </h4>
  ),
  paragraph: ({ children }) => (
    <p className="mt-5 text-base leading-relaxed text-content-secondary first:mt-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-content-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hyperlink: ({ node, children }) => (
    <PrismicNextLink
      field={node.data}
      className="text-brand-deep underline decoration-marketing-peach underline-offset-2 transition-colors hover:decoration-brand-deep"
    >
      {children}
    </PrismicNextLink>
  ),
  list: ({ children }) => (
    <ul className="mt-5 grid gap-2 pl-5 first:mt-0">{children}</ul>
  ),
  oList: ({ children }) => (
    <ol className="mt-5 grid list-decimal gap-2 pl-5 first:mt-0">{children}</ol>
  ),
  listItem: ({ children }) => (
    <li className="list-disc text-base leading-relaxed text-content-secondary">
      {children}
    </li>
  ),
  oListItem: ({ children }) => (
    <li className="text-base leading-relaxed text-content-secondary">{children}</li>
  ),
  preformatted: ({ children }) => (
    <pre className="mt-6 overflow-x-auto rounded-card bg-sand-wash p-4 text-sm first:mt-0">
      <code>{children}</code>
    </pre>
  ),
  image: ({ node }) => (
    <figure className="mt-8 first:mt-0">
      <div className="overflow-hidden rounded-card bg-sand-wash">
        <PrismicImage
          field={node}
          sizes="(min-width: 768px) 42rem, 90vw"
          className="h-auto w-full"
        />
      </div>
      {node.alt && (
        <figcaption className="mt-3 text-sm text-content-muted">
          {node.alt}
        </figcaption>
      )}
    </figure>
  ),
  embed: ({ node }) => (
    <div
      className="mt-8 overflow-hidden rounded-card first:mt-0 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full"
      dangerouslySetInnerHTML={{ __html: node.oembed.html ?? "" }}
    />
  ),
};

export function RichText({
  field,
  components,
}: {
  field: PrismicRichTextProps["field"];
  /** 需要覆盖个别节点样式时传入，会与统一规则合并 */
  components?: JSXMapSerializer;
}) {
  return (
    <PrismicRichText
      field={field}
      components={components ? { ...serializer, ...components } : serializer}
    />
  );
}

export { serializer as richTextSerializer };
