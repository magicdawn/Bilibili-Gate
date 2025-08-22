import { useSnapshot } from 'valtio'
import { settings } from '$modules/settings'
import { parseFilterByAuthor } from './parse'

export function useInFilterByAuthorList(authorMid: string | undefined) {
  const { enabled, keywords } = useSnapshot(settings.filter.byAuthor)
  const { blockUpMids } = useMemo(() => parseFilterByAuthor(keywords), [keywords])
  if (!authorMid) return false
  return enabled && blockUpMids.has(authorMid)
}
