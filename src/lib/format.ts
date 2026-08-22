import { site } from "@/lib/site";

const dateFormatter = new Intl.DateTimeFormat(site.htmlLang, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/**
 * Prismic 日期字段（YYYY-MM-DD）格式化为中文日期。
 *
 * 用 UTC 正午构造 Date，避开时区把日期推前/推后一天的经典问题 ——
 * 构建机的 TZ 和编辑填写日期时的意图不一定一致。
 */
export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return dateFormatter.format(date);
}
