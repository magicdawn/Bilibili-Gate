// @ts-ignore
Symbol.dispose ||= Symbol.for('Symbol.dispose')
// @ts-ignore
Symbol.asyncDispose ||= Symbol.for('Symbol.asyncDispose')

export { default as AsyncDisposableStack } from 'core-js-pure/actual/async-disposable-stack'
export { default as DisposableStack } from 'core-js-pure/actual/disposable-stack'
