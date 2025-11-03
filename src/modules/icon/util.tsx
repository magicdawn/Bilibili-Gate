import type { ComponentProps, ForwardedRef, ReactNode } from 'react'

export function defineSvgComponent(
  render: (options: ComponentProps<'svg'> & { ref: ForwardedRef<SVGSVGElement> }) => ReactNode,
) {
  return forwardRef<SVGSVGElement, ComponentProps<'svg'>>((props, ref) => {
    return render({
      xmlns: 'http://www.w3.org/2000/svg',
      xmlnsXlink: 'http://www.w3.org/1999/xlink',
      width: '1em',
      height: '1em',
      ...props,
      ref,
    })
  })
}
