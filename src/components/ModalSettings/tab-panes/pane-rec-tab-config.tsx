import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox, Collapse, Empty, Radio, Space } from 'antd'
import { useSnapshot } from 'valtio'
import { HelpInfo } from '$components/_base/HelpInfo'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { useSortedTabKeys } from '$components/RecHeader/tab'
import { TabConfig, TabIcon } from '$components/RecHeader/tab-config'
import { CONFIGURABLE_TAB_KEYS, ETab } from '$components/RecHeader/tab-enum'
import { ESidebarAlign } from '$enums'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { getUserNickname } from '$modules/bilibili/user/nickname'
import { appRecShowContentFromOtherTabEl } from '$modules/rec-services/app'
import {
  formatFollowGroupUrl,
  formatSpaceUrl,
  IconForGroup,
  IconForUp,
} from '$modules/rec-services/dynamic-feed/shared'
import {
  DF_SELECTED_KEY_PREFIX_GROUP,
  DF_SELECTED_KEY_PREFIX_UP,
  dfStore,
} from '$modules/rec-services/dynamic-feed/store'
import { FollowGroupMechanismNote } from '$modules/rec-services/dynamic-feed/views/popover-related'
import { settings, updateSettings, updateSettingsInnerArray, useSettingsSnapshot } from '$modules/settings'
import type { FollowGroup } from '$modules/bilibili/me/follow-group/types/groups'
import { TagItemDisplay } from '../EditableListSettingItem'
import { explainForFlag } from '../index.shared'
import { ResetPartialSettingsButton, SettingsGroup, sharedClassNames } from './shared'
import type { DragEndEvent } from '@dnd-kit/core'
import type { CSSProperties } from 'react'

export function TabPaneRecTabsConfig() {
  const { dynamicFeed, sidebarAlign, enableSidebar } = useSettingsSnapshot()
  const sortedTabKeys = useSortedTabKeys()

  const getCssOrderStyle = (tab: ETab): CSSProperties => {
    return { order: sortedTabKeys.indexOf(tab) + 1 }
  }

  return (
    <div className={sharedClassNames.tabPane}>
      <div className='grid grid-cols-[250px_1fr] gap-x-50px'>
        <SettingsGroup
          title={
            <>
              Tab 设置
              <HelpInfo className='ml-5px'>勾选显示, 拖动排序</HelpInfo>
              <span className='flex-1' />
              <ResetPartialSettingsButton paths={['hidingTabKeys', 'customTabKeysOrder']} />
            </>
          }
        >
          <VideoSourceTabOrder />
        </SettingsGroup>

        <SettingsGroup title='更多设置' contentClassName='gap-y-15px'>
          {/* generral */}
          <div className='order--10'>
            <div className='flex items-center text-size-1.3em'>通用</div>
            <div className='flex flex-wrap items-center gap-x-10px'>
              <div className='flex items-center gap-x-4px'>
                <CheckboxSettingItem
                  configPath='enableSidebar'
                  label='使用侧边栏'
                  tooltip={explainForFlag('使用侧边栏(如动态 分组/UP 选择)', '使用下拉面板')}
                />
                <Radio.Group
                  disabled={!enableSidebar}
                  buttonStyle='solid'
                  size='small'
                  value={sidebarAlign}
                  onChange={(e) => {
                    settings.sidebarAlign = e.target.value
                  }}
                >
                  <Radio.Button value={ESidebarAlign.Left} className='inline-flex-center'>
                    <IconMaterialSymbolsAlignHorizontalLeft className='size-16px' />
                  </Radio.Button>
                  <Radio.Button value={ESidebarAlign.Right} className='inline-flex-center'>
                    <IconMaterialSymbolsAlignHorizontalRight className='size-16px' />
                  </Radio.Button>
                </Radio.Group>
              </div>
            </div>
          </div>

          {/* watchlater */}
          <div style={getCssOrderStyle(ETab.Watchlater)}>
            <div className='flex items-center text-size-1.3em'>
              <TabIcon tabKey={ETab.Watchlater} className='mr-5px mt--1px' />
              稍后再看
            </div>
            <Space size={10}>
              <CheckboxSettingItem
                configPath='watchlaterAddSeparator'
                label='添加分割线'
                tooltip='添加「近期」「更早」分割线'
              />
              <CheckboxSettingItem
                configPath='watchlaterUseNormalVideoUrl'
                label='使用普通视频链接'
                tooltip={explainForFlag('使用普通视频链接', '使用「稍后再看」自动列表链接')}
              />
            </Space>
          </div>

          {/* fav */}
          <div style={getCssOrderStyle(ETab.Fav)}>
            <div className='flex items-center text-size-1.3em'>
              <TabIcon tabKey={ETab.Fav} className='mr-5px mt--2px' />
              收藏
            </div>
            <Space size={10}>
              <CheckboxSettingItem
                configPath='fav.addSeparator'
                label='添加分割线'
                tooltip='顺序显示时, 按收藏夹添加分割线'
              />
            </Space>
          </div>

          {/* dynamic-feed */}
          <div style={getCssOrderStyle(ETab.DynamicFeed)}>
            <div className='flex items-center text-size-1.3em'>
              <TabIcon tabKey={ETab.DynamicFeed} className='mr-5px mt--2px' />
              动态
            </div>
            <div className='flex flex-wrap gap-x-10px gap-y-10px'>
              <CheckboxSettingItem
                configPath='dynamicFeed.followGroup.enabled'
                label='启用分组筛选'
                tooltip={
                  <>
                    动态 Tab 启用分组筛选 <br />
                    <FollowGroupMechanismNote />
                  </>
                }
              />
              <CheckboxSettingItem
                configPath='dynamicFeed.showLive'
                label='在动态中显示直播'
                tooltip={
                  <>
                    动态里显示正在直播的 UP
                    <br />
                    P.S 仅在选择「全部」时展示
                  </>
                }
              />
              <CheckboxSettingItem
                configPath='dynamicFeed.whenViewAll.enableHideSomeContents'
                label='「全部」动态过滤'
                tooltip={
                  <>
                    查看「全部」动态时 <br />
                    {explainForFlag('将添加右键菜单, 点击可添加到「全部」动态的过滤列表', '关闭此功能')}
                  </>
                }
              />

              {dynamicFeed.whenViewAll.enableHideSomeContents && (
                <Collapse
                  size='small'
                  className='w-full'
                  items={[
                    {
                      key: '1',
                      label: '在「全部」动态中隐藏 UP/分组 的动态',
                      children: <DynamicFeedWhenViewAllHideIdsPanel />,
                    },
                  ]}
                />
              )}
            </div>
          </div>

          {/* recommend */}
          <div style={getCssOrderStyle(ETab.AppRecommend)}>
            <div className='flex items-center text-size-1.3em'>
              <TabIcon tabKey={ETab.AppRecommend} className='mr-5px' />
              App 推荐
            </div>
            <div className='flex flex-col gap-y-5px'>
              <div className='flex items-center'>{appRecShowContentFromOtherTabEl()}</div>
            </div>
          </div>
        </SettingsGroup>
      </div>
    </div>
  )
}

function useCurrentShowingTabKeys(): ETab[] {
  const { hidingTabKeys } = useSettingsSnapshot()
  return useMemo(() => CONFIGURABLE_TAB_KEYS.filter((key) => !hidingTabKeys.includes(key)), [hidingTabKeys])
}

function VideoSourceTabOrder({ className, style }: { className?: string; style?: CSSProperties }) {
  const currentShowingTabKeys = useCurrentShowingTabKeys()
  const sortedTabKeys = useSortedTabKeys()

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = useMemoizedFn((e: DragEndEvent) => {
    const { over, active } = e
    if (!over?.id || over.id === active.id) return

    const oldIndex = sortedTabKeys.indexOf(active.id.toString())
    const newIndex = sortedTabKeys.indexOf(over.id.toString())
    // console.log('re-order:', oldIndex, newIndex)
    const newList = arrayMove(sortedTabKeys, oldIndex, newIndex)
    updateSettings({ customTabKeysOrder: newList })
  })

  return (
    <div {...{ className, style }}>
      <Checkbox.Group
        className='block line-height-[unset]'
        value={currentShowingTabKeys}
        onChange={(newVal) => {
          if (!newVal.length) {
            return antMessage.error('至少选择一项!')
          }
          updateSettings({
            hidingTabKeys: CONFIGURABLE_TAB_KEYS.filter((k) => !newVal.includes(k)),
          })
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={sortedTabKeys} strategy={verticalListSortingStrategy}>
            {sortedTabKeys.map((key) => (
              <VideoSourceTabSortableItem key={key} id={key} />
            ))}
          </SortableContext>
        </DndContext>
      </Checkbox.Group>
    </div>
  )
}

function VideoSourceTabSortableItem({ id }: { id: ETab }) {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { label, desc } = TabConfig[id]

  return (
    <div
      key={id}
      ref={setNodeRef}
      style={style}
      className='mt-8px h-35px flex items-center justify-between b-1px b-gate-bg-lv-2 rounded-6px b-solid pl-10px pr-6px'
      {...attributes}
    >
      <Checkbox
        value={id}
        className='inline-flex items-center [&_.ant-checkbox-label]:(inline-flex select-none items-center)'
      >
        <TabIcon tabKey={id} className='mr-5px' />
        <AntdTooltip align={{ offset: [0, -6] }} title={desc}>
          {label}
        </AntdTooltip>
      </Checkbox>

      <div
        {...listeners}
        ref={setActivatorNodeRef}
        className='cursor-grab rounded-5px px-5px py-3px text-size-0 hover:bg-gate-bg-lv-3'
      >
        <IconParkOutlineDrag className='size-18px' />
      </div>
    </div>
  )
}

function DynamicFeedWhenViewAllHideIdsPanel() {
  const { hideIds } = useSnapshot(settings.dynamicFeed.whenViewAll)

  const onDelete = useMemoizedFn(async (mid: string) => {
    await updateSettingsInnerArray('dynamicFeed.whenViewAll.hideIds', { remove: [mid] })
  })

  const { groups } = useSnapshot(dfStore)
  useMount(() => {
    dfStore.updateGroups()
  })

  const empty = !hideIds.length
  if (empty) {
    return (
      <div className='flex items-center justify-center'>
        <Empty />
      </div>
    )
  }

  return (
    <div className='max-h-250px flex flex-wrap gap-10px overflow-y-auto'>
      {hideIds.map((tag) => {
        return (
          <TagItemDisplay
            key={tag}
            tag={tag}
            onDelete={onDelete}
            renderTag={(t) => <DynamicFeedWhenViewAllHideIdTag tag={t} followGroups={groups} />}
          />
        )
      })}
    </div>
  )
}

function DynamicFeedWhenViewAllHideIdTag({ tag, followGroups }: { tag: string; followGroups?: FollowGroup[] }) {
  let mid: string | undefined
  let followGroupId: string | undefined
  let invalid = false
  if (tag.startsWith(DF_SELECTED_KEY_PREFIX_UP)) {
    mid = tag.slice(DF_SELECTED_KEY_PREFIX_UP.length)
  } else if (tag.startsWith(DF_SELECTED_KEY_PREFIX_GROUP)) {
    followGroupId = tag.slice(DF_SELECTED_KEY_PREFIX_GROUP.length)
  } else {
    invalid = true
  }

  // mid -> nickname
  const [upNickname, setUpNickname] = useState<string | undefined>(undefined)
  useMount(async () => {
    if (!mid) return
    const nickname = await getUserNickname(mid)
    if (nickname) setUpNickname(nickname)
  })

  // followGroupId -> name
  const [followGroupName, setFollowGroupName] = useState<string | undefined>(undefined)
  useMount(() => {
    if (!followGroupId) return
    const groupName = followGroups?.find((g) => g.tagid.toString() === followGroupId)?.name
    if (groupName) setFollowGroupName(groupName)
  })

  const label = useMemo(
    () => (mid ? upNickname || mid : followGroupId ? followGroupName || followGroupId : '无效数据'),
    [mid, upNickname, followGroupId, followGroupName],
  )

  const tooltip = useMemo(
    () => (mid ? `mid: ${mid}` : followGroupId ? `分组: ${followGroupId}` : `Tag: ${tag}`),
    [mid, followGroupId, tag],
  )

  const icon = useMemo(
    () =>
      mid ? (
        <IconForUp className='mr-2px size-12px' />
      ) : followGroupId ? (
        <IconForGroup className='mr-2px size-16px' />
      ) : undefined,
    [mid, followGroupId],
  )

  const href = useMemo(
    () => (mid ? formatSpaceUrl(mid) : followGroupId ? formatFollowGroupUrl(followGroupId) : undefined),
    [mid, followGroupId],
  )

  return (
    <>
      <AntdTooltip title={tooltip}>
        <span className={clsx('inline-flex items-center', mid ? 'cursor-pointer' : 'cursor-text')}>
          {icon}
          {href ? (
            <a href={href} target='_blank'>
              {label}
            </a>
          ) : (
            label
          )}
        </span>
      </AntdTooltip>
    </>
  )
}
