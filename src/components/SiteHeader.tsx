import Link from "next/link";
import { PrismicNextLink } from "@prismicio/next";
import { asLink, type Content } from "@prismicio/client";
import { buttonClass } from "@/components/Button";
import { Container } from "@/components/Container";
import { filledLinks } from "@/lib/settings";
import { site } from "@/lib/site";

/**
 * 移动端菜单用原生 <details> 实现，不引入客户端 JS。
 *
 * 取舍：这样不需要新增 client component。注意它省下的是增量 JS —— App Router
 * 的 React 运行时基线本来就在（约 200KB gzip），并不会因此变成零 JS 页面。
 * <details>/<summary> 本身就是「披露控件」语义，键盘和读屏都可用。
 * 若后续设计要求带动效的抽屉菜单，改成 client component 即可。
 */
export function SiteHeader({
  settings,
}: {
  settings: Content.SettingsDocument;
}) {
  const nav = filledLinks(settings.data.primary_nav);
  const siteName = settings.data.site_name || site.name;
  const ctaLabel = settings.data.miniprogram_cta_label;

  return (
    <header className="sticky top-0 z-50 border-b border-hair bg-surface-base/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-content-primary transition-colors hover:text-brand-deep"
            aria-label={siteName}
          >
            {/*
              Logo 与小程序码一样用 public/ 里的本地副本，不走 Prismic 媒体库
              （迁移方案 §6：样机截图、logo、二维码都进外部存储/本地，不进媒体库）。
              源文件 https://www.lingerer.cn/assets/logo.jpg，
              settings 里的 logo 图片字段因此不再使用。
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.jpg" alt={siteName} className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            {nav.length > 0 && (
              <nav aria-label="主导航" className="hidden md:block">
                <ul className="flex items-center gap-8">
                  {nav.map((item, index) => (
                    <li key={asLink(item) ?? index}>
                      <PrismicNextLink
                        field={item}
                        className="text-body-sm text-content-secondary transition-colors hover:text-content-primary"
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/*
              「打开小程序」。二维码不做弹窗（迁移方案 §0 决策 2），
              这个按钮滚到首页底部的 CTA 区块，落点由 site.ctaAnchor 定。
            */}
            {ctaLabel && (
              <Link href={site.ctaAnchor} className={buttonClass("primary")}>
                {ctaLabel}
              </Link>
            )}

            {nav.length > 0 && (
              <details className="relative md:hidden">
                <summary
                  className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-content-secondary transition-colors hover:text-content-primary [&::-webkit-details-marker]:hidden"
                  aria-label="打开菜单"
                >
                  <span className="grid gap-1" aria-hidden="true">
                    <span className="block h-px w-5 bg-current" />
                    <span className="block h-px w-5 bg-current" />
                    <span className="block h-px w-5 bg-current" />
                  </span>
                  菜单
                </summary>
                <nav
                  aria-label="主导航"
                  className="absolute right-0 top-full mt-2 min-w-44 rounded-card border border-hair bg-surface-base p-2 shadow-lg"
                >
                  <ul className="grid">
                    {nav.map((item, index) => (
                      <li key={asLink(item) ?? index}>
                        <PrismicNextLink
                          field={item}
                          className="block rounded-md px-3 py-2 text-sm text-content-secondary transition-colors hover:bg-surface-container hover:text-content-primary"
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              </details>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
