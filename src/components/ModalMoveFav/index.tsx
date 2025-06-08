import { css } from '@emotion/react'
import { useRequest } from 'ahooks'
import { Button, Spin } from 'antd'
import mitt from 'mitt'
import { pEvent } from 'p-event'
import { proxy, useSnapshot } from 'valtio'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { colorPrimaryValue } from '$components/css-vars'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { fetchFavFolders } from '$modules/rec-services/fav/user-fav-service'
import { wrapComponent } from '$utility/global-component'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

const store = proxy({
  folders: [] as FavFolder[],
})

async function updateFavFolders() {
  const folders = await fetchFavFolders()
  store.folders = folders
}

export function ModalMoveFav({
  show,
  onHide,
  onChoose,
  srcFavFolderId,
}: {
  show: boolean
  onHide: () => void
  onChoose: (result: Result) => void
  srcFavFolderId: number | undefined
}) {
  const $req = useRequest(updateFavFolders, { manual: true })
  const { folders } = useSnapshot(store)
  const [selectedFolder, setSelectedFolder] = useState<Result | undefined>(undefined)

  useEffect(() => {
    if (show) $req.run()
  }, [show])

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={true}
      hideWhenEsc={true}
      width={900}
      clsModal='rounded-15px'
    >
      <div className={BaseModalClassNames.modalHeader}>
        <div className={BaseModalClassNames.modalTitle}>
          <IconParkOutlineTransferData className='size-25px' />
          <span className='ml-5px'>选择目标收藏夹</span>
        </div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={clsx(BaseModalClassNames.modalBody, 'my-10px')}>
        <Spin
          spinning={$req.loading}
          indicator={
            <IconSvgSpinnersBarsRotateFade
              className='text-gate-primary'
              css={css`
                .ant-spin .ant-spin-dot& {
                  width: 25px;
                  height: 25px;
                }
              `}
            />
          }
        >
          <div className='grid grid-cols-4 mb-10px min-h-100px gap-10px pr-15px'>
            {folders.map((f, index) => {
              const disabled = f.id === srcFavFolderId
              const active = !disabled && f.id === selectedFolder?.id
              return (
                <button
                  key={f.id}
                  data-id={f.id}
                  className={clsx(
                    { active },
                    'relative flex items-center py-12px rounded-6px b-2px b-solid',
                    active ? 'b-gate-primary' : 'b-gate-border',
                  )}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedFolder({ id: f.id, title: f.title })
                  }}
                >
                  <span className='ml-6px size-20px flex flex-none items-center justify-center rounded-full bg-gate-primary color-white'>
                    {index + 1}
                  </span>
                  <span className='flex-1 px-4px'>
                    {f.title} ({f.media_count})
                  </span>
                  <span className='mr-6px size-20px flex-none'>
                    {active && <IconAnimatedChecked className='h-100% w-100%' color={colorPrimaryValue} useAnimation />}
                  </span>
                </button>
              )
            })}
          </div>
        </Spin>
      </div>

      <div className='flex items-center justify-end gap-x-10px'>
        <Button onClick={onHide}>取消</Button>
        <Button
          type='primary'
          onClick={() => {
            if (!selectedFolder) return
            onChoose(selectedFolder)
          }}
        >
          确定
        </Button>
      </div>
    </BaseModal>
  )
}

type Result = Pick<FavFolder, 'id' | 'title'>

const { proxyProps, updateProps } = wrapComponent({
  Component: ModalMoveFav,
  containerClassName: 'ModalMoveFav',
  defaultProps: {
    onHide,
    onChoose,
    show: false,
    result: undefined as Result | undefined,
    srcFavFolderId: undefined as number | undefined,
  },
})

const emitter = mitt<{ 'modal-close': void }>()

function onHide() {
  updateProps({ show: false })
  emitter.emit('modal-close')
}
function onChoose(result: Result) {
  proxyProps.result = { ...result }
  onHide()
}

export async function chooseTragetFavFolder(srcFavFolderId: number | undefined) {
  updateProps({ show: true, srcFavFolderId, result: undefined })
  await pEvent(emitter, 'modal-close')
  return proxyProps.result
}
