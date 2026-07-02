import { useEventListener, useMemoizedFn } from 'ahooks'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { baseDebug } from '$common'
import { $headerHeight } from '$header'

const debug = baseDebug.extend('components:RecGrid:paged')

// 滚轮翻页节流: 一次连续滚动只翻一页
const WHEEL_COOLDOWN_MS = 350

// 估算的卡片行高(含 row-gap), 用于推算每页行数
const ESTIMATED_ROW_HEIGHT = 230

export type UsePagedHorizontalOptions = {
  enabled: boolean
  /** viewport 元素, 监听 wheel + 计算可用高度 */
  viewportRef: RefObject<HTMLElement | null>
  /** 每页固定列数. 未提供时按 viewport 宽度和 minColumnWidth 自适应计算 */
  fixedColumnCount?: number
  /** 自适应列数时的最小列宽 */
  minColumnWidth: number
  /** 视频卡片总数(不含 separator) */
  itemCount: number
  /** 是否还有更多 */
  hasMore: boolean
  /** 触发加载更多 */
  loadMore: () => void
  /** 是否使用 window 作为滚动容器(首页), 用于计算可用高度 */
  infiniteScrollUseWindow: boolean
}

export type PagedHorizontalState = {
  /** 当前页码, 0-based */
  pageIndex: number
  /** 每页行数 */
  rows: number
  /** 每页列数 */
  cols: number
  /** 总页数 */
  pageCount: number
  /** JS 计算出的视口可用高度(px) */
  viewportHeight: number
  goToPage: (page: number) => void
  prevPage: () => void
  nextPage: () => void
}

export function usePagedHorizontal({
  enabled,
  viewportRef,
  fixedColumnCount,
  minColumnWidth,
  itemCount,
  hasMore,
  loadMore,
  infiniteScrollUseWindow,
}: UsePagedHorizontalOptions): PagedHorizontalState {
  const [pageIndex, setPageIndex] = useState(0)
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(1)
  const [viewportHeight, setViewportHeight] = useState(0)

  // 计算每页行数: 视口可用高度 / 估算行高
  const recompute = useMemoizedFn(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const availableHeight = infiniteScrollUseWindow
      ? window.innerHeight - $headerHeight.get() - 55 - 20 // 55: tabbar, 20: 间距
      : viewport.clientHeight || window.innerHeight - $headerHeight.get() - 55 - 20

    setViewportHeight((prev) => (prev !== availableHeight ? availableHeight : prev))

    const nextRows = Math.max(1, Math.floor(availableHeight / ESTIMATED_ROW_HEIGHT))

    const viewportWidth = viewport.clientWidth || window.innerWidth
    const nextCols = fixedColumnCount || Math.max(1, Math.floor(viewportWidth / minColumnWidth))

    setRows((prev) => (prev !== nextRows ? nextRows : prev))
    setCols((prev) => (prev !== nextCols ? nextCols : prev))
  })

  // resize 时重算
  useEventListener('resize', recompute, { target: window })
  useEffect(() => {
    if (!enabled) return
    recompute()
  }, [enabled, fixedColumnCount, itemCount, minColumnWidth, recompute])

  const perPage = Math.max(1, rows * cols)
  const pageCount = Math.max(1, Math.ceil(itemCount / perPage))

  // 越界纠正(例如刷新后)
  useEffect(() => {
    if (pageIndex > pageCount - 1) setPageIndex(Math.max(0, pageCount - 1))
  }, [pageIndex, pageCount])

  const goToPage = useMemoizedFn((page: number) => {
    const clamped = Math.max(0, Math.min(page, pageCount - 1))
    setPageIndex(clamped)
    // 接近末页时预加载
    if (hasMore && clamped >= pageCount - 2) loadMore()
  })
  const prevPage = useMemoizedFn(() => goToPage(pageIndex - 1))
  const nextPage = useMemoizedFn(() => goToPage(pageIndex + 1))

  // wheel 翻页
  const lastWheelAt = useRef(0)
  useEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (!enabled) return
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheelAt.current < WHEEL_COOLDOWN_MS) return
      if (Math.abs(e.deltaY) < 4) return
      lastWheelAt.current = now
      debug('wheel deltaY=%s pageIndex=%s', e.deltaY, pageIndex)
      if (e.deltaY > 0) nextPage()
      else prevPage()
    },
    { target: viewportRef, passive: false },
  )

  // 切 tab/刷新后回到第一页
  useEffect(() => {
    if (itemCount === 0) setPageIndex(0)
  }, [itemCount])

  return { pageIndex, rows, cols, pageCount, viewportHeight, goToPage, prevPage, nextPage }
}
