import type { ComponentProps, ReactNode } from 'react'

export function defineSvgComponent(render: (options: ComponentProps<'svg'>) => ReactNode) {
  return (props: ComponentProps<'svg'>) => {
    return render({
      xmlns: 'http://www.w3.org/2000/svg',
      xmlnsXlink: 'http://www.w3.org/1999/xlink',
      width: '1em',
      height: '1em',
      ...props,
    })
  }
}
