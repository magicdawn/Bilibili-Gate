## vite-plugin-importer

```
"vite-plugin-importer>babel-plugin-import": "^1.13.8"
```

- https://github.com/ant-design/ant-design/issues/43795
- https://github.com/umijs/babel-plugin-import/releases/tag/v1.13.8

## typescript

https://github.com/microsoft/TypeScript/issues/58897#issuecomment-2220808697

```
pnpm add -D typescript@5.4.5
```

## `motion/react` v.s `framer-motion`

- `frame-motion`更底层: `motion` 从 `frame-motion/dom` 重新导出, `motion/react` 从 `frame-motion` 重新导出
- `motion` 的 dist 目录非常乱 https://www.npmjs.com/package/motion/v/12.9.2?activeTab=code 很多重复目录 `es` `lib` 等有多层级
- `framer-motion` 有 UMD build, `motion` 有 UMD build, `motion/react` 无 UMD build
- 所以还是继续用 framer-motion 就行

## `mitt` v.s `emittery`

emittery 可以直接 `emitter.once('event'): Promise<Data>`, 可以省掉 `p-event` 的使用
