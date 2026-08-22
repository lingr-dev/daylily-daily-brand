import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getFooterNav, getPrimaryNav } from "@/lib/navigation";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  /** OG 图与 canonical 需要绝对地址；静态导出下这个值在构建期烘死，由 CI 注入 */
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "zh_CN",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [primaryNav, footerNav] = await Promise.all([
    getPrimaryNav(),
    getFooterNav(),
  ]);

  return (
    <html lang={site.htmlLang}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          跳到主内容
        </a>
        <SiteHeader nav={primaryNav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter nav={footerNav} />
      </body>
    </html>
  );
}
