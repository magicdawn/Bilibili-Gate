import { APP_CLS_ROOT, OPERATION_FAIL_MSG } from '$common'
import { BaseModal, BaseModalStyle, ModalClose } from '$components/_base/BaseModal'
import { borderColorValue, colorPrimaryValue } from '$components/css-vars'
import type { AppRecItem, AppRecItemExtend } from '$define'
import { antMessage } from '$modules/antd'
import { IconForDislike, IconForInfo } from '$modules/icon'
import { toastRequestFail } from '$utility/toast'
import { css } from '@emotion/react'
import { useLockFn, useRequest, useUpdateLayoutEffect } from 'ahooks'
import { Spin } from 'antd'
import { clsx } from 'clsx'
import { delay } from 'es-toolkit'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { dislike } from '../VideoCard/services/'

interface IProps {
  show: boolean
  onHide: () => void
  item: AppRecItem | null
}

export type Reason = { id: number; name: string; toast: string }

const dislikedIds = proxyMap<string, Reason>()
function useDislikedIds() {
  return useSnapshot(dislikedIds)
}

export function useDislikedReason(id?: string | false) {
  const map = useDislikedIds()
  if (!id) return undefined
  return map.get(id)
}
// 不能清理, 因为有两处在同时使用, refresh 之后清理影响其他地方比较奇怪
function clearDislikedIds() {
  dislikedIds.clear()
}
export function delDislikeId(id: string) {
  dislikedIds.delete(id)
}

function ModalDislike({ show, onHide, item }: IProps) {
  const $req = useRequest(async (item: AppRecItem, reason: Reason) => dislike(item, reason.id), {
    manual: true,
  })

  const onDislike = useLockFn(async (reason: Reason) => {
    if (!item) return

    let success = false
    let message: string = ''
    let err: Error | undefined
    try {
      ;({ success, message } = await $req.runAsync(item, reason))
    } catch (e) {
      err = e as Error
    }
    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    if (success) {
      antMessage.success('已标记不想看')
      dislikedIds.set(item.param, { ...reason })
      await delay(100)
      onHide()
    } else {
      // fail
      antMessage.error(message || OPERATION_FAIL_MSG)
    }
  })

  const reasons = useMemo(() => {
    // 此类内容过多 reason_id = 12
    // 推荐过 reason_id = 13
    return item?.three_point?.dislike_reasons || []
  }, [item])

  const modalBodyRef = useRef<HTMLDivElement>(null)

  const keyPressEnabled = () => !!show && !!item

  const KEYS = ['1', '2', '3', '4', '5', '6']
  useKeyPress(KEYS, (e) => {
    if (!keyPressEnabled()) return
    if (!KEYS.includes(e.key)) return

    const index = Number(e.key) - 1
    setActiveIndex(index)

    const btn = modalBodyRef.current?.querySelectorAll<HTMLButtonElement>('.reason')[index]
    btn?.click()
  })

  const [activeIndex, setActiveIndex] = useState(reasons.length - 1)
  useUpdateLayoutEffect(() => {
    setActiveIndex(reasons.length - 1)
  }, [reasons])

  const increaseIndex = (by: number) => {
    return () => {
      if (!keyPressEnabled()) return
      const newIndex = activeIndex + by
      if (newIndex < 0 || newIndex > reasons.length - 1) return
      setActiveIndex(newIndex)
    }
  }

  useKeyPress('leftarrow', increaseIndex(-1), { exactMatch: true })
  useKeyPress('rightarrow', increaseIndex(1), { exactMatch: true })
  useKeyPress('uparrow', increaseIndex(-2), { exactMatch: true })
  useKeyPress('downarrow', increaseIndex(2), { exactMatch: true })

  useKeyPress(
    'enter',
    (e) => {
      if (!keyPressEnabled()) return
      if (activeIndex < 0 || activeIndex > reasons.length - 1) return
      e.preventDefault()
      e.stopImmediatePropagation()

      const btn = modalBodyRef.current?.querySelector<HTMLButtonElement>('.reason.active')
      btn?.click()
    },
    { exactMatch: true },
  )

  const activeReasonName = useMemo(() => {
    return reasons[activeIndex]?.name || ''
  }, [reasons, activeIndex])

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={true}
      hideWhenEsc={true}
      width={500}
    >
      <div css={BaseModalStyle.modalHeader}>
        <div css={BaseModalStyle.modalTitle}>
          <IconForDislike className='size-25' />
          <span className='m-inline-5'>我不想看</span>
          <span
            css={css`
              font-size: 60%;
              margin-top: 7px;
            `}
          >
            (选择后将减少相似内容推荐)
          </span>
        </div>
        <div className='flex-1' />
        <ModalClose onClick={onHide} />
      </div>

      <div css={BaseModalStyle.modalBody} ref={modalBodyRef}>
        <Spin
          spinning={$req.loading}
          indicator={
            <IconSvgSpinnersBarsRotateFade
              css={css`
                color: ${colorPrimaryValue};
                .ant-spin .ant-spin-dot& {
                  width: 25px;
                  height: 25px;
                }
              `}
            />
          }
        >
          <div
            className='reason-list'
            css={css`
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              justify-content: space-between;
            `}
          >
            {reasons.map((reason, index) => {
              const active = index === activeIndex

              return (
                <button
                  className={clsx('reason', { active })}
                  css={[S.reason, active && S.reasonActive]}
                  key={reason.id}
                  data-id={reason.id}
                  disabled={$req.loading}
                  onClick={() => {
                    setActiveIndex(index)
                    onDislike(reason)
                  }}
                >
                  <span
                    className='reason-no'
                    css={css`
                      position: absolute;
                      left: 6px;

                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      top: ${(32 - 20) / 2}px;

                      display: flex;
                      align-items: center;
                      justify-content: center;

                      background-color: ${colorPrimaryValue};
                      color: #fff;
                    `}
                  >
                    {index + 1}
                  </span>
                  {reason.name}
                </button>
              )
            })}
          </div>
        </Spin>

        <div
          className='tips-container'
          css={css`
            margin-top: 20px;
          `}
        >
          <div className='tips' css={S.tips}>
            <IconForInfo className='mr-5 size-15' />
            使用删除键打开弹窗, 数字键选择, Esc 关闭
          </div>
          {activeReasonName && (
            <div className='tips' css={S.tips}>
              <IconForInfo className='mr-5 size-15' />
              已选择「{activeReasonName}」, 回车键提交
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  )
}

const S = {
  reason: css`
    color: inherit;
    width: 48%;
    text-align: center;
    line-height: 20px;
    position: relative;

    border-radius: 4px;
    border: 2px solid ${borderColorValue};

    padding-top: 5px;
    padding-bottom: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
  `,

  reasonActive: css`
    /* to increase specificity */
    &.active {
      border-color: ${colorPrimaryValue};
    }
  `,

  tips: css`
    display: flex;
    align-items: center;
  `,
}

const currentProps: IProps = {
  show: false,
  onHide,
  item: null,
}

// for outside consumer
const modalDislikeVisibleState = proxy({
  value: currentProps.show,
})

export const useModalDislikeVisible = function () {
  return useSnapshot(modalDislikeVisibleState).value
}

function onHide() {
  // esc 关闭, 等一个 tick, esc 先处理完
  setTimeout(() => {
    updateProps({ show: false, item: null })
  })
}

function updateProps(newProps: Partial<IProps>) {
  Object.assign(currentProps, newProps)
  modalDislikeVisibleState.value = currentProps.show
  getRoot().render(<ModalDislike {...currentProps} onHide={onHide} />)
}

let _root: Root
function getRoot() {
  _root ||= (() => {
    const container = document.createElement('div')
    container.classList.add('show-dislike-container', APP_CLS_ROOT)
    document.body.appendChild(container)
    return createRoot(container)
  })()
  return _root
}

export function showModalDislike(item: AppRecItemExtend) {
  // 已经是 dislike 状态
  if (item?.param && dislikedIds.has(item.param)) return
  updateProps({ show: true, item })
}

// setTimeout(() => {
//   // @ts-ignore
//   showModalDislike(null)
// }, 1000)
