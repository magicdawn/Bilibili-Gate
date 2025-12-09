import { describe, expect, it } from 'vitest'
import { getLeafPaths, getObjectPaths, getPaths } from './object-paths'

describe('object-paths', () => {
  const testObj = {
    a: { b: 1, c: true },
    d: 1,
    e: { f: { g: 2 } },
    arr: [1, 2, 3],
    obj: { items: [] },
    date: new Date(),
    regexp: /test/,
  }

  describe('getPaths', () => {
    it('should get all possible paths through an object', () => {
      const paths = getPaths(testObj)
      expect(paths).toEqual(['a', 'a.b', 'a.c', 'd', 'e', 'e.f', 'e.f.g', 'arr', 'obj', 'obj.items', 'date', 'regexp'])
    })

    it('should handle empty object', () => {
      const paths = getPaths({})
      expect(paths).toEqual([])
    })

    it('should handle nested arrays', () => {
      const obj = {
        arr: [
          [1, 2],
          [3, 4],
        ],
        nested: { arr: [5, 6] },
      }
      const paths = getPaths(obj)
      expect(paths).toEqual(['arr', 'nested', 'nested.arr'])
    })
  })

  describe('getObjectPaths', () => {
    it('should get paths where value is a plain object', () => {
      const paths = getObjectPaths(testObj)
      expect(paths).toEqual(['a', 'e', 'e.f', 'obj'])
    })

    it('should handle empty object', () => {
      const paths = getObjectPaths({})
      expect(paths).toEqual([])
    })

    it('should exclude special objects', () => {
      const obj = {
        date: new Date(),
        regexp: /test/,
        array: [],
        plain: { a: 1 },
      }
      const paths = getObjectPaths(obj)
      expect(paths).toEqual(['plain'])
    })

    it('should handle deeply nested objects', () => {
      const obj = {
        a: {
          b: {
            c: {
              d: { e: 1 },
            },
          },
        },
      }
      const paths = getObjectPaths(obj)
      expect(paths).toEqual(['a', 'a.b', 'a.b.c', 'a.b.c.d'])
    })
  })

  describe('getLeafPaths', () => {
    it('should get paths for leaf nodes (primitives and arrays)', () => {
      const paths = getLeafPaths(testObj)
      expect(paths).toEqual(['a.b', 'a.c', 'd', 'e.f.g', 'arr', 'obj.items', 'date', 'regexp'])
    })

    it('should handle empty object', () => {
      const paths = getLeafPaths({})
      expect(paths).toEqual([])
    })

    it('should handle arrays as leaf nodes', () => {
      const obj = {
        arr: [1, 2],
        nested: {
          list: [3, 4],
          value: 5,
        },
      }
      const paths = getLeafPaths(obj)
      expect(paths).toEqual(['arr', 'nested.list', 'nested.value'])
    })

    it('should handle all primitive types', () => {
      const obj = {
        str: 'string',
        num: 42,
        bool: true,
        nil: null,
        undef: undefined,
        nested: {
          symbol: Symbol('test'),
          bigint: 9007199254740991n,
        },
      }
      const paths = getLeafPaths(obj)
      expect(paths).toEqual(['str', 'num', 'bool', 'nil', 'undef', 'nested.symbol', 'nested.bigint'])
    })
  })
})
