import { useMemoizedFn } from 'ahooks'
import type Emittery from 'emittery'

export function useEmitterOn<EventData, Event extends keyof EventData>(
  emitter: Emittery<EventData>,
  type: Event,
  handler: (eventData: EventData[Event]) => void | Promise<void>,
) {
  const fn = useMemoizedFn(handler)
  useEffect(() => {
    // console.log('emittery re-add')
    emitter.on(type, fn)
    return () => {
      emitter.off(type, fn)
    }
  }, [emitter, type])
}
