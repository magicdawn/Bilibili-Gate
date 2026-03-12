import { useMemoizedFn } from 'ahooks'
import { useEffect } from 'react'
import type Emittery from 'emittery'

export function useEmitterOn<EventData, Name extends keyof EventData>(
  emitter: Emittery<EventData>,
  type: Name,
  handler: Parameters<typeof emitter.on<Name>>[1],
) {
  const fn = useMemoizedFn(handler)
  useEffect(() => {
    // console.log('emittery re-add')
    const unsubscribe = emitter.on(type, fn)
    return unsubscribe
  }, [emitter, type, fn])
}
