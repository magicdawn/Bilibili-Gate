import { useMemoizedFn } from 'ahooks'
import { Button, Space } from 'antd'
import { fastSortWithRules, type FastSortRule } from 'fast-sort-lens'
import { IconForAsc, IconForDesc, IconForSortAToZ, IconForSortZToA } from '$modules/icon'
import { isFavFolderDefault } from '$modules/rec-services/fav/fav-util'
import { mapNameForSort, zhLocaleComparer, zhLocaleDescComparer } from '$utility/sort'
import { assertNever } from '$utility/type'
import type { ReactNode } from 'react'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

export const allowedFavFolderOrder = ['default', 'name-asc', 'name-desc', 'count-asc', 'count-desc'] as const
export type FavFolderOrder = (typeof allowedFavFolderOrder)[number]
export function isValidFavFolderOrder(order: string): order is FavFolderOrder {
  return allowedFavFolderOrder.includes(order as FavFolderOrder)
}

function mapFavFolderTitleForSort(title: string) {
  title = title.replace(/^[\s\p{RGI_Emoji}]+/v, '') // rm leading space & emoji
  title = mapNameForSort(title)
  return title
}

export function sortFavFolders(originalFolders: FavFolder[], order: FavFolderOrder) {
  const ruleDefaultFirst: FastSortRule<FavFolder> = { prop: (f) => (isFavFolderDefault(f.attr) ? 1 : 0), order: 'desc' }
  const ruleByNameAsc: FastSortRule<FavFolder> = {
    prop: (f) => mapFavFolderTitleForSort(f.title),
    order: zhLocaleComparer,
  }
  const ruleByNameDesc: FastSortRule<FavFolder> = {
    prop: (f) => mapFavFolderTitleForSort(f.title),
    order: zhLocaleDescComparer,
  }
  const ruleByCountDesc: FastSortRule<FavFolder> = { prop: 'media_count', order: 'desc' }
  const ruleByCountAsc: FastSortRule<FavFolder> = { prop: 'media_count', order: 'asc' }

  if (!allowedFavFolderOrder.includes(order)) order = 'default'
  if (order === 'default') return originalFolders
  if (order === 'name-asc') return fastSortWithRules(originalFolders, [ruleDefaultFirst, ruleByNameAsc])
  if (order === 'name-desc') return fastSortWithRules(originalFolders, [ruleDefaultFirst, ruleByNameDesc])
  if (order === 'count-desc')
    return fastSortWithRules(originalFolders, [ruleDefaultFirst, ruleByCountDesc, ruleByNameAsc])
  if (order === 'count-asc')
    return fastSortWithRules(originalFolders, [ruleDefaultFirst, ruleByCountAsc, ruleByNameAsc])
  assertNever(order)
}

type ActiveTab = 'default' | 'name' | 'count'
const TabConfig: Record<
  ActiveTab,
  { label: ReactNode; iconAsc?: ReactNode; iconDesc?: ReactNode; toggle?: FavFolderOrder[]; default?: FavFolderOrder }
> = {
  default: {
    label: '默认',
  },
  name: {
    label: '名称',
    iconAsc: <IconForSortAToZ className='1em' />,
    iconDesc: <IconForSortZToA className='1em' />,
    toggle: ['name-asc', 'name-desc'],
    default: 'name-asc',
  },
  count: {
    label: '数量',
    iconAsc: <IconForAsc className='1em' />,
    iconDesc: <IconForDesc className='1em' />,
    toggle: ['count-asc', 'count-desc'],
    default: 'count-desc',
  },
}

export function FavFolderOrderSwitcher({
  value,
  onChange,
  className,
}: {
  value: FavFolderOrder
  onChange: (value: FavFolderOrder) => void
  className?: string
}) {
  const activeTab = value.startsWith('name-') ? 'name' : value.startsWith('count-') ? 'count' : 'default'
  const isDesc = value.includes('-desc')
  const isAsc = value.includes('-asc')

  const handleClick = useMemoizedFn((tab: 'default' | 'name' | 'count') => {
    // same tab: toggle asc/desc
    if (tab === activeTab) {
      const { toggle } = TabConfig[tab]
      if (!toggle?.length) return
      const curIndex = toggle.findIndex((v) => v === value)
      if (curIndex === -1) return
      const nextIndex = (curIndex + 1) % toggle.length
      const nextVal = toggle[nextIndex]
      onChange(nextVal)
    }
    // change tab: use configed default
    else {
      onChange(TabConfig[tab].default ?? 'default')
    }
  })

  return (
    <Space.Compact className={className}>
      {Object.entries(TabConfig).map(([tab, { label, iconAsc, iconDesc }]) => {
        const active = tab === activeTab
        return (
          <Button
            key={tab}
            className='gap-x-2px'
            size='small'
            variant={active ? 'solid' : undefined}
            color={active ? 'primary' : undefined}
            onClick={() => handleClick(tab as ActiveTab)}
          >
            {active && (isAsc ? iconAsc : isDesc ? iconDesc : undefined)}
            {label}
          </Button>
        )
      })}
    </Space.Compact>
  )
}
