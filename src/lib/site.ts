/**
 * 站点级常量。
 *
 * 单语站（中文）—— 不引入 `[lang]` 路由层级，但把 locale 收在这里而不是散落
 * 各处硬编码，将来加语言时只改这里 + 路由，不用全局翻。
 * 参见 docs/tech-research.md 12.6。
 */
export const site = {
  /** 品牌全称，用于 <title> 后缀、footer、结构化数据 */
  name: "品牌名称",
  /** 简称，用于导航栏 wordmark */
  shortName: "品牌",
  /** 站点默认描述，页面未提供 meta_description 时兜底 */
  description: "在这里填写品牌一句话定位。",

  /**
   * 站点根 URL，用于生成 OG 图、sitemap、canonical 的绝对地址。
   * 静态导出没有运行时，这个值在「构建期」就被烘进产物，必须由 CI 注入。
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** HTML lang 属性 */
  htmlLang: "zh-CN",

  /** Prismic 侧的 locale ID（主语言），所有查询统一引用此常量 */
  prismicLocale: "zh-cn",
} as const;

export type NavItem = {
  label: string;
  href: string;
};
