import clsx from 'clsx'
import IconCuidaShuffleOutline from '~icons/cuida/shuffle-outline' // 这个不能自动 import 不知为何
import { BiliFreshSpaceIconDynamicFeed } from './bili-fresh-space-icons'
import {
  BiliHistoryRecordIconDeviceComputer,
  BiliHistoryRecordIconDevicePhone,
  BiliHistoryRecordIconLogo,
  BiliHistoryRecordIconTrash,
} from './bili-history-record-icons'
import { defineSvgFillComponent } from './util'

export const IconForLike = IconPhThumbsUpDuotone
export const IconForDislike = IconPhThumbsDownDuotone
export const IconForConfig = IconParkOutlineConfig
export const IconForPlayer = IconParkOutlinePlayTwo
export const IconForOpenExternalLink = IconMaterialSymbolsLightOpenInNew

// general

// #region ↑↓
export const IconForTimeAsc = IconMdiSortClockDescending
export const IconForTimeDesc = IconMdiSortClockAscending

// https://github.com/tabler/tabler-icons/issues/1457
// export const IconForAsc = IconOcticonSortAsc16
// export const IconForDesc = IconOcticonSortDesc16
// export const IconForAsc = IconTablerSortAscending2
// export const IconForDesc = IconTablerSortDescending2
export const IconForAsc = IconTablerSortAscending
export const IconForDesc = IconTablerSortDescending

// 同类
// export const IconForSortAToZ = IconPrimeSortAlphaDown
// export const IconForSortZToA = IconPrimeSortAlphaAltDown
// export const IconForSortAToZ = IconMdiSortAlphabeticalAscending
// export const IconForSortZToA = IconMdiSortAlphabeticalDescending
// export const IconForSortAToZ = IconMdiSortAlphabeticalAscendingVariant
// export const IconForSortZToA = IconMdiSortAlphabeticalDescendingVariant
export const IconForSortAToZ = IconFluentTextSortAscending20Filled
export const IconForSortZToA = IconFluentTextSortDescending20Filled

// #endregion

export const IconForInfo = IconParkOutlineInfo
export { IconAnimatedChecked } from './animated-checked'

// orders
export const IconForDefaultOrder = IconMdiShuffleDisabled
export const IconForShuffle = IconCuidaShuffleOutline
export const IconForTimestamp = IconParkOutlineTime

// Tabs
// export const IconForPhone = IconParkOutlineIphone
// export const IconForPc = IconParkOutlineComputer
export const IconForPhone = BiliHistoryRecordIconDevicePhone
export const IconForPc = BiliHistoryRecordIconDeviceComputer
export const IconForFollowedOnly = IconParkOutlineConcern
// export const IconForDynamicFeed = IconParkOutlineTumblr
export const IconForDynamicFeed = BiliFreshSpaceIconDynamicFeed
export const IconForFav = IconCarbonStar
export const IconForFaved = IconCarbonStarFilled // faved variant
export const IconForHot = IconParkOutlineFire
export const IconForSpaceUpload = IconLineMdUploadingLoop
// export const IconForHistory = IconLucideClock
export const IconForHistory = BiliHistoryRecordIconLogo

// actions
export const IconForBlacklist = IconParkOutlinePeopleDelete
export const IconForReset = IconParkOutlineReturn
export const IconForCopy = IconParkOutlineCopy
export const IconForLoading = IconSvgSpinnersBarsRotateFade
// export const IconForDelete = IconMaterialSymbolsDeleteOutlineRounded
export const IconForDelete = BiliHistoryRecordIconTrash
export const IconForMove = IconParkOutlineTransferData
export const IconForEdit = IconParkOutlineWrite

const LIVE_GIF = `data:image/gif;base64,R0lGODlhGAAYAJECAP7+/v///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTI2NTYzMDc2RTNDMTFFREJENEJEMzUxOTQzQjMxMkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTI2NTYzMDg2RTNDMTFFREJENEJEMzUxOTQzQjMxMkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMjY1NjMwNTZFM0MxMUVEQkQ0QkQzNTE5NDNCMzEyRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMjY1NjMwNjZFM0MxMUVEQkQ0QkQzNTE5NDNCMzEyRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAkEAAIALAAAAAAYABgAAAI5lI+py+0Po2QhTFXrRdlu031gJgqhpI0pdJ4sacJv6j6trABeTOMcfFslgp7ar4fcDVcyX+kJjToKACH5BAkEAAIALAAAAAAYABgAAAI2lI+py+0Po5xUhFDRvdls3H0T522SaJkRikKs6qptAr+kYoOzJvc37dPBgKQco3YbdpbM5qQAACH5BAkEAAIALAAAAAAYABgAAAI3lI+py+0Po5y02hhykHqLzmkGiImfCZHkkh0qmrztOSuyt8bmzfC0Z9sJa7qZLwhEwS7MpnNSAAAh+QQJBAACACwAAAAAGAAYAAACPJSPqcvtD6OctJoQ7MFYC55dYQSKHcmZo3J+qdsmJRzO7DvbMs7HSN5b/YIqBvCkGyKJixds4/NIp1RHAQAh+QQJBAACACwAAAAAGAAYAAACOpSPqcvtD6OcLwSarMVHXy54YKhJIrmhn3K25eKmJ/vGa1bnKS3rN2IzzHC94q/jE754yNVyBI1KIQUAIfkECQQAAgAsAAAAABgAGAAAAjmUj6nL7Q+jnLSaEOzBePbLSVwmjGJYopCZfmnDxmoif6xSkzeN5ozfIuF6RBfPVhQeN66Z5gmNTgoAIfkECQQAAgAsAAAAABgAGAAAAjmUj6nL7Q+jnLRaETLSMnMfdJ4Bit8YlRgKqerauOibyCen2OGK1/Pf2wB3NOGNyPLteIfk5QmNTgoAIfkECQQAAgAsAAAAABgAGAAAAjeUj6nL7Q+jnCkEWu3FRm/uHdYUCiVUnk+qSewYvd/amrWKyF2t6DbcuwmBGZgv+OHxOMyms1kAACH5BAkEAAIALAAAAAAYABgAAAI5lI+py+0PowtBLkptwlUf7n1YaIBlF5kmpI6puz5t9tLxBLsCgCpzdxPZcjQfEajbFHVJkvMJtRQAACH5BAkEAAIALAAAAAAYABgAAAI1lI+py+0Po5wpBFrtxUZv7nGdJgqheJ5QSkasJb2bmsFmSyPyaCv73avNcC1fr1gsKZdMSAEAIfkECQQAAgAsAAAAABgAGAAAAjWUj6nL7Q+jnLRaEfI1Wd8ebKDYkR4WHqcyol7Llm4KJ+0tx69cI/i+8vGGQdUpl9sol0xIAQAh+QQJBAACACwAAAAAGAAYAAACNJSPqcvtD6OctNq7QsBCa+xtV9h8DJl5p5qaCtqJsZugNvuyN43sIlzTCXkHnJHISSqXiQIAIfkECQQAAgAsAAAAABgAGAAAAjKUj6nL7Q+jnLTai3MMPLDuLeDXkZwZKqNYsqebJqva0u86yy1e6/feQ9SGL43xiEwUAAAh+QQJBAACACwAAAAAGAAYAAACM5SPqcvtD6OctNp7Q8BCa+xtzDd6JamEp5iai2qgcEvCc2K7N5LXLi3qsXCy4pCDTCoXBQAh+QQJBAACACwAAAAAGAAYAAACNJSPqcvtD6OctNoYcrhC7+txIag1mVkuY/exp5qOayLHqVK/M5J/+9Ez/IQvF7DISSqXkAIAIfkEBQQAAgAsAAAAABgAGAAAAjKUj6nL7Q+jnFSEUNG92WzcfZ21jWJYRucJranyutwig2xSey+e5nQPnMGEMeHoiExCCgA7`
export function IconForLive({
  active = false,
  ...props
}: {
  active?: boolean
  width?: string | number
  height?: string | number
  className?: string
}) {
  if (active) {
    return <img {...props} src={LIVE_GIF} />
  } else {
    return <IconMaterialSymbolsBarChart {...props} />
  }
}

export const IconForWatchlater = defineSvgFillComponent(
  <svg viewBox='0 0 20 20'>
    <path d='M10 3.125a6.875 6.875 0 1 0 4.86 11.737.625.625 0 0 1 .884.884 8.125 8.125 0 1 1 2.331-4.844.625.625 0 1 1-1.242-.138A6.875 6.875 0 0 0 10 3.124z' />
    <path d='M15.391 9.141a.625.625 0 0 1 .884 0l1.225 1.225 1.225-1.225a.625.625 0 1 1 .884.884l-1.52 1.52a.833.833 0 0 1-1.178 0l-1.52-1.52a.625.625 0 0 1 0-.884z' />
    <path d='M12.5 9.278a.833.833 0 0 1 0 1.443l-3.126 1.805a.833.833 0 0 1-1.25-.722V8.195a.833.833 0 0 1 1.25-.721l3.125 1.804z' />
  </svg>,
)

export const clsIconTextWrapper = 'inline-flex items-center justify-center line-height-[0]'

export function withDescIcon(label: string) {
  return (
    <span className={clsx(clsIconTextWrapper, 'gap-1px')}>
      {label}
      <IconForDesc className='size-16px' />
    </span>
  )
}

export function withAscIcon(label: string) {
  return (
    <span className={clsx(clsIconTextWrapper, 'gap-1px')}>
      {label}
      <IconForAsc className='size-16px' />
    </span>
  )
}
