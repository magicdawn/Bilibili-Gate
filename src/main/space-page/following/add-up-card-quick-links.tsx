import { Button } from 'antd'
import { throttle } from 'es-toolkit'
import { APP_NAME, BiliDomain, createReactRoot } from '$common'
import { AppRoot } from '$components/AppRoot'
import { globalEmitter } from '$main/shared'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForDynamicFeed, IconForSpaceUpload } from '$modules/icon'
import { DynamicFeedQueryKey } from '$modules/rec-services/dynamic-feed/store'
import { SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'

export function addUpCardQuickLinks() {
  const fn = throttle(queryAllThenProcess, 250)
  fn()
  globalEmitter.on('navigate-success', fn)
  const followMain = document.querySelector<HTMLElement>('.follow-main')
  if (followMain) {
    const ob = new MutationObserver(() => fn())
    ob.observe(followMain, { childList: true, subtree: true })
  }
}

const quickLinksAdded = new WeakSet<HTMLElement>()
const quickLinksAddedAttr = 'gateQuickLinksAdded'

function queryAllThenProcess() {
  const selector = '.follow-main .item .relation-card'
  const cards = document.querySelectorAll<HTMLElement>(selector)
  for (const c of cards) {
    if (quickLinksAdded.has(c)) continue
    if (c.dataset[quickLinksAddedAttr]) continue
    quickLinksAdded.add(c)
    c.dataset[quickLinksAddedAttr] = 'true'
    processSingleUpCard(c)
  }
}

function processSingleUpCard(c: HTMLElement) {
  const rootEl = document.createElement('div')
  c.querySelector('.relation-card-info-option .follow-btn')?.insertAdjacentElement('afterend', rootEl)
  const info = parseUpCard(c)
  const root = createReactRoot(rootEl)
  root.render(
    <AppRoot>
      <UpCardQuickLinks mid={info.mid} />
    </AppRoot>,
  )
}

function UpCardQuickLinks({ mid }: { mid: string | number }) {
  const spaceUploadHref = `https://${BiliDomain.Main}/?${SpaceUploadQueryKey.Mid}=${mid}`
  const dynamicFeedHref = `https://${BiliDomain.Main}/?${DynamicFeedQueryKey.Mid}=${mid}`
  return (
    <span className='ml-2 inline-flex items-center gap-x-2'>
      <AntdTooltip title={`在「${APP_NAME}」中查看 UP 的投稿`}>
        <Button variant='link' className='icon-only-round-button size-24px' href={spaceUploadHref} target='_blank'>
          <IconForSpaceUpload className='size-16px' />
        </Button>
      </AntdTooltip>
      <AntdTooltip title={`在「${APP_NAME}」中查看 UP 的动态`}>
        <Button variant='link' className='icon-only-round-button size-24px' href={dynamicFeedHref} target='_blank'>
          <IconForDynamicFeed className='size-16px' />
        </Button>
      </AntdTooltip>
    </span>
  )
}

function parseUpCard(c: HTMLElement): any {
  const mid = c.querySelector<HTMLDivElement>('.relation-card-avatar')?.dataset.userProfileId || '0'
  return { mid }
}
