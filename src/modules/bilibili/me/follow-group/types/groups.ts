export interface FollowGroupsJson {
  code: number
  message: string
  ttl: number
  data: FollowGroup[]
}

export interface FollowGroup {
  tagid: number
  name: string
  count: number
  tip: Tip
}

export enum Tip {
  Empty = '',
  第一时间收到该分组下用户更新稿件的通知 = '第一时间收到该分组下用户更新稿件的通知',
}
