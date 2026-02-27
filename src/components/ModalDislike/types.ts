import { assertNever } from '$utility/type'

export type AppDislikeReason = {
  platform: 'app'
  id: number
  name: string
  toast: string
}

export type PcDislikeReason = {
  platform: 'pc'
  text: string
  value: number
  reason: number
}

export const PcDislikeReasons: PcDislikeReason[] = [
  { platform: 'pc', text: '内容不感兴趣', value: 1, reason: 1 },
  { platform: 'pc', text: '不想看此UP主', value: 2, reason: 4 },
]

export type DislikeReason = AppDislikeReason | PcDislikeReason

export function normalizeDislikeReason(reason: DislikeReason): {
  reasonId: number
  text: string
  helpText?: string
} {
  if (reason.platform === 'app') return { reasonId: reason.id, text: reason.name, helpText: reason.toast }
  if (reason.platform === 'pc') return { reasonId: reason.reason, text: reason.text }
  assertNever(reason)
}

// Q: why callback 的形式
// A: okAction 表示 Modal Ok 后的动作
//    okAction 可能失败, 这样的情况不希望关闭 modal, 有重试的机会; 使用 promise 处理 onAction fail 的情况串起来会比较复杂
//    boolean 表示 okAction success, success 后关闭 modal
export type OkAction = (reason: DislikeReason) => boolean | undefined | void | Promise<boolean | undefined | void>
