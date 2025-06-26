import { BvCode, type BV1String } from '@mgdn/bvid'
import { delay } from 'es-toolkit'
import ms from 'ms'
import { baseDebug } from '$common'
import { chooseTragetFavFolder } from '$components/ModalMoveFav'
import { ForceAutoPlay, PlayerScreenMode, QueryKey } from '$components/VideoCard/index.shared'
import { hasDocumentPictureInPicture, openInPipOrPopup } from '$components/VideoCard/use/useOpenRelated'
import { antMessage } from '$modules/antd'
import { getBiliPlayer } from '$modules/bilibili/player'
import { getBiliPlayerConfigAutoPlay } from '$modules/bilibili/player-config'
import { UserFavService } from '$modules/rec-services/fav/user-fav-service'
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
  const targetMode = new URL(location.href).searchParams.get(QueryKey.PlayerScreenMode)
  const next = targetMode === PlayerScreenMode.WebFullscreen || targetMode === PlayerScreenMode.Fullscreen
  if (!next) return

  let action: (() => void) | undefined
  // NOTE: aria-label 使用中文, 目前没找到 bilibili.com 在哪切换语言, 应该只有中文
  if (targetMode === PlayerScreenMode.WebFullscreen) {
    action = () => document.querySelector<HTMLElement>('[role="button"][aria-label="网页全屏"]')?.click()
  }
  if (targetMode === PlayerScreenMode.Fullscreen) {
    action = () => document.querySelector<HTMLElement>('[role="button"][aria-label="全屏"]')?.click()
  }

  const getCurrentMode = (): PlayerScreenMode =>
    (document.querySelector<HTMLDivElement>('#bilibili-player .bpx-player-container')?.dataset.screen as
      | PlayerScreenMode
      | undefined) || PlayerScreenMode.Normal

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
  const isON = new URL(location.href).searchParams.get(QueryKey.ForceAutoPlay) === ForceAutoPlay.ON
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
  u.searchParams.set(QueryKey.PlayerScreenMode, PlayerScreenMode.WebFullscreen)
  const newHref = u.href
  openInPipOrPopup(newHref, '')
}

function openInIina() {
  // open in iina
  const iinaUrl = `iina://open?url=${encodeURIComponent(location.href)}`
  window.open(iinaUrl, '_self')
}

function registerAddToFavCommand() {
  GM.registerMenuCommand?.('⭐️ 加入收藏', addToFav)
}
async function setupCustomFavPicker() {
  if (!settings.fav.useCustomFavPicker.onPlayPage) return false
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'e') return
      if (shouldDisableShortcut()) return
      e.stopImmediatePropagation()
      e.preventDefault()
      addToFav()
    },
    { capture: true },
  )

  const el = await poll(() => document.querySelector<HTMLDivElement>('.video-fav.video-toolbar-left-item'), {
    interval: 100,
    timeout: 5_000,
  })
  el?.addEventListener(
    'click',
    (e) => {
      e.stopImmediatePropagation()
      e.preventDefault()
      addToFav()
    },
    { capture: true },
  )
}

async function addToFav() {
  const bvid = /^\/video\/(?<bvid>BV\w+)\//.exec(location.pathname)?.groups?.bvid
  if (!bvid) return
  const avid = BvCode.bv2av(bvid as BV1String)
  await chooseTragetFavFolder(undefined, async (targetFolder) => {
    const success = await UserFavService.addFav(avid, targetFolder.id)
    if (success) antMessage.success(`已加入收藏夹「${targetFolder.title}」`)
    return success
  })
}
