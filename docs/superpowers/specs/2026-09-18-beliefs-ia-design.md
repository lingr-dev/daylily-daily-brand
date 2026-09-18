# 品牌站「主张」栏目与主导航

日期：2026-09-18  
状态：已确认，待写实现计划

把品牌站从落地页锚点导航改成真正的多页信息架构，并新增顶层栏目 **主张**（萱草主张）：一套可连载的口径文章，向最终用户说明产品设计、人群、意图与取舍。

首页现有版式与内容不动。本文只规定导航语义、新内容类型，以及 `/beliefs` 作为独立二级入口的接法。

---

## 1. 背景与问题

落地页 `landing-page.html` 的导航是四个页内锚点：设计理念、一家人的今天、改动有商量、温暖细节。迁移方案曾把同样的锚点写进 `settings.primary_nav`（`/#philosophy` 等）。

这套导航服务的是单页转化漏斗，不是品牌站：

- `SiteHeader` 全站共用，内页点锚点只是滚回首页某段。
- 站点已有新闻、更新日志、通用页，顶栏却接不住它们。
- 没有顶层入口承接 CMS 的连载能力，也没有地方持续解释「为什么做成这样」。

新闻回答「发生了什么」，更新日志回答「这一版改了什么」。缺的是第四层：**为什么做成这样**。

---

## 2. 已锁定决策

| # | 决策 | 结论 |
| --- | --- | --- |
| 1 | 内容对象 | 索引 + 可重复文章，不是一篇常青文，也不是通用 `page` 或新闻频道 |
| 2 | 对外名称 | 顶栏 **主张**；索引页标题 **萱草主张**（由 `belief_index` 撰写，不写死在代码里） |
| 3 | 路由 | `/beliefs`、`/beliefs/:uid` |
| 4 | 顶栏 | Logo 回首页；其后 **首页 / 主张 / 更新日志**；右侧「打开小程序」不变 |
| 5 | 页脚 | `footer_nav` **保留**。不挂「首页」。新闻可放页脚，不进顶栏 |
| 6 | 首页 | **现有版式与内容不动**。不拆落地页四章，不做主张精选卡，不新增 homepage slice |
| 7 | 索引形态 | `/beliefs` 是独立导航落点：开头文案 + **宫格目录**。不自动跳第一篇 |
| 8 | 宫格规则 | 三列瓷砖，有几篇显示几格，不锁死 9 篇。多了按发布日倒序往下排 |
| 9 | 当前项高亮 | 本期不做。根 layout 无法在静态导出下读路径；高亮需要新的 client 边界 |

口径与用词仍以 `uiux/prototypes/daylily-daily/specs/brand-marketing-sot.md` 为准。官网不发明产品事实。

---

## 3. 信息架构

```
/                      首页（现状维持）
/beliefs               主张索引 · 宫格二级入口
/beliefs/:uid          一篇主张
/changelog             更新日志
/news                  新闻索引（不进顶栏，可进页脚）
/news/:uid             一篇新闻
/:uid                  通用页（隐私政策等）
```

### 3.1 顶栏

三项由 `settings.primary_nav` 配置，不在代码里写死文案：

1. 首页 → `/`
2. 主张 → `/beliefs`
3. 更新日志 → `/changelog`

运营约定就是这三项。禁止再填落地页锚点（`/#philosophy`、`/#today` 等）。

Logo 与「首页」都指向 `/`。这是传统品牌站的做法，不是重复错误。

### 3.2 页脚

`SiteFooter` 继续渲染 `footer_nav`。编辑自行挂主张、更新日志、新闻、隐私政策等次级去处，**不要**再挂首页。

### 3.3 保留 UID

通用 `page` 的 UID 不得占用静态路由名：`news`、`changelog`、`beliefs`、`slice-simulator`。

---

## 4. 内容模型

模型只许用 `npx prismic` 增改，禁止手改 `customtypes/**/index.json`。先 `npx prismic push`，后 `pnpm build:next`。`routes` 里声明的类型远端没有时，整站查询会被拒。

### 4.1 `belief_index`（单例）

- 格式：page、single
- 路由：`/beliefs`
- Slice：`hero`、`rich_text`、`cta_banner`（与 `news_index` 相同）
- SEO 三件套照旧
- 索引页可见标题与引言由这篇的 slice 承担；推荐 H1 为「萱草主张」

### 4.2 `belief`（可重复）

- 格式：page
- 路由：`/beliefs/:uid`
- 字段（均在 slice zone 之前）：

| 字段 API ID | 类型 | 标签 | 说明 |
| --- | --- | --- | --- |
| `uid` | UID | UID | 决定 `/beliefs/:uid` |
| `title` | StructuredText，仅 heading1 | 标题 | |
| `excerpt` | Text | 摘要 | 宫格与分享卡片上的一句话 |
| `cover` | Image | 封面图 | 可选 |
| `published_at` | Date | 发布日期 | 宫格排序键，倒序 |
| `topic` | Select | 主题 | 可选。选项仅四值：**人群 / 意图 / 取舍 / 设计**。存中文，卡片上原样显示，不进 URL，不做筛选 |
| `slices` | Slice Zone | | 见下 |

正文 slice 比新闻宽，因为主张文会讲设计和取舍，不只是短讯：

`hero` · `rich_text` · `feature_grid` · `media_cards` · `callout` · `image_text` · `cta_banner` · `faq`

不含 `stats`、`logo_wall`、`testimonial`（那些仍给首页 / 通用页）。

SEO 三件套与其它 page 类型相同。

### 4.3 路由配置

`prismic.config.json` 增加：

```json
{ "type": "belief_index", "path": "/beliefs" },
{ "type": "belief", "path": "/beliefs/:uid" }
```

插入位置：`news_post` 之后、`release_index` 之前。

### 4.4 静态导出约束

`src/app/beliefs/[uid]/page.tsx` 必须有 `generateStaticParams()`。返回空数组会使构建失败。运营上 **至少发布一篇 `belief`**，与新闻同一条风险。

`belief_index` 是单例，缺了同样构建失败。先建并发布这篇单例。

索引页 `/beliefs` 本身不是动态路由：零篇文章时页面仍能生成，宫格区显示「暂无内容。」——但只要存在 `[uid]` 段，零篇仍会让整站构建失败。因此「暂无内容」只是防御文案，不能当成可以下架全部主张的运营策略。

---

## 5. 页面与组件

### 5.1 `/beliefs` · 主张索引

对齐 `src/app/news/page.tsx` 的取数结构，版面不是新闻信息流：

1. `SliceZone` 渲染 `belief_index`（栏目说明）
2. `Container` 内宫格：`getAllByType("belief")`，`orderings` 为 `my.belief.published_at` desc

宫格 markup：

```html
<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

禁止拼接动态 class（`lg:grid-cols-${n}`）。手机一列，`sm` 两列，`lg` 三列。有几篇渲染几格，不补空格凑九。

每格是新组件 `BeliefTile`（不要复用 `NewsCard`：新闻是封面信息流，主张是口径目录）。

`BeliefTile` 入参：`href`、`title`、`excerpt`、`cover`、`topic`、`publishedAt`。

格子视觉：

- `rounded-card` + `border-sand` + `bg-surface-container` + 内边距
- 整格是链到详情的 `<a>` / `Link`
- 第一行：主题眉标 `text-caption text-brand-deep`（无主题则省略）
- 标题：`text-lg font-semibold text-content-primary`，hover `text-brand-deep`。宫格里不用 `text-title-1`，那是详情页 H1 的量级
- 摘要：最多三行，`text-content-secondary`
- 封面可选，放在标题块之上；没有封面时格子仍等高意图靠内容撑开，不强制 `aspect-ratio` 空槽
- 不把发布日期当作主信息（主题才是目录的识别符）；日期若显示，用 `text-caption text-content-muted` 放在摘要下

空态：宫格位置一句 `暂无内容。`，`text-content-secondary`。

### 5.2 `/beliefs/:uid` · 主张详情

对齐 `src/app/news/[uid]/page.tsx`：

- 返回链文案：**← 返回萱草主张**，`href="/beliefs/"`
- 眉标显示 `topic`（若有）
- 标题、摘要、封面、`SliceZone`
- `generateMetadata` 的 `fallbackTitle` 为标题文本，`path` 为 `/beliefs/${uid}/`
- `generateStaticParams` 映射全部 `belief` 的 uid

### 5.3 首页

不改 `src/app/page.tsx`，不改 `homepage` 模型，不改 Prismic 里已发布的 homepage 文档（本工作不要求迁走四章）。

### 5.4 顶栏 / 页脚组件

`SiteHeader` / `SiteFooter` 的数据接口不变，仍读 `primary_nav` / `footer_nav`。本期不传 pathname、不加 client 组件、不高亮当前项。

导航文案与链接是 Prismic 内容变更，不是代码变更。

### 5.5 sitemap

`src/app/sitemap.ts` 增加：

- `/beliefs/`，`changeFrequency: "weekly"`，`priority: 0.8`（与新闻索引同级）
- 每篇 `belief`：`/beliefs/${uid}/`，`lastModified` 取 `last_publication_date`，`priority: 0.6`

预发构建（`isReleaseBuild`）仍返回空数组。

---

## 6. 数据流

```
构建期
  getSingle("belief_index")        → /beliefs 的 slice 与 SEO
  getAllByType("belief")           → 宫格 + generateStaticParams + sitemap
  getSingle("settings")            → 顶栏 / 页脚（已有）
  getSingle("homepage")            → 首页（已有，本工作不改查询）
```

主张页的 slice 与其它页一样：page 取数，经 `context={{ settings }}` 传入。slice 组件保持同构，禁止在 slice 内 `createClient()`。

不需要 `fetchLinks`：首页不做 Content Relationship 精选。

---

## 7. 运营与首批内容

代码不写死文章。构建前 Prismic 必须已有：

1. 已发布的 `belief_index`
2. 至少一篇已发布的 `belief`
3. `settings.primary_nav` 为：首页 `/`、主张 `/beliefs`、更新日志 `/changelog`
4. `settings.footer_nav` 按需更新（含新闻则挂 `/news`；不要首页）

建议首批主张文（可改题，主题按表；与首页四章**并行**，不是把首页拆空）：

| 草稿题 | 主题 |
| --- | --- |
| 我们做的不是加法，是减法 | 设计 |
| 一家人的今天 | 意图 |
| 改动有商量 | 取舍 |
| 剩下的时间，好好过日子 | 设计 |
| 我们不是到点催你的工具 | 取舍 |

文案必须通过 SoT 红线：不承诺推送/提醒必达，「看过」不是审批，不发明医疗效果。

---

## 8. 非目标

- 不改首页版式、slice 拼装或现有文案
- 不新增 `featured_beliefs` slice，不在 homepage 上做主张精选
- 不删除 `footer_nav`，不把页脚导航整段拿掉
- 不把新闻改成频道、不拿通用 `page` 冒充主张
- 不新增 client 组件、不做顶栏当前项高亮
- 不做主题筛选、标签云、分页、搜索
- 不强制 9 格、不补空瓷砖
- 不把落地页锚点导航留作「兼容模式」

---

## 9. 错误与边界

| 情况 | 行为 |
| --- | --- |
| 未创建 `belief_index` | 构建失败，错误信息比照 `getSettings()`：写明要先在后台创建并发布单例 |
| 零篇 `belief` | `[uid]` 的 `generateStaticParams` 为空，整站构建失败。不能靠索引空态 internally 扛过去 |
| `topic` 未填 | 瓷砖与详情都不显示眉标 |
| `cover` 未填 | 瓷砖无图，标题与摘要仍可点 |
| 通用页 UID 填 `beliefs` | 产物路径冲突。文档与 README 的保留名列表必须写上 `beliefs` |
| 主导航仍填 `/#philosophy` | 功能上仍能渲染成链接，但违反本栏目约定；验收时视为未完成 |

---

## 10. 验证

实现完成后至少跑：

```sh
pnpm tokens:check
pnpm typecheck && pnpm lint
pnpm build:next
pnpm classes:check
```

`pnpm build:next` 需要 Prismic 连接，且远端模型已 push、`belief_index` 与至少一篇 `belief` 已发布。

浏览器核对（`pnpm dev` 即可）：

1. 顶栏可进 `/`、`/beliefs/`、`/changelog/`，右侧仍是打开小程序
2. `/beliefs/` 是宫格目录，不是跳转到某篇文章
3. 点击一格进入 `/beliefs/<uid>/`，返回链回到索引
4. 首页视觉与改前一致
5. 页脚仍有导航列表，且没有「首页」项（内容侧验收）
6. 手机单列宫格，桌面最多三列；没有横向溢出

---

## 11. 将改动的文件（实现时）

**新建（CLI）**

- `customtypes/belief_index/index.json`
- `customtypes/belief/index.json`

**新建（代码）**

- `src/app/beliefs/page.tsx`
- `src/app/beliefs/[uid]/page.tsx`
- `src/components/BeliefTile.tsx`

**修改**

- `prismic.config.json`（两条 route）
- `src/app/sitemap.ts`
- `README.md`（新类型、保留 UID、主导航约定）
- `scripts/bootstrap-content-model.sh`（可复现建模）
- `prismicio-types.d.ts`（`npx prismic gen types`）

**不改**

- `src/app/page.tsx`
- `customtypes/homepage/index.json`
- `src/components/SiteHeader.tsx` / `SiteFooter.tsx`（接口不变）
- 任意 slice 的 `model.json`（只 `slice connect` 到新类型）
