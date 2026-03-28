import { setupForNoneHomepage } from '../shared'
import { setupCustomFavPicker } from './custom-fav-picker'
import { setupQuickLinks } from './quick-links'
import { setupVideoPlayerState } from './video-player-state'

export function initVideoPlayPage() {
  setupForNoneHomepage()
  return Promise.all([setupCustomFavPicker(), setupVideoPlayerState(), setupQuickLinks()])
}
