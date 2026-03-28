import { css } from '@emotion/css'
import { Button } from 'antd'
import { delay, throttle } from 'es-toolkit'
import { createRoot } from 'react-dom/client'
import { proxy, snapshot, useSnapshot } from 'valtio'
import { APP_NAME, BiliDomain } from '$common'
import { AppRoot } from '$components/AppRoot'
import { globalEmitter } from '$main/shared'
import { AntdTooltip } from '$modules/antd/custom'
import { FavQueryKey } from '$modules/rec-services/fav/store'
import { IconForCollection } from '$modules/rec-services/fav/views'
import { settings } from '$modules/settings'
import { poll } from '$utility/dom'

export function setupQuickLinks() {
  if (!settings.videoPlayPage.addQuickLinks) return
  setupCollectionQuickLink()
}

async function setupCollectionQuickLink() {
  await delay(2000) // wait for bilibili default content
  const selector = '.rcmd-tab .video-pod .header-bottom .subscribe-btn'
  const btnSubscribe = await poll(() => document.querySelector<HTMLDivElement>(selector), {
    interval: 100,
    timeout: 5_000,
  })
  if (!btnSubscribe) return

  const div = document.createElement('div')
  btnSubscribe.insertAdjacentElement('afterend', div)
  btnSubscribe.parentElement?.classList.add(css`
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    .subscribe-btn {
      flex: none;
    }
  `)

  const root = createRoot(div)
  root.render(
    <AppRoot>
      <CollectionQuickLink />
    </AppRoot>,
  )
}

const store = proxy({
  href: location.href,

  collectionUrl: undefined as string | undefined,
  queryCollectionUrl: throttle(function () {
    store.collectionUrl = document.querySelector('.video-pod .header-top a.title')?.href
  }, 100),

  get gateCollectionUrl() {
    const { collectionUrl } = this
    if (!collectionUrl) return

    const sid = new URL(collectionUrl, this.href).searchParams.get('sid')
    if (!sid) return

    return `https://${BiliDomain.Main}/?${FavQueryKey.CollectionId}=${sid}`
  },
})

globalEmitter.on('navigate-success', async () => {
  const prevSnap = snapshot(store)
  store.href = location.href
  store.queryCollectionUrl()
  // href updated
  if (store.href !== prevSnap.href) {
    // wait UI update controlled by other scripts
    // UGLY code but works
    for (const d of [100, 200, 400, 1000, 2000, 4000]) {
      await delay(d)
      store.queryCollectionUrl()
    }
  }
})

function CollectionQuickLink() {
  const { gateCollectionUrl } = useSnapshot(store)
  return (
    !!gateCollectionUrl && (
      <AntdTooltip title={<>在「{APP_NAME}」中查看合集 </>}>
        <Button className='mr-5px icon-only-round-button size-24px' href={gateCollectionUrl} target='_blank'>
          <IconForCollection className='size-16px' />
        </Button>
      </AntdTooltip>
    )
  )
}
