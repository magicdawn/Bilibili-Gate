/**
 * 现在 bilibili.com 页面无法完成从视频 -> 合集的跳转
 * @NOTE: 未来需检查 space.bilibili.com 是否修复此问题
 *
 * https://space.bilibili.com/34842921/lists?sid=4976283
 * ->
 * https://space.bilibili.com/34842921/lists/4976283?type=season
 */

import { globalEmitter } from '$main/shared'

export function fixCollectionUrl() {
  globalEmitter.on('navigate-success', redirectCollectionUrl)
}

function redirectCollectionUrl() {
  const u = new URL(location.href)
  if (u.hostname !== 'space.bilibili.com') return

  const match = /^\/(?<mid>\d+)\/lists\?sid=(?<sid>\d+)$/.exec(u.pathname + u.search)
  if (!match) return

  const newUrl = new URL(`/${match.groups?.mid}/lists/${match.groups?.sid}`, location.href).href
  location.href = newUrl
}
