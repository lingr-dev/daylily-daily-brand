import { Icon } from "@/components/Icon";
import { MockupFrame, MockupTitleBar } from "./parts";

/**
 * 「改动有商量」三列样机。三块都长在同一个 `.mockup-container` 上，
 * 差别只在里面装什么 —— 改哪一版 / 保存前摊开 / 谁看过。
 *
 * 三块都加了 `flex-1`：原型页那排是 `items-stretch`，三张卡要等高。
 */

/** 改一改 —— 始终告诉你在改哪一版。 */
export function RevisionEdit() {
  return (
    <MockupFrame className="flex-1 bg-sand-wash">
      <MockupTitleBar title="改一改" icon="pencil-line" />

      <div className="mb-3 rounded-card bg-surface-container p-4 shadow-brand-sm">
        <p className="mb-1 text-caption font-bold text-content-secondary">
          你在改的是
        </p>
        <p className="text-body-sm font-bold text-content-primary">
          8月8日 妈妈改过的这版
        </p>
      </div>

      <div className="rounded-card bg-surface-container p-4 shadow-brand-sm">
        <p className="mb-2 text-caption font-bold text-content-secondary">
          什么时候吃？
        </p>
        <div className="flex items-center gap-2 text-body-sm font-bold">
          <span className="text-content-secondary line-through">晚上 8:00</span>
          <Icon name="arrow-right-line" className="h-4 w-4 text-brand-deep" />
          <span className="text-content-primary">晚上 9:00</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/** 要这样改吗？ —— 保存前把改动逐条摊开。 */
export function RevisionConfirm() {
  return (
    <MockupFrame className="flex-1 bg-sand-wash">
      <MockupTitleBar title="要这样改吗？" icon="file-list-3-line" />

      <div className="mb-3 rounded-card bg-surface-container p-4 shadow-brand-sm">
        <p className="text-body-sm font-bold text-content-primary">晚上那次</p>
        <p className="mt-1 text-caption text-content-secondary">
          8:00 改成 9:00
        </p>
      </div>

      {/* jade 填充配墨字 5.66:1；原型页那版是白字，落在 jade 上只有 2.4:1 */}
      <div className="mb-3 w-full rounded-card bg-marketing-jade py-3 text-center text-body-base font-bold text-content-primary shadow-brand-md">
        保存改动
      </div>

      <p className="px-1 text-caption leading-relaxed text-content-secondary">
        以后按新的来。以前的样子还留着，随时能翻。
      </p>
    </MockupFrame>
  );
}

/** 家人看过 —— 知情不是审批。 */
export function RevisionSeen() {
  return (
    <MockupFrame className="flex-1 bg-sand-wash">
      <MockupTitleBar title="家人看过" icon="group-line" />

      <div className="mb-3 space-y-3 rounded-card bg-surface-container p-4 shadow-brand-sm">
        <div className="flex items-center justify-between">
          <span className="text-body-sm font-bold text-content-primary">
            妈妈
          </span>
          {/*
            原型页这里是 `text-brand-jade`。jade 作文字不合规，改成 jade 填充配
            墨字的小标签 —— 「绿＝这个人看到了」这层语义留住了，对比度也够。
          */}
          <span className="rounded-pill bg-marketing-jade/30 px-2.5 py-0.5 text-caption font-bold text-content-primary">
            看过了
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-sm font-bold text-content-primary">
            爸爸
          </span>
          <span className="text-caption text-content-secondary">还没看过</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-sm font-bold text-content-primary">你</span>
          <span className="text-caption text-content-secondary">
            这次是你改的
          </span>
        </div>
      </div>

      <p className="px-1 text-caption leading-relaxed text-content-secondary">
        「看过」只表示这个人看到了这次改动，不代表 TA 同意、批准，也不代表已经做了。
      </p>
    </MockupFrame>
  );
}
