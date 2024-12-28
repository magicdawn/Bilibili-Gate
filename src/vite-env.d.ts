// global scope

declare const __SCRIPT_VERSION__: string

interface Window {
  documentPictureInPicture:
    | {
        requestWindow(options: {
          width?: number
          height?: number
          disallowReturnToOpener?: boolean
        }): Promise<Window>
      }
    | undefined
}

interface VMScriptGMTabOptions {
  /** tampermonkey only, https://www.tampermonkey.net/documentation.php?locale=en#api:GM_openInTab */
  setParent?: boolean
}

interface VMScriptGMObjectVMExtensions {
  download: (url: string, name: string) => Promise<Blob> | void
  download: (options: VMScriptGMDownloadOptions) => Promise<Blob> | void
}

// Override Vite's default CSS module type to force explicit type definitions
type CSSModuleClasses = never

declare module '*.css' {
  never
}
declare module '*.scss' {
  never
}

declare module 'core-js-pure/actual/disposable-stack' {
  export default DisposableStack
}
declare module 'core-js-pure/actual/async-disposable-stack' {
  export default AsyncDisposableStack
}
