import { useMemoizedFn, useRequest } from 'ahooks'
import { Badge, Button, Checkbox, Input, Popover, Radio } from 'antd'
import { delay, throttle } from 'es-toolkit'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { __PROD__ } from '$common'
import { APP_CLS_USE_ANT_LINK_COLOR, buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { HelpInfo } from '$components/_base/HelpInfo'
import { appPrimaryColorValue } from '$components/css-vars'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
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
import { advancedFilterHelpInfo } from '$utility/local-filter'
import {
  createUpdateFilterCacheNotifyFns,
  hasLocalDynamicFeedCache,
  localDynamicFeedInfoCache,
  updateLocalDynamicFeedCache,
} from '../cache'
import { fetchDynamicFeedsWithCache, FollowGroupMergeTimelineService } from '../group/merge-timeline-service'
import { formatFollowGroupUrl, IconForPopoverTrigger } from '../shared'
import {
  DF_SELECTED_KEY_PREFIX_GROUP,
  DF_SELECTED_KEY_PREFIX_UP,
  dfStore,
  DynamicFeedBadgeText,
  DynamicFeedQueryKey,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoMinDurationConfig,
  DynamicFeedVideoType,
  DynamicFeedVideoTypeLabel,
  QUERY_DYNAMIC_FILTER_TEXT,
  SHOW_DYNAMIC_FEED_ONLY,
  type UpMidType,
} from '../store'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { Get } from 'type-fest'
import type { RefreshFn } from '$components/Recommends/rec.shared'
import type { FollowGroup } from '$modules/bilibili/me/follow-group/types/groups'

export function usePopoverRelated({
  externalFilterInput,
  onRefresh,
  getPopupContainer,
}: {
  externalFilterInput: boolean
  onRefresh: RefreshFn
  getPopupContainer: (() => HTMLElement) | undefined
}) {
  const { upMid, dynamicFeedVideoType, filterMinDuration, filterText, hideChargeOnlyVideos } = useSnapshot(dfStore)

  const filterInput = (
    <Input.Search
      style={{ width: externalFilterInput ? '250px' : undefined }}
      placeholder='按标题关键字过滤'
      type='search'
      autoCorrect='off'
      autoCapitalize='off'
      name={`filterText_${upMid}`}
      // 有自带的历史记录, 何乐而不为
      // 悬浮 autocomplete 时 popover 关闭了
      // autoComplete='on'
      variant='outlined'
      defaultValue={dfStore.filterText}
      autoComplete='off'
      allowClear
      onChange={(e) => {
        tryInstantFilterWithCache({ filterText: e.target.value, upMid, onRefresh })
      }}
      onSearch={async (val) => {
        dfStore.filterText = val || undefined
        await delay(100)
        onRefresh()
      }}
    />
  )

  const popoverContent = (
    <PopoverContent externalFilterInput={externalFilterInput} filterInput={filterInput} refresh={onRefresh} />
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
      filterText ||
      filterMinDuration !== DynamicFeedVideoMinDuration.All
    )
  }, [dynamicFeedVideoType, hideChargeOnlyVideos, filterText, filterMinDuration])

  const popoverTrigger = (
    <Popover
      open={popoverOpen}
      onOpenChange={onPopoverOpenChange}
      arrow={false}
      placement='bottomLeft'
      getPopupContainer={getPopupContainer}
      content={popoverContent}
      styles={{ container: { border: `1px solid ${usePopoverBorderColor()}` } }}
    >
      <Badge dot={showPopoverBadge} color={appPrimaryColorValue} offset={[-5, 5]}>
        <Button className='icon-only-round-button' css={popoverOpen && buttonOpenCss}>
          <IconForPopoverTrigger className='ml-1px' />
        </Button>
      </Badge>
    </Popover>
  )

  return { filterInput, popoverContent, popoverTrigger }
}

const classes = {
  wrapper: 'max-w-350px',
  section: 'mt-10px min-w-300px first:mt-0px',
  sectionTilte: 'flex items-center pb-2px pl-2px text-20px',
  sectionContent: 'flex flex-col items-start gap-x-10px gap-y-6px',
} as const

function PopoverContent({
  externalFilterInput,
  filterInput,
  refresh,
}: {
  externalFilterInput: boolean
  filterInput: ReactNode
  refresh: RefreshFn | undefined
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
    filterText,
  } = useSnapshot(dfStore)

  let linkToReflectFilterTextEl: ReactNode
  {
    const show = SHOW_DYNAMIC_FEED_ONLY && !!filterText
    const disabled = filterText === QUERY_DYNAMIC_FILTER_TEXT
    const { href } = useMemo(() => {
      const u = new URL(location.href)
      if (u.searchParams.has(DynamicFeedQueryKey.FilterTextFull)) {
        u.searchParams.set(DynamicFeedQueryKey.FilterTextFull, filterText || '')
      } else if (u.searchParams.has(DynamicFeedQueryKey.FilterTextShort)) {
        u.searchParams.set(DynamicFeedQueryKey.FilterTextShort, filterText || '')
      } else {
        u.searchParams.set(DynamicFeedQueryKey.FilterTextFull, filterText || '')
      }
      return { href: u.href, path: `${u.pathname}?${u.search}` }
    }, [filterText])
    linkToReflectFilterTextEl = show && (
      <AntdTooltip title={href}>
        <Button disabled={disabled} href={href}>
          转到过滤词为「{filterText || '空'}」的链接
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
            「{DynamicFeedBadgeText.ChargeOnly}」在此程序中归类为「投稿视频」
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
              refresh?.()
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
                refresh?.()
              }}
            >
              <AntdTooltip
                title={
                  <>
                    隐藏「{DynamicFeedBadgeText.ChargeOnly}」视频 <br />
                    仅对当前 UP 或 分组生效
                  </>
                }
              >
                <span style={{ userSelect: 'none' }}>隐藏「{DynamicFeedBadgeText.ChargeOnly}」</span>
              </AntdTooltip>
            </Checkbox>
          </div>
        </div>
      )}
      <div className={classes.section}>
        <div className={classes.sectionTilte}>最短时长</div>
        <div>
          <Radio.Group
            className='overflow-hidden [&_.ant-radio-button-wrapper]:px-10px' // 原始 15px
            buttonStyle='solid'
            value={filterMinDuration}
            onChange={async (v) => {
              dfStore.filterMinDuration = v.target.value
              await delay(100)
              refresh?.()
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

      {/* filter */}
      {(!externalFilterInput || linkToReflectFilterTextEl) && (
        <div className={classes.section}>
          <div className={classes.sectionTilte}>过滤</div>
          <div className={classes.sectionContent}>
            {!externalFilterInput && filterInput}
            {linkToReflectFilterTextEl}
          </div>
        </div>
      )}

      {/* filter-cache */}
      <FilterCacheRelated />

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
                className={`mx-4px inline-flex items-center text-size-16px ${APP_CLS_USE_ANT_LINK_COLOR}`}
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
              refresh?.()
            }}
          >
            <AntdTooltip title='添加今日/更早分割线'>添加分割线</AntdTooltip>
          </Checkbox>

          {/* actions for up|group */}
          {viewingSomeGroup && !!selectedGroup && <FollowGroupActions followGroup={selectedGroup} refresh={refresh} />}
        </div>
      </div>
    </div>
  )
}

function FilterCacheRelated() {
  const { cacheAllItemsEntry, cacheAllItemsUpMids } = useSettingsSnapshot().dynamicFeed.__internal
  const { viewingSomeUp, upMid, upName } = useSnapshot(dfStore)

  const $req = useRequest(
    async (upMid: UpMidType, upName: string) => {
      const { notifyOnProgress, notifyOnSuccess } = createUpdateFilterCacheNotifyFns(upMid, upName)
      await updateLocalDynamicFeedCache(upMid, notifyOnProgress)
      notifyOnSuccess()
    },
    { manual: true },
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
            过滤缓存
            <HelpInfo>
              开启过滤缓存后, 会加载并缓存 UP 所有的动态 <br />
              {'当本地有缓存且总条数 <= 5000时, 过滤框成为及时过滤, 无需点击过滤按钮'}
            </HelpInfo>
          </div>
          <div className={classes.sectionContent}>
            <div className='flex flex-wrap items-center gap-x-10px gap-y-3px'>
              <Checkbox className='inline-flex items-center' checked={checked} onChange={onChange}>
                <AntdTooltip title='只有开启此项, 过滤时才会使用缓存'>
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
              configPath='dynamicFeed.advancedFilter'
              label='使用高级过滤'
              tooltip={advancedFilterHelpInfo}
            />
          </div>
        </div>
      )}
    </>
  )
}

const tryInstantFilterWithCache = throttle(async function ({
  filterText,
  upMid,
  onRefresh,
}: {
  filterText: string
  upMid?: UpMidType | undefined
  onRefresh: RefreshFn
}) {
  if (!upMid) return
  if (!(filterText || (!filterText && dfStore.filterText))) return
  if (!settings.dynamicFeed.__internal.cacheAllItemsEntry) return // feature not enabled
  if (!settings.dynamicFeed.__internal.cacheAllItemsUpMids.includes(upMid.toString())) return // up not checked
  if (!(await hasLocalDynamicFeedCache(upMid))) return // cache not exist

  // cached info
  const info = await localDynamicFeedInfoCache.get(upMid)
  if (!info || !info.count) return
  if (info.count >= 5000) return // for bad performance

  // instant filter
  dfStore.filterText = filterText
  await delay(0)
  onRefresh()
}, 100)

export function FollowGroupMechanismNote() {
  return (
    <>
      <p>机制介绍:</p>
      <ul className='text-13px'>
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

function FollowGroupActions({ followGroup, refresh }: { followGroup: FollowGroup; refresh?: () => void }) {
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
          refresh?.()
        }}
        disabled={disabled}
      >
        <AntdTooltip
          title={
            <>
              <FollowGroupMechanismNote />
              {disabled && <p className='text-yellow-400 italic'>当前分组 UP 数量: {midCount}, 无需设置</p>}
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
            fetchDynamicFeedsWithCache.cache.db.clear()
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
