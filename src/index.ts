/*
 * 佛曰:
 *     写字楼里写字间，写字间里程序员；
 *     程序人员写程序，又拿程序换酒钱。
 *     酒醒只在网上坐，酒醉还来网下眠；
 *     酒醉酒醒日复日，网上网下年复年。
 *     但愿老死电脑间，不愿鞠躬老板前；
 *     奔驰宝马贵者趣，公交自行程序员。
 *     别人笑我忒疯癫，我笑自己命太贱；
 *     不见满街漂亮妹，哪个归得程序员？
 */

import '$common/global.scss' // styles
import '$common/shared.module.scss'
import '$components/video-grid.module.scss' // css modules 与 emtion 混用, 先 import 作为 base 的 css modules
import 'virtual:uno.css'
import './modules/polyfills/explicit-resource-management' // polyfills
import './modules/settings' // load config first

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { IN_BILIBILI_HOMEPAGE, IN_BILIBILI_SEARCH_PAGE, IN_BILIBILI_SPACE_PAGE } from '$common'
import { initHomepage } from '$main/homepage'
import { initSearchPage } from '$main/search-page'
import { initSpacePage } from '$main/space-page'
import { initVideoPlayPage } from '$main/video-play-page'
import { IN_BILIBILI_VIDEO_PLAY_PAGE } from '$modules/pages/video-play-page'

dayjs.extend(duration)

void (function main() {
  if (IN_BILIBILI_HOMEPAGE) return initHomepage()
  if (IN_BILIBILI_VIDEO_PLAY_PAGE) return initVideoPlayPage()
  if (IN_BILIBILI_SPACE_PAGE) return initSpacePage()
  if (IN_BILIBILI_SEARCH_PAGE) return initSearchPage()
})()
