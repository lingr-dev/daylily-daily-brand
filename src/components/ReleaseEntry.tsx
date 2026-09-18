import { isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import type { JSXMapSerializer } from "@prismicio/react";
import { RichText } from "@/components/RichText";
import { formatDate } from "@/lib/format";
import type { TimelineEntry } from "@/lib/releases";

/**
 * 变更类型的说法与配色。完整 class 字符串查表 —— 拼出来的动态类名不会被
 * Tailwind 收集（见 CLAUDE.md「样式」）。写法与 Button.tsx 的 variants 一致。
 *
 * 三档只靠**填充**区分，不靠文字色：peach 与 jade 在宣纸白上只有 1.89:1 和
 * 2.64:1，都不能作文字色。用到的组合都是纸面上合规的：
 *   新增  peach 填充配墨字 7.15:1，与主 CTA 同一组合，最抓眼 —— 新功能该领头
 *   优化  sand-wash 底配 brand-deep 6.83:1，橙色系文字唯一合规值
 *   修复  fill-quiet 是令牌表里写明的「次级标签底」，配墨色正文 8.96:1
 */
const changeKinds = {
  feature: { label: "新增", className: "bg-marketing-peach text-content-primary" },
  improvement: { label: "优化", className: "bg-sand-wash text-brand-deep" },
  fix: { label: "修复", className: "bg-fill-quiet text-content-body" },
} as const;

const badgeBase =
  "inline-flex shrink-0 items-center rounded-pill px-2.5 py-0.5 text-caption font-medium";

/**
 * 补充说明的段落压到 body-sm —— 时间轴要的是密度。
 *
 * 走 RichText 的 components 参数而不是在外面套 `[&_p]:text-sm`：
 * 排版规则只有 RichText.tsx 一处定义，局部覆盖靠合并 serializer（见 CLAUDE.md）。
 */
const summarySerializer: JSXMapSerializer = {
  paragraph: ({ children }) => (
    <p className="mt-3 text-body-sm leading-relaxed text-content-secondary first:mt-0">
      {children}
    </p>
  ),
};

/** 时间轴上的一条发布。 */
export function ReleaseEntry({ entry }: { entry: TimelineEntry }) {
  const { note, releasedAt } = entry;
  const { version, title, summary, link, is_major: isMajor, changes } = note.data;
  const date = formatDate(releasedAt);
  const changeList = changes.filter((change) => change.description);

  return (
    /*
      锚点用 uid 而不是版本号推导：uid 由 Prismic 保证类型内唯一，
      两条 release 版本号写重了也不会产生重复的 DOM id。
      scroll-mt-24 是给吸顶导航栏（h-16）让出的位置。
    */
    <li id={note.uid} className="relative scroll-mt-24 pl-8">
      {/*
        时间轴的点。ring 用页面底色，在竖线上打出一个缺口。

        里程碑版本换成品牌桃色，但颜色不能是唯一信号 —— 所以标题旁另给一枚
        「里程碑」标签，色觉障碍用户和读屏拿到的是同一条信息。
      */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-pill ring-4 ring-surface-base ${
          isMajor ? "bg-marketing-peach" : "bg-sand"
        }`}
      />

      <div className="md:grid md:grid-cols-4 md:gap-8">
        {/* 版本号与日期紧挨着时间轴上的点，读起来才是「这个点标的是哪一次发布」 */}
        <div>
          {version && (
            <p className="text-body-lg font-semibold tracking-tight text-content-primary">
              {/* 版本号就是自己那条锚点的链接，深链到某一版才是可发现的 */}
              <a
                href={`#${note.uid}`}
                className="transition-colors hover:text-brand-deep"
              >
                {version}
              </a>
            </p>
          )}
          {date && (
            <p className="mt-1 text-body-sm text-content-secondary">
              <time dateTime={releasedAt}>{date}</time>
            </p>
          )}
        </div>

        <div className="mt-4 md:col-span-3 md:mt-0">
          {(title || isMajor) && (
            <div className="flex flex-wrap items-center gap-3">
              {title && (
                <h3 className="text-title-3 font-semibold text-content-primary">
                  {title}
                </h3>
              )}
              {isMajor && (
                <span className="inline-flex items-center rounded-pill border border-sand px-2.5 py-0.5 text-caption font-medium text-brand-deep">
                  里程碑
                </span>
              )}
            </div>
          )}

          {isFilled.richText(summary) && (
            <RichText field={summary} components={summarySerializer} />
          )}

          {changeList.length > 0 && (
            <ul className="mt-5 grid gap-3">
              {changeList.map((change, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 ${badgeBase} ${changeKinds[change.kind].className}`}
                  >
                    {changeKinds[change.kind].label}
                  </span>
                  <span className="text-body-sm leading-relaxed text-content-body">
                    {change.description}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isFilled.link(link) && (
            <PrismicNextLink
              field={link}
              className="mt-5 inline-flex text-body-sm text-brand-deep underline decoration-marketing-peach underline-offset-2 transition-colors hover:decoration-brand-deep"
            />
          )}
        </div>
      </div>
    </li>
  );
}
