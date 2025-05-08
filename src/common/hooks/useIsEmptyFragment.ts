import { Children, type ReactElement } from 'react'

export function useIsEmptyFragment(fragment: ReactElement) {
  return useMemo(() => isEmptyFragment(fragment), [fragment])
}

export function isEmptyFragment(fragment: ReactElement): boolean {
  const fragChildren = Children.toArray(fragment.props.children) // toArray will omit Empty nodes (null, undefined, and Booleans)
  return !fragChildren.length
}
