import { Badge, Button, Checkbox, Popover, Radio } from 'antd'
import { useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { appPrimaryColorValue } from '$components/css-vars'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForPopoverTrigger } from '$modules/rec-services/dynamic-feed/shared'
import { spaceUploadStore, SpaceUploadVideoMinDuration, SpaceUploadVideoMinDurationConfig } from '../store'
import type { RefreshFn } from '$components/Recommends/rec.shared'

export function usePopoverRelated({
  onRefresh,
  getPopupContainer,
}: {
  onRefresh: RefreshFn
  getPopupContainer: (() => HTMLElement) | undefined
}) {
  const { hideChargeOnlyVideos, filterMinDuration } = useSnapshot(spaceUploadStore)

  const popoverContent = <PopoverContent refresh={onRefresh} />

  const [popoverOpen, setPopoverOpen] = useState(false)

  const showPopoverBadge = useMemo(() => {
    return hideChargeOnlyVideos || filterMinDuration !== SpaceUploadVideoMinDuration.All
  }, [hideChargeOnlyVideos, filterMinDuration])

  const popoverTrigger = (
    <Popover
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

function PopoverContent({ refresh }: { refresh: RefreshFn | undefined }) {
  const { hideChargeOnlyVideos, filterMinDuration } = useSnapshot(spaceUploadStore)

  return (
    <div className={classes.wrapper}>
      <div className={classes.section}>
        <div className={classes.sectionTilte}>充电专属</div>
        <div className={classes.sectionContent}>
          <Checkbox
            className='ml-5px'
            checked={hideChargeOnlyVideos}
            onChange={(e) => {
              spaceUploadStore.setHideChargeOnlyVideos(e.target.checked)
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
        <div className={classes.sectionTilte}>最短时长</div>
        <div>
          <Radio.Group
            className='overflow-hidden [&_.ant-radio-button-wrapper]:px-7px'
            buttonStyle='solid'
            value={filterMinDuration}
            onChange={(v) => {
              spaceUploadStore.setFilterMinDuration(v.target.value)
              refresh?.()
            }}
          >
            {Object.values(SpaceUploadVideoMinDuration).map((k) => {
              const { label } = SpaceUploadVideoMinDurationConfig[k]
              return (
                <Radio.Button key={k} value={k}>
                  {label}
                </Radio.Button>
              )
            })}
          </Radio.Group>
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
