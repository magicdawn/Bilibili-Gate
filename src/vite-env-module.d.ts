export {}

declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T
}

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
