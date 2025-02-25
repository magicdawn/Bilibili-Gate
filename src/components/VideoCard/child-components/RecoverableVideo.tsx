import { useMixedRef } from '$common/hooks/mixed-ref'
import type { ComponentProps, ComponentRef, MutableRefObject } from 'react'
import { largePreviewStore } from '../use/useLargePreview'

export const RecoverableVideo = forwardRef<
  ComponentRef<'video'>,
  ComponentProps<'video'> & { currentTimeRef: MutableRefObject<number | undefined> }
>(({ currentTimeRef, ...videoProps }, forwardedRef) => {
  const ref = useMixedRef<ComponentRef<'video'> | null>(forwardedRef)
  const mounted = useRef(false)

  useMount(() => {
    // set initial time
    if (ref.current && typeof currentTimeRef.current === 'number') {
      ref.current.currentTime = currentTimeRef.current
    }
    // set initial volume
    if (ref.current && typeof largePreviewStore.volume === 'number') {
      ref.current.volume = largePreviewStore.volume
    }
    mounted.current = true
  })

  const onTimeUpdate = useMemoizedFn(() => {
    if (!mounted.current) return
    currentTimeRef.current = ref.current?.currentTime
  })

  const onVolumeChange = useMemoizedFn(() => {
    if (!mounted.current) return
    if (typeof ref.current?.volume === 'number') {
      largePreviewStore.volume = ref.current.volume
    }
  })

  return (
    <video ref={ref} {...videoProps} onTimeUpdate={onTimeUpdate} onVolumeChange={onVolumeChange} />
  )
})
