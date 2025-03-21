import { fastSortWithOrders } from 'fast-sort-lens'
import type { ConditionalKeys } from 'type-fest'

export function mapNameForSort(name: string) {
  return (
    name
      // 让字母在前面
      .replace(/([A-Z])/, '999999$1')
      .replace(/([a-z])/, '999998$1')
  )
}

export function localeComparer(a: string, b: string) {
  return a.localeCompare(b, 'zh-CN')
}

export function sortListByName<T extends object>(
  entries: T[],
  prop: ConditionalKeys<T, string> | ((item: T) => string),
) {
  return fastSortWithOrders(entries, [
    {
      prop: (item) => {
        const val = typeof prop === 'function' ? prop(item) : (item[prop] as string)
        return mapNameForSort(val)
      },
      order: localeComparer,
    },
  ])
}
