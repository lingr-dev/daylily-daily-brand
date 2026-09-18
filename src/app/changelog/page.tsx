import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { Container } from "@/components/Container";
import { ReleaseCadence } from "@/components/ReleaseCadence";
import { ReleaseEntry } from "@/components/ReleaseEntry";
import { groupByYear, releaseCadence, toTimeline } from "@/lib/releases";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * 更新日志。
 *
 * 刻意**不做**每条发布的详情页：更新日志是一口气往下滚着读的，
 * 「持续在迭代」这个印象来自一整页的密度和节奏，拆成一堆半空的详情页反而散掉。
 *
 * 顺带绕开了静态导出的一个真实运营风险 —— 动态路由的 generateStaticParams()
 * 返回空数组会让构建失败（见 CLAUDE.md）。这里没有动态路由，
 * 把更新日志全部下架也只是这一页渲染「暂无内容」，整站照样构建得出来。
 *
 * 页面标题与引言由 release_index 单例的 slice zone 承载（hero / rich_text /
 * cta_banner），文案归编辑。时间轴本身是代码，因为它有真实的排版规则。
 */

export async function generateMetadata(): Promise<Metadata> {
  const page = await createClient().getSingle("release_index");

  return buildMetadata({
    data: page.data,
    fallbackTitle: "更新日志",
    path: "/changelog/",
  });
}

export default async function ChangelogPage() {
  const client = createClient();
  const [page, notes, settings] = await Promise.all([
    client.getSingle("release_index"),
    /* 排序与「必须有发布日期」的过滤同出一处，见 toTimeline() 的注释。 */
    client.getAllByType("release_note"),
    getSettings(),
  ]);

  const timeline = toTimeline(notes);
  const cadence = releaseCadence(timeline);
  const years = groupByYear(timeline);

  return (
    <>
      <SliceZone
        slices={page.data.slices}
        components={components}
        context={{ settings }}
      />

      <Container className="py-section">
        <div className="mx-auto max-w-3xl">
          {cadence && <ReleaseCadence cadence={cadence} />}

          {years.length === 0 ? (
            <p className="text-content-secondary">暂无内容。</p>
          ) : (
            <div className={cadence ? "mt-16 grid gap-14" : "grid gap-14"}>
              {years.map(({ year, entries }) => (
                <section key={year}>
                  <h2 className="text-body-sm font-medium tracking-widest text-content-secondary">
                    {year}
                  </h2>
                  {/* 竖线在 ul 上，每条 li 靠 pl-8 让出位置给线和点。 */}
                  <ul className="mt-6 grid gap-10 border-l border-hair">
                    {entries.map((entry) => (
                      <ReleaseEntry key={entry.note.id} entry={entry} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
