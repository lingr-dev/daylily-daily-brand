import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
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
    <SliceZone
      slices={page.data.slices}
      components={components}
      context={{ settings }}
    />
  );
}
