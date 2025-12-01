import { isWebApiSuccess, request } from '$request'
import { getCsrfToken, getUid } from '$utility/cookie'
import toast from '$utility/toast'

/**
 * 拷贝自 space.bilibili.com 代码
 */

export async function modifyRelations(upMid: string, act: number) {
  const uid = getUid()
  const csrf = getCsrfToken()

  // form
  const params = new URLSearchParams({
    fid: upMid,
    act: String(act),

    re_src: '11',
    gaia_source: 'web_main',
    spmid: '333.999.0.0',
    extend_content: JSON.stringify({
      entity: 'user',
      entity_id: uid,
      fp: d(),
    }),
    csrf,
  })

  const res = await request.post('/x/relation/modify', params)
  const json = res.data
  const success = isWebApiSuccess(json)

  if (!success) {
    toast(json.message || '未知错误')
  }

  return success
}

function d() {
  let t
  let e
  const i =
    // @ts-ignore
    // eslint-disable-next-line unicorn/prefer-global-this
    (null === (t = window.reportObserver) || void 0 === t || null === (e = t.cache) || void 0 === e
      ? void 0
      : e.fpriskMsg) || {}
  let n = 'empty'
  return (
    i &&
      (n = `${i.webdriver}${i.screenResolution}${i.platform}${i.hardwareConcurrency}${i.deviceMemory}${i.colorDepth}${
        i.indexedDb
      }${i.language}${i.openDatabase}${i.touchSupport}${i.userAgent}`),
    decodeURIComponent(n)
  )
}
