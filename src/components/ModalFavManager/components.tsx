/* eslint-disable require-await */
import { useKeyPress, useMemoizedFn, useRequest, useUpdateEffect } from 'ahooks'
import { Button, Empty, Input, Popover, Radio, Slider, Spin } from 'antd'
import clsx from 'clsx'
import { assert, isEqual, uniqBy } from 'es-toolkit'
import { fastOrderBy } from 'fast-sort-lens'
import PinyinMatch from 'pinyin-match'
import { useEffect, useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { HelpInfo } from '$components/_base/HelpInfo'
import { antSpinIndicator, kbdClassName } from '$components/fragments'
import { DEFAULT_BILI_PINK_THEME } from '$components/ModalSettings/theme.shared'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import {
  IconAnimatedChecked,
  IconForConfig,
  IconForEdit,
  IconForMove,
  IconForOpenExternalLink,
  IconForReset,
} from '$modules/icon'
import { isFavFolderDefault } from '$modules/rec-services/fav/fav-util'
import { favStore, updateFavFolderList } from '$modules/rec-services/fav/store'
import { useSettingsSnapshot } from '$modules/settings'
import { getUid } from '$utility/cookie'
import { shouldDisableShortcut } from '$utility/dom'
import { mapNameForSort, zhLocaleComparer } from '$utility/sort'
import { proxyWithLocalStorage } from '$utility/valtio'
import type { Promisable } from 'type-fest'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

type FavFolderOrder = 'default' | 'name'

const localStoreInitial = {
  modalWidth: 60, // percent
  favFolderOrder: 'default' as FavFolderOrder,
}

const localStore = proxyWithLocalStorage({ ...localStoreInitial }, 'modal-fav-manager')

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

export namespace ModalFavTypes {
  export type Result = Pick<FavFolder, 'id' | 'title'>
  export type PickOkAction = (result: Result) => Promisable<boolean | undefined | void>
  export type ModifyOkAction = (result: Result | undefined) => Promisable<boolean | undefined | void>
  export type Props = {
    show: boolean
    onHide: () => void
    mode: 'pick' | 'modify'

    // pick mode
    pickOkAction?: PickOkAction

    // modify mode
    modifyInitialSelectedIds?: number[] | number
    modifyAllowEmpty?: boolean
    modifyOkAction?: ModifyOkAction
  }
}

export function ModalFavManager({
  show,
  onHide,
  mode,
  // pick
  pickOkAction,
  // modify
  modifyInitialSelectedIds,
  modifyAllowEmpty,
  modifyOkAction,
}: ModalFavTypes.Props) {
  const { modalWidth, favFolderOrder } = useSnapshot(localStore)
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined)
  const [filterText, setFilterText] = useState<string | undefined>(undefined)
  const $updateFoldersReq = useRequest(updateFavFolderList, { manual: true })
  const $pickOkActionReq = useRequest(async (result: ModalFavTypes.Result) => pickOkAction?.(result), { manual: true })
  const $modifyOkActionReq = useRequest(async (result: ModalFavTypes.Result | undefined) => modifyOkAction?.(result), {
    manual: true,
  })

  /* #region render state */
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

  const modifyInitialSelectedIdsSet = useMemo(
    () => new Set([modifyInitialSelectedIds].flat().filter((num) => typeof num === 'number')),
    [modifyInitialSelectedIds],
  )

  const srcFavFolderBgClassName = useSrcFavFolderBgClassName()

  const allowEmptyResult = mode === 'modify' && modifyAllowEmpty

  const okButtonDisabled = useMemo(() => {
    return (
      (!allowEmptyResult && !selectedFolderId) || // do not allow empty, but empty
      (mode === 'modify' && isEqual(Array.from(modifyInitialSelectedIdsSet), [selectedFolderId])) // same as input
    )
  }, [allowEmptyResult, selectedFolderId, mode, modifyInitialSelectedIdsSet])
  /* #endregion */

  /* #region callbacks & shortcuts */
  useKeyPress(
    'r',
    () => {
      if (!show) return
      if (shouldDisableShortcut()) return
      $updateFoldersReq.run(true)
    },
    { exactMatch: true },
  )

  const onOk = useMemoizedFn(async () => {
    let selectedFolder: FavFolder | undefined
    if (selectedFolderId) selectedFolder = folders.find((folder) => folder.id === selectedFolderId)
    if (!allowEmptyResult && !selectedFolder) return antMessage.error('请选择一个收藏夹')

    if (mode === 'pick') {
      assert(selectedFolder, 'selectedFolder should not be empty when mode=pick')
      const success = await $pickOkActionReq.runAsync(selectedFolder)
      if (success) onHide()
    }

    if (mode === 'modify') {
      const success = await $modifyOkActionReq.runAsync(selectedFolder)
      if (success) onHide()
    }
  })
  /* #endregion */

  /* #region side effects */
  const sync_modifyMode_initialSelectedIdSet_to_componentState = useMemoizedFn(() => {
    if (!show || mode !== 'modify' || !modifyInitialSelectedIdsSet.size) return
    if (!selectedFolderId || !modifyInitialSelectedIdsSet.has(selectedFolderId)) {
      const first = Array.from(modifyInitialSelectedIdsSet)[0]
      setSelectedFolderId(first)
    }
  })

  useEffect(() => {
    if (show) {
      $updateFoldersReq.run()
      sync_modifyMode_initialSelectedIdSet_to_componentState()
    } else {
      // 🤔 is this really necessary ?
      // setFilterText(undefined)
    }
  }, [show])

  useUpdateEffect(() => {
    if (show && (!selectedFolderId || !modifyInitialSelectedIdsSet.has(selectedFolderId))) {
      const first = Array.from(modifyInitialSelectedIdsSet)[0]
      setSelectedFolderId(first)
    }
  }, [modifyInitialSelectedIdsSet])
  /* #endregion */

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
            {mode === 'pick' ? <IconForMove className='size-25px' /> : <IconForEdit className='size-25px' />}
            <span className='ml-5px'>{mode === 'pick' ? '选择目标收藏夹' : '修改收藏'}</span>
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
        <Spin
          spinning={$updateFoldersReq.loading || $pickOkActionReq.loading || $modifyOkActionReq.loading}
          indicator={antSpinIndicator}
        >
          <div className='grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] mb-10px min-h-100px content-start items-center gap-10px pr-15px'>
            {foldersForRender.length ? (
              foldersForRender.map((f) => {
                const isSourceFolder = mode === 'modify' && modifyInitialSelectedIdsSet.has(f.id)
                const active = f.id === selectedFolderId
                return (
                  <button
                    key={f.id}
                    data-id={f.id}
                    className={clsx(
                      { active },
                      'relative min-h-40px flex cursor-pointer items-center b-2px b-gate-border rounded-20px b-solid bg-transparent px-4px line-height-[1.2] hover:bg-gate-bg-lv1',
                      active && 'b-gate-primary color-white bg-gate-primary! hover:bg-gate-primary-lv1!',
                    )}
                    onClick={() => {
                      if (active && allowEmptyResult) {
                        return setSelectedFolderId(undefined)
                      }
                      setSelectedFolderId(f.id)
                    }}
                  >
                    {/* source folder marker */}
                    {isSourceFolder && (
                      <AntdTooltip title='源收藏夹' placement='left'>
                        <span
                          className={clsx(
                            'absolute left-2 top-50% size-2.5 flex-center translate-y--50% rounded-full',
                            srcFavFolderBgClassName,
                          )}
                        />
                      </AntdTooltip>
                    )}
                    {/* note: small font-size for limited space */}
                    <span className='flex-1 px-4px text-14px'>
                      {f.title} ({f.media_count})
                    </span>
                    <span className='mr-2px size-20px flex-none'>
                      {active && <IconAnimatedChecked className='size-full color-white' useAnimation />}
                    </span>
                  </button>
                )
              })
            ) : (
              <Empty className='grid-col-span-full' image={Empty.PRESENTED_IMAGE_SIMPLE} description='未找到收藏夹'>
                无过滤结果, 请检查过滤词 !
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
            onClick={onOk}
            loading={$pickOkActionReq.loading || $modifyOkActionReq.loading}
            disabled={okButtonDisabled}
          >
            确定
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}

function useSrcFavFolderBgClassName() {
  const { theme } = useSettingsSnapshot()
  return theme === DEFAULT_BILI_PINK_THEME.id ? 'bg-$brand_blue' : 'bg-$brand_pink'
}
