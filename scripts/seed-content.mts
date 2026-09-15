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
  const existing = new Set<string>();
  try {
    const readClient = prismic.createClient(config.repositoryName, {
      fetchOptions: { cache: "no-store" },
    });
    for (const doc of await readClient.dangerouslyGetAll()) {
      existing.add(doc.uid ? `${doc.type}/${doc.uid}` : doc.type);
    }
  } catch {
    /* 空仓库或还没有 master ref，当作什么都没有 */
  }

  let created = 0;
  const create = (
    key: string,
    build: () => void,
  ) => {
    if (existing.has(key)) {
      console.log(`  跳过（已存在）${key}`);
      return;
    }
    build();
    created++;
    console.log(`  新建 ${key}`);
  };

  /* ── settings 单例 ──────────────────────────────────────────────────── */
  create("settings", () =>
    migration.createDocument(
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
    )
  );


  /* ── homepage 单例 ──────────────────────────────────────────────────── */
  create("homepage", () =>
    migration.createDocument(
      {
        type: "homepage",
        lang: LANG,
        data: {
          meta_title: "萱草日签 - 你和家人的健康手帐",
          meta_description:
            "用药有安排，日常有记录。萱草日签是一款为长辈设计的微信小程序：一家人看到同一份安排，什么时候记都算数，改动先核对再生效，每条记录都带着它发生时的那份安排。",
          meta_image: undefined,
          slices: [
            {
              slice_type: "hero",
              variation: "withImage",
              primary: {
                anchor_id: "",
                eyebrow: "你和家人的健康手帐",
                heading: h1("一家人对现在该怎么做，有同一个答案"),
                body: p("用药有安排，日常有记录。今天要做的事，什么时候打开都能记。"),
                primary_link: anchor("/#cta", "打开小程序"),
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
                      "摒弃晦涩的医学名词，支持「红盒子药」「白片片」这类长辈习惯的通俗叫法。用日常语言沟通，不带严肃医疗的压迫感。",
                    ),
                  },
                  {
                    icon: "time-line",
                    title: "什么时候记都算数",
                    description: p(
                      "没有倒计时，没有逾期红点，没有连续天数。一天里任何时刻记都算数，过了的时段也不会被标红 —— 记录是关怀，不是考勤。",
                    ),
                  },
                  {
                    icon: "battery-low-line",
                    title: "零库存焦虑",
                    description: p(
                      "刻意不记录剩余数量，不设倒计时。避免制造「还剩多少天」的心理负担，让每一次记录都只关注当下。",
                    ),
                  },
                  {
                    icon: "eye-line",
                    title: "防御性适老",
                    description: p(
                      "全屏大热区，消灭隐藏手势与复杂交互。高视觉对比度，确保视力衰退的长辈也能轻松操作。",
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
                    body: p(
                      "还没用微信的家人也行 —— 你替 TA 记，记的是 TA 的，落款写谁记的，两件事分开写。TA 自己开始用了，手帐接着原来的走。",
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
                body: p("改安排不是谁点谁算。改动先摊开核对再生效，以前的样子永远留着。"),
                columns: "3",
                layout: "imageFirst",
                items: [
                  {
                    eyebrow: "",
                    title: "改一改",
                    body: p("始终告诉你在改哪一版；改了不会直接生效，没保存的草稿也不会丢。"),
                    image: undefined,
                  },
                  {
                    eyebrow: "",
                    title: "要这样改吗？",
                    body: p("保存前把安排改动逐条摊开；要是别人刚改过，你的改动不会盖掉 TA 的。"),
                    image: undefined,
                  },
                  {
                    eyebrow: "",
                    title: "家人看过",
                    body: p(
                      "知情不是审批。「看过」只表示这个人看到了这次改动，不代表同意、批准，也不代表已经做了。没人看过也不影响记录。",
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
                    description: p("做完了，页面就让你走 —— 不邀功，不推下一件事，也不给你摆一个要追赶的进度。"),
                  },
                  {
                    icon: "parent-line",
                    title: "帮忙的人写在明处",
                    quote: "这份安排由女儿管着。要改时间或用量，跟她说一声。",
                    description: p("谁在帮着记，写在明处。长辈知道这一条背后是谁的心意；要改，也知道跟谁商量。"),
                  },
                  {
                    icon: "question-answer-line",
                    title: "不知道就说不知道",
                    quote: "当时按的是哪一版，我们没法确认。",
                    description: p("查不到的事我们不猜。说清楚哪些确定、哪些不确定，比装作都知道更让人放心。"),
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
                primary_link: anchor("/#cta", "免费使用萱草日签"),
                secondary_link: { link_type: "Any" as const },
                show_qrcode: true,
              },
              items: [],
            },
          ],
        },
      },
      "首页",
    )
  );


  /* ── news_index 单例 ────────────────────────────────────────────────
     /news 路由靠 getSingle("news_index") 取数，缺了它构建直接失败。 */
  create("news_index", () =>
    migration.createDocument(
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
    )
  );


  /* ── 各建一篇 page / news_post ──────────────────────────────────────
     不是为了内容，是为了构建能过：output: "export" 下动态路由的
     generateStaticParams() 返回空数组会直接让构建失败（见 §9）。 */
  create("page/about", () =>
    migration.createDocument(
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
    )
  );


  create("news_post/hello", () =>
    migration.createDocument(
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
    )
  );


  /* ── 执行 ───────────────────────────────────────────────────────────── */
  if (created === 0) {
    console.log("✓ 所有文档都已存在，无需写入");
    return;
  }

  console.log(`写入 migration release（${created} 篇）...`);
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
