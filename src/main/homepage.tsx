import { APP_CLS_ROOT, APP_NAMESPACE, appWarn } from '$common'
import { AppRoot } from '$components/AppRoot'
import { PureRecommend } from '$components/PureRecommend'
import { registerSettingsGmCommand } from '$components/RecHeader/modals'
import { SectionRecommend } from '$components/SectionRecommend'
import { settings } from '$modules/settings'
import { isSafari } from '$ua'
import { tryAction, tryToRemove } from '$utility/dom'
import { FloatButton } from 'antd'
import { delay } from 'es-toolkit'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'

// in this entry, if no insert point found, render to document body
const isHashEntry = (location.hash || '').startsWith(`#/${APP_NAMESPACE}/`)

const bewlyEnabledSelector = 'html.bewly-design:not(:has(#i_cecream))'

function hasBewlyBewly() {
  return !isHashEntry && !!document.querySelector(bewlyEnabledSelector)
}

// 有时入口检测不到 bewly, bewly 比本脚本后运行, 在渲染完成后, 持续检测一段时间, 检测到取消渲染
async function tryDetectBewlyBewly() {
  return tryAction(
    bewlyEnabledSelector,
    () => {
      appWarn(`unmount for using bewly-design`)
      root?.unmount()
    },
    {
      pollTimeout: 5_000,
      warnOnTimeout: false,
    },
  )
}

let root: Root | undefined

export async function initHomepage() {
  // 提示有插件影响
  tryToRemove('.adblock-tips')
  // 变灰
  tryAction('html.gray', (el) => el.classList.remove('gray'))
  // 登录-大会员券
  tryToRemove('.vip-login-tip')

  registerSettingsGmCommand()

  if (hasBewlyBewly()) {
    appWarn(`quit for using bewly-design`)
    return
  }

  if (settings.pureRecommend) {
    await initHomepagePureRecommend()
  } else {
    await initHomepageSection()
  }
  tryDetectBewlyBewly()
}

async function initHomepageSection() {
  const timeout = 10 * 1000 // 10s
  const timeoutAt = Date.now() + timeout

  let insert: ((reactNode: HTMLElement) => void) | undefined
  while (Date.now() <= timeoutAt) {
    if (document.querySelector('.bili-feed4-layout')) {
      insert = (reactNode) =>
        document.querySelector('.bili-feed4-layout')?.insertAdjacentElement('afterbegin', reactNode)
      break
    }
    await delay(200)
  }

  if (!insert) {
    appWarn(`init fail`)
    return
  }

  // attach to dom
  const recommendContainer = document.createElement('section')
  recommendContainer.classList.add(APP_CLS_ROOT)
  insert(recommendContainer)

  // react render
  root = createRoot(recommendContainer)
  root.render(
    <AppRoot injectGlobalStyle renderAppComponent>
      <SectionRecommend />
    </AppRoot>,
  )

  // header
  // https://github.com/magicdawn/bilibili-gate/issues/30
  // SectionRecommend: 这个 header channel fixed 样式有问题
  // 尝试修复太复杂了, 这里直接移除. 其功能有替代: 滚动到首页顶部查看分区
  tryToRemove('.bili-feed4 .header-channel')
}

async function initHomepagePureRecommend() {
  // let bilibili default content run
  if (isSafari) await delay(500)

  tryToRemove('#i_cecream .bili-feed4-layout') // main content
  tryToRemove('.bili-feed4 .header-channel')
  tryToRemove('.palette-button-wrap') // 右侧浮动按钮

  const biliLayout = document.createElement('div')
  biliLayout.classList.add('bili-feed4-layout', 'pure-recommend')

  const insertFn = (reactContainer: HTMLElement) => document.body.appendChild(reactContainer)
  insertFn(biliLayout)

  const reactContainer = document.createElement('section')
  reactContainer.classList.add(APP_CLS_ROOT)
  biliLayout.appendChild(reactContainer)

  // react render
  root = createRoot(reactContainer)
  root.render(
    <AppRoot injectGlobalStyle renderAppComponent>
      <PureRecommend />
      <FloatButton.BackTop
        style={{
          // right
          insetInlineEnd: 'var(--back-top-right, 24px)',
        }}
      />
    </AppRoot>,
  )
}
