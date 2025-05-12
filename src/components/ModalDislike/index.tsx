import { css } from '@emotion/react'
import { APP_CLS_ROOT, OPERATION_FAIL_MSG } from '$common'
import { BaseModal, BaseModalStyle, ModalClose } from '$components/_base/BaseModal'
import { HelpInfo } from '$components/_base/HelpInfo'
import { AppRoot } from '$components/AppRoot'
import { colorPrimaryValue } from '$components/css-vars'
import { antMessage } from '$modules/antd'
import { IconForDislike } from '$modules/icon'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { shouldDisableShortcut } from '$utility/dom'
import { toastRequestFail } from '$utility/toast'
import { useLockFn, useRequest, useUpdateLayoutEffect } from 'ahooks'
import { Spin } from 'antd'
import { clsx } from 'clsx'
import { delay } from 'es-toolkit'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { dislike } from '../VideoCard/services/'
import type { AppRecItem, AppRecItemExtend } from '$define'
import type { Root } from 'react-dom/client'

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
export function delDislikeId(id: string) {
  dislikedIds.delete(id)
}

export function ModalDislike({ show, onHide, item }: IProps) {
  const $req = useRequest((item: AppRecItem, reason: Reason) => dislike(item, reason.id), {
    manual: true,
  })

  const onDislike = useLockFn(async (reason: Reason) => {
    if (!item) return

    let success = false
    let message: string = ''
    let err: Error | undefined
    try {
      ;({ success, message } = await $req.runAsync(item, reason))
    } catch (error) {
      err = error as Error
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

  const reasons = useMemo(() => item?.three_point?.dislike_reasons || [], [item])

  const modalBodyRef = useRef<HTMLDivElement>(null)

  const keyPressEnabled = () => !!show && !!item

  const KEYS = ['1', '2', '3', '4', '5', '6']
  useKeyPress(KEYS, (e) => {
    if (!keyPressEnabled()) return
    if (!KEYS.includes(e.key)) return

    const index = Number(e.key) - 1
    if (index < 0 || index >= reasons.length) return
    setActiveIndex(index)

    const btn = modalBodyRef.current?.querySelectorAll<HTMLButtonElement>('.reason')[index]
    btn?.click()
  })

  const [activeIndex, setActiveIndex] = useState(reasons.length - 1)
  useUpdateLayoutEffect(() => {
    setActiveIndex(reasons.length - 1)
  }, [reasons])

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

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={true}
      hideWhenEsc={true}
      width={350}
      clsModal='rounded-15px'
    >
      <div css={BaseModalStyle.modalHeader} className='justify-between'>
        <div css={BaseModalStyle.modalTitle}>
          <IconForDislike className='size-25px' />
          <span className='ml-5px'>我不想看</span>
          <HelpInfo>
            选择后将减少相似内容推荐 <br />
            操作说明: <br />
            <div className='ml-10px'>
              1. 使用删除键打开弹窗, Esc 关闭 <br />
              2. 数字键直接选择并提交 <br />
              3. 也可以使用方向键选择, 回车键提交 <br />
            </div>
          </HelpInfo>
        </div>
        <ModalClose onClick={onHide} />
      </div>

      <div css={BaseModalStyle.modalBody} ref={modalBodyRef}>
        <Spin
          spinning={$req.loading}
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
                  disabled={$req.loading}
                  onClick={() => {
                    setActiveIndex(index)
                    onDislike(reason)
                  }}
                >
                  <span
                    data-cls='reason-no'
                    className='ml-6px size-20px flex flex-none items-center justify-center rounded-full color-white'
                    style={{ backgroundColor: colorPrimaryValue }}
                  >
                    {index + 1}
                  </span>
                  <span className='flex-1 px-4px'>{reason.name}</span>
                  <span className='mr-6px size-20px flex-none'>
                    {active && <IconAnimatedChecked className='h-100% w-100%' color={colorPrimaryValue} useAnimation />}
                  </span>
                </button>
              )
            })}
          </div>
        </Spin>
      </div>
    </BaseModal>
  )
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
  getRoot().render(
    <AppRoot>
      <ModalDislike {...currentProps} onHide={onHide} />
    </AppRoot>,
  )
}

let root: Root | undefined
function getRoot() {
  if (!root) {
    const container = document.createElement('div')
    container.classList.add('show-dislike-container', APP_CLS_ROOT)
    document.body.append(container)
    root = createRoot(container)
  }
  return root
}

export function showModalDislike(item: AppRecItemExtend) {
  // 已经是 dislike 状态
  if (item?.param && dislikedIds.has(item.param)) return
  updateProps({ show: true, item })
}
