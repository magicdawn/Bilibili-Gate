/* eslint-disable require-await */
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMemoizedFn, useRequest, useUpdateEffect } from 'ahooks'
import { Button, Checkbox, Empty, Input, Popover, Slider, Spin } from 'antd'
import clsx from 'clsx'
import { assert, isEqual, uniqBy } from 'es-toolkit'
import PinyinMatch from 'pinyin-match'
import { useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { useSnapshot } from 'valtio'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { HelpInfo } from '$components/_base/HelpInfo'
import { antSpinIndicator } from '$components/fragments'
import { explainForFlag } from '$components/ModalSettings/index.shared'
import { BILI_BRAND_PINK_THEME } from '$components/ModalSettings/theme.shared'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { HotkeyDisplay } from '$modules/hotkey'
import {
  IconAnimatedChecked,
  IconForConfig,
  IconForFav,
  IconForFaved,
  IconForOpenExternalLink,
  IconForReset,
} from '$modules/icon'
import { favStore, updateFavFolderList } from '$modules/rec-services/fav/store'
import { useSettingsSnapshot } from '$modules/settings'
import { getUid } from '$utility/cookie'
import { proxyWithLocalStorage } from '$utility/valtio'
import { FavFolderOrderSwitcher, isValidFavFolderOrder, sortFavFolders, type FavFolderOrder } from './fav-folder-order'
import type { Promisable } from 'type-fest'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

type LocalStore = {
  modalWidth: number
  favFolderOrder: FavFolderOrder
  singleSelect: boolean
}
const localStoreInitial: LocalStore = {
  modalWidth: 60, // percent
  favFolderOrder: 'default',
  singleSelect: false,
}
const localStore = proxyWithLocalStorage({ ...localStoreInitial }, 'modal-fav-manager')
// reset invalid stored data to `default`
if (!isValidFavFolderOrder(localStore.favFolderOrder)) localStore.favFolderOrder = localStoreInitial.favFolderOrder
if (typeof localStore.singleSelect !== 'boolean') localStore.singleSelect = localStoreInitial.singleSelect

function ConfigPopoverContent() {
  const { modalWidth } = useSnapshot(localStore)

  const clsTitle = 'text-1.5em'
  const clsSubtitle = 'text-1.2em'

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
        <div className={clsSubtitle}>窗口宽度 {modalWidth}%</div>
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
    </div>
  )
}

export namespace ModalFavTypes {
  export type Result = Pick<FavFolder, 'id' | 'title'>[] // 把 fav-folder 想做 tag, 一个视频包含在多个收藏夹其实是合理的
  export type PickOkAction = (result: Result) => Promisable<boolean | undefined | void>
  export type ModifyOkAction = (result: Result) => Promisable<boolean | undefined | void>
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

    // result control
    singleSelect?: boolean // explicit singleSelect 例如: 批量移动时, 只能移动到一个目标
  }
}

export function mapFavFolderIds(targetFolders: ModalFavTypes.Result) {
  return targetFolders.map((x) => x.id)
}
export function joinFavFolderTitles(targetFolders: ModalFavTypes.Result) {
  return `${targetFolders.map((x) => `「${x.title}」`).join('')}` // 「 本身提供 space
}
export function mapModalFavManagerResult(result: ModalFavTypes.Result) {
  return {
    targetFolderIds: mapFavFolderIds(result),
    targetFolderTitles: joinFavFolderTitles(result),
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
  modifyAllowEmpty = false,
  modifyOkAction,
  // result control
  singleSelect,
}: ModalFavTypes.Props) {
  const { modalWidth, favFolderOrder, singleSelect: singleSelectFromStore } = useSnapshot(localStore)
  const { folders } = useSnapshot(favStore)
  const $updateFoldersReq = useRequest(updateFavFolderList, { manual: true })
  const $pickOkActionReq = useRequest(async (result: ModalFavTypes.Result) => pickOkAction?.(result), { manual: true })
  const $modifyOkActionReq = useRequest(async (result: ModalFavTypes.Result) => modifyOkAction?.(result), {
    manual: true,
  })

  /* #region select state */
  const [selectedFolderIdsSet, setSelectedFolderIdsSet] = useState(() => new Set<number>())
  const usingSingleSelect = singleSelect ?? singleSelectFromStore
  const handleSingleSelectChange = useMemoizedFn((val: boolean) => {
    localStore.singleSelect = val
    if (val && selectedFolderIdsSet.size > 1) {
      setSelectedFolderIdsSet(new Set([Array.from(selectedFolderIdsSet)[0]]))
    }
  })
  const modifyInitialSelectedIdsSet = useMemo(
    () => new Set([modifyInitialSelectedIds].flat().filter((num) => num !== undefined)),
    [modifyInitialSelectedIds],
  )
  const allowEmptyResult = mode === 'modify' && modifyAllowEmpty
  /* #endregion */

  /* #region render folders */
  // filter
  const [filterText, setFilterText] = useState<string | undefined>(undefined)
  const foldersAfterFilter = useMemo(() => {
    const mapped = folders.map((folder, index) => ({ ...folder, vol: index + 1 }))
    if (!filterText) return mapped

    const included = mapped.filter((folder) => folder.title.includes(filterText))
    const includedIgnoreCase = mapped.filter((folder) => folder.title.toLowerCase().includes(filterText.toLowerCase()))
    const pinyinMatched = mapped.filter((folder) => PinyinMatch.match(folder.title, filterText))

    return uniqBy([...included, ...includedIgnoreCase, ...pinyinMatched], (x) => x.id)
  }, [folders, filterText])
  // order
  const foldersAfterSort = useMemo(
    () => sortFavFolders(foldersAfterFilter, favFolderOrder),
    [foldersAfterFilter, favFolderOrder],
  )
  const foldersForRender = foldersAfterSort
  const needFavFolderOrderSwitcher = foldersForRender.length > 1
  /* #endregion */

  /* #region callbacks & shortcuts */
  useHotkey('R', () => $updateFoldersReq.run(true), { enabled: show })

  const onOk = useMemoizedFn(async () => {
    const selectedFolders: FavFolder[] = Array.from(selectedFolderIdsSet)
      .map((id) => folders.find((f) => f.id === id))
      .filter(Boolean)
    if (!allowEmptyResult && !selectedFolders.length) return antMessage.error('请选择一个收藏夹')

    if (mode === 'pick') {
      assert(selectedFolders.length, 'selectedFolder should not be empty when mode=pick')
      const success = await $pickOkActionReq.runAsync(selectedFolders)
      if (success) onHide()
    }

    if (mode === 'modify') {
      const success = await $modifyOkActionReq.runAsync(selectedFolders)
      if (success) onHide()
    }
  })
  /* #endregion */

  /* #region side effects */
  const sync_modifyMode_initialSelectedIdSet_to_componentState = useMemoizedFn(() => {
    if (show && mode === 'modify' && modifyInitialSelectedIdsSet.size) {
      setSelectedFolderIdsSet(new Set(modifyInitialSelectedIdsSet))
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
    if (show && !selectedFolderIdsSet.size) {
      setSelectedFolderIdsSet(new Set(modifyInitialSelectedIdsSet))
    }
  }, [modifyInitialSelectedIdsSet])
  /* #endregion */

  const srcFavFolderBgClassName = useSrcFavFolderBgClassName()

  const okButtonDisabled = useMemo(() => {
    // do not allow empty, but empty
    if (!allowEmptyResult && !selectedFolderIdsSet.size) return true
    // same as input
    if (mode === 'modify' && isEqual(selectedFolderIdsSet, modifyInitialSelectedIdsSet)) return true
    return false
  }, [allowEmptyResult, selectedFolderIdsSet, mode, modifyInitialSelectedIdsSet])

  const modalTitle = useMemo(() => {
    return match(mode)
      .returnType<string>()
      .with('pick', () => '选择目标收藏夹')
      .with('modify', () => (allowEmptyResult ? '移动或取消收藏' : '移动到其他收藏夹'))
      .exhaustive()
  }, [mode, allowEmptyResult])

  const faved = useMemo(() => {
    return match(mode)
      .returnType<boolean>()
      .with('pick', () => false)
      .with('modify', () => !!modifyInitialSelectedIdsSet.size)
      .exhaustive()
  }, [mode, modifyInitialSelectedIdsSet])

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
            {faved ? <IconForFaved className='size-25px' /> : <IconForFav className='size-25px' />}
            <span className='ml-5px'>{modalTitle}</span>
          </div>

          <HelpInfo className='mx-0 size-1.3em'>
            1. 使用 <HotkeyDisplay k='R' className='mx-2px' /> 刷新收藏夹 <br />
            2. 使用 <HotkeyDisplay k='Escape' className='mx-2px' /> 取消操作, 关闭窗口 <br />
            3. 使用 拼音 / 拼音首字母 过滤收藏夹标题 <br />
          </HelpInfo>

          <Popover trigger={'click'} title={<ConfigPopoverContent />}>
            <IconForConfig className='size-1.3em cursor-pointer' />
          </Popover>

          <Input
            className='ml-2 w-215px'
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

          {needFavFolderOrderSwitcher && (
            <FavFolderOrderSwitcher
              // size='middle'
              value={favFolderOrder}
              onChange={(v) => (localStore.favFolderOrder = v)}
            />
          )}

          <Checkbox
            checked={usingSingleSelect}
            onChange={(e) => handleSingleSelectChange(e.target.checked)}
            disabled={singleSelect !== undefined} // disabled when explicit specified
            styles={{ label: { paddingInline: '6px 0' } }}
          >
            <AntdTooltip title={explainForFlag('单选: 只允许选择一个目标收藏夹', '多选: 可多选目标收藏夹')}>
              单选
            </AntdTooltip>
          </Checkbox>

          {/* 多选时: 提供清除按钮 */}
          {!usingSingleSelect && (
            <AntdTooltip title='清除已选'>
              <IconParkOutlineClear
                className={clsx('size-1.3em cursor-pointer', !selectedFolderIdsSet.size && 'opacity-50')}
                onClick={() => {
                  if (!selectedFolderIdsSet.size) return
                  setSelectedFolderIdsSet(new Set())
                }}
              />
            </AntdTooltip>
          )}
        </div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={clsx(BaseModalClassNames.modalBody)}>
        <Spin
          spinning={$updateFoldersReq.loading || $pickOkActionReq.loading || $modifyOkActionReq.loading}
          indicator={antSpinIndicator}
        >
          <div className='grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] mb-10px min-h-100px content-start items-center gap-10px pr-18px'>
            {foldersForRender.length ? (
              foldersForRender.map((f) => {
                const isSourceFolder = mode === 'modify' && modifyInitialSelectedIdsSet.has(f.id)
                const active = selectedFolderIdsSet.has(f.id)
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
                      if (usingSingleSelect) {
                        if (allowEmptyResult && active) {
                          // toggle
                          setSelectedFolderIdsSet(new Set())
                        } else {
                          setSelectedFolderIdsSet(new Set([f.id]))
                        }
                      } else {
                        // toggle value inside `selectedFolderIdsSet`
                        setSelectedFolderIdsSet((set) => {
                          set.has(f.id) ? set.delete(f.id) : set.add(f.id)
                          return new Set(set)
                        })
                      }
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
            <IconForOpenExternalLink className='size-1.1em' />
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
  return theme === BILI_BRAND_PINK_THEME.id ? 'bg-$brand_blue' : 'bg-$brand_pink'
}
