import Emittery from 'emittery'

export type GridEmitterEvents = {
  // for VideoCard, shared
  'mouseenter': string
  'show-large-preview': string
  'remove-cards': [uniqIds: string[], titles?: string[], silent?: boolean]
  // for grid
  'refresh': boolean | undefined
}

export type GridEmitter = Emittery<GridEmitterEvents>

export function createGridEmitter() {
  return new Emittery<GridEmitterEvents>()
}

export const gridDefaultEmitter = createGridEmitter()
