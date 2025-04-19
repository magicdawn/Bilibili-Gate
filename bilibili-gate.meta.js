// ==UserScript==
// @name         Bilibili-Gate
// @namespace    https://magicdawn.fun
// @version      0.32.1.5-gf33cf25
// @author       magicdawn
// @description  Bilibili 自定义首页
// @license      MIT
// @icon         https://www.bilibili.com/favicon.ico
// @homepageURL  https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate
// @supportURL   https://github.com/magicdawn/bilibili-gate/issues
// @downloadURL  https://raw.githubusercontent.com/magicdawn/Bilibili-Gate/refs/heads/release-nightly/bilibili-gate.user.js
// @updateURL    https://raw.githubusercontent.com/magicdawn/Bilibili-Gate/refs/heads/release-nightly/bilibili-gate.meta.js
// @match        https://www.bilibili.com/
// @match        https://www.bilibili.com/?*
// @match        https://www.bilibili.com/index.html
// @match        https://www.bilibili.com/index.html?*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/watchlater?*
// @match        https://www.bilibili.com/bangumi/play/*
// @match        https://space.bilibili.com/*
// @require      https://registry.npmmirror.com/axios/0.27.2/files/dist/axios.min.js
// @require      https://registry.npmmirror.com/react/18.3.1/files/umd/react.production.min.js
// @require      https://registry.npmmirror.com/react-dom/18.3.1/files/umd/react-dom.production.min.js
// @require      https://registry.npmmirror.com/ua-parser-js/1.0.39/files/dist/ua-parser.min.js
// @require      https://registry.npmmirror.com/framer-motion/12.7.4/files/dist/framer-motion.js
// @require      https://registry.npmmirror.com/localforage/1.10.0/files/dist/localforage.min.js
// @require      https://registry.npmmirror.com/dayjs/1.11.13/files/dayjs.min.js
// @require      https://registry.npmmirror.com/dayjs/1.11.13/files/plugin/duration.js
// @require      https://registry.npmmirror.com/@ant-design/cssinjs/1.23.0/files/dist/umd/cssinjs.min.js
// @require      https://registry.npmmirror.com/antd/5.24.7/files/dist/antd-with-locales.min.js
// @tag          bilibili
// @connect      app.bilibili.com
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.listValues
// @grant        GM.openInTab
// @grant        GM.registerMenuCommand
// @grant        GM.setClipboard
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_download
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==