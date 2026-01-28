import { Children, useMemo, type ReactElement, type ReactNode } from 'react'

export function useIsEmptyFragment(fragment: ReactElement<{ children?: ReactNode }>) {
  return useMemo(() => isEmptyFragment(fragment), [fragment])
}

export function isEmptyFragment(fragment: ReactElement<{ children?: ReactNode }>): boolean {
  const fragChildren = Children.toArray(fragment.props?.children) // toArray will omit Empty nodes (null, undefined, and Booleans)
  return !fragChildren.length
}
