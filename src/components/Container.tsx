import type { ReactNode } from "react";

/**
 * 统一的内容宽度容器。所有 slice 都套这一层，保证左右边距和最大宽度一致。
 *
 * 两层而不是一层：外层给左右留白，内层压上限。合成一层的话 `max-w-content`
 * 量的是 border box，padding 会从里面扣掉 —— 令牌写 72rem，实际内容只有 68rem，
 * 读令牌的人拿不到真实宽度。现在 `--container-content` 就是内容的净宽。
 *
 * 留白档位比原型页的 `px-6 md:px-12 lg:px-24` 收敛：原型页从 lg(1024) 起就是
 * 96px，在 1024–1280 这段反而比本站原先的 32px 更挤。这里把大档推到 xl(1280)
 * 之后，任何视口宽度下都不比改动前窄。1400px 的上限本身不受影响 —— 视口过了
 * 1496px 就由它说了算，留白档位只影响这之前的区间。
 *
 * 实际内容宽度：1280px 视口 1184（原 1088）· 1440px 1344 · ≥1496px 稳定 1400。
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full px-6 md:px-8 xl:px-12 ${className}`.trim()}>
      <div className="mx-auto w-full max-w-content">{children}</div>
    </div>
  );
}
