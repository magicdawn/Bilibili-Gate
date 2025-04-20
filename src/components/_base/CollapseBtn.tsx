import { css } from '@emotion/react'
import { useToggle } from 'ahooks'
import type { Actions } from 'ahooks/lib/useToggle'
import { Button } from 'antd'

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
      <IconParkOutlineRight
        css={[
          css`
            width: 13px;
            height: 13px;
            transform: rotateZ(180deg);
          `,
          buttonsExpanded &&
            css`
              transform: rotateZ(0deg);
            `,
        ]}
      />
    </Button>
  )

  return (
    <>
      {btn}
      {buttonsExpanded && children}
    </>
  )
})
