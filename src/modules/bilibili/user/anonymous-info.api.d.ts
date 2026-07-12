export interface AnonymousLoginInfoJson {
  code: number
  message: string
  ttl: number
  data: AnonymousLoginInfo
}

export interface AnonymousLoginInfo {
  isLogin: boolean
  wbi_img: WbiImg
  ip_region: string
}

export interface WbiImg {
  img_url: string
  sub_url: string
}
