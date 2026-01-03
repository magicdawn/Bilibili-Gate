import dayjs from 'dayjs'
import { memo, useMemo } from 'react'
import { valtioFactory } from '$utility/valtio'
import { formatRecentTimeStamp, isRecentTimeStamp } from '$utility/video'

const $now = valtioFactory(() => Date.now())
// update every half minute
const firstTimeout = (dayjs().add(1, 'minute').startOf('minute').valueOf() - $now.get()) % 30_000
setTimeout(() => {
  $now.update()
  setInterval($now.update, 30_000)
}, firstTimeout)
// update when switch tab back
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return
  $now.update()
})

export const UnixTsDisplay = memo(function UnixTsDisplay({ ts }: { ts: number | undefined }) {
  if (!ts) return null
  return isRecentTimeStamp(ts) ? <ReactiveImpl ts={ts} /> : <PlainImpl ts={ts} />
})

function PlainImpl({ ts }: { ts: number }) {
  return useMemo(() => formatRecentTimeStamp(ts, true), [ts])
}

function ReactiveImpl({ ts }: { ts: number }) {
  const now = $now.use()
  return <PlainImpl ts={ts} key={now} />
}
