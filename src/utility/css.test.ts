import { describe, expect, it } from 'vitest'
import { tweakColorWithOklch } from './css'

describe('tweakColorWithOklch', () => {
  it('should work with absolute values', () => {
    expect(tweakColorWithOklch('#fff')).to.equal('oklch(from #fff l c h / alpha)')
    expect(tweakColorWithOklch('#fff', { l: 0.1 })).to.equal('oklch(from #fff 0.1 c h / alpha)')
    expect(tweakColorWithOklch('#fff', { c: 0.1, alpha: 0.1 })).to.equal('oklch(from #fff l 0.1 h / 0.1)')
  })

  it('should work with delta', () => {
    expect(tweakColorWithOklch('#fff', { deltaL: 0.1 })).to.equal('oklch(from #fff calc(l + 0.1) c h / alpha)')
    expect(tweakColorWithOklch('#fff', { deltaH: 100 })).to.equal('oklch(from #fff l c calc(h + 100) / alpha)')
    expect(tweakColorWithOklch('#fff', { deltaAlpha: 0.1 })).to.equal('oklch(from #fff l c h / calc(alpha + 0.1))')
  })
})
