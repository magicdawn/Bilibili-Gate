import { __PROD__ } from '$common'
import {
  APP_CLS_USE_ANT_LINK_COLOR,
  buttonOpenCss,
  flexVerticalCenterStyle,
  iconOnlyRoundButtonCss,
  usePopoverBorderColor,
} from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { copyBvidInfos, copyBvidsSingleLine } from '$components/RecGrid/unsafe-window-export'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { CHARGE_ONLY_TEXT } from '$components/VideoCard/top-marks'
import { HelpInfo } from '$components/_base/HelpInfo'
import { AntdTooltip } from '$components/_base/antd-custom'
import { colorPrimaryValue } from '$components/css-vars'
import { IconForOpenExternalLink, IconForReset } from '$modules/icon'
import {
  settings,
  updateSettingsInnerArray,
  useSettingsInnerArray,
  useSettingsSnapshot,
  type ListSettingsPath,
  type Settings,
} from '$modules/settings'
import type { AntMenuItem } from '$utility/antd'
import { antMessage } from '$utility/antd'
import { getAvatarSrc } from '$utility/image'
import { css } from '@emotion/react'
import { useRequest } from 'ahooks'
import { Avatar, Badge, Button, Checkbox, Dropdown, Input, Popover, Radio, Space } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { delay, throttle } from 'es-toolkit'
import { fastSortWithOrders } from 'fast-sort-lens'
import type { ReactNode } from 'react'
import type { Get } from 'type-fest'
import { useSnapshot } from 'valtio'
import { usePopupContainer } from '../_base'
import { dropdownMenuStyle } from '../_shared'
import {
  createUpdateSearchCacheNotifyFns,
  hasLocalDynamicFeedCache,
  localDynamicFeedInfoCache,
  updateLocalDynamicFeedCache,
} from './cache'
import {
  fetchVideoDynamicFeedsWithCache,
  FollowGroupMergeTimelineService,
} from './group/merge-timeline-service'
import type { FollowGroup } from './group/types/groups'
import { formatFollowGroupUrl, IconForGroup, IconForPopoverTrigger, IconForUp } from './shared'
import {
  DF_SELECTED_KEY_PREFIX_GROUP,
  DF_SELECTED_KEY_PREFIX_UP,
  dfStore,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoMinDurationConfig,
  DynamicFeedVideoType,
  DynamicFeedVideoTypeLabel,
  updateFilterData,
  type DynamicFeedStore,
  type DynamicFeedStoreSelectedKey,
  type UpMidType,
} from './store'

export function dynamicFeedFilterSelectUp(payload: Partial<typeof dfStore>) {
  Object.assign(dfStore, payload)
  // 选择了 up, 去除红点
  if (payload.upMid) {
    const item = dfStore.upList.find((x) => x.mid.toString() === payload.upMid)
    if (item) item.has_update = false
  }
}

const clearPayload: Partial<DynamicFeedStore> = {
  upMid: undefined,
  upName: undefined,
  upFace: undefined,
  searchText: undefined,
  selectedFollowGroupTagId: undefined,
  dynamicFeedVideoType: DynamicFeedVideoType.All,
  filterMinDuration: DynamicFeedVideoMinDuration.All,
}

const classes = {
  popover: {
    wrapper: 'max-w-350px',
    section: 'mt-10 first:mt-0 min-w-300px',
    sectionTilte: 'flex items-center text-20px pl-2px pb-2px',
  },
} as const

const flexBreak = (
  <div
    css={css`
      flex-basis: 100%;
      height: 0;
    `}
  />
)

export function DynamicFeedUsageInfo() {
  const { ref, getPopupContainer } = usePopupContainer()
  const onRefresh = useOnRefreshContext()

  const dfSettings = useSettingsSnapshot().dynamicFeed
  const { addCopyBvidButton, externalSearchInput } = dfSettings.__internal

  const {
    viewingSomeUp,
    upName,
    upMid,
    upFace,
    upList,

    followGroups,
    selectedFollowGroup,
    viewingSomeGroup,

    selectedKey,

    dynamicFeedVideoType,
    filterMinDuration,
    searchText,
    hideChargeOnlyVideos,

    addSeparators,
  } = useSnapshot(dfStore)

  const showPopoverBadge = useMemo(() => {
    return !!(
      dynamicFeedVideoType !== DynamicFeedVideoType.All ||
      hideChargeOnlyVideos ||
      searchText ||
      filterMinDuration !== DynamicFeedVideoMinDuration.All
    )
  }, [dynamicFeedVideoType, hideChargeOnlyVideos, searchText, filterMinDuration])

  // try update on mount
  useMount(() => {
    updateFilterData()
  })

  const onSelect = useMemoizedFn(async (payload: Partial<typeof dfStore>) => {
    dynamicFeedFilterSelectUp(payload)
    await delay(100)
    onRefresh?.()
  })

  const onClear = useMemoizedFn(() => {
    onSelect({ ...clearPayload })
  })

  const menuItems = useMemo((): AntMenuItem[] => {
    const itemAll: AntMenuItem = {
      key: 'all' satisfies DynamicFeedStoreSelectedKey,
      icon: <Avatar size={'small'}>全</Avatar>,
      label: '全部',
      onClick: onClear,
    }

    let groupItems: AntMenuItem[] = []
    if (dfSettings.followGroup.enabled) {
      groupItems = followGroups.map((group) => {
        return {
          key: `group:${group.tagid}` satisfies DynamicFeedStoreSelectedKey,
          label: group.name + ` (${group.count})`,
          icon: <Avatar size={'small'}>组</Avatar>,
          onClick() {
            onSelect({ ...clearPayload, selectedFollowGroupTagId: group.tagid })
          },
        }
      })
    }

    function mapName(name: string) {
      return (
        name
          .toLowerCase()
          // 让字母在前面
          .replace(/^([a-z])/, '999999$1')
      )
    }

    const upListSorted = fastSortWithOrders(upList, [
      { prop: (it) => (it.has_update ? 1 : 0), order: 'desc' },
      {
        prop: 'uname',
        order: (a: string, b: string) => {
          ;[a, b] = [a, b].map(mapName)
          return a.localeCompare(b, 'zh-CN')
        },
      },
    ])

    const items: AntMenuItem[] = upListSorted.map((up) => {
      let avatar: ReactNode = <Avatar size={'small'} src={getAvatarSrc(up.face)} />
      if (up.has_update) {
        avatar = <Badge dot>{avatar}</Badge>
      }

      return {
        key: `up:${up.mid}` satisfies DynamicFeedStoreSelectedKey,
        icon: avatar,
        // label: up.uname,
        label: (
          <span
            title={up.uname}
            css={css`
              display: block;
              max-width: 130px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            `}
          >
            {up.uname}
          </span>
        ),
        onClick() {
          onSelect({ ...clearPayload, upMid: up.mid.toString(), upName: up.uname, upFace: up.face })
        },
      }
    })

    return [itemAll, ...groupItems, ...items]
  }, [upList, dfSettings.followGroup.enabled, followGroups])

  // #region scope dropdown menus
  const followGroupMidsCount = selectedFollowGroup?.count
  const upIcon = <IconForUp {...size(14)} className='mt--2px' />
  const upAvtar = upFace ? <Avatar size={20} src={getAvatarSrc(upFace)} /> : undefined
  const dropdownButtonIcon = viewingSomeUp ? (
    upAvtar || upIcon
  ) : selectedFollowGroup ? (
    <IconForGroup {...size(18)} />
  ) : undefined
  const dropdownButtonLabel = viewingSomeUp
    ? upName
    : selectedFollowGroup
      ? selectedFollowGroup.name + (followGroupMidsCount ? ` (${followGroupMidsCount})` : '')
      : '全部'

  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false)
  const scopeDropdownMenu = (
    <Dropdown
      open={scopeDropdownOpen}
      onOpenChange={setScopeDropdownOpen}
      placement='bottomLeft'
      getPopupContainer={getPopupContainer}
      menu={{
        items: menuItems,
        style: { ...dropdownMenuStyle, border: `1px solid ${usePopoverBorderColor()}` },
        selectedKeys: [selectedKey],
      }}
    >
      <Button
        icon={dropdownButtonIcon}
        className='gap-4px'
        css={[scopeDropdownOpen && buttonOpenCss]}
      >
        {dropdownButtonLabel}
      </Button>
    </Dropdown>
  )
  // #endregion

  // #region popover
  const searchInput = (
    <Input.Search
      style={{ width: externalSearchInput ? '250px' : undefined }}
      placeholder='按标题关键字过滤'
      type='search'
      autoCorrect='off'
      autoCapitalize='off'
      name={`searchText_${upMid}`}
      // 有自带的历史记录, 何乐而不为
      // 悬浮 autocomplete 时 popover 关闭了
      // autoComplete='on'
      variant='outlined'
      defaultValue={dfStore.searchText}
      autoComplete='off'
      allowClear
      onChange={(e) => {
        tryInstantSearchWithCache({ searchText: e.target.value, upMid, onRefresh })
      }}
      onSearch={async (val) => {
        dfStore.searchText = val || undefined
        await delay(100)
        onRefresh?.()
      }}
    />
  )
  const popoverContent = (
    <div className={classes.popover.wrapper}>
      <div className={classes.popover.section}>
        <div className={classes.popover.sectionTilte}>
          视频类型
          <HelpInfo>
            「{CHARGE_ONLY_TEXT}」在此程序中归类为「投稿视频」
            <br />
            「动态视频」时长通常较短
          </HelpInfo>
        </div>
        <div>
          <Radio.Group
            buttonStyle='solid'
            value={dynamicFeedVideoType}
            onChange={async (v) => {
              dfStore.dynamicFeedVideoType = v.target.value
              await delay(100)
              onRefresh?.()
            }}
          >
            {Object.values(DynamicFeedVideoType).map((v) => {
              return (
                <Radio.Button key={v} value={v}>
                  {DynamicFeedVideoTypeLabel[v]}
                </Radio.Button>
              )
            })}
          </Radio.Group>
        </div>
      </div>
      {dynamicFeedVideoType !== DynamicFeedVideoType.DynamicOnly && (
        <div className={classes.popover.section}>
          <div className={classes.popover.sectionTilte}>充电专属</div>
          <div css={flexVerticalCenterStyle}>
            <Checkbox
              checked={hideChargeOnlyVideos}
              onChange={async (e) => {
                const val = e.target.checked
                const set = dfStore.hideChargeOnlyVideosForKeysSet
                if (val) {
                  set.add(selectedKey)
                } else {
                  set.delete(selectedKey)
                }

                await delay(100)
                onRefresh?.()
              }}
              css={css`
                margin-left: 5px;
              `}
            >
              <AntdTooltip
                title={
                  <>
                    隐藏「{CHARGE_ONLY_TEXT}」视频 <br />
                    仅对当前 UP 或 分组生效
                  </>
                }
              >
                <span style={{ userSelect: 'none' }}>隐藏「{CHARGE_ONLY_TEXT}」</span>
              </AntdTooltip>
            </Checkbox>
          </div>
        </div>
      )}
      <div className={classes.popover.section}>
        <div className={classes.popover.sectionTilte}>最短时长</div>
        <div>
          <Radio.Group
            css={css`
              overflow: hidden;
              .ant-radio-button-wrapper {
                padding-inline: 10px; // 原始 15px
              }
            `}
            buttonStyle='solid'
            value={filterMinDuration}
            onChange={async (v) => {
              dfStore.filterMinDuration = v.target.value
              await delay(100)
              onRefresh?.()
            }}
          >
            {Object.values(DynamicFeedVideoMinDuration).map((k) => {
              const { label } = DynamicFeedVideoMinDurationConfig[k]
              return (
                <Radio.Button key={k} value={k}>
                  {label}
                </Radio.Button>
              )
            })}
          </Radio.Group>
        </div>
      </div>
      {!externalSearchInput && (
        <div className={classes.popover.section}>
          <div className={classes.popover.sectionTilte}>搜索</div>
          <div>{searchInput}</div>
        </div>
      )}
      <SearchCacheRelated />

      <div className={classes.popover.section}>
        <div className={classes.popover.sectionTilte}>
          {viewingSomeGroup ? '分组' : viewingSomeUp ? 'UP' : '全部'}
          <HelpInfo>
            当前{viewingSomeGroup ? '分组' : viewingSomeUp ? 'UP' : '范围'}的一些操作~
          </HelpInfo>
          {viewingSomeGroup && selectedFollowGroup && (
            <span className='inline-flex items-center ml-15 font-size-14'>
              (
              <a
                href={formatFollowGroupUrl(selectedFollowGroup?.tagid || '')}
                target='_blank'
                className={`inline-flex items-center font-size-16 mx-4 ${APP_CLS_USE_ANT_LINK_COLOR}`}
              >
                <IconForOpenExternalLink className='size-18 mr-2' />
                {selectedFollowGroup?.name}
              </a>
              )
            </span>
          )}
        </div>
        <div className='flex flex-col items-start  gap-x-10 gap-y-6'>
          <Checkbox
            checked={addSeparators}
            onChange={async (v) => {
              dfStore.addSeparatorsMap.set('global', v.target.checked)
              await delay(100)
              onRefresh?.()
            }}
          >
            <AntdTooltip title='添加今日/更早分割线'>添加分割线</AntdTooltip>
          </Checkbox>

          {/* actions for up|group */}
          {viewingSomeGroup && !!selectedFollowGroup && (
            <FollowGroupActions followGroup={selectedFollowGroup} onRefresh={onRefresh} />
          )}
        </div>
      </div>
    </div>
  )
  const [popoverOpen, setPopoverOpen] = useState(
    __PROD__
      ? false //
      : false, // dev: change to true for debug if needed);
  )
  const onPopoverOpenChange = __PROD__
    ? setPopoverOpen //
    : setPopoverOpen // dev: free to change
  const popoverTrigger = (
    <Popover
      open={popoverOpen}
      onOpenChange={onPopoverOpenChange}
      arrow={false}
      placement='bottomLeft'
      getPopupContainer={getPopupContainer}
      content={popoverContent}
      overlayInnerStyle={{ border: `1px solid ${usePopoverBorderColor()}` }}
    >
      <Badge dot={showPopoverBadge} color={colorPrimaryValue} offset={[-5, 5]}>
        <Button css={[iconOnlyRoundButtonCss, popoverOpen && buttonOpenCss]}>
          <IconForPopoverTrigger className='ml-1' />
        </Button>
      </Badge>
    </Popover>
  )
  // #endregion

  return (
    <>
      <Space ref={ref}>
        {scopeDropdownMenu}

        {(viewingSomeUp || selectedFollowGroup) && (
          <Button onClick={onClear} className='gap-0'>
            <IconForReset className='size-14px mr-5px' />
            <span>清除</span>
          </Button>
        )}

        {popoverTrigger}

        {externalSearchInput && searchInput}

        {addCopyBvidButton && (
          <>
            <Button
              onClick={() => {
                copyBvidsSingleLine()
                antMessage.success('已复制')
              }}
            >
              Copy Bvids SingleLine
            </Button>
            <Button
              onClick={() => {
                copyBvidInfos()
                antMessage.success('已复制')
              }}
            >
              Copy Bvid Infos
            </Button>
          </>
        )}
      </Space>
    </>
  )
}

function SearchCacheRelated() {
  const { cacheAllItemsEntry, cacheAllItemsUpMids } = useSettingsSnapshot().dynamicFeed.__internal
  const { viewingSomeUp, upMid, upName } = useSnapshot(dfStore)

  const $req = useRequest(
    async (upMid: UpMidType, upName: string) => {
      const { notifyOnProgress, notifyOnSuccess } = createUpdateSearchCacheNotifyFns(upMid, upName)
      await updateLocalDynamicFeedCache(upMid, notifyOnProgress)
      notifyOnSuccess()
    },
    {
      manual: true,
    },
  )

  const checked = useMemo(
    () => !!upMid && cacheAllItemsUpMids.includes(upMid.toString()),
    [upMid, cacheAllItemsUpMids],
  )
  const onChange = useCallback(async (e: CheckboxChangeEvent) => {
    if (!upMid) return
    const val = e.target.checked
    const args = val ? { add: [upMid] } : { remove: [upMid] }
    await updateSettingsInnerArray('dynamicFeed.__internal.cacheAllItemsUpMids', args)
  }, [])

  return (
    <>
      {cacheAllItemsEntry && viewingSomeUp && upMid && upName && (
        <div className={classes.popover.section}>
          <div className={classes.popover.sectionTilte}>
            搜索缓存
            <HelpInfo>
              开启搜索缓存后, 会加载并缓存 UP 所有的动态 <br />
              {'当本地有缓存且总条数 <= 5000时, 搜索框成为及时搜索, 无需点击搜索按钮'}
            </HelpInfo>
          </div>
          <div>
            <div className='flex gap-y-3 gap-x-10 flex-wrap'>
              <Checkbox className='inline-flex items-center' checked={checked} onChange={onChange}>
                <AntdTooltip title='只有开启此项, 搜索时才会使用缓存'>
                  <span>为「{upName}」开启</span>
                </AntdTooltip>
              </Checkbox>
              <Button
                loading={$req.loading}
                onClick={async () => {
                  await $req.runAsync(upMid, upName)
                }}
              >
                更新缓存
              </Button>
              {flexBreak}

              <CheckboxSettingItem
                configPath='dynamicFeed.advancedSearch'
                label={'使用高级搜索'}
                tooltip={
                  <>
                    高级搜索 <br />
                    1. 可以使用多个搜索词, 用空格分隔, 逻辑关系为且 (AND) <br />
                    2. 可以使用引号包裹搜索词, 如 "word or sentence" <br />
                    2. 可以使用 -"word or sentence" 排除关键词 <br />
                  </>
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const tryInstantSearchWithCache = throttle(async function ({
  searchText,
  upMid,
  onRefresh,
}: {
  searchText: string
  upMid?: UpMidType | undefined
  onRefresh?: () => void
}) {
  if (!upMid) return
  if (!(searchText || (!searchText && dfStore.searchText))) return
  if (!settings.dynamicFeed.__internal.cacheAllItemsEntry) return // feature not enabled
  if (!settings.dynamicFeed.__internal.cacheAllItemsUpMids.includes(upMid.toString())) return // up not checked
  if (!(await hasLocalDynamicFeedCache(upMid))) return // cache not exist

  // cached info
  const info = await localDynamicFeedInfoCache.get(upMid)
  if (!info || !info.count) return
  if (info.count >= 5000) return // for bad performance

  // instant search
  dfStore.searchText = searchText
  await delay(0)
  onRefresh?.()
}, 100)

function FollowGroupActions({
  followGroup,
  onRefresh,
}: {
  followGroup: FollowGroup
  onRefresh?: () => void
}) {
  const { whenViewAll } = useSnapshot(settings.dynamicFeed)
  const midCount = followGroup.count

  let forceMergeTimelineCheckbox: ReactNode
  const forceMergeTimelineHandle = useValueInSettingsCollection(
    followGroup.tagid,
    'dynamicFeed.followGroup.forceUseMergeTimelineIds',
  )
  {
    const { checked, onChange } = forceMergeTimelineHandle
    const disabled =
      midCount <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD
    forceMergeTimelineCheckbox = (
      <Checkbox
        checked={checked}
        onChange={(e) => {
          onChange(e)
          onRefresh?.()
        }}
        disabled={disabled}
      >
        <AntdTooltip
          title={
            <>
              默认分组 UP 数量不超过{' '}
              {FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD}{' '}
              时会使用「拼接时间线」
              {disabled && (
                <p
                  css={css`
                    color: oklch(from ${colorPrimaryValue} calc(1 - l) calc(c + 0.1) h);
                    font-style: italic;
                  `}
                >
                  当前分组 UP 数量: {midCount}, 无需设置
                </p>
              )}
            </>
          }
        >
          分组动态: 强制使用「拼接时间线」
        </AntdTooltip>
      </Checkbox>
    )
  }

  let clearMergeTimelineHeadCacheButton: ReactNode
  {
    const usingMergeTimeline =
      midCount <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD ||
      forceMergeTimelineHandle.checked
    const usingMergeTimelineHeadCache =
      usingMergeTimeline &&
      midCount > FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD
    clearMergeTimelineHeadCacheButton = usingMergeTimelineHeadCache && (
      <AntdTooltip
        title={
          <>
            当分组 UP 数量{' >  '}
            {FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD}时,
            「拼接时间线」功能会缓存每个 UP 的最新动态5分钟. <br />
            这里可以手动清除缓存
          </>
        }
      >
        <Button
          onClick={() => {
            fetchVideoDynamicFeedsWithCache.cache.db.clear()
            antMessage.success('已清除缓存')
          }}
        >
          清除「拼接时间线」- 队头缓存
        </Button>
      </AntdTooltip>
    )
  }

  let addTo_dynamicFeedWhenViewAllHideIds_checkbox: ReactNode
  {
    const { checked, onChange } = useValueInSettingsCollection(
      `${DF_SELECTED_KEY_PREFIX_GROUP}${followGroup.tagid}`,
      'dynamicFeed.whenViewAll.hideIds',
    )
    addTo_dynamicFeedWhenViewAllHideIds_checkbox = whenViewAll.enableHideSomeContents && (
      <Checkbox checked={checked} onChange={onChange}>
        <AntdTooltip title={<>在「全部」动态中隐藏来自此 {followGroup.name} 的动态</>}>
          在「全部」动态中隐藏来自此分组的动态
        </AntdTooltip>
      </Checkbox>
    )
  }

  return (
    <>
      {addTo_dynamicFeedWhenViewAllHideIds_checkbox}
      {forceMergeTimelineCheckbox}
      {clearMergeTimelineHeadCacheButton}
    </>
  )
}

function UpActions({ upMid, upName }: { upMid: UpMidType; upName: string }) {
  const { whenViewAll } = useSnapshot(settings.dynamicFeed)

  let addTo_dynamicFeedWhenViewAllHideIds_checkbox: ReactNode
  {
    const { checked, onChange } = useValueInSettingsCollection(
      `${DF_SELECTED_KEY_PREFIX_UP}${upMid}`,
      'dynamicFeed.whenViewAll.hideIds',
    )
    addTo_dynamicFeedWhenViewAllHideIds_checkbox = whenViewAll.enableHideSomeContents && (
      <Checkbox checked={checked} onChange={onChange}>
        <AntdTooltip title={<>在「全部」动态中隐藏来自 {upName} 的动态</>}>
          在「全部」动态中隐藏来自 {upName} 的动态
        </AntdTooltip>
      </Checkbox>
    )
  }

  return <>{addTo_dynamicFeedWhenViewAllHideIds_checkbox}</>
}

function useValueInSettingsCollection<P extends ListSettingsPath>(
  value: Get<Settings, P>[number],
  listSettingsPath: P,
) {
  const list = useSettingsInnerArray(listSettingsPath)
  const checked = useMemo(() => list.includes(value), [list])

  const setChecked = useMemoizedFn(async (checked: boolean) => {
    const arg = checked ? { add: [value] } : { remove: [value] }
    await updateSettingsInnerArray(listSettingsPath, arg)
  })

  const onChange = useCallback((e: CheckboxChangeEvent) => {
    setChecked(e.target.checked)
  }, [])

  return { checked, setChecked, onChange }
}
