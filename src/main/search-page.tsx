import { useHover } from 'ahooks'
import { limitFunction } from 'promise.map'
import { createPortal } from 'react-dom'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_NAMESPACE } from '$common'
import { AppRoot } from '$components/AppRoot'
import { useLargePreviewRelated } from '$components/LargePreview/useLargePreview'
import { gridDefaultEmitter } from '$components/RecGrid/grid.shared'
import { VideoCardActionsClassNames } from '$components/VideoCard/child-components/VideoCardActions'
import { settings } from '$modules/settings'
import { isInIframe, setupForNoneHomepage } from './shared'

export function initSearchPage() {
  if (isInIframe()) return // pagetual use iframe to load more
  setupForNoneHomepage()
  if (settings.videoCard.videoPreview.addTo.searchPage) {
    addLargePreviewForSearchResults()
  }
}

function addLargePreviewForSearchResults() {
  const run = limitFunction(() => {
    const itemsSelector = '.video-list-item:has(> .bili-video-card),div:has(> .bili-video-card)'
    const list = Array.from(document.querySelectorAll<HTMLDivElement>(itemsSelector))
    for (const el of list) addLargePreview(el)
  }, 1)

  run()
  const ob = new MutationObserver(() => run())
  ob.observe(document.body, { childList: true, subtree: true })
}

const processed = new WeakSet<HTMLDivElement>()
const processedAttr = `${APP_NAMESPACE}-add-large-preview-processed`

function addLargePreview(el: HTMLDivElement) {
  if (processed.has(el)) return
  if (el.getAttribute(processedAttr)) return

  const prevEl = el.querySelector<HTMLDivElement>('.bili-watch-later--wrap')
  if (!prevEl) return

  const container = document.createElement('div')
  prevEl.insertAdjacentElement('afterend', container)
  processed.add(el)
  el.setAttribute(processedAttr, 'true')

  const root = createRoot(container)
  root.render(
    <AppRoot>
      <LargePreviewSetup el={el} />
    </AppRoot>,
  )
}

function LargePreviewSetup({ el }: { el: HTMLDivElement }) {
  const { bvid = '', cover } = useMemo(() => parseCardInfo(el), [el])
  const cardEl = useMemo(() => el.querySelector<HTMLDivElement>('.bili-video-card') ?? el, [el])
  const coverEl = useMemo(() => cardEl.querySelector<HTMLAnchorElement>('.bili-video-card__wrap > a'), [el])
  const hovering = useHover(cardEl)
  const videoCardAsTriggerRef = useRef<HTMLElement | null>(coverEl)

  const { largePreviewActionButtonEl, largePreviewEl } = useLargePreviewRelated({
    shouldFetchPreviewData: !!bvid,
    hasLargePreviewActionButton: true,
    actionButtonVisible: hovering,
    actionButtonProps: {
      useMotion: true,
      motionProps: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { delay: 0 } },
        transition: { duration: 0.2, ease: 'linear', delay: 0.2 },
      },
    },
    // required
    bvid,
    cid: undefined,
    uniqId: bvid,
    gridEmitter: gridDefaultEmitter,
    // optional
    cover,
    videoCardAsTriggerRef,
  })

  return (
    <>
      <div className={useUnoMerge(VideoCardActionsClassNames.top('right'), 'right-[calc(8px+28px+5px)]')}>
        {largePreviewActionButtonEl}
      </div>
      {/* .bili-video-card__wrap 有 z-index: 1, 需要 escape */}
      {createPortal(largePreviewEl, cardEl)}
    </>
  )
}

function parseCardInfo(el: HTMLDivElement) {
  let bvid: string | undefined
  {
    const link = el.querySelector('.bili-video-card__wrap > a')?.href
    if (link) {
      bvid = /^\/video\/(?<bvid>BV\w+)\//i.exec(new URL(link).pathname)?.groups?.bvid
    }
  }

  const cover = el.querySelector('picture.v-img.bili-video-card__cover img')?.currentSrc

  return { bvid, cover }
}
