import { useHover } from 'ahooks'
import { throttle } from 'es-toolkit'
import { useMemo, useRef, type ComponentProps } from 'react'
import { createPortal } from 'react-dom'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_SHORT_PREFIX, createReactRoot } from '$common'
import { AppRoot } from '$components/AppRoot'
import { useLargePreviewRelated } from '$components/LargePreview/useLargePreview'
import { defaultRecSharedEmitter } from '$components/Recommends/rec.shared'
import {
  VideoCardActionsClassNames,
  type VideoCardActionButton,
} from '$components/VideoCard/child-components/VideoCardActions'
import type { SetNonNullable } from 'type-fest'

export interface ILargePreviewAdapter {
  // query cards
  observerTarget?: Node | null
  itemsSelector: string
  throttleDelay?: number
  // process single card
  anchorSelector?: string
  reactRootInsertPosition?: InsertPosition
  parseCardInfo?: typeof parseCardInfo
  cardElSelector?: string
  coverElSelector?: string
}

export type INormalizedLargePreviewAdapter = Required<SetNonNullable<ILargePreviewAdapter>>

function normalizeLargePreviewAdapter(adapter: ILargePreviewAdapter): INormalizedLargePreviewAdapter {
  return {
    // query cards
    observerTarget: adapter.observerTarget ?? document.body,
    itemsSelector: adapter.itemsSelector,
    throttleDelay: adapter.throttleDelay || 300,
    // process single card
    anchorSelector: adapter.anchorSelector || '.bili-watch-later--wrap',
    reactRootInsertPosition: adapter.reactRootInsertPosition ?? 'afterend',
    parseCardInfo: adapter.parseCardInfo ?? parseCardInfo,
    cardElSelector: adapter.cardElSelector || '.bili-video-card',
    coverElSelector: adapter.coverElSelector || '.bili-video-card__wrap > a',
  }
}

export function setupLargePreview(adapter: ILargePreviewAdapter) {
  const normalizedAdapter = normalizeLargePreviewAdapter(adapter)
  const { itemsSelector, throttleDelay, observerTarget } = normalizedAdapter
  const run = throttle(() => {
    const list = document.querySelectorAll<HTMLDivElement>(itemsSelector)
    for (const el of list) addLargePreview(el, normalizedAdapter)
  }, throttleDelay)
  run()
  const ob = new MutationObserver(() => run())
  ob.observe(observerTarget, { childList: true, subtree: true })
}

const processed = new WeakSet<HTMLDivElement>()
const processedAttr = `data-${APP_SHORT_PREFIX}-large-preview-added`

function addLargePreview(el: HTMLDivElement, adapter: INormalizedLargePreviewAdapter) {
  if (processed.has(el)) return
  if (el.getAttribute(processedAttr)) return

  const anchorEl = el.querySelector<HTMLDivElement>(adapter.anchorSelector)
  if (!anchorEl) return

  const reactRootEl = document.createElement('div')
  processed.add(el)
  el.setAttribute(processedAttr, 'true')
  anchorEl.insertAdjacentElement(adapter.reactRootInsertPosition, reactRootEl)

  const root = createReactRoot(reactRootEl)
  root.render(
    <AppRoot>
      <LargePreviewSetup
        el={el}
        parseCardInfo={adapter.parseCardInfo}
        cardElSelector={adapter.cardElSelector}
        coverElSelector={adapter.coverElSelector}
      />
    </AppRoot>,
  )
}

const actionButtonProps: Partial<ComponentProps<typeof VideoCardActionButton>> = {
  useMotion: true,
  motionProps: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { delay: 0 } },
    transition: { duration: 0.2, ease: 'linear', delay: 0.2 },
  },
}

function LargePreviewSetup({
  el,
  parseCardInfo,
  cardElSelector,
  coverElSelector,
}: { el: HTMLDivElement } & Pick<
  INormalizedLargePreviewAdapter,
  'parseCardInfo' | 'cardElSelector' | 'coverElSelector'
>) {
  const { bvid = '', cover } = useMemo(() => parseCardInfo(el), [el, parseCardInfo])
  const cardEl = useMemo(() => el.querySelector<HTMLDivElement>(cardElSelector) ?? el, [el, cardElSelector])
  const coverEl = useMemo(() => cardEl.querySelector<HTMLAnchorElement>(coverElSelector), [cardEl, coverElSelector])
  const hovering = useHover(coverEl)
  const videoCardAsTriggerRef = useRef<HTMLElement | null>(coverEl)

  const { largePreviewActionButtonEl, largePreviewEl } = useLargePreviewRelated({
    shouldFetchPreviewData: !!bvid,
    hasLargePreviewActionButton: true,
    actionButtonVisible: hovering,
    actionButtonProps,
    // required
    bvid,
    cid: undefined,
    uniqId: bvid,
    recSharedEmitter: defaultRecSharedEmitter,
    cardTarget: cardEl,
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
      bvid = /^\/video\/(?<bvid>BV\w+)\/?/i.exec(new URL(link).pathname)?.groups?.bvid
    }
  }

  const cover = el.querySelector('picture.bili-video-card__cover img')?.currentSrc

  return { bvid, cover }
}
