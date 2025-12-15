SectionRecommend = RecHeader + video.slice(count).map(VideoCard) + 手动 useRefresh hook
PureRecommend = RecHeader + RecGrid
ModalFeed = SimpleHeader(without sticky) + RecGrid

---

Q: 如何方便地到处调用 onRefresh ?
A: OnRefreshContext.Provider 改到入口 `SectionRecommend` `PureRecommend` `ModalFeed`
