import { setupForNoneHomepage } from '../shared'
import { setupCustomFavPicker } from './custom-fav-picker'
import { setupVideoPlayerState } from './video-player-state'

export function initVideoPlayPage() {
  setupForNoneHomepage()
  setupCustomFavPicker()
  setupVideoPlayerState()
}
