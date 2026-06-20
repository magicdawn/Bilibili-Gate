import { cloneElement, type ComponentProps, type ReactElement } from 'react'

export const defaultSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '1em',
  height: '1em',
} as const satisfies ComponentProps<'svg'>
export const defaultSvgFillProps = { fill: 'currentColor' } as const satisfies ComponentProps<'svg'>
export const defaultSvgStrokeProps = { stroke: 'currentColor' } as const satisfies ComponentProps<'svg'>

export function defineSvgFillComponent(svgNode: ReactElement) {
  return function SomeSvgFillComponent(props: ComponentProps<'svg'>) {
    return cloneElement(svgNode, { ...defaultSvgProps, ...defaultSvgFillProps, ...props })
  }
}
