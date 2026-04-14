/**
 * batch actions buttons live in toolbar(tabbarView)
 */

import { useMemoizedFn } from 'ahooks'
import { Button } from 'antd'
import { attemptAsync, delay } from 'es-toolkit'
import pRetry from 'p-retry'
import { useSnapshot } from 'valtio'
import { startPickFavFolder } from '$components/ModalFavManager'
import {
  getMultiSelectedNormalVideoItems,
  warnNoMultiSelectedNormalVideoItems,
} from '$components/RecGrid/rec-grid-state'
import { antMessage, antNotification } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForFav } from '$modules/icon'
import { multiSelectStore } from '$modules/multi-select/store'
import { UserFavApi } from '../fav/api'

export function BtnAddMultiSelectedToFav() {
  const { multiSelecting } = useSnapshot(multiSelectStore)

  const handleClick = useMemoizedFn(async () => {
    const selected = getMultiSelectedNormalVideoItems()
    if (!selected?.length) return warnNoMultiSelectedNormalVideoItems()

    const avids = selected.map((x) => x.cardData.avid).filter(Boolean)
    if (!avids.length) return warnNoMultiSelectedNormalVideoItems()

    await startPickFavFolder(async (targetFolder) => {
      const successAvids = []
      const failed: Record<string, boolean | any> = {}
      for (const [index, avid] of avids.entries()) {
        if (index !== 0) await delay(500) // 请求频率过高, 我也没办法喽~
        const [err, success] = await attemptAsync(() =>
          pRetry(
            async () => {
              const result = await UserFavApi.addFav(avid, targetFolder.id)
              if (result.isErr()) throw result.error // 与 p-retry 配合, 需要 throw
              return true
            },
            { retries: 3 },
          ),
        )
        if (success) {
          successAvids.push(avid)
          continue
        } else {
          failed[avid] = err ?? success
          continue
        }
      }

      if (successAvids.length === avids.length) {
        antMessage.success(`已加入收藏夹「${targetFolder.title}」`)
        return true
      }

      antNotification.error({
        duration: 0,
        title: '批量加入收藏夹失败!',
        description: (
          <>
            成功加入 {successAvids.length}/{avids.length} 个, 其他: {JSON.stringify(failed)}
          </>
        ),
      })
    })
  })

  return (
    multiSelecting && (
      <AntdTooltip arrow={false} title='添加收藏(多选)'>
        <Button className='icon-only-round-button' onClick={handleClick}>
          <IconForFav />
        </Button>
      </AntdTooltip>
    )
  )
}
