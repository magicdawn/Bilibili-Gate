import { setupForNoneHomepage } from '../shared'
import { addActionButtons } from './add-action-buttons'
import { fixCollectionUrl } from './fix-collection-url'
import { initSpaceFollingPage } from './following'

export function initSpacePage() {
  setupForNoneHomepage()
  fixCollectionUrl()
  addActionButtons()
  initSpaceFollingPage()
}
