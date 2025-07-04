import createEmotion from '@emotion/css/create-instance'
import { css, Global } from '@emotion/react'
import { useHover } from 'ahooks'
import { App } from 'antd'
import { APP_CLS_ROOT, APP_NAMESPACE } from '$common'
import { useLessFrequentFn } from '$common/hooks/useLessFrequentFn'
import { AppRoot } from '$components/AppRoot'
import { openNewTab } from '$modules/gm'
import { settings } from '$modules/settings'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import { QueryKey } from '../index.shared'

export function renderInPipWindow(newHref: string, pipWindow: Window) {
  const cssInsertContainer = pipWindow.document.head
  const { cache } = createEmotion({
    key: 'pip-window',
    container: cssInsertContainer,
  })

  // copy related stylesheets: 主要是 uno.css
  Array.from(document.querySelectorAll('style'))
    .filter((s) => {
      return s.textContent?.includes(APP_NAMESPACE)
    })
    .forEach((s) => {
      const style = pipWindow.document.createElement('style')
      style.textContent = s.textContent
      pipWindow.document.head.appendChild(style)
    })

  const container = document.createElement('div')
  container.classList.add(APP_CLS_ROOT)
  container.style.lineHeight = '0'
  pipWindow.document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    <AppRoot emotionCache={cache} styleProviderProps={{ container: cssInsertContainer }} injectGlobalStyle>
      <App message={{ getContainer: () => pipWindow.document.body }}>
        <PipWindowContent newHref={newHref} pipWindow={pipWindow} />
      </App>
    </AppRoot>,
  )
}

export function PipWindowContent({ newHref, pipWindow }: { pipWindow: Window; newHref: string }) {
  const hovering = useHover(pipWindow.document.documentElement)
  const [locked, setLocked] = useState(() => settings.pipWindow.defaultLocked)

  return (
    <>
      <Global
        styles={[
          css`
            * {
              box-sizing: border-box;
            }
            :root,
            body,
            iframe {
              margin: 0;
              padding: 0;
              overscroll-behavior: none;
            }
          `,
        ]}
      />

      <iframe src={newHref} className='h-100vh w-full border-none' />

      <LockOverlay locked={locked} />

      <div
        className={clsx(
          'fixed right-10px top-10px z-9999 flex-row-reverse items-center gap-x-6px',
          hovering ? 'flex' : 'hidden',
        )}
      >
        <CloseThenOpenButton pipWindow={pipWindow} newHref={newHref} />
        <LockButton locked={locked} setLocked={setLocked} />
      </div>
    </>
  )
}

const actionButtonExtraClassName = '[&_svg]:size-14px'

function LockOverlay({ locked }: { locked: boolean }) {
  const { message } = App.useApp()
  const onOverlayClick = useLessFrequentFn(() => {
    message.info('请先点击右上角 🔓解锁按钮 解锁')
  }, 3)

  return (
    locked && (
      <div
        className={clsx('locked-overlay', 'fixed inset-0 z-9999 select-none bg-transparent')}
        onClick={onOverlayClick}
      />
    )
  )
}

function CloseThenOpenButton({ newHref, pipWindow }: { pipWindow: Window; newHref: string }) {
  const onClick = () => {
    pipWindow.close()
    const u = new URL(newHref)
    u.searchParams.delete(QueryKey.PlayerScreenMode)
    u.searchParams.delete(QueryKey.ForceAutoPlay)
    openNewTab(u.href)
  }

  return (
    <VideoCardActionButton
      inlinePosition={'right'}
      icon={<IconRadixIconsOpenInNewWindow />}
      tooltip={'新窗口打开'}
      onClick={onClick}
      className={actionButtonExtraClassName}
    />
  )
}

function CloseButton({ pipWindow }: { pipWindow: Window }) {
  return (
    <VideoCardActionButton
      inlinePosition={'right'}
      icon={<IconRadixIconsCross2 />}
      tooltip={'关闭'}
      className={actionButtonExtraClassName}
      onClick={() => {
        pipWindow.close()
      }}
    />
  )
}

function LockButton({
  locked,
  setLocked,
}: {
  locked: boolean
  setLocked: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <VideoCardActionButton
      inlinePosition={'right'}
      icon={locked ? <IconRadixIconsLockClosed /> : <IconRadixIconsLockOpen1 />}
      tooltip={locked ? '已锁定, 点击解锁' : '已解锁, 点击锁定'}
      className={actionButtonExtraClassName}
      onClick={() => setLocked((x) => !x)}
    />
  )
}
