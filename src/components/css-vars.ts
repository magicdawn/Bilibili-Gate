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
export const appPrimaryColorValue = cssVar(cssVars.appPrimaryColorId)
export const appBorderColorValue = cssVar(cssVars.appBorderColorId)
export const appTextColorValue = cssVar(cssVars.appTextColorId)

export const appBgValue = cssVar(cssVars.appBgId)
export const appBgLv1Value = cssVar(cssVars.appBgLv1Id)
export const appBgLv2Value = cssVar(cssVars.appBgLv2Id)
export const appBgLv3Value = cssVar(cssVars.appBgLv3Id)
