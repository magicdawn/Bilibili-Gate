import { baseDebug, IN_BILIBILI_HOMEPAGE } from '$common'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoLinkOpenMode } from '$components/VideoCard/index.shared'
import { EAppApiDevice } from '$define/index.shared'
import { reciveGmValueUpdatesFromOtherTab } from '$modules/gm'
import { WatchlaterItemsOrder } from '$modules/rec-services/watchlater/watchlater-enum'
import {
  getLeafPaths,
  type BooleanPaths,
  type LeafPaths,
  type ListPaths,
} from '$utility/object-paths'
import toast from '$utility/toast'
import { cloneDeep, isNil } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import type { Get, PartialDeep, ReadonlyDeep } from 'type-fest'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import { saveToDraft } from './cloud-backup'

const debug = baseDebug.extend('settings')

/**
 * 命名: 模块/tab + 场景 + 功能
 */

export const initialSettings = {
  accessKey: '',
  accessKeyExpireAt: 0,

  // 窄屏模式
  useNarrowMode: false,

  // 全屏模式
  // @history
  //  - 2024-03-18 bili-feed4 以前的内测首页现在是默认首页, 这里更名为全屏模式, 默认为 true
  pureRecommend: true,

  /**
   * tab = app-recommend
   */
  appRecommend: {
    deviceParamForApi: EAppApiDevice.ipad,
    addOtherTabContents: false, // this flag will results MUCH more requests
  },

  /**
   * 查看更多, aka ModalFeed
   */

  // 自动查看更多
  showModalFeedOnLoad: false,

  // "查看更多" 按钮
  showModalFeedEntry: false,

  // ModalFeed.全屏
  modalFeedFullScreen: false,

  /**
   * Video Card
   */

  // 自动开始预览: 按键选择
  autoPreviewWhenKeyboardSelect: false,

  // 自动开始预览: 鼠标悬浮; 不再跟随鼠标位置, 默认: 跟随鼠标
  autoPreviewWhenHover: true,

  // 自动预览: 连续式进度条 跳跃式进度条
  autoPreviewUseContinuousProgress: true,

  // 自动预览: 更新间隔
  // 跳跃式(400) 连续式(700)
  autoPreviewUpdateInterval: 700,

  // hover 延时
  useDelayForHover: false,

  // 从预览处开始播放视频
  // /video/BVID/?t=start
  startPlayFromPreviewPoint: false,

  /**
   * tab=dynamic-feed
   */
  dynamicFeed: {
    showLive: true, // 在动态中显示直播

    followGroup: {
      enabled: true, // 下拉筛选支持 - 关注分组
      forceUseMergeTimelineIds: [] as number[],
    },

    whenViewAll: {
      enableHideSomeContents: false, // 在「全部」动态中隐藏 UP 的动态 & 在「全部」动态中隐藏此分组的动态
      hideIds: [] as string[], // `up:${mid}` | `follow-group:${id}`
    },

    advancedSearch: false,
    __internal: {
      cacheAllItemsEntry: false,
      cacheAllItemsUpMids: [] as string[], // enable for these up
      addCopyBvidButton: false,
      externalSearchInput: false, // more convenient
    },
  },

  /**
   * tab=watchlater
   */
  watchlaterAddSeparator: true, // 添加 "近期" / "更早" 分割线
  watchlaterItemsOrder: WatchlaterItemsOrder.AddTimeDesc, // 顺序

  /**
   * tab=fav
   */
  fav: {
    // useShuffle: false, // 打乱顺序
    addSeparator: true, // 收藏夹分割线
    excludedFolderIds: [] as string[], // 忽略的收藏夹
  },

  /**
   * tab=popular-general
   */
  popularGeneralUseAnonymous: false, // without credentials

  /**
   * tab=popular-weekly
   */
  popularWeeklyUseShuffle: false, // shuffle

  /**
   * tab=live
   */

  /**
   * 过滤器模块
   */
  filter: {
    enabled: true,

    // 最少播放量
    minPlayCount: {
      enabled: false,
      value: 10000,
    },

    // 时长
    minDuration: {
      enabled: false,
      value: 60, // 60s
    },

    // 已关注豁免
    exemptForFollowed: {
      video: true,
      // 图文也是有 rcmd_reason = '已关注' 的
      picture: true,
    },

    // filter out goto = 'picture' | 'bangumi'
    hideGotoTypePicture: false,
    hideGotoTypeBangumi: false,

    byAuthor: {
      enabled: false,
      keywords: [] as string[],
    },
    byTitle: {
      enabled: false,
      keywords: [] as string[],
    },
  },

  /**
   * 外观
   */
  style: {
    general: {
      // video-source-tab 高度: true 高; false compact;
      videoSourceTabStandardHeight: true,

      popoverBorderColorUseColorPrimary: false,
    },

    pureRecommend: {
      // sticky tabbar
      useStickyTabbar: true,

      // custom grid | default grid
      useCustomGrid: true,

      // bg1
      useWhiteBackground: true,

      // 隐藏顶部分区
      hideTopChannel: false,
    },

    videoCard: {
      // 使用卡片模式
      // inspired by https://ai.taobao.com
      useBorder: true,
      useBorderOnlyOnHover: true,
      useBoxShadow: false,
      usePadding: false,
    },
  },

  /**
   * 颜色主题
   */
  theme: '',
  colorPickerThemeSelectedColor: '', // 自定义颜色

  /**
   * 功能
   */

  // 备份
  backupSettingsToArticleDraft: false,

  // 默认打开模式
  videoLinkOpenMode: VideoLinkOpenMode.Normal,

  // 小窗默认锁定
  pipWindowDefaultLocked: true,

  /**
   * 隐藏的 tab, 使用黑名单, 功能迭代之后新增的 tab, 默认开启.
   * 如果使用白名单, 新增的 tab 会被隐藏
   */
  hidingTabKeys: [ETab.KeepFollowOnly, ETab.Live] satisfies ETab[] as ETab[],
  customTabKeysOrder: [] satisfies ETab[] as ETab[],

  /**
   * internal
   */
  __internalEnableCopyBvidInfoContextMenu: false,
  __internalHotSubUseDropdown: false,
}

export type Settings = typeof initialSettings
export const settings = proxy(cloneDeep(initialSettings))

export type LeafSettingsPath = LeafPaths<Settings>
export type BooleanSettingsPath = BooleanPaths<Settings>
export type ListSettingsPath = ListPaths<Settings>

export const allowedLeafSettingsPaths = getLeafPaths(initialSettings)
export const internalBooleanPaths = allowedLeafSettingsPaths.filter(
  (p) => p.includes('__internal') && typeof get(initialSettings, p) === 'boolean',
) as BooleanSettingsPath[]
debug(
  'allowedLeafSettingsPaths = %O, internalBooleanPaths = %O',
  allowedLeafSettingsPaths,
  internalBooleanPaths,
)

export function useSettingsSnapshot() {
  return useSnapshot(settings)
}

export function getSettingsSnapshot() {
  return snapshot(settings)
}

/**
 * storage
 */

const storageKey = `settings`

export function runSettingsMigration(val: object) {
  // from v0.28.2, remove after several releases
  const config: Array<[configPath: LeafSettingsPath, legacyConfigPath: string]> = [
    ['dynamicFeed.showLive', 'dynamicFeedShowLive'],
    ['dynamicFeed.followGroup.enabled', 'dynamicFeedFollowGroupEnabled'],
    [
      'dynamicFeed.followGroup.forceUseMergeTimelineIds',
      'dynamicFeedFollowGroupForceUseMergeTimelineIds',
    ],
    [
      'dynamicFeed.whenViewAll.enableHideSomeContents',
      'dynamicFeedWhenViewAllEnableHideSomeContents',
    ],
    ['dynamicFeed.whenViewAll.hideIds', 'dynamicFeedWhenViewAllHideIds'],
    ['dynamicFeed.advancedSearch', 'dynamicFeedAdvancedSearch'],

    // ['fav.useShuffle', 'favUseShuffle'],
    ['fav.addSeparator', 'favAddSeparator'],
    ['fav.excludedFolderIds', 'favExcludedFolderIds'],

    ['filter.enabled', 'filterEnabled'],
    ['filter.minPlayCount.enabled', 'filterMinPlayCountEnabled'],
    ['filter.minPlayCount.value', 'filterMinPlayCount'],
    ['filter.minDuration.enabled', 'filterMinDurationEnabled'],
    ['filter.minDuration.value', 'filterMinDuration'],
    ['filter.exemptForFollowed.video', 'exemptForFollowedVideo'],
    ['filter.exemptForFollowed.picture', 'exemptForFollowedPicture'],
    ['filter.hideGotoTypePicture', 'filterOutGotoTypePicture'],
    ['filter.hideGotoTypeBangumi', 'filterOutGotoTypeBangumi'],
    ['filter.byAuthor.enabled', 'filterByAuthorNameEnabled'],
    ['filter.byAuthor.keywords', 'filterByAuthorNameKeywords'],
    ['filter.byTitle.enabled', 'filterByTitleEnabled'],
    ['filter.byTitle.keywords', 'filterByTitleKeywords'],

    ['style.general.videoSourceTabStandardHeight', 'styleUseStandardVideoSourceTab'],
    ['style.pureRecommend.useStickyTabbar', 'styleUseStickyTabbarInPureRecommend'],
    ['style.pureRecommend.useCustomGrid', 'styleUseCustomGrid'],
    ['style.pureRecommend.useWhiteBackground', 'styleUseWhiteBackground'],
    ['style.pureRecommend.hideTopChannel', 'styleHideTopChannel'],
    ['style.videoCard.useBorder', 'styleUseCardBorder'],
    ['style.videoCard.useBorderOnlyOnHover', 'styleUseCardBorderOnlyOnHover'],
    ['style.videoCard.useBoxShadow', 'styleUseCardBoxShadow'],
    ['style.videoCard.usePadding', 'styleUseCardPadding'],

    // 2024-12-17
    ['appRecommend.deviceParamForApi', 'appApiDecice'],
  ]
  // 伪代码: savedConfig[newName] = savedConfig[legacyName]
  for (const [configPath, legacyConfigPath] of config) {
    const haveValue = (v: any) => !isNil(v) // 迁移设置, 只是改名, 不用考虑空数组
    if (haveValue(get(val, configPath))) {
      // already have a value
      continue
    }
    if (!haveValue(get(val, legacyConfigPath))) {
      // no legacy value
      continue
    }
    // fallback to legacy
    set(val, configPath, get(val, legacyConfigPath))
  }
}

async function __pickSettingsFromGmStorage(): Promise<PartialDeep<Settings>> {
  const saved = await GM.getValue<Settings>(storageKey)
  if (!saved || typeof saved !== 'object') return {}
  runSettingsMigration(saved)
  return pickSettings(saved, allowedLeafSettingsPaths).pickedSettings
}

export async function loadAndSetup() {
  const val = await __pickSettingsFromGmStorage()
  updateSettings(val)

  // persist when config change
  subscribe(settings, () => {
    _onSettingsChange()
  })

  // replace memory-settings when other tabs change
  reciveGmValueUpdatesFromOtherTab<PartialDeep<Settings>>({
    storageKey,
    setPersist(val) {
      _persist = val
    },
    onUpdate(newValue) {
      updateSettings(newValue)
    },
  })
}

async function _onSettingsChange() {
  const snap = cloneDeep(snapshot(settings))
  await _saveToGmStorage(snap)
  await saveToDraft(snap) // http backup
}

let _persist = true
async function _saveToGmStorage(snap: ReadonlyDeep<PartialDeep<Settings>>) {
  if (!_persist) return
  await GM.setValue(storageKey, snap)
}

/**
 * pick
 */
export function pickSettings(
  source: ReadonlyDeep<PartialDeep<Settings>>,
  paths: LeafSettingsPath[],
  omit: LeafSettingsPath[] = [],
) {
  const pickedSettings: PartialDeep<Settings> = {}
  const pickedPaths = paths.filter(
    (p) => allowedLeafSettingsPaths.includes(p) && !omit.includes(p) && !isNil(get(source, p)),
  )
  pickedPaths.forEach((p) => {
    const v = get(source, p)
    set(pickedSettings, p, v)
  })
  return { pickedPaths, pickedSettings }
}

/**
 * manipulate memory settings
 */
export function updateSettings(payload: PartialDeep<Settings>) {
  const { pickedPaths } = pickSettings(payload, allowedLeafSettingsPaths)
  for (const p of pickedPaths) {
    const v = get(payload, p)
    set(settings, p, v)
  }
}

export function resetSettings() {
  return updateSettings(initialSettings)
}

/**
 * 便于操作 inner array
 */

export type SettingsInnerArrayItem<P extends ListSettingsPath> = Get<Settings, P>[number]

export async function getNewestValueOfSettingsInnerArray<P extends ListSettingsPath>(path: P) {
  // Q: 为什么重新获取
  // A: 在多 Tab 访问的情况下, `settings` 上的数据可能不是最新的, 不想丢失 collection 数据
  const newest = await __pickSettingsFromGmStorage()
  return (get(newest, path) || get(getSettingsSnapshot(), path)) as SettingsInnerArrayItem<P>[]
}
export function setSettingsInnerArray<P extends ListSettingsPath>(
  path: P,
  value: SettingsInnerArrayItem<P>[],
) {
  set(settings, path, value)
}
export async function updateSettingsInnerArray<P extends ListSettingsPath>(
  path: P,
  { add, remove }: { add?: SettingsInnerArrayItem<P>[]; remove?: SettingsInnerArrayItem<P>[] },
) {
  const arr = await getNewestValueOfSettingsInnerArray(path)
  const s = new Set(arr)
  for (const x of add ?? []) s.add(x)
  for (const x of remove ?? []) s.delete(x)
  setSettingsInnerArray(path, Array.from(s))
}

/**
 * load on init
 */
await loadAndSetup()

/**
 * access_key expire check
 */
if (
  IN_BILIBILI_HOMEPAGE &&
  settings.accessKey &&
  settings.accessKeyExpireAt &&
  Date.now() >= settings.accessKeyExpireAt
) {
  toast('access_key 已过期, 请重新获取 !!!')
}
