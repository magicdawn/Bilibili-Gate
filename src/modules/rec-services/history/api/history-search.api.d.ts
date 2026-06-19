import type { HistoryItem } from './shared.api'

export interface HistorySearchJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  has_more: boolean
  page: Page
  list: HistoryItem[] | null
}

export interface Page {
  pn: number
  total: number
}
