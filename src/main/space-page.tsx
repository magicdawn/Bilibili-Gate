import { APP_NAME, APP_NAMESPACE } from '$common'
import { DynamicFeedQueryKey } from '$modules/rec-services/dynamic-feed/store'
import { FavQueryKey } from '$modules/rec-services/fav/store'
import { tryAction } from '$utility/dom'
import { css } from '@emotion/react'
import type { ComponentProps } from 'react'
import { proxy, useSnapshot } from 'valtio'

export async function initSpacePage() {
  addDynEntry()
}

const rootElId = `${APP_NAMESPACE}-${crypto.randomUUID()}`

async function addDynEntry() {
  if (!state.mid) return

  const oldSelector = '.h-action'
  const newSelector = '.upinfo .operations'
  await tryAction(
    [oldSelector, newSelector].join(','),
    (container) => {
      state.href = location.href
      state.usingNewSpacePage = container.matches(newSelector)

      const rootEl = document.createElement('span')
      rootEl.id = rootElId
      container.insertAdjacentElement('afterbegin', rootEl)
      const root = createRoot(rootEl)
      root.render(<ActionButtons />)
    },
    { pollTimeout: 10_000, pollInterval: 1_000 },
  )
}

const state = proxy({
  href: location.href,
  usingNewSpacePage: false,

  get mid() {
    return parseMid(this.href)
  },

  get collectionId(): number | undefined {
    // new: https://space.bilibili.com/<mid>/lists/<collection-id>?type=season
    {
      const reg = new RegExp(
        String.raw`https://space.bilibili.com\/(?<mid>\d+)\/lists\/(?<collectionId>\d+)\?type=season`,
      )
      const match = location.href.match(reg)
      if (match?.groups?.collectionId) {
        return Number(match?.groups?.collectionId)
      }
    }

    // old: https://space.bilibili.com/<mid>/channel/collectiondetail?sid=<collection-id>
    {
      const reg = new RegExp(
        String.raw`https://space.bilibili.com\/(?<mid>\d+)\/channel\/collectiondetail\?`,
      )
      if (reg.test(location.href)) {
        const u = new URL(location.href)
        const collectionId = u.searchParams.get('sid')?.trim()
        if (collectionId) {
          return Number(collectionId)
        }
      }
    }
  },

  get isCollectionPage() {
    return typeof this.collectionId === 'number'
  },
})

// @ts-ignore
unsafeWindow?.navigation?.addEventListener?.('navigatesuccess', () => {
  state.href = location.href
})

function ActionButtons() {
  const { mid, collectionId } = useSnapshot(state)

  if (!mid) return

  const viewDynamicFeedButton = (
    <ActionButton href={`https://www.bilibili.com/?${DynamicFeedQueryKey.Mid}=${mid}`}>
      {APP_NAME} 动态
    </ActionButton>
  )

  const viewCollectionButton = typeof collectionId === 'number' && (
    <ActionButton
      href={`https://www.bilibili.com/?${FavQueryKey.CollectionIdFull}=${collectionId}`}
      target='_blank'
    >
      {APP_NAME} 合集
    </ActionButton>
  )

  return (
    <>
      {/* show 1 button */}
      {viewCollectionButton || viewDynamicFeedButton}
    </>
  )
}

function ActionButton({ href, children, className, style, ...restProps }: ComponentProps<'a'>) {
  const { usingNewSpacePage } = useSnapshot(state)
  return usingNewSpacePage ? (
    <a
      href={href}
      className={className}
      style={style}
      {...restProps}
      css={css`
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 150px;
        height: 34px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 700;
        color: var(--text_white);
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(255, 255, 255, 0.14);
        transition: all 0.3s;
        margin-right: 24px;
        &:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }
      `}
    >
      {children}
    </a>
  ) : (
    <a
      href={href}
      className={clsx('h-f-btn', className)}
      style={{ width: 'auto', paddingInline: '15px', ...style }}
      {...restProps}
    >
      {children}
    </a>
  )
}

function parseMid(href = location.href) {
  const url = new URL(href)
  const mid = url.pathname
    .split('/')
    .map((x) => x.trim())
    .filter((x) => x)[0]
  if (!mid || !/^\d+$/.test(mid)) return
  return mid
}
