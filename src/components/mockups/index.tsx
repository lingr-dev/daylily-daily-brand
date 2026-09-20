import type { ReactNode } from "react";
import { RevisionConfirm, RevisionEdit, RevisionSeen } from "./changes";
import { PhoneToday } from "./hero";
import { RecordLedger } from "./ledger";
import { CaregiverAdd, ElderShared } from "./today";

/**
 * 落地页界面样机登记表。
 *
 * 为什么是「登记表」而不是 Prismic 里的图片字段：图床方案未定之前，Image 字段
 * 一律留空（迁移方案 §6），空位此前画的是虚线占位框。本轮先把 uiux 原型页
 * `prototypes/daylily-daily/landing-page.html` 里那几张样机按原样用 markup 搬过来
 * 顶上 —— 它们本来就是**画出来的界面**，不是截图，搬 markup 比等截图更接近原件。
 *
 * 与 Icon 同理：样机是设计资产，不是编辑填的内容，所以不进内容模型。
 *
 * 键怎么来的 —— 由各 slice 在调用点拼，只有这一张表知道它们对应哪块版面：
 *
 * | 键            | 谁来取                                    |
 * | ------------- | ----------------------------------------- |
 * | `hero`        | `hero` / withImage，图片字段为空时         |
 * | `<锚点>.<序号>` | `media_cards` 的第 n 张卡，锚点即 anchor_id |
 * | `image_text`  | `image_text`，图片字段为空时                |
 *
 * 用 anchor_id 而不是标题文案做键：文案会改（§6A 词表刚整体升过一版），
 * 锚点不会 —— 导航栏的 `/#today` `/#changes` 已经吊在上面了。
 * 键落空就退回虚线占位框，跟以前一样，不会塌版。
 *
 * `hero` 与 `image_text` 这两个键没有更细的限定，是因为全站只有首页用到
 * `hero/withImage` 和 `image_text`。哪天别的页面也用上了，这里要跟着变细。
 *
 * 图床接通、真截图补齐之后，整个目录连同 ImagePlaceholder 一起删掉。
 *
 * 表里存的是**元素**不是组件：组件引用在 render 里取出来再 `<Mockup />`，会被
 * react-hooks/static-components 判成「渲染期创建组件」。样机是静态 markup，
 * 元素在模块作用域建好一次就够。
 */
const mockups: Record<string, ReactNode> = {
  hero: <PhoneToday />,
  "today.0": <CaregiverAdd />,
  "today.1": <ElderShared />,
  "changes.0": <RevisionEdit />,
  "changes.1": <RevisionConfirm />,
  "changes.2": <RevisionSeen />,
  image_text: <RecordLedger />,
};

/** 取不到就是 undefined，由调用方决定退回占位框还是什么都不画。 */
export function mockupFor(key: string): ReactNode | undefined {
  return mockups[key];
}
