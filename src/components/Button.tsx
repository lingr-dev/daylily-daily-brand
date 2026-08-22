import { PrismicNextLink } from "@prismicio/next";
import type { LinkField } from "@prismicio/client";

const variants = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-700",
  secondary:
    "border border-line-strong text-ink hover:border-ink hover:bg-surface",
  ghost: "text-brand-600 hover:text-brand-700",
} as const;

export type ButtonVariant = keyof typeof variants;

/**
 * 链接按钮。文案取自 Prismic link 字段的自定义文本（建模时开了 allowText），
 * 所以按钮上写什么完全由编辑决定，不需要开发加字段。
 */
export function Button({
  field,
  variant = "primary",
  className = "",
}: {
  field: LinkField;
  variant?: ButtonVariant;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors";

  return (
    <PrismicNextLink
      field={field}
      className={`${base} ${variants[variant]} ${className}`.trim()}
    />
  );
}
