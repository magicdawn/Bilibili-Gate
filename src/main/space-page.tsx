import { useUnoMerge } from 'unocss-merge/react'
import { proxy, useSnapshot } from 'valtio'
import { APP_NAME, APP_NAMESPACE } from '$common'
import { AppRoot } from '$components/AppRoot'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForDynamicFeed, IconForSpaceUpload } from '$modules/icon'
import { DynamicFeedQueryKey } from '$modules/rec-services/dynamic-feed/store'
import { FavQueryKey } from '$modules/rec-services/fav/store'
import { IconForCollection } from '$modules/rec-services/fav/usage-info'
import { SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'
import { reusePendingPromise } from '$utility/async'
import { poll, tryAction } from '$utility/dom'
import { setupForNoneHomepage } from './shared'
import type { ComponentProps, ReactNode } from 'react'

export function initSpacePage() {
  setupForNoneHomepage()
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
    const u = new URL(this.href)

    // new: https://space.bilibili.com/<mid>/lists/<collection-id>?type=season
    {
      const reg = /https:\/\/space.bilibili.com\/(?<mid>\d+)\/lists\/(?<collectionId>\d+)(?:\?type=season)?/
      const match = this.href.match(reg)
      if (match?.groups?.collectionId && (u.searchParams.get('type') === 'season' || !u.searchParams.get('type'))) {
        return Number(match?.groups?.collectionId)
      }
    }

    // old: https://space.bilibili.com/<mid>/channel/collectiondetail?sid=<collection-id>
    {
      const reg = /https:\/\/space.bilibili.com\/\d+\/channel\/collectiondetail\?/
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
    const reg = /https:\/\/space.bilibili.com\/\d+\/search/
    if (!reg.test(this.href)) return
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

if (window.navigation !== undefined) {
  window.navigation.addEventListener?.('navigatesuccess', () => {
    state.href = location.href
    getFollowedStatus()
  })
}

function ActionButtons() {
  const { mid, collectionId, followed, isSearching, searchKeyword } = useSnapshot(state)
  if (!mid) return

  const clsBtn = 'w-34px b-white/33% rounded-full hover:(b-gate-primary bg-gate-primary)'
  const clsIcon = 'size-17px'

  // 投稿
  let btnSpaceUpload: ReactNode
  {
    let href = `https://www.bilibili.com/?${SpaceUploadQueryKey.Mid}=${mid}`
    if (isSearching && searchKeyword) {
      href += `&${SpaceUploadQueryKey.SearchText}=${searchKeyword}`
    }
    btnSpaceUpload = (
      <ActionButton key='btnSpaceUpload' className={clsBtn} href={href} tooltip={`在「${APP_NAME}」中查看 UP 的投稿`}>
        <IconForSpaceUpload className={clsIcon} />
      </ActionButton>
    )
  }

  // 动态
  let btnDynamicFeed: ReactNode
  if (followed) {
    const href = `https://www.bilibili.com/?${DynamicFeedQueryKey.Mid}=${mid}`
    btnDynamicFeed = (
      <ActionButton key='btnDynamicFeed' className={clsBtn} href={href} tooltip={`在「${APP_NAME}」中查看 UP 的动态`}>
        <IconForDynamicFeed className={clsIcon} />
      </ActionButton>
    )
  }

  // 合集
  let btnViewCollection: ReactNode
  if (typeof collectionId === 'number') {
    btnViewCollection = (
      <ActionButton
        key='btnViewCollection'
        className={clsBtn}
        href={`https://www.bilibili.com/?${FavQueryKey.CollectionIdFull}=${collectionId}`}
        target='_blank'
        tooltip={`在「${APP_NAME}」中查看合集`}
      >
        <IconForCollection className={clsIcon} />
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
  const _className = useUnoMerge(
    'h-34px w-150px flex cursor-pointer items-center justify-center b-1px b-white/20% rounded-6px b-solid bg-white/14% text-14px color-white font-700 transition-duration-300 transition-property-all hover:bg-white/40%',
    className,
  )
  const btn = usingNewSpacePage ? (
    <a {...restProps} href={href} className={_className} style={style}>
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
    .find(Boolean)
  if (!mid || !/^\d+$/.test(mid)) return
  return mid
}
