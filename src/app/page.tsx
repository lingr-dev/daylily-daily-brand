import { Container } from "@/components/Container";

/**
 * 首页占位。
 *
 * 接上 Prismic 后，这里改为查询 `homepage` 单例并交给 <SliceZone> 渲染：
 *
 *   const page = await createClient().getSingle("homepage");
 *   return <SliceZone slices={page.data.slices} components={components} />;
 */
export default function Home() {
  return (
    <Container className="py-section-lg">
      <p className="text-sm font-medium text-brand-600">脚手架就绪</p>
      <h1 className="mt-4 max-w-2xl text-display-sm font-semibold text-ink md:text-display">
        品牌站前端骨架已搭好
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
        设计系统、静态导出配置、布局骨架已就位。下一步接入 Prismic
        内容模型，把这里换成 SliceZone 渲染。
      </p>
    </Container>
  );
}
