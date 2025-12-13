import { useSnapshot } from 'valtio'
import { settings } from '$modules/settings'

export enum EGridDisplayMode {
  NormalGrid = 'grid', // Normal grid
  // rest are PureRecommend only!
  List = 'list', // list
  TwoColumnGrid = 'two-column-grid', // 2 column grid
  CenterEmptyGrid = 'center-empty-grid', // center empty grid
}

export function gridDisplayModeChecker(x: EGridDisplayMode) {
  return {
    usingListMode: x === EGridDisplayMode.List,
    usingTwoColumnMode: x === EGridDisplayMode.TwoColumnGrid,
    usingCenterEmptyMode: x === EGridDisplayMode.CenterEmptyGrid,
  }
}

export function useGridDisplayModeChecker() {
  const { gridDisplayMode } = useSnapshot(settings.grid)
  return gridDisplayModeChecker(gridDisplayMode)
}

export function isDisplayAsList(displayMode: EGridDisplayMode | undefined) {
  return displayMode === EGridDisplayMode.List
}

export function useIsDisplayAsList() {
  return useSnapshot(settings.grid).gridDisplayMode === EGridDisplayMode.List
}
