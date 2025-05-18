import createEmotion from '@emotion/css/create-instance'
import { css, Global } from '@emotion/react'
import { useHover } from 'ahooks'
import { App } from 'antd'
import { APP_CLS_ROOT } from '$common'
import { useLessFrequentFn } from '$common/hooks/useLessFrequentFn'
import { AppRoot } from '$components/AppRoot'
import { colorPrimaryValue } from '$components/css-vars'
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

  const container = document.createElement('div')
  container.classList.add(APP_CLS_ROOT)
  container.style.lineHeight = '0'
  pipWindow.document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    <AppRoot emotionCache={cache} styleProviderProps={{ container: cssInsertContainer }} injectGlobalStyle>
      <App component={false} message={{ getContainer: () => pipWindow.document.body }}>
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

      <iframe
        src={newHref}
        css={css`
          width: 100%;
          height: 100vh;
          border: none;
        `}
      />

      <LockOverlay locked={locked} />

      <div
        css={css`
          position: fixed;
          z-index: 9999;
          right: 10px;
          top: 10px;
          display: ${hovering ? 'flex' : 'none'};
          column-gap: 6px;
          flex-direction: row-reverse;
        `}
      >
        <CloseThenOpenButton pipWindow={pipWindow} newHref={newHref} />
        <LockButton locked={locked} setLocked={setLocked} />
      </div>
    </>
  )
}

const S = {
  button: css`
    /* border: 1px solid ${colorPrimaryValue}; */
    svg {
      width: 14px;
      height: 14px;
    }
  `,
}

function LockOverlay({ locked }: { locked: boolean }) {
  const { message } = App.useApp()
  const onOverlayClick = useLessFrequentFn(() => {
    message.info('请先点击右上角 🔓解锁按钮 解锁')
  }, 3)

  return (
    locked && (
      <div
        className='locked-overlay'
        onClick={onOverlayClick}
        css={css`
          position: fixed;
          inset: 0;
          z-index: 9999;
          background-color: transparent;
          user-select: none;
        `}
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
      css={S.button}
    />
  )
}

function CloseButton({ pipWindow }: { pipWindow: Window }) {
  return (
    <VideoCardActionButton
      inlinePosition={'right'}
      icon={<IconRadixIconsCross2 />}
      tooltip={'关闭'}
      css={S.button}
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
      css={S.button}
      onClick={() => setLocked((x) => !x)}
    />
  )
}
