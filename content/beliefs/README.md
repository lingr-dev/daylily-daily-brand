# 萱草主张

萱草围绕个人健康账本组织计划、记录与变化，服务个人维护和有授权的家庭协作。以下十二篇短文解释产品的定位与设计取舍。

## 阅读目录

### 为什么需要一本健康账本

1. [健康安排多起来，先把眼前的事理清](when-health-plans-get-complex.md)
2. [一本健康账本，记清现在，也留住来路](a-health-ledger.md)
3. [从自己用，到和家人一起用](who-daylily-is-for.md)

### 让变化有来路

4. [准备怎样做，实际做了什么](plans-and-records.md)
5. [走到下一阶段，和后来改方案](phases-and-changes.md)
6. [今天的改动，留下昨天的真实](history-in-context.md)

### 一起照顾，也各有边界

7. [替家人记下的事，仍属于家人的生活](helping-without-taking-over.md)
8. [一起照顾，先把谁能看、谁能改说清楚](sharing-with-boundaries.md)
9. [少一点催促，给日常留一点余地](room-for-everyday-life.md)

### 我们怎样作取舍

10. [把事实理清，让判断有依据](facts-and-judgment.md)
11. [少填一些，也要亲自确认](templates-and-confirmation.md)
12. [功能会长大，健康账本要保持清楚](growing-with-clarity.md)

## 从哪里开始

- 初次认识萱草：[健康账本](a-health-ledger.md) → [适用情境](who-daylily-is-for.md) → [事实与判断](facts-and-judgment.md)。
- 正在整理变化：[计划与记录](plans-and-records.md) → [阶段与调整](phases-and-changes.md) → [历史背景](history-in-context.md)。
- 准备与家人一起用：[代记归属](helping-without-taking-over.md) → [授权边界](sharing-with-boundaries.md) → [日常体验](room-for-everyday-life.md)。

## 内容与摄取约定

- 这十二篇是完整的对外短文草稿，尚未发布。它们解释产品定位和设计原则，不是上线公告，也不证明所有描述的能力已经可用。
- 每篇 Markdown 可独立读取。YAML front matter 提供稳定的 `uid`、标题、摘要、主题、系列顺序、语言、内容性质、状态和拟定站内路径。正文仅包含一个一级标题、一句摘要和三至四个短段落。
- `content_kind: product-belief` 表示品牌主张；`capability_scope: design-principles-not-release-notes` 表示不能据此推断功能发布；`status: draft` 表示未发布；`intended_path` 是拟定路径，不代表页面已存在。
- 面向人类与 Agent 使用同一份正文，不另写隐藏宣传文本、不堆砌关键词。内部依据保留在[目录规划](../../docs/2026-09-19-beliefs-editorial-directory.md)，不混入对外正文。

## CMS 与版式交接

当前站点在构建期从 Prismic 取数，**不会自动读取本目录**。本次只落本地文章，不修改 CMS、站点路由或线上内容。

迁入现有 `belief` 类型时：

| 本地内容 | CMS 对应 |
| --- | --- |
| `uid` / `title` / `excerpt` / `topic` | 同名字段 |
| 标题和摘要之后的段落 | 单个 `rich_text` slice；不重复放入标题、摘要 |
| `title` / `excerpt` | 可分别用作 `meta_title` / `meta_description` |
| 真实发布日期 | 发布时填写 `published_at`，草稿不虚构日期 |
| 其余元信息 | 本地编辑与摄取使用，不擅自增加 CMS 字段 |

每篇标题、摘要与正文合计 244–278 个字符（含标点，不含元信息），按 PC 端一屏短文控制。建议无大封面、无重复 Hero，正文宽约 680–760px、字号 16–18px。当前页面模板有独立的标题区和 slice 留白；实际是否一屏需在接入后以 1366×768、1440×900、100% 缩放检查，不能仅凭字数宣称已通过页面验收。正文使用 HTML 文本与语义标题，沿用站点静态导出，便于爬虫读取。

## 编辑依据

本组沿用已确认的四组十二篇思路，标题为适配短文略作收紧。依据为目录规划所列的 LIN-36 v2 冻结合同、LIN-29 合同、LIN-42 Product Story Contract 及品牌表达边界；没有新增医学建议、市场效果数据或用户证言。后续发布时仍需核对届时的功能状态与措辞。

