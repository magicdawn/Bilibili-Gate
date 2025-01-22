import { baseDebug } from '$common'
import type { RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { getBiliPlayerConfigAutoPlay } from '$modules/bilibili/player-config'
import type { VideoPage } from '$modules/bilibili/video/types/page-list'
import { getVideoPageList } from '$modules/bilibili/video/video-detail'
import { openNewTab } from '$modules/gm'
import { isNormalRankingItem } from '$modules/rec-services/hot/ranking/category'
import { settings, useSettingsSnapshot } from '$modules/settings'
import type { AntMenuItem } from '$utility/antd'
import { delay } from 'es-toolkit'
import type { ComponentProps, MouseEvent, MouseEventHandler, ReactNode, RefObject } from 'react'
import type { PreviewImageRef } from '../child-components/PreviewImage'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import {
  ForceAutoPlay,
  VideoLinkOpenMode as Mode,
  VideoLinkOpenModeConfig as ModeConfig,
  PlayerScreenMode,
  QueryKey,
  VideoLinkOpenMode,
  VideoLinkOpenModeKey,
} from '../index.shared'
import type { IVideoCardData } from '../process/normalize'
import { renderInPipWindow } from './_pip-window'

const debug = baseDebug.extend('VideoCard:useOpenRelated')

/**
 * 花式打开
 */

export function useOpenRelated({
  href,
  item,
  cardData,
  actionButtonVisible,
  previewImageRef,
  hasOpenInPopupActionButton,
}: {
  href: string
  item: RecItemType
  cardData: IVideoCardData
  actionButtonVisible: boolean
  previewImageRef: RefObject<PreviewImageRef | null>
  hasOpenInPopupActionButton: boolean
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
      if (mode === Mode.Popup || mode === Mode.NormalWebFullscreen) {
        u.searchParams.set(QueryKey.PlayerScreenMode, PlayerScreenMode.WebFullscreen)
        if (mode === Mode.Popup && !getBiliPlayerConfigAutoPlay()) {
          u.searchParams.set(QueryKey.ForceAutoPlay, ForceAutoPlay.ON)
        }
      }
      if (settings.startPlayFromPreviewPoint) {
        const t = previewImageRef.current?.getT()
        if (t) {
          u.searchParams.set('t', t.toString())
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
    const { w, h } = getRecItemDimension(item)
    return openInPipOrPopup(newHref, cardData.bvid, w, h)
  }

  function handleIINA() {
    let usingHref = href
    if (item.api === EApiType.Watchlater) usingHref = `/video/${item.bvid}`
    const fullHref = new URL(usingHref, location.href).href
    const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`
    window.open(iinaUrl, '_self')
  }

  const consistentOpenMenus: AntMenuItem[] = useMemo(() => {
    return Object.values(VideoLinkOpenMode)
      .filter((mode) => typeof ModeConfig[mode].enabled === 'undefined')
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
      ? Object.values(VideoLinkOpenMode)
          .filter(
            (mode) => typeof ModeConfig[mode].enabled === 'boolean' && ModeConfig[mode].enabled,
          )
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
    if (videoLinkOpenMode === VideoLinkOpenMode.Popup) return
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
          onOpenWithMode(VideoLinkOpenMode.Popup)
        }}
      />
    )
  }, [videoLinkOpenMode, actionButtonVisible])

  const onOpenInPopup = useMemoizedFn(() => {
    onOpenWithMode(VideoLinkOpenMode.Popup)
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

export function getRecItemDimension(item: RecItemType, dimensionFromApi?: VideoPage['dimension']) {
  let w: number | undefined
  let h: number | undefined
  let aspectRatio: number | undefined

  // from API
  if (dimensionFromApi) {
    w = dimensionFromApi.width
    h = dimensionFromApi.height
    aspectRatio = w / h
  }

  // AppRecommend
  else if (item.api === EApiType.AppRecommend && item.uri?.startsWith('bilibili://')) {
    const searchParams = new URL(item.uri).searchParams
    const playerWidth = Number(searchParams.get('player_width') || 0)
    const playerHeight = Number(searchParams.get('player_height') || 0)
    if (playerWidth && playerHeight && !isNaN(playerWidth) && !isNaN(playerHeight)) {
      w = playerWidth
      h = playerHeight
      aspectRatio = w / h
    }
  }

  // ranking
  else if (item.api === EApiType.Ranking && isNormalRankingItem(item)) {
    const _w = item.dimension.width
    const _h = item.dimension.height
    if (_w && _h && !isNaN(_w) && !isNaN(_h)) {
      w = _w
      h = _h
      aspectRatio = w / h
    }
  }

  return { w, h, aspectRatio }
}

export const hasDocumentPictureInPicture = !!window.documentPictureInPicture?.requestWindow

export async function openInPipOrPopup(
  newHref: string,
  bvid?: string,
  videoWidth?: number,
  videoHeight?: number,
) {
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
    } catch (e) {
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

  const features = [
    'popup=true',
    `width=${popupWidth}`,
    `height=${popupHeight}`,
    `left=${left}`,
    `top=${top}`,
  ].join(',')

  debug('openInPopup: features -> %s', features)
  window.open(newHref, '_blank', features)
}

export function useLinkNewTab() {
  const { videoLinkOpenMode } = useSettingsSnapshot()
  return videoLinkOpenMode !== VideoLinkOpenMode.CurrentPage
}

export function useLinkTarget() {
  const newTab = useLinkNewTab()
  return newTab ? '_blank' : '_self'
}

export function getLinkTarget() {
  const newTab = settings.videoLinkOpenMode !== VideoLinkOpenMode.CurrentPage
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
