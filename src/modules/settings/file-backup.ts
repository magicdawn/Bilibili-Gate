import dayjs from 'dayjs'
import { attempt, trim } from 'es-toolkit'
import ms from 'ms'
import { APP_NAME } from '$common'
import { toastAndReload } from '$components/ModalSettings/index.shared'
import { antMessage } from '$modules/antd'
import toast from '$utility/toast'
import {
  allowedLeafSettingsPaths,
  loadSettingsFromGmStorage,
  pickSettings,
  runSettingsMigration,
  updateSettings,
  type LeafSettingsPath,
  type Settings,
} from './index'
import { set_HAS_RESTORED_SETTINGS } from './restore-flag'
import type { PartialDeep } from 'type-fest'

export class ObjectUrl {
  public url: string | undefined
  public revokeTimer: number | undefined
  constructor(obj: Blob, delay: number = ms('10min')) {
    this.url = URL.createObjectURL(obj)
    this.revokeTimer = setTimeout(this.revoke, delay)
  }
  revoke = () => {
    if (this.revokeTimer !== undefined) clearTimeout(this.revokeTimer)
    this.revokeTimer = undefined
    if (this.url) attempt(() => URL.revokeObjectURL(this.url!))
    this.url = undefined
  }
}

let lastObjectUrl: ObjectUrl | undefined
async function genUrl(paths: LeafSettingsPath[] | undefined) {
  const fullSettings = await loadSettingsFromGmStorage()
  const val = paths?.length ? pickSettings(fullSettings, paths).pickedSettings : fullSettings
  const json = JSON.stringify(val, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  lastObjectUrl?.revoke()
  lastObjectUrl = new ObjectUrl(blob)
  return lastObjectUrl.url!
}

export async function exportSettings(paths?: LeafSettingsPath[], moduleLabel?: string) {
  const url = await genUrl(paths)
  const prefix = [APP_NAME, trim(moduleLabel || '', ['-', ' ']), 'settings'].filter(Boolean).join('-')
  const filename = `${prefix} ${dayjs().format('YYYY-MM-DD HH:mm:ss')}.json`
  if (typeof GM_download !== 'undefined') {
    GM_download?.({ url, name: filename })
  } else {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }
}

export async function chooseFileForImportSettings() {
  const file = await chooseSingleJsonFile()
  if (!file) return

  const text = await file.text()
  if (!text) return toast('文件内容为空!')

  let settingsFromFile: PartialDeep<Settings>
  try {
    settingsFromFile = JSON.parse(text) as PartialDeep<Settings>
  } catch {
    return toast('无法解析文件内容!')
  }

  runSettingsMigration(settingsFromFile)
  return settingsFromFile
}

export async function importSettings() {
  const settingsFromFile = await chooseFileForImportSettings()
  if (!settingsFromFile) return

  const { pickedPaths, pickedSettings: importedSettings } = pickSettings(settingsFromFile, allowedLeafSettingsPaths)
  if (!pickedPaths.length) return toast('没有有效的设置!')

  {
    const keys = Object.keys(importedSettings)
    if (keys.length === 1) {
      if (keys[0] === 'filter') return toast('过滤相关数据请使用「内容过滤」内独立的导入导出功能!', 5000)
      return toast('异常数据', 5000)
    }
  }

  set_HAS_RESTORED_SETTINGS(true)
  updateSettings(importedSettings)
  antMessage.success('导入成功!')
  return toastAndReload()
}

function chooseSingleJsonFile() {
  return chooseFile({
    accept: '.json',
    multiple: false,
  })
}

function chooseFile(options: Partial<HTMLInputElement>) {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    Object.assign(input, options)
    input.addEventListener('change', () => {
      resolve(input.files?.[0] || null)
    })
    input.click()
  })
}
