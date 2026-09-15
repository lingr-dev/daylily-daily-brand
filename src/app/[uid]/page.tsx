import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * 通用页面：关于我们、解决方案、联系我们、隐私政策 … 都是这一个类型，
 * 内容完全由 slice 拼装，加页面不需要开发介入。
 */
export default async function Page({ params }: PageProps<"/[uid]">) {
  const { uid } = await params;
  const [page, settings] = await Promise.all([
    createClient().getByUID("page", uid),
    getSettings(),
  ]);

  return (
    <SliceZone
      slices={page.data.slices}
      components={components}
      context={{ settings }}
    />
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[uid]">): Promise<Metadata> {
  const { uid } = await params;
  const page = await createClient().getByUID("page", uid);

  return buildMetadata({ data: page.data, path: `/${uid}/` });
}

/**
 * 静态导出要求动态路由必须有 generateStaticParams —— 构建期就要知道全部路径。
 * 这也是「编译时生成内容」的落点。
 */
export async function generateStaticParams() {
  const pages = await createClient().getAllByType("page");

  return pages.map((page) => ({ uid: page.uid }));
}
