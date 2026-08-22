import type { NavItem } from "@/lib/site";

/**
 * 导航数据的唯一出口。
 *
 * 现在返回静态配置；接上 Prismic 后改为从 `settings` 单例文档读取
 * （`client.getSingle("settings")`），调用方无需改动。
 */
export async function getPrimaryNav(): Promise<NavItem[]> {
  return [
    { label: "关于我们", href: "/about/" },
    { label: "解决方案", href: "/solutions/" },
    { label: "新闻动态", href: "/news/" },
    { label: "联系我们", href: "/contact/" },
  ];
}

export async function getFooterNav(): Promise<NavItem[]> {
  return [
    { label: "隐私政策", href: "/privacy/" },
    { label: "使用条款", href: "/terms/" },
  ];
}
