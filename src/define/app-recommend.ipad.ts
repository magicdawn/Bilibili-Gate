/* eslint-disable @typescript-eslint/no-empty-object-type */

// Generated by https://quicktype.io
//
// To change quicktype's target language, run command:
//
//   "Set quicktype target language"

export namespace ipad {
  // Generated by https://quicktype.io

  export interface AppRecommendJson {
    code: number
    message: string
    ttl: number
    data: Data
  }

  export interface Data {
    items: AppRecItem[]
    config: Config
    interest_choose: null
  }

  export interface Config {
    column: number
    autoplay_card: number
    feed_clean_abtest: number
    home_transfer_test: number
    auto_refresh_time: number
    show_inline_danmaku: number
    toast: ToastClass
    is_back_to_homepage: boolean
    enable_rcmd_guide: boolean
    inline_sound: number
    auto_refresh_time_by_appear: number
    auto_refresh_time_by_active: number
    trigger_loadmore_left_line_num: number
    history_cache_size: number
    visible_area: number
    card_density_exp: number
    small_cover_wh_ratio: number
    space_enlarge_exp: number
  }

  export interface ToastClass {}

  export interface AppRecItem {
    card_type: CardType
    card_goto: CardGoto
    goto: CardGoto
    param: string
    bvid?: string
    cover: string
    cover_badge?: string
    title: string
    uri: string
    three_point: ThreePoint
    args: Args
    player_args?: PlayerArgs
    idx: number
    mask?: Mask
    three_point_v2: ThreePointV2[]
    track_id: string
    report_flow_data?: string
    avatar: Avatar
    cover_left_text_1: string
    cover_left_text_2: string
    cover_left_text_3: string
    desc: string
    can_play: number
    ad_info?: any
    top_rcmd_reason?: string
    official_icon?: number
    top_rcmd_reason_style?: BottomRcmdReasonStyle
    bottom_rcmd_reason?: string
    bottom_rcmd_reason_style?: BottomRcmdReasonStyle
  }

  export interface BottomRcmdReasonStyle {
    bg_color: string
    bg_color_night: string
    bg_style: number
    border_color: string
    border_color_night: string
    icon_night?: string
    is_bg?: boolean
    text: string
    text_color: string
    text_color_night: string
  }

  export interface Args {
    up_id: number
    up_name: string
    rid: number
    rname: string
    aid: number
  }

  export interface Avatar {
    cover: string
    uri: string
    event: AvatarEvent
    event_v2: AvatarEventV2
    up_id: number
    text?: string
  }

  export enum AvatarEvent {
    UpClick = 'up_click',
  }

  export enum AvatarEventV2 {
    UpClick = 'up-click',
  }

  export enum CardGoto {
    AV = 'av',
    AdAV = 'ad_av',
    PICTURE = 'picture',
    BANGUMI = 'bangumi',
  }

  export enum CardType {
    CMV1 = 'cm_v1',
    LargeCoverV1 = 'large_cover_v1',
  }

  export interface Mask {
    avatar: Avatar
    button: Button
  }

  export interface Button {
    text: Text
    param: string
    event: ButtonEvent
    type: number
    event_v2: ButtonEventV2
    selected?: number
  }

  export enum ButtonEvent {
    UpFollow = 'up_follow',
  }

  export enum ButtonEventV2 {
    UpFollow = 'up-follow',
  }

  export enum Text {
    关注 = '+ 关注',
  }

  export interface PlayerArgs {
    aid: number
    cid: number
    type: CardGoto
    duration: number
  }

  export interface ThreePoint {
    dislike_reasons: DislikeReason[]
    feedbacks?: DislikeReason[]
    watch_later?: number
  }

  export interface DislikeReason {
    id: number
    name: string
    toast: ToastEnum
  }

  export enum ToastEnum {
    将优化首页此类内容 = '将优化首页此类内容',
    将减少相似内容推荐 = '将减少相似内容推荐',
  }

  export interface ThreePointV2 {
    title?: Title
    type: Type
    icon?: string
    subtitle?: Subtitle
    reasons?: DislikeReason[]
  }

  export enum Subtitle {
    选择后将优化首页此类内容 = '(选择后将优化首页此类内容)',
    选择后将减少相似内容推荐 = '(选择后将减少相似内容推荐)',
  }

  export enum Title {
    反馈 = '反馈',
    我不想看 = '我不想看',
    添加至稍后再看 = '添加至稍后再看',
  }

  export enum Type {
    Dislike = 'dislike',
    Feedback = 'feedback',
    Watchlater = 'watch_later',
  }
}
