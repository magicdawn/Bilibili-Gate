/**
 * see https://socialsisteryi.github.io/bilibili-API-collect/docs/video/videostream_url.html
 */

import { request } from '$request'
import { orderBy } from 'es-toolkit'
import type { VideoPlayUrlJson } from './types/play-url'

/**
 * 7	AVC 编码	8K 视频不支持该格式
 * 12	HEVC 编码
 * 13	AV1 编码
 */
export enum ECodecId {
  AVC = 7,
  HEVC = 12,
  AV1 = 13,
}

/**
 * 6	240P 极速	仅 MP4 格式支持,仅platform=html5时有效
 * 16	360P 流畅
 * 32	480P 清晰
 * 64	720P 高清	WEB 端默认值,B站前端需要登录才能选择，但是直接发送请求可以不登录就拿到 720P 的取流地址,无 720P 时则为 720P60
 * 74	720P60 高帧率	登录认证
 * 80	1080P 高清	TV 端与 APP 端默认值,登录认证
 * 112	1080P+ 高码率	大会员认证
 * 116	1080P60 高帧率	大会员认证
 * 120	4K 超清	需要fnval&128=128且fourk=1,大会员认证
 * 125	HDR 真彩色	仅支持 DASH 格式,需要fnval&64=64,大会员认证
 * 126	杜比视界	仅支持 DASH 格式,需要fnval&512=512,大会员认证
 * 127	8K 超高清	仅支持 DASH 格式,需要fnval&1024=1024,大会员认证
 */
export enum EResolution {
  _240p = 6,
  _360p = 16,
  _480p = 32,
  _720p = 64,
  _1080p = 80,
  _4k = 120,
  _8k = 127,
  HDR = 125,
  DolbyVision = 126,
}

export async function getVideoPlayUrl(videoId: string | number, cid: number, useMp4: boolean) {
  const params: Record<string, any> = {
    cid,
    fnver: 0,
    fnval: useMp4 ? 1 : 16, // 1:mp4, 16:dash
  }

  const _videoId = videoId.toString()
  if (_videoId.startsWith('BV')) {
    params.bvid = _videoId
  } else if (/^\d+$/.test(_videoId)) {
    params.avid = _videoId
  } else {
    throw new Error('Invalid videoId provided, must be avid | bvid')
  }

  const res = await request.get('/x/player/wbi/playurl', { params })
  const json = res.data as VideoPlayUrlJson

  if (json?.data?.durl) {
    const dUrls = (json.data.durl || []).map((x) => x.url)
    if (dUrls.length) return dUrls
  }

  // dash
  const video = orderBy(json.data?.dash?.video || [], ['id', 'codecid'], ['desc', 'desc'])
  const dashUrls = video
    .map((x) => [x.baseUrl])
    .flat()
    .filter(Boolean)
  return dashUrls
}
