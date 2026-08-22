/* eslint-disable @next/next/no-img-element --
 * 刻意用原生 <img> 而不是 next/image：`output: 'export'` 下 next/image 的默认
 * loader 不可用，自定义 loader 又只能指向远端图片服务 —— 那等于把请求打回海外，
 * 正是本项目要消除的东西。图片已在构建期本地化并生成 srcset，
 * next/image 能提供的优化这里都已具备。
 */
import rawManifest from "@/generated/image-manifest.json";
import {
  buildImgixUrl,
  imageKey,
  localImagePath,
  type ImageLike,
  type ImageManifest,
} from "@/lib/prismic-image";

const manifest = rawManifest as ImageManifest;

type PrismicImageProps = {
  field: ImageLike | null | undefined;
  /**
   * 该图在各断点下的显示宽度，交给浏览器从 srcset 里挑档位。
   * 写准这个值是省流量的关键 —— 默认 100vw 只对通栏大图正确。
   */
  sizes?: string;
  className?: string;
  /** 首屏可见的图（如 hero 配图）设为 true，跳过懒加载 */
  priority?: boolean;
};

/**
 * 渲染 Prismic 图片字段，走构建期本地化后的静态文件。
 *
 * 刻意不用 next/image：
 * `output: 'export'` 下 next/image 的默认 loader 不可用，而自定义 loader 只能
 * 指向远端服务（等于又把请求打回海外）。这里直接出原生 <img srcset>，
 * 图片全部来自本站 CDN，零跨境请求，也没有运行时依赖。
 */
export function PrismicImage({
  field,
  sizes = "100vw",
  className,
  priority = false,
}: PrismicImageProps) {
  if (!field?.url) return null;

  const alt = field.alt ?? "";
  const key = imageKey(field.url);
  const entry = manifest[key];

  const loading = priority ? undefined : "lazy";
  const fetchPriority = priority ? "high" : undefined;

  if (!entry) {
    /**
     * manifest 里没有这张图，说明本地化脚本没跑或没覆盖到。
     * 回退到 Prismic 原图保证页面不缺图，同时在构建日志里告警 ——
     * 静默降级成跨境请求是我们最不想要的失败方式。
     */
    console.warn(
      `[images] 未本地化的图片，已回退到 Prismic 源: ${field.url}\n` +
        `         先跑 pnpm images 再构建，否则该图会产生跨境请求。`,
    );

    return (
      <img
        src={buildImgixUrl(field.url, 1280)}
        alt={alt}
        width={field.dimensions?.width}
        height={field.dimensions?.height}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    );
  }

  const srcSet = entry.widths
    .map((w) => `${localImagePath(key, w, entry.ext)} ${w}w`)
    .join(", ");

  // 最大档位作为 src，给不支持 srcset 的场景兜底
  const largest = entry.widths[entry.widths.length - 1];

  return (
    <img
      src={localImagePath(key, largest, entry.ext)}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={entry.w}
      height={entry.h}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
}
