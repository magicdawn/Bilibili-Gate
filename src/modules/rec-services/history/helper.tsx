import { appError } from '$common'
import { getMultiSelectedItems } from '$components/RecGrid/rec-grid-state'
import { isHistory } from '$define'
import { antMessage } from '$modules/antd'
import { normalizeCardData } from '$modules/filter/normalize'
import { WebApiError } from '$request'
import { HistoryApiService } from './api'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'

export async function removeMultiSelectedHistoryItems(recSharedEmitter: RecSharedEmitter) {
  const selected = getMultiSelectedItems().filter((x) => isHistory(x))
  if (!selected?.length) return antMessage.warning('没有选中项!')

  const kid = selected.map((x) => `${x.history.business}_${x.kid}`).join(',')
  const result = await HistoryApiService.delete(kid)
  if (result.isErr()) {
    const err = result.error
    appError(err)
    antMessage.error(err instanceof WebApiError ? err.formatAsReactNode() : err.message, 8)
    return
  }

  const uniqIds = selected.map((x) => x.uniqId)
  const titles = selected.map((x) => normalizeCardData(x).title)
  recSharedEmitter.emit('remove-cards', [uniqIds, titles])
}
