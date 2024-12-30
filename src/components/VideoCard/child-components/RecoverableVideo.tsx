import { useEventListener, useUnmount } from 'ahooks'
import type { ComponentProps, ComponentRef, MutableRefObject } from 'react'

export const RecoverableVideo = forwardRef<
  ComponentRef<'video'>,
  ComponentProps<'video'> & { currentTimeRef: MutableRefObject<number | undefined> }
>(({ currentTimeRef, ...videoProps }, forwardRef) => {
  const ref = useRef<ComponentRef<'video'>>(null)

  const syncForwardedRef = () => {
    forwardRef &&
      (typeof forwardRef === 'function'
        ? forwardRef(ref.current)
        : (forwardRef.current = ref.current))
  }

  const mounted = useRef(false)

  useMount(() => {
    syncForwardedRef()

    // set initial time
    if (ref.current && typeof currentTimeRef.current === 'number') {
      ref.current.currentTime = currentTimeRef.current
    }

    mounted.current = true
  })

  useUnmount(() => {
    syncForwardedRef()
  })

  useEventListener(
    'timeupdate',
    () => {
      if (!mounted.current) return
      currentTimeRef.current = ref.current?.currentTime
    },
    { target: ref },
  )

  return <video ref={ref} {...videoProps} />
})
