"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SliceSimulator, getSlices } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";

/**
 * Slice 模拟器 —— Prismic Page Builder 的「逐 slice 实时预览」由这个路由驱动。
 *
 * 官方生成的版本从服务端 `searchParams` 读 state，那会让页面变成动态渲染，
 * 在 `output: 'export'` 下直接构建失败。这里改为客户端读取 URL 参数：
 * 页面本身预渲染成静态外壳，slice state 在浏览器里解析。
 *
 * 结果是纯静态站也保留了 Page Builder 的实时预览 —— 编辑同事在后台拖 slice
 * 时能立刻看到真实渲染效果，不需要任何服务端运行时。
 *
 * 注册模拟器地址：
 *   npx prismic preview set-simulator http://localhost:3000   （本地开发）
 *   npx prismic preview set-simulator https://<线上域名>        （部署后）
 */
function Simulator() {
  const searchParams = useSearchParams();
  const slices = getSlices(searchParams.get("state"));

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={components} />
    </SliceSimulator>
  );
}

export default function SliceSimulatorPage() {
  return (
    <Suspense fallback={null}>
      <Simulator />
    </Suspense>
  );
}
