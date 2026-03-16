/* eslint-disable require-await */

import { useHotkey, type NumberKey } from '@tanstack/react-hotkeys'
import { useCreation, useLockFn, useMemoizedFn, useRequest } from 'ahooks'
import { Button, Spin } from 'antd'
import { clsx } from 'clsx'
import Emittery from 'emittery'
import { assert } from 'es-toolkit'
import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useSnapshot } from 'valtio'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { HelpInfo } from '$components/_base/HelpInfo'
import { antSpinIndicator } from '$components/fragments'
import { IconAnimatedChecked, IconForDislike } from '$modules/icon'
import { wrapComponent } from '$utility/global-component'
import { assertNever } from '$utility/type'
import { normalizeDislikeReason, type DislikeReason, type OkAction } from './types'

const defaultProps = {
  show: false,
  reasons: [] as DislikeReason[],
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

export async function pickDislikeReason(reasons: DislikeReason[], okAction: OkAction) {
  updateProps({ show: true, reasons, okAction })
  await emitter.once('modal-close')
}

export const useModalDislikeVisible = function () {
  return useSnapshot(proxyProps).show
}

export function ModalDislike({ show, reasons, onHide, okAction }: typeof defaultProps) {
  const modalBodyRef = useRef<HTMLDivElement>(null)
  const hotkeyEnabled = !!(show && reasons?.length)

  const $req = useRequest(async (reason: DislikeReason) => okAction?.(reason), { manual: true })
  const okActionLoading = $req.loading

  const [activeIndex, setActiveIndex] = useState(() => (reasons.length ? reasons.length - 1 : 0))
  useLayoutEffect(() => {
    if (!reasons.length) return
    const platform = reasons[0].platform
    if (platform === 'app') {
      setActiveIndex(reasons.length - 1) // 最后一项, 通常是不感兴趣
    } else if (platform === 'pc') {
      setActiveIndex(0)
    } else {
      assertNever(platform)
    }
  }, [reasons])

  const numberKeyEmitter = useCreation(() => new Emittery<{ click: number }>(), [])
  useEmitterOn(numberKeyEmitter, 'click', ({ data: num }) => {
    //
  })

  const increaseIndex = useMemoizedFn((by: number) => {
    const len = reasons.length
    let newIndex = activeIndex + by
    if (newIndex < 0) newIndex = (newIndex % len) + len
    if (newIndex > len - 1) newIndex = newIndex % len
    setActiveIndex(newIndex)
  })
  useHotkey('ArrowUp', () => increaseIndex(-1), { enabled: hotkeyEnabled })
  useHotkey('ArrowDown', () => increaseIndex(1), { enabled: hotkeyEnabled })

  const onOk = useLockFn(async (e: KeyboardEvent | MouseEvent) => {
    if (activeIndex < 0 || activeIndex > reasons.length - 1) return
    const reason = reasons[activeIndex]
    if (!reason) return

    e.preventDefault()
    e.stopPropagation()
    const result = await $req.runAsync(reason)
    if (result) onHide()
  })
  useHotkey('Enter', onOk, { enabled: hotkeyEnabled })

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
        <Spin spinning={okActionLoading} indicator={antSpinIndicator}>
          <div className='reason-list mb-20px mt-20px flex flex-col gap-y-10px'>
            {reasons.map((reason, index) => {
              const active = index === activeIndex
              const { reasonId, text } = normalizeDislikeReason(reason)
              const num = index + 1
              return (
                <button
                  key={reasonId}
                  className={clsx(
                    'reason',
                    { active },
                    'relative flex cursor-pointer items-center b-2px rounded-6px b-solid bg-transparent px-6px py-12px',
                    active ? 'b-gate-primary' : 'b-gate-border',
                  )}
                  disabled={okActionLoading}
                  onClick={() => {
                    setActiveIndex(index)
                  }}
                >
                  <span
                    data-cls='reason-no'
                    className='size-20px flex flex-none items-center justify-center rounded-full bg-gate-primary text-13px color-white'
                  >
                    <DislikeReasonHotkeySetup num={num} enabled={hotkeyEnabled} onPress={() => setActiveIndex(index)} />
                    {num}
                  </span>
                  <span className='flex-1 px-4px text-14px'>{text}</span>
                  <span className='size-20px flex-none'>
                    {active && <IconAnimatedChecked className='h-100% w-100% color-gate-primary' useAnimation />}
                  </span>
                </button>
              )
            })}
          </div>
        </Spin>
      </div>

      <div className='mt-2 flex items-center justify-end gap-x-10px'>
        <Button onClick={onHide}>取消</Button>
        <Button type='primary' onClick={onOk} loading={okActionLoading}>
          确定
        </Button>
      </div>
    </BaseModal>
  )
}

/**
 * use useHotkey hook in a loop
 */
function DislikeReasonHotkeySetup({
  num,
  onPress,
  enabled,
}: {
  num: number
  onPress: (e: KeyboardEvent) => void
  enabled?: boolean
}) {
  assert(num >= 1 && num <= 9, 'num must be between 1 and 9')
  useHotkey(`${num}` as NumberKey, onPress, { enabled })
  return null
}
