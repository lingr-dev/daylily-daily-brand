/**
 * 一次性内容种子。
 *
 * 给**空仓库**灌一份能跑通的示例内容：settings 单例 + homepage 单例。
 * 用途是让新建的 Prismic 环境立刻能构建、能看，不是内容的真相来源 ——
 * 一旦编辑在后台改过，这个文件就过时了，不要再拿它去覆盖。
 *
 * 文案口径按 lexicon 2.0.0（uiux/prototypes/daylily-daily/lexicon/product.js）：
 * 健康手帐 / 健康安排 / 健康记录。原型页 landing-page.html 停留在旧词表
 * （小记 / 账本），**不要照抄**。详见 docs/landing-migration.md §6A。
 *
 * 运行：
 *   PRISMIC_WRITE_TOKEN=... node scripts/seed-content.mts
 *   node --env-file=.env.local scripts/seed-content.mts
 *
 * 内容会先进一个 migration release，脚本最后自动发布。
 */
import * as prismic from "@prismicio/client";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LANG = "zh-cn";

/** 与 src/lib/site.ts 的 ctaAnchor 对齐，也与 cta_banner/light 的 anchor_id 对齐。 */
const site_cta = "/#cta";

/**
 * 富文本最小构造器 —— 内容简单，不必为此装 @prismicio/migrate。
 *
 * RichTextField 是「非空元组」而不是普通数组，`.map()` 的结果不满足它，
 * 所以这里显式断言。构造过程本身保证了非空。
 */
const h1 = (text: string): prismic.RichTextField =>
  [{ type: "heading1", text, spans: [] }] as prismic.RichTextField;
const h2 = (text: string): prismic.RichTextField =>
  [{ type: "heading2", text, spans: [] }] as prismic.RichTextField;
const p = (...texts: string[]): prismic.RichTextField =>
  texts.map((text) => ({
    type: "paragraph" as const,
    text,
    spans: [],
  })) as prismic.RichTextField;

/**
 * 带标记的富文本。
 *
 *   **粗体**      → strong
 *   [[高亮]]      → label: highlight（落地页大标题里被点亮的那个词）
 *
 * Prismic 的 spans 是按字符下标记的，手数下标太容易错 —— 尤其中文没有词边界、
 * 改一个字后面全要跟着挪。这里用标记语法写，偏移自动算。
 */
function marked(
  type: "heading1" | "heading2" | "paragraph",
  source: string,
): prismic.RTNode {
  const spans: { type: string; start: number; end: number; data?: unknown }[] = [];
  let text = "";
  let i = 0;

  while (i < source.length) {
    if (source.startsWith("**", i)) {
      const close = source.indexOf("**", i + 2);
      if (close < 0) throw new Error(`未闭合的 ** ：${source}`);
      const inner = source.slice(i + 2, close);
      spans.push({ type: "strong", start: text.length, end: text.length + inner.length });
      text += inner;
      i = close + 2;
      continue;
    }
    if (source.startsWith("[[", i)) {
      const close = source.indexOf("]]", i + 2);
      if (close < 0) throw new Error(`未闭合的 [[ ：${source}`);
      const inner = source.slice(i + 2, close);
      spans.push({
        type: "label",
        data: { label: "highlight" },
        start: text.length,
        end: text.length + inner.length,
      });
      text += inner;
      i = close + 2;
      continue;
    }
    text += source[i];
    i++;
  }

  return { type, text, spans } as unknown as prismic.RTNode;
}

/** 单块富文本。多块用 rt()。 */
const rt = (...nodes: prismic.RTNode[]): prismic.RichTextField =>
  nodes as prismic.RichTextField;

/** 站内锚点链接。落地页是锚点式单页导航，写绝对形式，内页也能用。 */
const anchor = (url: string, text: string) => ({
  link_type: "Web" as const,
  url,
  text,
});

/**
 * 可重复 link 字段（primary_nav / footer_nav）的每一项都要一个 key。
 * 用路径本身当 key —— 稳定、可读，重跑脚本不会变。
 */
const navLink = (url: string, text: string) => ({ ...anchor(url, text), key: url });

async function main() {
  const writeToken = process.env.PRISMIC_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error(
      [
        "缺少 PRISMIC_WRITE_TOKEN。",
        "",
        "  npx prismic token create --write --name seed --json",
        "",
        "把返回的 token 写进 .env.local（已被 .gitignore 挡住），然后：",
        "  node --env-file=.env.local scripts/seed-content.mts",
        "",
        "⚠️ 不要跑 `prismic token list` —— 它会把完整 token 打到终端。",
      ].join("\n"),
    );
  }

  const config = JSON.parse(
    await readFile(join(ROOT, "prismic.config.json"), "utf8"),
  ) as { repositoryName: string };

  const client = prismic.createWriteClient(config.repositoryName, { writeToken });
  const migration = prismic.createMigration();

  /**
   * 幂等：已存在的文档跳过，不覆盖。
   *
   * 这个脚本只负责「把空仓库填到能跑」，不负责维护内容 —— 编辑在后台改过之后
   * 再跑一次不应该把人家的改动推平。所以先读一遍现状，只补缺的。
   */
  const byKey = new Map<string, prismic.PrismicDocument>();
  try {
    const readClient = prismic.createClient(config.repositoryName, {
      fetchOptions: { cache: "no-store" },
    });
    for (const doc of await readClient.dangerouslyGetAll()) {
      byKey.set(doc.uid ? `${doc.type}/${doc.uid}` : doc.type, doc);
    }
  } catch {
    /* 空仓库或还没有 master ref，当作什么都没有 */
  }

  /**
   * 默认只补缺的。`--update` 才覆盖已存在文档的 data。
   *
   * 默认不覆盖是因为编辑会在后台改内容，脚本不该把人家的改动推平；
   * `--update` 是给「文案由本仓库定稿、需要整体刷一遍」的场合用的，
   * 跑之前要清楚它会盖掉后台改动。
   */
  const update = process.argv.includes("--update");
  let queued = 0;

  const upsert = (
    key: string,
    spec: { type: string; uid?: string; lang: string; data: Record<string, unknown> },
    title: string,
  ) => {
    const found = byKey.get(key);

    if (!found) {
      migration.createDocument(spec as never, title);
      queued++;
      console.log(`  新建 ${key}`);
      return;
    }

    if (!update) {
      console.log(`  跳过（已存在）${key}`);
      return;
    }

    migration.updateDocument({ ...found, data: spec.data } as never, title);
    queued++;
    console.log(`  覆盖 ${key}`);
  };

  /* ── settings 单例 ──────────────────────────────────────────────────── */
  upsert(
    "settings",
    {
      type: "settings",
      lang: LANG,
      data: {
        site_name: "萱草日签",
        site_tagline: "你和家人的健康手帐",
        logo: undefined,
        primary_nav: [
          navLink("/#philosophy", "设计理念"),
          navLink("/#today", "一家人的今天"),
          navLink("/#changes", "改动有商量"),
          navLink("/#details", "温暖细节"),
        ],
        footer_nav: [
          navLink("/about", "关于我们"),
          navLink("/privacy", "隐私政策"),
          navLink("/terms", "用户协议"),
        ],
        footer_note: p("让健康成为家人之间最温柔的日常。"),
        icp_license: "鄂ICP备2024063300号-1",
        miniprogram_icp_license: "鄂ICP备2024063300号-2X",
        police_license: "鄂公网安备42011102005624号",
        police_license_link: {
          link_type: "Web" as const,
          url: "http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42011102005624",
        },
        baidu_analytics_id: "",
        contact_email: "",
        contact_phone: "",
        contact_address: "",
        social_links: [],
        miniprogram_cta_label: "打开小程序",
        miniprogram_qrcode: undefined,
        miniprogram_qr_title: "微信扫码打开",
        miniprogram_qr_description:
          "使用微信扫描下方二维码，即可打开萱草日签小程序。",
        miniprogram_qr_note: "已上线，扫码即可在微信中使用",
      },
    },
    "站点设置",
  );


  /* ── homepage 单例 ──────────────────────────────────────────────────── */
  upsert(
    "homepage",
    {
      type: "homepage",
      lang: LANG,
      data: {
        meta_title: "萱草日签 - 你和家人的健康手帐",
        meta_description:
          "用药有安排，日常有记录。萱草日签是一款为长辈设计的微信小程序：一家人看到同一份安排，什么时候记都算数，安排改动先核对再生效，每条记录都带着它发生时的那份安排。",
        meta_image: undefined,
        slices: [
          {
            slice_type: "hero",
            variation: "withImage",
            primary: {
              anchor_id: "",
              eyebrow: "你和家人的健康手帐",
              heading: rt(
                marked("heading1", "一家人对现在该怎么做，有[[同一个答案]]"),
              ),
              body: p("今天要做的事，什么时候打开都能记。"),
              primary_link: anchor(site_cta, "打开小程序"),
              secondary_link: anchor("/#today", "了解家人怎么一起用"),
              image: undefined,
            },
            items: [],
          },
          {
            slice_type: "feature_grid",
            variation: "card",
            primary: {
              anchor_id: "philosophy",
              heading: h2("我们做的不是加法，是减法"),
              body: [],
              columns: "2",
              items: [
                {
                  icon: "translate-2",
                  title: "用平时的叫法",
                  description: p(
                    "摒弃晦涩的医学名词，支持使用「红盒子药」「白片片」等长辈习惯的通俗叫法。拒绝严肃医疗带来的压迫感，用日常语言沟通。",
                  ),
                },
                {
                  icon: "time-line",
                  title: "什么时候记都算数",
                  description: p(
                    "没有倒计时，没有逾期红点，没有连续天数。一天里任何时刻记都算数，过了的时段也不会被标红——记录是关怀，不是考勤。",
                  ),
                },
                {
                  icon: "battery-low-line",
                  title: "零库存焦虑",
                  description: p(
                    "刻意不记录剩余数量，不设倒计时。避免制造「还剩多少天」的心理负担，让每一次记录都只关注当下的健康关怀。",
                  ),
                },
                {
                  icon: "eye-line",
                  title: "防御性适老",
                  description: p(
                    "全屏大热区设计，消灭所有隐藏手势和复杂交互。采用无障碍的高视觉对比度，确保长辈在视力衰退情况下也能轻松操作。",
                  ),
                },
              ],
            },
            items: [],
          },
          {
            slice_type: "media_cards",
            variation: "default",
            primary: {
              anchor_id: "today",
              heading: h2("一家人的今天"),
              body: p(
                "谁打开，看到的都是同一份安排。健康安排改过，今天要做的事也跟着更新；已经记好的，不会变。",
              ),
              columns: "2",
              layout: "textFirst",
              items: [
                {
                  eyebrow: "照护者这边",
                  title: "帮家人记，记在 TA 名下",
                  body: rt(
                    marked(
                      "paragraph",
                      "还没用微信的家人也行——你替 TA 记，**记的是 TA 的**，落款写**谁记的**，两件事分开写。TA 自己开始用了，手帐接着原来的走。",
                    ),
                  ),
                  image: undefined,
                },
                {
                  eyebrow: "长辈这边",
                  title: "打开看到的，是同一份",
                  body: p(
                    "你这边改了，妈妈那边今天要做的事马上跟着更新；她记好的，你也看得到。",
                  ),
                  image: undefined,
                },
              ],
            },
            items: [],
          },
          {
            slice_type: "callout",
            variation: "default",
            primary: {
              icon: "lock-2-line",
              title: "也可以只给自己看",
              body: p(
                "「不让家人看到我的记录」随时可以打开，不用跟谁交代；想让家人看见，也由你说了算。看得见看不见，由这条记在哪本手帐里决定，不是挂在每条记录上的一个开关。",
              ),
            },
            items: [],
          },
          {
            slice_type: "media_cards",
            variation: "default",
            primary: {
              anchor_id: "changes",
              heading: h2("改动有商量"),
              body: p(
                "改安排不是谁点谁算。改动先摊开核对再生效，以前的样子永远留着。",
              ),
              columns: "3",
              layout: "imageFirst",
              items: [
                {
                  eyebrow: "",
                  title: "改一改",
                  body: p(
                    "始终告诉你在改哪一版；改了不会直接生效，没保存的草稿也不会丢。",
                  ),
                  image: undefined,
                },
                {
                  eyebrow: "",
                  title: "要这样改吗？",
                  body: p(
                    "保存前把安排改动逐条摊开；要是别人刚改过，你的改动不会盖掉 TA 的。",
                  ),
                  image: undefined,
                },
                {
                  eyebrow: "",
                  title: "家人看过",
                  body: p(
                    "知情不是审批。「看过」只表示这个人看到了这次改动，不代表 TA 同意、批准，也不代表已经做了。没人看过也不影响记录，不打断、不卡流程、不催任何人。",
                  ),
                  image: undefined,
                },
              ],
            },
            items: [],
          },
          {
            slice_type: "image_text",
            variation: "default",
            primary: {
              heading: h2("每条记录，带着它发生时的那份安排"),
              body: p(
                "翻看哪天记了什么，每一条都能看出当时是按哪份安排做的。健康安排以后再怎么改，都动不了已经记下的事。",
              ),
              image: undefined,
              link: { link_type: "Any" as const },
            },
            items: [],
          },
          {
            slice_type: "feature_grid",
            variation: "quote",
            primary: {
              anchor_id: "details",
              heading: h2("藏在细节里的温柔"),
              items: [
                {
                  icon: "sun-cloudy-line",
                  title: "好好过日子",
                  quote: "今天没有别的了。剩下的时间，好好过日子。",
                  description: p(
                    "做完了，页面就让你走——不邀功，不推下一件事，也不给你摆一个要追赶的进度。",
                  ),
                },
                {
                  icon: "parent-line",
                  title: "帮忙的人写在明处",
                  quote: "这份安排由女儿管着。要改时间或用量，跟她说一声。",
                  description: p(
                    "谁在帮着记，写在明处。长辈知道这一条背后是谁的心意；要改，也知道跟谁商量。",
                  ),
                },
                {
                  icon: "question-answer-line",
                  title: "不知道就说不知道",
                  quote: "当时按的是哪一版，我们没法确认。",
                  description: p(
                    "查不到的事我们不猜。说清楚哪些确定、哪些不确定，比装作都知道更让人放心。",
                  ),
                },
              ],
            },
            items: [],
          },
          {
            slice_type: "cta_banner",
            variation: "light",
            primary: {
              anchor_id: "cta",
              heading: h2("准备好为家里记下第一件小事了吗？"),
              body: p("无需下载 App，微信里打开就能用。"),
              primary_link: anchor(site_cta, "免费使用萱草日签"),
              secondary_link: { link_type: "Any" as const },
              show_qrcode: true,
            },
            items: [],
          },
        ],
      },
    },
    "首页",
  );

  /* ── news_index 单例 ────────────────────────────────────────────────
     /news 路由靠 getSingle("news_index") 取数，缺了它构建直接失败。 */
  upsert(
    "news_index",
    {
      type: "news_index",
      lang: LANG,
      data: {
        meta_title: "新闻动态",
        meta_description: "萱草日签的产品与团队动态。",
        meta_image: undefined,
        slices: [
          {
            slice_type: "hero",
            variation: "default",
            primary: {
              anchor_id: "",
              eyebrow: "",
              heading: h1("新闻动态"),
              body: p("产品更新与团队近况。"),
              primary_link: { link_type: "Any" as const },
              secondary_link: { link_type: "Any" as const },
            },
            items: [],
          },
        ],
      },
    },
    "新闻动态",
  );


  /* ── 各建一篇 page / news_post ──────────────────────────────────────
     不是为了内容，是为了构建能过：output: "export" 下动态路由的
     generateStaticParams() 返回空数组会直接让构建失败（见 §9）。 */
  upsert(
    "page/about",
    {
      type: "page",
      uid: "about",
      lang: LANG,
      data: {
        meta_title: "关于我们",
        meta_description: "萱草日签是谁，为什么做这件事。",
        meta_image: undefined,
        slices: [
          {
            slice_type: "hero",
            variation: "default",
            primary: {
              anchor_id: "",
              eyebrow: "关于我们",
              heading: h1("让健康成为家人之间最温柔的日常"),
              body: p("这是一篇占位页面，内容待补。"),
              primary_link: { link_type: "Any" as const },
              secondary_link: { link_type: "Any" as const },
            },
            items: [],
          },
        ],
      },
    },
    "关于我们",
  );


  upsert(
    "news_post/hello",
    {
      type: "news_post",
      uid: "hello",
      lang: LANG,
      data: {
        title: h1("萱草日签上线了"),
        excerpt: "这是一篇占位新闻，内容待补。",
        cover: undefined,
        published_at: "2026-09-16",
        meta_title: "萱草日签上线了",
        meta_description: "这是一篇占位新闻，内容待补。",
        meta_image: undefined,
        slices: [
          {
            slice_type: "rich_text",
            variation: "default",
            primary: { content: p("正文待补。") },
            items: [],
          },
        ],
      },
    },
    "萱草日签上线了",
  );


  /* ── release_index 单例 ────────────────────────────────────────────
     /changelog 路由靠 getSingle("release_index") 取数，缺了它构建直接失败，
     与 news_index 同理。 */
  upsert(
    "release_index",
    {
      type: "release_index",
      lang: LANG,
      data: {
        meta_title: "更新日志",
        meta_description: "萱草日签每一版改了什么。",
        meta_image: undefined,
        slices: [
          {
            slice_type: "hero",
            variation: "default",
            primary: {
              anchor_id: "",
              eyebrow: "",
              heading: h1("更新日志"),
              body: p("我们一直在改。每一版动了什么，都记在这里。"),
              primary_link: { link_type: "Any" as const },
              secondary_link: { link_type: "Any" as const },
            },
            items: [],
          },
        ],
      },
    },
    "更新日志",
  );


  /* ── 几条 release_note ──────────────────────────────────────────────
     与 news_post 不同，这些**不是**构建的必需品：/changelog 没有动态路由，
     一条都没有时那一页只渲染「暂无内容」，整站照样构建得出来
     （见 src/app/changelog/page.tsx 的注释）。

     建这几条是为了让时间轴和「发布节奏」那张卡一上手就有东西可看 ——
     那张卡的四个数字全由这些文档推导，空着就看不出它在做什么。

     ⚠️ 全是占位文案，上线前换成真实的修订记录。 */
  for (const release of [
    {
      uid: "v1-2-0",
      version: "v1.2.0",
      released_at: "2026-09-12",
      title: "健康手帐可以按月导出了",
      is_major: false,
      summary: undefined,
      changes: [
        { kind: "feature", description: "健康手帐支持按月导出为 PDF，方便带去门诊" },
        { kind: "improvement", description: "手帐列表滚动更顺，长列表不再卡顿" },
        { kind: "fix", description: "修正跨时区时健康记录日期偏移一天的问题" },
      ],
    },
    {
      uid: "v1-1-0",
      version: "v1.1.0",
      released_at: "2026-08-21",
      title: "一家人的健康安排可以共享了",
      is_major: false,
      summary: undefined,
      changes: [
        { kind: "feature", description: "健康安排支持共享给家庭成员" },
        { kind: "improvement", description: "新增健康记录时默认带上今天的日期" },
        { kind: "fix", description: "修正部分机型上日期选择器无法关闭的问题" },
      ],
    },
    {
      uid: "v1-0-0",
      version: "v1.0.0",
      released_at: "2026-07-15",
      title: "萱草日签正式上线",
      is_major: true,
      summary: p("第一个正式版本。健康手帐、健康安排、健康记录三件事都能用了。"),
      changes: [
        { kind: "feature", description: "健康手帐：把一家人的健康小事记在一处" },
        { kind: "feature", description: "健康安排：吃药、复诊、体检都能提前提醒" },
        { kind: "feature", description: "健康记录：血压、体重这些数字可以连着看" },
      ],
    },
  ] as const) {
    upsert(
      `release_note/${release.uid}`,
      {
        type: "release_note",
        uid: release.uid,
        lang: LANG,
        data: {
          version: release.version,
          released_at: release.released_at,
          title: release.title,
          summary: release.summary,
          is_major: release.is_major,
          link: { link_type: "Any" as const },
          changes: release.changes.map((change) => ({ ...change })),
        },
      },
      release.version,
    );
  }


  /* ── 法务页占位 ──────────────────────────────────────────────────────
     页脚链到 /privacy 与 /terms。静态导出下链到不存在的路径就是硬 404，
     所以先建两页把链接接上。

     ⚠️ 正文是空的，只写了「内容整理中」。隐私政策与用户协议是法律文本，
     不能由脚本编造 —— **上线前必须由人补齐真正的条款**。国内主体做了 ICP
     备案，这两页的实质内容是合规要求，不是可选项。 */
  for (const [uid, title, note] of [
    ["privacy", "隐私政策", "我们如何收集、使用与保护你的信息。"],
    ["terms", "用户协议", "使用萱草日签时你我各自的权利与责任。"],
  ] as const) {
    upsert(
      `page/${uid}`,
      {
        type: "page",
        uid,
        lang: LANG,
        data: {
          meta_title: title,
          meta_description: note,
          meta_image: undefined,
          slices: [
            {
              slice_type: "hero",
              variation: "default",
              primary: {
                anchor_id: "",
                eyebrow: "",
                heading: h1(title),
                body: p(note, "内容整理中，上线前补齐。"),
                primary_link: { link_type: "Any" as const },
                secondary_link: { link_type: "Any" as const },
              },
              items: [],
            },
          ],
        },
      },
      title,
    );
  }

  /* ── 执行 ───────────────────────────────────────────────────────────── */
  if (queued === 0) {
    console.log("✓ 所有文档都已存在，无需写入（要覆盖内容加 --update）");
    return;
  }

  console.log(`写入 migration release（${queued} 篇）...`);
  await client.migrate(migration, {
    reporter: (event) => console.log(`  ${event.type}`),
  });

  console.log("发布 migration release ...");
  await client.publishMigrationRelease();
  console.log("✓ 完成");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
