import type { Interpolation, Theme } from '@emotion/react'

export type CssProp = Interpolation<Theme>

export type AnyFunction = (...args: any[]) => any

export type Nil = null | undefined

// GPT-5.2 建议
// export type Nullable<T> = T | null
// export type Maybe<T> = T | undefined
// export type Optional<T> = T | null | undefined

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`)
}
