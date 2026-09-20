import { Icon } from "@/components/Icon";
import { ActionPill, DoneLabel, SegmentedTabs } from "./parts";

/**
 * 首页 hero 右侧的手机样机 —— 复刻原型 17「今天」的主态：
 * 无进度环、无倒计时、无催促色，做完就让你走。
 *
 * 机身宽高写死（300×600，lg 340×680），跟原型页一样：这是一张「设备的图」，
 * 不是要跟着容器伸缩的版面。外层负责摆位置。
 */
export function PhoneToday() {
  /*
    机身刻意不写 shrink-0：窄到放不下 300px 时让它自己挤扁，
    总比整页多出一条横向滚动条强。
  */
  return (
    <div className="relative flex h-[600px] w-[300px] flex-col overflow-hidden rounded-[40px] border-[12px] border-sand bg-surface-base shadow-brand-md lg:h-[680px] lg:w-[340px]">
      {/* 灵动岛。原型页是 ::before，这里直接给一个元素，省一条自定义 CSS */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-2.5 z-20 h-[25px] w-[90px] -translate-x-1/2 rounded-pill bg-content-primary"
      />

      {/* 顶部：模式切换在左，显示方式在右 */}
      <div className="relative z-10 shrink-0 border-b border-hairline bg-surface-base/80 px-5 pb-3 pt-14 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <SegmentedTabs active="self" />
          <Icon
            name="equalizer-line"
            className="h-[18px] w-[18px] text-content-secondary"
          />
        </div>
      </div>

      {/* 今天要做的事 */}
      <div className="relative z-10 flex-1 px-5 pb-6 pt-5">
        <p className="mb-3 text-caption font-bold tracking-wide text-content-secondary">
          8月12日 星期三
        </p>

        {/* 已确认 */}
        <div className="mb-3 rounded-card border border-sand/60 bg-surface-container p-4 shadow-brand-sm">
          <p className="text-body-sm font-bold leading-snug text-content-secondary">
            降压药（红盒子那瓶） 一片
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-caption text-content-secondary">早上 8:00</span>
            <DoneLabel />
          </div>
        </div>

        {/* 待确认 */}
        <div className="mb-3 rounded-card border border-sand/60 bg-surface-container p-4 shadow-brand-sm">
          <p className="text-body-sm font-bold leading-snug text-content-primary">
            维生素D 一粒
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-caption text-content-secondary">早上 8:00</span>
            <ActionPill>确认</ActionPill>
          </div>
        </div>

        {/* 待确认 · 带就地解释 */}
        <div className="mb-4 rounded-card border border-sand/60 bg-surface-container p-4 shadow-brand-sm">
          <p className="text-body-sm font-bold leading-snug text-content-primary">
            晚饭后散步 20 分钟
          </p>
          <p className="mt-1.5 text-caption text-brand-deep">
            女儿昨天把这次挪到了晚饭后
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-caption text-content-secondary">晚饭后</span>
            <ActionPill>确认</ActionPill>
          </div>
        </div>

        {/* 收尾：不显示进度、条数或连续天数 */}
        <div className="py-3 text-center">
          <p className="text-body-sm font-bold text-content-secondary">
            今天没有别的了
          </p>
          <p className="mt-1 text-caption text-content-secondary">
            剩下的时间，好好过日子。
          </p>
        </div>

        {/* 唯一的次级入口 */}
        <div className="flex items-center justify-between rounded-md border border-sand/60 bg-surface-container/70 px-4 py-3">
          <span className="flex items-center gap-2 text-caption font-medium text-content-secondary">
            <Icon name="calendar-2-line" className="h-4 w-4" />
            看看以前的记录
          </span>
          <Icon
            name="arrow-right-s-line"
            className="h-4 w-4 text-content-secondary"
          />
        </div>
      </div>
    </div>
  );
}
