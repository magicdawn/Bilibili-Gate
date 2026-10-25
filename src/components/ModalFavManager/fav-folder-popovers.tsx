import { useMemoizedFn, useRequest } from 'ahooks'
import { Button, Input } from 'antd'
import { useState, type ComponentRef, type Ref } from 'react'
import { antMessage } from '$modules/antd'
import { createNewFavFolder, renameFavFolder } from '$modules/rec-services/fav/api'
import { favStore } from '$modules/rec-services/fav/store'
import type { NewFavFolderResponseJson } from '$components/ModalFavManager/types/new-fav-folder.api'

export function RenameFavFolderPopover({
  folderId,
  currentFolderTitle,
  onClosePopover,
  ref,
}: {
  folderId: number
  currentFolderTitle: string
  onClosePopover: () => void
  ref?: Ref<ComponentRef<'div'>>
}) {
  const $req = useRequest((newTitle: string) => renameFavFolder(folderId, newTitle), { manual: true })

  const [folderTitle, setFolderTitle] = useState<string>(currentFolderTitle)
  const handleSubmit = useMemoizedFn(async () => {
    const newTitle = folderTitle.trim()
    if (!newTitle) return antMessage.error('收藏夹名称不能为空!')
    if (newTitle === currentFolderTitle) return antMessage.warning('无变更!')

    const result = await $req.runAsync(newTitle)
    if (result.isErr()) {
      const msg = typeof result.error === 'string' ? result.error : result.error.message
      return antMessage.error(msg)
    }

    onClosePopover()
    // refresh UI state
    const folder = favStore.folders.find((f) => f.id === folderId)
    if (folder) folder.title = folderTitle
  })

  return (
    <div className='flex flex-col gap-y-2' ref={ref}>
      <div>重命名收藏夹</div>
      <Input
        placeholder='收藏夹名称'
        value={folderTitle}
        onChange={(e) => setFolderTitle(e.target.value)}
        onPressEnter={handleSubmit}
      />
      <div className='flex justify-end gap-x-2'>
        <Button onClick={onClosePopover}>取消</Button>
        <Button
          type='primary'
          loading={$req.loading}
          onClick={handleSubmit}
          disabled={!folderTitle || folderTitle === currentFolderTitle}
        >
          确定
        </Button>
      </div>
    </div>
  )
}

export function NewFavFolderPopover({
  onClosePopover,
  onCreateNewSuccess,
}: {
  onClosePopover: () => void
  onCreateNewSuccess?: (
    newFolderId: number,
    newFolderTitle: string,
    newFolder: NewFavFolderResponseJson['data'],
  ) => void | Promise<void>
}) {
  const [folderTitle, setFolderTitle] = useState<string>('')

  const $req = useRequest((title: string) => createNewFavFolder({ title }), { manual: true })

  const handleSubmit = useMemoizedFn(async () => {
    const title = folderTitle.trim()
    if (!title) return antMessage.error('收藏夹名称不能为空!')

    const result = await $req.runAsync(title)
    if (result.isErr()) {
      const msg = typeof result.error === 'string' ? result.error : result.error.message
      return antMessage.error(msg)
    }

    onClosePopover()
    setFolderTitle('')
    const newFolder = result.value
    if (newFolder) {
      await onCreateNewSuccess?.(newFolder.id, newFolder.title, newFolder)
    }
  })

  return (
    <div className='flex flex-col gap-y-2'>
      <div>新建收藏夹</div>
      <Input
        placeholder='收藏夹名称'
        value={folderTitle}
        onChange={(e) => setFolderTitle(e.target.value)}
        onPressEnter={handleSubmit}
      />
      <div className='flex justify-end gap-x-2'>
        <Button onClick={onClosePopover}>取消</Button>
        <Button type='primary' loading={$req.loading} onClick={handleSubmit} disabled={!folderTitle}>
          确定
        </Button>
      </div>
    </div>
  )
}
