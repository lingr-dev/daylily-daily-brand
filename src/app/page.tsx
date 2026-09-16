import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { jsonLdScript, softwareApplicationJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    createClient().getSingle("homepage"),
    getSettings(),
  ]);

  return buildMetadata({
    data: page.data,
    fallbackTitle: settings.data.site_name,
    path: "/",
  });
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([
    createClient().getSingle("homepage"),
    getSettings(),
  ]);

  return (
    <>
      {/*
        SoftwareApplication 结构化数据只放首页 —— 它描述的是产品本身，
        每页重复一遍对搜索引擎没有好处。
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            softwareApplicationJsonLd({
              settings,
              description: page.data.meta_description,
            }),
          ),
        }}
      />
      <SliceZone
        slices={page.data.slices}
        components={components}
        context={{ settings }}
      />
    </>
  );
}
