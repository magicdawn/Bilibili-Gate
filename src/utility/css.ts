import { uniq } from 'es-toolkit'

export type Lcha = Partial<Record<'l' | 'c' | 'h' | 'alpha', number>>

export type DeltaLcha = {
  [key in keyof Lcha as `delta${Capitalize<key>}`]?: Lcha[key]
}

export function tweakColorWithOklch(
  originalColor: string,
  { l, c, h, alpha, deltaL, deltaC, deltaH, deltaAlpha }: Lcha & DeltaLcha = {},
) {
  const lValue = l ?? (deltaL ? `calc(l + ${deltaL})` : 'l')
  const cValue = c ?? (deltaC ? `calc(c + ${deltaC})` : 'c')
  const hValue = h ?? (deltaH ? `calc(h + ${deltaH})` : 'h')

  const alphaValue = alpha ?? (deltaAlpha ? `calc(alpha + ${deltaAlpha})` : '')
  const alphaComponent = alphaValue ? `/ ${alphaValue}` : ''

  return `oklch(from ${originalColor} ${[lValue, cValue, hValue, alphaComponent].filter(Boolean).join(' ')})`
}

export function tweakLightness(originalColor: string, delta: number) {
  return tweakColorWithOklch(originalColor, { deltaL: delta })
}

export function getClassList(className?: string) {
  return uniq(
    (className || '')
      .split(' ')
      .map((x) => x.trim())
      .filter(Boolean),
  )
}

export function hasSize(className?: string) {
  return getClassList(className).some((x) => x.startsWith('size-'))
}

export function hasMarginLeft(className?: string) {
  const classList = getClassList(className)
  return classList.some((x) => x.startsWith('ml-') || x.startsWith('mx-'))
}
