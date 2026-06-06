import { delay } from 'es-toolkit'
import { limitFunction } from 'promise.map'
import { appLog, baseDebug } from '$common'
import { globalEmitter } from '$main/shared'
import { poll } from '$utility/dom'
import { isViewingFollowGroup } from '.'

const debug = baseDebug.extend('main:space-page:following')

export function fixFollowGroupUrl() {
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

  await delay(100)
  document.querySelector<HTMLDivElement>('.space-follow .relation-collapse-more')?.click()
  await delay(100)

  const el = await poll(
    () => document.querySelector<HTMLElement>(`.follow-sidebar-item a[href*="tagid=${tagid}"] .vui_sidebar-item`),
    { interval: 500, timeout: 5_000 },
  )
  if (!el) return
  if (el.classList.contains('.vui_sidebar-item--active')) return

  appLog('click group %s', tagid)
  el.scrollIntoViewIfNeeded?.()
  el.click()
}
