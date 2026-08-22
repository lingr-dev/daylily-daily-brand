import Link from "next/link";
import { Container } from "@/components/Container";
import { site, type NavItem } from "@/lib/site";

/**
 * 年份在「构建期」求值并烘进产物。内容发布会触发重新构建，所以正常不会过期；
 * 但如果整年没有任何内容更新，年份会停在上次构建时。可接受。
 */
const buildYear = new Date().getFullYear();

/**
 * ICP 备案号：国内 CDN 服务的域名必须在页面展示备案号并链到工信部查询页。
 * 由 CI 注入，本地开发时不显示。参见 docs/tech-research.md 12.5。
 */
const icpLicense = process.env.NEXT_PUBLIC_ICP_LICENSE;

export function SiteFooter({ nav }: { nav: NavItem[] }) {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <Container className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold text-ink">{site.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {site.description}
            </p>
          </div>

          {nav.length > 0 && (
            <nav aria-label="页脚导航">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
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
          )}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {buildYear} {site.name}
          </p>
          {icpLicense && (
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink-muted"
            >
              {icpLicense}
            </a>
          )}
        </div>
      </Container>
    </footer>
  );
}
