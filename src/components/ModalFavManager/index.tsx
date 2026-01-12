import Emittery from 'emittery'
import { useSnapshot } from 'valtio'
import { antMessage } from '$modules/antd'
import { UserFavApi } from '$modules/rec-services/fav/api'
import { clearFavFolderAllItemsCache } from '$modules/rec-services/fav/service/fav-folder'
import { wrapComponent } from '$utility/global-component'
import { ModalFavManager, type ModalFavTypes } from './components'

const defaultProps: ModalFavTypes.Props = {
  onHide,
  show: false,
  mode: 'pick',
  pickOkAction: undefined,
  modifyInitialSelectedIds: undefined,
  modifyOkAction: undefined,
}

const { proxyProps, updateProps } = wrapComponent<ModalFavTypes.Props>({
  Component: ModalFavManager,
  containerClassName: 'ModalFavManager',
  defaultProps,
})

const emitter = new Emittery<{ 'modal-close': undefined }>()
function onHide() {
  updateProps({ show: false })
  emitter.emit('modal-close')
}

export function useModalMoveFavVisible() {
  return useSnapshot(proxyProps).show
}

/**
 * start 表示过程开始 show-modal, ...
 * handle 表示实际动作
 */

export async function startPickFavFolder(pickOkAction: ModalFavTypes.PickOkAction) {
  updateProps({ show: true, mode: 'pick', pickOkAction })
  await emitter.once('modal-close')
}

export async function startModifyFavItemToFolder(
  srcFolderIds: number[] | undefined,
  modifyOkAction: ModalFavTypes.ModifyOkAction,
  modifyAllowEmpty: boolean | undefined = true,
) {
  updateProps({
    show: true,
    mode: 'modify',
    modifyInitialSelectedIds: srcFolderIds,
    modifyOkAction,
    modifyAllowEmpty,
  })
  await emitter.once('modal-close')
}

export async function handleModifyFavItemToFolder(
  avid: string | number,
  sourceFolderIds: number[] | undefined,
  targetFolder: ModalFavTypes.Result | undefined,
): Promise<boolean> {
  // unchange
  if (targetFolder && sourceFolderIds?.length === 1 && sourceFolderIds[0] === targetFolder.id) {
    antMessage.warning('请选择不同的收藏夹!')
    return false
  }

  const success = await UserFavApi.modifyFav(avid, sourceFolderIds, targetFolder?.id)
  if (!success) return false

  const clearQueue = [...(sourceFolderIds ?? []), targetFolder?.id].filter((x) => x !== undefined)
  clearQueue.forEach((fid) => clearFavFolderAllItemsCache(fid))

  let message: string | undefined
  if (!targetFolder) {
    message = '已取消收藏'
  } else {
    const prefix = sourceFolderIds?.length ? '已移动收藏到' : '已加入收藏'
    message = `${prefix}「${targetFolder.title}」`
  }
  antMessage.success(message)

  return true
}
