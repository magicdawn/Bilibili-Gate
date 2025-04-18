import { APP_NAME, APP_NAMESPACE } from '$common'
import { AppRoot } from '$components/AppRoot'
import { AntdTooltip } from '$modules/antd/custom'
import { DynamicFeedQueryKey } from '$modules/rec-services/dynamic-feed/store'
import { FavQueryKey } from '$modules/rec-services/fav/store'
import { SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'
import { poll, tryAction } from '$utility/dom'
import { css } from '@emotion/react'
import { useEventListener } from 'ahooks'
import { type ComponentProps, type ReactNode } from 'react'
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
      root.render(
        <AppRoot>
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
      const reg = new RegExp(
        String.raw`https://space.bilibili.com\/(?<mid>\d+)\/channel\/collectiondetail\?`,
      )
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

async function getFollowedStatus() {
  const followed = !!(await poll(
    () => {
      const list = Array.from(document.querySelectorAll('.space-follow-btn')).filter(
        (el) => el.textContent?.trim() === '已关注',
      )
      return list[0]
    },
    { interval: 100, timeout: 5_000 },
  ))
  state.followed = followed
}

if (typeof window.navigation !== 'undefined') {
  window.navigation.addEventListener?.('navigatesuccess', () => {
    state.href = location.href
    getFollowedStatus()
  })
}

function useAltKeyState() {
  const [altKeyPressing, setAltKeyPressing] = useState(false)
  useEventListener('keydown', (e) => {
    if (e.altKey) {
      setAltKeyPressing(true)
    }
  })
  useEventListener('keyup', (e) => {
    setAltKeyPressing(false)
  })
  return altKeyPressing
}

function ActionButtons() {
  const { mid, collectionId, followed } = useSnapshot(state)
  if (!mid) return

  // 合集
  const viewCollectionButton = typeof collectionId === 'number' && (
    <ActionButton
      href={`https://www.bilibili.com/?${FavQueryKey.CollectionIdFull}=${collectionId}`}
      target='_blank'
      tooltip={`在「${APP_NAME}」中查看合集`}
    >
      {APP_NAME} 合集
    </ActionButton>
  )

  // 动态 | 投稿
  const viewUpVideoListButton = <ViewUpVideoListButton />

  return (
    <>
      {/* show 1 button */}
      {viewCollectionButton || viewUpVideoListButton}
    </>
  )
}

/**
 * 动态 | 投稿
 */
function ViewUpVideoListButton() {
  const altKeyPressing = useAltKeyState()
  const { mid, followed, isSearching, searchKeyword } = useSnapshot(state)
  if (!mid) return

  // 投稿
  const showSpaceUpload = useMemo(() => {
    if (isSearching) return true
    if (followed) {
      return altKeyPressing
    } else {
      return !altKeyPressing
    }
  }, [isSearching, followed, altKeyPressing])

  const queryKey = showSpaceUpload ? SpaceUploadQueryKey.Mid : DynamicFeedQueryKey.Mid
  const label = showSpaceUpload ? '投稿' : '动态'
  let href = `https://www.bilibili.com/?${queryKey}=${mid}`
  if (showSpaceUpload && isSearching) {
    href += `&${SpaceUploadQueryKey.SearchText}=${searchKeyword}`
  }

  return (
    <ActionButton
      href={href}
      tooltip={`在「${APP_NAME}」中查看 UP 的${label}`}
      onClick={(e) => {
        if (altKeyPressing) {
          e.preventDefault()
          window.open(href, '_blank')
        }
      }}
    >
      {APP_NAME} {label}
    </ActionButton>
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
  const btn = usingNewSpacePage ? (
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
