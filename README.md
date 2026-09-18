# Brand Site

品牌官网前端。内容在 [Prismic](https://prismic.io) 里编辑，**构建期**取回并渲染成纯静态站点。

技术路线与取舍的完整论证见 [`docs/tech-research.md`](docs/tech-research.md)（第 12 节是落地依据）。一句话概括：

> Next.js 16 App Router + `output: 'export'` 纯静态导出 + Prismic CLI / Type Builder，
> 中文单语，面向国内受众，图片在构建期本地化。

## 快速开始

```sh
pnpm install
cp .env.example .env.local     # 按需填值
pnpm dev
```

首次运行需要先连接 Prismic —— 见下一节，否则页面会抛出带操作步骤的错误。

## 连接 Prismic

本仓库已包含完整的内容模型（`customtypes/`、`src/slices/*/model.json`），但还没有绑定具体仓库。

```sh
# 1. 登录（会打开浏览器）
npx prismic login

# 2. 创建仓库，主语言设为简体中文
npx prismic repo create <仓库名> --lang zh-cn

# 3. 把仓库名写进配置
#    编辑 prismic.config.json，把 repositoryName 从 PLACEHOLDER-REPO 改成 <仓库名>

# 4. 推送本地内容模型到 Prismic
npx prismic status        # 先看清将要推送什么
npx prismic push

# 5. 在 Prismic 后台创建并发布内容
#    必须先建一篇 Settings（单例）—— 导航、页脚、备案号都取自它，缺了会构建失败
#    再建 Homepage（单例）、News Index（单例），以及需要的 Page / News Post
#    还必须建一篇 Belief Index（单例），以及至少一篇 Belief —— 零篇 Belief 会让
#    /beliefs/:uid 的 generateStaticParams 返回空数组，静态导出直接失败
```

之后注册预览与模拟器地址：

```sh
npx prismic preview set-simulator http://localhost:3000    # 本地开发
npx prismic preview set-simulator https://<线上域名>         # 部署后
```

## 日常开发

```sh
pnpm dev          # 开发服务器
pnpm images       # 本地化 Prismic 图片到 public/_img（构建前置步骤）
pnpm build        # = pnpm images && next build，产物在 out/
pnpm build:next   # 只跑 next build（跳过图片本地化，调试用）
pnpm preview      # 起个静态服务器预览 out/ 产物
pnpm typecheck
pnpm lint
pnpm tokens:sync    # 从 uiux 重新生成设计令牌
pnpm tokens:check   # 令牌是否与 uiux 漂移（CI 用）
pnpm classes:check  # 拿真实编译产物核对每个 className（需先跑 build:next）
```

## 工作流程

**先记住一件事：这是纯静态站。** 内容存在 Prismic，但页面是**构建期**烘出来的
——在 Prismic 后台点「发布」，线上不会自己变。任何内容改动都要重新构建并部署。

> ⚠️ **CI 目前没有接。** 本文档「Webhook」一节写了接法，但仓库里没有 `.github/`
> 或任何流水线配置。在接上之前，每次内容更新都要有人手动跑 `pnpm build` 再同步
> `out/`。这是当前最该补的一环。

改动分五类，路径完全不同：

| 你要做的事 | 动代码吗 | 在哪做 |
| --- | --- | --- |
| 改文案、换图、调导航、改备案号 | 否 | Prismic 后台 |
| 新增一个内容页（`/pricing`、`/faq`…） | 否 | Prismic 后台 |
| 新增一种版块（slice） | 是 | 本仓库 + CLI |
| 新增一种页面类型 | 是 | 本仓库 + CLI，**三处同步** |
| 改颜色 / 字号 / 圆角 | 是，但改的是 **uiux** | `uiux` 仓库 + `pnpm tokens:sync` |

### A. 改内容（不动代码）

1. Prismic 后台改 `Homepage` / `Page` / `Settings`，点发布
2. 回到本仓库跑 `pnpm build`
3. 把 `out/` 同步到服务器

发布后 CDN 有几十秒到几分钟的传播延迟，**构建前先确认拿到的是新 ref**，
否则会用旧内容烘出一份产物却以为没生效（这个坑踩过，见
`docs/landing-migration.md` §4B）。

### B. 新增一个内容页（不动代码）

1. Prismic 后台 → **Page** → 新建文档
2. 填 **UID**，比如 `pricing` —— UID 直接决定网址 `/pricing/`
3. 用 slice 拼版面（现有 11 种，见下）
4. 发布
5. 要进导航：`Settings` → 主导航 / 页脚导航 加一条，链接填 `/pricing`
6. 重新构建部署

UID 取值要避开已被静态路由占用的名字：**`news`**、**`changelog`**、**`beliefs`**、
**`slice-simulator`**。撞上了产物路径会冲突。

### C. 新增一种版块（slice）—— 要动代码

```sh
npx prismic slice create "Pricing Table" --id pricing_table
npx prismic field add rich-text heading --to-slice pricing_table --allow heading2 --single --label "标题"
# … 其余字段
npx prismic slice connect pricing_table --to page      # 接到哪些类型
npx prismic slice connect pricing_table --to homepage
npx prismic gen types && npx prismic gen slice-index
```

然后写 `src/slices/PricingTable/index.tsx`（CLI 生成的是占位组件），
最后 `git commit` + `npx prismic push`。

注意：**`prismic push` 会拒绝有未提交改动的模型文件** —— 先 commit 再 push。
这是 CLI 的安全检查，不是 bug。

### D. 新增一种页面类型 —— 三处必须同步

比如要一个 `/cases/:uid` 的案例页：

1. `npx prismic type create "Case" --format page` + 加字段 + `slice connect`
2. `prismic.config.json` 的 `routes` 加 `{ "type": "case", "path": "/cases/:uid" }`
3. `src/app/cases/[uid]/page.tsx`，**必须写 `generateStaticParams()`**

漏掉第 3 步构建直接失败；漏掉第 2 步链接解析不出 URL。

### E. 改设计令牌

颜色、字号、圆角、阴影的真相在 `uiux/prototypes/daylily-daily/themes/tokens.css`。
**不要在本仓库改**：

```sh
# 1. 在 uiux 仓库改 tokens.css
# 2. 回到本仓库同步 submodule
git submodule update --remote uiux     # 只一级，禁止 --recursive
pnpm tokens:sync                       # 重新生成 src/app/tokens.generated.css
```

`pnpm tokens:check` 会在两边不一致时失败 —— 这是防止两个仓库再次各活各的机制。

### 现有的 11 种 slice

`hero`(2 变体) · `rich_text` · `feature_grid`(3 变体) · `media_cards` ·
`callout` · `image_text`(2 变体) · `stats` · `logo_wall` · `testimonial` ·
`cta_banner`(2 变体) · `faq`

拼一个落地页大致是：`hero` → `feature_grid/card` → `media_cards` → `callout`
→ `media_cards` → `image_text` → `feature_grid/quote` → `cta_banner/light`。
首页就是这么拼的，可以直接去 Prismic 后台照着看。

### 本地看真实页面

两种方式，**都不需要部署，也不会影响线上**：

```sh
pnpm dev        # :3000 —— 开发服务器，改代码热更新
pnpm build:next && pnpm preview   # :4000 —— 预览真实静态产物
```

区别要弄清楚：

| | `pnpm dev` | `pnpm preview` |
| --- | --- | --- |
| 端口 | 3000 | 4000（两者可同时开） |
| 内容 | **每次请求实时取 Prismic** | 构建那一刻烘死的 |
| 改代码 | 热更新 | 要重新 `build:next` |
| 改内容 | 刷新页面就能看到（发布后等 CDN） | 要重新 `build:next` |
| 逼真度 | 有 dev 运行时，非最终产物 | **就是要部署上去的那份** |

**改内容、调版面时用 `dev`**——在 Prismic 点发布，等 CDN 传播（几十秒到几分钟），
刷新页面就看到了，完全不用构建。

**上线前用 `preview`**——它服务的是 `out/` 目录，和部署到服务器的字节完全一致。
静态导出的约束（动态路由、trailingSlash、404 页）只有在这里才会暴露出来。

两者都只读 Prismic，**不会写任何东西**，也不会碰线上站点。

### 改完必须跑的验证

```sh
pnpm tokens:check     # 令牌是否与 uiux 漂移
pnpm typecheck && pnpm lint
pnpm build:next       # 需要 Prismic 连接
pnpm classes:check    # 依赖上一步产出的 CSS
```

`classes:check` 不能省 —— **无效的 Tailwind 类是静默忽略的**，不报错、不警告，
页面只是少了那个样式，`typecheck` 和 `lint` 一个都拦不住。

## 内容建模

**模型的唯一修改方式是 Prismic CLI。** 不要手改 `customtypes/**/index.json` 或
`src/slices/*/model.json` —— 这是 Prismic 官方 agent skill 的硬约束，手改会让本地模型
与 CLI 的内部状态不一致。

```sh
npx prismic type create "Landing Page" --format page
npx prismic field add rich-text title --to-type landing_page --allow heading1 --single
npx prismic slice create "Pricing Table" --id pricing_table
npx prismic slice connect pricing_table --to page
npx prismic gen types                 # 重新生成 prismicio-types.d.ts
npx prismic push                      # 推到 Prismic
```

现有模型是怎么建出来的，见 [`scripts/bootstrap-content-model.sh`](scripts/bootstrap-content-model.sh)。

页面类型：`homepage` `/` · `page` `/:uid` · `news_index` `/news` ·
`news_post` `/news/:uid` · `belief_index` `/beliefs` · `belief` `/beliefs/:uid` ·
`release_index` `/changelog` · `release_note`（无独立 URL）· `settings`。

主导航约定（`settings.primary_nav`）：首页 `/`、主张 `/beliefs`、更新日志 `/changelog`。
不要填落地页锚点（`/#philosophy` 等）。页脚导航可挂新闻 `/news`，不要再挂首页。

注意两点：

- **变体之间不继承字段。** 给 slice 加变体时，每个变体的字段都要独立声明一遍。
- **新增 page 类型要同步三处**：`prismic.config.json` 的 `routes`、`src/app/` 下的
  路由目录、以及该路由的 `generateStaticParams`（静态导出下动态路由缺了它会构建失败）。

## 图片

Prismic 图片托管在 imgix（海外域名）。内容虽然在构建期已烘进 HTML，图片仍是运行时的
跨境请求 —— 国内首屏会被拖死。所以有 `pnpm images` 这一步：

1. 遍历仓库全部文档，按「形状」识别出所有图片字段；
2. 用 imgix 参数让 Prismic **服务端**按宽度阶梯出图（本地不需要 sharp）；
3. 下载到 `public/_img/`，随站点一起发布；
4. 产出 `src/generated/image-manifest.json`，`<PrismicImage>` 据此拼 `srcset`。

`public/_img/` 不入版本库；manifest 入库（像 lockfile 一样，是内容派生的构建输入）。
脚本幂等，已存在的文件会跳过，CI 里建议把 `public/_img/` 做成缓存目录。

渲染图片一律用 `<PrismicImage>`，不要直接写 `<img>` 或 `next/image`。

## 构建与部署

产物是 `out/` 下的纯静态文件，同步到 OSS/COS + CDN 即可，不需要 Node 运行时。

必须由 CI 注入的环境变量：

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 站点根 URL。构建期烘进 OG 图 / canonical / sitemap，每个环境都要传对 |
| `PRISMIC_ACCESS_TOKEN` | 仓库 API 设为 private 时必需；预发构建查询非 master ref 也必需 |
| `PRISMIC_RELEASE_LABEL` | **仅预发构建**：要构建的 Release 名称 |

托管在自建 Nginx，配置示例见 [`deploy/nginx.conf.example`](deploy/nginx.conf.example)，
其中已处理好这几件容易漏的事：

- **`try_files` 与 `trailingSlash: true` 配对** —— 产物是 `about/index.html`，
  改 trailingSlash 就得同步改 Nginx。
- **缓存分层** —— HTML 必须 `no-cache` 回源校验，否则发布后用户看到旧页面；
  `/_next/static/` 可 immutable；`/_img/` 给 30 天。
  `next.config` 的 `headers` 在静态导出下无效，这套策略只能在 Nginx 侧配。
- **404 指向 `out/404.html`**（Next 静态导出会生成它）。
- **只压文本类**，webp/jpg 再压是纯 CPU 浪费。

部署本身就是把 `out/` 同步过去（`rsync -av --delete out/ user@host:/var/www/brand/out/`），
不需要 Node 运行时。

另外，域名需要 **ICP 备案** 才能在国内 CDN 正常服务，周期以周计，建议尽早并行推进。

## 产物体积（实测）

用 fixture 数据构建首页（含全部 9 个 slice）的实测结果：

| | gzip |
| --- | --- |
| HTML | 7 KB |
| CSS | 5 KB |
| JS | 199 KB |

JS 那 199KB 基本是 **App Router 的固有基线**（React 运行时 + `next/link`），
不是业务代码 —— 本项目自身只有 `/slice-simulator` 一个 client component 边界。
站内交互（移动端菜单、FAQ 折叠）都用原生 `<details>`，不新增 client 组件。

如果这个基线不可接受，那是选 Astro 而非 Next 的理由，而不是在 Next 里继续抠 ——
两者的取舍见 `docs/tech-research.md` 第 2 节。

## 预览工作流

纯静态导出下 Next 的 Draft Mode 不可用（官方明确不兼容）。预览能力由两条路径覆盖：

**1. 逐 slice 实时预览** —— Prismic Page Builder 里编辑 slice 时实时看到真实渲染效果。
由 `/slice-simulator` 路由驱动，已改造成客户端读取 URL 参数，纯静态站也能工作。

**2. 整站预发预览** —— 发布前看全站真实效果：

```
编辑在 Prismic 建一个 Release，把待上线内容放进去
        ↓
用 PRISMIC_RELEASE_LABEL=<Release 名> 触发预发构建
        ↓
预发域名上验收（页面顶部有醒目的预发标记，且 robots 禁止收录）
        ↓
在 Prismic 点发布 → 触发生产构建
```

代价是分钟级而非秒级。这是纯静态的固有取舍，见 `docs/tech-research.md` 12.7。

## Webhook

> **现状：未接。** 仓库里没有 `.github/` 或任何流水线配置，本节描述的是**接法**，
> 不是已经在跑的东西。在接上之前，内容发布后要手动构建部署（见「工作流程」A）。

Prismic webhook 只能 POST 到一个 URL，**不能自定义请求头**，所以无法直接触发需要
`Authorization` 头的 GitHub `repository_dispatch` —— 中间需要一个中转（云函数 / Worker），
或者直接用接受无认证 POST 的国内 CI（云效、CODING 等）。

```sh
# 内容发布 → 生产构建
npx prismic webhook create <CI 触发地址> \
  --trigger documentsPublished --trigger documentsUnpublished

# Release 变动 → 预发构建
npx prismic webhook create <预发 CI 触发地址> \
  --trigger releasesCreated --trigger releasesUpdated
```

CI 侧务必做**防抖**：一次批量发布会连发多个 webhook，不加并发组会打出十几个构建。

## 工作仓库 submodule（只拉一级）

`req-specs/` 与 `uiux/` 是独立工作仓库，以 **git submodule** 挂在本仓根目录。
`uiux` 自己还声明了嵌套的 `req-specs/`；本仓只消费顶层这两个挂载点，**不初始化嵌套子模块**。

新环境克隆后补全一级 submodule（不要加 `--recursive`）：

```sh
git submodule sync
git submodule update --init
```

日常同步到各自 `origin/main` 最新提交时，同样不要递归：

```sh
git submodule foreach '
  set -e
  git fetch origin --prune
  git checkout main
  git pull --ff-only origin main
'
```

`git submodule status` 里：一级 `req-specs` / `uiux` 应已检出；`uiux/req-specs` 前缀为 `-`（未初始化）是预期状态。若嵌套被误拉下来，在 `uiux/` 内执行 `git submodule deinit -f req-specs`。

`.gitmodules` 已为两个一级模块写了 `fetchRecurseSubmodules = false`，避免 `clone --recurse-submodules` 越界拉嵌套。

## 目录结构

```
docs/tech-research.md          技术路线调研与决策依据
prismic.config.json            Prismic 仓库名与路由解析规则
customtypes/                   页面类型模型（CLI 管理，勿手改）
prismicio-types.d.ts           由模型生成的 TS 类型（勿手改）
req-specs/                     需求规格工作仓库（git submodule，只读）
uiux/                          UI/UX 工作仓库（git submodule，只读；嵌套 req-specs 不检出）
scripts/
  bootstrap-content-model.sh   现有模型的建模过程记录
  localize-images.mts          构建期图片本地化
src/
  prismicio.ts                 Prismic client（含 Release ref 解析）
  app/                         路由：/ · /[uid] · /news · /news/[uid]
  slices/                      9 个 slice 组件（+ 模型，CLI 管理）
  components/                  通用 UI（PrismicImage / RichText / Button / …）
  lib/                         设计系统外的共享逻辑（settings / seo / 图片 / 格式化）
  generated/image-manifest.json  图片 manifest（由 pnpm images 产出）
```
