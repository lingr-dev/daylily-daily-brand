import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { asLink, isFilled, type Content } from "@prismicio/client";
import { Container } from "@/components/Container";
import { filledLinks } from "@/lib/settings";
import { site } from "@/lib/site";

/**
 * 年份在构建期求值并烘进产物。内容发布会触发重新构建，正常不会过期；
 * 但整年没有任何内容更新时，年份会停在上次构建。可接受。
 */
const buildYear = new Date().getFullYear();

const socialLabels: Record<string, string> = {
  wechat: "微信",
  weibo: "微博",
  linkedin: "LinkedIn",
  github: "GitHub",
  youtube: "YouTube",
  x: "X",
};

export function SiteFooter({
  settings,
}: {
  settings: Content.SettingsDocument;
}) {
  const nav = filledLinks(settings.data.footer_nav);
  const siteName = settings.data.site_name || site.name;
  const tagline = settings.data.site_tagline;
  const social = settings.data.social_links.filter((item) =>
    isFilled.link(item.link),
  );

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <Container className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold text-ink">{siteName}</p>
            {tagline && (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {tagline}
              </p>
            )}
            {isFilled.richText(settings.data.footer_note) && (
              <div className="mt-4 text-sm leading-relaxed text-ink-muted [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-2">
                <PrismicRichText field={settings.data.footer_note} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
            {nav.length > 0 && (
              <nav aria-label="页脚导航">
                <ul className="grid gap-2">
                  {nav.map((item, index) => (
                    <li key={asLink(item) ?? index}>
                      <PrismicNextLink
                        field={item}
                        className="text-sm text-ink-muted transition-colors hover:text-ink"
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <ContactBlock settings={settings} />
          </div>
        </div>

        {social.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {social.map((item, index) => (
              <li key={index}>
                <PrismicNextLink
                  field={item.link}
                  className="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {item.platform ? socialLabels[item.platform] : null}
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {buildYear} {siteName}
          </p>
          {/*
            ICP 备案号：国内 CDN 服务的域名必须在页面展示并链到工信部查询页。
            放在 Prismic 里而不是环境变量里，备案号变更时不需要动代码。
          */}
          {settings.data.icp_license && (
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink-muted"
            >
              {settings.data.icp_license}
            </a>
          )}
        </div>
      </Container>
    </footer>
  );
}

function ContactBlock({ settings }: { settings: Content.SettingsDocument }) {
  const { contact_email, contact_phone, contact_address } = settings.data;

  if (!contact_email && !contact_phone && !contact_address) return null;

  return (
    <div className="grid gap-2 text-sm text-ink-muted">
      {contact_email && (
        <a
          href={`mailto:${contact_email}`}
          className="transition-colors hover:text-ink"
        >
          {contact_email}
        </a>
      )}
      {contact_phone && (
        <a
          href={`tel:${contact_phone}`}
          className="transition-colors hover:text-ink"
        >
          {contact_phone}
        </a>
      )}
      {contact_address && <p>{contact_address}</p>}
    </div>
  );
}
