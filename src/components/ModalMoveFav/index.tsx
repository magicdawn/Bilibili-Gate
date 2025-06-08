import { css } from '@emotion/react'
import { useRequest } from 'ahooks'
import { Button, Empty, Input, Spin } from 'antd'
import { uniqBy } from 'es-toolkit'
import mitt from 'mitt'
import { pEvent } from 'p-event'
import PinyinMatch from 'pinyin-match'
import { proxy, useSnapshot } from 'valtio'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { colorPrimaryValue } from '$components/css-vars'
import { IconForOpenExternalLink } from '$modules/icon'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { fetchFavFolders } from '$modules/rec-services/fav/user-fav-service'
import { getUid } from '$utility/cookie'
import { shouldDisableShortcut } from '$utility/dom'
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
  const [selectedFolder, setSelectedFolder] = useState<Result | undefined>(undefined)
  const [filterText, setFilterText] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (show) {
      $req.run()
    } else {
      // 🤔 is this really necessary
      // setFilterText(undefined)
    }
  }, [show])

  useKeyPress(
    'r',
    () => {
      if (!show) return
      if (shouldDisableShortcut()) return
      $req.run()
    },
    { exactMatch: true },
  )

  const { folders } = useSnapshot(store)
  const filteredFolders = useMemo(() => {
    const mapped = folders.map((folder, index) => ({ ...folder, vol: index + 1 }))
    if (!filterText) return mapped

    const included = mapped.filter((folder) => folder.title.includes(filterText))
    const includedIgnoreCase = mapped.filter((folder) => folder.title.toLowerCase().includes(filterText.toLowerCase()))
    const pinyinMatched = mapped.filter((folder) => PinyinMatch.match(folder.title, filterText))

    return uniqBy([...included, ...includedIgnoreCase, ...pinyinMatched], (x) => x.id)
  }, [folders, filterText])

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
        <div className='flex shrink-0 items-center gap-x-15px'>
          <div className={BaseModalClassNames.modalTitle}>
            <IconParkOutlineTransferData className='size-25px' />
            <span className='ml-5px'>选择目标收藏夹</span>
          </div>

          <Input
            style={{ width: 200 }}
            allowClear
            placeholder='过滤: 支持拼音 / 首字母'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          {!!filterText && (
            <span>
              <span className={clsx({ 'text-red': folders.length && !filteredFolders.length })}>
                {filteredFolders.length}
              </span>{' '}
              / <span>{folders.length}</span>
            </span>
          )}
        </div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={clsx(BaseModalClassNames.modalBody)}>
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
          <div className='grid grid-cols-4 mb-10px min-h-100px items-start gap-10px pr-15px'>
            {filteredFolders.length ? (
              filteredFolders.map((f) => {
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
                      {f.vol}
                    </span>
                    <span className='flex-1 px-4px'>
                      {f.title} ({f.media_count})
                    </span>
                    <span className='mr-6px size-20px flex-none'>
                      {active && (
                        <IconAnimatedChecked className='h-100% w-100%' color={colorPrimaryValue} useAnimation />
                      )}
                    </span>
                  </button>
                )
              })
            ) : (
              <Empty className='grid-col-span-full' image={Empty.PRESENTED_IMAGE_SIMPLE} description='未找到收藏夹'>
                无过滤结果, 请清楚过滤词!
              </Empty>
            )}
          </div>
        </Spin>
      </div>

      <div className='mt-2 flex items-center justify-between'>
        <div className='flex-v-center gap-x-10px'>
          <a href={`https://space.bilibili.com/${getUid()}/favlist`} target='_blank' className='flex-v-center gap-x-1'>
            <IconForOpenExternalLink className='relative top--1px size-13px' />
            去个人空间新建收藏夹
          </a>
        </div>

        <div className='flex-v-center gap-x-10px'>
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

export function useModalMoveFavVisible() {
  return useSnapshot(proxyProps).show
}

export async function chooseTragetFavFolder(srcFavFolderId: number | undefined) {
  updateProps({ show: true, srcFavFolderId, result: undefined })
  await pEvent(emitter, 'modal-close')
  return proxyProps.result
}
