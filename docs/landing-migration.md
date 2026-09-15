# 落地页迁移方案：`landing-page.html` → Prismic 内容架构

把 `uiux/prototypes/daylily-daily/landing-page.html`（848 行单页落地页）迁到本仓库的
Prismic 内容架构上，成为 `homepage` 单例的内容；同时把本站的视觉词汇对齐到
`uiux/` 的设计令牌系统，让两个仓库不再各活各的。

状态：方案已定，尚未开工。涉及图片的部分先留 placeholder（见 §6）。

---

## 0. 已确认的决策

| # | 决策点 | 结论 |
| --- | --- | --- |
| 1 | UI 样机怎么迁 | **用截图**，不在品牌站重写 HTML 手绘样机 |
| 2 | 二维码弹窗 | **不做弹窗**，二维码就地展示，保持零 client 组件 |
| 3 | 图标 | **Select 枚举 + 代码侧内联 SVG**，不引图标字体 |
| 4 | 视觉令牌 | **采用 `uiux/` 的设计令牌系统**，见 §3 |
| 5 | 图片托管 | **外部图床**，不入 Prismic 媒体库，见 §6 |

决策 1 的理由：品牌站上的样机本该是真实产品截图，手绘 HTML 是原型阶段的权宜。
重写成 React 组件虽然保真，但文案会写死在代码里、且必然与真实 app 漂移。

决策 2 的理由：本仓库刻意维持「不新增 client 组件」（见 `CLAUDE.md`）。
把二维码放进底部 CTA 区块就地展示，导航按钮改成 `<a href="/#cta">` 滚过去，
移动端则用 Link 字段直接填小程序唤起链接 —— 比原型的弹窗少一层交互，也零 JS。

决策 3 的理由：原型靠 `cdn.staticfile.net` 的 remixicon 字体，既是跨境请求
（本项目要消除的正是这个），也为 9 个图标拉一整套字体。图标是设计资产不是内容，
内联 SVG 零请求、可跟随 `currentColor`。Remix Icon 是 Apache-2.0，可直接内联。

---

## 1. 两边现状

### 1.1 本仓库（brand site）

| 层 | 内容 |
| --- | --- |
| 内容类型 | `homepage`(单例) / `page`(可重复) / `news_index` / `news_post` / `settings`(单例) |
| Shared slices | `hero`(default, withImage) `rich_text` `feature_grid` `stats` `logo_wall` `image_text`(default, imageLeft) `testimonial` `cta_banner` `faq` |
| 壳层 | `SiteHeader`（sticky + `<details>` 移动菜单）/ `SiteFooter`（导航 + 联系 + 社交 + ICP），都吃 `settings` |
| 排版 | `RichText.tsx` 单点 serializer；`Container`(72rem) / `Button`(pill) |
| 视觉 | `globals.css` 的 `@theme`：蓝色 brand 色阶 + 白底灰面中性色 —— **与 `uiux/` 完全无关的一套平行词汇，本方案要退役它** |
| 图片 | 构建期 imgix 出图 → `public/_img` + manifest |

`src/generated/image-manifest.json` 目前是空的 —— Prismic 仓库里还没有内容，
这是一次「白纸」迁移，不需要考虑存量内容兼容。

### 1.2 原型页结构

```
nav(fixed)      logo + 4 个锚点 + 「打开小程序」按钮 → QR 弹窗
hero            眉标 pill + h1（含高亮词）+ 副文案 + 双 CTA + 手机样机
#philosophy     章节标题 + 2×2 卡片（icon + 标题 + 段落）
#today          章节标题 + 引言 → 2 列（badge + h2 + 段落 + 样机）→ 隐私 callout
#changes        章节标题 + 引言 → 3 列（样机 + 说明）→ 2 列（文 + 台账样机）
#details        章节标题 → 3 卡（顶部色条 + icon + 标题 + 引述框 + 说明）
底部 CTA        浅色大圆角卡 + h2 + 按钮
footer          logo + 名 + tagline + 3 链接 + ICP / 小程序备案 / 公安备案
QR modal        JS 弹窗
```

`<head>` 里另有：SEO 三件套、OG、`SoftwareApplication` JSON-LD、百度统计、
指向 `llms.txt` 的 meta。

---

## 2. 区块映射表

| 原型区块 | 目标 | 动作 |
| --- | --- | --- |
| nav | `SiteHeader` + `settings.primary_nav` | 加 header CTA 槽位；锚点写成 `/#philosophy`（全站共用 header，裸 `#x` 在内页会失效） |
| hero | `hero` / **withImage** | ✅ 字段全有。高亮词用 `em` + serializer 覆盖；样机放 image 位 |
| #philosophy | `feature_grid` **新增 `card` 变体** | 现有 default 是无边框列表，不是卡片 |
| #today 两列 | **新增 `media_cards`**（columns=2, textFirst） | badge pill 需 `eyebrow` 字段 |
| #today 隐私块 | **新增 `callout`** | 无对应 |
| #changes 三列 | `media_cards`（columns=3, imageFirst） | 同一个 slice 吃掉两块 |
| 记录台账 | `image_text` / default | ✅ 直接可用 |
| #details | `feature_grid` **新增 `quote` 变体** | 比 default 多一个 quote 字段 + 顶部色条 |
| 底部 CTA | `cta_banner` **新增 `light` 变体** | 现有是 `bg-brand-950` 深色；原型是浅色卡且要放二维码 |
| footer | `SiteFooter` + `settings` | 缺小程序备案号、公安备案号 |
| QR modal | — | 不做（决策 2） |
| JSON-LD / 统计 / llms.txt | — | 见 §7 |

**结论：新增 2 个 slice（`media_cards` `callout`）+ 3 个变体，即可覆盖整页。**

`stats` / `logo_wall` / `testimonial` / `faq` 本次用不到，保留待后续页面使用。

---

## 3. 设计系统对齐（本方案的核心）

### 3.1 对齐到哪一层：采用 `uiux/` 的词汇，退役本站的平行词汇

`uiux/prototypes/daylily-daily/themes/` 已经是一套成熟的令牌系统：

```
tokens.css            ① 语义层 · 十六进制，视觉真相，可搬进小程序 WXSS
tailwind-compat.css   ② 通道层 · ① 的 "R G B" 镜像，供 Tailwind v3 的 <alpha-value>
base.css              ③ 运行时 · .no-scrollbar / .active-overlay / .btn-bounce
tailwind-preset.js       共享 Tailwind 配置
verify-tokens.mjs        ①② 一致性 + 对比度校验
```

它的 `README.md` 记录了三轮整理，主题始终是同一件事：**消灭平行词汇**。
16 份内联 config 漂移成 13 种、落地页自建 `--bg-color`/`--text-dark` 与
`--paper`/`--ink` 同值却各活各的 —— 都是被收编的对象。

本仓库现在正在建**第四套**平行词汇：`text-ink` / `bg-canvas` / `border-line` /
`text-brand-600`，与 `uiux/` 的 `text-content-primary` / `bg-surface-base` /
`border-sand` / `text-brand-primary` 一一对应却互不相识。

> **决定：品牌站改用 `uiux/` 的通道名，本站现有的语义名全部退役。**

代价明确：9 个 slice + `Container` / `Button` / `RichText` / `SiteHeader` /
`SiteFooter` 的类名要全改，`CLAUDE.md` 的「样式」章节要重写。
现在改是最便宜的时点 —— 这批组件本来就要为落地页大改，而且 Prismic 里还没有内容。

对照表（迁移时按此替换）：

| 本站现有 | 改为（`uiux/` 通道名） | 值 |
| --- | --- | --- |
| `bg-canvas` | `bg-surface-base` | `#F9F7F3` 宣纸白 |
| `bg-surface` | `bg-surface-container` | `#FFFFFF` |
| `bg-surface-strong` | `bg-sand-wash` | `#F4F1EA` |
| `text-ink` | `text-content-primary` | `#2D2926` |
| （无，此前够不到） | `text-content-body` | `#4A443F` 正文 |
| `text-ink-muted` | `text-content-secondary` | `#6B635B` |
| `text-ink-subtle` | `text-content-muted` | `#8C847E`，**仅限大字/装饰** |
| `border-line` | `hair` → `border-hair` | `#E7E5E4` 浅石描边 |
| `border-line-strong` | `sand` → `border-sand` | `#E5E0D8` 暖砂描边（落地页主力，28 处） |
| （无） | `hairline` → `border-hairline` | `rgba(45,41,38,.06)` 导航栏等 chrome |
| `text-brand-600` 等整条蓝色阶 | `marketing-peach` / `marketing-jade` + `brand-deep` | 见 §3.2 |

注意语义方向反了：本站现在 `canvas` 是纯白、`surface` 比它深；
`uiux/` 是 `paper` 米白打底、`card` 纯白**浮在上面**。替换时不能机械对位。

**两处刻意偏离 `uiux/` preset 键路径的命名**（已在生成物注释里各记一条）：

1. `border.subtle` / `border.hairline` → **`hair` / `hairline`**。
   preset 的键路径在 Tailwind 里会生成 `border-border-subtle` 这种类名。
   名字应当按「生成出来的工具类名」定 —— 落地页 markup 实际写的是
   `border-sand`（28 处）与 `border-hairline`（1 处），`border-subtle` 一次都没出现。

2. `brand.primary` / `brand.jade` → **`marketing-peach` / `marketing-jade`**。
   落地页那两个类名之所以是桃色，是靠页内一段 `DaylilyTailwind.extend` 把
   `brand.primary` 改指 `--brand-marketing` 才成立的；而 `brand-primary` 在 `uiux/`
   别处是萱草橙 `#EA580C`。**同名不同值**正是 `themes/README.md` 反复警告的陷阱
   （`--brand-secondary` 曾两层同名，校验脚本拿它跟自己比、永远通过）。
   本仓库不把这个陷阱引进来，直接用 `tokens.css` 的语义名。

### 3.2 ⚠️ marketing 色族没有文字合规档

实测（背景为宣纸白 `#F9F7F3`）：

| 组合 | 对比度 | 判定 |
| --- | --- | --- |
| `--marketing-peach` `#FF9F68` 作文字 | **1.89:1** | ✗ 远低于 4.5:1 |
| `--marketing-jade` `#8F9E8B` 作文字 | **2.64:1** | ✗ |
| 白字落在 `#FF9F68` 填充上 | **2.02:1** | ✗ **原型的主 CTA 按钮就是这个组合** |
| `--brand-deep` `#9A3412` 作文字 | 6.83:1 | ✓ |

原型页把 peach 用在眉标、标题高亮词、链接上，把 jade 用在「已确认」标签上，
把「扫码打开小程序」主按钮做成 `bg-brand-primary text-content-inverse` ——
**四处都不合规，主按钮的文字尤其读不清**。对一个主打适老化的产品，这是硬伤。

`tokens.css` 给 `--brand` 配了 `--brand-deep`（6.83:1）、给 `--vip` 配了
`--vip-ink`（4.79:1），唯独 marketing 族没有对应的文字档 —— 因为
`verify-tokens.mjs` 的对比度检查只覆盖墨色与金色，marketing 族从未被查过。

**品牌站的解法（不阻塞，全用现有令牌）：**

| 用途 | 用什么 | 对比度 |
| --- | --- | --- |
| 橙色系文字（眉标、高亮词、链接） | `--brand-deep` `#9A3412` | 6.83:1 ✓ |
| 主 CTA 按钮 | `#FF9F68` 填充 + `--ink` `#2D2926` 墨字 | **7.15:1** ✓ |
| peach 作装饰（光晕、色条、边框、软填充） | `#FF9F68` 原样 | 非文字，不受限 |
| jade 系文字 | 暂用 `--ink-body` `#4A443F`，或见下 | 8.96:1 ✓ |

「墨字 + 桃色填充」而不是「白字 + 加深填充」——后者会让按钮失去原型那份柔和调性，
而前者在宣纸世界里本来就更自洽。

**应回 `uiux/` 补的上游改动**（不阻塞本次迁移，但原型页自己也该修）：

1. `tokens.css` 增 `--marketing-peach-ink: #A85018`（5.13:1）、
   `--marketing-jade-ink: #556650`（5.77:1）
2. `tailwind-compat.css` 增对应通道 `--brand-marketing-ink` / `--brand-jade-ink`
3. `verify-tokens.mjs` 的 `PAIRS` 加两对，并**把 marketing 族纳入对比度检查**
4. `landing-page.html` 自身的 `text-brand-primary` / `text-brand-jade` 换成 `-ink` 档

品牌站不自己造这两个值 —— 那第一天就漂移了。上游补齐后再切过来。

### 3.3 品牌站需要的令牌子集

`tokens.css` 里约 90% 是小程序壳内才用的。品牌站只取：

**取**
- 纸面与墨色：`--paper --card --raised --ink --ink-body --ink-soft --ink-muted --ink-inverse`
- 描边：`--hair --hair-soft --fill-quiet`
- 落地页专用：`--marketing-peach --marketing-jade --sand --sand-wash`
- 橙色系文字档：`--brand-deep`
- 微信绿：`--wechat --wechat-deep --wechat-wash`（「打开小程序」CTA 需要）
- 阴影着色：`--shadow-rgb`；阴影：`--sh-sm --sh-md`
- 骨架层：`--r-*` 圆角、`--sp-*` 间距、`--fz-*` 字号、`--ease --dur-*`、
  `--font-sans --font-serif`、`--tap-min --tap-comfort`

**不取**（属于 app 壳内，`tokens.css` 明确写了「不要带进 app 壳内」的反向也成立）
- 磁贴色 `--tile-*`（9 组）
- 亲情版金 `--vip-*`
- 反馈色 `--ok/--warn/--danger/--twilight/--idle`（品牌站没有状态反馈）
- `--brand`（萱草橙）：官网主色是 peach，不是萱草橙
- `--stage --bezel`：原型脚手架，不是产品表面

**不取但值得说明的**
- `--sp-*` 间距：取值 4/8/16/24/32/48，与 Tailwind 默认的 1/2/4/6/8/12 逐档相等，
  没有可同步的东西。多建一套 `p-md` / `p-lg` 词汇只会和 `p-4` / `p-6` 打架。

**品牌站独有、`uiux/` 没有对应物的**（留在 `globals.css`，不进生成物）
- `--spacing-section` / `--spacing-section-lg`：页面区块节奏，小程序没有这个概念
- `--container-content`：内容最大宽度

本站现有的 `--text-display-sm/-/-lg` 三档可以退掉，直接用
`uiux/` 的 `--fz-display: clamp(2.25rem, 5vw, 4.5rem)`（它本来就注明「仅落地页衬线大标题」）。

### 3.4 同步机制：生成 + CI 校验

三条路，选第二条：

| | 做法 | 问题 |
| --- | --- | --- |
| A | 直接 `@import` submodule 的 `tokens.css` | 构建期依赖 submodule 能 clone 下来。品牌站是独立部署的静态站，CI 里为了一份 CSS 去拉私有仓库，是把部署可靠性押在一条不必要的依赖上 |
| B | **脚本生成 + 提交产物 + CI 校验漂移** | ✅ |
| C | 手抄 | 这正是漂移的来源 |

**方案 B 的具体形态（✅ 2026-09-12 已落地）：**

```
scripts/sync-tokens.mts        读 uiux/.../tokens.css → 抽 §3.3 的子集 → 生成
src/app/tokens.generated.css   生成物，提交进仓库；**由 globals.css @import —— 第 2 步接线**
pnpm tokens:sync               重新生成
pnpm tokens:check              重新生成并与工作区 diff，不一致 exit 1 —— CI 跑这个
```

四条路径实测：

| 场景 | 行为 |
| --- | --- |
| 与上游一致 | `✓ 令牌与 uiux 一致`，exit 0 |
| 已漂移 | 逐行打印「本地 / 上游」差异，exit 1 |
| submodule 未 checkout + `--check` | 打印同步命令并**跳过**，exit 0（不让它变成构建阻塞） |
| submodule 未 checkout + `sync` | 打印同步命令，exit 1 |

另一处防漂移：上游若改名或删掉取用表里的令牌，`build()` 会收集全部缺失项
后**一次性抛错**，而不是静默生成一个缺值的文件。错误信息明确要求
「先确认上游意图，再改本脚本的取用表 —— 不要在这边造值」。

生成物头部记录上游 `git describe` 结果（当前 `baseline-pre-v0.5.0-82-gb1ca663`），
一眼能看出这份令牌来自哪个上游版本。

- 日常构建（`pnpm build`）**不依赖 submodule**，读的是已提交的生成物。
- `tokens:check` 需要 submodule，只在 CI 的独立一步跑；submodule 没 checkout 时
  跳过并打印警告，不让它变成构建阻塞。
- 上游改了颜色而这边没同步 → CI 红。这就是「不再漂移」的执行力所在。

生成脚本要保持**纯解析**：正则抽 `--name: value;`，不引 CSS 解析器。
同时把 `tokens.css` 里的中文注释一并带进生成物 —— 那些注释（尤其对比度标注）
就是这套系统最有价值的部分，丢了等于丢了一半。

### 3.5 Tailwind v4 与 v3 的差异

`uiux/` 是 Tailwind v3 CDN + `tailwind-preset.js`；本仓库是 v4 的 `@theme`。

关键差异：**v4 不需要通道层**。v3 的 `<alpha-value>` 语法要求裸 `R G B` 才能生成
`bg-brand-primary/10`，这才有了 `tailwind-compat.css`；v4 用 `color-mix()`
实现透明度修饰符，直接吃十六进制。

所以品牌站只同步**语义层**（`tokens.css` 的 hex），不需要 `tailwind-compat.css`。
但**类名要沿用通道层的命名**（`content-primary` 而不是 `ink`），因为那才是两个仓库
的 markup 里实际出现的词 —— 对齐的意义在于人读两边代码时用同一套词汇。

生成的 `@theme` 长这样：

```css
@theme {
  /* 纸面 · 源自 uiux tokens.css --paper */
  --color-surface-base:      #F9F7F3;
  --color-surface-container: #FFFFFF;
  /* 墨色（括号内为宣纸白上的对比度） */
  --color-content-primary:   #2D2926;  /* 13.47:1 */
  --color-content-body:      #4A443F;  /*  8.96:1 */
  ...
}
```

`base.css` 的三个运行时工具类中，`.btn-bounce`（按压回弹）对品牌站的按钮有价值，
`.active-overlay` / `.no-scrollbar` 是小程序手感，品牌站不需要。
建议只把 `.btn-bounce` 的行为并进 `Button` 组件的 Tailwind 类，不整份引入 `base.css`。

### 3.6 衬线体

`DESIGN.md` 明确：`Noto Serif SC`（Songti / STSong 回退）**仅用于营销落地页的
诗意标题**，不进小程序壳内。原型的 h1/h2/h3 全部走衬线。

提醒一点：`--font-serif` 的栈是 `"Noto Serif SC", "Songti SC", "STSong", "SimSun", serif`,
但 Noto Serif SC **不作为系统字体存在于任何平台**，所以实际落点是 macOS 的
Songti SC 与 Windows 的 SimSun（宋体）—— 两者观感差距很大，Windows 上小字号宋体
可读性明显更差。

建议：衬线只用于 hero 大标题和各章节 h2（大字号，宋体在这个尺寸下没问题），
正文与卡片标题保持无衬线。本仓库 `CLAUDE.md` 已禁止加载中文 webfont，
若将来品牌确需 Noto Serif SC，走 `next/font/local` + 子集化，且只挂大标题。

---

## 4. 内容模型改动（一律走 CLI）

`CLAUDE.md` 硬约束：**绝不手改** `customtypes/**/index.json`、`src/slices/*/model.json`、
`prismicio-types.d.ts`。

```sh
# ── 新 slice ──────────────────────────────────────────────
npx prismic slice create MediaCards
#   primary: heading(H2) body(RichText) columns(Select 2|3)
#            layout(Select imageFirst|textFirst) anchor_id(Text)
#   items[]: eyebrow(Text) title(Text) body(RichText) image(Image)

npx prismic slice create Callout
#   primary: icon(Select) title(Text) body(RichText)

# ── 新变体（⚠️ 变体之间不继承字段，每个都要独立声明全部字段）──
#   feature_grid / card   : heading body columns anchor_id
#                           items[icon(Select) title description]
#   feature_grid / quote  : heading anchor_id
#                           items[icon(Select) title quote(Text) description]
#   cta_banner   / light  : heading body primary_link secondary_link
#                           qr_image(Image) note(Text) anchor_id

# ── 已有 slice 补字段 ─────────────────────────────────────
#   anchor_id(Text) 加到 hero 的 default 与 withImage 两个变体

# ── settings 扩展 ────────────────────────────────────────
#   header_cta(Link, allowText)      导航栏右侧按钮
#   miniprogram_license(Text)        小程序备案号
#   police_license(Text)             公安备案展示文案
#   police_record_code(Text)         公安备案查询号，用于拼 beian.gov.cn 链接

# ── 接线与推送 ───────────────────────────────────────────
npx prismic slice connect          # media_cards / callout → homepage + page
npx prismic gen types
npx prismic push

npx prismic --help                 # 不要猜命令语法
npx prismic docs list              # 官方文档可离线查
```

`anchor_id` 要给**每个 slice 的每个变体**各加一遍：`hero` 2 次、`feature_grid` 3 次。

---

## 5. 代码改动清单

| 文件 | 改动 |
| --- | --- |
| `scripts/sync-tokens.mts` | **新建**，见 §3.4 |
| `src/app/tokens.generated.css` | **新建（生成物）** |
| `src/app/globals.css` | 退役现有 `@theme` 调色板，改 `@import "./tokens.generated.css"`；保留本站独有的 section 节奏与 container 宽度；把 `card-hover` / `organic-shape` / `float` 动效搬进来，**只用令牌不写字面色值**（`prefers-reduced-motion` 的全局抑制已有，自动生效） |
| `src/components/Icon.tsx` | **新建**，9 个内联 SVG 查表 |
| `src/components/Button.tsx` | 主按钮改「桃色填充 + 墨字」（§3.2）；圆角走 `--r-pill`；加按压回弹 |
| `src/components/Container.tsx` | 类名对齐 |
| `src/components/RichText.tsx` | serializer 全量换类名；`em` 的渲染改成 `text-brand-deep` 的高亮词（原型 h1 里的「同一个答案」靠这个） |
| `src/components/SiteHeader.tsx` | 加 `header_cta` 按钮；类名对齐 |
| `src/components/SiteFooter.tsx` | 备案三件套；公安备案图标**下载进 `public/`**，不能留 `img-xs.lingerer.cn` 外链 |
| `src/slices/Hero/index.tsx` | `id={anchor_id}`；装饰光晕；类名对齐 |
| `src/slices/FeatureGrid/index.tsx` | 按 `slice.variation` 分出 card / quote 两套渲染 |
| `src/slices/MediaCards/index.tsx` | **新建**。列数用**完整 class 字符串查表**——`lg:grid-cols-${n}` 不会被 Tailwind 收集 |
| `src/slices/Callout/index.tsx` | **新建** |
| `src/slices/CtaBanner/index.tsx` | 加 light 分支（浅色卡 + 二维码） |
| 其余 5 个 slice | 仅类名对齐 |
| `src/app/layout.tsx` | 百度统计用 `next/script` `afterInteractive`；统计 ID 走 env |
| `src/lib/jsonld.ts` | **新建**，`SoftwareApplication` schema |
| `public/llms.txt` | 从原型目录拷贝 |
| `CLAUDE.md` | 「样式」章节重写：语义 token 清单换成 `uiux/` 词汇，补一条「令牌由 `pnpm tokens:sync` 生成，不手改」 |

所有 slice 必须保持**非 async、不取数** —— 它们会同时出现在 server 树和
`slice-simulator` 的 client 树里。上面这些都是纯展示组件，不冲突。

---

## 6. 图片策略（外部图床）

**已定**：样机截图、logo、二维码上传到外部云存储图床，不进 Prismic 媒体库。

这与现有管线的关系需要说清楚：

`scripts/localize-images.mts` + `PrismicImage` 这套管线存在的唯一理由是
「Prismic 的图片托管在 `images.prismic.io`（imgix），域名在海外，
国内首屏会被跨境请求拖死」。**图片改放国内图床后，这个理由消失了。**

于是有两条路：

- **甲**：图片仍走 Prismic 媒体库 → 构建期本地化到 `public/_img` → 随站点发布。
  管线一行不动，图片与站点同域，最快。
- **乙**：图片放图床，Prismic 里只存 URL（Text/Link 字段）→ 需要一个新的
  `RemoteImage` 组件，`PrismicImage` 与 manifest 在这些字段上不适用。

**过渡期做法（本次执行采用）**：

1. 所有 Image 字段**先留空**，slice 组件对空图片字段做优雅降级
   （`isFilled.image()` 已是现有组件的惯例，照此处理即可）。
2. 需要占位时用纯 CSS 占位块（`bg-sand-wash` + 圆角 + 宽高比），不引外部占位图服务。
3. 图床对接方案定了之后，再决定甲/乙并补一节到本文档。

**一个必须记的坑**：二维码不能走 `localize-images` 管线。`buildImgixUrl` 固定
`fm=webp&q=78`，有损压缩在高对比度线条图上会产生 artifact，直接影响扫码识别率。
二维码应当放 `public/` 用原图，或在管线里单开 lossless 分支。

---

## 6A. 文案口径：词表已升 2.0.0，原型文案整体过时

2026-09-08 把 `uiux/` 同步到 `b1ca663` 后发现的，**迁移时必须按新口径录入，不要照抄原型**。

`uiux/prototypes/daylily-daily/lexicon/product.js` 升到 `2.0.0`
（变更记录：`lexicon/changes/2026-09-07-health-journal-naming.md`，Human 2026-09-07 批准）。

| 概念 | 原型页用的 | 现行正式表达 | 原型命中 |
| --- | --- | --- | --- |
| `Plan` | 健康小记 / 小记 | **健康安排 / 安排**，量词一份 | 8 处 |
| `HealthLedger` | 账本 | **健康手帐 / 手帐**，量词一本 | 2 处 |
| `HealthRecord` | 记录 | 健康记录 / 记录，量词一条 | 不变 |
| `ScheduleOccurrence` | 一次安排 / 这一次 | 这一次；独立解释用「这一次的安排」 | — |
| `PlanRevision` | 这次改动 | 安排改动；有上下文后仍可说「这次改动」 | — |
| `PlanPhase` | 分几段来 | 分段安排 | — |
| 品类表达 | 家庭健康记录协同工具 | **你和家人的健康手帐** | hero 眉标 + title + OG |
| 宣传主句 | （无） | **用药有安排，日常有记录。** | — |

来源：`PRODUCT_NORTH_STAR.md` 定位段与 `lexicon/product.js` 的 `concepts`。
`HealthLedger` 另有 `private` surface：「只给自己看 / 不让家人看到我的记录」——
正是 `#today` 隐私 callout 那块的标题，照此对齐。

**两条硬约束：**

1. **「禁止对全仓「安排」做无语境替换」**（变更记录 §1）。逐条按概念改，不做 find/replace。
   技术层的 Ledger 与产品记忆 SQLite 账本保留原名，不受影响。
2. **字体统一「帐」**，不写「健康手账」。

**「去药化」被改释，牵动 SEO：**

不再隐去用药用途 —— 产品帮助管理用户**已有**的安排，不制定专业方案。
同时撤销六条字面禁词：用药计划 / 日常用药 / 创建用药 / 服药 / 吃药 / 用药安排
（`cleared` 里登记了各自的使用语境）。

推论：原型 `<meta name="keywords">` 里的「健康小记」必须换掉，而用药类关键词
现在反倒是允许的 —— 对一个面向国内搜索的品牌站，这是实打实的收益。
北极星的关键词也同步改成「健康手帐 / 健康安排 / 健康记录 / 明确用药用途」。

保留的红线不变：补服、漏服、停药等原禁词，以及医疗、推送、付费三组红线。
提示口径：**补记不等于补服，未记录不等于漏服，结束安排不等于停药**。

**已核对**：用现行 113 条 `bans` 扫过落地页全部可见文案，**零命中** ——
原型文案只是叫法过时，没有触红线。

**执行方式**：文案在第 7 步「内容录入」时按上表逐条改写后再录入 Prismic，
不要先照抄原型再回头改 —— Prismic 里还没有内容，没有理由先写一遍旧词。

**上游待修（不阻塞本仓库）**：`node lexicon/verify-lexicon.mjs --json` 在当前
checkout 下加载 `product.js` 失败 —— UMD 包装在 ESM 下 `this === undefined`，
`root.LEXICON_DATA = ...` 抛 `Cannot set properties of undefined`。
本仓库若要读词表，绕开 UMD 直接解析文件里的对象字面量即可。

## 7. SEO / 统计 / 结构化数据

| 项 | 做法 |
| --- | --- |
| title / description / keywords | 现有 `buildMetadata` 已覆盖前两项；keywords 走 Next metadata 的 `keywords`，值放 `homepage` 的新字段或 `settings`。**取值按 §6A 的新词表**，不要沿用原型的「健康小记」 |
| OG | 现有 `seo.ts` 已处理，且刻意指向本站 jpeg 副本 —— 抓取器在国内访问海外域名常超时 |
| JSON-LD | **代码侧生成**，`src/lib/jsonld.ts` 由 `settings` 拼出 `SoftwareApplication`。不入 CMS —— 把 JSON 塞进 Text 字段太脆，编辑一不小心就是语法错误且构建不报错 |
| 百度统计 | `layout.tsx` 里 `next/script` + `afterInteractive`，静态导出兼容。站点 ID 走 `NEXT_PUBLIC_*` env |
| `llms.txt` | `public/llms.txt` 静态文件，从原型目录拷贝后按品牌站口径校订 |

---

## 8. 执行顺序

1. ✅ **令牌同步**（§3.3–3.5）：`sync-tokens.mts` + 生成物 + `tokens:check`。
   **生成物尚未接进 `globals.css`** —— 接线属于第 2 步，因为接上的同时就必须换词，
   否则两套词汇并存正是 §3.4 排除掉的方案 C。
2. **全站换词**：9 个 slice + 5 个组件的类名对齐，`CLAUDE.md` 样式章节重写。
   这一步做完站点应当与改动前**视觉等价地**跑通（只是换了皮），先验一次。
3. **Icon 组件**：9 个内联 SVG。后面三个 slice 都依赖它。
4. **内容模型**（§4）：CLI 建模 → `gen types` → `push`。
5. **slice 组件**：FeatureGrid 两变体 → MediaCards → Callout → CtaBanner light → Hero。
6. **壳层**：SiteHeader CTA、SiteFooter 备案、layout 统计与 JSON-LD。
7. **内容录入**：`homepage` 单例约 20 段文案。手工可行但易错；若之后还要重建或换环境，
   用 `@prismicio/client` 的 Migration API 写一次性导入脚本更划算。
8. **图片**：图床对接后回填（§6）。
9. **验证**：

```sh
pnpm tokens:check
pnpm typecheck && pnpm lint
pnpm build:next     # 不需要 Prismic 连接也能验证类型与静态导出约束
pnpm build          # 完整构建（需要 Prismic 连接）
```

第 2 步是可以独立验收的安全点 —— 如果后面的工作要中断，站点处于一个自洽状态。

---

## 9. 遗留与风险

1. **「章节」在 slice 架构里不存在。** 原型的 `#today` 是「章节头 + 两列 + callout」
   一个整体（共享背景色、共享锚点）。拆成 `media_cards` + `callout` 后，背景分区会
   断在两者之间。解法：把 `media_cards` 的 heading/body 当章节头用（锚点也挂这里），
   callout 设计成「浮在章节底部的窄卡」而不依赖章节背景 —— 这正好也是原型里那块的
   实际样子。若后续需要更强的分区能力，再给各 slice 统一加 `background` Select。

2. **原型页在 390px 下横向溢出**（主标题、CTA、导航按钮被裁）。
   `uiux/.../themes/README.md` §6 把它列为已知缺口，三轮令牌整理都没处理。
   迁移时**不要照抄**那套 `whitespace-nowrap` 的断行处理，重新做一次响应式。

3. **锚点导航与多页结构的张力。** 品牌站 `SiteHeader` 是全站共用的，
   锚点只在首页有意义。统一写成绝对形式 `/#philosophy`，避免内页失效。

4. **Prismic 的 Link 字段能否填纯锚点** 需要在实际建模时验一次。
   若 web link 校验拒绝 `/#philosophy`，`settings.primary_nav` 就要从 Link 字段
   改成 Group（`label` Text + `anchor` Text），届时 `SiteHeader` 一并调整。

5. **`--marketing-*` 的文字合规档要回上游补**（§3.2）。
   在补齐之前，品牌站用 `--brand-deep` 顶着，不阻塞。

6. **`pnpm build:next` 目前必然失败，与本方案无关。** Prismic 仓库 `daylily` 刚绑定、
   自定义类型还没 push，link resolver 拿不到任何类型，`/news/[uid]` 收集页面数据时报
   `[Link resolver error] Unknown type`。已用 `git stash` 验证过：不带任何本方案的改动，
   失败完全一样。第 4 步 `npx prismic push` 之后自然解决。
   附带修正：`CLAUDE.md` 说「`pnpm build:next` 不需要 Prismic 连接也能验证类型与静态导出约束」
   —— 这句目前不成立，它确实会外发请求。第 4 步之后再复核这句是否要改。

7. **`pnpm lint` 此前一直是红的**（已修，2026-09-12）。自 `95546bf` 挂入 submodule 起，
   ESLint 就在 lint `uiux/` 里的原型 JS —— 包括一份 407KB 的 vendored `tailwind.min.js`，
   22 个 error + 1560 个 warning。只读 submodule 不该由本仓库的规则评判，也改不了；
   已在 `eslint.config.mjs` 的 `globalIgnores` 里排除 `uiux/**` 与 `req-specs/**`。

8. **submodule 只拉一级。** `tokens:check` 依赖 `uiux/` 已 checkout；
   同步只用 `git submodule sync` 和 `git submodule update --init`，**禁止 `--recursive`**。
   `uiux` 内嵌套的 `req-specs/` 保持未初始化是预期状态。
