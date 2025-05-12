export interface BiliPlayerConfig {
  lastUnlogintrialView: number
  lastUid: number
  aiAnimationInfo: string
  aiPromptToastInfo: string
  media: Media
  dmSend: DmSend
  blockList: any[]
  dmSetting: DmSetting
  basEditorData: BasEditorData
  audioEffect: null
  boceTimes: any[]
  interaction: Interaction
  iswide: boolean
  widesave: null
  subtitle: Subtitle
  progress: Progress
  panorama: boolean
  ksInfo: KsInfo
}

export interface BasEditorData {}

export interface DmSend {
  upDm: boolean
  dmChecked: boolean
}

export interface DmSetting {
  status: boolean
  dmSwitch: boolean
  aiSwitch: boolean
  aiLevel: number
  preventshade: boolean
  dmask: boolean
  typeScroll: boolean
  typeTop: boolean
  typeBottom: boolean
  typeColor: boolean
  typeSpecial: boolean
  opacity: number
  dmarea: number
  speedplus: number
  fontsize: number
  fullscreensync: boolean
  speedSync: boolean
  fontfamily: string
  bold: boolean
  fontborder: number
  seniorModeSwitch: number
  speedsync: boolean
  typeTopBottom: boolean
  dmdensity: number
}

export interface Interaction {
  rookieGuide: null
  showedDialog: boolean
}

export interface KsInfo {
  ts: number
  kss: string[]
}

export interface Media {
  quality: number
  volume: number
  nonzeroVol: number
  hideBlackGap: boolean
  dolbyAudio: boolean
  audioQuality: null
  autoplay: boolean
  handoff: number
  seniorTip: boolean
  opEd: boolean
  loudnessSwitch: number
}

export interface Progress {
  precisionGuide: null
  pbpstate: boolean
  pinstate: boolean
}

export interface Subtitle {
  fade: boolean
  scale: boolean
  fontsize: number
  opacity: number
  bilingual: boolean
  color: string
  shadow: string
  position: string
}
