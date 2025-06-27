import { baseDebug } from '$common'
import cssVars from '$common/css-vars-export.module.scss'

const debug = baseDebug.extend('components:css-vars')
debug(':export = %O', cssVars)

export const cssVar = (id: string) => {
  if (!id.startsWith('--')) id = `--${id}`
  return `var(${id})`
}

export const videoCardBorderRadiusValue = cssVar(cssVars.appVideoCardBorderRadiusId)

// colors
export const primaryColorValue = cssVar(cssVars.appPrimaryColorId)
export const borderColorValue = cssVar(cssVars.appBorderColorId)
export const textColorValue = cssVar(cssVars.appTextColorId)

export const bgValue = cssVar(cssVars.appBgId)
export const bgLv1Value = cssVar(cssVars.appBgLv1Id)
export const bgLv2Value = cssVar(cssVars.appBgLv2Id)
export const bgLv3Value = cssVar(cssVars.appBgLv3Id)
