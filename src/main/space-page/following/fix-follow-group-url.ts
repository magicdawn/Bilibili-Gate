import { limitFunction } from 'promise.map'
import { baseDebug } from '$common'
import { globalEmitter } from '$main/shared'
import { poll, tryAction } from '$utility/dom'
import { isViewingFollowGroup } from '.'

const debug = baseDebug.extend('main:space-page:following:fix-follow-group-url')

export async function fixFollowGroupUrl() {
  // 先展开
  await tryAction('.space-follow .relation-collapse-more', (x) => x.click(), { pollTimeout: 1_000 })

  const fixFollowGroupUrl = limitFunction(async () => {
    if (!isViewingFollowGroup(location.href)) return
    const tagid = new URLSearchParams(location.search).get('tagid')!
    await selectGroupFromQuerystring(tagid)
  }, 1)
  fixFollowGroupUrl()
  globalEmitter.on('navigate-success', () => fixFollowGroupUrl())
}

async function selectGroupFromQuerystring(tagid: string) {
  if (!tagid) return
  debug('selectGroupFromQuerystring: %s', tagid)

  const el = await poll(
    () => document.querySelector<HTMLElement>(`.follow-sidebar-item a[href*="tagid=${tagid}"] .vui_sidebar-item`),
    { interval: 200, timeout: 2_000 },
  )
  if (!el) return
  if (el.classList.contains('.vui_sidebar-item--active')) return

  debug('click group %s', tagid)
  el.scrollIntoViewIfNeeded?.()
  el.click()
}
