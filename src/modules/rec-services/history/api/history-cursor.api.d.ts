import type { HistoryItem } from './shared.api'

export interface HistoryCursorJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  cursor: CursorState
  tab: Tab[]
  list: HistoryItem[] | null
}

export interface Tab {
  type: string
  name: string
}

export interface CursorState {
  max: number
  view_at: number
  business: Business
  ps: number
}
