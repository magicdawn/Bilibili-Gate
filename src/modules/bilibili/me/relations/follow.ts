/**
 * user follow services
 */

import pMemoize from 'p-memoize'
import { request } from '$request'
import { modifyRelations } from './common'
import type { FollowStateJson } from './types/follow-state'
import type { RelationAttributeEntity } from './types/shared'

function followActionFactory(action: 'follow' | 'unfollow') {
  // 取消关注
  // 1 === this.attribute ? 4 : 2

  const act = action === 'follow' ? 1 : 2

  return async function followAction(upMid: string) {
    const success = await modifyRelations(upMid, act)
    return success
  }
}

export const follow = followActionFactory('follow')
export const unfollow = followActionFactory('unfollow')
export const UserfollowService = { follow, unfollow }

/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/user/relation.html#查询用户与自己关系-仅关注
 */

export function isFollowedFromRelationAttribute(relationAttribute: RelationAttributeEntity) {
  /** 关系属性	0：未关注; 1：悄悄关注（已弃用）; 2：已关注; 6：已互粉; 128：已拉黑 */
  return [1, 2, 6].includes(relationAttribute.attribute)
}

export async function queryFollowState(upMid: string | number) {
  const res = await request.get('/x/relation', { params: { fid: upMid } })
  const json = res.data as FollowStateJson
  return json.data
}

// with memory cache
export const queryFollowStateMemoized = pMemoize(queryFollowState, {
  cacheKey: ([upMid]) => upMid.toString(),
})
