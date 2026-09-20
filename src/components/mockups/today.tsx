import { Icon } from "@/components/Icon";
import {
  ActionPill,
  DoneLabel,
  MockupFrame,
  SegmentedTabs,
} from "./parts";

/**
 * 「一家人的今天」左栏：照护者这边 —— 帮家人记，记在 TA 名下。
 */
export function CaregiverAdd() {
  return (
    <MockupFrame className="bg-sand-wash">
      <div className="mb-6 flex w-full items-center justify-between">
        <span className="text-body-lg font-bold text-content-primary lg:text-title-3">
          为妈妈添加健康安排
        </span>
        <Icon name="close-line" className="h-6 w-6 text-content-secondary" />
      </div>

      <div className="space-y-4">
        <div className="rounded-card bg-surface-container p-5 shadow-brand-sm">
          <span className="mb-2 block text-caption font-bold text-content-secondary lg:text-body-sm">
            叫什么名字？
          </span>
          <div className="text-body-base font-bold text-content-primary lg:text-body-lg">
            降压药（红盒子那瓶）
          </div>
        </div>

        <div className="rounded-card bg-surface-container p-5 shadow-brand-sm">
          <span className="mb-3 block text-caption font-bold text-content-secondary lg:text-body-sm">
            什么时候吃？
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-marketing-peach bg-marketing-peach px-4 py-2 text-body-sm font-bold text-content-primary shadow-brand-sm">
              <Icon name="sun-line" className="h-4 w-4" />
              晨间
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-sand bg-surface-container px-4 py-2 text-body-sm font-bold text-content-secondary">
              <Icon name="restaurant-line" className="h-4 w-4" />
              午间
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-sand bg-surface-container px-4 py-2 text-body-sm font-bold text-content-secondary">
              <Icon name="moon-line" className="h-4 w-4" />
              晚间
            </span>
          </div>
        </div>

        <p className="px-1 text-caption text-content-secondary lg:text-body-sm">
          拿不准的先空着，以后随时能改。
        </p>
      </div>
    </MockupFrame>
  );
}

/**
 * 「一家人的今天」右栏：长辈这边 —— 打开看到的，是同一份。
 */
export function ElderShared() {
  return (
    <MockupFrame className="bg-surface-container">
      <div className="mb-6 flex w-full items-center justify-between">
        <SegmentedTabs active="family" className="text-caption lg:text-body-sm" />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-sand bg-marketing-jade/20 text-body-lg font-bold text-content-primary">
          妈
        </div>
        <span className="text-body-base font-bold text-content-primary lg:text-body-lg">
          妈妈
        </span>
      </div>

      <div className="space-y-3">
        <div className="rounded-card border border-sand/60 bg-surface-base p-4">
          <p className="text-body-sm font-bold text-content-secondary lg:text-body-base">
            降压药（红盒子那瓶） 一片
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-caption text-content-secondary lg:text-body-sm">
              早上 8:00
            </span>
            <DoneLabel className="text-caption lg:text-body-sm" />
          </div>
        </div>

        <div className="rounded-card border border-sand/60 bg-surface-base p-4">
          <p className="text-body-sm font-bold text-content-primary lg:text-body-base">
            晚饭后散步 20 分钟
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-caption text-content-secondary lg:text-body-sm">
              晚饭后
            </span>
            <ActionPill className="text-caption lg:text-body-sm">
              帮 TA 记
            </ActionPill>
          </div>
        </div>
      </div>

      <p className="mt-4 px-1 text-caption text-content-secondary lg:text-body-sm">
        妈妈那边打开，看到的也是这一份。
      </p>
    </MockupFrame>
  );
}
