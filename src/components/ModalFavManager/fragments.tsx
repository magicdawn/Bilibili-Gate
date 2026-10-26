import { Button, Popover, type ButtonProps } from 'antd'
import { useState, type ComponentProps } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { antMessage } from '$modules/antd'
import { IconForPlus } from '$modules/icon'
import { NewFavFolderPopover } from './fav-folder-popovers'

export function NewFavFolderButton({
  buttonProps,
  iconClassname,
  onCreateNewSuccess,
}: {
  buttonProps?: Partial<ButtonProps>
  iconClassname?: string
  onCreateNewSuccess?: ComponentProps<typeof NewFavFolderPopover>['onCreateNewSuccess']
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      trigger='click'
      open={open}
      onOpenChange={setOpen}
      content={
        <NewFavFolderPopover
          onClosePopover={() => setOpen(false)}
          onCreateNewSuccess={(newFolderId, newFolderTitle, newFolder) => {
            antMessage.success(`已创建收藏夹: ${newFolderTitle}`)
            return onCreateNewSuccess?.(newFolderId, newFolderTitle, newFolder)
          }}
        />
      }
    >
      <Button size='small' {...buttonProps} className={useUnoMerge('gap-x-1', buttonProps?.className)}>
        <IconForPlus className={useUnoMerge('size-1em', iconClassname)} />
        新建收藏夹
      </Button>
    </Popover>
  )
}
