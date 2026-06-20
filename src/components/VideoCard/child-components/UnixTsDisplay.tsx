import dayjs from 'dayjs'
import { memo, useMemo } from 'react'
import { valtioFactory } from '$utility/valtio'
import { formatRecentTimestamp, isRecentTimestamp } from '$utility/video'

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

export const UnixTsDisplay = memo(function UnixTsDisplay({
  ts,
  includeTime,
}: {
  ts: number | undefined
  includeTime?: boolean
}) {
  if (!ts) return null
  return isRecentTimestamp(ts) ? (
    <ReactiveImpl ts={ts} includeTime={includeTime} />
  ) : (
    <PlainImpl ts={ts} includeTime={includeTime} />
  )
})

function PlainImpl({ ts, includeTime }: { ts: number; includeTime?: boolean }) {
  return useMemo(() => formatRecentTimestamp(ts, true, includeTime ?? false), [ts])
}

function ReactiveImpl({ ts, includeTime }: { ts: number; includeTime?: boolean }) {
  const now = $now.use()
  return <PlainImpl ts={ts} key={now} includeTime={includeTime} />
}
