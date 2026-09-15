/**
 * 图片占位块。
 *
 * 过渡期用的：图片要托管到外部图床，方案未定之前 Prismic 里的 image 字段一律留空
 * （见 docs/landing-migration.md §6）。留空时画一个虚线框，让「这里该有张图」
 * 在页面上看得见，而不是悄悄塌掉一块版面。
 *
 * 图床接通、图补齐之后这个组件就该删掉 —— 生产环境不该长期挂着占位框。
 */
export function ImagePlaceholder({
  label = "配图",
  /** 完整的 aspect class 字符串。拼出来的动态类名不会被 Tailwind 收集。 */
  aspect = "aspect-[4/3]",
  className = "",
}: {
  label?: string;
  aspect?: "aspect-[4/3]" | "aspect-square" | "aspect-video";
  className?: string;
}) {
  return (
    <div
      className={`flex ${aspect} w-full items-center justify-center rounded-xl border border-dashed border-sand bg-sand-wash ${className}`.trim()}
    >
      <span className="text-body-sm text-content-muted">{label}</span>
    </div>
  );
}
