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
 */

export function isSpaceUploadItemChargeOnly(item: SpaceUploadItem) {
  if (item.elec_arc_type === 1 || (!item.elec_arc_type && item.is_charging_arc)) return true
  if (item.elec_arc_type === 2) return true
  return false
}
