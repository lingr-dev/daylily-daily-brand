import { formatDate } from "@/lib/format";
import type { ReleaseCadenceData } from "@/lib/releases";

/**
 * 发布节奏概览。
 *
 * 「持续维护」这件事，逐条看时间轴也能感觉到，但它需要读者自己把日期连起来。
 * 这张卡把结论直接摆出来：最新到哪一版、最近什么时候、一共发过多少次、
 * 平均多久一次。四个数字全部由 release_note 文档推导（见 src/lib/releases.ts），
 * 编辑不需要另行维护，也不会和时间轴对不上。
 *
 * 外观沿用 Stats slice 的卡片与数字样式，让这一页读起来是同一套系统里的东西。
 */
export function ReleaseCadence({ cadence }: { cadence: ReleaseCadenceData }) {
  const tiles = [
    cadence.latestVersion && { label: "最新版本", value: cadence.latestVersion },
    { label: "最近更新", value: formatDate(cadence.latestReleasedAt) },
    { label: "累计发布", value: `${cadence.total} 个版本` },
    cadence.averageIntervalDays && {
      label: "平均更新间隔",
      value: `约 ${cadence.averageIntervalDays} 天`,
    },
  ].filter((tile): tile is { label: string; value: string } =>
    Boolean(tile && tile.value),
  );

  return (
    <dl
      className={`grid gap-x-8 gap-y-8 rounded-card border border-hair bg-surface-container px-6 py-10 md:px-10 ${
        tiles.length === 4
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : tiles.length === 3
            ? "sm:grid-cols-3"
            : "sm:grid-cols-2"
      }`}
    >
      {tiles.map((tile) => (
        /*
          flex-col-reverse：DOM 里 <dt> 在 <dd> 之前（HTML 要求名在值之前），
          视觉上仍是大数字在上、标签在下。
        */
        <div key={tile.label} className="flex flex-col-reverse gap-2">
          <dt className="text-body-sm text-content-secondary">{tile.label}</dt>
          <dd className="text-title-2 font-semibold tracking-tight text-brand-deep">
            {tile.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
