import { useHotkey } from '@tanstack/react-hotkeys'
import { useMemoizedFn } from 'ahooks'
import { useState, type RefObject } from 'react'
import { APP_CLS_CARD, APP_CLS_CARD_ACTIVE, appWarn } from '$common'
import { EGridDisplayMode } from '$enums'
import { settings } from '$modules/settings'
import { videoGrid } from './video-grid.module.scss'
import type { VideoCardEmitter } from '$components/VideoCard/index.shared'

interface IOptions {
  enabled: boolean
  minIndex?: number
  maxIndex: number

  /** 用于获取 cards, 获取 col count */
  gridRef: RefObject<HTMLElement | null>

  /** 判断 active card 与 scroller 关系, 判定 activeIndex 是否有效 */
  getScrollerRect: () => DOMRect | null | undefined

  /** 调整 scrollY  */
  changeScrollY?: (options: { offset?: number; absolute?: number }) => void

  /** video-card */
  videoCardEmitters: Array<VideoCardEmitter>

  activeLargePreviewItemIndex: number | undefined
}

// 快捷键
export function useShortcut({
  enabled,
  minIndex = 0,
  maxIndex,
  gridRef,
  getScrollerRect,
  changeScrollY,
  videoCardEmitters,
  activeLargePreviewItemIndex,
}: IOptions) {
  const useCustomHotkey: typeof useHotkey = (hotkey, callback, options) =>
    useHotkey(hotkey, callback, {
      enabled, // set default `enabled` options
      ...options,
    })

  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const activeIndexIsValid = useMemoizedFn(() => {
    if (typeof activeIndex !== 'number') return false
    if (!gridRef.current) return false

    const scrollerRect = getScrollerRect()
    const rect = gridRef.current
      .querySelector<HTMLDivElement>(`.${APP_CLS_CARD}.${APP_CLS_CARD_ACTIVE}`)
      ?.getBoundingClientRect()
    if (!scrollerRect || !rect) return false

    // active 在 scroller 上方, 超过一屏
    if (rect.top - scrollerRect.top < -(scrollerRect.height + rect.height)) {
      return false
    }
    // active 在 scroller 下方, 超过一屏
    if (rect.top - scrollerRect.top > scrollerRect.height * 2 + rect.height) {
      return false
    }

    return true
  })

  function getStep(direction: 'up' | 'down'): number {
    const card = getCardAt(activeIndex!)
    const activeLeft = card.getBoundingClientRect().left
    const isLeftSame = (left: number) => Math.abs(activeLeft - left) < 1

    /**
     * quick try +- col-count
     */
    {
      const col = getColumnCount(gridRef.current)
      const step = direction === 'down' ? col : -col
      const newCard = getCardAt(activeIndex! + step)
      if (newCard) {
        const left = newCard.getBoundingClientRect().left
        if (isLeftSame(left)) {
          return step
        }
      }
    }

    /**
     * step by step
     */
    let step = 0
    let cur: Element = card
    const next = () => (direction === 'down' ? cur.nextElementSibling : cur.previousElementSibling)
    while (next()) {
      cur = next()!
      if (!cur.classList.contains(APP_CLS_CARD)) continue

      direction === 'down' ? step++ : step--
      const left = cur.getBoundingClientRect().left
      if (isLeftSame(left)) {
        return step
      }
    }

    return 0
  }

  const addActiveIndex = (step: number | 'up' | 'down') => (e?: KeyboardEvent) => {
    if (!enabled) return
    // 防止 scroller focus 的情况下, 因键盘产生滑动, 进而页面抖动
    e?.preventDefault()

    let newActiveIndex: number
    if (activeIndexIsValid()) {
      const _step = typeof step === 'number' ? step : getStep(step)
      newActiveIndex = activeIndex! + _step
    } else {
      newActiveIndex = getInitialIndex()
    }

    // overflow
    if (newActiveIndex < minIndex) {
      makeVisible(minIndex)
      return
    }
    if (newActiveIndex > maxIndex) {
      // 滚动到最后一项: 防止不能向下移动, 也不会加载更多, 卡死状态
      makeVisible(maxIndex)
      return
    }

    // console.log({ activeIndex, index, initialIndex: getInitialIndex() })
    setActiveIndex(newActiveIndex)
    makeVisible(newActiveIndex)
  }

  // by 1
  useCustomHotkey('ArrowLeft', addActiveIndex(-1), { requireReset: false })
  useCustomHotkey('ArrowRight', addActiveIndex(1), { requireReset: false })
  useCustomHotkey('Tab', addActiveIndex(1), { requireReset: false })
  useCustomHotkey('Shift+Tab', addActiveIndex(-1), { requireReset: false })
  // by row
  // 不使用 getColCount 是因为, Separator 类型导致有空的位置
  useCustomHotkey('ArrowUp', addActiveIndex('up'), { requireReset: false })
  useCustomHotkey('ArrowDown', addActiveIndex('down'), { requireReset: false })

  // actions
  const clearActiveIndex = () => {
    if (!enabled) return
    setActiveIndex(undefined)
  }
  const getActiveEmitter = () => {
    if (!enabled || typeof activeIndex !== 'number') return
    return videoCardEmitters[activeIndex]
  }

  useCustomHotkey('Escape', clearActiveIndex)
  useHotkey(
    'Enter',
    (e) => {
      if (typeof activeIndex === 'number') {
        e.preventDefault()
        return videoCardEmitters[activeIndex]?.emit('open')
      }

      if (typeof activeLargePreviewItemIndex === 'number') {
        e.preventDefault()
        return videoCardEmitters[activeLargePreviewItemIndex]?.emit('open-with-large-preview-visible')
      }
    },
    { enabled },
  )
  useCustomHotkey('X', () => getActiveEmitter()?.emit('open-in-popup'))
  useCustomHotkey('Backspace', () => getActiveEmitter()?.emit('trigger-dislike'))
  // 稍候再看, s 与 BILIBILI-Envoled 快捷键冲突
  useCustomHotkey('S', () => getActiveEmitter()?.emit('toggle-watch-later'))
  useCustomHotkey('W', () => getActiveEmitter()?.emit('toggle-watch-later'))
  useCustomHotkey('.', () => getActiveEmitter()?.emit('hotkey-preview-animation'))
  useCustomHotkey('P', () => getActiveEmitter()?.emit('hotkey-preview-animation'))

  function getInitialIndex() {
    const scrollerRect = getScrollerRect()
    if (!scrollerRect) return 0

    const cards = getCards()
    for (const [i, card] of cards.entries()) {
      const rect = card.getBoundingClientRect()

      // first fully visible card
      if (rect.top >= scrollerRect.top) {
        return i
      }
    }

    return 0
  }

  const CARDS_SELECTOR = `.${APP_CLS_CARD}`
  function getCards() {
    return [...(gridRef.current?.querySelectorAll<HTMLDivElement>(CARDS_SELECTOR) || [])]
  }
  function getCardAt(index: number) {
    return getCards()[index]
  }

  function makeVisible(index: number) {
    const card = getCardAt(index)
    ;(card as any)?.scrollIntoViewIfNeeded?.(false)

    /**
     * for PureRecommend 手动检测
     */
    const scrollerRect = getScrollerRect()
    const rect = card.getBoundingClientRect()
    if (!scrollerRect || !rect) return

    // 上部遮挡
    if (rect.top <= scrollerRect.top) {
      const offset = -(scrollerRect.top - rect.top + 10)
      changeScrollY?.({ offset })
      return
    }
    // 下面
    if (scrollerRect.bottom - rect.bottom < 20) {
      const offset = 20 - (scrollerRect.bottom - rect.bottom)
      changeScrollY?.({ offset })
      return
    }
  }

  function openVideoAt(index: number) {
    const card = getCardAt(index)
    if (!card) return
    const videoLink = card.querySelector<HTMLAnchorElement>('.bili-video-card__wrap > a')
    videoLink?.click()
  }

  return {
    activeIndex,
    clearActiveIndex,
  }
}

const countCache1 = new Map<string, number>()
const countCache2 = new Map<string, number>()

export function getColumnCount(gridEl?: HTMLElement | null, mayHaveNarrowMode = true) {
  const { gridDisplayMode, useCustomGrid, enableForceColumn, forceColumnCount, cardMinWidth } = settings.grid

  if (gridDisplayMode === EGridDisplayMode.List) return 1
  if (mayHaveNarrowMode && gridDisplayMode === EGridDisplayMode.TwoColumnGrid) return 2
  if (useCustomGrid && enableForceColumn && forceColumnCount) return forceColumnCount

  gridEl ||= document.querySelector<HTMLElement>(`.${videoGrid}`)
  if (!gridEl) {
    appWarn('getColumnCount(): gridEl not found')
    return 0
  }

  const countCache = useCustomGrid ? countCache1 : countCache2
  const cacheKey = new URLSearchParams({
    width: Math.round(gridEl.clientWidth).toString(),
    cardMinWidth: useCustomGrid ? cardMinWidth.toString() : '',
  }).toString()
  {
    const count = countCache.get(cacheKey)
    if (count) return count
  }

  const style = window.getComputedStyle(gridEl)
  if (style.display !== 'grid') {
    appWarn('getColumnCount(): gridEl.style.display !== "grid"')
    return 0
  }

  const count = style.gridTemplateColumns.split(' ').length
  countCache.set(cacheKey, count)
  return count
}
