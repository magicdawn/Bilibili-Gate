// use named expoorts
// so that vscode can find these imports

// vscode syntax highlight 只支持特定 tag
// https://github.com/magicdawn/magicdawn/issues/152#issuecomment-1703950025
import { css as generateClassName } from '@emotion/css'
export const styled = { generateClassName }

export { default as axios } from 'axios'

/**
 * why not `cx` from '@emotion/css'
 * @emotion/css/cx will merge class into 1 class, cause u can not use classname to querySelector
 * e.g CardClassNames.card & CardClassNames.cardActive
 */
export { default as cx } from 'classnames'
