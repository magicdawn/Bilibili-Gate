import { useMixedRef } from '$common/hooks/mixed-ref'
import type { ComponentProps, ComponentRef, MutableRefObject } from 'react'
import { largePreviewStore } from '../use/useLargePreview'

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
      if (typeof largePreviewStore.volume === 'number') {
        ref.current.volume = largePreviewStore.volume
      }
      if (typeof largePreviewStore.muted === 'boolean') {
        ref.current.muted = largePreviewStore.muted
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
    largePreviewStore.volume = ref.current.volume
    largePreviewStore.muted = ref.current.muted
  })

  return (
    <video ref={ref} {...videoProps} onTimeUpdate={onTimeUpdate} onVolumeChange={onVolumeChange} />
  )
})
