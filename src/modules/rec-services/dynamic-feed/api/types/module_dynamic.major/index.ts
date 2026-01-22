import type { MajorTypeArchive } from './archive'
import type { MajorTypeLiveRcmd } from './live-rcmd'
import type { MajorTypeOpus } from './opus'
import type { MajorTypePgc } from './pgc'
import type { MajorTypeUgcSeason } from './ugc-season'

export type ModuleDynamic__Major =
  | MajorTypeArchive
  | MajorTypeOpus
  | MajorTypePgc
  | MajorTypeUgcSeason
  | MajorTypeLiveRcmd
