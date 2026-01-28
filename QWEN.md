# 项目：Bilibili-Gate

## 一般说明：

- 生成新的 TypeScript 代码时，请遵循现有的编码风格。
- 生成或修改代码后
  - 使用 `pnpm oxlint --fix example-file` 和 `pnpm eslint --fix example-file` lint 及修复错误. `pnpm lint` 没有包含 `--fix`, 因为手动编写代码使用的是 vscode 的 `codeActionsOnSave` 机制.
  - 使用 `pnpm prettier --write example-file` 格式化代码
  - 顺序为 `oxlint` -> `eslint` -> `prettier`
- 使用 `pnpm typecheck` 保证语法 / 类型正确性, 该命令不适用于特定文件, 而是整个项目. 因为 tsc / tsgo 是作用于整个 project 的.

## 代码风格

改写代码时, 保留风格, 没有必要不要拆分变量 / 组件. 举例:

```ts
const Comp = memo(function () {
  return <div>Hello</div>
})
```

修改上述组件时, 不要拆分成 `CompImpl` 然后 `const Comp = memo(CompImpl)`, 而是保留原始风格.
包括但不限于上述代码.
