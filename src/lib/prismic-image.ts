/**
 * Prismic 图片本地化 —— 共享的纯逻辑层。
 *
 * 被两处 import，因此这个文件必须保持「纯」：不依赖 React、不依赖 node 内置模块。
 *   1. scripts/localize-images.ts —— 构建前下载图片、产出 manifest（Node 直跑 TS）
 *   2. src/components/PrismicImage.tsx —— 渲染时按 manifest 拼 srcset
 *
 * 为什么要本地化：Prismic 图片托管在 images.prismic.io（imgix），域名在海外。
 * 内容虽然在构建期已烘进 HTML，图片仍是运行时的跨境请求，国内首屏会被拖死。
 * 所以在构建期让 imgix「服务端出图」，把成品下载到 public/ 一起发布。
 *
 * 这样做的额外好处：转码由 imgix 完成，本地不需要 sharp，构建机零 CPU 开销。
 */

/** 宽度阶梯。srcset 只会给出「不超过原图宽度」的档位，绝不放大。 */
export const IMAGE_WIDTHS = [320, 640, 960, 1280, 1920, 2560] as const;

/** imgix 输出质量。78 在中文站常见的产品图/人物图上肉眼无损。 */
export const IMAGE_QUALITY = 78;

/**
 * 输出格式。只出 webp：兼容性已足够（iOS 14+ / 所有现代浏览器），
 * 再加一档 avif 会让下载量和构建时长翻倍，对品牌站不划算。
 */
export const IMAGE_FORMAT = "webp";

/** 本地化后的图片在站点里的路径前缀（对应 public/_img）。 */
export const LOCAL_IMAGE_DIR = "/_img";

/**
 * OG 分享图单独出一份 jpeg。
 *
 * 两个原因：
 *   1. 微信 / 微博 / 各类 IM 的抓取器对 webp 支持不一致，jpeg 才是安全选择；
 *   2. 更重要的是，抓取器在国内访问海外域名经常超时 —— 那意味着分享卡片没有图。
 *      OG 图也必须落在自己的域名上。
 */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_FORMAT = "jpg";

export type ImageManifestEntry = {
  /** 原图宽 */
  w: number;
  /** 原图高 */
  h: number;
  /** 已下载的宽度档位 */
  widths: number[];
  /** 文件扩展名 */
  ext: string;
};

export type ImageManifest = Record<string, ImageManifestEntry>;

/** Prismic 图片字段的最小形状，避免为了类型去 import @prismicio/client。 */
export type ImageLike = {
  url?: string | null;
  alt?: string | null;
  dimensions?: { width: number; height: number } | null;
};

/**
 * 一张图的「身份」。
 *
 * 同一张源图可能以不同裁剪出现（Prismic 用 `rect` 参数表达裁剪 / 编辑框），
 * 不同裁剪必须算作不同的图；而 w/h/fm/q 这些尺寸格式参数由我们接管，
 * 不参与身份判定。
 */
export function imageIdentity(url: string): string {
  const parsed = new URL(url);
  const rect = parsed.searchParams.get("rect");
  return rect ? `${parsed.pathname}?rect=${rect}` : parsed.pathname;
}

/**
 * 由身份算出短 key，用作 public/_img 下的文件名。
 *
 * 自己实现 FNV-1a 而不是用 node:crypto：这个文件要能在浏览器端被打包
 * （slice 组件可能出现在 client 树里，比如 slice 模拟器内部）。
 * 取两个不同种子拼接，把碰撞概率压到品牌站规模下可忽略。
 */
export function imageKey(url: string): string {
  const id = imageIdentity(url);
  return `${fnv1a(id, 0x811c9dc5)}${fnv1a(id, 0x01000193)}`;
}

function fnv1a(input: string, seed: number): string {
  let hash = seed;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 乘 16777619，用移位避免 32 位溢出丢精度
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    hash >>>= 0;
  }
  return hash.toString(36).padStart(7, "0");
}

/** 构造某一宽度档位的 imgix URL，交给 imgix 服务端出图。 */
export function buildImgixUrl(url: string, width: number): string {
  const parsed = new URL(url);
  const params = new URLSearchParams();

  // 裁剪必须保留，否则拿到的是未裁剪的原图
  const rect = parsed.searchParams.get("rect");
  if (rect) params.set("rect", rect);

  params.set("fit", "max");
  params.set("w", String(width));
  params.set("fm", IMAGE_FORMAT);
  params.set("q", String(IMAGE_QUALITY));

  parsed.search = params.toString();
  return parsed.toString();
}

/** 该图需要下载哪些宽度档位。不放大原图。 */
export function widthsFor(naturalWidth: number): number[] {
  const widths: number[] = IMAGE_WIDTHS.filter((w) => w <= naturalWidth);

  if (widths.length === 0) {
    // 原图比最小档还小，就只出原尺寸
    return [naturalWidth];
  }

  // 原图宽度落在两档之间时，补一档原尺寸，保证有最高保真的选项
  const largest = widths[widths.length - 1];
  if (largest < naturalWidth) {
    widths.push(naturalWidth);
  }

  return widths;
}

/** OG 分享图的站内路径。 */
export function ogImagePath(key: string): string {
  return `${LOCAL_IMAGE_DIR}/${key}-og.${OG_IMAGE_FORMAT}`;
}

/** 构造 OG 图的 imgix URL（固定宽度 + jpeg）。 */
export function buildOgImgixUrl(url: string): string {
  const parsed = new URL(url);
  const params = new URLSearchParams();

  const rect = parsed.searchParams.get("rect");
  if (rect) params.set("rect", rect);

  params.set("fit", "max");
  params.set("w", String(OG_IMAGE_WIDTH));
  params.set("fm", OG_IMAGE_FORMAT);
  params.set("q", String(IMAGE_QUALITY));

  parsed.search = params.toString();
  return parsed.toString();
}

/** 本地化后某一档位的站内路径。 */
export function localImagePath(
  key: string,
  width: number,
  ext: string = IMAGE_FORMAT,
): string {
  return `${LOCAL_IMAGE_DIR}/${key}-${width}.${ext}`;
}
