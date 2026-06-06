import { BiliDomain } from '$common'
import { addUpCardQuickLinks } from './add-up-card-quick-links'
import { fixFollowGroupUrl } from './fix-follow-group-url'

export function isViewingFollowGroup(url: string) {
  // https://space.bilibili.com/:mid/relation/follow?tagid=-10
  const u = new URL(url)
  return u.host === BiliDomain.Space && /^\/\d+\/relation\/follow$/.test(u.pathname) && u.searchParams.has('tagid')
}

export function initSpaceFollingPage() {
  if (!isViewingFollowGroup(location.href)) return
  fixFollowGroupUrl()
  addUpCardQuickLinks()
}
