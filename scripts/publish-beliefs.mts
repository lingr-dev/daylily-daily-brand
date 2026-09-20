/**
 * 把 content/beliefs/ 下的十二篇本地短文发布到 Prismic 的 belief 类型。
 *
 * 字段映射约定见 content/beliefs/README.md「CMS 与版式交接」：
 *   uid / title / excerpt / topic → 同名字段
 *   标题和摘要之后的段落          → 单个 rich_text slice
 *   title / excerpt               → meta_title / meta_description
 *   published_at                  → 脚本运行当天（真实发布日期，不虚构）
 *
 * 运行：
 *   node scripts/publish-beliefs.mts --dry-run          只解析、打印，不写远端
 *   PRISMIC_WRITE_TOKEN=... node scripts/publish-beliefs.mts
 *   node --env-file=.env.local scripts/publish-beliefs.mts
 *
 * 幂等：远端已存在的 uid 默认跳过；`--update` 才用本地稿件覆盖远端内容
 * （会盖掉后台的编辑改动，跑之前想清楚）。
 *
 * 内容会先进一个 migration release，脚本最后自动发布。
 */
import * as prismic from "@prismicio/client";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BELIEFS_DIR = join(ROOT, "content", "beliefs");
const LANG = "zh-cn";
const TOPICS = new Set(["人群", "意图", "取舍", "设计"]);

interface BeliefArticle {
  uid: string;
  title: string;
  excerpt: string;
  topic: string;
  /** 标题与摘要之后的正文段落。 */
  paragraphs: string[];
}

/** 解析一篇本地短文：最小 front matter 解析 + 正文按空行分段。 */
function parseArticle(source: string, file: string): BeliefArticle {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: 缺少 front matter`);
  const [, front, body] = match;

  const meta: Record<string, string> = {};
  for (const line of front.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(?:"([^"]*)"|(\S+))\s*$/);
    if (m) meta[m[1]] = m[2] ?? m[3];
  }

  for (const key of ["uid", "title", "excerpt", "topic"] as const) {
    if (!meta[key]) throw new Error(`${file}: front matter 缺少 ${key}`);
  }
  if (!TOPICS.has(meta.topic)) {
    throw new Error(`${file}: topic「${meta.topic}」不在 belief 类型的选项内`);
  }

  // 正文 = 一级标题 + 摘要段 + 若干段落。前两块与 title/excerpt 字段重复，
  // 按交接约定只把摘要之后的段落放进 rich_text slice。
  const blocks = body
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks[0] !== `# ${meta.title}`) {
    throw new Error(`${file}: 正文首个 block 应为与 title 一致的一级标题`);
  }
  if (blocks[1] !== meta.excerpt) {
    throw new Error(`${file}: 正文第二段应与 excerpt 一致`);
  }
  const paragraphs = blocks.slice(2);
  if (paragraphs.length === 0) throw new Error(`${file}: 正文没有段落`);
  for (const para of paragraphs) {
    if (para.startsWith("#")) throw new Error(`${file}: 正文段落里出现标题`);
  }

  return {
    uid: meta.uid,
    title: meta.title,
    excerpt: meta.excerpt,
    topic: meta.topic,
    paragraphs,
  };
}

const h1 = (text: string): prismic.RichTextField =>
  [{ type: "heading1", text, spans: [] }] as prismic.RichTextField;
const p = (texts: string[]): prismic.RichTextField =>
  texts.map((text) => ({
    type: "paragraph" as const,
    text,
    spans: [],
  })) as prismic.RichTextField;

/** 真实发布日期（本地时区），草稿不虚构日期 —— 脚本运行日即发布日。 */
function today(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

/**
 * 带重试的 fetch —— 到 Prismic 的网络偶发超时，单次请求失败不该中断整批迁移。
 * 注意：中途失败仍可能在 migration release 里留下空壳草稿，需到后台
 * 「Migration Releases」删除该 release 后再重跑（见 main 的错误提示）。
 */
const resilientFetch: typeof fetch = async (input, init) => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      return await fetch(input, { ...init, signal: AbortSignal.timeout(45_000) });
    } catch (error) {
      lastError = error;
      console.log(
        `  网络重试 ${attempt}/6：${error instanceof Error ? (error.cause as Error)?.message ?? error.message : error}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  throw lastError;
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const update = process.argv.includes("--update");

  const files = (await readdir(BELIEFS_DIR)).filter((f) => f.endsWith(".md") && f !== "README.md");
  const articles: BeliefArticle[] = [];
  for (const file of files.sort()) {
    articles.push(parseArticle(await readFile(join(BELIEFS_DIR, file), "utf8"), file));
  }
  console.log(`解析到 ${articles.length} 篇本地短文`);
  for (const a of articles) {
    console.log(`  ${a.uid}  [${a.topic}]  ${a.title}（${a.paragraphs.length} 段）`);
  }

  const config = JSON.parse(
    await readFile(join(ROOT, "prismic.config.json"), "utf8"),
  ) as { repositoryName: string };

  const readClient = prismic.createClient(config.repositoryName, {
    fetch: resilientFetch,
    fetchOptions: { cache: "no-store" },
  });
  const existing = new Set(
    (await readClient.dangerouslyGetAll({ predicates: prismic.filter.at("document.type", "belief") }))
      .map((doc) => doc.uid),
  );

  const migration = prismic.createMigration();
  const publishedAt = today();
  let queued = 0;

  for (const a of articles) {
    const data = {
      title: h1(a.title),
      excerpt: a.excerpt,
      cover: undefined,
      published_at: publishedAt,
      topic: a.topic,
      slices: [
        {
          slice_type: "rich_text",
          variation: "default",
          primary: { content: p(a.paragraphs) },
          items: [],
        },
      ],
      meta_title: a.title,
      meta_description: a.excerpt,
      meta_image: undefined,
    };

    if (!existing.has(a.uid)) {
      migration.createDocument(
        { type: "belief", uid: a.uid, lang: LANG, data } as never,
        a.title,
      );
      queued++;
      console.log(`  新建 belief/${a.uid}`);
    } else if (update) {
      const found = (await readClient.getByUID("belief", a.uid)) ;
      migration.updateDocument({ ...found, data } as never, a.title);
      queued++;
      console.log(`  覆盖 belief/${a.uid}`);
    } else {
      console.log(`  跳过（已存在）belief/${a.uid}`);
    }
  }

  if (dryRun) {
    console.log(`\n--dry-run：不写入远端。${queued} 篇待写入，published_at=${publishedAt}`);
    return;
  }

  if (queued === 0) {
    console.log("✓ 所有文章都已存在，无需写入（要覆盖内容加 --update）");
    return;
  }

  const writeToken = process.env.PRISMIC_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error(
      [
        "缺少 PRISMIC_WRITE_TOKEN。",
        "",
        "  npx prismic token create --write --name beliefs --json",
        "",
        "把返回的 token 写进 .env.local（已被 .gitignore 挡住），然后：",
        "  node --env-file=.env.local scripts/publish-beliefs.mts",
      ].join("\n"),
    );
  }

  const client = prismic.createWriteClient(config.repositoryName, {
    writeToken,
    fetch: resilientFetch,
  });
  console.log(`写入 migration release（${queued} 篇）...`);
  try {
    await client.migrate(migration, {
      reporter: (event) => {
        const doc =
          "data" in event && event.data && "document" in event.data
            ? (event.data.document as { title?: string })
            : undefined;
        console.log(`  ${event.type}${doc?.title ? `：${doc.title}` : ""}`);
      },
    });
  } catch (error) {
    throw new Error(
      [
        `迁移中断：${error instanceof Error ? error.message : error}`,
        "",
        "migrate() 不是事务 —— 已创建的文档会以空壳草稿留在 migration release 里，",
        "重跑会因 UID 冲突再次失败。先去后台清理：",
        "  Prismic Dashboard → Migration Releases → 删除残留的 migration release",
        "若报「A document with this UID already exists」，还要检查 Documents 里",
        "有没有同 UID 的手工草稿（草稿不对外可见，但占用 UID）。",
        "清理干净后重新运行本脚本。",
      ].join("\n"),
    );
  }

  console.log("发布 migration release ...");
  await client.publishMigrationRelease();
  console.log("✓ 完成");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
