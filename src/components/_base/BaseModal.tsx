import { css } from '@emotion/react'
import { createPortal } from 'react-dom'
import { APP_CLS_ROOT, APP_NAMESPACE } from '$common'
import { zIndexBaseModal } from '$common/css-vars-export.module.scss'
import { useIsDarkMode } from '$modules/dark-mode'
import { hasMarginLeft, hasSize } from '$utility/css'
import type { CssProp } from '$utility/type'
import type { ComponentProps, MouseEvent } from 'react'

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

    background-color: #fff;
    border-radius: 10px;
    padding: 0 15px 15px 15px;

    display: flex;
    flex-direction: column;
    overflow: hidden;
  `,

  modalHeader: css`
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: none;
    display: flex;
    align-items: center;
  `,

  modalBody: css`
    padding-top: 0;
    flex-grow: 1;
    overflow-y: auto;
  `,

  modalTitle: css`
    font-size: 1.5rem;
    margin-bottom: 0;
    line-height: 1.5;
    display: flex;
    align-items: center;
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
  const isDarkMode = useIsDarkMode()

  const { bg, c } = useMemo(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor
    const c = window.getComputedStyle(document.body).color
    return { bg, c }
  }, [isDarkMode])

  const wrapperStyle: CSSProperties = useMemo(() => {
    return isDarkMode
      ? {
          '--bg': bg,
          '--c': c,
          'backgroundColor': bg,
          'color': c,
        }
      : // 白色不用特殊处理
        {}
  }, [bg, c, isDarkMode])

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

  if (!show) {
    return null
  }

  return createPortal(
    <div className={clsx(APP_CLS_ROOT, { [APP_CLS_MODAL_VISIBLE]: show })} data-id={`base-modal-${containerId}`}>
      <div className={clsModalMask} css={[BaseModalStyle.modalMask, cssModalMask]} onClick={onMaskClick}>
        <div
          style={{ ...wrapperStyle, width }}
          className={clsModal}
          css={[BaseModalStyle.modal, cssModal]}
          ref={wrapperRef}
        >
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
