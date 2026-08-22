import Link from "next/link";
import { Container } from "@/components/Container";
import { site, type NavItem } from "@/lib/site";

/**
 * 移动端菜单用原生 <details> 实现，不引入客户端 JS。
 *
 * 取舍：静态导出 + 国内首屏，把 JS 压到 0 的收益大于一个动画菜单。
 * <details>/<summary> 本身就是「披露控件」语义，键盘和读屏可用。
 * 如果后续设计要求带动效的抽屉菜单，改成 client component 即可，
 * 代价是引入 React 运行时到首屏。
 */
export function SiteHeader({ nav }: { nav: NavItem[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-ink transition-colors hover:text-brand-600"
          >
            {site.shortName}
          </Link>

          <nav aria-label="主导航" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <details className="group relative md:hidden">
            <summary
              className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden"
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
              className="absolute right-0 top-full mt-2 min-w-44 rounded-card border border-line bg-canvas p-2 shadow-lg"
            >
              <ul className="grid">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
