import { tryToRemove } from '$utility/dom'
import { setupForNoneHomepage } from '../shared'
import { setupCustomFavPicker } from './custom-fav-picker'
import { setupQuickLinks } from './quick-links'
import { setupVideoPlayerState } from './video-player-state'

export function initVideoPlayPage() {
  tryToRemove('#slide_ad')
  setupForNoneHomepage()
  return Promise.all([setupCustomFavPicker(), setupVideoPlayerState(), setupQuickLinks()])
}
