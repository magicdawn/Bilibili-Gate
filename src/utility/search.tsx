/**
 * WindSurf claude3.5-Sonet generated
 */

export const advancedSearchHelpInfo = (
  <>
    1. 可以使用多个搜索词, 用空格分隔, 逻辑关系为且 (AND) <br />
    2. 可以使用引号包裹搜索词, 如 "word or sentence" <br />
    3. 可以使用 -"word or sentence" 排除关键词; 必须使用引号(单引号 或 双引号) <br />
  </>
)

export function parseSearchInput(input: string): { includes: string[]; excludes: string[] } {
  const includes: string[] = []
  const excludes: string[] = []

  // 如果输入为空，直接返回空结果
  if (!input.trim()) {
    return { includes, excludes }
  }

  let currentPos = 0
  const inputLength = input.length

  while (currentPos < inputLength) {
    // 跳过空格
    while (currentPos < inputLength && input[currentPos] === ' ') {
      currentPos++
    }

    if (currentPos >= inputLength) break

    let isExclude = false
    let word = ''

    // 检查是否是排除项
    if (input[currentPos] === '-') {
      const nextChar = input[currentPos + 1]
      // 只有当减号后面紧跟着引号时才视为排除项
      if (nextChar === '"' || nextChar === "'") {
        isExclude = true
        currentPos++
      }
    }

    // 处理引号内的内容
    if (input[currentPos] === '"' || input[currentPos] === "'") {
      const startQuoteChar = input[currentPos]
      currentPos++ // 跳过开始引号

      let escaped = false

      while (currentPos < inputLength) {
        const char = input[currentPos]

        if (escaped) {
          // 如果是转义状态，直接添加字符（包括引号）
          word += char
          escaped = false
          currentPos++
          continue
        }

        if (char === '\\') {
          const nextChar = input[currentPos + 1]
          // 只有当下一个字符是引号时才进行转义
          if (nextChar === '"' || nextChar === "'") {
            escaped = true
            currentPos++
            continue
          }
          // 否则保留反斜杠
          word += char
          currentPos++
          continue
        }

        if (char === startQuoteChar) {
          currentPos++
          break
        }

        word += char
        currentPos++
      }
    } else {
      // 处理普通词语
      while (currentPos < inputLength && input[currentPos] !== ' ') {
        if (input[currentPos] === '\\') {
          currentPos++
          if (currentPos < inputLength) {
            word += input[currentPos]
            currentPos++
          }
          continue
        }
        word += input[currentPos]
        currentPos++
      }
    }

    if (word) {
      if (isExclude) {
        excludes.push(word)
      } else {
        includes.push(word)
      }
    }
  }

  return { includes, excludes }
}
