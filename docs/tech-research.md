# Brand Site × Prismic 技术路线调研

> 调研时间：2026-08-22。所有版本号均通过 `npm view` 实测，非记忆值。
>
> **最终方案见第 12 节「已锁定方案」** —— 第 0~11 节是调研过程与备选对比，第 12 节才是要落地的东西。

## 0. 结论先行

**推荐路线：Next.js 16（App Router）+ React 19 + `@prismicio/client` v7 + `@prismicio/next` v2 + Prismic CLI / Type Builder，构建期全量预渲染（SSG），Webhook 触发按需 revalidate。**

理由：
1. Prismic 官方一等支持的框架只有三个 —— Next.js / Nuxt / SvelteKit，Astro **没有**官方文档页（`prismic.io/docs/astro` 返回 404）也没有官方 adapter。
2. Next.js 的 App Router 默认就是构建期静态渲染（`generateStaticParams` + `cache: "force-cache"`），天然满足"编译时生成前端内容"的要求。
3. 只有 Next 这条线同时保住了 **content preview / draft mode**（品牌站的市场同事一定会要"发布前先看效果"）。

---

## 1. Prismic 生态现状（2026-08，有一个重要变化必须知道）

### 1.1 Slice Machine 已经不是官方推荐方式了

2026-06-08 Prismic 上线了新的 CLI，官方博客明确说：

- Slice Machine 不再是推荐的构建方式，**后续所有新功能只进 CLI + 新 Type Builder，不再进 Slice Machine**；
- 但 Slice Machine 仍然可用，**没有硬性下线日期**；
- 迁移后配置文件从 `slicemachine.config.json` 变成 `prismic.config.json`；
- TypeScript 类型生成、Slice Simulator 在新方案里都保留。

新 CLI 明确是**面向 AI Agent 设计的**（官方原话覆盖 Claude Code / Cursor / Codex / ChatGPT），还提供官方 skill：

```sh
npx skills add --global --yes prismicio/skills
```

> 对我们的意义：本项目直接走新 CLI + Type Builder，**不要**再引入 `slice-machine-ui` / `@slicemachine/adapter-next`，否则一上手就是遗留方案。

### 1.2 CLI 命令面

| 命令 | 作用 |
|---|---|
| `prismic init` | 在项目中安装并配置 Prismic（client、preview 路由、revalidate 路由） |
| `prismic pull` | 从 Prismic 拉模型到本地，生成 TS 类型 + 组件骨架（Prismic 为准） |
| `prismic push` | 把本地模型推到 Prismic（本地为准） |
| `prismic gen` | 生成 TypeScript 类型 |
| `prismic repo` / `locale` / `preview` / `token` / `webhook` | 仓库、语言、预览、token、webhook 管理 |
| `prismic docs` | 在终端查官方文档 |

### 1.3 实测版本（2026-08-22）

| 包 | 版本 | 备注 |
|---|---|---|
| `prismic`（CLI） | 1.16.0 | 2026-08-17 更新，活跃 |
| `@prismicio/client` | 7.22.0 | 核心库，v7 已合并 helpers/types |
| `@prismicio/react` | 3.4.1 | peer: react ^18\|\|^19 |
| `@prismicio/next` | 2.3.0 | peer: **next ^13.4.5 \|\| ^14 \|\| ^15 \|\| ^16** |
| `@prismicio/svelte` | 2.2.1 | peer: svelte ^5 + kit ^2 |
| `@prismicio/vue` / `@nuxtjs/prismic` | v6 / v5 | 2026-01 大版本，client 改为 peer dep |
| `slice-machine-ui` | 2.21.5 | 遗留方案，不用 |
| `prismic-ts-codegen` | 0.1.30 | 官方标注 **experimental**，仅在非官方框架（如 Astro）里才需要 |

框架侧：`next` 16.3.2、`react` 19.2.8、`astro` 7.2.4、`@sveltejs/kit` 2.70.3。本机 Node v24.11.1 / npm 11.6.2 / pnpm 10.28.2。

---

## 2. 框架选型对比

| | Next.js 16 | Nuxt 4 | SvelteKit 2 | Astro 7 |
|---|---|---|---|---|
| Prismic 官方文档 | ✅ | ✅ | ✅ | ❌（404） |
| 官方 SDK | `@prismicio/next` + `/react` | `@nuxtjs/prismic` + `@prismicio/vue` | `@prismicio/svelte` | 仅裸 `@prismicio/client` |
| 新 CLI / Type Builder 支持 | ✅ | ✅ | ✅ | 未列入 |
| 类型生成 | CLI 官方生成 | CLI 官方生成 | CLI 官方生成 | 需自己上 `prismic-ts-codegen`（experimental） |
| Slice Simulator | 官方导出组件 | 自动 import | 官方导出组件 | 需自己实现 |
| Preview / Draft Mode | 官方开箱 | 官方开箱 | 官方开箱 | 只有社区教程 |
| 构建期出静态 | ✅ | ✅ | ✅ | ✅（最纯粹） |
| 首屏 JS 体积 | 中（RSC 已大幅改善） | 中 | 小 | 最小 |

**判断**：Astro 在"纯静态品牌站 + 最小 JS"这个维度确实最优，但代价是 **preview、类型生成、slice 组件骨架、slice simulator 全部要自己造和自己养**。品牌站的核心价值恰恰是"市场同事能自助改内容并预览"，把这套 DX 拆掉不划算。除非团队是 Vue 栈（那就选 Nuxt 4），否则 Next.js。

---

## 3. 关键决策：「编译时生成」的两种形态

这是最需要你拍板的一点。"构建期生成内容"有两个层次，成本差别很大。

### 方案 A：Next 静态预渲染 + 按需 revalidate（推荐）

产物是构建期就渲染好的 HTML，但仍跑在一个 Node/Edge runtime 上。

```
Prismic 发布 → webhook → POST /api/revalidate → revalidateTag("prismic") → 下次请求重新生成该页
```

- 客户端配置：`fetchOptions: { next: { tags: ["prismic"] }, cache: "force-cache" }` —— API 结果永久缓存，直到 `prismic` tag 被 revalidate。
- 内容更新到线上：**秒级**，不需要重新构建整站。
- `/api/preview` + `/api/exit-preview` + `<PrismicPreview>` → 完整的草稿预览。
- `next/image` 走服务端优化。
- 部署：Vercel / Cloudflare / 自建 Node 容器。

### 方案 B：`output: 'export'` 纯静态

产物是 `out/` 目录里的纯静态文件，可以丢到任意 CDN / OSS / Nginx，零运行时。

代价（Next 官方明确列为 static export 不兼容项）：

- ❌ **Draft Mode → 预览功能直接不可用**（只剩本地 slice simulator）
- ❌ ISR / 按需 revalidate → 每次改内容都要**全站重新构建**（webhook → CI → build → 发布，分钟级）
- ❌ `next/image` 默认 loader 的图片优化（只能 `unoptimized` 或自定义 loader）
- ❌ 非 GET 的 Route Handler、rewrites / redirects / headers、middleware、Server Actions

### 对比

| | A：预渲染 + revalidate | B：纯静态 export |
|---|---|---|
| 内容上线延迟 | 秒级 | 分钟级（整站重建） |
| 内容预览 | ✅ 完整 | ❌ |
| 图片优化 | ✅ 内置 | 需自建 loader |
| 部署形态 | 需 Node/Edge runtime | 任意静态托管 |
| 运维复杂度 | 低（Vercel）/ 中（自建） | 最低 |
| 适合 | 有市场同事频繁改内容 | 内容极少变、必须落静态托管 |

> 我的建议：**A**。除非有硬性约束必须落纯静态（比如只能放公司自己的 OSS/CDN、不允许有 Node 运行时），否则不要为了"纯静态"这三个字放弃预览能力。
>
> 折中方案存在：**主站走 A 部署在有 runtime 的环境，同时保留 `export` 能力做灾备/离线快照**，但两套模式的代码分叉（图片 loader、route handler）要提前设计好，不是免费的。

---

## 4. 内容建模与代码组织

Prismic 的建模范式是 **Page Type + Slice**：

- **Page Type**：一种页面（首页、About、新闻详情、Landing Page…），带 `uid`、SEO 字段（`meta_title` / `meta_description` / `meta_image`）和一个 **Slice Zone**。
- **Slice**：可复用的内容区块（Hero、Feature Grid、CTA、Logo Wall、Testimonial、Rich Text…）。市场同事在 Prismic 后台自由拖拽拼装页面 —— 这是品牌站最关键的能力。
- 每个 slice 在代码里对应 `src/slices/<SliceName>/index.tsx`，通过 `<SliceZone slices={page.data.slices} components={components} />` 分发。

工作流：模型文件存在本地仓库（`prismic.config.json` + 模型 JSON），`prismic push` 推上去给编辑用，`prismic pull` 拉回来并生成类型。**代码仓库是 source of truth**。

官方文档的核心代码形态（Next 16 typed routes 风格，说明文档已跟上 16）：

```ts
// src/prismicio.ts
import { createClient as baseCreateClient, type ClientConfig } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import prismicConfig from "../prismic.config.json";

export const repositoryName = prismicConfig.repositoryName;

export const createClient = (config: ClientConfig = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes: prismicConfig.routes,
    fetchOptions: { next: { tags: ["prismic"] }, cache: "force-cache" },
    ...config,
  });
  enableAutoPreviews({ client });
  return client;
};
```

```tsx
// src/app/[uid]/page.tsx
export default async function Page({ params }: PageProps<"/[uid]">) {
  const { uid } = await params;
  const page = await createClient().getByUID("page", uid);
  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateStaticParams() {
  const pages = await createClient().getAllByType("page");
  return pages.map((page) => ({ uid: page.uid }));
}
```

Webhook 注册：

```sh
npx prismic webhook create https://example.com/api/revalidate \
  --trigger documentsPublished --trigger documentsUnpublished
```

---

## 5. 图片与静态资源

- Prismic 图片走 **imgix**，URL 可直接挂参数做尺寸/格式/裁剪，`@prismicio/next` 提供 `<PrismicNextImage>` 桥接 `next/image`，`next.config` 里配 `images.remotePatterns` 放行 Prismic 图片域名。
- **国内访问需要单独评估**：即使内容在构建期烘进 HTML，图片在运行时仍然从 Prismic/imgix 的域名加载。如果目标受众在国内，两个可选动作：
  1. 构建期把图片下载到本地一起发布（彻底摆脱外域依赖，但失去 imgix 动态裁剪，需要自己在构建期生成多尺寸）；
  2. 自己套一层 CDN 回源 Prismic 图片域名（社区有讨论但不是官方支持路径）。
- 这一项建议在确定受众地域后再定，不要默认。

---

## 6. i18n

- Prismic 原生支持多 locale，路由做成 `app/[lang]/[uid]`，查询时把 `lang` 传给 Prismic，`generateStaticParams` 用 `lang: "*"` 一次性拿到所有语言的所有页面。
- **成本敏感点**：locale 是 Prismic 最贵的计费维度。Free = 2 locales，Starter（$10/月/repo）= 3 locales，语言数上到 8 个以上会跳到很高的档位。如果规划中就是中/英双语，Free 或 Starter 够用；如果要做 5+ 语言，先算钱。

## 7. 计费

- Free：1 user、2 locales、文档数无上限、API 调用额度宽松。
- Starter：约 $10/月/repo，3 users、3 locales。
- 再往上按 user / locale / 带宽阶梯涨。
- 品牌站典型形态（1 个 repo、2 语言、2-3 个编辑）落在 Free ~ Starter 区间。

---

## 8. 风险与坑

1. **Slice Machine 遗留信息污染**：网上（含 AI 生成内容）绝大多数 Prismic + Next 教程还是 Slice Machine 时代的，会让你装 `slice-machine-ui` 和 adapter。以 `npx prismic docs` / 官方新文档为准。
2. **`prismic init` 会改动项目结构**：它会写入 client、preview/revalidate 路由、`prismic.config.json`。建议**先把 Next 项目跑通并提交一次 commit**，再跑 `prismic init`，这样 diff 干净可审查。
3. **revalidate 只在部署后生效**：本地 dev 环境的 webhook 是打不通的，官方文档也强调这点。预览要靠 `prismic preview` 配置 dev 环境的 preview URL。
4. **build 期的 API 额度与构建时长**：页面数量大时 `generateStaticParams` + 每页一次查询会放大请求数。用 `getAllByType` 一次拉全量 + 在内存里分发，比每页单查更省。
5. **`prismic-ts-codegen` 是 experimental**：只有走 Astro 这类非官方框架才会依赖它，属于给自己找活。
6. **preview 需要 runtime**：这条决定了方案 A/B 的取舍，别到最后阶段才发现。

---

## 9. 建议的落地顺序

1. `create-next-app`（TypeScript + App Router + Tailwind）→ 首个 commit，确定基线。
2. `npx skills add --global --yes prismicio/skills`（让 Claude Code 拿到官方 CLI 用法）。
3. `npx prismic@latest login` → `npx prismic init --repo <repo>`。
4. 设计 Page Types 与 Slice 清单（品牌站起步：Home / About / Solutions / News 列表+详情 / Contact；Slice：Hero、FeatureGrid、LogoWall、Stats、Testimonial、RichText、CTA、Gallery）。
5. `prismic push` 推模型 → 后台填一份真实内容 → `prismic pull` 生成类型。
6. 实现 slice 组件 + 设计系统（token / 字体 / 间距）。
7. 接 SEO（metadata、sitemap、robots、OG 图）+ webhook revalidate + preview 路由。
8. 上 CI 与部署，联通 webhook，做一次端到端"改内容 → 上线"演练。

## 10. 建议的仓库结构

```
.
├── docs/                      # 本调研 + 内容模型说明 + 编辑手册
├── prismic.config.json        # Prismic 项目配置（repo、routes）
├── customtypes/               # Page Type 模型（CLI 管理）
├── src/
│   ├── app/
│   │   ├── [lang]/[uid]/page.tsx
│   │   ├── api/{preview,exit-preview,revalidate}/route.ts
│   │   └── slice-simulator/page.tsx
│   ├── slices/                # 每个 slice 一个目录
│   ├── components/            # 通用 UI（Header/Footer/…）
│   ├── lib/                   # i18n、SEO、工具
│   └── prismicio.ts           # Prismic client
└── next.config.ts
```

---

## 11. 待确认（已于 2026-08-22 确认，见第 12 节）

1. **框架**：Next.js（React）还是 Nuxt（Vue）？取决于团队栈。
2. **渲染/部署形态**：方案 A（有 runtime，保留预览与秒级更新）还是方案 B（纯静态 export）？
3. **语言**：中文单语 / 中英双语 / 更多？影响路由结构和 Prismic 计费。
4. **受众地域**：主要面向国内的话，图片外域依赖要在架构层面提前处理。

## 参考

- Prismic CLI 文档 https://prismic.io/docs/cli
- 官方博客：构建方式的变化（CLI 取代 Slice Machine）https://prismic.io/blog/how-building-with-prismic-is-changing
- Prismic × Next.js 指南 https://prismic.io/docs/nextjs
- Prismic Developer Experience 更新日志 https://prismic.io/updates/developer-experience
- Next.js Static Exports 限制 https://nextjs.org/docs/app/guides/static-exports
- Next.js 16 发布说明 https://nextjs.org/blog/next-16
- Prismic Billing https://prismic.io/docs/billing

---

## 12. 已锁定方案（2026-08-22 确认）

| 决策项 | 选定 |
|---|---|
| 框架 | **Next.js 16.3 + React 19 + TypeScript** |
| 渲染/部署 | **`output: 'export'` 纯静态**（方案 B） |
| 语言 | **仅中文单语** |
| 受众 | **主要国内** |

这四项组合下来，有 5 件事必须在架构层面处理好，否则会在中后期返工。

### 12.1 预览能力的替代方案：用 Release ref 构建预发站（关键）

纯静态放弃了 Next Draft Mode，但**不等于放弃预览**。Prismic 的 Release（发布批次）机制可以在构建期直接查询，`@prismicio/client@7.22.0` 里这是一等 API（已在本机实测 `Client.d.ts` 确认存在）：

- `ClientConfig.ref?: string | GetRef` —— 建 client 时就能指定 ref
- `client.getReleases()` / `getReleaseByLabel()` / `getReleaseByID()`
- `client.queryContentFromReleaseByLabel()` / `queryContentFromReleaseByID()` / `queryContentFromRef()`

**做法**：同一份代码，两条构建流水线。

```
生产站  build → ref = master（已发布内容）        → 正式域名
预发站  build → ref = 指定 Release 的 ref        → 内网/预发域名
```

市场同事在 Prismic 里把待上线内容放进一个 Release，触发预发构建，在预发域名上看**整站真实效果**，确认后在 Prismic 点发布 → 触发生产构建。体验上比 Draft Mode 慢（分钟级），但覆盖的是同一个需求，而且预发看到的就是最终产物，保真度反而更高。

注意：查询非 master ref **需要一个允许访问其他 ref 的 access token**（Prismic 后台 Settings → API & Security 创建），这个 token 只放在 CI secrets 里，不进仓库。

### 12.2 `prismic init` 生成的路由必须删掉

`prismic init` 会自动创建 `/api/preview`、`/api/exit-preview`、`/api/revalidate` 三个 Route Handler。这些在 `output: 'export'` 下**会直接让 build 失败**（Next 官方明确列 Draft Mode、非 GET Route Handler、ISR 为 static export 不兼容项）。

处理顺序建议：
1. 先 `create-next-app` 跑通 + commit（干净基线）
2. `npx prismic init` + commit（这样它改了什么一目了然）
3. 删掉三个 api 路由、移除 `<PrismicPreview>`、去掉 `enableAutoPreviews()`，改 `next.config.ts` 加 `output: 'export'` + commit
4. `/slice-simulator` 页面**保留** —— 它只在 dev 下用，开发单个 slice 时有价值，不影响 export 产物（或用环境变量在 build 时排除）

### 12.3 内容更新流水线：webhook → CI 全站重建

```sh
npx prismic webhook create <CI 触发地址> \
  --trigger documentsPublished --trigger documentsUnpublished
```

- CI 侧：GitHub Actions `repository_dispatch`，或云厂商的构建触发器。
- **必须做防抖**：编辑一次发布可能连发多个 webhook，要么 CI 侧设并发组（`concurrency: group` + `cancel-in-progress`），要么加个几十秒的聚合窗口，否则一次批量发布会打出十几个构建。
- 构建产物同步到 OSS/COS，然后**刷 CDN 缓存**（这一步容易漏，漏了就是"发布了但线上没变"）。
- HTML 设短缓存 / no-cache，`/_next/static/*` 带 hash 可设长缓存 —— 这套 header 策略要在 CDN 上配，不是 Next 能管的（`headers` 配置在 export 下无效）。

### 12.4 图片本地化（国内受众的核心动作）

Prismic 图片跑在 imgix 上，域名在海外。内容虽然烘进了 HTML，图片仍是运行时外域请求 —— 国内首屏会被这个拖死。必须在构建期把图片拉到本地一起发布。

两个可行路径：

**路径 1：`next-image-export-optimizer`（实测 v1.20.1，2025-12 最后更新）**
支持远程图片：在根目录放 `remoteOptimizedImages.js` 导出 URL 数组，**支持返回 Promise** —— 正好可以在里面查 Prismic 拿到全站图片 URL。构建期下载 + 本地转码，配 `ExportedImage` 组件替代 `next/image`。
- 优点：开箱，代码量小
- 缺点：quality 只能全局一个值；三方维护（半年多没更新）；绑定它的组件

**路径 2：自建 prebuild 脚本（推荐）**
构建前跑一个脚本：查询全站文档 → 收集所有图片字段 → 用 **imgix 参数让 Prismic 服务端直接出图**（`?w=640&fm=webp&q=80`）→ 按 N 个宽度下载到 `public/_img/` → 产出 manifest.json → 一个 `<BrandImage>` 组件读 manifest 渲染 `<img srcset sizes>`。
- 优点：转码在 imgix 侧完成，本地不需要 sharp、构建快；每张图能单独控质量/裁剪；零三方依赖；产物完全自持
- 成本：约 150 行脚本 + 一个组件
- 品牌站图片总量通常在几十到几百张这个量级，这个方案完全 hold 得住

同理，**字体也要本地化**（不要挂 Google Fonts），用 `next/font/local`。

### 12.5 静态托管的具体配置

- `next.config.ts`：`output: 'export'`、`trailingSlash: true`、`images: { unoptimized: true }`（图片走 12.4 的自建管线）
- `trailingSlash: true` 让产物是 `out/about/index.html` 而不是 `out/about.html`，映射到 OSS/COS/Nginx 的目录默认索引更干净，能避免一类 404。
- OSS/COS 要配默认首页 `index.html` 和默认 404 页（Next export 会生成 `out/404.html`）。
- **域名需要 ICP 备案**才能在国内 CDN 上正常服务 —— 这是流程性前置项，周期以周计，建议现在就并行推进，别等到要上线才发现卡在这里。

### 12.6 单语但保留可扩展性

不引入 `[lang]` 路由层级，但：
- Prismic 侧的 locale ID 不要硬编码散落各处，收进 `src/lib/i18n.ts` 一个常量
- 所有 Prismic 查询统一走一层封装（`src/lib/content.ts`），未来加语言时只改封装层和路由，不用全局翻
- 文案不做 i18n 抽象（单语情况下那是过度设计），但 UI 上写死的中文字符串集中放在一个 `src/lib/copy.ts`，将来好办

### 12.7 这个组合还剩两个无法用技术手段消除的点

1. **内容上线延迟是分钟级**，不是秒级。市场同事改个错别字要等一次构建。这是纯静态的固有代价，接受它。
2. **Prismic 编辑后台本身是海外服务**，国内同事登录后台编辑内容的体验会偏慢（与渲染模式无关，换任何前端方案都一样）。如果这一点是硬伤，那要重新评估 CMS 选型本身，而不是调整前端路线。

### 12.8 下一步执行清单

1. `create-next-app`（TS + App Router + Tailwind）→ commit 基线
2. `npx skills add --global --yes prismicio/skills`
3. `npx prismic login` → `npx prismic init --repo <repo>`  → commit
4. 改造成 static export 形态（删 api 路由、加 `output: 'export'`）→ commit
5. 定 Page Types 与 Slice 清单 → `prismic push` → 后台填真实内容 → `prismic pull` 生成类型
6. 实现设计系统 + slice 组件
7. 图片本地化管线（12.4 路径 2）+ 本地字体
8. SEO（metadata / sitemap.xml / robots.txt / OG 图）
9. CI：生产流水线（master ref）+ 预发流水线（Release ref）+ webhook + CDN 刷新
10. 端到端演练：Prismic 建 Release → 预发站验收 → 发布 → 生产站更新
