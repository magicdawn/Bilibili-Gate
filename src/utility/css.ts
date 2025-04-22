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

export function unoSimpleMerge(...classNames: Array<string | undefined>) {
  const classList = classNames.map(getClassList).flat().filter(Boolean)
  const map = new Map<string, string>()
  for (const cls of classList) {
    let clsSanitize = cls
    if (/\[[\w-]+\]$/.test(cls)) {
      clsSanitize = cls.replace(/(\[[\w-]+\])$/, function (match, p1) {
        return '*'.repeat(p1.length)
      })
    }

    const lastHyphenIndex = clsSanitize.lastIndexOf('-')
    if (lastHyphenIndex === -1) {
      map.set(cls, cls)
      continue
    }
    const key = cls.slice(0, lastHyphenIndex)
    map.set(key, cls)
  }
  return Array.from(map.values()).join(' ')
}

/**
 * @note 注意 `useMemo` deps array.length 不能变化
 */
export function useUnoSimpleMerge(...classNames: Array<string | undefined>) {
  return useMemo(() => unoSimpleMerge(...classNames), [...classNames])
}
