import ms from 'ms'
import { wrapWithIdbCache } from '$utility/idb'
import { getSpaceAccInfo } from './space-acc-info'

async function __fetchUserNickname(mid: string | number) {
  const info = await getSpaceAccInfo(mid)
  const nickname = info?.name
  return nickname
}

export const getUserNickname = wrapWithIdbCache({
  fn: __fetchUserNickname,
  generateKey: (mid) => mid.toString(),
  tableName: 'user-nickname',
  ttl: ms('10d'),
})

export async function setNicknameCache(mid: string | number, nickname: string) {
  await getUserNickname.cache.set(mid.toString(), { val: nickname, ts: Date.now() })
}
