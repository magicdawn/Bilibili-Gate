import { Badge, Button, Checkbox, Popover } from 'antd'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { PopoverDurationInput } from '$components/_base/DurationInput'
import { appPrimaryColorValue } from '$components/css-vars'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForPopoverTrigger } from '$modules/rec-services/dynamic-feed/shared'
import { spaceUploadStore } from '../store'
import type { RefreshFn } from '$components/Recommends/rec.shared'

export function usePopoverRelated({
  onRefresh,
  getPopupContainer,
}: {
  onRefresh: RefreshFn
  getPopupContainer: (() => HTMLElement) | undefined
}) {
  const { hideChargeOnlyVideos, filterMinDuration, filterMaxDuration } =
    useSnapshot(spaceUploadStore).currentFilterState

  const [popoverOpen, setPopoverOpen] = useState(false)

  const popoverContent = <PopoverContent refresh={onRefresh} open={popoverOpen} />

  const showPopoverBadge = useMemo(
    () => !!(hideChargeOnlyVideos || filterMinDuration || filterMaxDuration),
    [hideChargeOnlyVideos, filterMinDuration, filterMaxDuration],
  )

  const popoverTrigger = (
    <Popover
      fresh
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
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

  return { popoverTrigger }
}

const classes = {
  wrapper: 'max-w-320px',
  section: 'mt-10px min-w-240px first:mt-0px',
  sectionTilte: 'flex items-center pb-2px pl-2px text-18px',
  sectionContent: 'flex flex-col items-start gap-x-10px gap-y-6px',
} as const

const minDurationPresets = [10, 30, 1 * 60, 2 * 60, 5 * 60] // in seconds
const maxDurationPresets = [1, 2, 5, 10, 15, 30].map((m) => m * 60) // in seconds

function PopoverContent({ refresh, open }: { refresh: RefreshFn | undefined; open: boolean }) {
  const { hideChargeOnlyVideos, filterMinDuration, filterMaxDuration } =
    useSnapshot(spaceUploadStore).currentFilterState

  return (
    <div className={classes.wrapper}>
      <div className={classes.section}>
        <div className={classes.sectionTilte}>充电专属</div>
        <div className={classes.sectionContent}>
          <Checkbox
            className='ml-5px'
            checked={hideChargeOnlyVideos}
            onChange={(e) => {
              const checked = e.target.checked
              spaceUploadStore.updateCurrentFilterState({ hideChargeOnlyVideos: checked })
              refresh?.()
            }}
          >
            <AntdTooltip title='隐藏「充电专属」视频'>
              <span style={{ userSelect: 'none' }}>隐藏「充电专属」</span>
            </AntdTooltip>
          </Checkbox>
        </div>
      </div>

      <div className={classes.section}>
        <div className={classes.sectionTilte}>按时长过滤</div>
        <div className={classes.sectionContent}>
          <div className='flex items-center gap-x-8px'>
            <span className={clsx(filterMinDuration && 'color-gate-primary')}>最短时长</span>
            <PopoverDurationInput
              parentOpen={open}
              title='编辑「最短时长」'
              value={filterMinDuration}
              presets={minDurationPresets}
              classNames={{ popoverRoot: 'w-202px', numberInput: 'w-80px' }}
              onChange={(v) => {
                spaceUploadStore.setFilterMinDuration(v)
                refresh?.()
              }}
            />
          </div>
          <div className='flex items-center gap-x-8px'>
            <span className={clsx(filterMaxDuration && 'color-gate-primary')}>最长时长</span>
            <PopoverDurationInput
              parentOpen={open}
              title='编辑「最长时长」'
              value={filterMaxDuration}
              presets={maxDurationPresets}
              classNames={{ popoverRoot: 'w-202px', numberInput: 'w-80px' }}
              onChange={(v) => {
                spaceUploadStore.setFilterMaxDuration(v)
                refresh?.()
              }}
            />
          </div>
        </div>
      </div>

      <div className={classes.section}>
        <div className={classes.sectionContent}>
          <Button
            onClick={() => {
              spaceUploadStore.resetCurrentFilterState()
              refresh?.()
            }}
          >
            重置筛选
          </Button>
        </div>
      </div>
    </div>
  )
}
