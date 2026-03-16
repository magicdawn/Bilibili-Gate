import { bv2av } from '@mgdn/bvid'
import { matchesKeyboardEvent } from '@tanstack/react-hotkeys'
import { delay } from 'es-toolkit'
import ms from 'ms'
import { baseDebug } from '$common'
import { handleModifyFavItemToFolder, startModifyFavItemToFolder } from '$components/ModalFavManager'
import { EForceAutoPlay, EPlayerScreenMode, EQueryKey } from '$components/VideoCard/index.shared'
import { hasDocumentPictureInPicture, openInPipOrPopup } from '$components/VideoCard/use/useOpenRelated'
import { antMessage } from '$modules/antd'
import { getBiliPlayer } from '$modules/bilibili/player'
import { getBiliPlayerConfigAutoPlay } from '$modules/bilibili/player-config'
import { getCurrentPageBvid } from '$modules/pages/video-play-page'
import { UserFavApi } from '$modules/rec-services/fav/api'
import { settings } from '$modules/settings'
import { isMac } from '$ua'
import { poll, shouldDisableShortcut } from '$utility/dom'
import { setupForNoneHomepage } from './shared'

const debug = baseDebug.extend('main:video-play-page')

export async function initVideoPlayPage() {
  setupForNoneHomepage()
  registerGmCommands()
  setupCustomFavPicker()
  await handleFullscreen()
  await handleForceAutoPlay()
}

function registerGmCommands() {
  registerOpenInPipCommand()
  registerOpenInIinaCommand()
  registerAddToFavCommand()
}

function registerOpenInPipCommand() {
  if (!hasDocumentPictureInPicture) return
  GM.registerMenuCommand?.('🎦 小窗打开', () => {
    pausePlayingVideo()
    openInPipWindow()
  })
}

function registerOpenInIinaCommand() {
  if (!isMac) return
  GM.registerMenuCommand?.('▶️ IINA 打开', () => {
    pausePlayingVideo()
    openInIina()
  })
}

/**
 * 创意来源: https://github.com/hakadao/BewlyBewly/issues/101#issuecomment-1874308120
 * 试用了下, 感觉不错, 在本脚本里实现了
 */

async function handleFullscreen() {
  const targetMode = new URL(location.href).searchParams.get(EQueryKey.PlayerScreenMode)
  debug('targetMode=%s', targetMode)
  const next = targetMode === EPlayerScreenMode.WebFullscreen || targetMode === EPlayerScreenMode.Fullscreen
  if (!next) return

  let action: (() => void) | undefined
  // NOTE: aria-label 使用中文, 目前没找到 bilibili.com 在哪切换语言, 应该只有中文
  if (targetMode === EPlayerScreenMode.WebFullscreen) {
    action = () => document.querySelector<HTMLElement>('[role="button"][aria-label="网页全屏"]')?.click()
  }
  if (targetMode === EPlayerScreenMode.Fullscreen) {
    action = () => document.querySelector<HTMLElement>('[role="button"][aria-label="全屏"]')?.click()
  }

  const getCurrentMode = (): EPlayerScreenMode =>
    (document.querySelector<HTMLDivElement>('#bilibili-player .bpx-player-container')?.dataset.screen as
      | EPlayerScreenMode
      | undefined) || EPlayerScreenMode.Normal

  const timeoutAt = Date.now() + ms('30s')
  while (getCurrentMode() !== targetMode && Date.now() <= timeoutAt) {
    debug('current mode: %s', getCurrentMode())
    action?.()
    await delay(100)
  }
  debug('handleFullscreen to %s complete', targetMode)

  // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
}

async function handleForceAutoPlay() {
  // already on
  if (getBiliPlayerConfigAutoPlay()) return
  // no need
  const isON = new URL(location.href).searchParams.get(EQueryKey.ForceAutoPlay) === EForceAutoPlay.ON
  if (!isON) return

  const playing = (): boolean => {
    const player = getBiliPlayer()
    return !!player && !player.isPaused()
  }

  const timeoutAt = Date.now() + ms('30s')
  while (Date.now() <= timeoutAt && !playing()) {
    getBiliPlayer()?.play()
    await delay(1000)
  }
  debug('handleForceAutoPlay complete, playing = %s', playing())
}

function pausePlayingVideo() {
  // make it pause
  const player = getBiliPlayer()
  if (player && !player.isPaused()) {
    player.pause()
  }
}

function openInPipWindow() {
  // open in pipwindow
  const u = new URL(location.href)
  u.searchParams.set(EQueryKey.PlayerScreenMode, EPlayerScreenMode.WebFullscreen)
  const newHref = u.href
  openInPipOrPopup(newHref, '')
}

function openInIina() {
  // open in iina
  const iinaUrl = `iina://open?url=${encodeURIComponent(location.href)}`
  window.open(iinaUrl, '_self')
}

function registerAddToFavCommand() {
  GM.registerMenuCommand?.('⭐️ 加入收藏', () => addToFav())
}
async function setupCustomFavPicker() {
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

function shadowRootQuery(root: Element, selectors: string[]) {
  let result: Element | undefined = root
  for (const selector of selectors) {
    result = result.shadowRoot?.querySelector(selector) ?? undefined
    if (!result) return
  }
  return result
}
