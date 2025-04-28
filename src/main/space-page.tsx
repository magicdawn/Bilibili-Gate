import { APP_NAME, APP_NAMESPACE } from '$common'
import { AppRoot } from '$components/AppRoot'
import { colorPrimaryValue } from '$components/css-vars'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForDynamicFeed, IconForSpaceUpload } from '$modules/icon'
import { DynamicFeedQueryKey } from '$modules/rec-services/dynamic-feed/store'
import { FavQueryKey } from '$modules/rec-services/fav/store'
import { IconForCollection } from '$modules/rec-services/fav/usage-info'
import { SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'
import { reusePendingPromise } from '$utility/async'
import { poll, tryAction } from '$utility/dom'
import { css } from '@emotion/react'
import { type ComponentProps, type ReactNode } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
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
      getFollowedStatus()

      const rootEl = document.createElement('span')
      rootEl.id = rootElId
      rootEl.classList.add('mr-24px')
      container.insertAdjacentElement('afterbegin', rootEl)
      const root = createRoot(rootEl)
      root.render(
        <AppRoot injectGlobalStyle>
          <ActionButtons />
        </AppRoot>,
      )
    },
    { pollTimeout: 10_000, pollInterval: 1_000 },
  )
}

const state = proxy({
  href: location.href,
  usingNewSpacePage: false,
  followed: false,

  get mid() {
    return parseMid(this.href)
  },

  get collectionId(): number | undefined {
    // new: https://space.bilibili.com/<mid>/lists/<collection-id>?type=season
    {
      const reg = new RegExp(
        String.raw`https://space.bilibili.com\/(?<mid>\d+)\/lists\/(?<collectionId>\d+)(?:\?type=season)?`,
      )
      const match = this.href.match(reg)
      if (match?.groups?.collectionId) {
        return Number(match?.groups?.collectionId)
      }
    }

    // old: https://space.bilibili.com/<mid>/channel/collectiondetail?sid=<collection-id>
    {
      const reg = new RegExp(String.raw`https://space.bilibili.com\/(?<mid>\d+)\/channel\/collectiondetail\?`)
      if (reg.test(this.href)) {
        const u = new URL(this.href)
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

  get searchKeyword() {
    const reg = new RegExp(String.raw`https://space.bilibili.com\/(?<mid>\d+)\/search`)
    if (!reg.test(this.href)) return undefined
    const searchParams = new URLSearchParams(location.search)
    const keyword = searchParams.get('keyword')
    return keyword ?? undefined
  },

  get isSearching() {
    return !!this.searchKeyword?.trim()
  },
})

const getFollowedStatus = reusePendingPromise(async () => {
  const followed = await poll(
    () => {
      const list = Array.from(document.querySelectorAll('.space-follow-btn')).filter(
        (el) => el.textContent?.trim() === '已关注',
      )
      if (list.length > 0) return true
    },
    { interval: 100, timeout: 5_000 },
  )
  state.followed = !!followed
})

if (typeof window.navigation !== 'undefined') {
  window.navigation.addEventListener?.('navigatesuccess', () => {
    state.href = location.href
    getFollowedStatus()
  })
}

function ActionButtons() {
  const { mid, collectionId, followed, isSearching, searchKeyword } = useSnapshot(state)
  if (!mid) return

  const btnClassName = 'w-34px rounded-full'
  const btnCss = css`
    border-color: rgb(255 255 255 / 33%);
    &:hover {
      border-color: ${colorPrimaryValue};
      background-color: ${colorPrimaryValue};
    }
  `

  // 投稿
  let btnSpaceUpload: ReactNode
  {
    let href = `https://www.bilibili.com/?${SpaceUploadQueryKey.Mid}=${mid}`
    if (isSearching && searchKeyword) {
      href += '&' + SpaceUploadQueryKey.SearchText + '=' + searchKeyword
    }
    btnSpaceUpload = (
      <ActionButton
        key='btnSpaceUpload'
        className={btnClassName}
        css={btnCss}
        href={href}
        tooltip={`在「${APP_NAME}」中查看 UP 的投稿`}
      >
        <IconForSpaceUpload />
      </ActionButton>
    )
  }

  // 动态
  let btnDynamicFeed: ReactNode
  if (followed) {
    const href = `https://www.bilibili.com/?${DynamicFeedQueryKey.Mid}=${mid}`
    btnDynamicFeed = (
      <ActionButton
        key='btnDynamicFeed'
        className={btnClassName}
        css={btnCss}
        href={href}
        tooltip={`在「${APP_NAME}」中查看 UP 的动态`}
      >
        <IconForDynamicFeed />
      </ActionButton>
    )
  }

  // 合集
  let btnViewCollection: ReactNode
  if (typeof collectionId === 'number') {
    btnViewCollection = (
      <ActionButton
        key='btnViewCollection'
        className={btnClassName}
        css={btnCss}
        href={`https://www.bilibili.com/?${FavQueryKey.CollectionIdFull}=${collectionId}`}
        target='_blank'
        tooltip={`在「${APP_NAME}」中查看合集`}
      >
        <IconForCollection />
      </ActionButton>
    )
  }

  return (
    <span className='inline-flex items-center gap-x-8px'>
      {btnViewCollection}
      {btnSpaceUpload}
      {btnDynamicFeed}
    </span>
  )
}

function ActionButton({
  href,
  children,
  className,
  style,
  tooltip,
  ...restProps
}: ComponentProps<'a'> & { tooltip?: ReactNode }) {
  const { usingNewSpacePage } = useSnapshot(state)
  const _className = useUnoMerge('w-150px rounded-6px', className)
  const btn = usingNewSpacePage ? (
    <a
      href={href}
      className={_className}
      style={style}
      {...restProps}
      css={css`
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 34px;
        font-size: 14px;
        font-weight: 700;
        color: var(--text_white);
        transition: all 0.3s;
        border: 1px solid rgb(255 255 255 / 20%);
        background-color: rgb(255 255 255 / 14%);
        &:hover {
          background-color: rgb(255 255 255 / 40%);
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

  if (tooltip) {
    return <AntdTooltip title={tooltip}>{btn}</AntdTooltip>
  } else {
    return btn
  }
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
