import type { NormalRankItem } from './normal'
import type { PgcSeasonRankItem } from './pgc-season'
import type { PgcWebRankItem } from './pgc-web'

export { NormalRankItem, PgcSeasonRankItem, PgcWebRankItem }

export type RankItem = NormalRankItem | PgcSeasonRankItem | PgcWebRankItem
