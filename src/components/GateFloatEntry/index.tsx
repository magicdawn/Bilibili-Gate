import { DndContext, useDndMonitor, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Button } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { APP_NAME, appLog } from '$common'
import { useMixedRef } from '$common/hooks/mixed-ref'
import { $windowSize } from '$common/hooks/useWindowSize'
import { clsZGateFloatEntry } from '$components/fragments'
import { toggleModalFeed } from '$components/RecHeader/modals'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForOpenExternalLink } from '$modules/icon'
import { getGateEntryHref } from '$routes'
import { minmax } from '$utility/num'
import { proxyWithLocalStorage } from '$utility/valtio'
import type { ComponentProps } from 'react'

type InlineAlign = 'left' | 'right'

const floatEntryStore = proxyWithLocalStorage(
  {
    align: 'right' as InlineAlign,
    top: 100, // px
  },
  'bilibili-gate:float-entry',
)

const C = {
  wrapperInner: 'flex flex-col items-center gap-y-8px b-1px b-gate-primary rounded-18px b-solid bg-gate-bg p-4px',
  buttonIcon: 'size-18px',
}

export function GateFloatEntry() {
  return (
    <DndContext>
      <GateFloatEntryInner />
    </DndContext>
  )
}

function GateFloatEntryInner() {
  const { align, top } = useSnapshot(floatEntryStore, { sync: true })

  const tooltipConfig: Partial<ComponentProps<typeof AntdTooltip>> = useMemo(() => {
    const factor = align === 'right' ? -1 : 1
    return {
      arrow: false,
      placement: align === 'right' ? 'left' : 'right',
      align: { offset: [10 * factor, 0] },
    }
  }, [align])

  const gateEntryHref = useMemo(getGateEntryHref, [])

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform } = useDraggable({ id: 'GateFloatEntry' })

  useMount($windowSize.updateThrottled)
  const { height: windowHeight } = $windowSize.use()
  const usingTop = useMemo(() => minmax(top, 0, windowHeight - 150), [top, windowHeight])

  useDndMonitor({
    onDragEnd(e) {
      if (e.active.id === 'GateFloatEntry') {
        $windowSize.update()
        const rect = wrapperRef.current?.children[0].getBoundingClientRect()
        if (!rect) return

        const top = minmax(Math.round(rect.top), 0, window.innerHeight - rect.height)
        let align = floatEntryStore.align
        const shouldChangeAlign =
          (floatEntryStore.align === 'right' && rect.left < window.innerWidth / 4) ||
          (floatEntryStore.align === 'left' && rect.right > (window.innerWidth / 4) * 3)
        if (shouldChangeAlign) align = floatEntryStore.align === 'right' ? 'left' : 'right'

        appLog('new pos', { align, top })
        floatEntryStore.align = align
        floatEntryStore.top = top
      }
    },
  })

  const wrapperRef = useMixedRef<HTMLDivElement>(setNodeRef)

  const wrapperClassName = useUnoMerge(
    'fixed transition-200 transition-ease-out transition-property-transform,right,left,top',
    clsZGateFloatEntry,
    align === 'left' && 'left-0 translate-x--55% pl-6px hover:(translate-x-0)',
    align === 'right' && 'right-0 translate-x-55% pr-6px hover:(translate-x-0)',
  )

  return (
    <div ref={wrapperRef} className={wrapperClassName} style={{ top: `${usingTop}px` }}>
      <div className={C.wrapperInner} style={{ transform: CSS.Transform.toString(transform) }}>
        <AntdTooltip title={<>{APP_NAME}: 在新窗口打开</>} {...tooltipConfig}>
          <Button className='icon-only-round-button' href={gateEntryHref} target='_blank'>
            <IconForOpenExternalLink className={C.buttonIcon} />
          </Button>
        </AntdTooltip>
        <AntdTooltip title={<>{APP_NAME}:「查看更多」</>} {...tooltipConfig}>
          <Button className='icon-only-round-button' onClick={toggleModalFeed}>
            <IconParkOutlineRight className={C.buttonIcon} />
          </Button>
        </AntdTooltip>
        <Button className='icon-only-round-button cursor-move' {...listeners} {...attributes} ref={setActivatorNodeRef}>
          <IconParkOutlineDrag className='size-14px' />
        </Button>
      </div>
    </div>
  )
}
