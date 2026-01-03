import { css } from '@emotion/react'
import { Empty, Input } from 'antd'
import clsx from 'clsx'
import { uniq } from 'es-toolkit'
import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { borderColorValue } from '$components/css-vars'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { getUserNickname } from '$modules/bilibili/user/nickname'
import { parseUpRepresent } from '$modules/filter/parse'
import { formatSpaceUrl } from '$modules/rec-services/dynamic-feed/shared'
import {
  getNewestValueOfSettingsInnerArray,
  updateSettingsInnerArray,
  useSettingsInnerArray,
  type ListSettingsPath,
} from '$modules/settings'

const { Search } = Input

export function EditableListSettingItem({
  configPath,
  searchProps,
  disabled,
}: {
  configPath: ListSettingsPath
  searchProps?: ComponentProps<typeof Search>
  disabled?: boolean
}) {
  const rawList = useSettingsInnerArray(configPath)
  const list = useMemo(() => uniq(rawList).toReversed(), [rawList])

  return (
    <>
      <Search
        className='my-5px'
        enterButton='添加'
        allowClear
        disabled={disabled}
        {...searchProps}
        onSearch={async (val, e) => {
          if (!val) return

          // exists check
          const set = new Set(await getNewestValueOfSettingsInnerArray(configPath))
          if (set.has(val)) {
            antMessage.warning(`${val} 已存在`)
            return
          }

          // add
          await updateSettingsInnerArray(configPath, { add: [val] })

          // clear: 非受控组件, 有内部状态, 不能简单设置 input.value
          if (e?.target) {
            const el = e.target as HTMLElement
            const clearBtn = el.closest('.ant-input-wrapper')?.querySelector<HTMLElement>('.ant-input-clear-icon')
            clearBtn?.click()
          }
        }}
      />

      <div
        css={[
          css`
            min-height: 82px;
            border-radius: 6px;
            border: 1px solid ${borderColorValue};
            margin-top: 3px;
          `,
          disabled &&
            css`
              color: var(--ant-color-text-disabled);
              background-color: var(--ant-color-bg-container-disabled);
              border-color: var(--ant-color-border);
              box-shadow: none;
              opacity: 1;
              pointer-events: none;
              cursor: not-allowed;
            `,
        ]}
      >
        {list.length ? (
          <div className='max-h-250px flex flex-wrap items-start gap-x-10px gap-y-5px overflow-y-auto py-5px pl-5px pr-10px'>
            {list.map((t) => {
              return (
                <TagItemDisplay
                  key={t}
                  tag={t.toString()}
                  onDelete={async (tag) => {
                    await updateSettingsInnerArray(configPath, { remove: [tag] })
                  }}
                  renderTag={
                    configPath === 'filter.byAuthor.keywords' ? (tag) => <UpTagItemDisplay tag={tag} /> : undefined
                  }
                />
              )
            })}
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='空空如也' className='[&.ant-empty-normal]:my-5px' />
        )}
      </div>
    </>
  )
}

type TagItemDisplayProps = {
  tag: string
  renderTag?: (tag: string) => ReactNode
  onDelete?: (tag: string) => void
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>

export const TagItemDisplay = forwardRef<HTMLDivElement, TagItemDisplayProps>(
  ({ tag, renderTag, onDelete, className, ...restProps }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'relative inline-flex items-center b-1px b-gate-border rounded-5px b-solid px-6px py-2px hover:(b-gate-primary color-gate-primary)',
          className,
        )}
        {...restProps}
      >
        {renderTag ? renderTag(tag) : tag}
        <IconParkOutlineCloseSmall
          className='ml-2px size-16px cursor-pointer text-size-12px'
          onClick={() => {
            onDelete?.(tag)
          }}
        />
      </div>
    )
  },
)

function UpTagItemDisplay({ tag }: { tag: string }) {
  const { mid, remark } = useMemo(() => parseUpRepresent(tag), [tag])

  const [nicknameByMid, setNicknameByMid] = useState<string | undefined>(undefined)
  useEffect(() => {
    void (async () => {
      if (!mid) return
      const nickname = await getUserNickname(mid)
      if (nickname) setNicknameByMid(nickname)
    })()
  }, [mid])

  const label = mid
    ? //
      nicknameByMid || remark || mid
    : tag

  const tooltip = (
    <>
      {!!mid && (
        <>
          mid: {mid} <br />
        </>
      )}
      {!!remark && (
        <>
          备注: {remark} <br />
          {remark === nicknameByMid && (
            <>
              P.S "备注" 与 "用户昵称" 相同, 是之前的数据, 现在你只需要填写 mid, 会自动获取昵称 <br />
            </>
          )}
        </>
      )}
      {!mid && (
        <>
          使用用户名过滤: 用户可能改名, 建议使用 mid 过滤 <br />
        </>
      )}
    </>
  )

  return (
    <>
      <AntdTooltip title={tooltip}>
        <span className={clsx('inline-flex items-center justify-center', mid ? 'cursor-pointer' : 'cursor-[edit]')}>
          {mid && <IconRadixIconsPerson className='mr-2px size-12px' />}
          {mid ? (
            <a href={formatSpaceUrl(mid)} target='_blank' style={{ color: 'inherit' }}>
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
