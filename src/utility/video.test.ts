import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { formatCount, formatTimestamp, parseCount, parseDuration } from './video'

describe.concurrent('$utility/video', () => {
  it('.parseDuration', () => {
    expect(parseDuration('01:23')).to.equal(83)
    expect(parseDuration('00:01:23')).to.equal(83)
  })

  it('.parseCount', () => {
    expect(parseCount('10000')).to.equal(1_0000)
    expect(parseCount('1.2万')).to.equal(1_2000)
    expect(parseCount('2万')).to.equal(2_0000)
    expect(parseCount('1.9亿')).to.equal(1_9000_0000) // https://www.bilibili.com/bangumi/play/ep327118
  })

  it('.formatCount', () => {
    expect(formatCount(1_0000)).to.equal('1万')
    expect(formatCount(1_2000)).to.equal('1.2万')
    expect(formatCount(2_0000)).to.equal('2万')
    expect(formatCount(1234)).to.equal('1234')
    expect(formatCount(1_9000_0000)).to.equal('1.9亿')
    expect(formatCount(undefined)).to.equal(undefined)
    expect(formatCount(0)).to.equal('0')
  })

  it('.formatTimeStamp', () => {
    const cur = Math.floor(Date.now() / 1000)
    expect(formatTimestamp(cur)).to.equal(dayjs().format('M-D'))
    expect(formatTimestamp(cur, true)).to.equal(dayjs().format('M-D HH:mm'))
  })
})
