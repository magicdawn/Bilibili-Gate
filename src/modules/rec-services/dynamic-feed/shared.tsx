import { IconForPlus } from '$modules/icon'
import { getUid } from '$utility/cookie'

export const IconForUp = IconRadixIconsPerson
export const IconForGroup = IconMynauiUsersGroup
export const IconForPopoverTrigger = IconForPlus

export function formatFollowGroupUrl(followGroupId: number | string) {
  return `https://space.bilibili.com/${getUid()}/relation/follow?tagid=${followGroupId}`
}

export function formatSpaceUrl(mid: number | string) {
  return `https://space.bilibili.com/${mid}`
}

export function formatSelfSpaceUrl() {
  return formatSpaceUrl(getUid() || '')
}
