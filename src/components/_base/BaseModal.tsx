import { css } from '@emotion/react'
import { createPortal } from 'react-dom'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_CLS_ROOT, APP_NAMESPACE } from '$common'
import type { ComponentProps, MouseEvent } from 'react'

export const BaseModalClassNames = {
  modalMask: 'fixed inset-0 bg-black/50 z-gate-base-modal flex items-center justify-center',
  modal: [
    'w-500px max-h-[calc(90vh-50px)]',
    'rounded-10px b-1px b-transparent b-solid dark:b-gate-border',
    'bg-gate-bg text-gate-text',
    'px-15px pb-15px  flex flex-col overflow-hidden',
  ].join(' '),
  modalHeader: 'py-10px border-b-0 flex items-center justify-between',
  modalTitle: 'text-[1.5rem] mb-0 line-height-1.5 flex items-center',
  modalBody: 'pt-0 flex-grow-1 overflow-y-auto',
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
