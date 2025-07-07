import { css } from '@emotion/react'
import { createPortal } from 'react-dom'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_CLS_ROOT, APP_NAMESPACE } from '$common'
import type { ComponentProps, MouseEvent } from 'react'

export const BaseModalClassNames = {
  modalMask: 'fixed inset-0 z-gate-base-modal flex items-center justify-center bg-black/50',
  modal:
    'max-h-[calc(90vh-50px)] w-500px flex flex-col overflow-hidden b-1px b-transparent rounded-10px b-solid bg-gate-bg px-15px pb-15px text-gate-text dark:b-gate-border',
  modalHeader: 'flex items-center justify-between border-b-0 py-10px',
  modalTitle: 'mb-0 flex items-center text-[1.5rem] line-height-1.5',
  modalBody: 'flex-grow-1 overflow-y-auto pt-0',
} as const

type BaseModalProps = {
  show: boolean
  onHide: () => void
  children: ReactNode

  // classNames
  clsModalMask?: string
  clsModal?: string
  width?: CSSProperties['width']

  // behaviors
  hideWhenMaskOnClick?: boolean
  hideWhenEsc?: boolean
}

export const APP_CLS_MODAL_VISIBLE = `${APP_NAMESPACE}-modal-visible`
// lock body scroll
export const modalGlobalStyle = css`
  body:has(.${APP_CLS_MODAL_VISIBLE}) {
    overflow-y: hidden;
  }
`

export function BaseModal({
  show,
  onHide,
  children,

  clsModalMask,
  clsModal,
  width,

  hideWhenMaskOnClick = false,
  hideWhenEsc = false,
}: BaseModalProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const onMaskClick = useMemoizedFn((e: MouseEvent) => {
    const target = e.target as HTMLElement

    // click from .modal
    if (wrapperRef.current?.contains(target)) return

    // click from antd components
    const selectors = [
      '.ant-tooltip-inner[role="tooltip"]', // tooltip
      '.ant-popover-inner[role="tooltip"]', // popover
      '.ant-select-dropdown', // select-dropdown
    ]
    if (target.closest(selectors.join(','))) return

    if (hideWhenMaskOnClick) {
      onHide()
    }
  })

  useKeyPress(
    'esc',
    (e) => {
      if (!show) return
      if (hideWhenEsc) {
        // prevent other esc handler run
        e.preventDefault()
        e.stopImmediatePropagation()

        // wait the unpreventable esc handlers run, close in next tick
        setTimeout(onHide)
      }
    },
    { exactMatch: true },
  )

  const _clsModalMask = useUnoMerge(BaseModalClassNames.modalMask, clsModalMask)
  const _clsModal = useUnoMerge(BaseModalClassNames.modal, clsModal)

  if (!show) {
    return null
  }

  return createPortal(
    <div className={clsx(APP_CLS_ROOT, { [APP_CLS_MODAL_VISIBLE]: show })} data-role='base-modal'>
      <div className={_clsModalMask} onClick={onMaskClick}>
        <div className={_clsModal} style={{ width }} ref={wrapperRef}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export const ModalClose = ({ className, ...props }: ComponentProps<'svg'>) => {
  const _className = useUnoMerge('cursor-pointer size-18px ml-10px', className)
  return <IconParkOutlineClose {...props} className={_className} />
}
