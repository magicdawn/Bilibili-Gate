import { useModalDislikeVisible } from '$components/ModalDislike'
import { useModalMoveFavVisible } from '$components/ModalFavManager'
import { useModalsState } from './modals'

/**
 * plain | ModalFeed
 * plain = PureRecommend | SectionRecommend 即:非模态框渲染
 */
export function usePlainShortcutEnabled() {
  const { modalFeedVisible, modalSettingsVisible } = useModalsState()
  const arr = [modalFeedVisible, modalSettingsVisible, useModalDislikeVisible(), useModalMoveFavVisible()]
  return arr.every((x) => x === false)
}
