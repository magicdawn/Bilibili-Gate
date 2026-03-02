import { difference, isEqual, isNil, uniq } from 'es-toolkit'
import { get } from 'es-toolkit/compat'
import { antMessage } from '$modules/antd'
import {
  allowedLeafSettingsPaths,
  loadSettingsFromGmStorage,
  pickSettings,
  updateSettings,
  type ListSettingsPath,
} from '$modules/settings'
import { chooseFileForImportSettings, exportSettings } from '$modules/settings/file-backup'
import toast from '$utility/toast'

type ListFilterSettingPath = Extract<ListSettingsPath, `filter.${string}`>
const LIST_FILTER_SETTING_PATHS = [
  'filter.byAuthor.keywords',
  'filter.byTitle.keywords',
  'filter.dfByTitle.keywords',
  'filter.dfHideOpusMids.keywords',
] as const satisfies ListFilterSettingPath[]

const ALL_FILTER_SETTING_PATHS = allowedLeafSettingsPaths.filter((p) => p.startsWith('filter.'))

const NONE_LIST_FILTER_SETTING_PATHS = difference(ALL_FILTER_SETTING_PATHS, LIST_FILTER_SETTING_PATHS)

export async function exportFilterSettings() {
  const settings = await loadSettingsFromGmStorage()
  const listEntryCount = LIST_FILTER_SETTING_PATHS.reduce(
    (count, path) => count + (get(settings, path)?.length ?? 0),
    0,
  )
  if (!listEntryCount) antMessage.warning('列表数据为空!')
  await exportSettings(ALL_FILTER_SETTING_PATHS, 'filter')
}

export async function importFilterSettings() {
  const settingsFromFile = await chooseFileForImportSettings()
  if (!settingsFromFile) return

  const { pickedPaths, pickedSettings: importedSettings } = pickSettings(settingsFromFile, ALL_FILTER_SETTING_PATHS)
  if (!pickedPaths.length) return toast('没有有效的设置!')

  // 没有可导入内容, 已全部存在
  const existingSettings = await loadSettingsFromGmStorage()
  const hasSomethingToImport = (() => {
    if (
      NONE_LIST_FILTER_SETTING_PATHS.some((path) => {
        const imported = get(importedSettings, path)
        const existing = get(existingSettings, path)
        if (isNil(imported) || isEqual(imported, existing)) return
        return true
      })
    ) {
      return true
    }
    if (
      LIST_FILTER_SETTING_PATHS.some((path) => {
        const importedArr = get(importedSettings, path)
        const existingArr = get(existingSettings, path) ?? []
        if (!importedArr?.length) return

        const toAdd = difference(importedArr, existingArr)
        if (!toAdd.length) return

        return true
      })
    ) {
      return true
    }
    return false
  })()
  if (!hasSomethingToImport) return toast('没有可导入内容, 导入内容与现有设置相同!', 5000)

  let noneListEntryImported = 0
  let listEntryImported = 0
  NONE_LIST_FILTER_SETTING_PATHS.forEach((path) => {
    const imported = get(importedSettings, path)
    const existing = get(existingSettings, path)
    if (isNil(imported) || isEqual(imported, existing)) return
    updateSettings({ [path]: imported })
    noneListEntryImported += 1
  })
  LIST_FILTER_SETTING_PATHS.forEach((path) => {
    const importedArr = get(importedSettings, path)
    const existingArr = get(existingSettings, path) ?? []
    if (!importedArr?.length) return

    const toAdd = difference(importedArr, existingArr)
    if (!toAdd.length) return

    updateSettings({ [path]: uniq([...existingArr, ...toAdd]) })
    listEntryImported += toAdd.length
  })
  antMessage.success(`已导入 ${noneListEntryImported} 条常规数据, ${listEntryImported} 条列表数据!`)
}
