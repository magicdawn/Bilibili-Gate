import type { SpaceUploadItem } from './space-upload.api'

/**
 * 保留原始 ALLCAPS 命名
 * 保留原始 tags 命令
 */
export enum ESpaceUploadTagPreset {
  CHARGE = 'CHARGE',
  SNEAK = 'SNEAK',
  PUGV = 'PUGV',
  INTERACTIVE = 'INTERACTIVE',
  UNION = 'UNION',
  LIVE_PLAYBACK = 'LIVE_PLAYBACK',
}

export enum ESpaceUploadChargeType {
  ORDINARY = 0,
  CHARGE_BASE = 1,
  CHARGE_SNEAK = 2,
}

/**
Zx = e => {
  const t = {
    is_charging_arc: mt.CHARGE,
    is_union_video: mt.UNION,
    is_steins_gate: mt.INTERACTIVE,
    is_live_playback: mt.LIVE_PLAYBACK,
    is_lesson_video: mt.PUGV
  }
  , n = [];
  return Object.entries(t).forEach(r => {
    const [o,i] = r;
    if (e[o]) {
      if (o === "is_charging_arc") {
        e.elec_arc_badge ? n.push(mt.CHARGE) : e.elec_arc_type ? (e.elec_arc_type === Tu.CHARGE_BASE && n.push(mt.CHARGE),
        e.elec_arc_type === Tu.CHARGE_SNEAK && n.push(mt.SNEAK)) : n.push(mt.CHARGE);
        return
      }
      n.push(i)
    }
  }
  ),
  n
}
 */
export function formatTags(item: SpaceUploadItem) {
  const tags: ESpaceUploadTagPreset[] = []
  const t = {
    is_charging_arc: ESpaceUploadTagPreset.CHARGE,
    is_union_video: ESpaceUploadTagPreset.UNION,
    is_steins_gate: ESpaceUploadTagPreset.INTERACTIVE,
    is_live_playback: ESpaceUploadTagPreset.LIVE_PLAYBACK,
    is_lesson_video: ESpaceUploadTagPreset.PUGV,
  } as const
  Object.keys(t).forEach((key) => {
    if (!item[key as any as keyof SpaceUploadItem]) return
    const val = t[key as keyof typeof t]
    if (key === 'is_charging_arc') {
      item.elec_arc_badge
        ? tags.push(ESpaceUploadTagPreset.CHARGE)
        : item.elec_arc_type
          ? (item.elec_arc_type === ESpaceUploadChargeType.CHARGE_BASE && tags.push(ESpaceUploadTagPreset.CHARGE),
            item.elec_arc_type === ESpaceUploadChargeType.CHARGE_SNEAK && tags.push(ESpaceUploadTagPreset.SNEAK))
          : tags.push(ESpaceUploadTagPreset.CHARGE)
      return
    } else {
      return tags.push(val)
    }
  })
  return tags
}

export const SpaceUploadItemHelper = {
  getMeta(item: SpaceUploadItem) {
    const isAvoided = !!(item.meta && item.is_avoided)
    const isLessonVideo = !!(item.meta && item.is_lesson_video)
    const meta = isAvoided || isLessonVideo ? item.meta! : undefined
    return meta
  },

  checkIsCollection(item: SpaceUploadItem) {
    const meta = SpaceUploadItemHelper.getMeta(item)
    return !!(meta && item.season_id && meta.ep_count)
  },

  checkIsChargeOnly(item: SpaceUploadItem) {
    return !!item.is_charging_arc
  },

  checkIsUnionVideo(item: SpaceUploadItem) {
    return !!item.is_union_video
  },
}
