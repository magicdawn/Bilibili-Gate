/* eslint-disable require-await */

import { css } from '@emotion/react'
import { useLockFn, useRequest, useUpdateLayoutEffect } from 'ahooks'
import { Button, Spin } from 'antd'
import { clsx } from 'clsx'
import Emittery from 'emittery'
import { useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { HelpInfo } from '$components/_base/HelpInfo'
import { IconForDislike } from '$modules/icon'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { shouldDisableShortcut } from '$utility/dom'
import { wrapComponent } from '$utility/global-component'
import type { MouseEvent } from 'react'

export type Reason = { id: number; name: string; toast: string }

export const dislikedIds = proxyMap<string, Reason>()
export function useDislikedIds() {
  return useSnapshot(dislikedIds)
}
export function useDislikedReason(id?: string | false) {
  const map = useDislikedIds()
  if (!id) return undefined
  return map.get(id)
}
export function delDislikeId(id: string) {
  dislikedIds.delete(id)
}

// Q: why callback 的形式
// A: okAction 表示 Modal Ok 后的动作
//    okAction 可能失败, 这样的情况不希望关闭 modal, 有重试的机会; 使用 promise 处理 onAction fail 的情况串起来会比较复杂
//    boolean 表示 okAction success, success 后关闭 modal
export type OkAction = (reason: Reason) => boolean | undefined | void | Promise<boolean | undefined | void>

const defaultProps = {
  show: false,
  reasons: [] as Reason[],
  onHide,
  okAction: undefined as OkAction | undefined,
}

const { proxyProps, updateProps } = wrapComponent({
  Component: ModalDislike,
  containerClassName: 'show-dislike-container',
  defaultProps,
})

const emitter = new Emittery<{ 'modal-close': undefined }>()

function onHide() {
  emitter.emit('modal-close')
  updateProps({ show: false, reasons: [], okAction: undefined })
}

export async function chooseDislikeReason(reasons: Reason[], okAction: OkAction) {
  updateProps({ show: true, reasons, okAction })
  await emitter.once('modal-close')
}

export const useModalDislikeVisible = function () {
  return useSnapshot(proxyProps).show
}

export function ModalDislike({ show, reasons, onHide, okAction }: typeof defaultProps) {
  const modalBodyRef = useRef<HTMLDivElement>(null)
  const keyPressEnabled = () => !!show && !!reasons?.length

  const $req = useRequest(async (reason: Reason) => okAction?.(reason), { manual: true })
  const okActionLoading = $req.loading

  const [activeIndex, setActiveIndex] = useState(reasons.length - 1)
  useUpdateLayoutEffect(() => {
    setActiveIndex(reasons.length - 1)
  }, [reasons])

  const KEYS = ['1', '2', '3', '4', '5', '6']
  useKeyPress(KEYS, (e) => {
    if (!keyPressEnabled()) return
    if (!KEYS.includes(e.key)) return
    if (!reasons?.length) return

    const index = Number(e.key) - 1
    if (!(index >= 0 && index < reasons.length)) return

    setActiveIndex(index)
  })

  const increaseIndex = useMemoizedFn((by: number) => {
    if (!keyPressEnabled()) return
    if (shouldDisableShortcut()) return
    const len = reasons.length
    let newIndex = activeIndex + by
    if (newIndex < 0) newIndex = (newIndex % len) + len
    if (newIndex > len - 1) newIndex = newIndex % len
    setActiveIndex(newIndex)
  })
  useKeyPress('uparrow', () => increaseIndex(-1), { exactMatch: true })
  useKeyPress('downarrow', () => increaseIndex(1), { exactMatch: true })

  const onOk = useLockFn(async (e: KeyboardEvent | MouseEvent) => {
    if (!keyPressEnabled()) return
    if (activeIndex < 0 || activeIndex > reasons.length - 1) return
    const reason = reasons[activeIndex]
    if (!reason) return

    e.preventDefault()
    e.stopPropagation()
    const result = await $req.runAsync(reason)
    if (result) onHide()
  })
  useKeyPress('enter', onOk, { exactMatch: true })

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={true}
      hideWhenEsc={true}
      width={350}
      clsModal='rounded-15px'
    >
      <div className={BaseModalClassNames.modalHeader}>
        <div className={BaseModalClassNames.modalTitle}>
          <IconForDislike className='size-25px' />
          <span className='ml-5px'>我不想看</span>
          <HelpInfo>
            选择后将减少相似内容推荐 <br />
            操作说明: <br />
            <div className='ml-10px'>
              1. 使用删除键打开弹窗, Esc 关闭 <br />
              2. 数字键 或 方向键选择 <br />
              3. 回车键 或 确定按钮提交 <br />
            </div>
          </HelpInfo>
        </div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={BaseModalClassNames.modalBody} ref={modalBodyRef}>
        <Spin
          spinning={okActionLoading}
          indicator={
            <IconSvgSpinnersBarsRotateFade
              className='text-gate-primary'
              css={css`
                .ant-spin .ant-spin-dot& {
                  width: 25px;
                  height: 25px;
                }
              `}
            />
          }
        >
          <div className='reason-list mb-20px mt-20px flex flex-col gap-y-10px'>
            {reasons.map((reason, index) => {
              const active = index === activeIndex
              return (
                <button
                  key={reason.id}
                  data-id={reason.id}
                  className={clsx(
                    'reason',
                    { active },
                    'relative flex items-center py-12px rounded-6px b-2px b-solid',
                    active ? 'b-gate-primary' : 'b-gate-border',
                  )}
                  disabled={okActionLoading}
                  onClick={() => {
                    setActiveIndex(index)
                  }}
                >
                  <span
                    data-cls='reason-no'
                    className='ml-6px size-20px flex flex-none items-center justify-center rounded-full bg-gate-primary color-white'
                  >
                    {index + 1}
                  </span>
                  <span className='flex-1 px-4px'>{reason.name}</span>
                  <span className='mr-6px size-20px flex-none'>
                    {active && <IconAnimatedChecked className='h-100% w-100% color-gate-primary' useAnimation />}
                  </span>
                </button>
              )
            })}
          </div>
        </Spin>
      </div>

      <div className='mt-2 flex items-center justify-between'>
        <div className='flex-v-center gap-x-10px'></div>
        <div className='flex-v-center gap-x-10px'>
          <Button onClick={onHide}>取消</Button>
          <Button type='primary' onClick={onOk} loading={okActionLoading}>
            确定
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}
