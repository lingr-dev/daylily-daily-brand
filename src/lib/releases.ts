import type { Content } from "@prismicio/client";

/**
 * 更新日志的派生逻辑。
 *
 * 纯函数、不依赖 React —— 分组与节奏指标全在构建期算好，产物里就是最终结果。
 */

/** 时间轴上的一条发布。`releasedAt` 已确认非空，由 toTimeline() 保证。 */
export type TimelineEntry = {
  note: Content.ReleaseNoteDocument;
  /** 发布日期（YYYY-MM-DD） */
  releasedAt: string;
};

export type YearGroup = {
  /** 四位年份，同时用作 React key */
  year: string;
  entries: TimelineEntry[];
};

export type ReleaseCadenceData = {
  latestVersion: string | null;
  /** YYYY-MM-DD */
  latestReleasedAt: string;
  total: number;
  /** 平均发布间隔（天）。只有一条发布时为 null —— 一个点算不出间隔。 */
  averageIntervalDays: number | null;
};

/**
 * 与 src/lib/format.ts 一致，用 UTC 正午解析日期。
 *
 * 直接 `new Date("2026-09-12")` 会按 UTC 零点算，构建机在东八区时
 * 本地日期就退到 9 月 11 日 —— 日期差和年份分组都会跟着错一天。
 */
function parseDay(value: string): number {
  return Date.parse(`${value}T12:00:00Z`);
}

const DAY_MS = 86_400_000;

/**
 * 整理出能上时间轴的发布，按日期倒序。
 *
 * 排序刻意放在这里而不是查询的 `orderings` 里（news 列表页是后者）：
 * 这里本来就要按日期过滤，顺序和过滤同出一处才不会将来各改一半。
 * `getAllByType` 会取回全部文档，本地排序与 Prismic 侧排序结果等价。
 *
 * 没填发布日期的条目放不进时间轴，也算不进节奏，直接过滤掉 ——
 * 与 Faq 过滤掉没写问题的条目是同一个口径（见 src/slices/Faq/index.tsx）。
 */
export function toTimeline(
  notes: readonly Content.ReleaseNoteDocument[],
): TimelineEntry[] {
  return notes
    .flatMap((note) => {
      const releasedAt = note.data.released_at;
      if (!releasedAt || Number.isNaN(parseDay(releasedAt))) return [];
      return [{ note, releasedAt }];
    })
    .sort((a, b) => parseDay(b.releasedAt) - parseDay(a.releasedAt));
}

/** 按年分组。入参已按日期倒序，所以年份和组内顺序都自然是倒序。 */
export function groupByYear(entries: readonly TimelineEntry[]): YearGroup[] {
  const groups: YearGroup[] = [];

  for (const entry of entries) {
    const year = entry.releasedAt.slice(0, 4);
    const current = groups.at(-1);

    if (current?.year === year) current.entries.push(entry);
    else groups.push({ year, entries: [entry] });
  }

  return groups;
}

/**
 * 发布节奏。
 *
 * 全部由内容自身推导，刻意**不含**「距今 N 天」「近 12 个月 M 次」这类
 * 以构建时刻为基准的量 —— 那些值会随构建日期漂移：站点长期没有新内容时
 * 不会重新构建，页面上就会留着一个越来越不对的数字，而且不会报错。
 * 同一类顾虑见 src/components/SiteFooter.tsx 的 buildYear 注释。
 *
 * 平均间隔按首末两次发布的跨度除以间隔数，也只依赖内容本身。
 */
export function releaseCadence(
  entries: readonly TimelineEntry[],
): ReleaseCadenceData | null {
  const latest = entries[0];
  const earliest = entries.at(-1);
  if (!latest || !earliest) return null;

  const spanDays =
    (parseDay(latest.releasedAt) - parseDay(earliest.releasedAt)) / DAY_MS;

  return {
    latestVersion: latest.note.data.version,
    latestReleasedAt: latest.releasedAt,
    total: entries.length,
    averageIntervalDays:
      entries.length > 1
        ? Math.max(1, Math.round(spanDays / (entries.length - 1)))
        : null,
  };
}
