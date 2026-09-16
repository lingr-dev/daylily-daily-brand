import type { Content } from "@prismicio/client";
import { site } from "@/lib/site";

/**
 * 结构化数据（JSON-LD）。
 *
 * 刻意写在代码里而不是做成 CMS 字段：JSON 塞进 Text 字段太脆，编辑少一个引号
 * 就是语法错误，而构建**不会**报错 —— 搜索引擎那边静默失效，没人会发现。
 * 需要编辑掌握的部分（站点名、一句话定位）已经在 settings 里，从那里取即可。
 */

type SoftwareApplicationInput = {
  settings: Content.SettingsDocument;
  /** 页面自己的描述，通常是 homepage 的 meta_description */
  description?: string | null;
};

export function softwareApplicationJsonLd({
  settings,
  description,
}: SoftwareApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: settings.data.site_name || site.name,
    applicationCategory: "HealthApplication",
    operatingSystem: "WeChat Mini Program",
    description:
      description || settings.data.site_tagline || site.description,
    inLanguage: site.htmlLang,
    url: site.url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CNY",
    },
  };
}

/**
 * 序列化成可以直接放进 <script type="application/ld+json"> 的字符串。
 *
 * `<` 必须转义 —— 内容里只要出现 `</script>` 就会提前闭合脚本标签，
 * 后面的 JSON 变成页面上的明文，更糟的情况是被当成 HTML 解析。
 * 这是 JSON-LD 内联的标准防护，与内容可不可信无关。
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
