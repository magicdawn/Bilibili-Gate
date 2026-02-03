import { uniq } from 'es-toolkit'
import { baseDebug } from '$common'
import { ETab } from '$components/RecHeader/tab-enum'
import { isDynamicFeed, type RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { blacklistMids } from '$modules/bilibili/me/relations/blacklist'
import { DynamicFeedEnums } from '$modules/rec-services/dynamic-feed/api/enums'
import { isNormalRankItem } from '$modules/rec-services/hot/rank/rank-tab'
import { getSettingsSnapshot, settings } from '$modules/settings'
import { normalizeCardData } from './normalize'
import { parseFilterByAuthor, parseFilterByTitle } from './parse'

const debug = baseDebug.extend('modules:filter')

export function getFollowedStatus(recommendReason?: string): boolean {
  return !!recommendReason && ['已关注', '新关注'].includes(recommendReason)
}

/**
 * 用于快速判断是否应该启用过滤, 避免 normalizeData 等一些列操作
 * 有可能返回 true, 应尽量返回 true
 */
export function anyFilterEnabled(tab: ETab) {
  if (tab === ETab.KeepFollowOnly) {
    return true
  }

  // 推荐 / 热门
  const mayNeedCheck_blacklist_filterByUp_filterByTitle = [ETab.AppRecommend, ETab.PcRecommend, ETab.Hot].includes(tab)
  if (
    mayNeedCheck_blacklist_filterByUp_filterByTitle &&
    (blacklistMids.size ||
      (settings.filter.enabled &&
        (settings.filter.byAuthor.enabled ||
          settings.filter.byTitle.enabled ||
          settings.filter.minDuration.enabled ||
          settings.filter.minPlayCount.enabled ||
          settings.filter.minDanmakuCount.enabled)))
  ) {
    return true
  }

  if (tab === ETab.DynamicFeed && (settings.filter.dfByTitle.enabled || settings.filter.dfHideOpusMids.enabled)) {
    return true
  }

  return false
}

// 推荐 / 热门
// 会使用 blacklistMids / filter.byAuthor / filter.byTitle 过滤
export function isApiRecLike(api: EApiType) {
  return [
    EApiType.AppRecommend,
    EApiType.PcRecommend,
    EApiType.Rank,
    EApiType.PopularGeneral,
    EApiType.PopularWeekly,
  ].includes(api)
}

export function filterRecItems(items: RecItemTypeOrSeparator[], tab: ETab) {
  if (!anyFilterEnabled(tab)) {
    return items
  }

  const filter = getSettingsSnapshot().filter
  const { minDuration, minPlayCount, minDanmakuCount, byAuthor, byTitle, dfByTitle, dfHideOpusMids } = filter
  // general videos
  const { blockUpMids, blockUpNames } = parseFilterByAuthor(byAuthor.keywords)
  const { test: filterByTitleTest } = parseFilterByTitle(byTitle.keywords)
  // df
  const { test: dfFilterByTitleTest } = parseFilterByTitle(dfByTitle.keywords)
  const { blockUpMids: dfBlockOpusMids } = parseFilterByAuthor(dfHideOpusMids.keywords)

  return items.filter((item) => {
    // just keep it
    if (item.api === EApiType.Separator) return true

    const { play, duration, danmaku, recommendReason, goto, authorName, authorMid, title, bvid, href } =
      normalizeCardData(item)
    const followed = getFollowedStatus(recommendReason)

    /**
     * 已关注 Tab
     */
    if (tab === 'keep-follow-only' && !followed) return false

    function check_blacklist_filterByUp_filterByTitle() {
      // blacklist
      if (authorMid && blacklistMids.size && blacklistMids.has(authorMid)) {
        debug('filter out by blacklist-rule: %s %o', authorMid, { bvid, title })
        return false
      }

      // up
      if (
        filter.enabled &&
        byAuthor.enabled &&
        (blockUpMids.size || blockUpNames.size) &&
        (authorName || authorMid) &&
        ((authorName && blockUpNames.has(authorName)) || (authorMid && blockUpMids.has(authorMid)))
      ) {
        debug('filter out by author-rule: %o', {
          authorName,
          authorMid,
          rules: byAuthor.keywords,
          blockUpMids,
          blockUpNames,
          bvid,
          title,
        })
        return false
      }

      /**
       * title
       * 字面 title, 可能包含其他来源: 如 排行榜desc
       */
      let possibleTitles = [title]
      if (item.api === EApiType.Rank && isNormalRankItem(item) && item.desc) {
        possibleTitles.push(item.desc)
      }
      possibleTitles = possibleTitles.filter(Boolean)
      if (
        filter.enabled &&
        byTitle.enabled &&
        byTitle.keywords.length &&
        possibleTitles.length &&
        possibleTitles.some(filterByTitleTest)
      ) {
        debug('filter out by title-rule: %o', {
          possibleTitles,
          rules: byTitle.keywords,
          bvid,
        })
        return false
      }
    }

    // 推荐 / 热门
    if (isApiRecLike(item.api) && check_blacklist_filterByUp_filterByTitle() === false) {
      return false
    }

    // 推荐
    if ((item.api === EApiType.AppRecommend || item.api === EApiType.PcRecommend) && filter.enabled) {
      const isVideo = goto === 'av'
      const isPicture = goto === 'picture'
      const isBangumi = goto === 'bangumi'
      if (isVideo) return filterVideo()
      if (isPicture) return filterPicture()
      if (isBangumi) return filterBangumi()
    }
    function filterVideo() {
      // 不过滤已关注视频
      if (followed && filter.exemptForFollowed.video) return true

      // https://github.com/magicdawn/Bilibili-Gate/issues/87
      // 反向推送, 蜜汁操作.
      if (recommendReason === '关注了你') {
        debug('filter out by recommendReason-rule: %s %o', recommendReason, { bvid, title })
        return false
      }

      // duration
      if (minDuration.enabled && minDuration.value && duration && duration < minDuration.value) {
        debug('filter out by min-duration-rule: %s < %s %o', duration, minDuration.value, {
          bvid,
          title,
        })
        return false
      }

      // play
      if (minPlayCount.enabled && minPlayCount.value && typeof play === 'number' && play < minPlayCount.value) {
        debug('filter out by min-play-count-rule: %s < %s, %o', play, minPlayCount.value, {
          bvid,
          title,
        })
        return false
      }

      // danmaku
      if (
        minDanmakuCount.enabled &&
        minDanmakuCount.value &&
        typeof danmaku === 'number' &&
        danmaku < minDanmakuCount.value
      ) {
        debug('filter out by min-danmaku-count-rule: %s < %s, %o', danmaku, minDanmakuCount.value, {
          bvid,
          title,
        })
        return false
      }

      return true
    }
    function filterPicture() {
      if (filter.hideGotoTypePicture) {
        // 不去掉已关注的图文
        if (followed && filter.exemptForFollowed.picture) {
          return true
        }
        debug('filter out by goto-type-picture-rule: %s %o', goto, {
          bvid,
          title,
        })
        return false
      } else {
        return true
      }
    }
    function filterBangumi() {
      if (filter.hideGotoTypeBangumi) {
        debug('filter out by goto-type-bangumi-rule: %s %o', goto, { title, href })
        return false
      }
      return true
    }

    // 动态
    if (tab === ETab.DynamicFeed && isDynamicFeed(item) && filter.enabled) {
      const { major } = item.modules.module_dynamic
      const isMajorOpus = major?.type === DynamicFeedEnums.MajorType.Opus

      // dfByTitle
      if (settings.filter.dfByTitle.enabled && settings.filter.dfByTitle.keywords.length) {
        let possibleTitles = [title]
        if (isMajorOpus) possibleTitles.push(major.opus.summary?.text || '')
        possibleTitles = uniq(possibleTitles.filter(Boolean))
        if (possibleTitles.some(dfFilterByTitleTest)) {
          debug('filter out by df-title-rule: %o', {
            possibleTitles,
            rules: dfByTitle.keywords,
            uniqId: item.uniqId,
            item,
          })
          return false
        }
      }

      // dfHideOpusMids
      if (
        isMajorOpus &&
        dfHideOpusMids.enabled &&
        dfHideOpusMids.keywords.length &&
        authorMid &&
        dfBlockOpusMids.has(authorMid)
      ) {
        debug('filter out by df-hide-opus-mids-rule: %o', {
          dfHideOpusMids,
          authorMid,
          title,
          uniqId: item.uniqId,
        })
        return false
      }
    }

    return true // just keep it
  })
}
