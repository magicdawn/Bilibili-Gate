import type { AuthorTypeNormal } from './normal'
import type { AuthorTypePgc } from './pgc'
import type { AuthorTypeUgcSeason } from './ugc-season'

export type ModuleAuthor = AuthorTypePgc | AuthorTypeUgcSeason | AuthorTypeNormal
