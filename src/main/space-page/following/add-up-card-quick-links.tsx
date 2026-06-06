import { Button } from 'antd'
import { debounce, delay } from 'es-toolkit'
import { APP_NAME, BiliDomain, createReactRoot } from '$common'
import { AppRoot } from '$components/AppRoot'
import { globalEmitter } from '$main/shared'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForDynamicFeed, IconForSpaceUpload } from '$modules/icon'
import { DynamicFeedQueryKey } from '$modules/rec-services/dynamic-feed/store'
import { SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'

export function addUpCardQuickLinks() {
  queryAllThenProcess()
  globalEmitter.on('navigate-success', () => delay(300).then(queryAllThenProcess))
  const followMain = document.querySelector<HTMLElement>('.follow-main')
  if (followMain) {
    const debounced = debounce(queryAllThenProcess, 100)
    const ob = new MutationObserver(() => debounced())
    ob.observe(followMain, { childList: true, subtree: true })
  }
}

const quickLinksAddedAttr = 'gateQuickLinksAdded'

function queryAllThenProcess() {
  const selector = '.follow-main .item .relation-card'
  const cards = document.querySelectorAll<HTMLElement>(selector)
  for (const c of cards) {
    if (c.dataset[quickLinksAddedAttr]) continue
    c.dataset[quickLinksAddedAttr] = 'true'
    processSingleUpCard(c)
  }
}

function processSingleUpCard(card: HTMLElement) {
  const rootEl = document.createElement('div')
  card.querySelector('.relation-card-info-option .follow-btn')?.insertAdjacentElement('afterend', rootEl)
  const info = parseUpCard(card)
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
