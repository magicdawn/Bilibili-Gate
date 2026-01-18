# safari

## userscripts 脚本管理器适配

- 只有 `GM.` API, no `GM_` API
- 没有 `unsafeWindow`
- 没有 `GM.registerMenuCommand`

## CSS

safari container-type still use layout containment
https://stackoverflow.com/a/74606435/2822866
return isSafari ? createPortal(popoverEl, document.body) : popoverEl
