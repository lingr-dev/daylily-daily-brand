# 主张栏目 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给品牌站加上独立栏目「主张」（`/beliefs` 宫格目录 + `/beliefs/:uid` 详情），并把主导航改成首页 / 主张 / 更新日志，首页现有版式不动。

**Architecture:** 内容模型对称新闻：`belief_index` 单例承载栏目开头，`belief` 可重复文档进宫格与详情。Next 静态路由 `src/app/beliefs/` 构建期取数；导航仍读 `settings.primary_nav`，不改 Header/Footer 组件。slice 保持同构，不在 slice 内取数。

**Tech Stack:** Next.js 16 App Router（`output: 'export'`）· Prismic CLI / Type Builder · `@prismicio/client` · Tailwind v4 语义 token

## Global Constraints

- 内容模型只许 `npx prismic`，禁止手改 `customtypes/**/index.json` 与 `src/slices/*/model.json`。
- 先 `npx prismic push`，后 `pnpm build:next`。`routes` 声明的类型远端没有时，整站查询会被拒。
- `prismic push` 会拒绝有未提交改动的**模型文件**；模型变更必须先 commit 再 push。
- 动态路由 `generateStaticParams()` 不得返回空数组；至少发布一篇 `belief`，且必须有已发布的 `belief_index`。
- 不改 `src/app/page.tsx`、不改 `customtypes/homepage/`、不改 homepage 文档、不新增 `featured_beliefs` slice。
- 不改 `SiteHeader` / `SiteFooter` 接口；不加 client 组件；不做当前项高亮。
- 不删除 `footer_nav`。
- 只用语义 token；禁止拼接动态 class（`lg:grid-cols-${n}`）。
- slice 组件不能是 async，不能 `createClient()`。
- 本仓库没有组件测试运行器。每个任务的测试环是 `pnpm typecheck` / `pnpm lint`，整站验收再跑 `pnpm build:next` 与 `pnpm classes:check`。不要新增 vitest/jest。
- 文案口径以 `uiux/prototypes/daylily-daily/specs/brand-marketing-sot.md` 为准；不承诺推送/提醒必达。
- 工作仓库 submodule 只拉一级，禁止 `--recursive`。

**Spec:** `docs/superpowers/specs/2026-09-18-beliefs-ia-design.md`

## File map

| 路径 | 职责 |
| --- | --- |
| `customtypes/belief_index/index.json` | CLI 生成：主张索引单例 |
| `customtypes/belief/index.json` | CLI 生成：一篇主张 |
| `prismic.config.json` | route：`/beliefs`、`/beliefs/:uid` |
| `prismicio-types.d.ts` | `npx prismic gen types` |
| `scripts/bootstrap-content-model.sh` | 从零重建时能再现这两种类型 |
| `src/lib/beliefs.ts` | 取 `belief_index` / 全部 `belief`，带单例缺失时的操作说明 |
| `src/components/BeliefTile.tsx` | 宫格一格 |
| `src/app/beliefs/page.tsx` | 栏目页：slice + 宫格 |
| `src/app/beliefs/[uid]/page.tsx` | 详情 + `generateStaticParams` |
| `src/app/sitemap.ts` | 索引与每篇主张入 sitemap |
| `README.md` | 新类型、保留 UID、主导航约定 |

**不改：** `src/app/page.tsx` · `src/components/SiteHeader.tsx` · `src/components/SiteFooter.tsx` · 任意 slice 的 `model.json`（只 `slice connect`）

---

### Task 1: Prismic 内容模型

**Files:**
- Create (via CLI): `customtypes/belief_index/index.json`
- Create (via CLI): `customtypes/belief/index.json`
- Modify: `prismic.config.json`
- Modify: `scripts/bootstrap-content-model.sh`
- Modify (via CLI): `prismicio-types.d.ts`
- Delete if CLI 生成了脚手架: `src/app/belief_index/**`、`src/app/belief/**`（不要留 stub）

**Interfaces:**
- Consumes: 现有 shared slices（`hero` `rich_text` `feature_grid` `media_cards` `callout` `image_text` `cta_banner` `faq`）
- Produces: 类型 id `belief_index`、`belief`；route `/beliefs`、`/beliefs/:uid`；`Content.BeliefIndexDocument`、`Content.BeliefDocument`

- [ ] **Step 1: 确认 CLI 可用，且本地还没有这两种类型**

Run:

```sh
npx prismic --help
ls customtypes
```

Expected: `customtypes/` 里有 `homepage` `page` `news_index` `news_post` `release_index` `release_note` `settings`，**没有** `belief` / `belief_index`。若已经有，跳过 create，只补字段与 connect。

- [ ] **Step 2: 创建 `belief_index` 单例**

Run:

```sh
npx prismic type create "Belief Index" --format page --single --id belief_index
```

Expected: `customtypes/belief_index/index.json` 出现；`prismic.config.json` 多一条 route（路径多半是 `/belief_index`，下一步改掉）。

CLI 可能在 `src/app/belief_index/` 写下 stub `page.tsx`。有则删掉整个目录：路径是类型 id，取数也不带 `settings`。

```sh
rm -rf src/app/belief_index
```

- [ ] **Step 3: 创建 `belief` 并加字段**

Run:

```sh
npx prismic type create "Belief" --format page --id belief

npx prismic field add rich-text title --to-type belief --label "标题" --allow heading1 --single
npx prismic field add text excerpt --to-type belief --label "摘要" --placeholder "宫格与分享卡片上显示的一句话"
npx prismic field add image cover --to-type belief --label "封面图"
npx prismic field add date published_at --to-type belief --label "发布日期"
npx prismic field add select topic --to-type belief --label "主题" --option 人群 --option 意图 --option 取舍 --option 设计

npx prismic field reorder title --from-type belief --before slices
npx prismic field reorder excerpt --from-type belief --after title
npx prismic field reorder cover --from-type belief --after excerpt
npx prismic field reorder published_at --from-type belief --after cover
npx prismic field reorder topic --from-type belief --after published_at
```

不要给 `topic` 设 `--default-value`，未选主题必须能留空。

若 CLI 生成了 `src/app/belief/`（或 `src/app/belief/[uid]/`），删掉：

```sh
rm -rf src/app/belief
```

- [ ] **Step 4: 把 slice 接到两种新类型**

Run:

```sh
for s in hero rich_text cta_banner; do
  npx prismic slice connect "$s" --to belief_index
done

for s in hero rich_text feature_grid media_cards callout image_text cta_banner faq; do
  npx prismic slice connect "$s" --to belief
done
```

不要 connect `stats` `logo_wall` `testimonial`。

- [ ] **Step 5: 校准 `prismic.config.json` 的 routes**

把 CLI 自动写入的错误路径改成下面这一份完整数组（`page` 的 `/:uid` 必须留在最后，以免吞掉更具体的路径）。不要手改 customtypes JSON。

```json
{
  "repositoryName": "daylily",
  "routes": [
    { "type": "homepage", "path": "/" },
    { "type": "news_index", "path": "/news" },
    { "type": "news_post", "path": "/news/:uid" },
    { "type": "belief_index", "path": "/beliefs" },
    { "type": "belief", "path": "/beliefs/:uid" },
    { "type": "release_index", "path": "/changelog" },
    { "type": "page", "path": "/:uid" }
  ]
}
```

- [ ] **Step 6: 生成类型**

Run:

```sh
npx prismic gen types
```

Expected: `prismicio-types.d.ts` 出现 `BeliefIndexDocument`、`BeliefDocument`；`BeliefDocumentData` 含 `title` `excerpt` `cover` `published_at` `topic` `slices`。`AllDocumentTypes` 包含这两种。

- [ ] **Step 7: 把同样的命令写进 bootstrap 脚本**

Modify `scripts/bootstrap-content-model.sh`：

1. 文件头注释里「真实页面」那句，补上 `beliefs/`：

```
# 本仓库的真实页面是
# src/app/page.tsx、[uid]/、news/、changelog/、beliefs/ —— 从零重建后记得清理多余目录。
```

2. 在 `news_post` 字段 reorder 之后、`Release Index` 之前插入：

```sh
# 主张列表：单例，路由在 prismic.config.json 里手工校准为 /beliefs
p type create "Belief Index" --format page --single --id belief_index

# 一篇主张。路由校准为 /beliefs/:uid
p type create "Belief" --format page --id belief

p field add rich-text title --to-type belief --label "标题" --allow heading1 --single
p field add text excerpt --to-type belief --label "摘要" --placeholder "宫格与分享卡片上显示的一句话"
p field add image cover --to-type belief --label "封面图"
p field add date published_at --to-type belief --label "发布日期"
p field add select topic --to-type belief --label "主题" \
  --option 人群 --option 意图 --option 取舍 --option 设计
p field reorder title --from-type belief --before slices
p field reorder excerpt --from-type belief --after title
p field reorder cover --from-type belief --after excerpt
p field reorder published_at --from-type belief --after cover
p field reorder topic --from-type belief --after published_at
```

3. 在「新闻详情页」connect 循环之后追加：

```sh
# 主张列表页：与新闻列表页同一套
for s in hero rich_text cta_banner; do
  p slice connect "$s" --to belief_index
done

# 主张详情：比新闻宽，要能迁落地页那种章节
for s in hero rich_text feature_grid media_cards callout image_text cta_banner faq; do
  p slice connect "$s" --to belief
done
```

- [ ] **Step 8: typecheck**

Run: `pnpm typecheck`

Expected: PASS。本步还没有新页面，只是类型文件变了。

- [ ] **Step 9: Commit 模型**

```bash
git add customtypes/belief_index customtypes/belief prismic.config.json prismicio-types.d.ts scripts/bootstrap-content-model.sh
git status
git commit -m "$(cat <<'EOF'
feat: add belief_index and belief Prismic types

Give the brand site a first-class 主张 collection, routed to /beliefs, without touching the homepage model.
EOF
)"
```

不要把 CLI 误生成的 `src/app/belief*` stub 加进去。

---

### Task 2: 推送模型到 Prismic

**Files:** none（远端）

**Interfaces:**
- Consumes: Task 1 已 commit 的模型
- Produces: 远端仓库拥有 `belief_index` 与 `belief`，后续 `build:next` 的 link resolver 不会报 `Unknown type`

- [ ] **Step 1: 看将要推送什么**

Run:

```sh
npx prismic status
```

Expected: 列出 `belief_index`、`belief` 为本地新增/将推送。

- [ ] **Step 2: push**

工作树里可以有未提交的 **非模型** 文件；若 CLI 仍因脏工作树拒绝，先把无关改动 stash。**不要** `push --force` 到 git remote。

Run:

```sh
npx prismic push
```

Expected: 成功。若提示未登录：`npx prismic login` 后再 push。

- [ ] **Step 3: 在 Prismic 后台确认类型出现**

打开仓库 `daylily` 的自定义类型列表，应能看到 Belief Index（单例）与 Belief（可重复）。还不必建文档，建文档放在 Task 7。

没有 git commit（无代码 diff）。

---

### Task 3: `BeliefTile`

**Files:**
- Create: `src/components/BeliefTile.tsx`

**Interfaces:**
- Consumes: `PrismicImage`、`isFilled.image`、`formatDate`
- Produces: `BeliefTile` 组件，props 如下

```ts
{
  href: string;
  title: string;
  excerpt: string | null;
  cover: ImageField<never>;
  topic: string | null;
  publishedAt: string | null;
}
```

本仓库无组件测试运行器。本任务的失败环是：文件不存在时页面还引用不到（下一任务才引用）；本任务用 `pnpm typecheck && pnpm lint` 确认组件自身可编译。

- [ ] **Step 1: 写入组件**

Create `src/components/BeliefTile.tsx`:

```tsx
import Link from "next/link";
import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicImage } from "@/components/PrismicImage";
import { formatDate } from "@/lib/format";

/**
 * 主张索引宫格的一格。
 *
 * 和 NewsCard 分开：新闻是封面信息流，主张是口径目录。
 * 主题眉标才是格子的识别符；日期退到摘要下方，没有主题就不要假造一个。
 */
export function BeliefTile({
  href,
  title,
  excerpt,
  cover,
  topic,
  publishedAt,
}: {
  href: string;
  title: string;
  excerpt: string | null;
  cover: ImageField<never>;
  topic: string | null;
  publishedAt: string | null;
}) {
  const date = formatDate(publishedAt);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-sand bg-surface-container transition-colors hover:border-hair"
    >
      {isFilled.image(cover) && (
        <div className="bg-sand-wash">
          <PrismicImage
            field={cover}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
            className="h-auto w-full"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {topic && (
          <p className="text-caption font-medium text-brand-deep">{topic}</p>
        )}
        <h3
          className={
            topic
              ? "mt-2 text-lg font-semibold leading-snug text-content-primary transition-colors group-hover:text-brand-deep"
              : "text-lg font-semibold leading-snug text-content-primary transition-colors group-hover:text-brand-deep"
          }
        >
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-content-secondary">
            {excerpt}
          </p>
        )}
        {date && (
          <p className="mt-auto pt-4 text-caption text-content-muted">
            <time dateTime={publishedAt ?? undefined}>{date}</time>
          </p>
        )}
      </div>
    </Link>
  );
}
```

不要用 `NewsCard`。不要 `lg:grid-cols-${n}`（网格在页面上写死）。

- [ ] **Step 2: typecheck 与 lint**

Run: `pnpm typecheck && pnpm lint`

Expected: PASS。

- [ ] **Step 3: Commit**

```bash
git add src/components/BeliefTile.tsx
git commit -m "$(cat <<'EOF'
feat: add BeliefTile for the 主张 directory grid

Keep news cards and belief tiles as separate objects so the brand column does not look like another feed.
EOF
)"
```

---

### Task 4: 取数辅助 + `/beliefs` 索引页

**Files:**
- Create: `src/lib/beliefs.ts`
- Create: `src/app/beliefs/page.tsx`

**Interfaces:**
- Consumes: `Content.BeliefIndexDocument`、`Content.BeliefDocument`（Task 1）、`BeliefTile`（Task 3）、`getSettings`、`components` from `@/slices`
- Produces:
  - `getBeliefIndex(): Promise<Content.BeliefIndexDocument>`
  - `getBeliefs(): Promise<Content.BeliefDocument[]>`（按 `published_at` 倒序）

- [ ] **Step 1: 写入 `src/lib/beliefs.ts`**

```ts
import { type Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

/** 宫格按发布日期倒序 —— 排序在构建期完成，产物里就是最终顺序。 */
const orderings = [
  { field: "my.belief.published_at", direction: "desc" as const },
];

let cachedIndex: Promise<Content.BeliefIndexDocument> | undefined;

/**
 * 主张栏目单例。缺了这篇，/beliefs 构建失败。
 */
export function getBeliefIndex(): Promise<Content.BeliefIndexDocument> {
  cachedIndex ??= createClient()
    .getSingle("belief_index")
    .catch((error: unknown) => {
      throw new Error(
        [
          "读取 Prismic 的 belief_index 单例失败。",
          "",
          "需要先在 Prismic 后台创建并发布一篇 Belief Index 文档",
          "（这是单例类型，只会有一篇）。主张栏目的标题和引言都取自它。",
          "",
          `原始错误：${error instanceof Error ? error.message : String(error)}`,
        ].join("\n"),
      );
    });

  return cachedIndex;
}

export function getBeliefs(): Promise<Content.BeliefDocument[]> {
  return createClient().getAllByType("belief", { orderings });
}
```

- [ ] **Step 2: 写入 `src/app/beliefs/page.tsx`**

宫格 class 必须写完整字符串 `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`。有几篇渲染几格，不补空 `<li>`。

```tsx
import type { Metadata } from "next";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { BeliefTile } from "@/components/BeliefTile";
import { Container } from "@/components/Container";
import { getBeliefIndex, getBeliefs } from "@/lib/beliefs";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { components } from "@/slices";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBeliefIndex();

  return buildMetadata({
    data: page.data,
    fallbackTitle: "萱草主张",
    path: "/beliefs/",
  });
}

export default async function BeliefsIndexPage() {
  const [page, posts, settings] = await Promise.all([
    getBeliefIndex(),
    getBeliefs(),
    getSettings(),
  ]);

  return (
    <>
      <SliceZone
        slices={page.data.slices}
        components={components}
        context={{ settings }}
      />

      <Container className="py-section">
        {posts.length === 0 ? (
          <p className="text-content-secondary">暂无内容。</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <BeliefTile
                  href={`/beliefs/${post.uid}/`}
                  title={asText(post.data.title)}
                  excerpt={post.data.excerpt}
                  cover={post.data.cover}
                  topic={post.data.topic}
                  publishedAt={post.data.published_at}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
```

`topic` 若生成类型是 union（`"人群" | "意图" | "取舍" | "设计" | null`），可以直接传给 `string | null`。若 typecheck 报 SelectField 对象而不是 string，看 `prismicio-types.d.ts` 里 `topic` 的实际类型：Prismic Select 一般是 `SelectField<"人群" | …>`，即 `string | null`。不要写转换表。

- [ ] **Step 3: typecheck 与 lint**

Run: `pnpm typecheck && pnpm lint`

Expected: PASS。此时 `build:next` 仍可能因远端没有 `belief_index` 文档而失败，属正常，到 Task 7 再跑构建。

- [ ] **Step 4: Commit**

```bash
git add src/lib/beliefs.ts src/app/beliefs/page.tsx
git commit -m "$(cat <<'EOF'
feat: add /beliefs index as a 主张 directory

Render the collection as a three-column tile grid, not a news-style feed, and leave the homepage untouched.
EOF
)"
```

---

### Task 5: `/beliefs/[uid]` 详情页

**Files:**
- Create: `src/app/beliefs/[uid]/page.tsx`

**Interfaces:**
- Consumes: `getBeliefs()`（只用于 `generateStaticParams`）、`createClient().getByUID("belief", uid)`、`getSettings`
- Produces: 静态路径 `beliefs/<uid>/index.html`；返回链 `/beliefs/`

- [ ] **Step 1: 写入详情页**

Create `src/app/beliefs/[uid]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { asText, isFilled } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { Container } from "@/components/Container";
import { PrismicImage } from "@/components/PrismicImage";
import { getBeliefs } from "@/lib/beliefs";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function BeliefPage({
  params,
}: PageProps<"/beliefs/[uid]">) {
  const { uid } = await params;
  const [post, settings] = await Promise.all([
    createClient().getByUID("belief", uid),
    getSettings(),
  ]);

  return (
    <article>
      <Container className="py-section">
        <Link
          href="/beliefs/"
          className="text-sm text-content-secondary transition-colors hover:text-content-primary"
        >
          ← 返回萱草主张
        </Link>

        <header className="mt-8 max-w-3xl">
          {post.data.topic && (
            <p className="text-caption font-medium text-brand-deep">
              {post.data.topic}
            </p>
          )}
          <h1 className="mt-3 text-title-1 font-semibold text-content-primary">
            {asText(post.data.title)}
          </h1>
          {post.data.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-content-secondary">
              {post.data.excerpt}
            </p>
          )}
        </header>

        {isFilled.image(post.data.cover) && (
          <div className="mt-10 overflow-hidden rounded-card bg-sand-wash">
            <PrismicImage
              field={post.data.cover}
              sizes="(min-width: 1152px) 1152px, 100vw"
              priority
              className="h-auto w-full"
            />
          </div>
        )}
      </Container>

      <SliceZone
        slices={post.data.slices}
        components={components}
        context={{ settings }}
      />
    </article>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/beliefs/[uid]">): Promise<Metadata> {
  const { uid } = await params;
  const post = await createClient().getByUID("belief", uid);

  return buildMetadata({
    data: post.data,
    fallbackTitle: asText(post.data.title),
    path: `/beliefs/${uid}/`,
  });
}

export async function generateStaticParams() {
  const posts = await getBeliefs();

  return posts.map((post) => ({ uid: post.uid }));
}
```

`generateStaticParams` 必须存在。零篇 `belief` 时这里返回 `[]`，`pnpm build:next` 会失败 —— 这是规格里的运营约束，不要改成假 uid 占位。

- [ ] **Step 2: typecheck 与 lint**

Run: `pnpm typecheck && pnpm lint`

Expected: PASS。

- [ ] **Step 3: Commit**

```bash
git add src/app/beliefs/[uid]/page.tsx
git commit -m "$(cat <<'EOF'
feat: add /beliefs/[uid] belief article pages

Static-export each 主张 document with generateStaticParams, mirroring the news post route.
EOF
)"
```

---

### Task 6: sitemap 与 README

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: `getAllByType("belief")`（或 `getBeliefs()`；sitemap 不需要排序，直接 `getAllByType` 即可，避免和宫格抢同一份带 orderings 的语义）
- Produces: sitemap 含 `/beliefs/` 与每篇 `/beliefs/:uid/`

- [ ] **Step 1: 改 sitemap**

在 `src/app/sitemap.ts` 的 `Promise.all` 里增加 `beliefs` 查询，并在返回数组里插入索引与文章（放在 `/news/` 那条后面，changelog 前面）：

把

```ts
  const [pages, posts, releases] = await Promise.all([
    client.getAllByType("page"),
    client.getAllByType("news_post"),
    /* 与 /changelog 页面用的是同一条查询，force-cache 下不会多打一次请求。 */
    client.getAllByType("release_note"),
  ]);

  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/news/"), changeFrequency: "weekly", priority: 0.8 },
    {
      url: absolute("/changelog/"),
      lastModified: latestPublication(releases),
      changeFrequency: "weekly",
      priority: 0.8,
    },
```

替换为：

```ts
  const [pages, posts, beliefs, releases] = await Promise.all([
    client.getAllByType("page"),
    client.getAllByType("news_post"),
    client.getAllByType("belief"),
    /* 与 /changelog 页面用的是同一条查询，force-cache 下不会多打一次请求。 */
    client.getAllByType("release_note"),
  ]);

  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/news/"), changeFrequency: "weekly", priority: 0.8 },
    { url: absolute("/beliefs/"), changeFrequency: "weekly", priority: 0.8 },
    {
      url: absolute("/changelog/"),
      lastModified: latestPublication(releases),
      changeFrequency: "weekly",
      priority: 0.8,
    },
```

在 `...posts.map` 之后追加：

```ts
    ...beliefs.map((belief) => ({
      url: absolute(`/beliefs/${belief.uid}/`),
      lastModified: belief.last_publication_date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
```

预发构建的 `if (isReleaseBuild) return [];` 不要动。`export const dynamic = "force-static";` 不要删。

- [ ] **Step 2: 改 README**

三处：

1. 「连接 Prismic」第 5 步，在 News Index 那句后面补：还必须建一篇 Belief Index 单例，以及至少一篇 Belief（否则 `/beliefs/:uid` 静态导出失败）。

2. 「B. 新增一个内容页」保留 UID 那句改成：

```
UID 取值要避开已被静态路由占用的名字：**`news`**、**`changelog`**、**`beliefs`**、**`slice-simulator`**。撞上了产物路径会冲突。
```

3. 「内容建模」或「现有的 11 种 slice」附近加一小段现有页面类型：

```
页面类型：`homepage` `/` · `page` `/:uid` · `news_index` `/news` · `news_post` `/news/:uid` · `belief_index` `/beliefs` · `belief` `/beliefs/:uid` · `release_index` `/changelog` · `release_note`（无独立 URL）· `settings`。

主导航约定（`settings.primary_nav`）：首页 `/`、主张 `/beliefs`、更新日志 `/changelog`。不要填落地页锚点（`/#philosophy` 等）。页脚导航可挂新闻 `/news`，不要再挂首页。
```

- [ ] **Step 3: typecheck 与 lint**

Run: `pnpm typecheck && pnpm lint`

Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts README.md
git commit -m "$(cat <<'EOF'
docs: register 主张 routes in sitemap and README

Keep reserved UIDs and primary-nav convention next to the other static routes so editors do not collide with /beliefs.
EOF
)"
```

README 的 commit type 用 `docs`；sitemap 是功能。若希望一条 commit 只说一件事，把 sitemap 单独 commit 为 `feat: include beliefs in sitemap`，README 再 `docs:`。**优先拆成两次 commit**（先 sitemap，再 README），message 分别为：

```
feat: include 主张 pages in sitemap
```

```
docs: document belief types, reserved UIDs, and primary nav
```

---

### Task 7: Prismic 内容 + 整站验证

**Files:** 无代码。远端文档与 `settings.primary_nav`。

**Interfaces:**
- Consumes: Task 2 已 push 的类型；Task 4–5 的路由
- Produces: 可 `pnpm build:next` 的远端内容

- [ ] **Step 1: 创建并发布 `belief_index`**

Prismic 后台 → Belief Index → 新建（单例只有一篇）。

建议 slice：`hero` 或 `rich_text`，H1 / 标题写 **萱草主张**，副文案写清这是产品设计、人群、意图与取舍的口径库。填 SEO。**发布**。

- [ ] **Step 2: 至少发布一篇 `belief`**

建议第一篇（有一篇即可过构建；其余可后补）：

| UID | 标题 | 主题 |
| --- | --- | --- |
| `not-a-reminder` | 我们不是到点催你的工具 | 取舍 |

UID 用英文短横线。摘要一句话。正文至少一段 `rich_text`。**发布**。

可后补的四篇（不阻塞构建）：减法 / 一家人的今天 / 改动有商量 / 好好过日子。文案过 SoT：不承诺到点催人。

- [ ] **Step 3: 改 Settings 导航**

`primary_nav`（三项，Link 文本 + URL）：

1. 首页 → `/`
2. 主张 → `/beliefs`
3. 更新日志 → `/changelog`

不要 `/#philosophy`、`/#today`、`/#changes`、`/#details`。

`footer_nav`：保留列表；**删除「首页」**（若有）；可加新闻 `/news`、主张 `/beliefs`。**发布 Settings**。

- [ ] **Step 4: 等 CDN 传播后构建**

发布后等几十秒到几分钟，再：

```sh
pnpm tokens:check
pnpm typecheck && pnpm lint
pnpm build:next
pnpm classes:check
```

Expected:

- `tokens:check` PASS
- typecheck / lint PASS
- `build:next` 预渲染至少包括 `/`、`/beliefs/`、`/beliefs/<uid>/`、`/changelog/`、`/news/`。不能出现 `Unknown type` / `belief_index` 读取失败 / `at least one route must be generated`。
- `classes:check` PASS（会扫到 `BeliefTile` 的 `border-sand` `text-brand-deep` `text-caption` `lg:grid-cols-3` 等）

若 `build:next` 在取 Prismic 图片时 `ConnectTimeout`，按仓库惯例重跑一次。

- [ ] **Step 5: 浏览器核对**

`pnpm dev` 打开：

1. 顶栏三项可进 `/`、`/beliefs/`、`/changelog/`，右侧仍是打开小程序
2. `/beliefs/` 停留在宫格目录，不跳转到某篇
3. 点一格进入 `/beliefs/<uid>/`，「← 返回萱草主张」回到索引
4. 首页视觉与改前一致（样机、四章、底部 CTA 都还在）
5. 页脚仍有链接列表，且没有「首页」
6. 把窗口缩到手机宽度：宫格一列，无横向溢出；桌面最多三列

- [ ] **Step 6: 没有代码 diff 则不必再 commit**

若 Step 4–5 只改了 Prismic 内容，git 保持干净。若 `classes:check` 逼出 className 修正，把修正 commit 在对应组件上，message 用 `fix:`。

---

## Self-review

**Spec coverage**

| Spec 节 | Task |
| --- | --- |
| §3 顶栏三项 / 页脚保留 | Task 7 Step 3（内容）；代码不改 Header |
| §3.3 保留 UID | Task 6 README |
| §4 两种类型与 slice 集 | Task 1 |
| §4.3 routes | Task 1 Step 5 |
| §4.4 静态导出至少一篇 | Task 5 + Task 7 |
| §5.1 宫格 / BeliefTile | Task 3–4 |
| §5.2 详情 | Task 5 |
| §5.3 首页不动 | 全任务文件表；无 `src/app/page.tsx` |
| §5.4 不高亮 | 不改 SiteHeader |
| §5.5 sitemap | Task 6 |
| §9 单例错误信息 | Task 4 `getBeliefIndex` |
| §10 验证命令 | Task 7 |

**非目标确认：** 无 `featured_beliefs`、无 homepage 改动、无 footer_nav 删除、无 client 组件、无主题筛选、不锁 9 格。

**Placeholder scan:** 无 TBD / TODO /「类似 Task N」。

**类型名一致性：** 全程 `belief_index` / `belief` / `/beliefs` / `BeliefTile` / `getBeliefIndex` / `getBeliefs`。
