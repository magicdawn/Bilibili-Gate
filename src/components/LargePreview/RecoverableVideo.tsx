import { useMemoizedFn, useMount } from 'ahooks'
import { forwardRef, useRef, type ComponentProps, type ComponentRef, type MutableRefObject } from 'react'
import { useMixedRef } from '$common/hooks/mixed-ref'
import { proxyWithGmStorage } from '$utility/valtio'

const store = await proxyWithGmStorage<{
  volume: number | undefined
  muted: boolean | undefined
}>(
  {
    volume: undefined, // A double values must fall between 0 and 1, where 0 is effectively muted and 1 is the loudest possible value.
    muted: undefined,
  },
  'large-preview-store',
)
export { store as largePreviewStore }

export const RecoverableVideo = forwardRef<
  ComponentRef<'video'>,
  ComponentProps<'video'> & { currentTimeRef: MutableRefObject<number | undefined> }
>(({ currentTimeRef, ...videoProps }, forwardedRef) => {
  const ref = useMixedRef<ComponentRef<'video'> | null>(forwardedRef)
  const mountedRef = useRef(false)

  useMount(() => {
    if (ref.current) {
      // set initial time
      if (typeof currentTimeRef.current === 'number') {
        ref.current.currentTime = currentTimeRef.current
      }
      // set initial volume & muted
      if (typeof store.volume === 'number') {
        ref.current.volume = store.volume
      }
      if (typeof store.muted === 'boolean') {
        ref.current.muted = store.muted
      }
    }
    mountedRef.current = true
  })

  const onTimeUpdate = useMemoizedFn(() => {
    if (!mountedRef.current) return
    currentTimeRef.current = ref.current?.currentTime
  })

  const onVolumeChange = useMemoizedFn(() => {
    if (!mountedRef.current) return
    if (!ref.current) return
    // persist values
    store.volume = ref.current.volume
    store.muted = ref.current.muted
  })

  return <video ref={ref} {...videoProps} onTimeUpdate={onTimeUpdate} onVolumeChange={onVolumeChange} />
})
