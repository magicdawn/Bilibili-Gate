/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/user/relation.html#关系属性对象
 */
export interface RelationAttributeEntity {
  /** 目标用户 mid */
  mid: number
  /** 关系属性	0：未关注; 1：悄悄关注（已弃用）; 2：已关注; 6：已互粉; 128：已拉黑 */
  attribute: number
  /** 关注对方时间	时间戳; 未关注为 0 */
  mtime: number
  /** 默认分组：null; 存在至少一个分组：array; 分组 id */
  tag: number[] | null
  /** 特别关注标志	0：否; 1：是 */
  special: number
}
