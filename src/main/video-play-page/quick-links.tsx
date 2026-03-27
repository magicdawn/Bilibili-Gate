import { css } from '@emotion/css'
import { Button } from 'antd'
import { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { APP_NAME, BiliDomain } from '$common'
import { AppRoot } from '$components/AppRoot'
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

function CollectionQuickLink() {
  const href: string | undefined = useMemo(() => {
    const collectionUrl = document.querySelector('.video-pod .header-top a.title')?.href
    if (!collectionUrl) return

    const sid = new URL(collectionUrl, location.href).searchParams.get('sid')
    if (!sid) return

    return `https://${BiliDomain.Main}/?${FavQueryKey.CollectionId}=${sid}`
  }, [location.href])

  return (
    !!href && (
      <AntdTooltip title={<>在「{APP_NAME}」中查看合集 </>}>
        <Button className='mr-5px icon-only-round-button size-24px' type='link' href={href} target='_blank'>
          <IconForCollection />
        </Button>
      </AntdTooltip>
    )
  )
}
