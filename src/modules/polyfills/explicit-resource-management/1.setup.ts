// @ts-ignore
// core-js-pure 还是默认使用 native, 改成强制使用 polyfill
import isForced from 'core-js-pure/internals/is-forced'

// @ts-ignore
Symbol.dispose ||= Symbol.for('Symbol.dispose')
// @ts-ignore
Symbol.asyncDispose ||= Symbol.for('Symbol.asyncDispose')
function forceUsePolyfill(globalName: string) {
  isForced.data[globalName.toLowerCase()] = isForced.POLYFILL
}

forceUsePolyfill('DisposableStack')
forceUsePolyfill('AsyncDisposableStack')
