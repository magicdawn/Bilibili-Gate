import type { Interpolation, Theme } from '@emotion/react'

export type CssProp = Interpolation<Theme>

export type AnyFunction = (...args: any[]) => any

export type Nullable<T> = T | null | undefined

export type Nil = null | undefined
