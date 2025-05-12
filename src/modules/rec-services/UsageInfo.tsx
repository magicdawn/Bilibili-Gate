import { ETab } from '$components/RecHeader/tab-enum'
import { DynamicFeedUsageInfo } from './dynamic-feed/usage-info'
import { WatchlaterUsageInfo } from './watchlater/usage-info'
import type { ServiceMap } from './service-map'
import type { ComponentProps, FunctionComponent } from 'react'

export type UsageInfoFor<T extends ETab> = FunctionComponent<{ service: ServiceMap[T] }>
export type UsageInfoPropsFor<T extends ETab> = ComponentProps<UsageInfoFor<T>>

const componentMap: Partial<Record<ETab, FunctionComponent<{ service: ServiceMap[ETab] }>>> = {}
const defineComponent = function <T extends ETab>(tab: T, Component: UsageInfoFor<T>) {
  componentMap[tab] = Component as UsageInfoFor<ETab>
}

defineComponent(ETab.DynamicFeed, DynamicFeedUsageInfo)
defineComponent(ETab.Watchlater, WatchlaterUsageInfo)

/**
 * current not used
 */
export const UsageInfo = memo(function <T extends ETab>({ tab, service }: { tab: T; service: ServiceMap[T] }) {
  const C = componentMap[tab]
  if (!C) return
  // @ts-ignore
  return <C service={service} />
})
