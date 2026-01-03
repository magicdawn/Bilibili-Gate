export {}

declare module 'valtio' {
  export type UseSnapshotOptions = { sync?: boolean }
  function useSnapshot<T extends object>(p: T, options?: UseSnapshotOptions): T
}

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
