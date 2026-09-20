import { MockupFrame, MockupTitleBar } from "./parts";

/**
 * 「每条记录，带着它发生时的那份安排」右侧的记录台账样机。
 *
 * 原型页用 `text-content-muted` 把「当时按的是…」再压暗一档；那个色 3.43:1，
 * 令牌注释写明只给大字和装饰用，所以这里两行都停在 `text-content-secondary`，
 * 层级靠位置和行距表达。
 */
export function RecordLedger() {
  return (
    <MockupFrame className="bg-surface-container">
      <MockupTitleBar title="记录" icon="booklet-line" />

      <div className="space-y-3">
        <div className="rounded-card border border-sand/60 bg-surface-base p-4">
          <div className="flex items-center justify-between">
            <p className="text-body-sm font-bold text-content-primary">
              降压药（红盒子那瓶） 一片
            </p>
            <span className="ml-3 shrink-0 rounded-pill bg-marketing-jade/30 px-2.5 py-0.5 text-caption font-bold text-content-primary">
              已确认
            </span>
          </div>
          <p className="mt-1.5 text-caption text-content-secondary">
            8月9日 早上 8:12
          </p>
          <p className="mt-1 text-caption text-content-secondary">
            当时按的是 8月8日改完的样子
          </p>
        </div>

        <div className="rounded-card border border-sand/60 bg-surface-base p-4">
          <div className="flex items-center justify-between">
            <p className="text-body-sm font-bold text-content-primary">
              晚饭后散步 20 分钟
            </p>
            <span className="ml-3 shrink-0 rounded-pill bg-marketing-jade/30 px-2.5 py-0.5 text-caption font-bold text-content-primary">
              已确认
            </span>
          </div>
          <p className="mt-1.5 text-caption text-content-secondary">
            8月8日 晚上 7:40 · 女儿帮着记的
          </p>
          <p className="mt-1 text-caption text-content-secondary">
            当时按的是建好时的样子
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}
