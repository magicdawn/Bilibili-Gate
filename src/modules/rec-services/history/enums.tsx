/**
 * extract from https://s1.hdslb.com/bfs/static/shanks/history-record/assets/index-6ae5fa2d.js
 */

import { toHttps } from '$utility/url'

// 命名习惯: 原始代码里使用 ALLCAPS, 方便理解, 沿用原始代码
export enum EHistoryDateRangePreset {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  WEEK = 'WEEK',
  WEEKAGO = 'WEEKAGO',
  MONTHAGO = 'MONTHAGO',
}

export enum EHistoryItemType {
  ALL = 'all',
  ARCHIVE = 'archive',
  LIVE = 'live',
  ARTICLE = 'article',
}

export enum EHistoryBusiness {
  UNKNOWN = '',
  ARCHIVE = 'archive',
  LIVE = 'live',
  ARTICLE = 'article',
  PGC = 'pgc',
  ARTICLE_LIST = 'article-list',
  CHEESE = 'cheese',
}

// `cr`
export enum EHistoryDeviceTypeString {
  UNKNOWN = 'UNKNOWN',
  MOBILE = 'MOBILE',
  PAD = 'PAD',
  PC = 'PC',
  TV = 'TV',
  CAR = 'CAR',
  LOT = 'LOT',
}

// `Un`
export enum EHistoryDeviceType {
  ALL = 0,
  PC,
  MOBILE,
  PAD,
  TV,
}

// `l2`
export const ApiDtToDeviceTypeStringMap = {
  0: 'UNKNOWN',
  1: 'MOBILE',
  2: 'PC',
  3: 'MOBILE',
  4: 'PAD',
  5: 'MOBILE',
  6: 'PAD',
  7: 'MOBILE',
  8: 'CAR',
  9: 'LOT',
  10: 'PAD',
  11: 'TV',
  12: 'MOBILE',
  13: 'PAD',
  14: 'PC',
  33: 'TV',
}

// `p4`
export const DeviceTypeIcons = {
  [EHistoryDeviceTypeString.UNKNOWN]: 'BDC/unknown_device_line/1',
  [EHistoryDeviceTypeString.MOBILE]: 'BDC/phone_line/1',
  [EHistoryDeviceTypeString.PAD]: 'BDC/pad_line/1',
  [EHistoryDeviceTypeString.PC]: 'BDC/computer_line/1',
  [EHistoryDeviceTypeString.TV]: 'BDC/television_line/2',
  [EHistoryDeviceTypeString.CAR]: 'BDC/car_line/1',
  [EHistoryDeviceTypeString.LOT]: 'BDC/screen_speaker_line/1',
}

// icon: p4[l2[e.history.dt] || cr.UNKNOWN],

export function buildItemUrl(business: EHistoryBusiness, item: any) {
  const itemUri = toHttps(item.uri || '')

  const withParams = (url: string, params: Record<string, any>) => {
    const u = new URL(url, location.href)
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))
    return u.href
  }

  const defaultParams = { spm_id_from: '333.1391.0.0' }
  switch (business) {
    case EHistoryBusiness.PGC:
    case EHistoryBusiness.ARCHIVE:
      return withParams(itemUri || '//www.bilibili.com/video/'.concat(item.history.bvid, '/'), {
        ...defaultParams,
        ...(item.history.page > 1 && { p: item.history.page }),
      })
    case EHistoryBusiness.ARTICLE:
      return withParams(itemUri || '//www.bilibili.com/read/cv'.concat(item.history.oid, '/'), {
        ...defaultParams,
      })
    case EHistoryBusiness.ARTICLE_LIST:
      return withParams(itemUri || '//www.bilibili.com/read/cv'.concat(item.history.cid, '/'), {
        ...defaultParams,
      })
    case EHistoryBusiness.LIVE:
      return withParams(itemUri || '//live.bilibili.com/'.concat(item.history.oid, '/'), {
        ...defaultParams,
        live_from: '88001',
      })
    case EHistoryBusiness.CHEESE:
      return withParams(itemUri || '//www.bilibili.com/cheese/play/ep'.concat(item.history.epid, '/'), {
        ...defaultParams,
        ...(item.progress > 0 && { t: item.progress }),
        csource: 'common_hp_history_null',
      })
  }
  return itemUri
}
