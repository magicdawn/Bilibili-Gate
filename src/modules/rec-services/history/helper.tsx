import { getMultiSelectedItems } from '$components/RecGrid/rec-grid-state'
import { checkIsHistory, type RecItemType } from '$define'
import { antMessage, antModal } from '$modules/antd'
import { normalizeCardData } from '$modules/filter/normalize'
import { settings } from '$modules/settings'
import { handleRequestError } from '$request'
import { HistoryApiService } from './api'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'

export async function removeSingleHistoryItem(item: RecItemType): Promise<boolean | undefined> {
  if (!checkIsHistory(item)) return

  if (settings.history.confirmBeforeDelete) {
    const confirm = await antModal.confirm({
      centered: true,
      title: '移除历史记录',
      content: (
        <>
          确定要移除
          <br />「{item.title}」?
        </>
      ),
    })
    if (!confirm) return
  }

  const result = await HistoryApiService.delete(`${item.history.business}_${item.kid}`)
  result.tapError(handleRequestError)
  return result.isOk()
}

export async function removeMultiSelectedHistoryItems(recSharedEmitter: RecSharedEmitter) {
  const selected = getMultiSelectedItems().filter((x) => checkIsHistory(x))
  if (!selected?.length) return antMessage.warning('没有选中项!')

  const confirm = await antModal.confirm({
    title: '移除历史记录',
    content: <>确定要移除 {selected.length} 条记录?</>,
  })
  if (!confirm) return

  const kid = selected.map((x) => `${x.history.business}_${x.kid}`).join(',')
  const result = await HistoryApiService.delete(kid)
  return result.tapBoth({
    err: handleRequestError,
    ok() {
      const uniqIds = selected.map((x) => x.uniqId)
      const titles = selected.map((x) => normalizeCardData(x).title)
      recSharedEmitter.emit('remove-cards', [uniqIds, titles, { itemsDescription: '条历史记录' }])
    },
  })
}
