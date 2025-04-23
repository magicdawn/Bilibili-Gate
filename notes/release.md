## release 步骤

- 完成 features
- 完成 changelog
- npm version patch
- git push origin --all && git push origin --tags

### 手动 tag

注意 `git describe` 需要基于 annotated tag

- `git tag` 打的是轻量标签
- `git tag -s -a -m "1.0.0" v1.0.0`
  - `-s` 签名
  - `-a` annotate
  - `-m` message
  - `-m 1.0.0 v1.0.0` message 不带 v, tag 带 v, 是 npm version patch|minor|major 的习惯
