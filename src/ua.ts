import UAParser from 'ua-parser-js'

const parsed = UAParser()
export { parsed as parsedUA }

/**
 * os
 */
export const isMac = parsed.os.name?.toLowerCase() === 'mac os'

/**
 * browser
 */
const parsedBrowserName = parsed.browser.name || ''
const isBrand = (brand: string) => new RegExp(String.raw`\b${brand}\b`, 'i').test(parsedBrowserName)

export const isSafari = isBrand('safari') // `safari` | `mobile safari`
export const isFirefox = isBrand('firefox')
export const isEdge = isBrand('edge')
