import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";

/**
 * 样机的共用零件。
 *
 * 这些组件画的是**小程序界面的样子**，不是本站自己的 UI。所以不套 Container /
 * Button 这些站点组件 —— 那是「网页」的词汇，样机要说的是「小程序」的词汇。
 * 版式一律照 uiux 原型页 `landing-page.html` 里的样机来。
 *
 * 从原型页搬 markup 时有三处必须换算，照抄会静默走样：
 *
 * 1. **圆角**。原型页用 Tailwind 默认档，本仓库的 `--radius-*` 把同名档改指了
 *    uiux 的令牌，同名不同值。对照表：
 *    `rounded-lg`(8)→`rounded-sm` / `rounded-xl`(12)→`rounded-md` /
 *    `rounded-2xl`(16)→`rounded-card` / `rounded-3xl`(24)→`rounded-lg` /
 *    `rounded-[32px]`→`rounded-xl` / `rounded-full`→`rounded-pill`。
 *
 * 2. **品牌色只能当填充**。原型页页内把 `brand.primary` 改指了 peach，于是
 *    `text-brand-primary` / `text-brand-jade` 满页都是；在本仓库这两个色作文字
 *    分别只有 1.89:1 和 2.64:1，都不合规（CLAUDE.md「样式」一节、迁移方案 §3.2）。
 *    换算：橙色系文字一律 `text-brand-deep`；peach / jade 填充一律配墨字
 *    （`text-content-primary`，7.15:1 与 5.66:1），不配反白；jade 文字没有合规档，
 *    退到 `text-content-secondary`，需要保住「绿＝好了」的语义时改用 jade 填充。
 *
 * 3. **`text-content-muted` 不能当正文**（3.43:1，令牌注释写了「仅限大字/装饰」）。
 *    原型页用它表达「这条已经做完、颜色收一档」，这里退到 `text-content-secondary`
 *    —— 与 `text-content-primary` 的层级差还在，只是没那么淡。
 */

/**
 * 原型页 `.mockup-container`：一圈厚描边当机身，圆角 32px。
 *
 * 原型页那圈边是 `box-shadow: inset 0 0 0 8px`，这里直接用 `border-8`：
 * 视觉一样，少一条得跟 `shadow-*` 抢同一个属性的规则。
 */
export function MockupFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border-8 border-hair p-6 shadow-brand-md ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/** 样机顶栏：左边一句标题，右边一个图标。 */
export function MockupTitleBar({
  title,
  icon,
}: {
  title: string;
  icon: IconName;
}) {
  return (
    <div className="mb-5 flex w-full items-center justify-between">
      <span className="text-body-lg font-bold text-content-primary">
        {title}
      </span>
      <Icon name={icon} className="h-5 w-5 text-content-secondary" />
    </div>
  );
}

/** 「我的安排 / 家人照护」分段控件。 */
export function SegmentedTabs({
  active,
  className = "text-caption",
}: {
  active: "self" | "family";
  className?: string;
}) {
  const selected =
    "rounded-pill bg-surface-container font-bold text-content-primary shadow-brand-sm";
  const idle = "font-bold text-content-secondary";

  /*
    三元的两个分支在 className 外面算好再插进去。
    scripts/check-classes.mts 会把 `${}` 里的引号串当类名收走，
    `active === "self"` 那种比较用的字面量写在 className 里会被误报。
  */
  const selfTab = active === "self" ? selected : idle;
  const familyTab = active === "family" ? selected : idle;

  return (
    <div className="flex rounded-pill bg-fill-quiet p-1">
      <span className={`px-4 py-1.5 ${className} ${selfTab}`}>我的安排</span>
      <span className={`px-4 py-1.5 ${className} ${familyTab}`}>家人照护</span>
    </div>
  );
}

/**
 * 「已确认」。
 *
 * 原型页是 `text-brand-jade`，本仓库没有合规的 jade 文字档，退到次文色 ——
 * 对面那颗 peach 填充的「确认」按钮已经把「这条还没做」说清楚了，
 * 完成态不必再靠颜色喊一遍。
 */
export function DoneLabel({ className = "text-caption" }: { className?: string }) {
  return (
    <span
      className={`flex items-center gap-1 ${className} font-bold text-content-secondary`}
    >
      已确认
      <Icon name="check-line" className="h-4 w-4" />
    </span>
  );
}

/** 「确认」「帮 TA 记」这类主操作按钮：peach 填充配墨字。 */
export function ActionPill({
  children,
  className = "text-caption",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-pill bg-marketing-peach px-4 py-1.5 ${className} font-bold text-content-primary shadow-brand-sm`}
    >
      {children}
    </span>
  );
}
