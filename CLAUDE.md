@AGENTS.md

# 本仓库的约束

品牌官网：Next.js 16 App Router + `output: 'export'` 纯静态导出 + Prismic CMS，
中文单语，面向国内受众。决策依据见 `docs/tech-research.md` 第 12 节。

改动这个仓库前，先知道下面这些边界 —— 它们不是风格偏好，越过去会直接坏掉。

## 纯静态导出的硬边界

`output: 'export'` 下这些**不可用**，Next 会让构建失败：

- Draft Mode、ISR / `revalidate`、`revalidateTag`
- 依赖 `Request` 的 Route Handler（非 GET、读 cookie / header / query）
- `cookies()`、`headers()`
- `rewrites` / `redirects` / `headers` 配置、Proxy（middleware）
- Server Actions、Intercepting Routes
- `next/image` 默认 loader

推论：

- **动态路由必须有 `generateStaticParams()`**，否则构建失败。
- **metadata route（`sitemap.ts` / `robots.ts`）必须显式 `export const dynamic = "force-static"`**。
- 需要「请求期」行为时，不要试图绕过 —— 那说明该功能不属于这条技术路线，
  先回到 `docs/tech-research.md` 重新评估。

## slice 组件必须保持「同构」

`src/app/slice-simulator/page.tsx` 是 client component，它 import `@/slices` 的
`components` 映射。这意味着**所有 slice 组件都会同时出现在 server 树和 client 树里**。

所以 slice 组件：

- **不能是 async**，不能在内部取数（`createClient()`、`fs`、任何 server-only API）。
  数据一律由 page 取好后经 `context` 或直接在 page 层组装。
- 只能用同构的 API。`PrismicImage` 是同构的（静态 JSON import + 纯函数），可以放心用。

## 内容模型只能用 CLI 改

Prismic 官方 agent skill 的硬约束：**绝不手改** `customtypes/**/index.json`、
`src/slices/*/model.json`、`prismicio-types.d.ts`。一律走 `npx prismic ...`：

```sh
npx prismic type create / field add / slice create / slice connect / gen types / push
npx prismic --help          # 不要猜命令语法
npx prismic docs list       # 官方文档可离线查
```

例外：`prismic.config.json` 的 `routes` 官方文档明确允许直接编辑（用于校准路由路径）。

两个易错点：

- **slice 变体之间不继承字段**，每个变体都要独立声明。
- **新增 page 类型要同步三处**：`prismic.config.json` 的 routes、`src/app/` 路由目录、
  该路由的 `generateStaticParams`。

## 图片

- 渲染 Prismic 图片一律用 `<PrismicImage>`。不要直接写 `<img>`，也不要用 `next/image`。
- 图片必须经 `pnpm images` 本地化后才随站点发布。**任何让图片在运行时回到
  Prismic / imgix 域名的改动都是错的** —— 那是本项目要消除的跨境请求。
- 改动 `src/lib/prismic-image.ts` 时注意它被两侧共用（构建脚本 + 组件），
  必须保持纯粹：不依赖 React、不依赖 node 内置模块。

## 样式

- 只用语义 token：`text-ink` / `text-ink-muted` / `bg-canvas` / `bg-surface` /
  `border-line` / `text-brand-600` / `py-section` / `max-w-content` / `rounded-card`。
  不要写字面色值。token 定义在 `src/app/globals.css` 的 `@theme` 里。
- **不要拼动态 class 名**（`lg:grid-cols-${n}`）。Tailwind 靠扫描源码收集 class，
  拼出来的不会被生成。用完整 class 字符串查表。
- 站点承诺单一亮色外观，不做 dark mode。
- 不加载中文 webfont（体积以 MB 计）。需要品牌字型时用 `next/font/local` 加载
  **子集化**后的字体，且只用于大标题。
- 交互优先用原生 `<details>` 等无需 client component 的方案。
  注意准确的说法：这样做省下的是**增量** JS，不是把总量压到 0 ——
  App Router 本身就有约 200KB(gzip) 的 React 运行时基线（实测见 README）。
  刻意维持的是「不新增 client 组件」，本项目自身只有 slice 模拟器一个 client 边界。

## 富文本

排版规则集中在 `src/components/RichText.tsx` 的 serializer。不要在各 slice 里散写
`[&_p]:mt-4` 这类 selector hack；确实需要局部覆盖时，传 `components` 参数合并。

## 验证

改完至少跑：

```sh
pnpm typecheck && pnpm lint
pnpm build:next     # 不需要 Prismic 连接也能验证类型与静态导出约束
pnpm build          # 完整构建（需要 Prismic 连接）
```
