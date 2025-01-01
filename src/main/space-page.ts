import { APP_NAME } from '$common'
import { styled } from '$libs'
import { tryAction } from '$utility/dom'

export async function initSpacePage() {
  addDynEntry()
}

async function addDynEntry() {
  const mid = parseMid()
  if (!mid) return

  const oldSelector = '.h-action'
  const oldBtnHtml = `<a
    href="https://www.bilibili.com/?dyn-mid=${mid}"
    class="h-f-btn"
    style="width: auto; padding-inline: 15px;">${APP_NAME} 动态</a>`

  const newBtnClassName = styled.createClass`
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 34px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text_white);
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.14);
    transition: all 0.3s;
    margin-right: 24px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
  `
  const newSelector = '.upinfo .operations'
  const newBtnHmtl = `<a
    href="https://www.bilibili.com/?dyn-mid=${mid}"
    class="${newBtnClassName}">${APP_NAME} 动态</a>`

  await tryAction(
    [oldSelector, newSelector].join(','),
    (container) => {
      if (container.matches(oldSelector)) {
        container?.insertAdjacentHTML('afterbegin', oldBtnHtml)
      } else {
        container?.insertAdjacentHTML('afterbegin', newBtnHmtl)
      }
    },
    {
      pollTimeout: 10_000,
      pollInterval: 1_000,
    },
  )
}

function parseMid() {
  const url = new URL(location.href)
  const mid = url.pathname
    .split('/')
    .map((x) => x.trim())
    .filter((x) => x)[0]
  if (!mid || !/^\d+$/.test(mid)) return
  return mid
}
