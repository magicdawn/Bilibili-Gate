import type { SpaceUploadItem } from '$define'

/**
from https://s1.hdslb.com/bfs/static/shanks/fresh-space/assets/index-f4d0cdad.js

if (i === "is_charging_arc") {
  (e.elec_arc_type === cs.CHARGE_BASE || !e.elec_arc_type && e.is_charging_arc) && n.push(gt.CHARGE),
  e.elec_arc_type === cs.CHARGE_SNEAK && n.push(gt.SNEAK);
  return
}
cs = {
  CHARGE_BASE: 1
  CHARGE_SNEAK: 2
  ORDINARY: 0
}

function x(){
  const t = [];
  return e.is_charging_arc && (
    e.elec_arc_badge
      ? t.push(ut.CHARGE)
      : e.elec_arc_type
        ? (e.elec_arc_type === Ac.CHARGE_BASE && t.push(ut.CHARGE),
          e.elec_arc_type === Ac.CHARGE_SNEAK && t.push(ut.SNEAK))
        : t.push(ut.CHARGE)),
          e.inter_video && t.push(ut.INTERACTIVE),
          e.rights.is_cooperation && t.push(ut.UNION),t
}

[ut.SNEAK]: {
  priority: 1,
  tag: {
      text: "抢先看",
      class: "sneak-tag",
      icon: "BDC/battery_charge_simple_fill/3",
      style: ""
  }
},
[ut.CHARGE]: {
  priority: 2,
  tag: {
      text: "充电专属",
      class: "charge-tag",
      icon: "BDC/battery_charge_simple_fill/3",
      style: ""
  }
},
 */

export function isSpaceUploadItemChargeOnly(item: SpaceUploadItem) {
  if (item.elec_arc_type === 1 || (!item.elec_arc_type && item.is_charging_arc)) return true
  if (item.elec_arc_type === 2) return true
  return false
}
