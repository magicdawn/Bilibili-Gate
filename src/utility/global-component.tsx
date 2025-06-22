import { once } from 'es-toolkit'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { APP_CLS_ROOT } from '$common'
import { AppRoot } from '$components/AppRoot'
import type { AnyFunction } from './type'
import type { ComponentType } from 'react'

export function wrapComponent<IProps extends object>({
  Component,
  defaultProps,
  containerClassName,
}: {
  Component: ComponentType<IProps>
  defaultProps: IProps
  containerClassName?: string
}) {
  const proxyProps = proxy<IProps>(defaultProps)

  function WrappedComponent() {
    const props = useSnapshot(proxyProps)
    // https://github.com/emotion-js/emotion/issues/3245
    // @ts-ignore
    return <Component {...props} />
  }

  const mount = once(() => {
    const div = document.createElement('div')
    div.className = clsx(APP_CLS_ROOT, containerClassName)
    document.body.appendChild(div)
    createRoot(div).render(
      <AppRoot>
        <WrappedComponent />
      </AppRoot>,
    )
  })

  function wrapAction<T extends AnyFunction>(action: T) {
    return (...args: Parameters<T>): ReturnType<T> => {
      mount()
      return action(...args)
    }
  }

  type PartialWithStrictValues<T> = {
    [K in keyof T]?: T[K]
  }
  const updateProps = wrapAction((newProps: PartialWithStrictValues<IProps>) => {
    Object.assign(proxyProps, newProps)
  })

  return {
    WrappedComponent,
    proxyProps,
    mount,
    wrapAction,
    updateProps,
  }
}
