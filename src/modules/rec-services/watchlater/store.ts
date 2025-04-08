import { proxy } from 'valtio'

const store = proxy({
  searchText: undefined as string | undefined,
})

export { store as watchlaterStore }
