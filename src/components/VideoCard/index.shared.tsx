import { APP_SHORT_PREFIX } from '$common'
import { antMessage } from '$modules/antd'
import { IconForOpenExternalLink, IconForPlayer } from '$modules/icon'
import { isMac } from '$ua'
import mitt, { type Emitter } from 'mitt'
import { size } from 'polished'
import type { ReactNode } from 'react'
import AkarIconsMiniplayer from '~icons/akar-icons/miniplayer'
import EosIconsBackgroundTasks from '~icons/eos-icons/background-tasks'
import RiFullscreenFill from '~icons/ri/fullscreen-fill'

export const STAT_NUMBER_FALLBACK = '0'

export function copyContent(content: string) {
  GM.setClipboard(content)
  antMessage.success(`已复制: ${content}`)
}

export enum QueryKey {
  PlayerScreenMode = `${APP_SHORT_PREFIX}-player-screen-mode`,
  ForceAutoPlay = `${APP_SHORT_PREFIX}-force-auto-play`,
}

export enum PlayerScreenMode {
  Normal = 'normal',
  Wide = 'wide',
  WebFullscreen = 'web',
  Fullscreen = 'full',
}

export enum ForceAutoPlay {
  ON = 'on',
  OFF = 'off',
}

export enum VideoLinkOpenMode {
  Normal = 'Normal',
  CurrentPage = 'CurrentPage',
  NormalWebFullscreen = 'NormalWebFullscreen',
  Popup = 'Popup',
  Background = 'Background',
  Iina = 'Iina',
}

export const VideoLinkOpenModeKey: Record<VideoLinkOpenMode, string> = Object.entries(
  VideoLinkOpenMode,
).reduce(
  (record, [key, value]) => {
    return { ...record, [value]: `LinkOpenMode.${key}` }
  },
  {} as Record<VideoLinkOpenMode, string>,
)

export type VideoLinkOpenModeConfigItem = {
  label: string
  icon: ReactNode
  desc?: ReactNode
  enabled?: boolean
}

export const VideoLinkOpenModeConfig: Record<VideoLinkOpenMode, VideoLinkOpenModeConfigItem> = {
  [VideoLinkOpenMode.Normal]: {
    icon: <IconForOpenExternalLink {...size(16)} />,
    label: '打开',
    desc: '默认在新标签页中打开',
  },
  [VideoLinkOpenMode.CurrentPage]: {
    icon: <IconMaterialSymbolsLightOpenInNewOff {...size(16)} />,
    label: '当前页中打开',
    desc: '不打开新标签页, 使用当前标签页打开, 适用于将网站作为应用安装场景',
  },
  [VideoLinkOpenMode.NormalWebFullscreen]: {
    icon: <RiFullscreenFill {...size(15)} />,
    label: '打开-网页全屏',
    desc: <>默认在新标签页中打开, 打开后自动网页全屏</>,
  },
  [VideoLinkOpenMode.Popup]: {
    icon: <AkarIconsMiniplayer {...size(15)} />,
    label: '小窗打开',
    desc: (
      <>
        当{' '}
        <a
          href='https://developer.chrome.com/docs/web-platform/document-picture-in-picture'
          target='_blank'
        >
          「文档画中画」API
        </a>{' '}
        可用时, 会使用「文档画中画」的形式: 窗口置顶 + 播放页网页全屏.
        <br />
        当该 API 不可用时, 会使用 popup window + 播放页网页全屏 的形式.
      </>
    ),
  },
  [VideoLinkOpenMode.Background]: {
    icon: <EosIconsBackgroundTasks {...size(15)} />,
    label: '后台打开',
  },
  [VideoLinkOpenMode.Iina]: {
    icon: <IconForPlayer {...size(15)} />,
    label: '在 IINA 中打开',
    enabled: isMac,
    desc: (
      <>
        <a
          href='https://github.com/magicdawn/bilibili-gate/blob/main/notes/iina.md'
          target='_blank'
        >
          macOS IINA 设置教程
        </a>
      </>
    ),
  },
}

export type VideoCardEvents = {
  // for cancel card
  'cancel-dislike': void

  // for normal card
  'open': void
  'open-in-popup': void
  'open-with-large-preview-visible': void
  'toggle-watch-later': void
  'trigger-dislike': void
  'start-preview-animation': void
  'hotkey-preview-animation': void
}
export type VideoCardEmitter = Emitter<VideoCardEvents>
export function createVideoCardEmitter() {
  return mitt<VideoCardEvents>()
}

export type SharedEmitterEvents = {
  'mouseenter': string
  'show-large-preview': string
}
export type SharedEmitter = Emitter<SharedEmitterEvents>
export function createSharedEmitter() {
  return mitt<SharedEmitterEvents>()
}

export const defaultEmitter = createVideoCardEmitter()
export const defaultSharedEmitter = createSharedEmitter()
