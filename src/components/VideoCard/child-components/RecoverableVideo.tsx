import { useMixedRef } from '$common/hooks/mixed-ref'
import { useEventListener } from 'ahooks'
import type { ComponentProps, ComponentRef, MutableRefObject } from 'react'

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
    mounted.current = true
  })

  useEventListener(
    'timeupdate',
    () => {
      if (!mounted.current) return
      currentTimeRef.current = ref.current?.currentTime
    },
    { target: ref },
  )

  return <video {...videoProps} ref={ref} />
})
