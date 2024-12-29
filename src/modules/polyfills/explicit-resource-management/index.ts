/**
 * 方式1:
 * import 'core-js/proposals/explicit-resource-management'
 *
 * 方式2:
 * core-js-pure
 *
 * 因 chrome ship 的 `AsyncDisposableStack` 有 bug:
 * `(new AsyncDisposableStack())[Symbol.asyncDispose]` 为 undefined
 * 与 esbuild transform await-using 代码不能一起使用
 * see https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate/discussions/271635
 */

import './1.setup'
export { AsyncDisposableStack, DisposableStack } from './2.export'
