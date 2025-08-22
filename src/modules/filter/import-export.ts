import { attempt, attemptAsync, difference } from 'es-toolkit'
import { APP_NAME } from '$common'
import { antMessage } from '$modules/antd'
import {
  getNewestValueOfSettingsInnerArray,
  getSettingsSnapshot,
  updateSettingsInnerArray,
  type ListSettingsPath,
} from '$modules/settings'

export function exportFilterByAuthor() {
  const key = getJsonKey('filter.byAuthor.keywords')
  const val = getSettingsSnapshot().filter.byAuthor.keywords
  GM.setClipboard(JSON.stringify({ [key]: val }, null, 2))
  antMessage.success('已复制到剪贴板!')
}
export function importFilterByAuthor() {
  return _importForPath('filter.byAuthor.keywords')
}

export function exportFilterByTitle() {
  const key = getJsonKey('filter.byTitle.keywords')
  const val = getSettingsSnapshot().filter.byTitle.keywords
  GM.setClipboard(JSON.stringify({ [key]: val }, null, 2))
  antMessage.success('已复制到剪贴板!')
}
export function importFilterByTitle() {
  return _importForPath('filter.byTitle.keywords')
}

// 一个奇怪的 json key, 减少其他内容的干扰
function getJsonKey(p: ListSettingsPath) {
  return `__${APP_NAME}:${p}__`
}

async function _importForPath(listSettingsPath: ListSettingsPath) {
  const [err, text] = await attemptAsync(() => navigator.clipboard.readText())
  if (err) return antMessage.error('读取剪贴板失败!')
  if (!text) return antMessage.error('剪贴板内容为空!')

  const [errJson, json] = attempt(() => JSON.parse(text))
  if (errJson) return antMessage.error('无法解析剪贴板内容!')
  if (!json) return antMessage.error('剪贴板内容为空!')

  const key = getJsonKey(listSettingsPath)
  const val = (json as any)?.[key] as string[] | undefined
  if (!val?.length) return antMessage.error('没有符合条件的数据!')

  const currentList = await getNewestValueOfSettingsInnerArray(listSettingsPath)
  const toAdd = difference(val, currentList)
  if (!toAdd.length) return antMessage.warning('没有可导入内容, 已全部存在!')

  updateSettingsInnerArray(listSettingsPath, { add: toAdd })
  antMessage.success(`已导入 ${toAdd.length} 条数据!`)
}
