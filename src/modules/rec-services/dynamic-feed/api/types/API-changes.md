# API 变更历史

## 2026-06-03 `author.following`

```ts
{
  // 之前是 boolean, 2026-06-03 发现改为了 1 和 0
  // https://github.com/magicdawn/Bilibili-Gate/issues/240
  following: boolean | number
}
```
