import type { Metadata } from "next";
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
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          跳到主内容
        </a>

        {/*
          预发构建的显式标记。预发站和生产站长得一模一样，没有标记的话
          迟早有人把预发链接当正式链接发出去。
        */}
        {isReleaseBuild && (
          <div className="bg-brand-900 px-4 py-2 text-center text-xs text-brand-100">
            预发环境 · 内容取自未发布的 Release，请勿对外分享此链接
          </div>
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
