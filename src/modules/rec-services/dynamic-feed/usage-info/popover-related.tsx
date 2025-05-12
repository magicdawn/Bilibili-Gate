import { css } from '@emotion/react'
import { __PROD__ } from '$common'
import { APP_CLS_USE_ANT_LINK_COLOR, buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { HelpInfo } from '$components/_base/HelpInfo'
import { colorPrimaryValue } from '$components/css-vars'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { CHARGE_ONLY_TEXT } from '$components/VideoCard/top-marks'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForOpenExternalLink } from '$modules/icon'
import {
  settings,
  updateSettingsInnerArray,
  useSettingsInnerArray,
  useSettingsSnapshot,
  type ListSettingsPath,
  type Settings,
} from '$modules/settings'
import { advancedSearchHelpInfo } from '$utility/search'
import { useRequest } from 'ahooks'
import { Badge, Button, Checkbox, Input, Popover, Radio } from 'antd'
import { delay, throttle } from 'es-toolkit'
import { useSnapshot } from 'valtio'
import {
  createUpdateSearchCacheNotifyFns,
  hasLocalDynamicFeedCache,
  localDynamicFeedInfoCache,
  updateLocalDynamicFeedCache,
} from '../cache'
import { fetchVideoDynamicFeedsWithCache, FollowGroupMergeTimelineService } from '../group/merge-timeline-service'
import { formatFollowGroupUrl, IconForPopoverTrigger } from '../shared'
import {
  DF_SELECTED_KEY_PREFIX_GROUP,
  DF_SELECTED_KEY_PREFIX_UP,
  dfStore,
  DynamicFeedQueryKey,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoMinDurationConfig,
  DynamicFeedVideoType,
  DynamicFeedVideoTypeLabel,
  QUERY_DYNAMIC_SEARCH_TEXT,
  SHOW_DYNAMIC_FEED_ONLY,
  type UpMidType,
} from '../store'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import type { FollowGroup } from '$modules/bilibili/me/follow-group/types/groups'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { ReactNode } from 'react'
import type { Get } from 'type-fest'

export function usePopoverRelated({
  externalSearchInput,
  onRefresh,
  getPopupContainer,
}: {
  externalSearchInput: boolean
  onRefresh: OnRefresh | undefined
  getPopupContainer: (() => HTMLElement) | undefined
}) {
  const { upMid, dynamicFeedVideoType, filterMinDuration, searchText, hideChargeOnlyVideos } = useSnapshot(dfStore)

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
    <PopoverContent externalSearchInput={externalSearchInput} searchInput={searchInput} onRefresh={onRefresh} />
  )

  const [popoverOpen, setPopoverOpen] = useState(
    __PROD__
      ? false //
      : false, // dev: change to true for debug if needed);
  )
  const onPopoverOpenChange = __PROD__
    ? setPopoverOpen //
    : setPopoverOpen // dev: free to change

  const showPopoverBadge = useMemo(() => {
    return !!(
      dynamicFeedVideoType !== DynamicFeedVideoType.All ||
      hideChargeOnlyVideos ||
      searchText ||
      filterMinDuration !== DynamicFeedVideoMinDuration.All
    )
  }, [dynamicFeedVideoType, hideChargeOnlyVideos, searchText, filterMinDuration])

  const popoverTrigger = (
    <Popover
      open={popoverOpen}
      onOpenChange={onPopoverOpenChange}
      arrow={false}
      placement='bottomLeft'
      getPopupContainer={getPopupContainer}
      content={popoverContent}
      styles={{ body: { border: `1px solid ${usePopoverBorderColor()}` } }}
    >
      <Badge dot={showPopoverBadge} color={colorPrimaryValue} offset={[-5, 5]}>
        <Button className='icon-only-round-button' css={popoverOpen && buttonOpenCss}>
          <IconForPopoverTrigger className='ml-1px' />
        </Button>
      </Badge>
    </Popover>
  )

  return { searchInput, popoverContent, popoverTrigger }
}

const classes = {
  wrapper: 'max-w-350px',
  section: 'mt-10px first:mt-0px min-w-300px',
  sectionTilte: 'flex items-center text-20px pl-2px pb-2px',
  sectionContent: 'flex flex-col items-start gap-x-10px gap-y-6px',
} as const

function PopoverContent({
  externalSearchInput,
  searchInput,
  onRefresh,
}: {
  externalSearchInput: boolean
  searchInput: ReactNode
  onRefresh: OnRefresh | undefined
}) {
  const {
    viewingSomeUp,
    selectedGroup,
    viewingSomeGroup,
    selectedKey,
    dynamicFeedVideoType,
    filterMinDuration,
    hideChargeOnlyVideos,
    addSeparators,
    searchText,
  } = useSnapshot(dfStore)

  let linkToReflectSearchTextEl: ReactNode
  {
    const show = SHOW_DYNAMIC_FEED_ONLY && !!searchText
    const disabled = searchText === QUERY_DYNAMIC_SEARCH_TEXT
    const { href, path } = useMemo(() => {
      const u = new URL(location.href)
      if (u.searchParams.has(DynamicFeedQueryKey.SearchTextFull)) {
        u.searchParams.set(DynamicFeedQueryKey.SearchTextFull, searchText || '')
      } else if (u.searchParams.has(DynamicFeedQueryKey.SearchTextShort)) {
        u.searchParams.set(DynamicFeedQueryKey.SearchTextShort, searchText || '')
      } else {
        u.searchParams.set(DynamicFeedQueryKey.SearchTextFull, searchText || '')
      }
      return { href: u.href, path: `${u.pathname}?${u.search}` }
    }, [searchText])
    linkToReflectSearchTextEl = show && (
      <AntdTooltip title={href}>
        <Button disabled={disabled} href={href}>
          转到搜索词为「{searchText || '空'}」的链接
        </Button>
      </AntdTooltip>
    )
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.section}>
        <div className={classes.sectionTilte}>
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
        <div className={classes.section}>
          <div className={classes.sectionTilte}>充电专属</div>
          <div className={classes.sectionContent}>
            <Checkbox
              className='ml-5px'
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
      <div className={classes.section}>
        <div className={classes.sectionTilte}>最短时长</div>
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

      {/* search */}
      {(!externalSearchInput || linkToReflectSearchTextEl) && (
        <div className={classes.section}>
          <div className={classes.sectionTilte}>搜索</div>
          <div className={classes.sectionContent}>
            {!externalSearchInput && searchInput}
            {linkToReflectSearchTextEl}
          </div>
        </div>
      )}

      {/* search-cache */}
      <SearchCacheRelated />

      <div className={classes.section}>
        <div className={classes.sectionTilte}>
          {viewingSomeGroup ? '分组' : viewingSomeUp ? 'UP' : '全部'}
          <HelpInfo>当前{viewingSomeGroup ? '分组' : viewingSomeUp ? 'UP' : '范围'}的一些操作~</HelpInfo>
          {viewingSomeGroup && selectedGroup && (
            <span className='ml-15px inline-flex items-center text-size-14px'>
              (
              <a
                href={formatFollowGroupUrl(selectedGroup?.tagid || '')}
                target='_blank'
                className={`inline-flex items-center text-size-16px mx-4px ${APP_CLS_USE_ANT_LINK_COLOR}`}
              >
                <IconForOpenExternalLink className='mr-2px size-18px' />
                {selectedGroup?.name}
              </a>
              )
            </span>
          )}
        </div>
        <div className={classes.sectionContent}>
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
          {viewingSomeGroup && !!selectedGroup && (
            <FollowGroupActions followGroup={selectedGroup} onRefresh={onRefresh} />
          )}
        </div>
      </div>
    </div>
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

  const checked = useMemo(() => !!upMid && cacheAllItemsUpMids.includes(upMid.toString()), [upMid, cacheAllItemsUpMids])
  const onChange = useCallback(async (e: CheckboxChangeEvent) => {
    if (!upMid) return
    const val = e.target.checked
    const args = val ? { add: [upMid] } : { remove: [upMid] }
    await updateSettingsInnerArray('dynamicFeed.__internal.cacheAllItemsUpMids', args)
  }, [])

  return (
    <>
      {cacheAllItemsEntry && viewingSomeUp && upMid && upName && (
        <div className={classes.section}>
          <div className={classes.sectionTilte}>
            搜索缓存
            <HelpInfo>
              开启搜索缓存后, 会加载并缓存 UP 所有的动态 <br />
              {'当本地有缓存且总条数 <= 5000时, 搜索框成为及时搜索, 无需点击搜索按钮'}
            </HelpInfo>
          </div>
          <div className={classes.sectionContent}>
            <div className='flex flex-wrap items-center gap-x-10px gap-y-3px'>
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
            </div>
            <CheckboxSettingItem
              configPath='dynamicFeed.advancedSearch'
              label={'使用高级搜索'}
              tooltip={advancedSearchHelpInfo}
            />
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
  if (!searchText && (searchText || !dfStore.searchText)) return
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

export function FollowGroupMechanismNote() {
  return (
    <>
      <p>机制介绍:</p>
      <ul>
        <li className='flex items-start gap-x-10px'>
          <div>「从全部过滤」:</div>
          <div>基于全部动态 + 分组UP过滤, 速度可能巨慢, 且过滤后的数量取决于B站记录的"全部"动态范围</div>
        </li>
        <li className='flex items-start gap-x-10px'>
          <div>「拼接时间线」:</div>
          <div>
            可以理解为: 去看一遍分组所有 UP 的动态, 然后将它们拼接起来 <br />
            启动慢, 但可以加载所有动态; 且分组 UP 越多, 启动越慢 <br />
            默认分组 UP 数量不超过 {FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD}{' '}
            时会使用「拼接时间线」 <br />
            详见
            <a
              className='mx-5px'
              href='https://magicdawn.fun/2024/12/01/bilibili-gate-dynamic-feed-merge-timeline/'
              target='_blank'
            >
              介绍博客
            </a>
          </div>
        </li>
      </ul>
    </>
  )
}

function FollowGroupActions({ followGroup, onRefresh }: { followGroup: FollowGroup; onRefresh?: () => void }) {
  const { whenViewAll } = useSnapshot(settings.dynamicFeed)
  const midCount = followGroup.count

  let forceMergeTimelineCheckbox: ReactNode
  const forceMergeTimelineHandle = useValueInSettingsCollection(
    followGroup.tagid,
    'dynamicFeed.followGroup.forceUseMergeTimelineIds',
  )
  {
    const { checked, onChange } = forceMergeTimelineHandle
    const disabled = midCount <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD
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
              <FollowGroupMechanismNote />
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
      usingMergeTimeline && midCount > FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD
    clearMergeTimelineHeadCacheButton = usingMergeTimelineHeadCache && (
      <AntdTooltip
        title={
          <>
            当分组 UP 数量{' >  '}
            {FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD}时, 「拼接时间线」功能会缓存每个 UP
            的最新动态5分钟. <br />
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
