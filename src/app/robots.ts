import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { isReleaseBuild } from "@/prismicio";

/** 静态导出下 metadata route 必须显式声明 force-static */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // 预发站整站禁止抓取，避免和生产站抢收录
  if (isReleaseBuild) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/slice-simulator/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
