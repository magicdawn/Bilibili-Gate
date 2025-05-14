/**
 * AI 太🐂了
 * WindSurf 太🐂了
 * Claude 太🐂了
 */

/**
 * Helper type for recursion depth control
 * @internal
 */
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]]

/**
 * Join two parts of a path with a dot
 * @internal
 */
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never

/**
 * Get all possible paths through an object type, including nested paths with dot notation
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: 1,
 *   e: true,
 *   arr: [1, 2, 3],
 *   x: { y: { z: 1 } }
 * }
 * type AllPaths = Paths<typeof obj>
 * // type AllPaths = "a" | "d" | "e" | "arr" | "x" | "a.b" | "a.c" | "x.y" | "x.y.z"
 * ```
 */
export type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Array<any>
    ? ''
    : T extends object
      ? {
          [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never
        }[keyof T]
      : ''

/**
 * Get all possible paths through an object type where the leaf value is a boolean
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: false,
 *   e: { f: true },
 *   arr: [true, false]
 * }
 * type BoolPaths = BooleanPaths<typeof obj>
 * // type BoolPaths = "d" | "a.c" | "e.f"
 * ```
 */

export type BooleanPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Array<any>
    ? ''
    : T extends object
      ? {
          [K in keyof T]-?: K extends string | number
            ? T[K] extends boolean
              ? `${K}`
              : T[K] extends object
                ? Join<K, BooleanPaths<T[K], Prev[D]>>
                : never
            : never
        }[keyof T]
      : T extends boolean
        ? ''
        : never

/**
 * Get all possible paths through an object type where the leaf value is an array
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: [1, 2], c: true },
 *   d: ['hello'],
 *   e: { f: [true] },
 *   arr: [[1, 2], [3, 4]]
 * }
 * type ArrayPaths = ListPaths<typeof obj>
 * // type ArrayPaths = "d" | "a.b" | "e.f" | "arr"
 * ```
 */

export type ListPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Array<any>
    ? ''
    : T extends object
      ? {
          [K in keyof T]-?: K extends string | number
            ? T[K] extends Array<any>
              ? `${K}`
              : T[K] extends object
                ? Join<K, ListPaths<T[K], Prev[D]>>
                : never
            : never
        }[keyof T]
      : T extends Array<any>
        ? ''
        : never

/**
 * Get all possible paths through an object type where the value is a plain object (not array)
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: 1,
 *   e: { f: { g: 2 } },
 *   arr: [1, 2, 3],
 *   obj: { items: [] }
 * }
 * type ObjPaths = ObjectPaths<typeof obj>
 * // type ObjPaths = "a" | "e" | "e.f" | "obj"
 * ```
 */

export type ObjectPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Array<any>
    ? ''
    : T extends object
      ? {
          [K in keyof T]-?: K extends string | number
            ? T[K] extends Array<any>
              ? never
              : T[K] extends object
                ? `${K}` | Join<K, ObjectPaths<T[K], Prev[D]>>
                : never
            : never
        }[keyof T]
      : never

/**
 * Get all leaf paths through an object type (primitive values and arrays)
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: 1,
 *   e: { f: { g: 2 } },
 *   arr: [1, 2, 3],
 *   obj: { items: [] }
 * }
 * type LeafPaths = LeafPaths<typeof obj>
 * // type LeafPaths = "a.b" | "a.c" | "d" | "e.f.g" | "arr" | "obj.items"
 * ```
 */

export type LeafPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Array<any>
    ? ''
    : T extends object
      ? {
          [K in keyof T]-?: K extends string | number
            ? T[K] extends Array<any>
              ? `${K}`
              : T[K] extends object
                ? Join<K, LeafPaths<T[K], Prev[D]>>
                : `${K}`
            : never
        }[keyof T]
      : ''

/**
 * Get all possible paths through an object at runtime
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: 1,
 *   e: true,
 *   arr: [1, 2, 3],
 *   x: { y: { z: 1 } }
 * }
 * const paths = getPaths(obj)
 * // paths = ["a", "a.b", "a.c", "d", "e", "arr", "x", "x.y", "x.y.z"]
 * ```
 */

export function getPaths<T extends object>(obj: T, parentPath = '', result: string[] = []): Paths<T>[] {
  // Add current path if it's not empty (not root level)
  if (parentPath) {
    result.push(parentPath)
  }

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]
    const currentPath = parentPath ? `${parentPath}.${key}` : key

    // Add the current key path
    result.push(currentPath)

    // Recursively process object properties
    // Skip arrays, functions, null, and primitive types
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) && // 如果是数组，不再递归处理
      !(value instanceof Date) &&
      !(value instanceof RegExp)
    ) {
      getPaths(value as object, currentPath, result)
    }
  }

  // Remove duplicates but keep original order
  return [...new Set(result)] as Paths<T>[]
}

/**
 * Get all possible paths through an object at runtime where the leaf value is a boolean
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: false,
 *   e: { f: true }
 * }
 * const paths = getBooleanPaths(obj)
 * // paths = ["a.c", "d", "e.f"]
 * ```
 */

export function getBooleanPaths<T extends object>(obj: T, parentPath = ''): BooleanPaths<T>[] {
  const result: string[] = []

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]
    const currentPath = parentPath ? `${parentPath}.${key}` : key

    if (typeof value === 'boolean') {
      result.push(currentPath)
    } else if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof RegExp)
    ) {
      result.push(...getBooleanPaths(value as object, currentPath))
    }
  }

  return result as BooleanPaths<T>[]
}

/**
 * Get all possible paths through an object at runtime where the leaf value is an array
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: [1, 2], c: true },
 *   d: ['hello'],
 *   e: { f: [true] }
 * }
 * const paths = getListPaths(obj)
 * // paths = ["a.b", "d", "e.f"]
 * ```
 */

export function getListPaths<T extends object>(obj: T, parentPath = ''): ListPaths<T>[] {
  const result: string[] = []

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]
    const currentPath = parentPath ? `${parentPath}.${key}` : key

    if (Array.isArray(value)) {
      result.push(currentPath)
    } else if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof RegExp)) {
      result.push(...getListPaths(value as object, currentPath))
    }
  }

  return result as ListPaths<T>[]
}

/**
 * Get all possible paths through an object at runtime where the value is a plain object
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: 1,
 *   e: { f: { g: 2 } },
 *   arr: [1, 2, 3],
 *   obj: { items: [] }
 * }
 * const paths = getObjectPaths(obj)
 * // paths = ["a", "e", "e.f", "obj"]
 * ```
 */

export function getObjectPaths<T extends object>(obj: T, parentPath = ''): ObjectPaths<T>[] {
  const result: string[] = []

  // Add current path if it's not empty (not root level)
  if (parentPath) {
    result.push(parentPath)
  }

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]
    const currentPath = parentPath ? `${parentPath}.${key}` : key

    // Only process plain objects, skip arrays and other special objects
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof RegExp) &&
      Object.getPrototypeOf(value) === Object.prototype // ensure it's a plain object
    ) {
      result.push(currentPath)
      result.push(...getObjectPaths(value as object, currentPath))
    }
  }

  return [...new Set(result)] as ObjectPaths<T>[]
}

/**
 * Get all leaf paths through an object at runtime (primitive values and arrays)
 * Array indices will be excluded from the paths
 * @example
 * ```typescript
 * const obj = {
 *   a: { b: 1, c: true },
 *   d: 1,
 *   e: { f: { g: 2 } },
 *   arr: [1, 2, 3],
 *   obj: { items: [] }
 * }
 * const paths = getLeafPaths(obj)
 * // paths = ["a.b", "a.c", "d", "e.f.g", "arr", "obj.items"]
 * ```
 */

export function getLeafPaths<T extends object>(obj: T): LeafPaths<T>[] {
  const allPaths = getPaths(obj)
  const objPaths = getObjectPaths(obj)
  return allPaths.filter((p) => !objPaths.includes(p as any)) as LeafPaths<T>[]
}
