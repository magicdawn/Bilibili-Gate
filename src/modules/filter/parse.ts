export const REG_MID_WITH_REMARK = /^(?<mid>\d+)\((?<remark>[\S ]+)\)$/
export const REG_MID = /^\d+$/

export function parseUpRepresent(author: string): Partial<{ mid: string; remark: string }> {
  if (REG_MID_WITH_REMARK.test(author)) {
    const groups = REG_MID_WITH_REMARK.exec(author)?.groups
    const mid = groups?.mid
    const remark = groups?.remark
    return { mid, remark }
  }

  // 会有纯数字的用户名么?
  if (REG_MID.test(author)) {
    return { mid: author, remark: undefined }
  }

  return {}
}

export function parseFilterByAuthor(keywords: string[] | readonly string[]) {
  const blockUpMids = new Set<string>()
  const blockUpNames = new Set<string>()

  keywords.forEach((keyword) => {
    const { mid } = parseUpRepresent(keyword)
    mid ? blockUpMids.add(mid) : blockUpNames.add(keyword)
  })

  return { blockUpMids, blockUpNames }
}

export function parseFilterByTitle(keywords: string[] | readonly string[]) {
  const titleRegexList: RegExp[] = []
  const titleKeywordList: string[] = []
  keywords.forEach((keyword) => {
    if (keyword.startsWith('/') && keyword.endsWith('/')) {
      const regex = new RegExp(keyword.slice(1, -1), 'i')
      titleRegexList.push(regex)
    } else {
      titleKeywordList.push(keyword)
    }
  })
  return { titleKeywordList, titleRegexList }
}
