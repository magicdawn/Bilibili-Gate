# UnoCSS -> tailwindcss

**评估结论**

- 这次迁移不是“换依赖”级别，属于**中高工作量**：UnoCSS 已经深入到入口、配置、lint、类名语法和 class merge 层。
- 按仓库文本搜索粗算：`useUnoMerge/unoMerge` 约 **47** 处，variant group **5** 处，arbitrary variant **126** 处，Uno shortcut **52** 处，自定义 gate/bili 颜色类约 **40** 处。
- 好消息是：我**没找到** `@apply` / `--at-apply` 这类 directive 用法，所以没有额外的“把 CSS 指令迁出 SCSS”的负担。

**需要改的地方**

- **入口与构建链**：`/Bilibili-Gate/src/index.ts:16` 的 `virtual:uno.css`、`/Bilibili-Gate/vite.config.ts:9` 的 `UnoCSS()`、`/Bilibili-Gate/uno.config.ts:5` 起的整套 Uno 配置，都要切到 Tailwind 4 的 CSS 入口 + `@theme` / `@utility` / `@custom-variant` 方案。
- **依赖和 lint**：`/Bilibili-Gate/package.json:67`、`:96`、`:118` 里的 `unocss-merge` / `unocss` / `@unocss/*` 要替换；`/Bilibili-Gate/eslint.config.ts:11` 的 `unocss/order` 规则也要跟着换掉。
- **主题 token**：`/Bilibili-Gate/uno.config.ts:45` 起定义的 gate/bili colors、borderRadius，Tailwind 4 可以用 `@theme` 迁过去；这部分属于“可配置映射”，不是最大难点。
- **暗/亮模式**：`/Bilibili-Gate/uno.config.ts:10`、`:22` 里自定义的 `.bilibili-gate-using-dark` / `.bilibili-gate-using-light` 选择器，需要用 Tailwind 的自定义 variant 复刻；项目里也确实在用 `dark:` 和 `light:`，例如 `/Bilibili-Gate/src/components/_base/BaseModal.tsx:14`、`/Bilibili-Gate/src/components/ModalSettings/tab-panes/pane-filter.tsx:20`。
- **容器查询**：`/Bilibili-Gate/src/components/RecGrid/index.tsx:500` 的 `@container-inline-size` 要换成 Tailwind 的 container query 写法。

**UnoCSS 特有、且项目里实际在用的点**

- **Variant group 语法**：像 `hover:(...)`、`light:hover:(...)`、`[&...]:(...)` 这类写法，项目里有 5 处；Tailwind 4 有 variant 能力，但**没有 Uno 这种分组语法**，需要展开成单个 class。例子见 `/Bilibili-Gate/src/main/space-page/add-action-buttons.tsx:120`、`/Bilibili-Gate/src/components/_base/BaseModal.tsx:120`。
- **自定义 shortcut**：`flex-v-center`、`flex-center`、`inline-flex-center`、`icon-only-round-button`、`inline-icon-only-round-button` 都是 `uno.config.ts:82-89` 的 shortcuts，且在多处调用；Tailwind 里要么改成 `@utility`，要么直接展开成标准工具类。
- **大量 Uno 风格“属性式”类名**：项目里广泛用 `size-24px`、`w-500px`、`p-x-2`、`text-size-14px`、`font-size-12px`、`line-height-18px`、`b-1px`、`rounded-10px`、`transition-duration-150`、`transition-property-transform`、`position-relative`、`aspect-ratio-10/16`、`flex-basis-100%` 这类写法；这些都不是 Tailwind 的原生类名，迁移时要么改成 Tailwind 标准写法，要么补一层兼容 utility。
- **重要性后缀 `!`**：项目里有 Uno 的后缀式写法，例如 `/Bilibili-Gate/src/components/ModalFavManager/components.tsx:275-276` 的 `bg-gate-primary!`、`hover:bg-gate-primary-lv1!`，Tailwind 需要改成前缀 `!` 形式。
- **arbitrary variants 大量存在**：`/Bilibili-Gate/src/components/fragments.tsx:2`、`/Bilibili-Gate/src/components/ModalSettings/EditableListSettingItem.tsx:100` 这类 `[&...]:...` 选择器在 Tailwind 4 是可支持的，但和 Uno 的分组/重要性组合要一起检查。

**我对迁移难度的判断**

- 如果目标是“尽量少改代码”，更现实的路线是：先在 Tailwind 4 里补一层 **`@theme` + `@utility` + `@custom-variant`** 的兼容层，再替换 `unocss-merge`。
- 如果目标是“顺手把类名体系整理成 Tailwind 原生风格”，那就会变成一轮明显更大的重构，尤其是这些 `*-px`、`text-size-*`、`line-height-*`、`p-x-*`、`b-*` 语法要集中清理。

**参考**

- Tailwind 官方文档：[`Adding custom styles`](https://tailwindcss.com/docs/adding-custom-styles)、[`Theme`](https://tailwindcss.com/docs/theme)、[`Responsive design / container queries`](https://tailwindcss.com/docs/responsive-design#container-queries)

如果你愿意，我下一步可以把这份评估整理成一份**“迁移清单”**，按“必须改 / 可选优化 / 风险点”三栏列出来，方便你直接排期。
