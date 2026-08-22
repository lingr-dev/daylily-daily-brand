import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-section-lg">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="mt-4 text-display-sm font-semibold text-ink">
        页面不存在
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
        这个地址下没有内容，可能是链接已失效或页面已下线。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        返回首页
      </Link>
    </Container>
  );
}
