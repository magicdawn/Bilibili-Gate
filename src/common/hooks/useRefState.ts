/**
 * useState + a ref
 *
 * https://github.com/alibaba/hooks/pull/2348#issuecomment-1794002832
 * 还没有合并, 这里简单实现一下, signature 与 useGetState 一致
 */

export function useRefState<T>(initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(initialValue)

  const ref = useRef(state)

  const setStateWraped: typeof setState = useCallback(
    (payload) => {
      const nextState = typeof payload === 'function' ? (payload as (prev: T) => T)(ref.current) : payload
      ref.current = nextState
      setState(nextState)
    },
    [setState],
  )

  const getState = useCallback(() => ref.current, [])

  return [state, setStateWraped, getState] as const
}

export type RefStateBox<T> = ReturnType<typeof useRefStateBox<T>>
export function useRefStateBox<T>(initialValue: T | (() => T)) {
  const [state, set, get] = useRefState(initialValue)
  const box = useMemo(
    () => ({
      state, // use state in render, other case use `.val`
      get,
      set,
      get val() {
        return get()
      },
      set val(newValue) {
        set(newValue)
      },
    }),
    [get, set],
  )
  box.state = state // latest state
  return box
}

export type RefBox<T> = ReturnType<typeof useRefBox<T>>
export function useRefBox<T>(initialValue: T) {
  const ref = useRef(initialValue)
  const get = useCallback(() => ref.current, [])
  const set = useCallback((newValue: T) => (ref.current = newValue), [])
  return useMemo(
    () => ({
      get,
      set,
      get val() {
        return get()
      },
      set val(newValue: T) {
        set(newValue)
      },
    }),
    [get, set],
  )
}
