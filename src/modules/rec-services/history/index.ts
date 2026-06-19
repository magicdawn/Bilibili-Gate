import { EApiType } from '$enums'
import { BaseTabService } from '../_base'
import { fetchHistoryCursor, fetchHistorySearch } from './api'
import { EHistoryDeviceType, EHistoryItemType } from './enums'
import type { ReactNode } from 'react'
import type { HistoryItemExtend, RecItemTypeOrSeparator } from '$define'
import type { CursorState } from './api/history-cursor.api'
import type { HistoryItem } from './api/shared.api'

export type HistoryRecServiceConfig = ReturnType<typeof getHistoryRecServiceConfig>

export function getHistoryRecServiceConfig() {
  return {
    searchText: undefined as string | undefined,
    itemType: EHistoryItemType.ALL,
    deviceType: EHistoryDeviceType.ALL,
  }
}

export class HistoryRecService extends BaseTabService {
  static PAGE_SIZE = 20
  usingCursorApi: boolean
  constructor(public config: HistoryRecServiceConfig) {
    super(HistoryRecService.PAGE_SIZE)
    const { itemType, searchText, deviceType } = this.config
    this.usingCursorApi = !searchText && deviceType === EHistoryDeviceType.ALL
  }

  override tabbarView: ReactNode
  override sidebarView?: ReactNode
  override hasMoreExceptQueue: boolean = true

  override fetchMore(abortSignal: AbortSignal): Promise<RecItemTypeOrSeparator[] | undefined> {
    return this.usingCursorApi ? this.fetchViaCursorApi(abortSignal) : this.fetchViaSearchApi(abortSignal)
  }

  static extendItems(items: HistoryItem[]): HistoryItemExtend[] {
    return items.map((x) => {
      const ret: HistoryItemExtend = {
        ...x,
        api: EApiType.History,
        uniqId: crypto.randomUUID(), // !TODO: figure out uniqId
      }
      return ret
    })
  }

  private cursorState: CursorState | undefined
  async fetchViaCursorApi(abortSignal: AbortSignal) {
    const { hasMore, list, cursor } = (
      await fetchHistoryCursor({
        itemType: this.config.itemType,
        cursorState: this.cursorState,
        ps: this.qs.ps,
        abortSignal,
      })
    ).unwrap()
    this.hasMoreExceptQueue = hasMore
    this.cursorState = cursor
    return HistoryRecService.extendItems(list)
  }

  private searchPage = 1
  async fetchViaSearchApi(abortSignal: AbortSignal) {
    const { hasMore, list, page } = (
      await fetchHistorySearch({
        itemType: this.config.itemType,
        keyword: this.config.searchText || '',
        deviceType: this.config.deviceType,
        pn: this.searchPage++,
        abortSignal,
      })
    ).unwrap()
    this.hasMoreExceptQueue = hasMore
    return HistoryRecService.extendItems(list)
  }
}
