/* eslint-disable require-await */
import { useKeyPress, useMemoizedFn, useRequest } from 'ahooks'
import { Button, Empty, Input, Popover, Radio, Slider, Spin } from 'antd'
import clsx from 'clsx'
import Emittery from 'emittery'
import { uniqBy } from 'es-toolkit'
import { fastOrderBy } from 'fast-sort-lens'
import PinyinMatch from 'pinyin-match'
import { useEffect, useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { HelpInfo } from '$components/_base/HelpInfo'
import { antSpinIndicator, kbdClassName } from '$components/fragments'
import { antMessage } from '$modules/antd'
import { IconAnimatedChecked, IconForConfig, IconForOpenExternalLink, IconForReset } from '$modules/icon'
import { isFavFolderDefault } from '$modules/rec-services/fav/fav-util'
import { favStore, updateFavFolderList } from '$modules/rec-services/fav/store'
import { getUid } from '$utility/cookie'
import { shouldDisableShortcut } from '$utility/dom'
import { wrapComponent } from '$utility/global-component'
import { mapNameForSort, zhLocaleComparer } from '$utility/sort'
import { proxyWithLocalStorage } from '$utility/valtio'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

type FavFolderOrder = 'default' | 'name'

const localStoreInitial = {
  modalWidth: 60, // percent
  favFolderOrder: 'default' as FavFolderOrder,
}

const localStore = proxyWithLocalStorage({ ...localStoreInitial }, 'modal-fav-manager')

type Result = Pick<FavFolder, 'id' | 'title'>
type OkActionReturn = boolean | undefined | void
type OkAction = (result: Result) => OkActionReturn | Promise<OkActionReturn>
type IProps = typeof defaultProps

const defaultProps = {
  show: false,
  srcFavFolderId: undefined as number | undefined,
  onHide,
  okAction: undefined as OkAction | undefined,
}

const { proxyProps, updateProps } = wrapComponent<IProps>({
  Component: ModalFavManager,
  containerClassName: 'ModalFavManager',
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

export async function moveFavItemToFolder(srcFavFolderId: number | undefined, okAction: OkAction) {
  updateProps({ show: true, srcFavFolderId, okAction })
  await emitter.once('modal-close')
}

function mapFavFolderTitleForSort(title: string) {
  title = title.replace(/^[\s\p{RGI_Emoji}]+/v, '') // rm leading space & emoji
  title = mapNameForSort(title)
  return title
}

function ConfigPopoverContent() {
  const { modalWidth, favFolderOrder } = useSnapshot(localStore)

  const clsTitle = 'text-1.5em'
  const clsSubTitle = 'text-1.2em'

  return (
    <div className='flex flex-col gap-y-10px'>
      <div className='flex items-center justify-between'>
        <div className={clsTitle}>窗口设置</div>
        <Button
          className='icon-only-round-button size-24px'
          onClick={() => Object.assign(localStore, localStoreInitial)}
        >
          <IconForReset />
        </Button>
      </div>

      <div>
        <div className={clsSubTitle}>窗口宽度 {modalWidth}%</div>
        <Slider
          className='mt-0'
          value={modalWidth}
          min={30}
          max={90}
          onChange={(v) => {
            localStore.modalWidth = v
          }}
        />
      </div>

      <div>
        <div className={clsSubTitle}>收藏夹排序</div>
        <Radio.Group
          value={favFolderOrder}
          onChange={(e) => {
            localStore.favFolderOrder = e.target.value
          }}
        >
          <Radio value='default'>默认顺序</Radio>
          <Radio value='name'>按名称</Radio>
        </Radio.Group>
      </div>
    </div>
  )
}

export function ModalFavManager({ show, onHide, srcFavFolderId, okAction }: IProps) {
  const { modalWidth, favFolderOrder } = useSnapshot(localStore)
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
  // filter
  const foldersAfterFilter = useMemo(() => {
    const mapped = folders.map((folder, index) => ({ ...folder, vol: index + 1 }))
    if (!filterText) return mapped

    const included = mapped.filter((folder) => folder.title.includes(filterText))
    const includedIgnoreCase = mapped.filter((folder) => folder.title.toLowerCase().includes(filterText.toLowerCase()))
    const pinyinMatched = mapped.filter((folder) => PinyinMatch.match(folder.title, filterText))

    return uniqBy([...included, ...includedIgnoreCase, ...pinyinMatched], (x) => x.id)
  }, [folders, filterText])
  // order
  const foldersAfterSort = useMemo(() => {
    if (favFolderOrder === 'name') {
      return fastOrderBy(
        foldersAfterFilter,
        [(f) => (isFavFolderDefault(f.attr) ? 1 : 0), (f) => mapFavFolderTitleForSort(f.title)],
        ['desc', zhLocaleComparer],
      )
    }
    return foldersAfterFilter
  }, [foldersAfterFilter, favFolderOrder])

  const foldersForRender = foldersAfterSort

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
      width={`${modalWidth}vw`}
      clsModal='rounded-15px'
    >
      <div className={BaseModalClassNames.modalHeader}>
        <div className='flex flex-wrap items-center gap-x-10px gap-y-1'>
          <div className={BaseModalClassNames.modalTitle}>
            <IconParkOutlineTransferData className='size-25px' />
            <span className='ml-5px'>选择目标收藏夹</span>
          </div>

          <Input
            className='w-200px'
            allowClear
            placeholder='过滤: 支持拼音 / 拼音首字母'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            spellCheck={false}
          />
          {!!filterText && (
            <span className='ml-5px'>
              <span className={clsx({ 'text-red': folders.length && !foldersForRender.length })}>
                {foldersForRender.length}
              </span>{' '}
              / <span>{folders.length}</span>
            </span>
          )}

          <HelpInfo className='ml-5px size-1.3em'>
            1. 使用 <kbd className={clsx(kbdClassName, 'mx-2px')}>r</kbd> 刷新收藏夹 <br />
            2. 使用 <kbd className={clsx(kbdClassName, 'mx-2px')}>esc</kbd> 取消操作, 关闭窗口 <br />
            3. 使用 拼音 / 拼音首字母 过滤收藏夹标题 <br />
          </HelpInfo>

          <Popover trigger={'click'} title={<ConfigPopoverContent />}>
            <IconForConfig className='size-1.3em cursor-pointer' />
          </Popover>
        </div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={clsx(BaseModalClassNames.modalBody)}>
        <Spin spinning={$updateFoldersReq.loading || $okActionReq.loading} indicator={antSpinIndicator}>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] mb-10px min-h-100px content-start items-center gap-10px pr-15px'>
            {foldersForRender.length ? (
              foldersForRender.map((f) => {
                const disabled = f.id === srcFavFolderId
                const active = !disabled && f.id === selectedFolder?.id
                return (
                  <button
                    key={f.id}
                    data-id={f.id}
                    className={clsx(
                      { active },
                      'relative min-h-40px flex items-center b-2px b-gate-border rounded-20px b-solid bg-transparent px-4px line-height-[1.2]',
                      !disabled && 'hover:bg-gate-bg-lv1',
                      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                      active && 'b-gate-primary color-white bg-gate-primary!',
                    )}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedFolder({ id: f.id, title: f.title })
                    }}
                  >
                    {/* small font-size for limited space */}
                    <span className='flex-1 px-4px text-14px'>
                      {f.title} ({f.media_count})
                    </span>
                    <span className='mr-2px size-20px flex-none'>
                      {active && <IconAnimatedChecked className='h-100% w-100% color-white' useAnimation />}
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
