import { QRCode } from 'antd'
import Emittery from 'emittery'
import { once } from 'es-toolkit'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { APP_CLS_ROOT } from '$common'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { AppRoot } from '$components/AppRoot'
import { qrcodeConfirm } from './api'

const initialValue = {
  show: false,
  qrcodeUrl: '',
  auth_code: '',
  message: '',
}
const store = proxy({ ...initialValue })
export { store as qrcodeStore }

export function updateStore(data: Partial<typeof initialValue>) {
  renderOnce()
  Object.assign(store, data)
}

export function showQrCodeModal(data: Partial<typeof initialValue>) {
  updateStore({ ...initialValue, ...data, show: true })
}

const emitter = new Emittery<{ hide: undefined }>()

export function hideQrCodeModal() {
  updateStore({ ...initialValue })
  emitter.emit('hide')
}
export function whenQrCodeModalHide() {
  return emitter.once('hide')
}

/**
 * 掉登录, 风控, 所以不再提供
 * https://github.com/lzghzr/TampermonkeyJS/blob/master/libBilibiliToken/libBilibiliToken.js#L99-L106
 */
async function confirmQrCodeLoginWithCookie() {
  if (!store.auth_code) return
  await qrcodeConfirm(store.auth_code)
}

export function TvQrCodeAuth() {
  const { qrcodeUrl, show, message } = useSnapshot(store)
  const onHide = hideQrCodeModal

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={false}
      hideWhenEsc={false}
      clsModalMask='backdrop-blur-10px'
      clsModal='aspect-ratio-10/16'
      width={260}
    >
      <div className={BaseModalClassNames.modalHeader}>
        <div className={BaseModalClassNames.modalTitle}></div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={clsx(BaseModalClassNames.modalBody, 'flex flex-col items-center justify-center text-center')}>
        <div className='mb-2px min-h-25px flex-center text-size-14px'>{message || ''}</div>

        {qrcodeUrl && (
          <QRCode
            className='mx-auto mb-40px flex-shrink-0 p-8px'
            value={qrcodeUrl}
            size={200}
            icon='https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/72/9c/b6/729cb6d8-75f5-0a56-0508-3a26cbba69ae/AppIcon-1x_U007emarketing-0-6-0-0-85-220-0.png/230x0w.webp'
          />
        )}

        <div className='footnote text-size-13px'>
          打开「哔哩哔哩」或「bilibili」App <br />
          扫码获取 access_key
        </div>
      </div>
    </BaseModal>
  )
}

const renderOnce = once(function render() {
  const container = document.createElement('div')
  container.classList.add('modal-tv-qrcode-auth', APP_CLS_ROOT)
  document.body.appendChild(container)
  const r = createRoot(container)
  r.render(
    <AppRoot>
      <TvQrCodeAuth />
    </AppRoot>,
  )
})
