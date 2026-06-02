import { APP_NAME, baseDebug } from '$common'
import { BilibiliArticleDraft } from '$modules/bilibili/me/article-draft'
import { internalBooleanPaths, type LeafSettingsPath } from '.'

export const debug = baseDebug.extend('settings')

export const articleDraft = new BilibiliArticleDraft(APP_NAME)

const privateKeys: LeafSettingsPath[] = ['accessKey', 'accessKeyExpireAt']

export const getBackupOmitPaths: () => LeafSettingsPath[] = () => [
  ...privateKeys,

  ...internalBooleanPaths,

  // the flag
  'backupSettingsToArticleDraft',

  // 无关紧要
  'fav.addSeparator',

  'watchlater.addSeparator',
  'watchlater.itemsOrder',

  'popularWeeklyUseShuffle',

  // 匿名
  'popularGeneralUseAnonymous',
  'appRecommend.anonymousFetch',
  'pcRecommend.anonymousFetch',
]

export const restoreOmitPaths: LeafSettingsPath[] = [
  ...privateKeys,
  // the flag
  'backupSettingsToArticleDraft',
]
