/**
 * Tailwind 类名核对。
 *
 * 无效的 Tailwind 类是**静默忽略**的：不报错、不警告，页面只是少了那个样式。
 * typecheck 和 lint 都抓不住 —— 本仓库在一次批量换词里就这样漏过
 * `bg-surface-container-base` 与 `bg-surface-container-container` 两处。
 *
 * 所以这里把 src/ 里每个 className token 取出来，逐个去**真实编译产物**里
 * 找对应规则。产物由 `next build` 生成在 .next/static/ 下。
 *
 * 运行：
 *   pnpm build:next   # 先编译出 CSS（构建可以在取数阶段失败，CSS 那时已经产出）
 *   pnpm classes:check
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

async function walk(dir: string, match: (p: string) => boolean): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p, match)));
    else if (match(p)) out.push(p);
  }
  return out;
}

/**
 * 从一段 className 内容里取出类名。
 *
 * 模板字面量里混着 `${...}` 表达式，不能整段按空格切 —— 那会把 `isCard`、
 * `accentBars[index`、`%` 这类碎片当成类名报出来，而一个会误报的检查没人会看。
 * 所以分两路：`${}` 之外的字面文本直接切；`${}` 之内只取**字符串字面量**，
 * 因为三元里真正的类名总是写成 "lg:order-first" 这样的引号串。
 */
function classTokens(raw: string): string[] {
  const out: string[] = [];
  let literal = "";

  for (let i = 0; i < raw.length; i++) {
    if (raw[i] !== "$" || raw[i + 1] !== "{") {
      literal += raw[i];
      continue;
    }
    /* 花括号配对扫描，跳过整个插值表达式 */
    let depth = 0;
    let j = i + 1;
    for (; j < raw.length; j++) {
      if (raw[j] === "{") depth++;
      else if (raw[j] === "}" && --depth === 0) break;
    }
    const expression = raw.slice(i + 2, j);
    for (const s of expression.matchAll(/["']([^"']*)["']/g)) out.push(...s[1].split(/\s+/));
    literal += " ";
    i = j;
  }

  out.push(...literal.split(/\s+/));
  return out.filter(Boolean);
}

/** Tailwind 生成选择器时会转义这些字符。 */
function escapeClass(name: string): string {
  return name.replace(/[.:/[\]()%&>,#!+*~='"]/g, (c) => `\\${c}`);
}

async function main() {
  const cssFiles = await walk(join(ROOT, ".next"), (p) => p.endsWith(".css")).catch(
    () => [],
  );
  const built = cssFiles.filter((p) => !p.includes("/cache/"));

  if (built.length === 0) {
    console.error("✗ .next 下找不到编译产物。先跑 `pnpm build:next`。");
    process.exit(1);
  }

  const css = (await Promise.all(built.map((p) => readFile(p, "utf8")))).join("\n");

  const used = new Map<string, string>();
  for (const file of await walk(join(ROOT, "src"), (p) => p.endsWith(".tsx"))) {
    const source = await readFile(file, "utf8");
    const where = file.replace(`${ROOT}/`, "");
    for (const m of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
      for (const token of classTokens(m[1] ?? m[2] ?? "")) {
        if (!used.has(token)) used.set(token, where);
      }
    }
  }

  const missing = [...used].filter(([token]) => !css.includes(`.${escapeClass(token)}`));

  console.log(`扫描 ${used.size} 个类名`);
  if (missing.length === 0) {
    console.log("✓ 全部在编译产物中命中");
    return;
  }

  console.error(`✗ ${missing.length} 个未命中：`);
  for (const [token, file] of missing) console.error(`   ${token}   ← ${file}`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
