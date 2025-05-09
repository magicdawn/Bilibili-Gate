/**
 * e.g https://api.bilibili.com/x/kv-frontend/namespace/data?appKey=333.1339&nscode=10&versionId=1745304745412
 */

import { request } from '$request'
import { reusePendingPromise } from '$utility/async'
import { getIdbCache, wrapWithIdbCache } from '$utility/idb'
import ms from 'ms'
import type { KvResponseData, KvResponseJson } from './kv-types'

async function fetchKvData({ appKey, nscode, versionId }: { appKey: string; nscode: number; versionId: string }) {
  const params = { appKey, nscode, versionId }
  const res = await request.get('/x/kv-frontend/namespace/data', { params })
  const json = res.data as KvResponseJson
  return json
}

function generateCacheKey({ appKey, nscode }: { appKey: string; nscode: number }) {
  return new URLSearchParams([
    ['appKey', appKey],
    ['nscode', nscode.toString()],
  ]).toString()
}

const kvVersionCache = getIdbCache<KvResponseData>('kv-latest-version')
const revalidateKvData = reusePendingPromise(
  async ({ appKey, nscode }: { appKey: string; nscode: number }): Promise<Record<string, string>> => {
    const cacheKey = generateCacheKey({ appKey, nscode })
    const entry = await kvVersionCache.get(cacheKey)

    let versionId = '0'
    if (entry && entry.versionId && entry.data && Object.keys(entry.data).length) {
      versionId = entry.versionId
    }
    const fetched = await fetchKvData({ appKey, nscode, versionId })

    // "code": -304, "message": "Not Modified"
    if (entry?.data && fetched.code === -304 && fetched.message === 'Not Modified') {
      return entry.data
    }

    await kvVersionCache.set(cacheKey, fetched.data)
    return fetched.data.data
  },
)

export const getKvData = wrapWithIdbCache({
  fn: revalidateKvData,
  tableName: 'get-kv-data',
  generateKey: ({ appKey, nscode }) => generateCacheKey({ appKey, nscode }),
  ttl: ms('1h'),
})

// example: getGroup(data, "channel_list")
export function getGroupFromKvRecord(data: Record<string, string> = {}, prefix: string) {
  if (!prefix.endsWith('.')) prefix += '.'
  const grouped: Record<string, string> = {}
  if (data) {
    Object.keys(data)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => {
        const key = k.slice(prefix.length)
        const val = data[k] || ''
        grouped[key] = val
      })
  }
  return grouped
}
