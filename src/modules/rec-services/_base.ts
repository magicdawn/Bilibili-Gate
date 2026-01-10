import { useCallback, useRef, type ReactNode } from 'react'
import { APP_CLS_TAB_BAR } from '$common'
import type { RecItemTypeOrSeparator } from '$define'

export type IService<T = RecItemTypeOrSeparator> = {
  hasMore: boolean
  loadMore: (abortSignal: AbortSignal) => Promise<T[] | undefined>
  tabbarView?: ReactNode
  sidebarView?: ReactNode // optional
}

export type ITabService = IService & {
  restore: () => void
  tabbarView: ReactNode // required, empty can be represented by `undefined`
}

export abstract class BaseTabService<T extends RecItemTypeOrSeparator = RecItemTypeOrSeparator> implements ITabService {
  abstract tabbarView: ReactNode
  abstract sidebarView?: ReactNode
  abstract hasMoreExceptQueue: boolean
  abstract fetchMore(abortSignal: AbortSignal): Promise<T[] | undefined>

  qs: QueueStrategy<T>
  constructor(qsPageSize: number) {
    this.qs = new QueueStrategy(qsPageSize)
  }

  get hasMore() {
    return !!this.qs.bufferQueue.length || this.hasMoreExceptQueue
  }

  restore(): void {
    this.qs.restore()
  }

  async loadMore(abortSignal: AbortSignal): Promise<T[] | undefined> {
    if (!this.hasMore) return
    if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue()

    // fill queue
    const more = await this.fetchMore(abortSignal)
    if (more?.length) this.qs.bufferQueue.push(...more)

    // slice from queue
    return this.qs.sliceFromQueue()
  }
}

export class QueueStrategy<T = RecItemTypeOrSeparator> {
  // full-list = returnQueue + bufferQueue + more
  private returnQueue: T[] = []
  bufferQueue: T[] = []

  get hasCache() {
    return !!this.returnQueue.length
  }

  ps: number
  constructor(ps = 20) {
    this.ps = ps
  }

  sliceCountFromQueue(count: number) {
    if (this.bufferQueue.length) {
      const sliced = this.bufferQueue.slice(0, count) // sliced
      this.bufferQueue = this.bufferQueue.slice(count) // rest
      return this.doReturnItems(sliced) ?? []
    } else {
      return []
    }
  }

  sliceFromQueue(page = 1) {
    return this.sliceCountFromQueue(this.ps * page)
  }

  // add to returnQueue
  doReturnItems(items: T[] | undefined) {
    this.returnQueue = [...this.returnQueue, ...(items ?? [])]
    return items
  }

  // restore from returnQueue
  restore() {
    this.bufferQueue = [...this.returnQueue, ...this.bufferQueue]
    this.returnQueue = []
  }

  get fetchedCount() {
    return this.returnQueue.length + this.bufferQueue.length
  }
}

export function usePopupContainer<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const getPopupContainer = useCallback(() => {
    return ref.current?.closest<T>(`.${APP_CLS_TAB_BAR}`)?.parentElement || document.body
  }, [])
  return { ref, getPopupContainer }
}
