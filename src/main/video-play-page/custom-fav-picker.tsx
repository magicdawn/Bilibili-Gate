import { bv2av } from '@mgdn/bvid'
import { matchesKeyboardEvent } from '@tanstack/react-hotkeys'
import { once } from 'es-toolkit'
import { handleModifyFavItemToFolders, startModifyFavItemToTargetFolders } from '$components/ModalFavManager'
import { globalEmitter } from '$main/shared'
import { antMessage } from '$modules/antd'
import { UserFavApi } from '$modules/rec-services/fav/api'
import { settings } from '$modules/settings'
import { poll, shouldDisableShortcut } from '$utility/dom'
import { getCurrentPageBvid } from './util'

export async function setupCustomFavPicker() {
  GM.registerMenuCommand?.('⭐️ 加入收藏', () => addToFav())

  if (!getCurrentPageBvid()) return
  const willUseCustomFavPicker = () => settings.fav.useCustomFavPicker.onPlayPage

  // setup keyboard shortcut
  //  Shift+E: always on
  //  E: only when willUseCustomFavPicker
  document.addEventListener(
    'keydown',
    (e) => {
      if (matchesKeyboardEvent(e, 'Shift+E') || (willUseCustomFavPicker() && matchesKeyboardEvent(e, 'E'))) {
        if (!getCurrentPageBvid()) return
        if (shouldDisableShortcut()) return
        const target = e.target as HTMLElement
        if (target.closest('bili-comments')) return // emit from a <bili-comments> element
        e.stopImmediatePropagation()
        e.preventDefault()
        addToFav()
      }
    },
    { capture: true },
  )

  if (willUseCustomFavPicker()) {
    const el = await poll(() => document.querySelector<HTMLDivElement>('.video-fav.video-toolbar-left-item'), {
      interval: 100,
      timeout: 5_000,
    })
    el?.addEventListener(
      'click',
      (e) => {
        if (!willUseCustomFavPicker() || !getCurrentPageBvid()) return
        e.stopImmediatePropagation()
        e.preventDefault()
        addToFav()
      },
      { capture: true },
    )
  }
}

async function addToFav(sourceFavFolderIds?: number[] | undefined) {
  const bvid = getCurrentPageBvid()
  if (!bvid) return antMessage.error('无法解析视频 BVID !')
  const avid = bv2av(bvid)

  // !TODO: optimize this
  if (sourceFavFolderIds === undefined) {
    const result = await UserFavApi.getVideoFavState(avid)
    if (result) {
      sourceFavFolderIds = result.favFolderIds
    }
  }

  await startModifyFavItemToTargetFolders({
    srcFolderIds: sourceFavFolderIds,
    modifyOkAction: async (targetFolder) => {
      const success = await handleModifyFavItemToFolders(avid, sourceFavFolderIds, targetFolder)
      if (!success) return

      const nextFavedState = !!targetFolder.length
      setVideoToolbarFavIconState(nextFavedState)

      // https://github.com/magicdawn/Bilibili-Gate/issues/266
      // 例子:
      //  视频1, 使用自定义收藏夹, 添加收藏, faved icon 所属 Vue component 还是 unfaved, 但 DOM 上通过 `setVideoToolbarFavIconState` 添加了 on
      //  同页面切换到同合集其他视频, 内部数据还是 unfaved, 不会更新, 这就导致了错误的状态
      const prevFaved = !!sourceFavFolderIds?.length
      if (prevFaved !== nextFavedState) {
        setupNavigationListener()
      }

      return true
    },
  })
}

function setVideoToolbarFavIconState(faved: boolean) {
  const el = document.querySelector<HTMLDivElement>('.video-fav.video-toolbar-left-item')
  el?.classList.toggle('on', faved)
}

const setupNavigationListener = once(() => {
  globalEmitter.on('navigate-success', async () => {
    const bvid = getCurrentPageBvid()
    if (!bvid) return
    const avid = bv2av(bvid)

    const result = await UserFavApi.getVideoFavState(avid)
    const faved = !!result?.favFolderIds.length

    const curBvid = getCurrentPageBvid()
    if (curBvid !== bvid) return // switch away already
    setVideoToolbarFavIconState(faved)
  })
})
