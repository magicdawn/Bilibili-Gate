import { setupLargePreview } from '$components/LargePreview/large-preview-setup'
import { settings } from '$modules/settings'
import { isInIframe, setupForNoneHomepage } from './shared'

export function initSearchPage() {
  if (isInIframe()) return // pagetual use iframe to load more
  setupForNoneHomepage()
  if (settings.videoCard.videoPreview.addTo.searchPage) {
    addLargePreviewForSearchResults()
  }
}

function addLargePreviewForSearchResults() {
  const itemsSelector = '.video-list-item:has(> .bili-video-card),div:has(> .bili-video-card)'
  setupLargePreview({ itemsSelector })
}
