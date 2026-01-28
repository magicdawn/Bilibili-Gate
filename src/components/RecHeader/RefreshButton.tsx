import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Button } from 'antd'
import clsx from 'clsx'
import { useAnimate } from 'framer-motion'
import {
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type MouseEventHandler,
  type Ref,
} from 'react'
import { useSnapshot } from 'valtio'
import { clsAntdButton } from '$components/fragments'
import { useOnRefresh, useRecSelfContext } from '$components/Recommends/rec.shared'
import { IconForRoll } from '$modules/icon/stat-icons'
import { favStore } from '$modules/rec-services/fav/store'
import { isHotTabUsingShuffle } from '$modules/rec-services/hot'
import { WatchlaterItemsOrder } from '$modules/rec-services/watchlater/watchlater-enum'
import { useSettingsSnapshot } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { useCurrentUsingTab } from './tab'
import { ETab } from './tab-enum'

export type RefreshButtonActions = { click: () => void }
export type RefreshButtonProps = {
  style?: CSSProperties
  className?: string
  refreshHotkeyEnabled?: boolean
  ref?: Ref<RefreshButtonActions>
}
export function RefreshButton({ className = '', style, refreshHotkeyEnabled, ref }: RefreshButtonProps) {
  refreshHotkeyEnabled ??= true
  const { refreshing } = useRecSelfContext().useStore()
  const onRefresh = useOnRefresh()

  const btn = useRef<HTMLButtonElement>(null)
  const click = useMemoizedFn(() => {
    if (!btn.current) return
    if (btn.current.disabled) return
    btn.current.click()
  })

  // click from outside
  useImperativeHandle(ref, () => ({ click }), [])

  // refresh
  useKeyPress(
    'r',
    () => {
      if (shouldDisableShortcut()) return
      if (!refreshHotkeyEnabled) return
      click()
    },
    { exactMatch: true },
  )

  const tab = useCurrentUsingTab()
  const { watchlaterItemsOrder, popularWeeklyUseShuffle } = useSettingsSnapshot()
  const { usingShuffle: favUsingShuffle } = useSnapshot(favStore)
  const text =
    tab === ETab.AppRecommend ||
    tab === ETab.PcRecommend ||
    tab === ETab.KeepFollowOnly ||
    (tab === ETab.Watchlater && watchlaterItemsOrder === WatchlaterItemsOrder.Shuffle) ||
    (tab === ETab.Fav && favUsingShuffle) ||
    (tab === ETab.Hot && isHotTabUsingShuffle(popularWeeklyUseShuffle))
      ? '换一换'
      : '刷新'

  const [scope, animate] = useAnimate()
  const onClick: MouseEventHandler = useMemoizedFn((e?: MouseEvent) => {
    animate(scope.current, { rotate: [0, 360] }, { duration: 0.5, type: 'tween' })
    onRefresh()
  })

  return (
    <Button
      ref={btn}
      style={style}
      className={clsx(clsAntdButton, '[&:disabled]:cursor-wait', className)}
      disabled={refreshing}
      onClick={onClick}
    >
      <IconForRoll ref={scope} className='size-14px' />
      {text}
    </Button>
  )
}
