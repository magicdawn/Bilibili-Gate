import type { BiliPlayer } from './player-types'

export function getBiliPlayer(): BiliPlayer | undefined {
  if (typeof unsafeWindow === 'undefined') return
  return (unsafeWindow as any).player
}
