import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import { isReleaseBuild } from "@/prismicio";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings.data.site_name || site.name;

  return {
    /** OG 图与 canonical 需要绝对地址；静态导出下这个值构建期烘死，由 CI 注入 */
    metadataBase: new URL(site.url),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: settings.data.site_tagline || site.description,
    openGraph: {
      type: "website",
      siteName: name,
      locale: "zh_CN",
    },
    formatDetection: { telephone: false },
    /** 预发站不应该被搜索引擎收录 */
    robots: isReleaseBuild ? { index: false, follow: false } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html lang={site.htmlLang}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface-base focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          跳到主内容
        </a>

        {/*
          预发构建的显式标记。预发站和生产站长得一模一样，没有标记的话
          迟早有人把预发链接当正式链接发出去。
        */}
        {isReleaseBuild && (
          <div className="bg-content-primary px-4 py-2 text-center text-xs text-sand">
            预发环境 · 内容取自未发布的 Release，请勿对外分享此链接
          </div>
        )}

        {/*
          百度统计。站点 ID 放 settings 而不是 env：换 ID 不需要改代码、
          不需要重设 CI。留空则整段不渲染 —— 预发站与本地开发默认不打点。

          afterInteractive 在静态导出下照常工作：它只是在水合后插一个
          <script>，不依赖任何请求期能力。
        */}
        {settings.data.baidu_analytics_id && (
          <Script
            id="baidu-analytics"
            strategy="afterInteractive"
            src={`https://hm.baidu.com/hm.js?${settings.data.baidu_analytics_id}`}
          />
        )}

        <SiteHeader settings={settings} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
