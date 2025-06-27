import { css } from '@emotion/react'
import { createPortal } from 'react-dom'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_CLS_ROOT, APP_NAMESPACE } from '$common'
import { appClsDarkSelector, zIndexBaseModal } from '$common/css-vars-export.module.scss'
import { borderColorValue } from '$components/css-vars'
import { hasMarginLeft, hasSize } from '$utility/css'
import type { CssProp } from '$utility/type'
import type { ComponentProps, MouseEvent } from 'react'

export const BaseModalClassNames = {
  modalHeader: 'py-10px border-b-0 flex items-center justify-between',
  modalTitle: 'text-[1.5rem] mb-0 line-height-1.5 flex items-center',
  modalBody: 'pt-0 flex-grow-1 overflow-y-auto',
} as const

export const BaseModalStyle = {
  modalMask: css`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: ${zIndexBaseModal};
    // make .model center
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  modal: css`
    width: 500px;
    max-height: calc(90vh - 50px);
    border-radius: 10px;
    padding: 0 15px 15px 15px;

    border: 1px solid transparent;
    ${appClsDarkSelector} & {
      border-color: ${borderColorValue};
    }

    display: flex;
    flex-direction: column;
    overflow: hidden;
  `,
}

type BaseModalProps = {
  show: boolean
  onHide: () => void
  children: ReactNode

  // classNames
  clsModalMask?: string
  cssModalMask?: CssProp

  clsModal?: string
  cssModal?: CssProp

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
  cssModalMask,

  clsModal,
  cssModal,

  width,
  hideWhenMaskOnClick = false,
  hideWhenEsc = false,
}: BaseModalProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerId = useId()

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

  const modalClassName = useUnoMerge('bg-gate-bg', 'text-gate-text', clsModal)

  if (!show) {
    return null
  }

  return createPortal(
    <div className={clsx(APP_CLS_ROOT, { [APP_CLS_MODAL_VISIBLE]: show })} data-id={`base-modal-${containerId}`}>
      <div className={clsModalMask} css={[BaseModalStyle.modalMask, cssModalMask]} onClick={onMaskClick}>
        <div style={{ width }} className={modalClassName} css={[BaseModalStyle.modal, cssModal]} ref={wrapperRef}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export const ModalClose = ({ className, ...props }: ComponentProps<'svg'>) => {
  return (
    <IconParkOutlineClose
      {...props}
      className={clsx(
        'cursor-pointer',
        { 'size-18px': !hasSize(className), 'ml-10px': !hasMarginLeft(className) },
        className,
      )}
    />
  )
}
