import clsx from 'clsx'
import type { ComponentProps, ComponentType } from 'react'

export const NestedTitleHelper = {
  buildTitle(parentTitle: string, title: string) {
    return `【${parentTitle}】· ${title}`
  },

  buildTitleReactNode(ParentIcon: ComponentType<ComponentProps<'svg'>>, parentTitle: string, title: string) {
    const iconInTitleStyle = { display: 'inline-block', verticalAlign: 'middle', marginRight: '4px', marginTop: '-2px' }
    const fillWithColorPrimary = '[&_path]:fill-gate-primary'
    const icon = <ParentIcon className={clsx('size-15px', fillWithColorPrimary)} style={iconInTitleStyle} />
    return (
      <>
        【{icon}
        {parentTitle}】· {title}
      </>
    )
  },
}
