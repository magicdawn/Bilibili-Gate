export type DurationLimit = {
  filterMinDuration: number | undefined
  filterMaxDuration: number | undefined
}

export const DurationInputHelper = {
  normalizeDurationLimit(current: DurationLimit, target: 'min' | 'max', value: number | undefined) {
    const payload: DurationLimit = {
      ...current,
      ...(target === 'min' && { filterMinDuration: value }),
      ...(target === 'max' && { filterMaxDuration: value }),
    }
    // zero to undefined
    payload.filterMinDuration ||= undefined
    payload.filterMaxDuration ||= undefined
    // boundary check
    if (
      payload.filterMinDuration &&
      payload.filterMaxDuration &&
      payload.filterMinDuration >= payload.filterMaxDuration // invalid case
    ) {
      if (target === 'min') payload.filterMaxDuration = undefined
      if (target === 'max') payload.filterMinDuration = undefined
    }
    return payload
  },
}
