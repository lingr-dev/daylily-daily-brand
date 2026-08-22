import type { ReactNode } from "react";

/**
 * 统一的内容宽度容器。所有 slice 都套这一层，保证左右边距和最大宽度一致。
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-content px-6 md:px-8 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
