import { PrismicNextLink } from "@prismicio/next";
import type { LinkField } from "@prismicio/client";

const variants = {
  primary:
    "bg-marketing-peach text-content-primary hover:bg-marketing-peach/85 focus-visible:outline-brand-deep",
  secondary:
    "border border-sand text-content-primary hover:border-content-primary hover:bg-surface-container",
  ghost: "text-brand-deep hover:text-content-primary",
} as const;

export type ButtonVariant = keyof typeof variants;

const base =
  "inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-body-sm font-medium transition-colors";

/**
 * 按钮的完整 class 串。
 *
 * 导出出来是给「不是 Prismic link 字段」的场景用的 —— 比如导航栏那个指向站内
 * 锚点的按钮，它的 href 是代码常量而不是编辑填的链接。除此之外一律用 <Button>。
 */
export function buttonClass(variant: ButtonVariant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`.trim();
}

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
  return (
    <PrismicNextLink field={field} className={buttonClass(variant, className)} />
  );
}
