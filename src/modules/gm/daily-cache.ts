import dayjs from 'dayjs'

const genDate = () => dayjs().format('YYYY-MM-DD')

export function dailyCache<T>(namespace: string) {
  async function cleanUp() {
    const date = genDate()
    const keys = await GM.listValues()
    keys.filter((k) => k.startsWith(namespace + ':') && k !== namespace + ':' + date).forEach((k) => GM.deleteValue(k))
  }

  // cleanup for first time
  cleanUp()

  return {
    async set(val: T) {
      cleanUp()
      await GM.setValue(namespace + ':' + genDate(), val)
    },
    async get(): Promise<T | undefined> {
      cleanUp()
      return GM.getValue(namespace + ':' + genDate())
    },
  }
}
