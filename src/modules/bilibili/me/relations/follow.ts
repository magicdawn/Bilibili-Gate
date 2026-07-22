/**
 * user follow services
 */

import { isNotNil } from 'es-toolkit'
import pMemoize from 'p-memoize'
import { proxySet } from 'valtio/utils'
import { getLoginStatus } from '$modules/login-status'
import { request, WebApiError } from '$request'
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
  return !!relationAttribute.attribute && [1, 2, 6].includes(relationAttribute.attribute)
}

async function fetchRelationEntity(upMid: string | number): Promise<RelationAttributeEntity | undefined> {
  if (!getLoginStatus()) return
  const res = await request.get<FollowStateJson>('/x/relation', { params: { fid: upMid } })
  const validateResult = WebApiError.validateAxiosResponse(res, '获取关系失败')
  if (validateResult.isErr()) return
  const json = validateResult.value
  return json.data
}

export const queryRelationEntity = pMemoize(fetchRelationEntity, {
  cacheKey: ([upMid]) => upMid.toString(),
  shouldCache: (val) => isNotNil(val),
})

/**
 * 返回 boolean | undefined, undefined 表示未知
 */
export async function queryFollowedStatus(upMid: string | number) {
  const entity = await queryRelationEntity(upMid)
  if (!entity) return
  const val = isFollowedFromRelationAttribute(entity)
  val ? followedMidSet.add(upMid.toString()) : followedMidSet.delete(upMid.toString())
  return val
}

export const followedMidSet = proxySet<string>()
