import { APP_CLS_ROOT } from '$common'
import { AntdApp } from '$components/AntdApp'
import { ModalSettings } from '$components/ModalSettings'
import { once } from 'es-toolkit'
import { headerState, useHeaderState } from './index.shared'

export function showModalSettings() {
  renderOnce()
  headerState.modalSettingsVisible = true
}
export function hideModalSettings() {
  headerState.modalSettingsVisible = false
}

export function registerSettingsGmCommand() {
  GM.registerMenuCommand?.('⚙️ 设置', showModalSettings)
}

const renderOnce = once(function render() {
  const container = document.createElement('div')
  container.classList.add('modals-container', APP_CLS_ROOT)
  document.body.appendChild(container)
  const r = createRoot(container)
  r.render(
    <AntdApp>
      <ModalsContainer />
    </AntdApp>,
  )
})

function ModalsContainer() {
  const { modalSettingsVisible } = useHeaderState()
  return (
    <>
      <ModalSettings show={modalSettingsVisible} onHide={hideModalSettings} />
    </>
  )
}
