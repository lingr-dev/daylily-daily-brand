import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-section-lg">
      <p className="text-sm font-medium text-brand-deep">404</p>
      <h1 className="mt-4 text-title-1 font-semibold text-content-primary">
        页面不存在
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-content-secondary">
        这个地址下没有内容，可能是链接已失效或页面已下线。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-marketing-peach px-5 py-2.5 text-sm font-medium text-content-primary transition-colors hover:bg-marketing-peach/85"
      >
        返回首页
      </Link>
    </Container>
  );
}
