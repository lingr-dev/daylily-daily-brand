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

/** 工信部备案查询页。ICP 与小程序备案都查这里。 */
const MIIT_URL = "https://beian.miit.gov.cn/";

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
    <footer className="mt-auto border-t border-hair bg-surface-container">
      <Container className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold text-content-primary">{siteName}</p>
            {tagline && (
              <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                {tagline}
              </p>
            )}
            {isFilled.richText(settings.data.footer_note) && (
              <div className="mt-4 text-sm leading-relaxed text-content-secondary [&_a]:underline [&_a]:decoration-sand [&_a]:underline-offset-2">
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
                        className="text-sm text-content-secondary transition-colors hover:text-content-primary"
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
                  className="text-sm text-content-secondary transition-colors hover:text-content-primary"
                >
                  {item.platform ? socialLabels[item.platform] : null}
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-col gap-2 border-t border-hair pt-6 text-xs text-content-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {buildYear} {siteName}
          </p>
          <Filings settings={settings} />
        </div>
      </Container>
    </footer>
  );
}

/**
 * 备案信息。
 *
 * 国内主体三件套：ICP 备案（网站）、小程序备案、公安联网备案。
 * 前两个链工信部查询页，公安备案链各地公安网备系统 —— 查询链接每个备案号不同，
 * 所以存成 Link 字段由编辑填，代码里不拼。
 *
 * 全部放在 Prismic 而不是环境变量里：备案号变更时不需要动代码、不需要重设 CI。
 */
function Filings({ settings }: { settings: Content.SettingsDocument }) {
  const { icp_license, miniprogram_icp_license, police_license, police_license_link } =
    settings.data;

  if (!icp_license && !miniprogram_icp_license && !police_license) return null;

  const linkClass = "transition-colors hover:text-content-secondary";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {icp_license && (
        <a
          href={MIIT_URL}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClass}
        >
          {icp_license}
        </a>
      )}
      {miniprogram_icp_license && (
        <a
          href={MIIT_URL}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClass}
        >
          小程序备案：{miniprogram_icp_license}
        </a>
      )}
      {police_license &&
        (isFilled.link(police_license_link) ? (
          <PrismicNextLink field={police_license_link} className={linkClass}>
            {police_license}
          </PrismicNextLink>
        ) : (
          <span>{police_license}</span>
        ))}
    </div>
  );
}

function ContactBlock({ settings }: { settings: Content.SettingsDocument }) {
  const { contact_email, contact_phone, contact_address } = settings.data;

  if (!contact_email && !contact_phone && !contact_address) return null;

  return (
    <div className="grid gap-2 text-sm text-content-secondary">
      {contact_email && (
        <a
          href={`mailto:${contact_email}`}
          className="transition-colors hover:text-content-primary"
        >
          {contact_email}
        </a>
      )}
      {contact_phone && (
        <a
          href={`tel:${contact_phone}`}
          className="transition-colors hover:text-content-primary"
        >
          {contact_phone}
        </a>
      )}
      {contact_address && <p>{contact_address}</p>}
    </div>
  );
}
