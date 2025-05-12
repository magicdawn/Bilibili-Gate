export type BiliPlayer = {
  play: () => void
  pause: () => void
  isPaused: () => boolean
  isInitialized: () => boolean
  getMediaInfo: () => MediaInfo
  getManifest: () => Manifest
  getStates: () => States
}

export interface MediaInfo {
  playUrl: string
  absolutePlayTime: number
  relativePlayTime: number
  videoWidth: number
  videoHeight: number
}

export interface Manifest {
  p: number
  aid: number
  cid: number
  pid: number
  bvid: string
  seasonId: null
  episodeId: null
  kind: number
  screenKind: number
  channelKind: number
  seasonType: number
  hasPrev: boolean
  hasNext: boolean
  hasPipFn: boolean
  hasFullscreenFn: boolean
  referrer: string
}

export interface States {
  initError: boolean
  pipEnabled: boolean
  fullscreenEnabled: boolean
  majorCtrlHidden: boolean
  mainScreen: number
  sideScreen: null
}
