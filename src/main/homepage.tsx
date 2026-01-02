import { FloatButton } from 'antd'
import { delay } from 'es-toolkit'
import { createRoot, type Root } from 'react-dom/client'
import { APP_CLS_ROOT, appWarn } from '$common'
import { AppRoot } from '$components/AppRoot'
import { GateFloatEntry } from '$components/GateFloatEntry'
import { registerSettingsGmCommand } from '$components/RecHeader/modals'
import { PureRecommend } from '$components/Recommends/PureRecommend'
import { settings } from '$modules/settings'
import { getOnlyTab, inGateEntry } from '$routes'
import { isSafari } from '$ua'
import { poll, tryAction, tryToRemove } from '$utility/dom'

const bewlyEnabledSelector = 'html.bewly-design:not(:has(#i_cecream,#app))'
function hasBewlyBewly() {
  return !!document.querySelector(bewlyEnabledSelector)
}

// 有时入口检测不到 bewly, bewly 比本脚本后运行, 在渲染完成后, 持续检测一段时间, 检测到取消渲染
function tryDetectBewlyBewly() {
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
  tryToRemove('.adblock-tips') // 提示有插件影响
  tryToRemove('.vip-login-tip') // 登录-大会员券
  tryAction('html.gray', (el) => el.classList.remove('gray')) // 变灰
  registerSettingsGmCommand()
  if (hasBewlyBewly()) {
    return appWarn(`quit for using bewly-design`)
  }

  const shouldInit = settings.pureRecommend || inGateEntry() || getOnlyTab()
  if (shouldInit) {
    await initHomepagePureRecommend()
    tryDetectBewlyBewly()
  } else {
    initHomepageGateFloatEntry()
  }
}

function initHomepageGateFloatEntry() {
  const container = document.createElement('section')
  container.classList.add(APP_CLS_ROOT)
  document.body.append(container)

  root = createRoot(container)
  root.render(
    <AppRoot antdSetup>
      <GateFloatEntry />
    </AppRoot>,
  )
}

async function initHomepagePureRecommend() {
  // let bilibili default content run
  if (isSafari) await delay(500)

  tryToRemove('#i_cecream .bili-feed4-layout, body > #app .bili-feed4-layout') // main content
  tryToRemove('.bili-feed4 .header-channel')
  tryToRemove('.palette-button-wrap') // 右侧浮动按钮

  const biliLayout = document.createElement('div')
  biliLayout.classList.add('bili-feed4-layout', 'pure-recommend', APP_CLS_ROOT)
  // biliLayout should come after header+channel
  await poll(() => document.querySelector('.bili-feed4 .bili-header'), { interval: 20, timeout: 2_000 })
  document.body.append(biliLayout)

  const container = document.createElement('div')
  biliLayout.append(container)
  root = createRoot(container)
  root.render(
    <AppRoot injectGlobalStyle antdSetup>
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
