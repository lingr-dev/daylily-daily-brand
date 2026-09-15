/**
 * 设计令牌同步。
 *
 * 真相在 `uiux/prototypes/daylily-daily/themes/tokens.css`（submodule，只读）。
 * 本脚本从那里抽出品牌站需要的子集，生成 `src/app/tokens.generated.css`。
 *
 * 为什么是「生成 + 提交产物」而不是构建期直接 @import submodule：
 * 品牌站是独立部署的静态站，构建不该押在「CI 能不能 clone 一个私有 submodule」上。
 * 生成物提交进仓库，日常构建读它；漂移由 `--check` 在 CI 里抓。
 *
 * 运行（Node 24 原生跑 TS）：
 *   pnpm tokens:sync      重新生成
 *   pnpm tokens:check     重新生成并与工作区比对，不一致 exit 1
 *
 * 只取品牌站用得上的（纸面/墨色/描边/落地页色/微信绿/圆角/字号/字体/阴影/动效）。
 * 磁贴色、亲情版金、反馈色、萱草橙主行动色、原型脚手架色一概不取 —— 那些属于小程序壳内。
 * 间距不取：--sp-* 是 4/8/16/24/32/48，与 Tailwind 默认的 1/2/4/6/8/12 逐档相等，没有可同步的东西。
 */
import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(
  ROOT,
  "uiux/prototypes/daylily-daily/themes/tokens.css",
);
const OUTPUT = join(ROOT, "src/app/tokens.generated.css");

/* ────────────────────────────────────────────────────────────────────────
   解析
   ──────────────────────────────────────────────────────────────────────── */

type Decl = { name: string; value: string; comment: string | null };

/**
 * 手写扫描而不是上 CSS 解析器：这个文件要保持零依赖，而且需要把每条声明
 * **行尾的中文注释**一并带走 —— tokens.css 的对比度标注就在那些注释里，
 * 丢了等于把这套系统最有价值的部分丢了一半。
 */
function parseRootDecls(css: string): Decl[] {
  const start = css.indexOf(":root");
  if (start < 0) throw new Error("tokens.css 里找不到 :root");
  const open = css.indexOf("{", start);

  let depth = 0;
  let end = -1;
  for (let i = open; i < css.length; i++) {
    if (css.startsWith("/*", i)) {
      i = css.indexOf("*/", i + 2);
      if (i < 0) throw new Error("注释没有闭合");
      continue;
    }
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error(":root 块没有闭合");

  const body = css.slice(open + 1, end);
  const decls: Decl[] = [];

  let i = 0;
  while (i < body.length) {
    if (body.startsWith("/*", i)) {
      i = body.indexOf("*/", i + 2) + 2;
      continue;
    }
    if (!body.startsWith("--", i)) {
      i++;
      continue;
    }

    const colon = body.indexOf(":", i);
    if (colon < 0) break;
    const name = body.slice(i + 2, colon).trim();

    // 值读到分号为止，跳过途中的注释（注释里可能有分号）
    let j = colon + 1;
    let value = "";
    while (j < body.length && body[j] !== ";") {
      if (body.startsWith("/*", j)) {
        j = body.indexOf("*/", j + 2) + 2;
        continue;
      }
      value += body[j++];
    }

    /*
     * 行尾注释算这条声明的 —— 但只当它**起始于分号所在的那一行**时才算，
     * 否则会把下一条声明头顶的注释抢过来。起始之后允许跨行：tokens.css 里
     * --fill-quiet 一类的注释就是两行写的。
     */
    let k = j + 1;
    while (k < body.length && (body[k] === " " || body[k] === "\t")) k++;
    let comment: string | null = null;
    if (body.startsWith("/*", k)) {
      const close = body.indexOf("*/", k + 2);
      if (close < 0) throw new Error(`--${name} 的行尾注释没有闭合`);
      comment = body.slice(k + 2, close).trim().replace(/\s+/g, " ");
      k = close + 2;
    }

    decls.push({ name, value: value.replace(/\s+/g, " ").trim(), comment });
    i = Math.max(k, j + 1);
  }

  return decls;
}

/* ────────────────────────────────────────────────────────────────────────
   要取哪些

   `to` 一律沿用 uiux 的**通道名**（content-primary / surface-base / sand …）
   而不是 tokens.css 的语义名（ink / paper / hair）。理由：通道名才是两个仓库
   markup 里实际出现的词，对齐的意义在于人读两边代码时用同一套词汇。
   ──────────────────────────────────────────────────────────────────────── */

type Pick = { from: string; to: string; lineHeight?: string };
type Group = { title: string; note?: string; picks: Pick[] };

const COLORS: Group[] = [
  {
    title: "纸面与容器",
    note: "默认背景是宣纸白，不是纯白；纯白只用于浮在宣纸上的卡片",
    picks: [
      { from: "paper", to: "surface-base" },
      { from: "card", to: "surface-container" },
      { from: "raised", to: "surface-elevated" },
    ],
  },
  {
    title: "墨色",
    note: "括号内为宣纸白上的对比度。正文最低 4.5:1，大字最低 3:1",
    picks: [
      { from: "ink", to: "content-primary" },
      { from: "ink-body", to: "content-body" },
      { from: "ink-soft", to: "content-secondary" },
      { from: "ink-muted", to: "content-muted" },
      { from: "ink-inverse", to: "content-inverse" },
    ],
  },
  {
    title: "描边与安静填充",
    note:
      "名字按「生成出来的工具类名」定，不照抄 uiux preset 的键路径 —— " +
      "那边 border.subtle 在 Tailwind 里会变成 border-border-subtle。" +
      "落地页 markup 实际写的是 border-sand（28 处）与 border-hairline（1 处）",
    picks: [
      { from: "hair", to: "hair" },
      { from: "hair-soft", to: "hairline" },
      { from: "fill-quiet", to: "fill-quiet" },
    ],
  },
  {
    title: "落地页专用",
    note:
      "⚠️ peach 1.89:1 / jade 2.64:1，两者都不可作文字色。" +
      "橙色系文字用 brand-deep；主 CTA 用 peach 填充配墨字（7.15:1）。" +
      "详见 docs/landing-migration.md §3.2。" +
      "刻意不叫 brand-primary/brand-jade：落地页那两个类名是靠页内 " +
      "DaylilyTailwind.extend 把 brand.primary 改指 peach 才成立的，" +
      "而 brand-primary 在 uiux 别处是萱草橙 #EA580C。" +
      "同名不同值正是 themes/README.md 反复警告的陷阱，不引进本仓库",
    picks: [
      { from: "marketing-peach", to: "marketing-peach" },
      { from: "marketing-jade", to: "marketing-jade" },
      { from: "sand", to: "sand" },
      { from: "sand-wash", to: "sand-wash" },
    ],
  },
  {
    title: "橙色系文字档",
    note: "官网主色是 peach 不是萱草橙，但橙色系文字仍只有这一个合规值",
    picks: [{ from: "brand-deep", to: "brand-deep" }],
  },
  {
    title: "微信绿",
    note: "外部品牌常量，不随皮肤变。用于「打开小程序」这一具体 affordance",
    picks: [
      { from: "wechat", to: "wechat-green" },
      { from: "wechat-deep", to: "wechat-green-deep" },
      { from: "wechat-wash", to: "wechat-green-light" },
    ],
  },
];

const RADIUS: Pick[] = [
  { from: "r-sm", to: "sm" },
  { from: "r-md", to: "md" },
  { from: "r-card", to: "card" },
  { from: "r-lg", to: "lg" },
  { from: "r-xl", to: "xl" },
  { from: "r-pill", to: "pill" },
];

/** 行高取自 uiux 的 tailwind-preset.js，与那边逐档相同。 */
const TEXT: Pick[] = [
  { from: "fz-display", to: "display", lineHeight: "1.15" },
  { from: "fz-title-1", to: "title-1", lineHeight: "1.2" },
  { from: "fz-title-2", to: "title-2", lineHeight: "1.25" },
  { from: "fz-title-3", to: "title-3", lineHeight: "1.3" },
  { from: "fz-h1", to: "h1", lineHeight: "1.3" },
  { from: "fz-h2", to: "h2", lineHeight: "1.35" },
  { from: "fz-cta", to: "cta", lineHeight: "1.25" },
  { from: "fz-body-lg", to: "body-lg", lineHeight: "1.5" },
  { from: "fz-body", to: "body-base", lineHeight: "1.5" },
  { from: "fz-detail", to: "detail", lineHeight: "1.5" },
  { from: "fz-body-sm", to: "body-sm", lineHeight: "1.5" },
  { from: "fz-sm", to: "note", lineHeight: "1.5" },
  { from: "fz-caption", to: "caption", lineHeight: "1.4" },
];

/**
 * Tailwind 内置档改指同一批令牌。字号取值与 Tailwind 默认**完全相同**
 * （12/14/16/18/20/24/30），所以既有类名一个像素都不变，但从此跟着令牌走。
 */
const TEXT_ALIASES: Pick[] = [
  { from: "fz-caption", to: "xs", lineHeight: "1.4" },
  { from: "fz-body-sm", to: "sm", lineHeight: "1.5" },
  { from: "fz-body", to: "base", lineHeight: "1.5" },
  { from: "fz-body-lg", to: "lg", lineHeight: "1.5" },
  { from: "fz-title-3", to: "xl", lineHeight: "1.3" },
  { from: "fz-title-2", to: "2xl", lineHeight: "1.25" },
  { from: "fz-title-1", to: "3xl", lineHeight: "1.2" },
];

const FONT: Pick[] = [
  { from: "font-sans", to: "sans" },
  { from: "font-serif", to: "serif" },
];

/** 值里引用 var(--shadow-rgb)，所以那个原始变量必须也落进 :root。 */
const SHADOW: Pick[] = [
  { from: "sh-sm", to: "brand-sm" },
  { from: "sh-md", to: "brand-md" },
];

const EASE: Pick[] = [
  { from: "ease", to: "brand" },
  { from: "ease-bounce", to: "bounce" },
];

/** 不进 @theme，不生成工具类；供自定义 CSS 与上面那些引用它们的值使用。 */
const RAW: string[] = [
  "shadow-rgb",
  "ease",
  "ease-bounce",
  "dur-fast",
  "dur",
  "dur-slow",
  "tap-min",
  "tap-comfort",
];

/* ────────────────────────────────────────────────────────────────────────
   生成
   ──────────────────────────────────────────────────────────────────────── */

const exec = promisify(execFile);

async function upstreamRef(): Promise<string> {
  try {
    const { stdout } = await exec("git", ["-C", join(ROOT, "uiux"), "describe", "--always", "--dirty"]);
    return stdout.trim();
  } catch {
    return "未知";
  }
}

function emit(decl: Decl, name: string, indent = "  "): string {
  const line = `${indent}--${name}: ${decl.value};`;
  return decl.comment ? `${line.padEnd(66)} /* ${decl.comment} */` : line;
}

function build(decls: Decl[], ref: string): string {
  const byName = new Map(decls.map((d) => [d.name, d]));
  const missing: string[] = [];

  const take = (from: string): Decl => {
    const d = byName.get(from);
    if (!d) {
      missing.push(from);
      return { name: from, value: "/* MISSING */", comment: null };
    }
    return d;
  };

  const out: string[] = [];
  out.push(
    "/* 由 scripts/sync-tokens.mts 生成，请勿手改。",
    " *",
    " * 真相来源：uiux/prototypes/daylily-daily/themes/tokens.css",
    ` * 上游版本：${ref}`,
    " *",
    " * 改颜色请改上游，然后跑 `pnpm tokens:sync`。",
    " * `pnpm tokens:check` 会在 CI 里把漂移变成构建失败。",
    " *",
    " * 命名沿用 uiux 的通道名（content-primary / surface-base / sand …）而不是",
    " * tokens.css 的语义名（ink / paper / hair）—— 通道名才是两边 markup 里实际",
    " * 出现的词，对齐的意义在于人读两个仓库时用同一套词汇。",
    " */",
    "",
    "/* 原样透传：不生成工具类，供自定义 CSS 以及下面 @theme 里引用它们的值使用。 */",
    ":root {",
  );
  for (const name of RAW) out.push(emit(take(name), name));
  out.push("}", "", "@theme {");

  for (const group of COLORS) {
    out.push("");
    if (group.note) {
      out.push(`  /* ── ${group.title} ──`, `     ${group.note} */`);
    } else {
      out.push(`  /* ── ${group.title} ── */`);
    }
    for (const p of group.picks) out.push(emit(take(p.from), `color-${p.to}`));
  }

  out.push("", "  /* ── 圆角 ── */");
  for (const p of RADIUS) out.push(emit(take(p.from), `radius-${p.to}`));

  out.push(
    "",
    "  /* ── 字号 ──",
    "     行高取自 uiux 的 tailwind-preset.js，与那边逐档相同。",
    "     元组里只放字号与行高：字重和字距由 markup 上的 font-* / tracking-* 表达，",
    "     塞进字阶只会让两者打架。 */",
  );
  for (const p of TEXT) {
    out.push(emit(take(p.from), `text-${p.to}`));
    if (p.lineHeight) out.push(`  --text-${p.to}--line-height: ${p.lineHeight};`);
  }

  out.push(
    "",
    "  /* ── Tailwind 内置字号档改指同一批令牌 ──",
    "     字号取值与 Tailwind 默认完全相同（12/14/16/18/20/24/30），",
    "     既有类名一个像素都不变，但从此跟着令牌走。 */",
  );
  for (const p of TEXT_ALIASES) {
    out.push(emit(take(p.from), `text-${p.to}`));
    if (p.lineHeight) out.push(`  --text-${p.to}--line-height: ${p.lineHeight};`);
  }

  out.push("", "  /* ── 字体 ── 系统字体栈，零下载 */");
  for (const p of FONT) out.push(emit(take(p.from), `font-${p.to}`));

  out.push(
    "",
    "  /* ── 阴影 ──",
    "     纸面世界默认是平的。阴影只做两件事：把卡片坐实在宣纸上，或给 Hero 打光。 */",
  );
  for (const p of SHADOW) out.push(emit(take(p.from), `shadow-${p.to}`));

  out.push("", "  /* ── 缓动 ── */");
  for (const p of EASE) out.push(emit(take(p.from), `ease-${p.to}`));

  out.push("}", "");

  if (missing.length > 0) {
    throw new Error(
      `上游 tokens.css 里找不到这些令牌：${missing.join(", ")}\n` +
        "多半是上游改名或删了。先确认上游意图，再改本脚本的取用表 —— 不要在这边造值。",
    );
  }

  return out.join("\n");
}

/* ────────────────────────────────────────────────────────────────────────
   入口
   ──────────────────────────────────────────────────────────────────────── */

async function main() {
  const check = process.argv.includes("--check");

  let css: string;
  try {
    css = await readFile(SOURCE, "utf8");
  } catch {
    const hint =
      `读不到 ${SOURCE}\n` +
      "uiux submodule 没有 checkout。同步用：\n" +
      "  git submodule sync && git submodule update --init\n" +
      "（只拉一级，禁止 --recursive —— 见 CLAUDE.md）";
    if (check) {
      console.warn(`⚠ 跳过令牌校验：${hint}`);
      return; // 没有 submodule 时不让校验变成构建阻塞
    }
    throw new Error(hint);
  }

  const generated = build(parseRootDecls(css), await upstreamRef());

  if (!check) {
    await writeFile(OUTPUT, generated, "utf8");
    console.log(`✓ 已生成 ${OUTPUT.replace(ROOT + "/", "")}`);
    return;
  }

  let current: string;
  try {
    current = await readFile(OUTPUT, "utf8");
  } catch {
    console.error("✗ tokens.generated.css 不存在。跑 `pnpm tokens:sync`。");
    process.exit(1);
  }

  if (current === generated) {
    console.log("✓ 令牌与 uiux 一致");
    return;
  }

  console.error("✗ 令牌已与 uiux 漂移。跑 `pnpm tokens:sync` 同步。\n");
  const a = current.split("\n");
  const b = generated.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      if (a[i] !== undefined) console.error(`  本地 ${String(i + 1).padStart(3)}: ${a[i]}`);
      if (b[i] !== undefined) console.error(`  上游 ${String(i + 1).padStart(3)}: ${b[i]}`);
    }
  }
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
