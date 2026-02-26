import { IN_BILIBILI_MAIN } from '$common'

export const IN_BILIBILI_VIDEO_PLAY_PAGE =
  IN_BILIBILI_MAIN &&
  ['/video/', '/list/watchlater', '/bangumi/play/'].some((prefix) => location.pathname.startsWith(prefix))

const handlers: Array<[prefix: string, handler: () => string | undefined]> = [
  [
    '/video/',
    () => {
      return /^\/video\/(?<bvid>BV\w+)\/?/.exec(location.pathname)?.groups?.bvid
    },
  ],
  [
    '/list/watchlater',
    () => {
      return new URLSearchParams(location.search).get('bvid') || undefined
    },
  ],
  [
    '/bangumi/play/',
    () => {
      return undefined
    },
  ],
]

export function getCurrentPageBvid() {
  const config = handlers.find(([prefix]) => location.pathname.startsWith(prefix))
  return config?.[1]()
}
