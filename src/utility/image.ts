/* eslint-disable node/handle-callback-err */
/* eslint-disable unicorn/prefer-add-event-listener */

/**
 * https://avif.io/blog/tutorials/css/#avifsupportdetectionscript
 */

import { isSafari } from '$ua'

function supportAvif() {
  return new Promise<boolean>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(true))
    img.onerror = (err) => resolve(false)
    img.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

function supportWebp() {
  return new Promise<boolean>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => {
      const result = img.width > 0 && img.height > 0
      resolve(result)
    })
    img.onerror = () => resolve(false)
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
  })
}

export const shouldUseAvif = !isSafari && (await supportAvif())

export function getAvatarSrc(avatar: string) {
  const suffix = shouldUseAvif ? '.avif' : '.webp'
  return `${avatar}@96w_96h_1c_1s_!web-avatar${suffix}`
}

export function preloadImg(src: string) {
  return new Promise<boolean>((resolve) => {
    const img = new Image()
    img.src = src
    img.addEventListener('load', () => resolve(true))
    img.onerror = () => resolve(false)
  })
}
