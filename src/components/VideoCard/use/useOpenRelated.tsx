import { useMemoizedFn } from 'ahooks'
import { delay } from 'es-toolkit'
import { useMemo, type ComponentProps, type MouseEvent, type MouseEventHandler, type ReactNode } from 'react'
import { baseDebug } from '$common'
import { EApiType } from '$define/index.shared'
import { getBiliPlayerConfigAutoPlay } from '$modules/bilibili/player-config'
import { getVideoPageList } from '$modules/bilibili/video/video-detail'
import { openNewTab } from '$modules/gm'
import { isNormalRankItem } from '$modules/rec-services/hot/rank/rank-tab'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import {
  EForceAutoPlay,
  EPlayerScreenMode,
  EQueryKey,
  EVideoLinkOpenMode,
  EVideoLinkOpenMode as Mode,
  VideoLinkOpenModeConfig as ModeConfig,
  VideoLinkOpenModeKey,
} from '../index.shared'
import { renderInPipWindow } from './_pip-window'
import type { RecItemType } from '$define'
import type { AntMenuItem } from '$modules/antd'
import type { VideoPage } from '$modules/bilibili/video/types/page-list'
import type { IVideoCardData } from '$modules/filter/normalize'

const debug = baseDebug.extend('VideoCard:useOpenRelated')

/**
 * 花式打开
 */

export function useOpenRelated({
  href,
  item,
  cardData,
  actionButtonVisible,
  hasOpenInPopupActionButton,
  getLargePreviewCurrentTime,
  hideLargePreview,
  shouldUseLargePreviewCurrentTime,
}: {
  href: string
  item: RecItemType
  cardData: IVideoCardData
  actionButtonVisible: boolean
  hasOpenInPopupActionButton: boolean
  getLargePreviewCurrentTime: () => number | undefined
  hideLargePreview: () => void
  shouldUseLargePreviewCurrentTime: () => boolean
}) {
  const { videoLinkOpenMode } = useSettingsSnapshot()

  function getHref(action?: (u: URL) => void) {
    const u = new URL(href, location.href)
    action?.(u)
    const newHref = u.href
    return newHref
  }

  const handleVideoLinkClick: MouseEventHandler = useMemoizedFn((e) => {
    e.stopPropagation()
    e.preventDefault()
    onOpenWithMode(undefined, e)
  })

  const onOpenWithMode = useMemoizedFn((mode?: Mode, e?: MouseEvent) => {
    mode ||= settings.videoLinkOpenMode

    const newHref = getHref((u) => {
      if (mode === Mode.NormalWebFullscreen || (mode === Mode.Popup && settings.pipWindow.autoWebFullscreen)) {
        u.searchParams.set(EQueryKey.PlayerScreenMode, EPlayerScreenMode.WebFullscreen)
        if (mode === Mode.Popup && !getBiliPlayerConfigAutoPlay()) {
          u.searchParams.set(EQueryKey.ForceAutoPlay, EForceAutoPlay.ON)
        }
      }

      if (shouldUseLargePreviewCurrentTime()) {
        const largePreviewT = getLargePreviewCurrentTime()
        if (largePreviewT) {
          hideLargePreview()
          u.searchParams.set('t', largePreviewT.toString())
        }
      }
    })

    const handleCommon = () => {
      const backgroud = mode === Mode.Background || !!(e?.metaKey || e?.ctrlKey)
      const active = !backgroud
      openNewTab(newHref, active)
    }

    const handleCurrentPage = () => {
      location.href = newHref
    }

    const handlers: Record<Mode, () => void> = {
      [Mode.Normal]: handleCommon,
      [Mode.Background]: handleCommon,
      [Mode.CurrentPage]: handleCurrentPage,
      [Mode.NormalWebFullscreen]: handleCommon,
      [Mode.Popup]: () => handlePopup(newHref),
      [Mode.Iina]: handleIINA,
    }
    handlers[mode]?.()
  })

  function handlePopup(newHref: string) {
    const { width, height } = getRecItemDimension({ item })
    return openInPipOrPopup(newHref, cardData.bvid, width, height)
  }

  function handleIINA() {
    let usingHref = href
    if (item.api === EApiType.Watchlater) usingHref = `/video/${item.bvid}`
    const fullHref = new URL(usingHref, location.href).href
    const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`
    window.open(iinaUrl, '_self')
  }

  const consistentOpenMenus: AntMenuItem[] = useMemo(() => {
    return Object.values(EVideoLinkOpenMode)
      .filter((mode) => ModeConfig[mode].enabled === undefined)
      .map((mode) => {
        return {
          key: VideoLinkOpenModeKey[mode],
          label: ModeConfig[mode].label,
          icon: ModeConfig[mode].icon,
          onClick: () => onOpenWithMode(mode),
        }
      })
  }, [])

  const conditionalOpenMenus: AntMenuItem[] = useMemo(() => {
    return Object.values(Mode).filter(
      (mode) => typeof ModeConfig[mode].enabled === 'boolean' && ModeConfig[mode].enabled,
    ).length
      ? Object.values(EVideoLinkOpenMode)
          .filter((mode) => typeof ModeConfig[mode].enabled === 'boolean' && ModeConfig[mode].enabled)
          .map((mode) => {
            return {
              key: VideoLinkOpenModeKey[mode],
              label: ModeConfig[mode].label,
              icon: ModeConfig[mode].icon,
              onClick: () => onOpenWithMode(mode),
            }
          })
      : []
  }, [])

  const openInPopupActionButtonEl: ReactNode = useMemo(() => {
    if (videoLinkOpenMode === EVideoLinkOpenMode.Popup) return
    if (item.api === EApiType.Live) return
    if (!hasDocumentPictureInPicture) return
    if (!hasOpenInPopupActionButton) return
    return (
      <VideoCardActionButton
        visible={actionButtonVisible}
        inlinePosition={'right'}
        icon={ModeConfig.Popup.icon}
        tooltip={ModeConfig.Popup.label}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onOpenWithMode(EVideoLinkOpenMode.Popup)
        }}
      />
    )
  }, [videoLinkOpenMode, actionButtonVisible])

  const onOpenInPopup = useMemoizedFn(() => {
    onOpenWithMode(EVideoLinkOpenMode.Popup)
  })

  return {
    onOpenWithMode,
    handleVideoLinkClick,
    consistentOpenMenus,
    conditionalOpenMenus,
    openInPopupActionButtonEl,
    onOpenInPopup,
  }
}

export function getRecItemDimension({
  item,
  dimensionFromApi,
}: {
  item?: RecItemType
  dimensionFromApi?: VideoPage['dimension']
}) {
  let width: number | undefined
  let height: number | undefined
  let aspectRatio: number | undefined

  // from API
  if (dimensionFromApi) {
    ;[width, height] = [dimensionFromApi.width, dimensionFromApi.height]
    // 0：正常, 1：对换
    if (dimensionFromApi.rotate === 1) [width, height] = [height, width]
    aspectRatio = width / height
  }

  // AppRecommend
  else if (item?.api === EApiType.AppRecommend && item.uri?.startsWith('bilibili://')) {
    const searchParams = new URL(item.uri).searchParams
    const playerWidth = Number(searchParams.get('player_width') || 0)
    const playerHeight = Number(searchParams.get('player_height') || 0)
    const playerRotate = Number(searchParams.get('player_rotate') || 0)
    if (playerWidth && playerHeight && !Number.isNaN(playerWidth) && !Number.isNaN(playerHeight)) {
      ;[width, height] = [playerWidth, playerHeight]
      if (playerRotate === 1) [width, height] = [height, width]
      aspectRatio = width / height
    }
  }

  // ranking
  else if (item?.api === EApiType.Rank && isNormalRankItem(item)) {
    const w = item.dimension.width
    const h = item.dimension.height
    const rotate = item.dimension.rotate
    if (w && h && !Number.isNaN(w) && !Number.isNaN(h)) {
      ;[width, height] = [w, h]
      if (rotate === 1) [width, height] = [height, width]
      aspectRatio = width / height
    }
  }

  return { width, height, aspectRatio }
}

export const hasDocumentPictureInPicture = !!window.documentPictureInPicture?.requestWindow

export async function openInPipOrPopup(newHref: string, bvid?: string, videoWidth?: number, videoHeight?: number) {
  let popupWidth = 1000
  let popupHeight = Math.ceil((popupWidth / 16) * 9)

  // get video width and height via API if needed
  const MAX_API_WAIT = 200
  if ((!videoWidth || !videoHeight) && bvid) {
    const videoPages = await Promise.race([getVideoPageList(bvid), delay(MAX_API_WAIT)])
    if (videoPages?.[0]?.dimension) {
      const { dimension } = videoPages[0]
      videoWidth = dimension.width
      videoHeight = dimension.height
    }
  }

  // handle vertical video
  if (videoWidth && videoHeight && videoWidth < videoHeight) {
    const maxHeight = Math.min(Math.floor(window.screen.availHeight * 0.8), 1000)
    const maxWidth = Math.floor((maxHeight / videoHeight) * videoWidth)
    popupWidth = Math.min(720, maxWidth)
    popupHeight = Math.floor((popupWidth / videoWidth) * videoHeight)
  }

  debug('openInPipOrPopup newHref=%s size=%sx%s', newHref, popupWidth, popupHeight)

  let pipWindow: Window | undefined
  if (hasDocumentPictureInPicture) {
    try {
      // https://developer.chrome.com/docs/web-platform/document-picture-in-picture
      pipWindow = await window.documentPictureInPicture?.requestWindow({
        width: popupWidth,
        height: popupHeight,
        disallowReturnToOpener: true,
      })
    } catch {
      // noop
    }
  }

  if (pipWindow) {
    // use pipWindow
    renderInPipWindow(newHref, pipWindow)
  } else {
    // use window.open popup
    openPopupWindow(newHref, popupWidth, popupHeight)
  }
}

function openPopupWindow(newHref: string, popupWidth: number, popupHeight: number) {
  // 将 left 减去 50px，你可以根据需要调整这个值
  const left = (window.innerWidth - popupWidth) / 2
  const top = (window.innerHeight - popupHeight) / 2 - 50

  const features = ['popup=true', `width=${popupWidth}`, `height=${popupHeight}`, `left=${left}`, `top=${top}`].join(
    ',',
  )

  debug('openInPopup: features -> %s', features)
  window.open(newHref, '_blank', features)
}

export function useLinkNewTab() {
  const { videoLinkOpenMode } = useSettingsSnapshot()
  return videoLinkOpenMode !== EVideoLinkOpenMode.CurrentPage
}

export function useLinkTarget() {
  const newTab = useLinkNewTab()
  return newTab ? '_blank' : '_self'
}

export function getLinkTarget() {
  const newTab = settings.videoLinkOpenMode !== EVideoLinkOpenMode.CurrentPage
  return newTab ? '_blank' : '_self'
}

export function CustomTargetLink(props: ComponentProps<'a'>) {
  const target = useLinkTarget()
  return (
    <a {...props} target={target}>
      {props.children}
    </a>
  )
}
