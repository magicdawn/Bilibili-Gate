import { useHotkey } from '@tanstack/react-hotkeys'
import { useUnmount } from 'ahooks'
import { Button, Popover, type ButtonProps } from 'antd'
import { useState, type ComponentProps, type Dispatch, type SetStateAction } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { antMessage } from '$modules/antd'
import { IconForPlus } from '$modules/icon'
import { NewFavFolderPopover } from './fav-folder-popovers'

export function NewFavFolderButton({
  popoverOpenState,
  buttonProps,
  iconClassname,
  onCreateNewSuccess,
}: {
  popoverOpenState?: [boolean, Dispatch<SetStateAction<boolean>>]
  buttonProps?: Partial<ButtonProps>
  iconClassname?: string
  onCreateNewSuccess?: ComponentProps<typeof NewFavFolderPopover>['onCreateNewSuccess']
}) {
  const localOpenState = useState(false)
  const [open, setOpen] = popoverOpenState ?? localOpenState

  // handle close: trigger='click' 会自动处理 click away
  useUnmount(() => setOpen(false))
  useHotkey('Escape', () => setOpen(false), { conflictBehavior: 'allow' })

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
