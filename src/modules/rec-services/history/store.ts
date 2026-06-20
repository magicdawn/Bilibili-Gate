import { proxyWithGmStorage } from '$utility/valtio'
import { EHistoryDeviceType, EHistoryItemType } from './enums'

const store = await proxyWithGmStorage(
  {
    itemType: EHistoryItemType.ALL,
    deviceType: EHistoryDeviceType.ALL,
    searchText: undefined as string | undefined,
  },
  'history-store',
)

export { store as historyStore }
