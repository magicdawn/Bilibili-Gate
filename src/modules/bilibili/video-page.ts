/**
 * copy from https://github.com/FoundTheWOUT/Bilibili-Evolved/blob/55903e8/src/core/observer.ts
 * with modification
 */

import { IN_BILIBILI_VIDEO_PLAY_PAGE } from '$common'
import { poll } from '$utility/dom'
import { isNil, once } from 'es-toolkit'
import mitt from 'mitt'
import ms from 'ms'

const getWin = () => (typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis) as any

const getId = () => ({
  aid: getWin().aid as string,
  cid: getWin().cid as string,
})

const emitter = mitt<{ videoChange: ReturnType<typeof getId> }>()

const listenCidChange = once((initialCid: string) => {
  let lastCid = initialCid

  const checkCidChange = () => {
    const { cid: newCid } = getId()
    // b 站代码的神秘行为, 在更换 cid 时会临时改成一个数组, 做监听要忽略这种值
    if (Array.isArray(newCid)) {
      return
    }
    if (lastCid !== newCid && !isNil(newCid)) {
      emitter.emit('videoChange', getId())
      lastCid = newCid
    }
  }

  // original: via MutationObserver document.body

  // here use href change
  // https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript
  // https://developer.chrome.com/docs/web-platform/navigation-api/
  // @ts-ignore
  window.navigation?.addEventListener('navigate', () => checkCidChange())
  window.addEventListener('popstate', () => checkCidChange())
  window.addEventListener('hashchange', () => checkCidChange())
})

export type VideoChangeCallback = (id: { aid: string; cid: string }) => void

/**
 * 监听视频的变化, 等待视频加载并开始监听后 resolve
 */
export const onVideoChange = async (callback: VideoChangeCallback) => {
  if (!IN_BILIBILI_VIDEO_PLAY_PAGE) {
    return false
  }

  const cid = await selectCid()
  if (isNil(cid)) {
    return false
  }

  // listen if needed
  listenCidChange(cid)

  // execute callback
  callback(getId())
  emitter.on('videoChange', callback)

  // has video
  return true
}

/** 等待 cid */
const selectCid = () =>
  poll(
    () => {
      return (unsafeWindow as any).cid as string | undefined
    },
    {
      interval: 100,
      timeout: ms('1min'),
      validate: (cid) => !!cid,
    },
  )
