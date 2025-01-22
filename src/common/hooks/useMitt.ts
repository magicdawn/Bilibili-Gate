import { useMemoizedFn } from 'ahooks'
import type { Emitter, EventType, Handler } from 'mitt'

export function useMittOn<Events extends Record<EventType, unknown>, Key extends keyof Events>(
  emitter: Emitter<Events>,
  type: Key,
  handler: Handler<Events[Key]>,
) {
  const fn = useMemoizedFn(handler)
  useEffect(() => {
    // console.log('mitt re-add')
    emitter.on(type, fn)
    return () => {
      emitter.off(type, fn)
    }
  }, [emitter, type])
}
