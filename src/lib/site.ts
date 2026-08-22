/**
 * 构建期常量。
 *
 * 可编辑的内容（站点名、导航、页脚、备案号…）都在 Prismic 的 `settings` 单例里，
 * 不放这里 —— 见 src/lib/settings.ts。这个文件只放「代码/构建」层面的常量。
 *
 * 单语站（中文）不引入 `[lang]` 路由层级，但 locale 收在这里而不是散落各处，
 * 将来加语言时只改这里 + 路由。参见 docs/tech-research.md 12.6。
 */
export const site = {
  /** settings 尚未填写时的兜底站点名 */
  name: "品牌名称",

  /** settings 尚未填写时的兜底描述 */
  description: "在这里填写品牌一句话定位。",

  /**
   * 站点根 URL，用于 OG 图、canonical、sitemap 的绝对地址。
   * 静态导出没有运行时，这个值在构建期烘进产物，必须由 CI 按环境注入。
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** HTML lang 属性 */
  htmlLang: "zh-CN",

  /** Prismic 侧的主 locale ID，所有查询统一引用此常量 */
  prismicLocale: "zh-cn",
} as const;
