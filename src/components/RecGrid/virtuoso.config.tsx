import { LogLevel, type GridComponents } from 'react-virtuoso'
import type { ComponentType } from 'react'
import type { SetRequired } from 'type-fest'

/**
 * 剩下的问题: 闪屏
 */

export const ENABLE_VIRTUAL_GRID = false

if (ENABLE_VIRTUAL_GRID) {
  // @ts-ignore
  ;(globalThis as any).VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG
  if (typeof unsafeWindow !== 'undefined') {
    ;(unsafeWindow as any).VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG
  }
}

export type CustomGridContext = {
  footerContent: React.ReactNode
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  gridClassName: string
}

// 使用条件类型来提取 ComponentType 中的 Props 类型
type __PropsOf<TComponent> = TComponent extends ComponentType<infer P> ? P : never
export type CustomGridComponents = GridComponents<CustomGridContext>
type CustomGridComponentsContextRequired = {
  [key in keyof CustomGridComponents]: ComponentType<SetRequired<__PropsOf<CustomGridComponents[key]>, 'context'>>
}

// Ensure that this stays out of the component,
// Otherwise the grid will remount with each render due to new component instances.
export const gridComponents: CustomGridComponentsContextRequired = {
  List: forwardRef(({ context: ctx, children, ...props }, ref) => {
    // ref required by react-virtuoso
    function setForwardedRef(el: HTMLDivElement | null) {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(el)
      } else {
        ref.current = el
      }
    }

    return (
      <div
        ref={(el) => {
          setForwardedRef(el)
          ctx!.containerRef.current = el
        }}
        {...props}
        className={ctx.gridClassName}
      >
        {children}
        {/* {ctx.footerContent} */}
      </div>
    )
  }),

  Footer({ context: ctx, ...props }) {
    return <>{ctx.footerContent}</>
  },
  // Item: ({ context: ctx, children, ...props }) => {
  //   // const cloned = cloneElement(children)
  //   // return null
  // },
}
