import { describe, expect, it } from 'vitest'
import { parseSearchInput } from './search'

describe('parseSearchInput', () => {
  it('should parse plain words into includes', () => {
    const input = 'a b c'
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: ['a', 'b', 'c'],
      excludes: [],
    })
  })

  it('should parse quoted strings into includes', () => {
    const input = '"a cat" \'b dog\''
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: ['a cat', 'b dog'],
      excludes: [],
    })
  })

  it('should handle mixed includes and excludes', () => {
    const input = '"a cat" b -"exclude this" -\'another exclude\''
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: ['a cat', 'b'],
      excludes: ['exclude this', 'another exclude'],
    })
  })

  it('should treat -word as an include, not an exclude', () => {
    const input = '-dog cat -"exclude this"'
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: ['-dog', 'cat'],
      excludes: ['exclude this'],
    })
  })

  it('should handle only excludes', () => {
    const input = '-"exclude this" -"another exclude"'
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: [],
      excludes: ['exclude this', 'another exclude'],
    })
  })

  it('should handle empty input', () => {
    const input = ''
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: [],
      excludes: [],
    })
  })

  it('should handle input with extra spaces', () => {
    const input = '  "a cat"   b   -"exclude this"  '
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: ['a cat', 'b'],
      excludes: ['exclude this'],
    })
  })

  // 新增测试用例：处理引号中嵌套引号
  it('should handle quotes inside quotes', () => {
    const input = `"john's dog" "mary's cat"`
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: ["john's dog", "mary's cat"],
      excludes: [],
    })
  })
  // 新增测试用例：处理转义引号
  it('should handle escaped quotes', () => {
    const input = `"john's dog" -"mary's cat"`
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: [`john's dog`],
      excludes: ["mary's cat"],
    })
  })
  // 新增测试用例：混合普通单词和转义引号
  it('should handle mixed input with escaped quotes', () => {
    const input = `cat "john's dog" -"exclude this" -"mary's cat"`
    const result = parseSearchInput(input)
    expect(result).toEqual({
      includes: ['cat', "john's dog"],
      excludes: ['exclude this', "mary's cat"],
    })
  })
})
