import { setupLargePreview } from '$components/LargePreview/large-preview-setup'

export function initDefaultHomepageLargePreview() {
  setupLargePreview({
    // 去除 skeleton card
    itemsSelector:
      '.bili-feed4 .feed-card:has(.bili-video-card__wrap > a),.bili-feed4 .bili-feed-card:has(.bili-video-card__wrap > a)',
    observerTarget: document.querySelector('.recommended-container_floor-aside'),
  })
}
