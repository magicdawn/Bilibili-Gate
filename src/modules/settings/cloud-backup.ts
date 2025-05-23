import { isEqual, throttle } from 'es-toolkit'
import ms from 'ms'
import { articleDraft, debug, getBackupOmitPaths } from './index.shared'
import { HAS_RESTORED_SETTINGS } from './restore-flag'
import { allowedLeafSettingsPaths, pickSettings, type Settings } from '.'
import type { PartialDeep, ReadonlyDeep } from 'type-fest'

let lastBackupVal: PartialDeep<Settings> | undefined
const setDataThrottled = throttle(articleDraft.setData, ms('5s'))

export async function saveToDraft(val: ReadonlyDeep<PartialDeep<Settings>>) {
  if (!val.backupSettingsToArticleDraft) return
  if (HAS_RESTORED_SETTINGS) return // skip when `HAS_RESTORED_SETTINGS=true`

  const { pickedSettings: currentBackupVal } = pickSettings(val, allowedLeafSettingsPaths, getBackupOmitPaths())
  const shouldBackup = !lastBackupVal || !isEqual(lastBackupVal, currentBackupVal)
  if (!shouldBackup) return

  try {
    await setDataThrottled(currentBackupVal)
    lastBackupVal = currentBackupVal
    debug('backup to article draft complete')
  } catch (e: any) {
    console.error(e.stack || e)
  }
}
