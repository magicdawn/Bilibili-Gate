import { Result } from 'better-result'
import ms from 'ms'
import { computed } from 'valtio-reactive'
import { appError, baseDebug, IN_BILIBILI_HOMEPAGE } from '$common'
import {
  fetchFullFollowings,
  followedMidSet,
  followedMidSetReplaceAllWith,
} from '$modules/bilibili/me/relations/following-state'
import { whenIdle } from '$utility/dom'
import { proxyWithGmStorage } from '$utility/valtio'
import {
  blacklistMidSet,
  blacklistMidSetReplaceAllWith,
  fetchFullBlacklist,
} from '../../modules/bilibili/me/relations/blacklist'

const debug = baseDebug.extend('main:homepage:init-relations')

export const relationsStore = await proxyWithGmStorage(
  { blacklistUpdatedAt: 0, followingsUpdatedAt: 0 },
  'relations-info',
)

export const cacheStore = computed({
  blacklistCacheValid() {
    return (
      !!blacklistMidSet.size &&
      !!relationsStore.blacklistUpdatedAt &&
      Date.now() - relationsStore.blacklistUpdatedAt <= ms('1days') // 1 day
    )
  },
  followingsCacheValid() {
    return (
      !!followedMidSet.size &&
      !!relationsStore.followingsUpdatedAt &&
      Date.now() - relationsStore.followingsUpdatedAt <= ms('3days') // 3 days
    )
  },
})

export async function initMyRelations() {
  if (!IN_BILIBILI_HOMEPAGE) return // 仅首页需要
  await whenIdle()
  // 串行: 避免 request limit => {code: -412,message: "request was banned",ttl: 1}
  await initMyBlacklist()
  await initMyFollowings()
}

async function initMyBlacklist() {
  if (cacheStore.blacklistCacheValid) return Result.ok({ skip: true })
  const result = await fetchFullBlacklist()
  return result
    .tapError((err) => appError('initMyBlacklist error:', err))
    .tap((mids) => {
      debug('my blocklist fetched: %o', mids)
      if (mids.length) {
        // replace
        blacklistMidSetReplaceAllWith(mids.map((x) => x.toString()))
        relationsStore.blacklistUpdatedAt = Date.now()
      }
    })
}

async function initMyFollowings() {
  if (cacheStore.followingsCacheValid) return
  const result = await fetchFullFollowings()
  return result
    .tapError((err) => appError('initMyFollowings error:', err))
    .tap((mids) => {
      debug('my followings fetched: %o', mids)
      if (mids.length) {
        // replace
        followedMidSetReplaceAllWith(mids.map((x) => x.toString()))
        relationsStore.followingsUpdatedAt = Date.now()
      }
    })
}
