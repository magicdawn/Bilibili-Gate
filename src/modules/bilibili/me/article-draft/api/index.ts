/**
 * 专栏-草稿管理
 */

import { Result } from 'better-result'
import { attempt } from 'es-toolkit'
import { request, WebApiError } from '$request'
import { getCsrfToken } from '$utility/cookie'
import type { DraftListJson } from './draft-list.api'
import type { DraftViewJson, Paragraph } from './draft-view.api'

export const ArticleDraft = {
  async search(keyword: string) {
    const res = await request.get('/x/article/creative/draft/list', {
      params: { keyword, ps: 10, pn: 1 },
    })
    const json = res.data as DraftListJson
    const drafts = json.artlist?.drafts || []
    return drafts
  },

  async view(articleId: number): Promise<object | undefined> {
    const json = (
      await request.get('/x/article/creative/draft/view', {
        params: { aid: articleId },
      })
    ).data as DraftViewJson

    const paragraphs = json?.data?.opus?.content?.paragraphs || []
    let p: Paragraph | undefined
    if (paragraphs.length === 1 && (p = paragraphs[0]) && p?.code?.content && p?.code?.lang === 'json') {
      const str = p.code.content
      const [_, parsed] = attempt(() => JSON.parse(str))
      if (parsed) return parsed
    }
  },

  async addOrUpdate(articleId: number | undefined, title: string, content: object) {
    const codeBlockContent = JSON.stringify(content, null, 2)
    const body = {
      arg: {
        type: 4,
        template_id: 1,
        category_id: 15,
        article_id: articleId || undefined, // is undefined acceptable?
        title,
        private_pub: 1,
        reprint: 1,
        original: 0,
        list_id: 0,
        summary: title,
        opus: {
          opus_source: 2,
          title,
          content: {
            paragraphs: [{ para_type: 8, code: { lang: 'json', content: codeBlockContent } }],
          },
          pub_info: { editor_version: 'eva3-2.0.1' },
        },
      },
    }
    return (
      await request.safePost('/x/dynamic/feed/article/draft/add', body, {
        params: { csrf: getCsrfToken() },
      })
    )
      .andThen((resp) => WebApiError.validateAxiosResponse(resp))
      .andThen((json) => {
        const id = json?.data?.article_id as number | undefined
        return Result.ok(id)
      })
  },
}
