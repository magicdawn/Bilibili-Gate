import { useToggle } from 'ahooks'
import { Button } from 'antd'
import type { Actions } from 'ahooks/lib/useToggle'

interface IProps {
  children: ReactNode
  initialOpen?: boolean
}

export type CollapseBtnRef = Actions<boolean>

export const CollapseBtn = forwardRef<CollapseBtnRef, IProps>(function CollapseBtn(
  { children, initialOpen = false }: IProps,
  ref,
) {
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
})
