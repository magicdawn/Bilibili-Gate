export interface KvResponseJson {
  code: number
  message: string
  data: KvResponseData
}

export interface KvResponseData {
  versionId: string
  appVersionId: string
  data: Record<string, string>
}
