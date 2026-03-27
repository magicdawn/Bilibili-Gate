import { antMessage } from '$modules/antd'
import { ArticleDraft } from './api'

/**
 * 使用「专栏草稿」作为存储, getData & setData
 */
export class BilibiliArticleDraft {
  constructor(public title: string) {}

  // a refresh is needed after manual delete article draft by bilibili dashboard
  articleId: number | undefined

  private searchExistingArticleId = async () => {
    const allDrafts = await ArticleDraft.search(this.title)
    const draft = allDrafts.find((d) => d.title === this.title)
    return draft?.id
  }

  private ensureDraftExists = async (data: object = {}) => {
    if (this.articleId) return

    // search existing draft
    this.articleId = await this.searchExistingArticleId()
    if (this.articleId) return

    // create new draft
    const res = await ArticleDraft.addOrUpdate(undefined, this.title, data)
    if (res.isErr()) {
      antMessage.error(`创建「专栏草稿」失败: ${res.error.message}`)
      return
    }
    this.articleId = res.value
  }

  getData = async <T = any>(): Promise<T | undefined> => {
    await this.ensureDraftExists()
    if (!this.articleId) return

    const content = await ArticleDraft.view(this.articleId)
    if (!content) return
    return content as T
  }

  setData = async <T extends object>(data: T): Promise<boolean> => {
    await this.ensureDraftExists(data)
    if (!this.articleId) return false

    const res = await ArticleDraft.addOrUpdate(this.articleId, this.title, data)
    if (res.isErr()) antMessage.error(`保存「专栏草稿」失败: ${res.error.message}`)
    return res.isOk()
  }
}
