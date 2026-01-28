import { useToggle } from 'ahooks'
import { Button } from 'antd'
import clsx from 'clsx'
import { useImperativeHandle, type ReactNode, type Ref } from 'react'
import type { Actions } from 'ahooks/lib/useToggle'

export type CollapseBtnRef = Actions<boolean>

interface CollapseBtnProps {
  children: ReactNode
  initialOpen?: boolean
  ref?: Ref<CollapseBtnRef>
}

export function CollapseBtn({ children, initialOpen = false, ref }: CollapseBtnProps) {
  const [buttonsExpanded, buttonsExpandedActions] = useToggle(initialOpen)

  useImperativeHandle(ref, () => buttonsExpandedActions, [buttonsExpandedActions])

  const btn = (
    <Button onClick={buttonsExpandedActions.toggle} className='icon-only-round-button'>
      <IconParkOutlineRight className={clsx('size-13px', buttonsExpanded ? 'rotate-z-0' : 'rotate-z-180deg')} />
    </Button>
  )

  return (
    <>
      {btn}
      {buttonsExpanded && children}
    </>
  )
}
