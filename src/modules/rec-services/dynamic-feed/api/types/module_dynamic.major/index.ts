import type { MajorTypeArchive } from './archive'
import type { MajorTypeBlocked } from './blocked'
import type { MajorTypeLiveRcmd } from './live-rcmd'
import type { MajorTypeOpus } from './opus'
import type { MajorTypePgc } from './pgc'
import type { MajorTypeUgcSeason } from './ugc-season'

/**
type: "MAJOR_TYPE_BLOCKED"
archive: null
article: null
blocked: null
common: null
courses: null
draw: null
live: null
live_rcmd: null
medialist: null
music: null
none: null
opus: null
pgc: null
subscription: null
subscription_new: null
ugc_season: null
upower_common: null
 */

export type ModuleDynamic__Major =
  | MajorTypeArchive
  | MajorTypeOpus
  | MajorTypePgc
  | MajorTypeUgcSeason
  | MajorTypeLiveRcmd
  | MajorTypeBlocked
