import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // 只读 submodule。它们是别的仓库的交付物（原型页里还 vendor 了一份
    // 407KB 的 tailwind.min.js），既不该由本仓库的规则评判，也改不了 ——
    // 不排除的话 `pnpm lint` 永远是红的，CLAUDE.md 里那条验证步骤就成了摆设。
    "uiux/**",
    "req-specs/**",
  ]),
]);

export default eslintConfig;
