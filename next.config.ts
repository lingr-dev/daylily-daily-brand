import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 纯静态导出。产物在 `out/`，可直接同步到 OSS/COS + CDN，无需 Node 运行时。
   *
   * 代价（Next 官方明确不兼容项，见 docs/tech-research.md 12.2）：
   * Draft Mode、ISR、依赖 Request 的 Route Handler、cookies、rewrites/redirects/headers、
   * Proxy、Server Actions、Intercepting Routes、默认 loader 的图片优化。
   *
   * 预览能力改用 Release ref 构建预发站实现，见 scripts/README 与 docs/tech-research.md 12.1。
   */
  output: "export",

  /**
   * 产物变成 `out/about/index.html` 而不是 `out/about.html`。
   * 映射到 OSS/COS/Nginx 的目录默认索引更干净，避免一类 404。
   */
  trailingSlash: true,

  images: {
    /**
     * 关闭 Next 的运行时图片优化 —— 静态导出下默认 loader 不可用。
     * 图片走构建期本地化管线（scripts/localize-images.ts）：
     * 用 imgix 参数让 Prismic 服务端出图，下载到 public/ 一起发布，
     * 彻底消除国内访问时对海外图片域名的运行时依赖。
     */
    unoptimized: true,
  },

  // 构建期类型检查保持开启，CI 靠它兜底。
  // 注：Next 16 已移除 next.config 的 `eslint` 键（next lint 废弃），
  // lint 走独立的 `pnpm lint`，在 CI 里单独一步执行。
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
