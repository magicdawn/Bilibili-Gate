import { useMemoizedFn, useUpdateEffect } from 'ahooks'
import { Button, InputNumber, Popover, Space, Tag } from 'antd'
import clsx from 'clsx'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { IconForDelete, IconForEdit } from '$modules/icon'

function normalizePresets(presets?: number[]) {
  if (!presets?.length) return []
  const list = presets.map((x) => Math.max(x, 0)).filter((x) => Number.isFinite(x))
  return [...new Set(list)]
}

export function splitDuration(numInSeconds: number) {
  return { minutes: Math.floor(numInSeconds / 60), seconds: numInSeconds % 60 }
}

export function durationDisplay(numInSeconds: number) {
  const { minutes, seconds } = splitDuration(numInSeconds)
  const [m, s] = [minutes, seconds].map((x) => x.toString().padStart(2, '0'))
  return `${m}:${s}`
}

type DurationInputClassNames = {
  numberInput?: string
  presetsWrapper?: string
  presetItem?: string
}

export function DurationInputEditing({
  value,
  onChange,
  disabled,
  presets,
  className,
  style,
  classNames,
}: {
  value?: number
  onChange?: (value?: number) => void
  disabled?: boolean
  presets?: number[]
  // styles
  className?: string
  style?: CSSProperties
  classNames?: DurationInputClassNames
}) {
  const val = useMemo(() => Math.max(0, value || 0), [value])
  const { minutes, seconds } = useMemo(() => {
    return {
      minutes: Math.floor(val / 60),
      seconds: val % 60,
    }
  }, [val])

  const triggerOnChange = useMemoizedFn((field: 'minutes' | 'seconds', num: number) => {
    const nextValue = field === 'minutes' ? num * 60 + seconds : minutes * 60 + num
    onChange?.(nextValue)
  })

  const normalizedPresets = useMemo(() => normalizePresets(presets), [presets])

  // cls
  const _className = useUnoMerge('inline-flex flex-col gap-y-6px', className)
  const _numberInputClassName = useUnoMerge('w-50px', classNames?.numberInput)
  const _presetsWrapperClassName = useUnoMerge('flex flex-wrap items-center gap-1', classNames?.presetsWrapper)
  const _presetItemClassName = useUnoMerge(
    'cursor-pointer select-none',
    disabled && 'cursor-not-allowed opacity-60',
    classNames?.presetItem,
  )

  return (
    <div className={_className} style={style}>
      <Space.Compact>
        <InputNumber
          size='small'
          value={minutes}
          min={0}
          step={1}
          disabled={disabled}
          className={_numberInputClassName}
          onChange={(next) => {
            if (typeof next !== 'number') return
            triggerOnChange('minutes', next)
          }}
        />
        <Space.Addon>分</Space.Addon>
        <InputNumber
          size='small'
          value={seconds}
          min={0}
          step={1}
          disabled={disabled}
          className={_numberInputClassName}
          onChange={(next) => {
            if (typeof next !== 'number') return
            triggerOnChange('seconds', next)
          }}
        />
        <Space.Addon>秒</Space.Addon>
      </Space.Compact>
      {normalizedPresets.length && (
        <div className={_presetsWrapperClassName}>
          {normalizedPresets.map((preset) => (
            <Tag
              key={preset}
              className={_presetItemClassName}
              onClick={() => {
                if (disabled) return
                onChange?.(preset)
              }}
            >
              {durationDisplay(preset)}
            </Tag>
          ))}
        </div>
      )}
    </div>
  )
}

export function PopoverDurationInput({
  parentOpen,
  title,
  value,
  onChange,
  disabled,
  presets,
  className,
  style,
  classNames,
}: {
  parentOpen?: boolean
  title?: ReactNode
  value?: number
  onChange?: (value?: number) => void
  disabled?: boolean
  presets?: number[]
  className?: string
  style?: CSSProperties
  classNames?: DurationInputClassNames & { popoverRoot?: string }
}) {
  const [open, setOpen] = useState(false)
  // sync with `parentOpen`
  useUpdateEffect(() => {
    if (parentOpen === false) {
      setOpen(false)
    }
  }, [parentOpen])

  const [draftValue, setDraftValue] = useState<number | undefined>(value)
  const hasValue = !!value
  const displayText = useMemo(() => (hasValue ? durationDisplay(value) : '未启用'), [value, hasValue])
  useEffect(() => {
    setDraftValue(value)
  }, [value, open])

  const handleReset = useMemoizedFn(() => {
    //
  })
  const handleCancel = useMemoizedFn(() => {
    setOpen(false)
  })
  const handleOk = useMemoizedFn(() => {
    setOpen(false)
    onChange?.(draftValue)
  })

  return (
    <>
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger='click'
        placement='top'
        content={
          <div className='inline-flex flex-col gap-y-8px'>
            {title && <p className='text-size-1.5em'>{title}</p>}
            <DurationInputEditing
              value={draftValue}
              disabled={disabled}
              presets={presets}
              onChange={setDraftValue}
              className={classNames?.popoverRoot}
              classNames={classNames}
            />
            <div className='flex justify-end gap-x-6px'>
              <Button size='small' onClick={handleCancel}>
                取消
              </Button>
              <Button size='small' type='primary' onClick={handleOk}>
                确定
              </Button>
            </div>
          </div>
        }
      >
        <Button
          size='small'
          variant={hasValue ? 'solid' : 'filled'}
          color={hasValue ? 'primary' : 'default'}
          disabled={disabled}
          className={clsx('min-w-70px flex-v-center gap-x-1 px-1', className)}
          style={style}
        >
          {displayText}
          <IconForEdit className='size-12px' />
        </Button>
      </Popover>
      {hasValue && (
        <Button className='icon-only-round-button size-20px'>
          <IconForDelete
            className='size-12px'
            onClick={() => {
              setDraftValue(undefined)
              onChange?.(undefined)
            }}
          />
        </Button>
      )}
    </>
  )
}
