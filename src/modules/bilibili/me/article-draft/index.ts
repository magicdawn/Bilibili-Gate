/**
 * 专栏-草稿管理
 */

import { isWebApiSuccess, request } from '$request'
import { getCsrfToken } from '$utility/cookie'
import toast from '$utility/toast'
import type { AddUpdateJSON } from './types/addupdate'
import type { DraftListJSON } from './types/draft-list'
import type { DraftViewJSON } from './types/draft-view'

async function listAll() {
  const json = (await request.get('https://member.bilibili.com/x/web/draft/list')).data as DraftListJSON
  const drafts = json.artlist?.drafts || []
  return drafts
}

async function addupdate(
  payload: Partial<{
    aid: string
    title: string
    content: string
    words: string
  }>,
) {
  const form = new URLSearchParams({
    title: '',
    banner_url: '',
    content: '',
    summary: '',
    words: '0',
    category: '15',
    tid: '0',
    reprint: '0',
    tags: '',
    image_urls: '',
    origin_image_urls: '',
    dynamic_intro: '',
    media_id: '0',
    spoiler: '0',
    original: '0',
    top_video_bvid: '',
    aid: '',
    csrf: getCsrfToken(),
    ...payload,
  })

  const json = (await request.post('/x/article/creative/draft/addupdate', form)).data as AddUpdateJSON
  const aid = json?.data?.aid?.toString()
  const success = isWebApiSuccess(json)
  if (!success) {
    toast(json.message || 'addupdate error')
  }

  return { success, aid }
}

async function draftView(aid: string | number) {
  const json = (
    await request.get('/x/article/creative/draft/view', {
      params: { aid },
    })
  ).data as DraftViewJSON
  return json?.data?.content || ''
}

/**
 * 使用「专栏草稿」作为存储, getData & setData
 */
export class BilibiliArticleDraft {
  title: string
  constructor(title: string) {
    this.title = title
  }

  getData = async <T = any>(): Promise<T | undefined> => {
    const { title } = this

    const allDrafts = await listAll()
    const draft = allDrafts.find((d) => d.title === title)

    // create new draft
    if (!draft) {
      const { success, aid } = await addupdate({ title })
      return
    }

    const content = await draftView(draft.id)
    const parser = new DOMParser()
    const parsed = parser.parseFromString(content, 'text/html')
    const text = (parsed.body.textContent || '').trim()
    if (!text) return
    try {
      return JSON.parse(text) as T
    } catch {
      return
    }
  }

  // cache aid for setData
  // a refresh is needed after manual delete article draft by bilibili dashboard
  _aid: string | undefined

  setData = async <T = any>(data: T): Promise<boolean> => {
    const { title } = this

    if (!this._aid) {
      const allDrafts = await listAll()
      const draft = allDrafts.find((d) => d.title === title)
      if (!draft) {
        // create new draft
        const { success, aid: newDraftAid } = await addupdate({
          title,
        })
        if (!success) return false
        this._aid = newDraftAid
      } else {
        this._aid = draft.id.toString()
      }
    }

    const dataStr = JSON.stringify(data)
    const { success } = await addupdate({
      aid: this._aid,
      title,
      content: `<p>${dataStr}</p>`,
      words: dataStr.length.toString(),
    })
    return success
  }
}
