/* eslint-disable require-await */
import { css } from '@emotion/react'
import { useRequest } from 'ahooks'
import { Button, Empty, Input, Spin } from 'antd'
import Emittery from 'emittery'
import { uniqBy } from 'es-toolkit'
import PinyinMatch from 'pinyin-match'
import { useSnapshot } from 'valtio'
import { kbdClassName } from '$common/shared-classnames'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { HelpInfo } from '$components/_base/HelpInfo'
import { colorPrimaryValue } from '$components/css-vars'
import { antMessage } from '$modules/antd'
import { IconForOpenExternalLink } from '$modules/icon'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { favStore, updateFavFolderList } from '$modules/rec-services/fav/store'
import { getUid } from '$utility/cookie'
import { shouldDisableShortcut } from '$utility/dom'
import { wrapComponent } from '$utility/global-component'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

type Result = Pick<FavFolder, 'id' | 'title'>
type OkAction = (result: Result) => boolean | undefined | void | Promise<boolean | undefined | void>
type IProps = typeof defaultProps

const defaultProps = {
  show: false,
  srcFavFolderId: undefined as number | undefined,
  onHide,
  okAction: undefined as OkAction | undefined,
}

const { proxyProps, updateProps } = wrapComponent<IProps>({
  Component: ModalMoveFav,
  containerClassName: 'ModalMoveFav',
  defaultProps,
})

export function useModalMoveFavVisible() {
  return useSnapshot(proxyProps).show
}

const emitter = new Emittery<{ 'modal-close': undefined }>()
function onHide() {
  updateProps({ show: false })
  emitter.emit('modal-close')
}

export async function chooseTragetFavFolder(srcFavFolderId: number | undefined, okAction: OkAction) {
  updateProps({ show: true, srcFavFolderId, okAction })
  await emitter.once('modal-close')
}

export function ModalMoveFav({ show, onHide, srcFavFolderId, okAction }: IProps) {
  const $updateFoldersReq = useRequest(updateFavFolderList, { manual: true })
  const $okActionReq = useRequest(async (result: Result) => okAction?.(result), { manual: true })
  const [selectedFolder, setSelectedFolder] = useState<Result | undefined>(undefined)
  const [filterText, setFilterText] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (show) {
      $updateFoldersReq.run()
    } else {
      // 🤔 is this really necessary ?
      // setFilterText(undefined)
    }
  }, [show])

  useKeyPress(
    'r',
    () => {
      if (!show) return
      if (shouldDisableShortcut()) return
      $updateFoldersReq.run(true)
    },
    { exactMatch: true },
  )

  const { folders } = useSnapshot(favStore)
  const filteredFolders = useMemo(() => {
    const mapped = folders.map((folder, index) => ({ ...folder, vol: index + 1 }))
    if (!filterText) return mapped

    const included = mapped.filter((folder) => folder.title.includes(filterText))
    const includedIgnoreCase = mapped.filter((folder) => folder.title.toLowerCase().includes(filterText.toLowerCase()))
    const pinyinMatched = mapped.filter((folder) => PinyinMatch.match(folder.title, filterText))

    return uniqBy([...included, ...includedIgnoreCase, ...pinyinMatched], (x) => x.id)
  }, [folders, filterText])

  const onOk = useMemoizedFn(async () => {
    if (!selectedFolder) return antMessage.error('请选择一个收藏夹')
    const success = await $okActionReq.runAsync(selectedFolder)
    if (success) onHide()
  })

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
        <div className='flex shrink-0 items-center'>
          <div className={BaseModalClassNames.modalTitle}>
            <IconParkOutlineTransferData className='size-25px' />
            <span className='ml-5px'>选择目标收藏夹</span>
          </div>

          <Input
            className='ml-15px'
            style={{ width: 200 }}
            allowClear
            placeholder='过滤: 支持拼音 / 首字母'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          {!!filterText && (
            <span className='ml-5px'>
              <span className={clsx({ 'text-red': folders.length && !filteredFolders.length })}>
                {filteredFolders.length}
              </span>{' '}
              / <span>{folders.length}</span>
            </span>
          )}

          <HelpInfo className='ml-5px'>
            1. 使用 <kbd className={kbdClassName}>r</kbd> 刷新收藏夹 <br />
            2. 使用 <kbd className={kbdClassName}>esc</kbd> 取消操作, 关闭窗口 <br />
            3. 使用 拼音 / 首字母 过滤收藏夹标题 <br />
          </HelpInfo>
        </div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={clsx(BaseModalClassNames.modalBody)}>
        <Spin
          spinning={$updateFoldersReq.loading || $okActionReq.loading}
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
                      'relative flex items-center py-12px rounded-6px bg-transparent cursor-pointer b-2px b-solid',
                      active ? 'b-gate-primary' : 'b-gate-border',
                    )}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedFolder({ id: f.id, title: f.title })
                    }}
                  >
                    <span className='ml-6px size-24px flex-center flex-none rounded-full bg-gate-primary text-center color-white'>
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
                无过滤结果, 请清除过滤词!
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
          <Button type='primary' onClick={onOk} loading={$okActionReq.loading}>
            确定
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}
