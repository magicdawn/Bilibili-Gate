import { proxy, useSnapshot } from 'valtio'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { useModalMoveFavVisible } from '$components/ModalMoveFav'

export const headerState = proxy({
  modalFeedVisible: false,
  modalSettingsVisible: false,
})

export function useHeaderState() {
  return useSnapshot(headerState)
}

/**
 * plain | ModalFeed
 * plain = PureRecommend | SectionRecommend 即:非模态框渲染
 */
export function usePlainShortcutEnabled() {
  const { modalFeedVisible, modalSettingsVisible } = useHeaderState()
  return [modalFeedVisible, modalSettingsVisible, useModalDislikeVisible(), useModalMoveFavVisible()].every(
    (x) => x === false,
  )
}
