import type { Content } from "@prismicio/client";

/**
 * SliceZone 的 context。
 *
 * slice 组件不能自己取数 —— 它们会同时出现在 server 树和 slice-simulator 的
 * client 树里（见 CLAUDE.md）。需要站点级数据时由 page 取好，经这里传进去。
 */
export type SliceContext = {
  settings: Content.SettingsDocument;
};
