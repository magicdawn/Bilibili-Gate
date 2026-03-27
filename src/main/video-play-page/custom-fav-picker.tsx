import { bv2av } from '@mgdn/bvid'
import { matchesKeyboardEvent } from '@tanstack/react-hotkeys'
import { handleModifyFavItemToFolder, startModifyFavItemToFolder } from '$components/ModalFavManager'
import { antMessage } from '$modules/antd'
import { getCurrentPageBvid } from '$modules/pages/video-play-page'
import { UserFavApi } from '$modules/rec-services/fav/api'
import { settings } from '$modules/settings'
import { poll, shouldDisableShortcut } from '$utility/dom'

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

  await startModifyFavItemToFolder(sourceFavFolderIds, async (targetFolder) => {
    const success = await handleModifyFavItemToFolder(avid, sourceFavFolderIds, targetFolder)
    if (!success) return

    const nextState = !!targetFolder
    const el = document.querySelector<HTMLDivElement>('.video-fav.video-toolbar-left-item')
    el?.classList.toggle('on', nextState)

    return true
  })
}
