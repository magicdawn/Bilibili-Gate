// ==UserScript==
// @name         Bilibili-Gate
// @namespace    https://magicdawn.fun
// @version      0.30.2
// @author       magicdawn
// @description  Bilibili 自定义首页
// @license      MIT
// @icon         https://www.bilibili.com/favicon.ico
// @homepageURL  https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate
// @supportURL   https://github.com/magicdawn/bilibili-gate/issues
// @downloadURL  https://github.com/magicdawn/bilibili-gate/raw/release/bilibili-gate.user.js
// @updateURL    https://github.com/magicdawn/bilibili-gate/raw/release/bilibili-gate.meta.js
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
// @require      https://registry.npmmirror.com/framer-motion/11.15.0/files/dist/framer-motion.js
// @require      https://registry.npmmirror.com/localforage/1.10.0/files/dist/localforage.min.js
// @require      https://registry.npmmirror.com/dayjs/1.11.13/files/dayjs.min.js
// @require      https://registry.npmmirror.com/dayjs/1.11.13/files/plugin/duration.js
// @require      https://registry.npmmirror.com/@ant-design/cssinjs/1.22.1/files/dist/umd/cssinjs.min.js
// @require      https://registry.npmmirror.com/antd/5.22.5/files/dist/antd-with-locales.min.js
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
// @grant        window.focus
// @run-at       document-end
// ==/UserScript==

(i=>{if(typeof GM_addStyle=="function"){GM_addStyle(i);return}const n=document.createElement("style");n.textContent=i,document.head.append(n)})(` @charset "UTF-8";
:root {
  --bilibili-gate--custom-font-family: "Alibaba PuHuiTi 3.0", "PingFang SC", HarmonyOS_Regular, "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.bilibili-gate-color-primary {
  color: var(--bilibili-gate--color-primary);
}

:root {
  --bilibili-gate--border-color: oklch(from var(--bilibili-gate--bg) calc(l - 0.05) c h);
  --bilibili-gate--bg--lv1: oklch(from var(--bilibili-gate--bg) calc(l - 0.04) c h);
  --bilibili-gate--bg--lv2: oklch(from var(--bilibili-gate--bg) calc(l - 0.08) c h);
  --bilibili-gate--bg--lv3: oklch(from var(--bilibili-gate--bg) calc(l - 0.12) c h);
}
:root.bilibili-gate-dark {
  --bilibili-gate--border-color: oklch(from var(--bilibili-gate--bg) calc(l + 0.07) c h);
  --bilibili-gate--bg--lv1: oklch(from var(--bilibili-gate--bg) calc(l + 0.03) c h);
  --bilibili-gate--bg--lv2: oklch(from var(--bilibili-gate--bg) calc(l + 0.08) c h);
  --bilibili-gate--bg--lv3: oklch(from var(--bilibili-gate--bg) calc(l + 0.12) c h);
}

.bilibili-gate-root {
  font-family: var(--custom-font-family--options--font-family, var(--bilibili-gate--custom-font-family)) !important;
  --back-top-right: 24px;
}
.bilibili-gate-root .bili-video-card a:not(.disable-hover):hover {
  color: var(--bilibili-gate--color-primary) !important;
}

@media (max-width: 1440px) {
  .bilibili-gate-root {
    --back-top-right: 16px;
  }
}
.primary-btn:disabled:active, .primary-btn:disabled:hover {
  cursor: wait;
  background-color: inherit;
}

.ant-btn {
  font-size: 13px;
}
.ant-btn:disabled {
  cursor: wait;
}

.ant-radio-button-wrapper-disabled {
  cursor: wait;
}

body .ant-tooltip a {
  color: #1677ff;
  transition: color 0.3s;
}
body .ant-tooltip a:visited {
  color: #1677ff;
}
body .ant-tooltip a:hover {
  color: #69b1ff;
}
body .ant-tooltip a:active {
  color: #0958d9;
}

body button:where(.ant-switch):focus, body button:where(.ant-switch):active {
  background-color: rgba(0, 0, 0, 0.25);
  outline: unset;
}

/**
B\u7AD9\u81EA\u5E26 css, \u5F71\u54CD\u4E86 solid button :focus \u6837\u5F0F
body button:focus, body button:active {
  background-color: transparent;
  outline: none;
}
 */
body .ant-btn.ant-btn-variant-solid:focus, body .ant-btn.ant-btn-variant-solid:active {
  color: var(--ant-button-primary-color);
  background: var(--ant-color-primary);
}._settings-group_1xm9d_1 {
  margin-bottom: 10px;
}
._settings-group_1xm9d_1 ._settings-group-title_1xm9d_4 {
  font-size: 2em;
  display: flex;
  align-items: center;
}
._settings-group_1xm9d_1 ._settings-group-sub-title_1xm9d_9 {
  font-size: 1.3em;
  display: flex;
  align-items: center;
  margin-top: 15px;
}
._settings-group_1xm9d_1 ._settings-group-content_1xm9d_15 {
  color: default;
}
._settings-group_1xm9d_1 ._settings-group-content_1xm9d_15 button:first-child {
  margin-left: 0;
}

._row_1xm9d_22 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

._tab-pane_1xm9d_28 {
  overflow-y: scroll;
  min-height: 362px;
  max-height: max(362px, 90vh - 121px);
}._bili-video-card_js289_1 {
  position: relative;
}
._bili-video-card_js289_1 .bili-video-card__stats--item {
  margin-right: 8px;
}

._preview-card-wrapper_js289_8 {
  z-index: 4;
}
/**
 * \u65B0\u7248\u9996\u9875
 * \u4F7F\u7528\u7684\u662F .video-card-body \u7684\u6837\u5F0F
 * \u5728B\u7AD9\u81EA\u5DF1\u7684\u9996\u9875\u4E2D, .bili-grid > 2200px \u662F\u5206 7 \u5217, .video-card-body > 2200px \u52066\u5217
 */
._video-grid_1j5py_7 {
  display: grid;
  position: relative;
  width: 100%;
  grid-gap: 20px 12px;
  grid-template-columns: repeat(var(--col), minmax(0, 1fr));
  --bilibili-gate--video-card--border-radius: 6px;
}

._new-card-style_1j5py_16 {
  --bilibili-gate--video-card--border-radius: 15px;
}

/**
 * bili-feed4
 * \u53D6\u81EA .battle-feed-area .battle-feed-body
 */
._video-grid-bili-feed4_1j5py_24 {
  grid-gap: 20px 20px;
}
._video-grid-bili-feed4_1j5py_24 .ant-divider-horizontal.ant-divider-with-text {
  margin-bottom: -15px;
  margin-top: -15px;
}
._video-grid-bili-feed4_1j5py_24 .ant-divider-horizontal.ant-divider-with-text:first-of-type {
  margin-top: 0;
}

@media (max-width: 1399px) {
  ._video-grid-bili-feed4_1j5py_24 {
    --col: 4;
  }
  ._video-grid-bili-feed4_1j5py_24._limit-one-line_1j5py_39 > *:nth-of-type(1n + 5) {
    display: none !important;
  }
  ._video-grid-bili-feed4_1j5py_24._limit-two-lines_1j5py_42 > *:nth-of-type(1n + 9) {
    display: none !important;
  }
}
@media (min-width: 1400px) {
  ._video-grid-bili-feed4_1j5py_24 {
    --col: 5;
  }
  ._video-grid-bili-feed4_1j5py_24._limit-one-line_1j5py_39 > *:nth-of-type(1n + 6) {
    display: none !important;
  }
  ._video-grid-bili-feed4_1j5py_24._limit-two-lines_1j5py_42 > *:nth-of-type(1n + 11) {
    display: none !important;
  }
}
/**
 * @container query
 */
._video-grid-container_1j5py_60 {
  container-type: inline-size;
}
._video-grid-container_1j5py_60._virtual-grid-enabled_1j5py_63 .virtuoso-grid-item {
  padding-bottom: var(--row-gap);
}
._video-grid-container_1j5py_60._virtual-grid-enabled_1j5py_63 .virtuoso-grid-item .bili-video-card {
  margin-bottom: 0;
  height: 100%;
}

._video-grid-custom_1j5py_71 {
  --col: 4;
  column-gap: 20px;
  row-gap: 0;
  --row-gap: clamp(20px, 1.4vw, 40px);
}
._video-grid-custom_1j5py_71 .bili-video-card {
  margin-bottom: var(--row-gap);
}
._video-grid-custom_1j5py_71 .ant-divider-horizontal.ant-divider-with-text {
  margin-bottom: 5px;
  margin-top: calc(10px - var(--row-gap));
}
._video-grid-custom_1j5py_71 .ant-divider-horizontal.ant-divider-with-text:first-of-type {
  margin-top: 0;
}

@container (width >= 1276px) {
  ._video-grid_1j5py_7._video-grid-custom_1j5py_71 {
    --col: 5;
  }
}
@container (inline-size >= 2080px) {
  ._video-grid_1j5py_7._video-grid-custom_1j5py_71 {
    --col: 6;
  }
}
@container (inline-size >= 2465px) {
  ._video-grid_1j5py_7._video-grid-custom_1j5py_71 {
    --col: 7;
  }
}
@container (inline-size >= 2860px) {
  ._video-grid_1j5py_7._video-grid-custom_1j5py_71 {
    --col: 8;
  }
}
@container (inline-size >= 3265px) {
  ._video-grid_1j5py_7._video-grid-custom_1j5py_71 {
    --col: 9;
  }
}
@container (inline-size >= 3680px) {
  ._video-grid_1j5py_7._video-grid-custom_1j5py_71 {
    --col: 10;
  }
}
/**
 * \u53CC\u5217\u6A21\u5F0F
 */
._narrow-mode_1j5py_121 {
  --col: 2 !important;
} .\\[refresh\\:scroll\\]{refresh:scroll;}.visible{visibility:visible;}.invisible{visibility:hidden;}.absolute{position:absolute;}.fixed{position:fixed;}.position-relative{position:relative;}.sticky{position:sticky;}.static{position:static;}.top-\\[-1px\\]{top:-1px;}.grid{display:grid;}.m13{margin:13px;}.m14{margin:14px;}.m16\\.52{margin:16.52px;}.m160{margin:160px;}.m19\\.833{margin:19.833px;}.m23\\.999{margin:23.999px;}.m239\\.82{margin:239.82px;}.m24{margin:24px;}.m29\\.756{margin:29.756px;}.m33{margin:33px;}.m434\\.8{margin:434.8px;}.m5{margin:5px;}.m8{margin:8px;}.mx-4{margin-left:4px;margin-right:4px;}.mb{margin-bottom:4px;}.mb-5px{margin-bottom:5px;}.ml,.ml-4px{margin-left:4px;}.ml-1{margin-left:1px;}.ml-10,.ml-10px{margin-left:10px;}.ml-12{margin-left:12px;}.ml-15{margin-left:15px;}.ml-2{margin-left:2px;}.ml-5px{margin-left:5px;}.ml-6px{margin-left:6px;}.mr,.mr-4,.mr-4px{margin-right:4px;}.mr-10px{margin-right:10px;}.mr-2{margin-right:2px;}.mr-20px{margin-right:20px;}.mr-5,.mr-5px{margin-right:5px;}.ms{margin-inline-start:4px;}.mt{margin-top:4px;}.mt--1px{margin-top:-1px;}.mt--2,.mt--2px{margin-top:-2px;}.mt-10{margin-top:10px;}.mt-6px{margin-top:6px;}.mt-8{margin-top:8px;}.first\\:mt-0:first-child{margin-top:0;}.m-inline-4{margin-inline-start:4px;margin-inline-end:4px;}.m-inline-5{margin-inline-start:5px;margin-inline-end:5px;}.block{display:block;}.inline-block{display:inline-block;}.contents{display:contents;}.hidden{display:none;}.max-h-250px{max-height:250px;}.max-w-350px{max-width:350px;}.min-w-300px{min-width:300px;}.w-114px{width:114px;}.flex{display:flex;}.inline-flex{display:inline-flex;}.flex-1{flex:1 1 0%;}.flex-shrink{flex-shrink:1;}.flex-col{flex-direction:column;}.flex-wrap{flex-wrap:wrap;}.transform{transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite;}.cursor-pointer{cursor:pointer;}.items-center{align-items:center;}.justify-start{justify-content:flex-start;}.justify-center{justify-content:center;}.gap-0{gap:0;}.gap-10{gap:10px;}.gap-1px{gap:1px;}.gap-4,.gap-4px{gap:4px;}.gap-8px{gap:8px;}.gap-x-10{column-gap:10px;}.gap-y-10{row-gap:10px;}.gap-y-3{row-gap:3px;}.gap-y-5{row-gap:5px;}.gap-y-6{row-gap:6px;}.overflow-y-scroll{overflow-y:scroll;}.b,.border{border-width:1px;}.px{padding-left:4px;padding-right:4px;}.px-16px{padding-left:16px;padding-right:16px;}.pb-2px{padding-bottom:2px;}.pb1257{padding-bottom:1257px;}.pl-16px{padding-left:16px;}.pl-2px{padding-left:2px;}.ps{padding-inline-start:4px;}.p-block-10{padding-block-start:10px;padding-block-end:10px;}.text-20px{font-size:20px;}.font-size-14{font-size:14px;}.font-size-16{font-size:16px;}.line-height-\\[0\\]{line-height:0;}.line-height-\\[1\\]{line-height:1;}.tab{-moz-tab-size:4;-o-tab-size:4;tab-size:4;}.filter{filter:var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-drop-shadow) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia);}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transition-duration:150ms;}.ease,.ease-in-out{transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}.ease-out{transition-timing-function:cubic-bezier(0, 0, 0.2, 1);}.size-14px{width:14px;height:14px;}.size-15,.size-15px{width:15px;height:15px;}.size-16px{width:16px;height:16px;}.size-18,.size-18px{width:18px;height:18px;}.size-25{width:25px;height:25px;}.size-26{width:26px;height:26px;}.size-32px{width:32px;height:32px;}.size-40px{width:40px;height:40px;} body .bili-video-card__skeleton--cover, body .bili-video-card__skeleton--text, body .bili-video-card__skeleton--light, body .bili-video-card__skeleton--avatar {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.06) 25%, rgba(0, 0, 0, 0.15) 37%, rgba(0, 0, 0, 0.06) 63%);
}
html.bilibili-gate-dark .bili-video-card__skeleton--avatar {
  background-color: #444;
}
.bili-video-card__skeleton--text.tiny {
  margin-top: 4px;
  width: 15%;
}

._skeleton-active_npcc8_15 .bili-video-card__skeleton--cover,
._skeleton-active_npcc8_15 .bili-video-card__skeleton--text,
._skeleton-active_npcc8_15 .bili-video-card__skeleton--light,
._skeleton-active_npcc8_15 .bili-video-card__skeleton--avatar {
  background-size: 400% 100%;
  animation-name: _ant-skeleton-loading_npcc8_1;
  animation-duration: 2.165s;
  animation-timing-function: ease;
  animation-iteration-count: infinite;
}

@keyframes _ant-skeleton-loading_npcc8_1 {
  0% {
    background-position: 100% 50%;
  }
  61.8%, 100% {
    background-position: 0 50%;
  }
} `);

(async function (dayjs, duration, React, UAParser, antd, axios, cssinjs, zhCN, require$$0, localforage, framerMotion) {
  'use strict';

  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
    if (e) {
      for (const k in e) {
        if (k !== 'default') {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }

  const React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });
  var _a, _head, _tail, _size, _size2, _cache, _oldCache, _maxSize, _maxAge, _onEviction, _QuickLRU_instances, emitEvictions_fn, deleteIfExpired_fn, getOrDeleteIfExpired_fn, getItemValue_fn, peek_fn, set_fn, moveToRecent_fn, entriesAscending_fn, _b, _c;
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var explicitResourceManagement = {};
  var esnext_suppressedError_constructor = {};
  var globalThis_1;
  var hasRequiredGlobalThis;
  function requireGlobalThis() {
    if (hasRequiredGlobalThis) return globalThis_1;
    hasRequiredGlobalThis = 1;
    var check = function(it) {
      return it && it.Math === Math && it;
    };
    globalThis_1 = // eslint-disable-next-line es/no-global-this -- safe
    check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || // eslint-disable-next-line no-restricted-globals -- safe
    check(typeof self == "object" && self) || check(typeof commonjsGlobal == "object" && commonjsGlobal) || check(typeof globalThis_1 == "object" && globalThis_1) || // eslint-disable-next-line no-new-func -- fallback
    /* @__PURE__ */ function() {
      return this;
    }() || Function("return this")();
    return globalThis_1;
  }
  var objectGetOwnPropertyDescriptor = {};
  var fails;
  var hasRequiredFails;
  function requireFails() {
    if (hasRequiredFails) return fails;
    hasRequiredFails = 1;
    fails = function(exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };
    return fails;
  }
  var descriptors;
  var hasRequiredDescriptors;
  function requireDescriptors() {
    if (hasRequiredDescriptors) return descriptors;
    hasRequiredDescriptors = 1;
    var fails2 = requireFails();
    descriptors = !fails2(function() {
      return Object.defineProperty({}, 1, { get: function() {
        return 7;
      } })[1] !== 7;
    });
    return descriptors;
  }
  var functionBindNative;
  var hasRequiredFunctionBindNative;
  function requireFunctionBindNative() {
    if (hasRequiredFunctionBindNative) return functionBindNative;
    hasRequiredFunctionBindNative = 1;
    var fails2 = requireFails();
    functionBindNative = !fails2(function() {
      var test = (function() {
      }).bind();
      return typeof test != "function" || test.hasOwnProperty("prototype");
    });
    return functionBindNative;
  }
  var functionCall;
  var hasRequiredFunctionCall;
  function requireFunctionCall() {
    if (hasRequiredFunctionCall) return functionCall;
    hasRequiredFunctionCall = 1;
    var NATIVE_BIND = requireFunctionBindNative();
    var call = Function.prototype.call;
    functionCall = NATIVE_BIND ? call.bind(call) : function() {
      return call.apply(call, arguments);
    };
    return functionCall;
  }
  var objectPropertyIsEnumerable = {};
  var hasRequiredObjectPropertyIsEnumerable;
  function requireObjectPropertyIsEnumerable() {
    if (hasRequiredObjectPropertyIsEnumerable) return objectPropertyIsEnumerable;
    hasRequiredObjectPropertyIsEnumerable = 1;
    var $propertyIsEnumerable = {}.propertyIsEnumerable;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);
    objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
      var descriptor = getOwnPropertyDescriptor(this, V);
      return !!descriptor && descriptor.enumerable;
    } : $propertyIsEnumerable;
    return objectPropertyIsEnumerable;
  }
  var createPropertyDescriptor;
  var hasRequiredCreatePropertyDescriptor;
  function requireCreatePropertyDescriptor() {
    if (hasRequiredCreatePropertyDescriptor) return createPropertyDescriptor;
    hasRequiredCreatePropertyDescriptor = 1;
    createPropertyDescriptor = function(bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value
      };
    };
    return createPropertyDescriptor;
  }
  var functionUncurryThis;
  var hasRequiredFunctionUncurryThis;
  function requireFunctionUncurryThis() {
    if (hasRequiredFunctionUncurryThis) return functionUncurryThis;
    hasRequiredFunctionUncurryThis = 1;
    var NATIVE_BIND = requireFunctionBindNative();
    var FunctionPrototype = Function.prototype;
    var call = FunctionPrototype.call;
    var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);
    functionUncurryThis = NATIVE_BIND ? uncurryThisWithBind : function(fn) {
      return function() {
        return call.apply(fn, arguments);
      };
    };
    return functionUncurryThis;
  }
  var classofRaw;
  var hasRequiredClassofRaw;
  function requireClassofRaw() {
    if (hasRequiredClassofRaw) return classofRaw;
    hasRequiredClassofRaw = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var toString2 = uncurryThis({}.toString);
    var stringSlice = uncurryThis("".slice);
    classofRaw = function(it) {
      return stringSlice(toString2(it), 8, -1);
    };
    return classofRaw;
  }
  var indexedObject;
  var hasRequiredIndexedObject;
  function requireIndexedObject() {
    if (hasRequiredIndexedObject) return indexedObject;
    hasRequiredIndexedObject = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var fails2 = requireFails();
    var classof2 = requireClassofRaw();
    var $Object = Object;
    var split = uncurryThis("".split);
    indexedObject = fails2(function() {
      return !$Object("z").propertyIsEnumerable(0);
    }) ? function(it) {
      return classof2(it) === "String" ? split(it, "") : $Object(it);
    } : $Object;
    return indexedObject;
  }
  var isNullOrUndefined;
  var hasRequiredIsNullOrUndefined;
  function requireIsNullOrUndefined() {
    if (hasRequiredIsNullOrUndefined) return isNullOrUndefined;
    hasRequiredIsNullOrUndefined = 1;
    isNullOrUndefined = function(it) {
      return it === null || it === void 0;
    };
    return isNullOrUndefined;
  }
  var requireObjectCoercible;
  var hasRequiredRequireObjectCoercible;
  function requireRequireObjectCoercible() {
    if (hasRequiredRequireObjectCoercible) return requireObjectCoercible;
    hasRequiredRequireObjectCoercible = 1;
    var isNullOrUndefined2 = requireIsNullOrUndefined();
    var $TypeError = TypeError;
    requireObjectCoercible = function(it) {
      if (isNullOrUndefined2(it)) throw new $TypeError("Can't call method on " + it);
      return it;
    };
    return requireObjectCoercible;
  }
  var toIndexedObject;
  var hasRequiredToIndexedObject;
  function requireToIndexedObject() {
    if (hasRequiredToIndexedObject) return toIndexedObject;
    hasRequiredToIndexedObject = 1;
    var IndexedObject = requireIndexedObject();
    var requireObjectCoercible2 = requireRequireObjectCoercible();
    toIndexedObject = function(it) {
      return IndexedObject(requireObjectCoercible2(it));
    };
    return toIndexedObject;
  }
  var isCallable;
  var hasRequiredIsCallable;
  function requireIsCallable() {
    if (hasRequiredIsCallable) return isCallable;
    hasRequiredIsCallable = 1;
    var documentAll = typeof document == "object" && document.all;
    isCallable = typeof documentAll == "undefined" && documentAll !== void 0 ? function(argument) {
      return typeof argument == "function" || argument === documentAll;
    } : function(argument) {
      return typeof argument == "function";
    };
    return isCallable;
  }
  var isObject$2;
  var hasRequiredIsObject$1;
  function requireIsObject$1() {
    if (hasRequiredIsObject$1) return isObject$2;
    hasRequiredIsObject$1 = 1;
    var isCallable2 = requireIsCallable();
    isObject$2 = function(it) {
      return typeof it == "object" ? it !== null : isCallable2(it);
    };
    return isObject$2;
  }
  var getBuiltIn;
  var hasRequiredGetBuiltIn;
  function requireGetBuiltIn() {
    if (hasRequiredGetBuiltIn) return getBuiltIn;
    hasRequiredGetBuiltIn = 1;
    var globalThis2 = requireGlobalThis();
    var isCallable2 = requireIsCallable();
    var aFunction = function(argument) {
      return isCallable2(argument) ? argument : void 0;
    };
    getBuiltIn = function(namespace, method) {
      return arguments.length < 2 ? aFunction(globalThis2[namespace]) : globalThis2[namespace] && globalThis2[namespace][method];
    };
    return getBuiltIn;
  }
  var objectIsPrototypeOf;
  var hasRequiredObjectIsPrototypeOf;
  function requireObjectIsPrototypeOf() {
    if (hasRequiredObjectIsPrototypeOf) return objectIsPrototypeOf;
    hasRequiredObjectIsPrototypeOf = 1;
    var uncurryThis = requireFunctionUncurryThis();
    objectIsPrototypeOf = uncurryThis({}.isPrototypeOf);
    return objectIsPrototypeOf;
  }
  var environmentUserAgent;
  var hasRequiredEnvironmentUserAgent;
  function requireEnvironmentUserAgent() {
    if (hasRequiredEnvironmentUserAgent) return environmentUserAgent;
    hasRequiredEnvironmentUserAgent = 1;
    var globalThis2 = requireGlobalThis();
    var navigator2 = globalThis2.navigator;
    var userAgent = navigator2 && navigator2.userAgent;
    environmentUserAgent = userAgent ? String(userAgent) : "";
    return environmentUserAgent;
  }
  var environmentV8Version;
  var hasRequiredEnvironmentV8Version;
  function requireEnvironmentV8Version() {
    if (hasRequiredEnvironmentV8Version) return environmentV8Version;
    hasRequiredEnvironmentV8Version = 1;
    var globalThis2 = requireGlobalThis();
    var userAgent = requireEnvironmentUserAgent();
    var process2 = globalThis2.process;
    var Deno = globalThis2.Deno;
    var versions = process2 && process2.versions || Deno && Deno.version;
    var v8 = versions && versions.v8;
    var match2, version;
    if (v8) {
      match2 = v8.split(".");
      version = match2[0] > 0 && match2[0] < 4 ? 1 : +(match2[0] + match2[1]);
    }
    if (!version && userAgent) {
      match2 = userAgent.match(/Edge\/(\d+)/);
      if (!match2 || match2[1] >= 74) {
        match2 = userAgent.match(/Chrome\/(\d+)/);
        if (match2) version = +match2[1];
      }
    }
    environmentV8Version = version;
    return environmentV8Version;
  }
  var symbolConstructorDetection;
  var hasRequiredSymbolConstructorDetection;
  function requireSymbolConstructorDetection() {
    if (hasRequiredSymbolConstructorDetection) return symbolConstructorDetection;
    hasRequiredSymbolConstructorDetection = 1;
    var V8_VERSION = requireEnvironmentV8Version();
    var fails2 = requireFails();
    var globalThis2 = requireGlobalThis();
    var $String = globalThis2.String;
    symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails2(function() {
      var symbol = Symbol("symbol detection");
      return !$String(symbol) || !(Object(symbol) instanceof Symbol) || // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
      !Symbol.sham && V8_VERSION && V8_VERSION < 41;
    });
    return symbolConstructorDetection;
  }
  var useSymbolAsUid;
  var hasRequiredUseSymbolAsUid;
  function requireUseSymbolAsUid() {
    if (hasRequiredUseSymbolAsUid) return useSymbolAsUid;
    hasRequiredUseSymbolAsUid = 1;
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();
    useSymbolAsUid = NATIVE_SYMBOL && !Symbol.sham && typeof Symbol.iterator == "symbol";
    return useSymbolAsUid;
  }
  var isSymbol$1;
  var hasRequiredIsSymbol$1;
  function requireIsSymbol$1() {
    if (hasRequiredIsSymbol$1) return isSymbol$1;
    hasRequiredIsSymbol$1 = 1;
    var getBuiltIn2 = requireGetBuiltIn();
    var isCallable2 = requireIsCallable();
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();
    var $Object = Object;
    isSymbol$1 = USE_SYMBOL_AS_UID ? function(it) {
      return typeof it == "symbol";
    } : function(it) {
      var $Symbol = getBuiltIn2("Symbol");
      return isCallable2($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
    };
    return isSymbol$1;
  }
  var tryToString;
  var hasRequiredTryToString;
  function requireTryToString() {
    if (hasRequiredTryToString) return tryToString;
    hasRequiredTryToString = 1;
    var $String = String;
    tryToString = function(argument) {
      try {
        return $String(argument);
      } catch (error) {
        return "Object";
      }
    };
    return tryToString;
  }
  var aCallable;
  var hasRequiredACallable;
  function requireACallable() {
    if (hasRequiredACallable) return aCallable;
    hasRequiredACallable = 1;
    var isCallable2 = requireIsCallable();
    var tryToString2 = requireTryToString();
    var $TypeError = TypeError;
    aCallable = function(argument) {
      if (isCallable2(argument)) return argument;
      throw new $TypeError(tryToString2(argument) + " is not a function");
    };
    return aCallable;
  }
  var getMethod;
  var hasRequiredGetMethod;
  function requireGetMethod() {
    if (hasRequiredGetMethod) return getMethod;
    hasRequiredGetMethod = 1;
    var aCallable2 = requireACallable();
    var isNullOrUndefined2 = requireIsNullOrUndefined();
    getMethod = function(V, P) {
      var func = V[P];
      return isNullOrUndefined2(func) ? void 0 : aCallable2(func);
    };
    return getMethod;
  }
  var ordinaryToPrimitive;
  var hasRequiredOrdinaryToPrimitive;
  function requireOrdinaryToPrimitive() {
    if (hasRequiredOrdinaryToPrimitive) return ordinaryToPrimitive;
    hasRequiredOrdinaryToPrimitive = 1;
    var call = requireFunctionCall();
    var isCallable2 = requireIsCallable();
    var isObject2 = requireIsObject$1();
    var $TypeError = TypeError;
    ordinaryToPrimitive = function(input, pref) {
      var fn, val;
      if (pref === "string" && isCallable2(fn = input.toString) && !isObject2(val = call(fn, input))) return val;
      if (isCallable2(fn = input.valueOf) && !isObject2(val = call(fn, input))) return val;
      if (pref !== "string" && isCallable2(fn = input.toString) && !isObject2(val = call(fn, input))) return val;
      throw new $TypeError("Can't convert object to primitive value");
    };
    return ordinaryToPrimitive;
  }
  var sharedStore = { exports: {} };
  var isPure;
  var hasRequiredIsPure;
  function requireIsPure() {
    if (hasRequiredIsPure) return isPure;
    hasRequiredIsPure = 1;
    isPure = false;
    return isPure;
  }
  var defineGlobalProperty;
  var hasRequiredDefineGlobalProperty;
  function requireDefineGlobalProperty() {
    if (hasRequiredDefineGlobalProperty) return defineGlobalProperty;
    hasRequiredDefineGlobalProperty = 1;
    var globalThis2 = requireGlobalThis();
    var defineProperty = Object.defineProperty;
    defineGlobalProperty = function(key, value) {
      try {
        defineProperty(globalThis2, key, { value, configurable: true, writable: true });
      } catch (error) {
        globalThis2[key] = value;
      }
      return value;
    };
    return defineGlobalProperty;
  }
  var hasRequiredSharedStore;
  function requireSharedStore() {
    if (hasRequiredSharedStore) return sharedStore.exports;
    hasRequiredSharedStore = 1;
    var IS_PURE = requireIsPure();
    var globalThis2 = requireGlobalThis();
    var defineGlobalProperty2 = requireDefineGlobalProperty();
    var SHARED = "__core-js_shared__";
    var store2 = sharedStore.exports = globalThis2[SHARED] || defineGlobalProperty2(SHARED, {});
    (store2.versions || (store2.versions = [])).push({
      version: "3.39.0",
      mode: IS_PURE ? "pure" : "global",
      copyright: "© 2014-2024 Denis Pushkarev (zloirock.ru)",
      license: "https://github.com/zloirock/core-js/blob/v3.39.0/LICENSE",
      source: "https://github.com/zloirock/core-js"
    });
    return sharedStore.exports;
  }
  var shared;
  var hasRequiredShared;
  function requireShared() {
    if (hasRequiredShared) return shared;
    hasRequiredShared = 1;
    var store2 = requireSharedStore();
    shared = function(key, value) {
      return store2[key] || (store2[key] = value || {});
    };
    return shared;
  }
  var toObject;
  var hasRequiredToObject;
  function requireToObject() {
    if (hasRequiredToObject) return toObject;
    hasRequiredToObject = 1;
    var requireObjectCoercible2 = requireRequireObjectCoercible();
    var $Object = Object;
    toObject = function(argument) {
      return $Object(requireObjectCoercible2(argument));
    };
    return toObject;
  }
  var hasOwnProperty_1;
  var hasRequiredHasOwnProperty;
  function requireHasOwnProperty() {
    if (hasRequiredHasOwnProperty) return hasOwnProperty_1;
    hasRequiredHasOwnProperty = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var toObject2 = requireToObject();
    var hasOwnProperty = uncurryThis({}.hasOwnProperty);
    hasOwnProperty_1 = Object.hasOwn || function hasOwn2(it, key) {
      return hasOwnProperty(toObject2(it), key);
    };
    return hasOwnProperty_1;
  }
  var uid;
  var hasRequiredUid;
  function requireUid() {
    if (hasRequiredUid) return uid;
    hasRequiredUid = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var id = 0;
    var postfix = Math.random();
    var toString2 = uncurryThis(1 .toString);
    uid = function(key) {
      return "Symbol(" + (key === void 0 ? "" : key) + ")_" + toString2(++id + postfix, 36);
    };
    return uid;
  }
  var wellKnownSymbol;
  var hasRequiredWellKnownSymbol;
  function requireWellKnownSymbol() {
    if (hasRequiredWellKnownSymbol) return wellKnownSymbol;
    hasRequiredWellKnownSymbol = 1;
    var globalThis2 = requireGlobalThis();
    var shared2 = requireShared();
    var hasOwn2 = requireHasOwnProperty();
    var uid2 = requireUid();
    var NATIVE_SYMBOL = requireSymbolConstructorDetection();
    var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();
    var Symbol2 = globalThis2.Symbol;
    var WellKnownSymbolsStore = shared2("wks");
    var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol2["for"] || Symbol2 : Symbol2 && Symbol2.withoutSetter || uid2;
    wellKnownSymbol = function(name) {
      if (!hasOwn2(WellKnownSymbolsStore, name)) {
        WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn2(Symbol2, name) ? Symbol2[name] : createWellKnownSymbol("Symbol." + name);
      }
      return WellKnownSymbolsStore[name];
    };
    return wellKnownSymbol;
  }
  var toPrimitive;
  var hasRequiredToPrimitive;
  function requireToPrimitive() {
    if (hasRequiredToPrimitive) return toPrimitive;
    hasRequiredToPrimitive = 1;
    var call = requireFunctionCall();
    var isObject2 = requireIsObject$1();
    var isSymbol2 = requireIsSymbol$1();
    var getMethod2 = requireGetMethod();
    var ordinaryToPrimitive2 = requireOrdinaryToPrimitive();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var $TypeError = TypeError;
    var TO_PRIMITIVE = wellKnownSymbol2("toPrimitive");
    toPrimitive = function(input, pref) {
      if (!isObject2(input) || isSymbol2(input)) return input;
      var exoticToPrim = getMethod2(input, TO_PRIMITIVE);
      var result;
      if (exoticToPrim) {
        if (pref === void 0) pref = "default";
        result = call(exoticToPrim, input, pref);
        if (!isObject2(result) || isSymbol2(result)) return result;
        throw new $TypeError("Can't convert object to primitive value");
      }
      if (pref === void 0) pref = "number";
      return ordinaryToPrimitive2(input, pref);
    };
    return toPrimitive;
  }
  var toPropertyKey;
  var hasRequiredToPropertyKey;
  function requireToPropertyKey() {
    if (hasRequiredToPropertyKey) return toPropertyKey;
    hasRequiredToPropertyKey = 1;
    var toPrimitive2 = requireToPrimitive();
    var isSymbol2 = requireIsSymbol$1();
    toPropertyKey = function(argument) {
      var key = toPrimitive2(argument, "string");
      return isSymbol2(key) ? key : key + "";
    };
    return toPropertyKey;
  }
  var documentCreateElement;
  var hasRequiredDocumentCreateElement;
  function requireDocumentCreateElement() {
    if (hasRequiredDocumentCreateElement) return documentCreateElement;
    hasRequiredDocumentCreateElement = 1;
    var globalThis2 = requireGlobalThis();
    var isObject2 = requireIsObject$1();
    var document2 = globalThis2.document;
    var EXISTS = isObject2(document2) && isObject2(document2.createElement);
    documentCreateElement = function(it) {
      return EXISTS ? document2.createElement(it) : {};
    };
    return documentCreateElement;
  }
  var ie8DomDefine;
  var hasRequiredIe8DomDefine;
  function requireIe8DomDefine() {
    if (hasRequiredIe8DomDefine) return ie8DomDefine;
    hasRequiredIe8DomDefine = 1;
    var DESCRIPTORS = requireDescriptors();
    var fails2 = requireFails();
    var createElement = requireDocumentCreateElement();
    ie8DomDefine = !DESCRIPTORS && !fails2(function() {
      return Object.defineProperty(createElement("div"), "a", {
        get: function() {
          return 7;
        }
      }).a !== 7;
    });
    return ie8DomDefine;
  }
  var hasRequiredObjectGetOwnPropertyDescriptor;
  function requireObjectGetOwnPropertyDescriptor() {
    if (hasRequiredObjectGetOwnPropertyDescriptor) return objectGetOwnPropertyDescriptor;
    hasRequiredObjectGetOwnPropertyDescriptor = 1;
    var DESCRIPTORS = requireDescriptors();
    var call = requireFunctionCall();
    var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
    var createPropertyDescriptor2 = requireCreatePropertyDescriptor();
    var toIndexedObject2 = requireToIndexedObject();
    var toPropertyKey2 = requireToPropertyKey();
    var hasOwn2 = requireHasOwnProperty();
    var IE8_DOM_DEFINE = requireIe8DomDefine();
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    objectGetOwnPropertyDescriptor.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
      O = toIndexedObject2(O);
      P = toPropertyKey2(P);
      if (IE8_DOM_DEFINE) try {
        return $getOwnPropertyDescriptor(O, P);
      } catch (error) {
      }
      if (hasOwn2(O, P)) return createPropertyDescriptor2(!call(propertyIsEnumerableModule.f, O, P), O[P]);
    };
    return objectGetOwnPropertyDescriptor;
  }
  var objectDefineProperty = {};
  var v8PrototypeDefineBug;
  var hasRequiredV8PrototypeDefineBug;
  function requireV8PrototypeDefineBug() {
    if (hasRequiredV8PrototypeDefineBug) return v8PrototypeDefineBug;
    hasRequiredV8PrototypeDefineBug = 1;
    var DESCRIPTORS = requireDescriptors();
    var fails2 = requireFails();
    v8PrototypeDefineBug = DESCRIPTORS && fails2(function() {
      return Object.defineProperty(function() {
      }, "prototype", {
        value: 42,
        writable: false
      }).prototype !== 42;
    });
    return v8PrototypeDefineBug;
  }
  var anObject;
  var hasRequiredAnObject;
  function requireAnObject() {
    if (hasRequiredAnObject) return anObject;
    hasRequiredAnObject = 1;
    var isObject2 = requireIsObject$1();
    var $String = String;
    var $TypeError = TypeError;
    anObject = function(argument) {
      if (isObject2(argument)) return argument;
      throw new $TypeError($String(argument) + " is not an object");
    };
    return anObject;
  }
  var hasRequiredObjectDefineProperty;
  function requireObjectDefineProperty() {
    if (hasRequiredObjectDefineProperty) return objectDefineProperty;
    hasRequiredObjectDefineProperty = 1;
    var DESCRIPTORS = requireDescriptors();
    var IE8_DOM_DEFINE = requireIe8DomDefine();
    var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
    var anObject2 = requireAnObject();
    var toPropertyKey2 = requireToPropertyKey();
    var $TypeError = TypeError;
    var $defineProperty = Object.defineProperty;
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var ENUMERABLE = "enumerable";
    var CONFIGURABLE = "configurable";
    var WRITABLE = "writable";
    objectDefineProperty.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
      anObject2(O);
      P = toPropertyKey2(P);
      anObject2(Attributes);
      if (typeof O === "function" && P === "prototype" && "value" in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
        var current = $getOwnPropertyDescriptor(O, P);
        if (current && current[WRITABLE]) {
          O[P] = Attributes.value;
          Attributes = {
            configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
            enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
            writable: false
          };
        }
      }
      return $defineProperty(O, P, Attributes);
    } : $defineProperty : function defineProperty(O, P, Attributes) {
      anObject2(O);
      P = toPropertyKey2(P);
      anObject2(Attributes);
      if (IE8_DOM_DEFINE) try {
        return $defineProperty(O, P, Attributes);
      } catch (error) {
      }
      if ("get" in Attributes || "set" in Attributes) throw new $TypeError("Accessors not supported");
      if ("value" in Attributes) O[P] = Attributes.value;
      return O;
    };
    return objectDefineProperty;
  }
  var createNonEnumerableProperty;
  var hasRequiredCreateNonEnumerableProperty;
  function requireCreateNonEnumerableProperty() {
    if (hasRequiredCreateNonEnumerableProperty) return createNonEnumerableProperty;
    hasRequiredCreateNonEnumerableProperty = 1;
    var DESCRIPTORS = requireDescriptors();
    var definePropertyModule = requireObjectDefineProperty();
    var createPropertyDescriptor2 = requireCreatePropertyDescriptor();
    createNonEnumerableProperty = DESCRIPTORS ? function(object, key, value) {
      return definePropertyModule.f(object, key, createPropertyDescriptor2(1, value));
    } : function(object, key, value) {
      object[key] = value;
      return object;
    };
    return createNonEnumerableProperty;
  }
  var makeBuiltIn = { exports: {} };
  var functionName;
  var hasRequiredFunctionName;
  function requireFunctionName() {
    if (hasRequiredFunctionName) return functionName;
    hasRequiredFunctionName = 1;
    var DESCRIPTORS = requireDescriptors();
    var hasOwn2 = requireHasOwnProperty();
    var FunctionPrototype = Function.prototype;
    var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;
    var EXISTS = hasOwn2(FunctionPrototype, "name");
    var PROPER = EXISTS && (function something() {
    }).name === "something";
    var CONFIGURABLE = EXISTS && (!DESCRIPTORS || DESCRIPTORS && getDescriptor(FunctionPrototype, "name").configurable);
    functionName = {
      EXISTS,
      PROPER,
      CONFIGURABLE
    };
    return functionName;
  }
  var inspectSource;
  var hasRequiredInspectSource;
  function requireInspectSource() {
    if (hasRequiredInspectSource) return inspectSource;
    hasRequiredInspectSource = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var isCallable2 = requireIsCallable();
    var store2 = requireSharedStore();
    var functionToString = uncurryThis(Function.toString);
    if (!isCallable2(store2.inspectSource)) {
      store2.inspectSource = function(it) {
        return functionToString(it);
      };
    }
    inspectSource = store2.inspectSource;
    return inspectSource;
  }
  var weakMapBasicDetection;
  var hasRequiredWeakMapBasicDetection;
  function requireWeakMapBasicDetection() {
    if (hasRequiredWeakMapBasicDetection) return weakMapBasicDetection;
    hasRequiredWeakMapBasicDetection = 1;
    var globalThis2 = requireGlobalThis();
    var isCallable2 = requireIsCallable();
    var WeakMap2 = globalThis2.WeakMap;
    weakMapBasicDetection = isCallable2(WeakMap2) && /native code/.test(String(WeakMap2));
    return weakMapBasicDetection;
  }
  var sharedKey;
  var hasRequiredSharedKey;
  function requireSharedKey() {
    if (hasRequiredSharedKey) return sharedKey;
    hasRequiredSharedKey = 1;
    var shared2 = requireShared();
    var uid2 = requireUid();
    var keys = shared2("keys");
    sharedKey = function(key) {
      return keys[key] || (keys[key] = uid2(key));
    };
    return sharedKey;
  }
  var hiddenKeys;
  var hasRequiredHiddenKeys;
  function requireHiddenKeys() {
    if (hasRequiredHiddenKeys) return hiddenKeys;
    hasRequiredHiddenKeys = 1;
    hiddenKeys = {};
    return hiddenKeys;
  }
  var internalState;
  var hasRequiredInternalState;
  function requireInternalState() {
    if (hasRequiredInternalState) return internalState;
    hasRequiredInternalState = 1;
    var NATIVE_WEAK_MAP = requireWeakMapBasicDetection();
    var globalThis2 = requireGlobalThis();
    var isObject2 = requireIsObject$1();
    var createNonEnumerableProperty2 = requireCreateNonEnumerableProperty();
    var hasOwn2 = requireHasOwnProperty();
    var shared2 = requireSharedStore();
    var sharedKey2 = requireSharedKey();
    var hiddenKeys2 = requireHiddenKeys();
    var OBJECT_ALREADY_INITIALIZED = "Object already initialized";
    var TypeError2 = globalThis2.TypeError;
    var WeakMap2 = globalThis2.WeakMap;
    var set2, get2, has;
    var enforce = function(it) {
      return has(it) ? get2(it) : set2(it, {});
    };
    var getterFor = function(TYPE) {
      return function(it) {
        var state;
        if (!isObject2(it) || (state = get2(it)).type !== TYPE) {
          throw new TypeError2("Incompatible receiver, " + TYPE + " required");
        }
        return state;
      };
    };
    if (NATIVE_WEAK_MAP || shared2.state) {
      var store2 = shared2.state || (shared2.state = new WeakMap2());
      store2.get = store2.get;
      store2.has = store2.has;
      store2.set = store2.set;
      set2 = function(it, metadata) {
        if (store2.has(it)) throw new TypeError2(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        store2.set(it, metadata);
        return metadata;
      };
      get2 = function(it) {
        return store2.get(it) || {};
      };
      has = function(it) {
        return store2.has(it);
      };
    } else {
      var STATE = sharedKey2("state");
      hiddenKeys2[STATE] = true;
      set2 = function(it, metadata) {
        if (hasOwn2(it, STATE)) throw new TypeError2(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        createNonEnumerableProperty2(it, STATE, metadata);
        return metadata;
      };
      get2 = function(it) {
        return hasOwn2(it, STATE) ? it[STATE] : {};
      };
      has = function(it) {
        return hasOwn2(it, STATE);
      };
    }
    internalState = {
      set: set2,
      get: get2,
      has,
      enforce,
      getterFor
    };
    return internalState;
  }
  var hasRequiredMakeBuiltIn;
  function requireMakeBuiltIn() {
    if (hasRequiredMakeBuiltIn) return makeBuiltIn.exports;
    hasRequiredMakeBuiltIn = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var fails2 = requireFails();
    var isCallable2 = requireIsCallable();
    var hasOwn2 = requireHasOwnProperty();
    var DESCRIPTORS = requireDescriptors();
    var CONFIGURABLE_FUNCTION_NAME = requireFunctionName().CONFIGURABLE;
    var inspectSource2 = requireInspectSource();
    var InternalStateModule = requireInternalState();
    var enforceInternalState = InternalStateModule.enforce;
    var getInternalState = InternalStateModule.get;
    var $String = String;
    var defineProperty = Object.defineProperty;
    var stringSlice = uncurryThis("".slice);
    var replace2 = uncurryThis("".replace);
    var join = uncurryThis([].join);
    var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails2(function() {
      return defineProperty(function() {
      }, "length", { value: 8 }).length !== 8;
    });
    var TEMPLATE = String(String).split("String");
    var makeBuiltIn$1 = makeBuiltIn.exports = function(value, name, options) {
      if (stringSlice($String(name), 0, 7) === "Symbol(") {
        name = "[" + replace2($String(name), /^Symbol\(([^)]*)\).*$/, "$1") + "]";
      }
      if (options && options.getter) name = "get " + name;
      if (options && options.setter) name = "set " + name;
      if (!hasOwn2(value, "name") || CONFIGURABLE_FUNCTION_NAME && value.name !== name) {
        if (DESCRIPTORS) defineProperty(value, "name", { value: name, configurable: true });
        else value.name = name;
      }
      if (CONFIGURABLE_LENGTH && options && hasOwn2(options, "arity") && value.length !== options.arity) {
        defineProperty(value, "length", { value: options.arity });
      }
      try {
        if (options && hasOwn2(options, "constructor") && options.constructor) {
          if (DESCRIPTORS) defineProperty(value, "prototype", { writable: false });
        } else if (value.prototype) value.prototype = void 0;
      } catch (error) {
      }
      var state = enforceInternalState(value);
      if (!hasOwn2(state, "source")) {
        state.source = join(TEMPLATE, typeof name == "string" ? name : "");
      }
      return value;
    };
    Function.prototype.toString = makeBuiltIn$1(function toString2() {
      return isCallable2(this) && getInternalState(this).source || inspectSource2(this);
    }, "toString");
    return makeBuiltIn.exports;
  }
  var defineBuiltIn;
  var hasRequiredDefineBuiltIn;
  function requireDefineBuiltIn() {
    if (hasRequiredDefineBuiltIn) return defineBuiltIn;
    hasRequiredDefineBuiltIn = 1;
    var isCallable2 = requireIsCallable();
    var definePropertyModule = requireObjectDefineProperty();
    var makeBuiltIn2 = requireMakeBuiltIn();
    var defineGlobalProperty2 = requireDefineGlobalProperty();
    defineBuiltIn = function(O, key, value, options) {
      if (!options) options = {};
      var simple = options.enumerable;
      var name = options.name !== void 0 ? options.name : key;
      if (isCallable2(value)) makeBuiltIn2(value, name, options);
      if (options.global) {
        if (simple) O[key] = value;
        else defineGlobalProperty2(key, value);
      } else {
        try {
          if (!options.unsafe) delete O[key];
          else if (O[key]) simple = true;
        } catch (error) {
        }
        if (simple) O[key] = value;
        else definePropertyModule.f(O, key, {
          value,
          enumerable: false,
          configurable: !options.nonConfigurable,
          writable: !options.nonWritable
        });
      }
      return O;
    };
    return defineBuiltIn;
  }
  var objectGetOwnPropertyNames = {};
  var mathTrunc;
  var hasRequiredMathTrunc;
  function requireMathTrunc() {
    if (hasRequiredMathTrunc) return mathTrunc;
    hasRequiredMathTrunc = 1;
    var ceil = Math.ceil;
    var floor = Math.floor;
    mathTrunc = Math.trunc || function trunc(x) {
      var n = +x;
      return (n > 0 ? floor : ceil)(n);
    };
    return mathTrunc;
  }
  var toIntegerOrInfinity;
  var hasRequiredToIntegerOrInfinity;
  function requireToIntegerOrInfinity() {
    if (hasRequiredToIntegerOrInfinity) return toIntegerOrInfinity;
    hasRequiredToIntegerOrInfinity = 1;
    var trunc = requireMathTrunc();
    toIntegerOrInfinity = function(argument) {
      var number = +argument;
      return number !== number || number === 0 ? 0 : trunc(number);
    };
    return toIntegerOrInfinity;
  }
  var toAbsoluteIndex;
  var hasRequiredToAbsoluteIndex;
  function requireToAbsoluteIndex() {
    if (hasRequiredToAbsoluteIndex) return toAbsoluteIndex;
    hasRequiredToAbsoluteIndex = 1;
    var toIntegerOrInfinity2 = requireToIntegerOrInfinity();
    var max = Math.max;
    var min = Math.min;
    toAbsoluteIndex = function(index, length2) {
      var integer = toIntegerOrInfinity2(index);
      return integer < 0 ? max(integer + length2, 0) : min(integer, length2);
    };
    return toAbsoluteIndex;
  }
  var toLength;
  var hasRequiredToLength;
  function requireToLength() {
    if (hasRequiredToLength) return toLength;
    hasRequiredToLength = 1;
    var toIntegerOrInfinity2 = requireToIntegerOrInfinity();
    var min = Math.min;
    toLength = function(argument) {
      var len = toIntegerOrInfinity2(argument);
      return len > 0 ? min(len, 9007199254740991) : 0;
    };
    return toLength;
  }
  var lengthOfArrayLike;
  var hasRequiredLengthOfArrayLike;
  function requireLengthOfArrayLike() {
    if (hasRequiredLengthOfArrayLike) return lengthOfArrayLike;
    hasRequiredLengthOfArrayLike = 1;
    var toLength2 = requireToLength();
    lengthOfArrayLike = function(obj) {
      return toLength2(obj.length);
    };
    return lengthOfArrayLike;
  }
  var arrayIncludes;
  var hasRequiredArrayIncludes;
  function requireArrayIncludes() {
    if (hasRequiredArrayIncludes) return arrayIncludes;
    hasRequiredArrayIncludes = 1;
    var toIndexedObject2 = requireToIndexedObject();
    var toAbsoluteIndex2 = requireToAbsoluteIndex();
    var lengthOfArrayLike2 = requireLengthOfArrayLike();
    var createMethod = function(IS_INCLUDES) {
      return function($this, el, fromIndex) {
        var O = toIndexedObject2($this);
        var length2 = lengthOfArrayLike2(O);
        if (length2 === 0) return !IS_INCLUDES && -1;
        var index = toAbsoluteIndex2(fromIndex, length2);
        var value;
        if (IS_INCLUDES && el !== el) while (length2 > index) {
          value = O[index++];
          if (value !== value) return true;
        }
        else for (; length2 > index; index++) {
          if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
        }
        return !IS_INCLUDES && -1;
      };
    };
    arrayIncludes = {
      // `Array.prototype.includes` method
      // https://tc39.es/ecma262/#sec-array.prototype.includes
      includes: createMethod(true),
      // `Array.prototype.indexOf` method
      // https://tc39.es/ecma262/#sec-array.prototype.indexof
      indexOf: createMethod(false)
    };
    return arrayIncludes;
  }
  var objectKeysInternal;
  var hasRequiredObjectKeysInternal;
  function requireObjectKeysInternal() {
    if (hasRequiredObjectKeysInternal) return objectKeysInternal;
    hasRequiredObjectKeysInternal = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var hasOwn2 = requireHasOwnProperty();
    var toIndexedObject2 = requireToIndexedObject();
    var indexOf = requireArrayIncludes().indexOf;
    var hiddenKeys2 = requireHiddenKeys();
    var push = uncurryThis([].push);
    objectKeysInternal = function(object, names) {
      var O = toIndexedObject2(object);
      var i = 0;
      var result = [];
      var key;
      for (key in O) !hasOwn2(hiddenKeys2, key) && hasOwn2(O, key) && push(result, key);
      while (names.length > i) if (hasOwn2(O, key = names[i++])) {
        ~indexOf(result, key) || push(result, key);
      }
      return result;
    };
    return objectKeysInternal;
  }
  var enumBugKeys;
  var hasRequiredEnumBugKeys;
  function requireEnumBugKeys() {
    if (hasRequiredEnumBugKeys) return enumBugKeys;
    hasRequiredEnumBugKeys = 1;
    enumBugKeys = [
      "constructor",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "toLocaleString",
      "toString",
      "valueOf"
    ];
    return enumBugKeys;
  }
  var hasRequiredObjectGetOwnPropertyNames;
  function requireObjectGetOwnPropertyNames() {
    if (hasRequiredObjectGetOwnPropertyNames) return objectGetOwnPropertyNames;
    hasRequiredObjectGetOwnPropertyNames = 1;
    var internalObjectKeys = requireObjectKeysInternal();
    var enumBugKeys2 = requireEnumBugKeys();
    var hiddenKeys2 = enumBugKeys2.concat("length", "prototype");
    objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
      return internalObjectKeys(O, hiddenKeys2);
    };
    return objectGetOwnPropertyNames;
  }
  var objectGetOwnPropertySymbols = {};
  var hasRequiredObjectGetOwnPropertySymbols;
  function requireObjectGetOwnPropertySymbols() {
    if (hasRequiredObjectGetOwnPropertySymbols) return objectGetOwnPropertySymbols;
    hasRequiredObjectGetOwnPropertySymbols = 1;
    objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;
    return objectGetOwnPropertySymbols;
  }
  var ownKeys;
  var hasRequiredOwnKeys;
  function requireOwnKeys() {
    if (hasRequiredOwnKeys) return ownKeys;
    hasRequiredOwnKeys = 1;
    var getBuiltIn2 = requireGetBuiltIn();
    var uncurryThis = requireFunctionUncurryThis();
    var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
    var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
    var anObject2 = requireAnObject();
    var concat = uncurryThis([].concat);
    ownKeys = getBuiltIn2("Reflect", "ownKeys") || function ownKeys2(it) {
      var keys = getOwnPropertyNamesModule.f(anObject2(it));
      var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
      return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
    };
    return ownKeys;
  }
  var copyConstructorProperties;
  var hasRequiredCopyConstructorProperties;
  function requireCopyConstructorProperties() {
    if (hasRequiredCopyConstructorProperties) return copyConstructorProperties;
    hasRequiredCopyConstructorProperties = 1;
    var hasOwn2 = requireHasOwnProperty();
    var ownKeys2 = requireOwnKeys();
    var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
    var definePropertyModule = requireObjectDefineProperty();
    copyConstructorProperties = function(target, source, exceptions) {
      var keys = ownKeys2(source);
      var defineProperty = definePropertyModule.f;
      var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!hasOwn2(target, key) && !(exceptions && hasOwn2(exceptions, key))) {
          defineProperty(target, key, getOwnPropertyDescriptor(source, key));
        }
      }
    };
    return copyConstructorProperties;
  }
  var isForced_1;
  var hasRequiredIsForced;
  function requireIsForced() {
    if (hasRequiredIsForced) return isForced_1;
    hasRequiredIsForced = 1;
    var fails2 = requireFails();
    var isCallable2 = requireIsCallable();
    var replacement = /#|\.prototype\./;
    var isForced = function(feature, detection) {
      var value = data2[normalize(feature)];
      return value === POLYFILL ? true : value === NATIVE ? false : isCallable2(detection) ? fails2(detection) : !!detection;
    };
    var normalize = isForced.normalize = function(string) {
      return String(string).replace(replacement, ".").toLowerCase();
    };
    var data2 = isForced.data = {};
    var NATIVE = isForced.NATIVE = "N";
    var POLYFILL = isForced.POLYFILL = "P";
    isForced_1 = isForced;
    return isForced_1;
  }
  var _export;
  var hasRequired_export;
  function require_export() {
    if (hasRequired_export) return _export;
    hasRequired_export = 1;
    var globalThis2 = requireGlobalThis();
    var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
    var createNonEnumerableProperty2 = requireCreateNonEnumerableProperty();
    var defineBuiltIn2 = requireDefineBuiltIn();
    var defineGlobalProperty2 = requireDefineGlobalProperty();
    var copyConstructorProperties2 = requireCopyConstructorProperties();
    var isForced = requireIsForced();
    _export = function(options, source) {
      var TARGET = options.target;
      var GLOBAL = options.global;
      var STATIC = options.stat;
      var FORCED, target, key, targetProperty, sourceProperty, descriptor;
      if (GLOBAL) {
        target = globalThis2;
      } else if (STATIC) {
        target = globalThis2[TARGET] || defineGlobalProperty2(TARGET, {});
      } else {
        target = globalThis2[TARGET] && globalThis2[TARGET].prototype;
      }
      if (target) for (key in source) {
        sourceProperty = source[key];
        if (options.dontCallGetSet) {
          descriptor = getOwnPropertyDescriptor(target, key);
          targetProperty = descriptor && descriptor.value;
        } else targetProperty = target[key];
        FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
        if (!FORCED && targetProperty !== void 0) {
          if (typeof sourceProperty == typeof targetProperty) continue;
          copyConstructorProperties2(sourceProperty, targetProperty);
        }
        if (options.sham || targetProperty && targetProperty.sham) {
          createNonEnumerableProperty2(sourceProperty, "sham", true);
        }
        defineBuiltIn2(target, key, sourceProperty, options);
      }
    };
    return _export;
  }
  var correctPrototypeGetter;
  var hasRequiredCorrectPrototypeGetter;
  function requireCorrectPrototypeGetter() {
    if (hasRequiredCorrectPrototypeGetter) return correctPrototypeGetter;
    hasRequiredCorrectPrototypeGetter = 1;
    var fails2 = requireFails();
    correctPrototypeGetter = !fails2(function() {
      function F() {
      }
      F.prototype.constructor = null;
      return Object.getPrototypeOf(new F()) !== F.prototype;
    });
    return correctPrototypeGetter;
  }
  var objectGetPrototypeOf;
  var hasRequiredObjectGetPrototypeOf;
  function requireObjectGetPrototypeOf() {
    if (hasRequiredObjectGetPrototypeOf) return objectGetPrototypeOf;
    hasRequiredObjectGetPrototypeOf = 1;
    var hasOwn2 = requireHasOwnProperty();
    var isCallable2 = requireIsCallable();
    var toObject2 = requireToObject();
    var sharedKey2 = requireSharedKey();
    var CORRECT_PROTOTYPE_GETTER = requireCorrectPrototypeGetter();
    var IE_PROTO = sharedKey2("IE_PROTO");
    var $Object = Object;
    var ObjectPrototype = $Object.prototype;
    objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function(O) {
      var object = toObject2(O);
      if (hasOwn2(object, IE_PROTO)) return object[IE_PROTO];
      var constructor = object.constructor;
      if (isCallable2(constructor) && object instanceof constructor) {
        return constructor.prototype;
      }
      return object instanceof $Object ? ObjectPrototype : null;
    };
    return objectGetPrototypeOf;
  }
  var functionUncurryThisAccessor;
  var hasRequiredFunctionUncurryThisAccessor;
  function requireFunctionUncurryThisAccessor() {
    if (hasRequiredFunctionUncurryThisAccessor) return functionUncurryThisAccessor;
    hasRequiredFunctionUncurryThisAccessor = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var aCallable2 = requireACallable();
    functionUncurryThisAccessor = function(object, key, method) {
      try {
        return uncurryThis(aCallable2(Object.getOwnPropertyDescriptor(object, key)[method]));
      } catch (error) {
      }
    };
    return functionUncurryThisAccessor;
  }
  var isPossiblePrototype;
  var hasRequiredIsPossiblePrototype;
  function requireIsPossiblePrototype() {
    if (hasRequiredIsPossiblePrototype) return isPossiblePrototype;
    hasRequiredIsPossiblePrototype = 1;
    var isObject2 = requireIsObject$1();
    isPossiblePrototype = function(argument) {
      return isObject2(argument) || argument === null;
    };
    return isPossiblePrototype;
  }
  var aPossiblePrototype;
  var hasRequiredAPossiblePrototype;
  function requireAPossiblePrototype() {
    if (hasRequiredAPossiblePrototype) return aPossiblePrototype;
    hasRequiredAPossiblePrototype = 1;
    var isPossiblePrototype2 = requireIsPossiblePrototype();
    var $String = String;
    var $TypeError = TypeError;
    aPossiblePrototype = function(argument) {
      if (isPossiblePrototype2(argument)) return argument;
      throw new $TypeError("Can't set " + $String(argument) + " as a prototype");
    };
    return aPossiblePrototype;
  }
  var objectSetPrototypeOf;
  var hasRequiredObjectSetPrototypeOf;
  function requireObjectSetPrototypeOf() {
    if (hasRequiredObjectSetPrototypeOf) return objectSetPrototypeOf;
    hasRequiredObjectSetPrototypeOf = 1;
    var uncurryThisAccessor = requireFunctionUncurryThisAccessor();
    var isObject2 = requireIsObject$1();
    var requireObjectCoercible2 = requireRequireObjectCoercible();
    var aPossiblePrototype2 = requireAPossiblePrototype();
    objectSetPrototypeOf = Object.setPrototypeOf || ("__proto__" in {} ? function() {
      var CORRECT_SETTER = false;
      var test = {};
      var setter;
      try {
        setter = uncurryThisAccessor(Object.prototype, "__proto__", "set");
        setter(test, []);
        CORRECT_SETTER = test instanceof Array;
      } catch (error) {
      }
      return function setPrototypeOf(O, proto) {
        requireObjectCoercible2(O);
        aPossiblePrototype2(proto);
        if (!isObject2(O)) return O;
        if (CORRECT_SETTER) setter(O, proto);
        else O.__proto__ = proto;
        return O;
      };
    }() : void 0);
    return objectSetPrototypeOf;
  }
  var objectDefineProperties = {};
  var objectKeys;
  var hasRequiredObjectKeys;
  function requireObjectKeys() {
    if (hasRequiredObjectKeys) return objectKeys;
    hasRequiredObjectKeys = 1;
    var internalObjectKeys = requireObjectKeysInternal();
    var enumBugKeys2 = requireEnumBugKeys();
    objectKeys = Object.keys || function keys(O) {
      return internalObjectKeys(O, enumBugKeys2);
    };
    return objectKeys;
  }
  var hasRequiredObjectDefineProperties;
  function requireObjectDefineProperties() {
    if (hasRequiredObjectDefineProperties) return objectDefineProperties;
    hasRequiredObjectDefineProperties = 1;
    var DESCRIPTORS = requireDescriptors();
    var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
    var definePropertyModule = requireObjectDefineProperty();
    var anObject2 = requireAnObject();
    var toIndexedObject2 = requireToIndexedObject();
    var objectKeys2 = requireObjectKeys();
    objectDefineProperties.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
      anObject2(O);
      var props = toIndexedObject2(Properties);
      var keys = objectKeys2(Properties);
      var length2 = keys.length;
      var index = 0;
      var key;
      while (length2 > index) definePropertyModule.f(O, key = keys[index++], props[key]);
      return O;
    };
    return objectDefineProperties;
  }
  var html;
  var hasRequiredHtml;
  function requireHtml() {
    if (hasRequiredHtml) return html;
    hasRequiredHtml = 1;
    var getBuiltIn2 = requireGetBuiltIn();
    html = getBuiltIn2("document", "documentElement");
    return html;
  }
  var objectCreate;
  var hasRequiredObjectCreate;
  function requireObjectCreate() {
    if (hasRequiredObjectCreate) return objectCreate;
    hasRequiredObjectCreate = 1;
    var anObject2 = requireAnObject();
    var definePropertiesModule = requireObjectDefineProperties();
    var enumBugKeys2 = requireEnumBugKeys();
    var hiddenKeys2 = requireHiddenKeys();
    var html2 = requireHtml();
    var documentCreateElement2 = requireDocumentCreateElement();
    var sharedKey2 = requireSharedKey();
    var GT = ">";
    var LT = "<";
    var PROTOTYPE = "prototype";
    var SCRIPT = "script";
    var IE_PROTO = sharedKey2("IE_PROTO");
    var EmptyConstructor = function() {
    };
    var scriptTag = function(content) {
      return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
    };
    var NullProtoObjectViaActiveX = function(activeXDocument2) {
      activeXDocument2.write(scriptTag(""));
      activeXDocument2.close();
      var temp = activeXDocument2.parentWindow.Object;
      activeXDocument2 = null;
      return temp;
    };
    var NullProtoObjectViaIFrame = function() {
      var iframe = documentCreateElement2("iframe");
      var JS = "java" + SCRIPT + ":";
      var iframeDocument;
      iframe.style.display = "none";
      html2.appendChild(iframe);
      iframe.src = String(JS);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(scriptTag("document.F=Object"));
      iframeDocument.close();
      return iframeDocument.F;
    };
    var activeXDocument;
    var NullProtoObject = function() {
      try {
        activeXDocument = new ActiveXObject("htmlfile");
      } catch (error) {
      }
      NullProtoObject = typeof document != "undefined" ? document.domain && activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame() : NullProtoObjectViaActiveX(activeXDocument);
      var length2 = enumBugKeys2.length;
      while (length2--) delete NullProtoObject[PROTOTYPE][enumBugKeys2[length2]];
      return NullProtoObject();
    };
    hiddenKeys2[IE_PROTO] = true;
    objectCreate = Object.create || function create(O, Properties) {
      var result;
      if (O !== null) {
        EmptyConstructor[PROTOTYPE] = anObject2(O);
        result = new EmptyConstructor();
        EmptyConstructor[PROTOTYPE] = null;
        result[IE_PROTO] = O;
      } else result = NullProtoObject();
      return Properties === void 0 ? result : definePropertiesModule.f(result, Properties);
    };
    return objectCreate;
  }
  var errorStackClear;
  var hasRequiredErrorStackClear;
  function requireErrorStackClear() {
    if (hasRequiredErrorStackClear) return errorStackClear;
    hasRequiredErrorStackClear = 1;
    var uncurryThis = requireFunctionUncurryThis();
    var $Error = Error;
    var replace2 = uncurryThis("".replace);
    var TEST = function(arg) {
      return String(new $Error(arg).stack);
    }("zxcasd");
    var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
    var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);
    errorStackClear = function(stack, dropEntries) {
      if (IS_V8_OR_CHAKRA_STACK && typeof stack == "string" && !$Error.prepareStackTrace) {
        while (dropEntries--) stack = replace2(stack, V8_OR_CHAKRA_STACK_ENTRY, "");
      }
      return stack;
    };
    return errorStackClear;
  }
  var errorStackInstallable;
  var hasRequiredErrorStackInstallable;
  function requireErrorStackInstallable() {
    if (hasRequiredErrorStackInstallable) return errorStackInstallable;
    hasRequiredErrorStackInstallable = 1;
    var fails2 = requireFails();
    var createPropertyDescriptor2 = requireCreatePropertyDescriptor();
    errorStackInstallable = !fails2(function() {
      var error = new Error("a");
      if (!("stack" in error)) return true;
      Object.defineProperty(error, "stack", createPropertyDescriptor2(1, 7));
      return error.stack !== 7;
    });
    return errorStackInstallable;
  }
  var errorStackInstall;
  var hasRequiredErrorStackInstall;
  function requireErrorStackInstall() {
    if (hasRequiredErrorStackInstall) return errorStackInstall;
    hasRequiredErrorStackInstall = 1;
    var createNonEnumerableProperty2 = requireCreateNonEnumerableProperty();
    var clearErrorStack = requireErrorStackClear();
    var ERROR_STACK_INSTALLABLE = requireErrorStackInstallable();
    var captureStackTrace = Error.captureStackTrace;
    errorStackInstall = function(error, C2, stack, dropEntries) {
      if (ERROR_STACK_INSTALLABLE) {
        if (captureStackTrace) captureStackTrace(error, C2);
        else createNonEnumerableProperty2(error, "stack", clearErrorStack(stack, dropEntries));
      }
    };
    return errorStackInstall;
  }
  var toStringTagSupport;
  var hasRequiredToStringTagSupport;
  function requireToStringTagSupport() {
    if (hasRequiredToStringTagSupport) return toStringTagSupport;
    hasRequiredToStringTagSupport = 1;
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var TO_STRING_TAG = wellKnownSymbol2("toStringTag");
    var test = {};
    test[TO_STRING_TAG] = "z";
    toStringTagSupport = String(test) === "[object z]";
    return toStringTagSupport;
  }
  var classof;
  var hasRequiredClassof;
  function requireClassof() {
    if (hasRequiredClassof) return classof;
    hasRequiredClassof = 1;
    var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
    var isCallable2 = requireIsCallable();
    var classofRaw2 = requireClassofRaw();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var TO_STRING_TAG = wellKnownSymbol2("toStringTag");
    var $Object = Object;
    var CORRECT_ARGUMENTS = classofRaw2(/* @__PURE__ */ function() {
      return arguments;
    }()) === "Arguments";
    var tryGet = function(it, key) {
      try {
        return it[key];
      } catch (error) {
      }
    };
    classof = TO_STRING_TAG_SUPPORT ? classofRaw2 : function(it) {
      var O, tag, result;
      return it === void 0 ? "Undefined" : it === null ? "Null" : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw2(O) : (result = classofRaw2(O)) === "Object" && isCallable2(O.callee) ? "Arguments" : result;
    };
    return classof;
  }
  var toString;
  var hasRequiredToString;
  function requireToString() {
    if (hasRequiredToString) return toString;
    hasRequiredToString = 1;
    var classof2 = requireClassof();
    var $String = String;
    toString = function(argument) {
      if (classof2(argument) === "Symbol") throw new TypeError("Cannot convert a Symbol value to a string");
      return $String(argument);
    };
    return toString;
  }
  var normalizeStringArgument;
  var hasRequiredNormalizeStringArgument;
  function requireNormalizeStringArgument() {
    if (hasRequiredNormalizeStringArgument) return normalizeStringArgument;
    hasRequiredNormalizeStringArgument = 1;
    var toString2 = requireToString();
    normalizeStringArgument = function(argument, $default) {
      return argument === void 0 ? arguments.length < 2 ? "" : $default : toString2(argument);
    };
    return normalizeStringArgument;
  }
  var hasRequiredEsnext_suppressedError_constructor;
  function requireEsnext_suppressedError_constructor() {
    if (hasRequiredEsnext_suppressedError_constructor) return esnext_suppressedError_constructor;
    hasRequiredEsnext_suppressedError_constructor = 1;
    var $ = require_export();
    var globalThis2 = requireGlobalThis();
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var getPrototypeOf = requireObjectGetPrototypeOf();
    var setPrototypeOf = requireObjectSetPrototypeOf();
    var copyConstructorProperties2 = requireCopyConstructorProperties();
    var create = requireObjectCreate();
    var createNonEnumerableProperty2 = requireCreateNonEnumerableProperty();
    var createPropertyDescriptor2 = requireCreatePropertyDescriptor();
    var installErrorStack = requireErrorStackInstall();
    var normalizeStringArgument2 = requireNormalizeStringArgument();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var fails2 = requireFails();
    var IS_PURE = requireIsPure();
    var NativeSuppressedError = globalThis2.SuppressedError;
    var TO_STRING_TAG = wellKnownSymbol2("toStringTag");
    var $Error = Error;
    var WRONG_ARITY = !!NativeSuppressedError && NativeSuppressedError.length !== 3;
    var EXTRA_ARGS_SUPPORT = !!NativeSuppressedError && fails2(function() {
      return new NativeSuppressedError(1, 2, 3, { cause: 4 }).cause === 4;
    });
    var PATCH = WRONG_ARITY || EXTRA_ARGS_SUPPORT;
    var $SuppressedError = function SuppressedError2(error, suppressed, message2) {
      var isInstance = isPrototypeOf(SuppressedErrorPrototype, this);
      var that;
      if (setPrototypeOf) {
        that = PATCH && (!isInstance || getPrototypeOf(this) === SuppressedErrorPrototype) ? new NativeSuppressedError() : setPrototypeOf(new $Error(), isInstance ? getPrototypeOf(this) : SuppressedErrorPrototype);
      } else {
        that = isInstance ? this : create(SuppressedErrorPrototype);
        createNonEnumerableProperty2(that, TO_STRING_TAG, "Error");
      }
      if (message2 !== void 0) createNonEnumerableProperty2(that, "message", normalizeStringArgument2(message2));
      installErrorStack(that, $SuppressedError, that.stack, 1);
      createNonEnumerableProperty2(that, "error", error);
      createNonEnumerableProperty2(that, "suppressed", suppressed);
      return that;
    };
    if (setPrototypeOf) setPrototypeOf($SuppressedError, $Error);
    else copyConstructorProperties2($SuppressedError, $Error, { name: true });
    var SuppressedErrorPrototype = $SuppressedError.prototype = PATCH ? NativeSuppressedError.prototype : create($Error.prototype, {
      constructor: createPropertyDescriptor2(1, $SuppressedError),
      message: createPropertyDescriptor2(1, ""),
      name: createPropertyDescriptor2(1, "SuppressedError")
    });
    if (PATCH && !IS_PURE) SuppressedErrorPrototype.constructor = $SuppressedError;
    $({ global: true, constructor: true, arity: 3, forced: PATCH }, {
      SuppressedError: $SuppressedError
    });
    return esnext_suppressedError_constructor;
  }
  var esnext_asyncDisposableStack_constructor = {};
  var anInstance;
  var hasRequiredAnInstance;
  function requireAnInstance() {
    if (hasRequiredAnInstance) return anInstance;
    hasRequiredAnInstance = 1;
    var isPrototypeOf = requireObjectIsPrototypeOf();
    var $TypeError = TypeError;
    anInstance = function(it, Prototype) {
      if (isPrototypeOf(Prototype, it)) return it;
      throw new $TypeError("Incorrect invocation");
    };
    return anInstance;
  }
  var defineBuiltIns;
  var hasRequiredDefineBuiltIns;
  function requireDefineBuiltIns() {
    if (hasRequiredDefineBuiltIns) return defineBuiltIns;
    hasRequiredDefineBuiltIns = 1;
    var defineBuiltIn2 = requireDefineBuiltIn();
    defineBuiltIns = function(target, src, options) {
      for (var key in src) defineBuiltIn2(target, key, src[key], options);
      return target;
    };
    return defineBuiltIns;
  }
  var defineBuiltInAccessor;
  var hasRequiredDefineBuiltInAccessor;
  function requireDefineBuiltInAccessor() {
    if (hasRequiredDefineBuiltInAccessor) return defineBuiltInAccessor;
    hasRequiredDefineBuiltInAccessor = 1;
    var makeBuiltIn2 = requireMakeBuiltIn();
    var defineProperty = requireObjectDefineProperty();
    defineBuiltInAccessor = function(target, name, descriptor) {
      if (descriptor.get) makeBuiltIn2(descriptor.get, name, { getter: true });
      if (descriptor.set) makeBuiltIn2(descriptor.set, name, { setter: true });
      return defineProperty.f(target, name, descriptor);
    };
    return defineBuiltInAccessor;
  }
  var functionUncurryThisClause;
  var hasRequiredFunctionUncurryThisClause;
  function requireFunctionUncurryThisClause() {
    if (hasRequiredFunctionUncurryThisClause) return functionUncurryThisClause;
    hasRequiredFunctionUncurryThisClause = 1;
    var classofRaw2 = requireClassofRaw();
    var uncurryThis = requireFunctionUncurryThis();
    functionUncurryThisClause = function(fn) {
      if (classofRaw2(fn) === "Function") return uncurryThis(fn);
    };
    return functionUncurryThisClause;
  }
  var functionBindContext;
  var hasRequiredFunctionBindContext;
  function requireFunctionBindContext() {
    if (hasRequiredFunctionBindContext) return functionBindContext;
    hasRequiredFunctionBindContext = 1;
    var uncurryThis = requireFunctionUncurryThisClause();
    var aCallable2 = requireACallable();
    var NATIVE_BIND = requireFunctionBindNative();
    var bind2 = uncurryThis(uncurryThis.bind);
    functionBindContext = function(fn, that) {
      aCallable2(fn);
      return that === void 0 ? fn : NATIVE_BIND ? bind2(fn, that) : function() {
        return fn.apply(that, arguments);
      };
    };
    return functionBindContext;
  }
  var addDisposableResource;
  var hasRequiredAddDisposableResource;
  function requireAddDisposableResource() {
    if (hasRequiredAddDisposableResource) return addDisposableResource;
    hasRequiredAddDisposableResource = 1;
    var call = requireFunctionCall();
    var uncurryThis = requireFunctionUncurryThis();
    var bind2 = requireFunctionBindContext();
    var anObject2 = requireAnObject();
    var aCallable2 = requireACallable();
    var isNullOrUndefined2 = requireIsNullOrUndefined();
    var getMethod2 = requireGetMethod();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var ASYNC_DISPOSE = wellKnownSymbol2("asyncDispose");
    var DISPOSE = wellKnownSymbol2("dispose");
    var push = uncurryThis([].push);
    var getDisposeMethod = function(V, hint) {
      if (hint === "async-dispose") {
        var method = getMethod2(V, ASYNC_DISPOSE);
        if (method !== void 0) return method;
        method = getMethod2(V, DISPOSE);
        if (method === void 0) return method;
        return function() {
          call(method, this);
        };
      }
      return getMethod2(V, DISPOSE);
    };
    var createDisposableResource = function(V, hint, method) {
      if (arguments.length < 3 && !isNullOrUndefined2(V)) {
        method = aCallable2(getDisposeMethod(anObject2(V), hint));
      }
      return method === void 0 ? function() {
        return void 0;
      } : bind2(method, V);
    };
    addDisposableResource = function(disposable, V, hint, method) {
      var resource;
      if (arguments.length < 4) {
        if (isNullOrUndefined2(V) && hint === "sync-dispose") return;
        resource = createDisposableResource(V, hint);
      } else {
        resource = createDisposableResource(void 0, hint, method);
      }
      push(disposable.stack, resource);
    };
    return addDisposableResource;
  }
  var hasRequiredEsnext_asyncDisposableStack_constructor;
  function requireEsnext_asyncDisposableStack_constructor() {
    if (hasRequiredEsnext_asyncDisposableStack_constructor) return esnext_asyncDisposableStack_constructor;
    hasRequiredEsnext_asyncDisposableStack_constructor = 1;
    var $ = require_export();
    var DESCRIPTORS = requireDescriptors();
    var getBuiltIn2 = requireGetBuiltIn();
    var aCallable2 = requireACallable();
    var anInstance2 = requireAnInstance();
    var defineBuiltIn2 = requireDefineBuiltIn();
    var defineBuiltIns2 = requireDefineBuiltIns();
    var defineBuiltInAccessor2 = requireDefineBuiltInAccessor();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var InternalStateModule = requireInternalState();
    var addDisposableResource2 = requireAddDisposableResource();
    var Promise2 = getBuiltIn2("Promise");
    var SuppressedError2 = getBuiltIn2("SuppressedError");
    var $ReferenceError = ReferenceError;
    var ASYNC_DISPOSE = wellKnownSymbol2("asyncDispose");
    var TO_STRING_TAG = wellKnownSymbol2("toStringTag");
    var ASYNC_DISPOSABLE_STACK = "AsyncDisposableStack";
    var setInternalState = InternalStateModule.set;
    var getAsyncDisposableStackInternalState = InternalStateModule.getterFor(ASYNC_DISPOSABLE_STACK);
    var HINT = "async-dispose";
    var DISPOSED = "disposed";
    var PENDING = "pending";
    var getPendingAsyncDisposableStackInternalState = function(stack) {
      var internalState2 = getAsyncDisposableStackInternalState(stack);
      if (internalState2.state === DISPOSED) throw new $ReferenceError(ASYNC_DISPOSABLE_STACK + " already disposed");
      return internalState2;
    };
    var $AsyncDisposableStack = function AsyncDisposableStack2() {
      setInternalState(anInstance2(this, AsyncDisposableStackPrototype), {
        type: ASYNC_DISPOSABLE_STACK,
        state: PENDING,
        stack: []
      });
      if (!DESCRIPTORS) this.disposed = false;
    };
    var AsyncDisposableStackPrototype = $AsyncDisposableStack.prototype;
    defineBuiltIns2(AsyncDisposableStackPrototype, {
      disposeAsync: function disposeAsync() {
        var asyncDisposableStack = this;
        return new Promise2(function(resolve, reject) {
          var internalState2 = getAsyncDisposableStackInternalState(asyncDisposableStack);
          if (internalState2.state === DISPOSED) return resolve(void 0);
          internalState2.state = DISPOSED;
          if (!DESCRIPTORS) asyncDisposableStack.disposed = true;
          var stack = internalState2.stack;
          var i = stack.length;
          var thrown = false;
          var suppressed;
          var handleError = function(result) {
            if (thrown) {
              suppressed = new SuppressedError2(result, suppressed);
            } else {
              thrown = true;
              suppressed = result;
            }
            loop();
          };
          var loop = function() {
            if (i) {
              var disposeMethod = stack[--i];
              stack[i] = null;
              try {
                Promise2.resolve(disposeMethod()).then(loop, handleError);
              } catch (error) {
                handleError(error);
              }
            } else {
              internalState2.stack = null;
              thrown ? reject(suppressed) : resolve(void 0);
            }
          };
          loop();
        });
      },
      use: function use(value) {
        addDisposableResource2(getPendingAsyncDisposableStackInternalState(this), value, HINT);
        return value;
      },
      adopt: function adopt(value, onDispose) {
        var internalState2 = getPendingAsyncDisposableStackInternalState(this);
        aCallable2(onDispose);
        addDisposableResource2(internalState2, void 0, HINT, function() {
          return onDispose(value);
        });
        return value;
      },
      defer: function defer(onDispose) {
        var internalState2 = getPendingAsyncDisposableStackInternalState(this);
        aCallable2(onDispose);
        addDisposableResource2(internalState2, void 0, HINT, onDispose);
      },
      move: function move() {
        var internalState2 = getPendingAsyncDisposableStackInternalState(this);
        var newAsyncDisposableStack = new $AsyncDisposableStack();
        getAsyncDisposableStackInternalState(newAsyncDisposableStack).stack = internalState2.stack;
        internalState2.stack = [];
        internalState2.state = DISPOSED;
        if (!DESCRIPTORS) this.disposed = true;
        return newAsyncDisposableStack;
      }
    });
    if (DESCRIPTORS) defineBuiltInAccessor2(AsyncDisposableStackPrototype, "disposed", {
      configurable: true,
      get: function disposed() {
        return getAsyncDisposableStackInternalState(this).state === DISPOSED;
      }
    });
    defineBuiltIn2(AsyncDisposableStackPrototype, ASYNC_DISPOSE, AsyncDisposableStackPrototype.disposeAsync, { name: "disposeAsync" });
    defineBuiltIn2(AsyncDisposableStackPrototype, TO_STRING_TAG, ASYNC_DISPOSABLE_STACK, { nonWritable: true });
    $({ global: true, constructor: true }, {
      AsyncDisposableStack: $AsyncDisposableStack
    });
    return esnext_asyncDisposableStack_constructor;
  }
  var esnext_asyncIterator_asyncDispose = {};
  var asyncIteratorPrototype;
  var hasRequiredAsyncIteratorPrototype;
  function requireAsyncIteratorPrototype() {
    if (hasRequiredAsyncIteratorPrototype) return asyncIteratorPrototype;
    hasRequiredAsyncIteratorPrototype = 1;
    var globalThis2 = requireGlobalThis();
    var shared2 = requireSharedStore();
    var isCallable2 = requireIsCallable();
    var create = requireObjectCreate();
    var getPrototypeOf = requireObjectGetPrototypeOf();
    var defineBuiltIn2 = requireDefineBuiltIn();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var IS_PURE = requireIsPure();
    var USE_FUNCTION_CONSTRUCTOR = "USE_FUNCTION_CONSTRUCTOR";
    var ASYNC_ITERATOR = wellKnownSymbol2("asyncIterator");
    var AsyncIterator = globalThis2.AsyncIterator;
    var PassedAsyncIteratorPrototype = shared2.AsyncIteratorPrototype;
    var AsyncIteratorPrototype, prototype;
    if (PassedAsyncIteratorPrototype) {
      AsyncIteratorPrototype = PassedAsyncIteratorPrototype;
    } else if (isCallable2(AsyncIterator)) {
      AsyncIteratorPrototype = AsyncIterator.prototype;
    } else if (shared2[USE_FUNCTION_CONSTRUCTOR] || globalThis2[USE_FUNCTION_CONSTRUCTOR]) {
      try {
        prototype = getPrototypeOf(getPrototypeOf(getPrototypeOf(Function("return async function*(){}()")())));
        if (getPrototypeOf(prototype) === Object.prototype) AsyncIteratorPrototype = prototype;
      } catch (error) {
      }
    }
    if (!AsyncIteratorPrototype) AsyncIteratorPrototype = {};
    else if (IS_PURE) AsyncIteratorPrototype = create(AsyncIteratorPrototype);
    if (!isCallable2(AsyncIteratorPrototype[ASYNC_ITERATOR])) {
      defineBuiltIn2(AsyncIteratorPrototype, ASYNC_ITERATOR, function() {
        return this;
      });
    }
    asyncIteratorPrototype = AsyncIteratorPrototype;
    return asyncIteratorPrototype;
  }
  var hasRequiredEsnext_asyncIterator_asyncDispose;
  function requireEsnext_asyncIterator_asyncDispose() {
    if (hasRequiredEsnext_asyncIterator_asyncDispose) return esnext_asyncIterator_asyncDispose;
    hasRequiredEsnext_asyncIterator_asyncDispose = 1;
    var call = requireFunctionCall();
    var defineBuiltIn2 = requireDefineBuiltIn();
    var getBuiltIn2 = requireGetBuiltIn();
    var getMethod2 = requireGetMethod();
    var hasOwn2 = requireHasOwnProperty();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var AsyncIteratorPrototype = requireAsyncIteratorPrototype();
    var ASYNC_DISPOSE = wellKnownSymbol2("asyncDispose");
    var Promise2 = getBuiltIn2("Promise");
    if (!hasOwn2(AsyncIteratorPrototype, ASYNC_DISPOSE)) {
      defineBuiltIn2(AsyncIteratorPrototype, ASYNC_DISPOSE, function() {
        var O = this;
        return new Promise2(function(resolve, reject) {
          var $return = getMethod2(O, "return");
          if ($return) {
            Promise2.resolve(call($return, O)).then(function() {
              resolve(void 0);
            }, reject);
          } else resolve(void 0);
        });
      });
    }
    return esnext_asyncIterator_asyncDispose;
  }
  var esnext_disposableStack_constructor = {};
  var hasRequiredEsnext_disposableStack_constructor;
  function requireEsnext_disposableStack_constructor() {
    if (hasRequiredEsnext_disposableStack_constructor) return esnext_disposableStack_constructor;
    hasRequiredEsnext_disposableStack_constructor = 1;
    var $ = require_export();
    var DESCRIPTORS = requireDescriptors();
    var getBuiltIn2 = requireGetBuiltIn();
    var aCallable2 = requireACallable();
    var anInstance2 = requireAnInstance();
    var defineBuiltIn2 = requireDefineBuiltIn();
    var defineBuiltIns2 = requireDefineBuiltIns();
    var defineBuiltInAccessor2 = requireDefineBuiltInAccessor();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var InternalStateModule = requireInternalState();
    var addDisposableResource2 = requireAddDisposableResource();
    var SuppressedError2 = getBuiltIn2("SuppressedError");
    var $ReferenceError = ReferenceError;
    var DISPOSE = wellKnownSymbol2("dispose");
    var TO_STRING_TAG = wellKnownSymbol2("toStringTag");
    var DISPOSABLE_STACK = "DisposableStack";
    var setInternalState = InternalStateModule.set;
    var getDisposableStackInternalState = InternalStateModule.getterFor(DISPOSABLE_STACK);
    var HINT = "sync-dispose";
    var DISPOSED = "disposed";
    var PENDING = "pending";
    var getPendingDisposableStackInternalState = function(stack) {
      var internalState2 = getDisposableStackInternalState(stack);
      if (internalState2.state === DISPOSED) throw new $ReferenceError(DISPOSABLE_STACK + " already disposed");
      return internalState2;
    };
    var $DisposableStack = function DisposableStack() {
      setInternalState(anInstance2(this, DisposableStackPrototype), {
        type: DISPOSABLE_STACK,
        state: PENDING,
        stack: []
      });
      if (!DESCRIPTORS) this.disposed = false;
    };
    var DisposableStackPrototype = $DisposableStack.prototype;
    defineBuiltIns2(DisposableStackPrototype, {
      dispose: function dispose() {
        var internalState2 = getDisposableStackInternalState(this);
        if (internalState2.state === DISPOSED) return;
        internalState2.state = DISPOSED;
        if (!DESCRIPTORS) this.disposed = true;
        var stack = internalState2.stack;
        var i = stack.length;
        var thrown = false;
        var suppressed;
        while (i) {
          var disposeMethod = stack[--i];
          stack[i] = null;
          try {
            disposeMethod();
          } catch (errorResult) {
            if (thrown) {
              suppressed = new SuppressedError2(errorResult, suppressed);
            } else {
              thrown = true;
              suppressed = errorResult;
            }
          }
        }
        internalState2.stack = null;
        if (thrown) throw suppressed;
      },
      use: function use(value) {
        addDisposableResource2(getPendingDisposableStackInternalState(this), value, HINT);
        return value;
      },
      adopt: function adopt(value, onDispose) {
        var internalState2 = getPendingDisposableStackInternalState(this);
        aCallable2(onDispose);
        addDisposableResource2(internalState2, void 0, HINT, function() {
          onDispose(value);
        });
        return value;
      },
      defer: function defer(onDispose) {
        var internalState2 = getPendingDisposableStackInternalState(this);
        aCallable2(onDispose);
        addDisposableResource2(internalState2, void 0, HINT, onDispose);
      },
      move: function move() {
        var internalState2 = getPendingDisposableStackInternalState(this);
        var newDisposableStack = new $DisposableStack();
        getDisposableStackInternalState(newDisposableStack).stack = internalState2.stack;
        internalState2.stack = [];
        internalState2.state = DISPOSED;
        if (!DESCRIPTORS) this.disposed = true;
        return newDisposableStack;
      }
    });
    if (DESCRIPTORS) defineBuiltInAccessor2(DisposableStackPrototype, "disposed", {
      configurable: true,
      get: function disposed() {
        return getDisposableStackInternalState(this).state === DISPOSED;
      }
    });
    defineBuiltIn2(DisposableStackPrototype, DISPOSE, DisposableStackPrototype.dispose, { name: "dispose" });
    defineBuiltIn2(DisposableStackPrototype, TO_STRING_TAG, DISPOSABLE_STACK, { nonWritable: true });
    $({ global: true, constructor: true }, {
      DisposableStack: $DisposableStack
    });
    return esnext_disposableStack_constructor;
  }
  var esnext_iterator_dispose = {};
  var iteratorsCore;
  var hasRequiredIteratorsCore;
  function requireIteratorsCore() {
    if (hasRequiredIteratorsCore) return iteratorsCore;
    hasRequiredIteratorsCore = 1;
    var fails2 = requireFails();
    var isCallable2 = requireIsCallable();
    var isObject2 = requireIsObject$1();
    var create = requireObjectCreate();
    var getPrototypeOf = requireObjectGetPrototypeOf();
    var defineBuiltIn2 = requireDefineBuiltIn();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var IS_PURE = requireIsPure();
    var ITERATOR = wellKnownSymbol2("iterator");
    var BUGGY_SAFARI_ITERATORS = false;
    var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;
    if ([].keys) {
      arrayIterator = [].keys();
      if (!("next" in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
      else {
        PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
        if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
      }
    }
    var NEW_ITERATOR_PROTOTYPE = !isObject2(IteratorPrototype) || fails2(function() {
      var test = {};
      return IteratorPrototype[ITERATOR].call(test) !== test;
    });
    if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
    else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);
    if (!isCallable2(IteratorPrototype[ITERATOR])) {
      defineBuiltIn2(IteratorPrototype, ITERATOR, function() {
        return this;
      });
    }
    iteratorsCore = {
      IteratorPrototype,
      BUGGY_SAFARI_ITERATORS
    };
    return iteratorsCore;
  }
  var hasRequiredEsnext_iterator_dispose;
  function requireEsnext_iterator_dispose() {
    if (hasRequiredEsnext_iterator_dispose) return esnext_iterator_dispose;
    hasRequiredEsnext_iterator_dispose = 1;
    var call = requireFunctionCall();
    var defineBuiltIn2 = requireDefineBuiltIn();
    var getMethod2 = requireGetMethod();
    var hasOwn2 = requireHasOwnProperty();
    var wellKnownSymbol2 = requireWellKnownSymbol();
    var IteratorPrototype = requireIteratorsCore().IteratorPrototype;
    var DISPOSE = wellKnownSymbol2("dispose");
    if (!hasOwn2(IteratorPrototype, DISPOSE)) {
      defineBuiltIn2(IteratorPrototype, DISPOSE, function() {
        var $return = getMethod2(this, "return");
        if ($return) call($return, this);
      });
    }
    return esnext_iterator_dispose;
  }
  var esnext_symbol_asyncDispose = {};
  var path;
  var hasRequiredPath;
  function requirePath() {
    if (hasRequiredPath) return path;
    hasRequiredPath = 1;
    var globalThis2 = requireGlobalThis();
    path = globalThis2;
    return path;
  }
  var wellKnownSymbolWrapped = {};
  var hasRequiredWellKnownSymbolWrapped;
  function requireWellKnownSymbolWrapped() {
    if (hasRequiredWellKnownSymbolWrapped) return wellKnownSymbolWrapped;
    hasRequiredWellKnownSymbolWrapped = 1;
    var wellKnownSymbol2 = requireWellKnownSymbol();
    wellKnownSymbolWrapped.f = wellKnownSymbol2;
    return wellKnownSymbolWrapped;
  }
  var wellKnownSymbolDefine;
  var hasRequiredWellKnownSymbolDefine;
  function requireWellKnownSymbolDefine() {
    if (hasRequiredWellKnownSymbolDefine) return wellKnownSymbolDefine;
    hasRequiredWellKnownSymbolDefine = 1;
    var path2 = requirePath();
    var hasOwn2 = requireHasOwnProperty();
    var wrappedWellKnownSymbolModule = requireWellKnownSymbolWrapped();
    var defineProperty = requireObjectDefineProperty().f;
    wellKnownSymbolDefine = function(NAME) {
      var Symbol2 = path2.Symbol || (path2.Symbol = {});
      if (!hasOwn2(Symbol2, NAME)) defineProperty(Symbol2, NAME, {
        value: wrappedWellKnownSymbolModule.f(NAME)
      });
    };
    return wellKnownSymbolDefine;
  }
  var hasRequiredEsnext_symbol_asyncDispose;
  function requireEsnext_symbol_asyncDispose() {
    if (hasRequiredEsnext_symbol_asyncDispose) return esnext_symbol_asyncDispose;
    hasRequiredEsnext_symbol_asyncDispose = 1;
    var globalThis2 = requireGlobalThis();
    var defineWellKnownSymbol = requireWellKnownSymbolDefine();
    var defineProperty = requireObjectDefineProperty().f;
    var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
    var Symbol2 = globalThis2.Symbol;
    defineWellKnownSymbol("asyncDispose");
    if (Symbol2) {
      var descriptor = getOwnPropertyDescriptor(Symbol2, "asyncDispose");
      if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
        defineProperty(Symbol2, "asyncDispose", { value: descriptor.value, enumerable: false, configurable: false, writable: false });
      }
    }
    return esnext_symbol_asyncDispose;
  }
  var esnext_symbol_dispose = {};
  var hasRequiredEsnext_symbol_dispose;
  function requireEsnext_symbol_dispose() {
    if (hasRequiredEsnext_symbol_dispose) return esnext_symbol_dispose;
    hasRequiredEsnext_symbol_dispose = 1;
    var globalThis2 = requireGlobalThis();
    var defineWellKnownSymbol = requireWellKnownSymbolDefine();
    var defineProperty = requireObjectDefineProperty().f;
    var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
    var Symbol2 = globalThis2.Symbol;
    defineWellKnownSymbol("dispose");
    if (Symbol2) {
      var descriptor = getOwnPropertyDescriptor(Symbol2, "dispose");
      if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
        defineProperty(Symbol2, "dispose", { value: descriptor.value, enumerable: false, configurable: false, writable: false });
      }
    }
    return esnext_symbol_dispose;
  }
  var hasRequiredExplicitResourceManagement;
  function requireExplicitResourceManagement() {
    if (hasRequiredExplicitResourceManagement) return explicitResourceManagement;
    hasRequiredExplicitResourceManagement = 1;
    requireEsnext_suppressedError_constructor();
    requireEsnext_asyncDisposableStack_constructor();
    requireEsnext_asyncIterator_asyncDispose();
    requireEsnext_disposableStack_constructor();
    requireEsnext_iterator_dispose();
    requireEsnext_symbol_asyncDispose();
    requireEsnext_symbol_dispose();
    return explicitResourceManagement;
  }
  requireExplicitResourceManagement();
  const settingsGroup = "_settings-group_1xm9d_1";
  const settingsGroupTitle = "_settings-group-title_1xm9d_4";
  const settingsGroupSubTitle = "_settings-group-sub-title_1xm9d_9";
  const settingsGroupContent = "_settings-group-content_1xm9d_15";
  const row = "_row_1xm9d_22";
  const tabPane = "_tab-pane_1xm9d_28";
  const styles$1 = {
    settingsGroup,
    settingsGroupTitle,
    settingsGroupSubTitle,
    settingsGroupContent,
    row,
    tabPane
  };
  const biliVideoCard = "_bili-video-card_js289_1";
  const previewCardWrapper = "_preview-card-wrapper_js289_8";
  const styles = {
    biliVideoCard,
    previewCardWrapper
  };
  const videoGrid = "_video-grid_1j5py_7";
  const newCardStyle = "_new-card-style_1j5py_16";
  const videoGridBiliFeed4 = "_video-grid-bili-feed4_1j5py_24";
  const limitTwoLines = "_limit-two-lines_1j5py_42";
  const videoGridContainer = "_video-grid-container_1j5py_60";
  const videoGridCustom = "_video-grid-custom_1j5py_71";
  const narrowMode = "_narrow-mode_1j5py_121";
  var browser = { exports: {} };
  var ms$1;
  var hasRequiredMs;
  function requireMs() {
    if (hasRequiredMs) return ms$1;
    hasRequiredMs = 1;
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d2 = h * 24;
    var w = d2 * 7;
    var y = d2 * 365.25;
    ms$1 = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse2(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse2(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match2 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match2) {
        return;
      }
      var n = parseFloat(match2[1]);
      var type = (match2[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d2;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d2) {
        return Math.round(ms2 / d2) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms2 / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms2 / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms2 / s) + "s";
      }
      return ms2 + "ms";
    }
    function fmtLong(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d2) {
        return plural(ms2, msAbs, d2, "day");
      }
      if (msAbs >= h) {
        return plural(ms2, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms2, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms2, msAbs, s, "second");
      }
      return ms2 + " ms";
    }
    function plural(ms2, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
    }
    return ms$1;
  }
  var common;
  var hasRequiredCommon;
  function requireCommon() {
    if (hasRequiredCommon) return common;
    hasRequiredCommon = 1;
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = requireMs();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash2 = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i);
          hash2 |= 0;
        }
        return createDebug.colors[Math.abs(hash2) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug2(...args) {
          if (!debug2.enabled) {
            return;
          }
          const self2 = debug2;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms2 = curr - (prevTime || curr);
          self2.diff = ms2;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match2, format) => {
            if (match2 === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match2 = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match2;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug2.namespace = namespace;
        debug2.useColors = createDebug.useColors();
        debug2.color = createDebug.selectColor(namespace);
        debug2.extend = extend;
        debug2.destroy = createDebug.destroy;
        Object.defineProperty(debug2, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug2);
        }
        return debug2;
      }
      function extend(namespace, delimiter2) {
        const newDebug = createDebug(this.namespace + (typeof delimiter2 === "undefined" ? ":" : delimiter2) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(" ", ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    common = setup;
    return common;
  }
  var hasRequiredBrowser;
  function requireBrowser() {
    if (hasRequiredBrowser) return browser.exports;
    hasRequiredBrowser = 1;
    (function(module, exports) {
      var define_process_env_default = {};
      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors2;
      exports.storage = localstorage();
      exports.destroy = /* @__PURE__ */ (() => {
        let warned = false;
        return () => {
          if (!warned) {
            warned = true;
            console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
          }
        };
      })();
      exports.colors = [
        "#0000CC",
        "#0000FF",
        "#0033CC",
        "#0033FF",
        "#0066CC",
        "#0066FF",
        "#0099CC",
        "#0099FF",
        "#00CC00",
        "#00CC33",
        "#00CC66",
        "#00CC99",
        "#00CCCC",
        "#00CCFF",
        "#3300CC",
        "#3300FF",
        "#3333CC",
        "#3333FF",
        "#3366CC",
        "#3366FF",
        "#3399CC",
        "#3399FF",
        "#33CC00",
        "#33CC33",
        "#33CC66",
        "#33CC99",
        "#33CCCC",
        "#33CCFF",
        "#6600CC",
        "#6600FF",
        "#6633CC",
        "#6633FF",
        "#66CC00",
        "#66CC33",
        "#9900CC",
        "#9900FF",
        "#9933CC",
        "#9933FF",
        "#99CC00",
        "#99CC33",
        "#CC0000",
        "#CC0033",
        "#CC0066",
        "#CC0099",
        "#CC00CC",
        "#CC00FF",
        "#CC3300",
        "#CC3333",
        "#CC3366",
        "#CC3399",
        "#CC33CC",
        "#CC33FF",
        "#CC6600",
        "#CC6633",
        "#CC9900",
        "#CC9933",
        "#CCCC00",
        "#CCCC33",
        "#FF0000",
        "#FF0033",
        "#FF0066",
        "#FF0099",
        "#FF00CC",
        "#FF00FF",
        "#FF3300",
        "#FF3333",
        "#FF3366",
        "#FF3399",
        "#FF33CC",
        "#FF33FF",
        "#FF6600",
        "#FF6633",
        "#FF9900",
        "#FF9933",
        "#FFCC00",
        "#FFCC33"
      ];
      function useColors2() {
        if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
          return true;
        }
        if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
          return false;
        }
        let m;
        return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
        typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
        typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
      }
      function formatArgs(args) {
        args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
        if (!this.useColors) {
          return;
        }
        const c2 = "color: " + this.color;
        args.splice(1, 0, c2, "color: inherit");
        let index = 0;
        let lastC = 0;
        args[0].replace(/%[a-zA-Z%]/g, (match2) => {
          if (match2 === "%%") {
            return;
          }
          index++;
          if (match2 === "%c") {
            lastC = index;
          }
        });
        args.splice(lastC, 0, c2);
      }
      exports.log = console.debug || console.log || (() => {
      });
      function save(namespaces) {
        try {
          if (namespaces) {
            exports.storage.setItem("debug", namespaces);
          } else {
            exports.storage.removeItem("debug");
          }
        } catch (error) {
        }
      }
      function load() {
        let r2;
        try {
          r2 = exports.storage.getItem("debug");
        } catch (error) {
        }
        if (!r2 && typeof process !== "undefined" && "env" in process) {
          r2 = define_process_env_default.DEBUG;
        }
        return r2;
      }
      function localstorage() {
        try {
          return localStorage;
        } catch (error) {
        }
      }
      module.exports = requireCommon()(exports);
      const { formatters } = module.exports;
      formatters.j = function(v) {
        try {
          return JSON.stringify(v);
        } catch (error) {
          return "[UnexpectedJSONParseError]: " + error.message;
        }
      };
    })(browser, browser.exports);
    return browser.exports;
  }
  var browserExports = requireBrowser();
  const debugFactory = /* @__PURE__ */ getDefaultExportFromCjs(browserExports);
  const APP_NAME = "Bilibili-Gate";
  const APP_NAMESPACE = "bilibili-gate";
  const APP_KEY_PREFIX = "bilibili_gate";
  const APP_SHORT_PREFIX = "bili-gate";
  const baseDebug = debugFactory(APP_NAMESPACE);
  const HOST_API = "https://api.bilibili.com";
  const HOST_APP = "https://app.bilibili.com";
  const TVKeyInfo = {
    appkey: "4409e2ce8ffd12b8",
    appsec: "59b43e04ad6965f34319062b478f83dd"
  };
  const APP_CLS_ROOT = `${APP_NAMESPACE}-root`;
  const APP_CLS_GRID = `${APP_NAMESPACE}-video-grid`;
  const APP_CLS_CARD = `${APP_NAMESPACE}-video-card`;
  const APP_CLS_CARD_ACTIVE = `${APP_NAMESPACE}-video-card-active`;
  const APP_CLS_TAB_BAR = `${APP_NAMESPACE}-tab-bar`;
  const REQUEST_FAIL_MSG = "请求失败, 请重试 !!!";
  const OPERATION_FAIL_MSG = "操作失败, 请重试 !!!";
  const hostname = location.hostname;
  const pathname = location.pathname || "";
  const IN_BILIBILI = hostname.endsWith("bilibili.com");
  const IN_BILIBILI_HOMEPAGE = IN_BILIBILI && (pathname === "/" || pathname === "/index.html");
  const IN_BILIBILI_VIDEO_PLAY_PAGE = IN_BILIBILI && (pathname.startsWith("/video/") || pathname.startsWith("/list/watchlater") || pathname.startsWith("/bangumi/play/"));
  const IN_BILIBILI_SPACE_PAGE = hostname === "space.bilibili.com";
  function logFactory(logFn) {
    return function appLog2(...args) {
      const [message2, ...rest] = args;
      if (typeof message2 === "string") {
        return logFn(`[${APP_NAME}]: ${message2}`, ...rest);
      } else {
        return logFn(`[${APP_NAME}]:`, message2, ...rest);
      }
    };
  }
  const appLog = logFactory(console.log);
  const appWarn = logFactory(console.warn);
  var ETab = /* @__PURE__ */ ((ETab2) => {
    ETab2["AppRecommend"] = "app-recommend";
    ETab2["PcRecommend"] = "pc-recommend";
    ETab2["KeepFollowOnly"] = "keep-follow-only";
    ETab2["DynamicFeed"] = "dynamic-feed";
    ETab2["Watchlater"] = "watchlater";
    ETab2["Fav"] = "fav";
    ETab2["Hot"] = "hot";
    ETab2["Live"] = "live";
    return ETab2;
  })(ETab || {});
  var EHotSubTab = /* @__PURE__ */ ((EHotSubTab2) => {
    EHotSubTab2["PopularGeneral"] = "popular-general";
    EHotSubTab2["PopularWeekly"] = "popular-weekly";
    EHotSubTab2["Ranking"] = "ranking";
    return EHotSubTab2;
  })(EHotSubTab || {});
  const TabKeys = Object.values(ETab);
  var jsxRuntime = { exports: {} };
  var reactJsxRuntime_production_min = {};
  /**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var hasRequiredReactJsxRuntime_production_min;
  function requireReactJsxRuntime_production_min() {
    if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
    hasRequiredReactJsxRuntime_production_min = 1;
    var f = React, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
    function q(c2, a, g) {
      var b, d2 = {}, e = null, h = null;
      void 0 !== g && (e = "" + g);
      void 0 !== a.key && (e = "" + a.key);
      void 0 !== a.ref && (h = a.ref);
      for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d2[b] = a[b]);
      if (c2 && c2.defaultProps) for (b in a = c2.defaultProps, a) void 0 === d2[b] && (d2[b] = a[b]);
      return { $$typeof: k, type: c2, key: e, ref: h, props: d2, _owner: n.current };
    }
    reactJsxRuntime_production_min.Fragment = l;
    reactJsxRuntime_production_min.jsx = q;
    reactJsxRuntime_production_min.jsxs = q;
    return reactJsxRuntime_production_min;
  }
  var hasRequiredJsxRuntime;
  function requireJsxRuntime() {
    if (hasRequiredJsxRuntime) return jsxRuntime.exports;
    hasRequiredJsxRuntime = 1;
    {
      jsxRuntime.exports = requireReactJsxRuntime_production_min();
    }
    return jsxRuntime.exports;
  }
  var jsxRuntimeExports = requireJsxRuntime();
  var isDevelopment$2 = false;
  function sheetForTag(tag) {
    if (tag.sheet) {
      return tag.sheet;
    }
    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].ownerNode === tag) {
        return document.styleSheets[i];
      }
    }
    return void 0;
  }
  function createStyleElement(options) {
    var tag = document.createElement("style");
    tag.setAttribute("data-emotion", options.key);
    if (options.nonce !== void 0) {
      tag.setAttribute("nonce", options.nonce);
    }
    tag.appendChild(document.createTextNode(""));
    tag.setAttribute("data-s", "");
    return tag;
  }
  var StyleSheet = /* @__PURE__ */ function() {
    function StyleSheet2(options) {
      var _this = this;
      this._insertTag = function(tag) {
        var before;
        if (_this.tags.length === 0) {
          if (_this.insertionPoint) {
            before = _this.insertionPoint.nextSibling;
          } else if (_this.prepend) {
            before = _this.container.firstChild;
          } else {
            before = _this.before;
          }
        } else {
          before = _this.tags[_this.tags.length - 1].nextSibling;
        }
        _this.container.insertBefore(tag, before);
        _this.tags.push(tag);
      };
      this.isSpeedy = options.speedy === void 0 ? !isDevelopment$2 : options.speedy;
      this.tags = [];
      this.ctr = 0;
      this.nonce = options.nonce;
      this.key = options.key;
      this.container = options.container;
      this.prepend = options.prepend;
      this.insertionPoint = options.insertionPoint;
      this.before = null;
    }
    var _proto = StyleSheet2.prototype;
    _proto.hydrate = function hydrate(nodes) {
      nodes.forEach(this._insertTag);
    };
    _proto.insert = function insert(rule) {
      if (this.ctr % (this.isSpeedy ? 65e3 : 1) === 0) {
        this._insertTag(createStyleElement(this));
      }
      var tag = this.tags[this.tags.length - 1];
      if (this.isSpeedy) {
        var sheet = sheetForTag(tag);
        try {
          sheet.insertRule(rule, sheet.cssRules.length);
        } catch (e) {
        }
      } else {
        tag.appendChild(document.createTextNode(rule));
      }
      this.ctr++;
    };
    _proto.flush = function flush() {
      this.tags.forEach(function(tag) {
        var _tag$parentNode;
        return (_tag$parentNode = tag.parentNode) == null ? void 0 : _tag$parentNode.removeChild(tag);
      });
      this.tags = [];
      this.ctr = 0;
    };
    return StyleSheet2;
  }();
  var MS = "-ms-";
  var MOZ = "-moz-";
  var WEBKIT = "-webkit-";
  var COMMENT = "comm";
  var RULESET = "rule";
  var DECLARATION = "decl";
  var IMPORT = "@import";
  var KEYFRAMES = "@keyframes";
  var LAYER = "@layer";
  var abs = Math.abs;
  var from = String.fromCharCode;
  var assign = Object.assign;
  function hash(value, length2) {
    return charat(value, 0) ^ 45 ? (((length2 << 2 ^ charat(value, 0)) << 2 ^ charat(value, 1)) << 2 ^ charat(value, 2)) << 2 ^ charat(value, 3) : 0;
  }
  function trim(value) {
    return value.trim();
  }
  function match(value, pattern) {
    return (value = pattern.exec(value)) ? value[0] : value;
  }
  function replace(value, pattern, replacement) {
    return value.replace(pattern, replacement);
  }
  function indexof(value, search) {
    return value.indexOf(search);
  }
  function charat(value, index) {
    return value.charCodeAt(index) | 0;
  }
  function substr(value, begin, end) {
    return value.slice(begin, end);
  }
  function strlen(value) {
    return value.length;
  }
  function sizeof(value) {
    return value.length;
  }
  function append(value, array) {
    return array.push(value), value;
  }
  function combine(array, callback) {
    return array.map(callback).join("");
  }
  var line = 1;
  var column = 1;
  var length = 0;
  var position = 0;
  var character = 0;
  var characters = "";
  function node(value, root2, parent, type, props, children, length2) {
    return { value, root: root2, parent, type, props, children, line, column, length: length2, return: "" };
  }
  function copy(root2, props) {
    return assign(node("", null, null, "", null, null, 0), root2, { length: -root2.length }, props);
  }
  function char() {
    return character;
  }
  function prev() {
    character = position > 0 ? charat(characters, --position) : 0;
    if (column--, character === 10)
      column = 1, line--;
    return character;
  }
  function next() {
    character = position < length ? charat(characters, position++) : 0;
    if (column++, character === 10)
      column = 1, line++;
    return character;
  }
  function peek() {
    return charat(characters, position);
  }
  function caret() {
    return position;
  }
  function slice(begin, end) {
    return substr(characters, begin, end);
  }
  function token(type) {
    switch (type) {
      // \0 \t \n \r \s whitespace token
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;
      // ! + , / > @ ~ isolate token
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      // ; { } breakpoint token
      case 59:
      case 123:
      case 125:
        return 4;
      // : accompanied token
      case 58:
        return 3;
      // " ' ( [ opening delimit token
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;
      // ) ] closing delimit token
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  function alloc(value) {
    return line = column = 1, length = strlen(characters = value), position = 0, [];
  }
  function dealloc(value) {
    return characters = "", value;
  }
  function delimit(type) {
    return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)));
  }
  function whitespace(type) {
    while (character = peek())
      if (character < 33)
        next();
      else
        break;
    return token(type) > 2 || token(character) > 3 ? "" : " ";
  }
  function escaping(index, count) {
    while (--count && next())
      if (character < 48 || character > 102 || character > 57 && character < 65 || character > 70 && character < 97)
        break;
    return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32));
  }
  function delimiter(type) {
    while (next())
      switch (character) {
        // ] ) " '
        case type:
          return position;
        // " '
        case 34:
        case 39:
          if (type !== 34 && type !== 39)
            delimiter(character);
          break;
        // (
        case 40:
          if (type === 41)
            delimiter(type);
          break;
        // \
        case 92:
          next();
          break;
      }
    return position;
  }
  function commenter(type, index) {
    while (next())
      if (type + character === 47 + 10)
        break;
      else if (type + character === 42 + 42 && peek() === 47)
        break;
    return "/*" + slice(index, position - 1) + "*" + from(type === 47 ? type : next());
  }
  function identifier(index) {
    while (!token(peek()))
      next();
    return slice(index, position);
  }
  function compile(value) {
    return dealloc(parse("", null, null, null, [""], value = alloc(value), 0, [0], value));
  }
  function parse(value, root2, parent, rule, rules, rulesets, pseudo, points, declarations) {
    var index = 0;
    var offset = 0;
    var length2 = pseudo;
    var atrule = 0;
    var property = 0;
    var previous = 0;
    var variable = 1;
    var scanning = 1;
    var ampersand = 1;
    var character2 = 0;
    var type = "";
    var props = rules;
    var children = rulesets;
    var reference = rule;
    var characters2 = type;
    while (scanning)
      switch (previous = character2, character2 = next()) {
        // (
        case 40:
          if (previous != 108 && charat(characters2, length2 - 1) == 58) {
            if (indexof(characters2 += replace(delimit(character2), "&", "&\f"), "&\f") != -1)
              ampersand = -1;
            break;
          }
        // " ' [
        case 34:
        case 39:
        case 91:
          characters2 += delimit(character2);
          break;
        // \t \n \r \s
        case 9:
        case 10:
        case 13:
        case 32:
          characters2 += whitespace(previous);
          break;
        // \
        case 92:
          characters2 += escaping(caret() - 1, 7);
          continue;
        // /
        case 47:
          switch (peek()) {
            case 42:
            case 47:
              append(comment(commenter(next(), caret()), root2, parent), declarations);
              break;
            default:
              characters2 += "/";
          }
          break;
        // {
        case 123 * variable:
          points[index++] = strlen(characters2) * ampersand;
        // } ; \0
        case 125 * variable:
        case 59:
        case 0:
          switch (character2) {
            // \0 }
            case 0:
            case 125:
              scanning = 0;
            // ;
            case 59 + offset:
              if (ampersand == -1) characters2 = replace(characters2, /\f/g, "");
              if (property > 0 && strlen(characters2) - length2)
                append(property > 32 ? declaration(characters2 + ";", rule, parent, length2 - 1) : declaration(replace(characters2, " ", "") + ";", rule, parent, length2 - 2), declarations);
              break;
            // @ ;
            case 59:
              characters2 += ";";
            // { rule/at-rule
            default:
              append(reference = ruleset(characters2, root2, parent, index, offset, rules, points, type, props = [], children = [], length2), rulesets);
              if (character2 === 123)
                if (offset === 0)
                  parse(characters2, root2, reference, reference, props, rulesets, length2, points, children);
                else
                  switch (atrule === 99 && charat(characters2, 3) === 110 ? 100 : atrule) {
                    // d l m s
                    case 100:
                    case 108:
                    case 109:
                    case 115:
                      parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length2), children), rules, children, length2, points, rule ? props : children);
                      break;
                    default:
                      parse(characters2, reference, reference, reference, [""], children, 0, points, children);
                  }
          }
          index = offset = property = 0, variable = ampersand = 1, type = characters2 = "", length2 = pseudo;
          break;
        // :
        case 58:
          length2 = 1 + strlen(characters2), property = previous;
        default:
          if (variable < 1) {
            if (character2 == 123)
              --variable;
            else if (character2 == 125 && variable++ == 0 && prev() == 125)
              continue;
          }
          switch (characters2 += from(character2), character2 * variable) {
            // &
            case 38:
              ampersand = offset > 0 ? 1 : (characters2 += "\f", -1);
              break;
            // ,
            case 44:
              points[index++] = (strlen(characters2) - 1) * ampersand, ampersand = 1;
              break;
            // @
            case 64:
              if (peek() === 45)
                characters2 += delimit(next());
              atrule = peek(), offset = length2 = strlen(type = characters2 += identifier(caret())), character2++;
              break;
            // -
            case 45:
              if (previous === 45 && strlen(characters2) == 2)
                variable = 0;
          }
      }
    return rulesets;
  }
  function ruleset(value, root2, parent, index, offset, rules, points, type, props, children, length2) {
    var post = offset - 1;
    var rule = offset === 0 ? rules : [""];
    var size2 = sizeof(rule);
    for (var i = 0, j = 0, k = 0; i < index; ++i)
      for (var x = 0, y = substr(value, post + 1, post = abs(j = points[i])), z = value; x < size2; ++x)
        if (z = trim(j > 0 ? rule[x] + " " + y : replace(y, /&\f/g, rule[x])))
          props[k++] = z;
    return node(value, root2, parent, offset === 0 ? RULESET : type, props, children, length2);
  }
  function comment(value, root2, parent) {
    return node(value, root2, parent, COMMENT, from(char()), substr(value, 2, -2), 0);
  }
  function declaration(value, root2, parent, length2) {
    return node(value, root2, parent, DECLARATION, substr(value, 0, length2), substr(value, length2 + 1, -1), length2);
  }
  function serialize(children, callback) {
    var output = "";
    var length2 = sizeof(children);
    for (var i = 0; i < length2; i++)
      output += callback(children[i], i, children, callback) || "";
    return output;
  }
  function stringify(element, index, children, callback) {
    switch (element.type) {
      case LAYER:
        if (element.children.length) break;
      case IMPORT:
      case DECLARATION:
        return element.return = element.return || element.value;
      case COMMENT:
        return "";
      case KEYFRAMES:
        return element.return = element.value + "{" + serialize(element.children, callback) + "}";
      case RULESET:
        element.value = element.props.join(",");
    }
    return strlen(children = serialize(element.children, callback)) ? element.return = element.value + "{" + children + "}" : "";
  }
  function middleware(collection) {
    var length2 = sizeof(collection);
    return function(element, index, children, callback) {
      var output = "";
      for (var i = 0; i < length2; i++)
        output += collection[i](element, index, children, callback) || "";
      return output;
    };
  }
  function rulesheet(callback) {
    return function(element) {
      if (!element.root) {
        if (element = element.return)
          callback(element);
      }
    };
  }
  function memoize(fn) {
    var cache2 = /* @__PURE__ */ Object.create(null);
    return function(arg) {
      if (cache2[arg] === void 0) cache2[arg] = fn(arg);
      return cache2[arg];
    };
  }
  var identifierWithPointTracking = function identifierWithPointTracking2(begin, points, index) {
    var previous = 0;
    var character2 = 0;
    while (true) {
      previous = character2;
      character2 = peek();
      if (previous === 38 && character2 === 12) {
        points[index] = 1;
      }
      if (token(character2)) {
        break;
      }
      next();
    }
    return slice(begin, position);
  };
  var toRules = function toRules2(parsed2, points) {
    var index = -1;
    var character2 = 44;
    do {
      switch (token(character2)) {
        case 0:
          if (character2 === 38 && peek() === 12) {
            points[index] = 1;
          }
          parsed2[index] += identifierWithPointTracking(position - 1, points, index);
          break;
        case 2:
          parsed2[index] += delimit(character2);
          break;
        case 4:
          if (character2 === 44) {
            parsed2[++index] = peek() === 58 ? "&\f" : "";
            points[index] = parsed2[index].length;
            break;
          }
        // fallthrough
        default:
          parsed2[index] += from(character2);
      }
    } while (character2 = next());
    return parsed2;
  };
  var getRules = function getRules2(value, points) {
    return dealloc(toRules(alloc(value), points));
  };
  var fixedElements = /* @__PURE__ */ new WeakMap();
  var compat = function compat2(element) {
    if (element.type !== "rule" || !element.parent || // positive .length indicates that this rule contains pseudo
    // negative .length indicates that this rule has been already prefixed
    element.length < 1) {
      return;
    }
    var value = element.value, parent = element.parent;
    var isImplicitRule = element.column === parent.column && element.line === parent.line;
    while (parent.type !== "rule") {
      parent = parent.parent;
      if (!parent) return;
    }
    if (element.props.length === 1 && value.charCodeAt(0) !== 58 && !fixedElements.get(parent)) {
      return;
    }
    if (isImplicitRule) {
      return;
    }
    fixedElements.set(element, true);
    var points = [];
    var rules = getRules(value, points);
    var parentRules = parent.props;
    for (var i = 0, k = 0; i < rules.length; i++) {
      for (var j = 0; j < parentRules.length; j++, k++) {
        element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
      }
    }
  };
  var removeLabel = function removeLabel2(element) {
    if (element.type === "decl") {
      var value = element.value;
      if (
        // charcode for l
        value.charCodeAt(0) === 108 && // charcode for b
        value.charCodeAt(2) === 98
      ) {
        element["return"] = "";
        element.value = "";
      }
    }
  };
  function prefix(value, length2) {
    switch (hash(value, length2)) {
      // color-adjust
      case 5103:
        return WEBKIT + "print-" + value + value;
      // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
      case 4855:
      // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
        return WEBKIT + value + value;
      // appearance, user-select, transform, hyphens, text-size-adjust
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return WEBKIT + value + MOZ + value + MS + value + value;
      // flex, flex-direction
      case 6828:
      case 4268:
        return WEBKIT + value + MS + value + value;
      // order
      case 6165:
        return WEBKIT + value + MS + "flex-" + value + value;
      // align-items
      case 5187:
        return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + "box-$1$2" + MS + "flex-$1$2") + value;
      // align-self
      case 5443:
        return WEBKIT + value + MS + "flex-item-" + replace(value, /flex-|-self/, "") + value;
      // align-content
      case 4675:
        return WEBKIT + value + MS + "flex-line-pack" + replace(value, /align-content|flex-|-self/, "") + value;
      // flex-shrink
      case 5548:
        return WEBKIT + value + MS + replace(value, "shrink", "negative") + value;
      // flex-basis
      case 5292:
        return WEBKIT + value + MS + replace(value, "basis", "preferred-size") + value;
      // flex-grow
      case 6060:
        return WEBKIT + "box-" + replace(value, "-grow", "") + WEBKIT + value + MS + replace(value, "grow", "positive") + value;
      // transition
      case 4554:
        return WEBKIT + replace(value, /([^-])(transform)/g, "$1" + WEBKIT + "$2") + value;
      // cursor
      case 6187:
        return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + "$1"), /(image-set)/, WEBKIT + "$1"), value, "") + value;
      // background, background-image
      case 5495:
      case 3959:
        return replace(value, /(image-set\([^]*)/, WEBKIT + "$1$`$1");
      // justify-content
      case 4968:
        return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + "box-pack:$3" + MS + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + WEBKIT + value + value;
      // (margin|padding)-inline-(start|end)
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return replace(value, /(.+)-inline(.+)/, WEBKIT + "$1$2") + value;
      // (min|max)?(width|height|inline-size|block-size)
      case 8116:
      case 7059:
      case 5753:
      case 5535:
      case 5445:
      case 5701:
      case 4933:
      case 4677:
      case 5533:
      case 5789:
      case 5021:
      case 4765:
        if (strlen(value) - 1 - length2 > 6) switch (charat(value, length2 + 1)) {
          // (m)ax-content, (m)in-content
          case 109:
            if (charat(value, length2 + 4) !== 45) break;
          // (f)ill-available, (f)it-content
          case 102:
            return replace(value, /(.+:)(.+)-([^]+)/, "$1" + WEBKIT + "$2-$3$1" + MOZ + (charat(value, length2 + 3) == 108 ? "$3" : "$2-$3")) + value;
          // (s)tretch
          case 115:
            return ~indexof(value, "stretch") ? prefix(replace(value, "stretch", "fill-available"), length2) + value : value;
        }
        break;
      // position: sticky
      case 4949:
        if (charat(value, length2 + 1) !== 115) break;
      // display: (flex|inline-flex)
      case 6444:
        switch (charat(value, strlen(value) - 3 - (~indexof(value, "!important") && 10))) {
          // stic(k)y
          case 107:
            return replace(value, ":", ":" + WEBKIT) + value;
          // (inline-)?fl(e)x
          case 101:
            return replace(value, /(.+:)([^;!]+)(;|!.+)?/, "$1" + WEBKIT + (charat(value, 14) === 45 ? "inline-" : "") + "box$3$1" + WEBKIT + "$2$3$1" + MS + "$2box$3") + value;
        }
        break;
      // writing-mode
      case 5936:
        switch (charat(value, length2 + 11)) {
          // vertical-l(r)
          case 114:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb") + value;
          // vertical-r(l)
          case 108:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb-rl") + value;
          // horizontal(-)tb
          case 45:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "lr") + value;
        }
        return WEBKIT + value + MS + value + value;
    }
    return value;
  }
  var prefixer = function prefixer2(element, index, children, callback) {
    if (element.length > -1) {
      if (!element["return"]) switch (element.type) {
        case DECLARATION:
          element["return"] = prefix(element.value, element.length);
          break;
        case KEYFRAMES:
          return serialize([copy(element, {
            value: replace(element.value, "@", "@" + WEBKIT)
          })], callback);
        case RULESET:
          if (element.length) return combine(element.props, function(value) {
            switch (match(value, /(::plac\w+|:read-\w+)/)) {
              // :read-(only|write)
              case ":read-only":
              case ":read-write":
                return serialize([copy(element, {
                  props: [replace(value, /:(read-\w+)/, ":" + MOZ + "$1")]
                })], callback);
              // :placeholder
              case "::placeholder":
                return serialize([copy(element, {
                  props: [replace(value, /:(plac\w+)/, ":" + WEBKIT + "input-$1")]
                }), copy(element, {
                  props: [replace(value, /:(plac\w+)/, ":" + MOZ + "$1")]
                }), copy(element, {
                  props: [replace(value, /:(plac\w+)/, MS + "input-$1")]
                })], callback);
            }
            return "";
          });
      }
    }
  };
  var defaultStylisPlugins = [prefixer];
  var createCache = function createCache2(options) {
    var key = options.key;
    if (key === "css") {
      var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])");
      Array.prototype.forEach.call(ssrStyles, function(node2) {
        var dataEmotionAttribute = node2.getAttribute("data-emotion");
        if (dataEmotionAttribute.indexOf(" ") === -1) {
          return;
        }
        document.head.appendChild(node2);
        node2.setAttribute("data-s", "");
      });
    }
    var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;
    var inserted = {};
    var container;
    var nodesToHydrate = [];
    {
      container = options.container || document.head;
      Array.prototype.forEach.call(
        // this means we will ignore elements which don't have a space in them which
        // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
        document.querySelectorAll('style[data-emotion^="' + key + ' "]'),
        function(node2) {
          var attrib = node2.getAttribute("data-emotion").split(" ");
          for (var i = 1; i < attrib.length; i++) {
            inserted[attrib[i]] = true;
          }
          nodesToHydrate.push(node2);
        }
      );
    }
    var _insert;
    var omnipresentPlugins = [compat, removeLabel];
    {
      var currentSheet;
      var finalizingPlugins = [stringify, rulesheet(function(rule) {
        currentSheet.insert(rule);
      })];
      var serializer = middleware(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));
      var stylis = function stylis2(styles2) {
        return serialize(compile(styles2), serializer);
      };
      _insert = function insert(selector, serialized, sheet, shouldCache) {
        currentSheet = sheet;
        stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
        if (shouldCache) {
          cache2.inserted[serialized.name] = true;
        }
      };
    }
    var cache2 = {
      key,
      sheet: new StyleSheet({
        key,
        container,
        nonce: options.nonce,
        speedy: options.speedy,
        prepend: options.prepend,
        insertionPoint: options.insertionPoint
      }),
      nonce: options.nonce,
      inserted,
      registered: {},
      insert: _insert
    };
    cache2.sheet.hydrate(nodesToHydrate);
    return cache2;
  };
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  var reactIs = { exports: {} };
  var reactIs_production_min = {};
  /** @license React v16.13.1
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var hasRequiredReactIs_production_min;
  function requireReactIs_production_min() {
    if (hasRequiredReactIs_production_min) return reactIs_production_min;
    hasRequiredReactIs_production_min = 1;
    var b = "function" === typeof Symbol && Symbol.for, c2 = b ? Symbol.for("react.element") : 60103, d2 = b ? Symbol.for("react.portal") : 60106, e = b ? Symbol.for("react.fragment") : 60107, f = b ? Symbol.for("react.strict_mode") : 60108, g = b ? Symbol.for("react.profiler") : 60114, h = b ? Symbol.for("react.provider") : 60109, k = b ? Symbol.for("react.context") : 60110, l = b ? Symbol.for("react.async_mode") : 60111, m = b ? Symbol.for("react.concurrent_mode") : 60111, n = b ? Symbol.for("react.forward_ref") : 60112, p = b ? Symbol.for("react.suspense") : 60113, q = b ? Symbol.for("react.suspense_list") : 60120, r2 = b ? Symbol.for("react.memo") : 60115, t = b ? Symbol.for("react.lazy") : 60116, v = b ? Symbol.for("react.block") : 60121, w = b ? Symbol.for("react.fundamental") : 60117, x = b ? Symbol.for("react.responder") : 60118, y = b ? Symbol.for("react.scope") : 60119;
    function z(a) {
      if ("object" === typeof a && null !== a) {
        var u = a.$$typeof;
        switch (u) {
          case c2:
            switch (a = a.type, a) {
              case l:
              case m:
              case e:
              case g:
              case f:
              case p:
                return a;
              default:
                switch (a = a && a.$$typeof, a) {
                  case k:
                  case n:
                  case t:
                  case r2:
                  case h:
                    return a;
                  default:
                    return u;
                }
            }
          case d2:
            return u;
        }
      }
    }
    function A(a) {
      return z(a) === m;
    }
    reactIs_production_min.AsyncMode = l;
    reactIs_production_min.ConcurrentMode = m;
    reactIs_production_min.ContextConsumer = k;
    reactIs_production_min.ContextProvider = h;
    reactIs_production_min.Element = c2;
    reactIs_production_min.ForwardRef = n;
    reactIs_production_min.Fragment = e;
    reactIs_production_min.Lazy = t;
    reactIs_production_min.Memo = r2;
    reactIs_production_min.Portal = d2;
    reactIs_production_min.Profiler = g;
    reactIs_production_min.StrictMode = f;
    reactIs_production_min.Suspense = p;
    reactIs_production_min.isAsyncMode = function(a) {
      return A(a) || z(a) === l;
    };
    reactIs_production_min.isConcurrentMode = A;
    reactIs_production_min.isContextConsumer = function(a) {
      return z(a) === k;
    };
    reactIs_production_min.isContextProvider = function(a) {
      return z(a) === h;
    };
    reactIs_production_min.isElement = function(a) {
      return "object" === typeof a && null !== a && a.$$typeof === c2;
    };
    reactIs_production_min.isForwardRef = function(a) {
      return z(a) === n;
    };
    reactIs_production_min.isFragment = function(a) {
      return z(a) === e;
    };
    reactIs_production_min.isLazy = function(a) {
      return z(a) === t;
    };
    reactIs_production_min.isMemo = function(a) {
      return z(a) === r2;
    };
    reactIs_production_min.isPortal = function(a) {
      return z(a) === d2;
    };
    reactIs_production_min.isProfiler = function(a) {
      return z(a) === g;
    };
    reactIs_production_min.isStrictMode = function(a) {
      return z(a) === f;
    };
    reactIs_production_min.isSuspense = function(a) {
      return z(a) === p;
    };
    reactIs_production_min.isValidElementType = function(a) {
      return "string" === typeof a || "function" === typeof a || a === e || a === m || a === g || a === f || a === p || a === q || "object" === typeof a && null !== a && (a.$$typeof === t || a.$$typeof === r2 || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n || a.$$typeof === w || a.$$typeof === x || a.$$typeof === y || a.$$typeof === v);
    };
    reactIs_production_min.typeOf = z;
    return reactIs_production_min;
  }
  var hasRequiredReactIs;
  function requireReactIs() {
    if (hasRequiredReactIs) return reactIs.exports;
    hasRequiredReactIs = 1;
    {
      reactIs.exports = requireReactIs_production_min();
    }
    return reactIs.exports;
  }
  var hoistNonReactStatics_cjs;
  var hasRequiredHoistNonReactStatics_cjs;
  function requireHoistNonReactStatics_cjs() {
    if (hasRequiredHoistNonReactStatics_cjs) return hoistNonReactStatics_cjs;
    hasRequiredHoistNonReactStatics_cjs = 1;
    var reactIs2 = requireReactIs();
    var REACT_STATICS = {
      childContextTypes: true,
      contextType: true,
      contextTypes: true,
      defaultProps: true,
      displayName: true,
      getDefaultProps: true,
      getDerivedStateFromError: true,
      getDerivedStateFromProps: true,
      mixins: true,
      propTypes: true,
      type: true
    };
    var KNOWN_STATICS = {
      name: true,
      length: true,
      prototype: true,
      caller: true,
      callee: true,
      arguments: true,
      arity: true
    };
    var FORWARD_REF_STATICS = {
      "$$typeof": true,
      render: true,
      defaultProps: true,
      displayName: true,
      propTypes: true
    };
    var MEMO_STATICS = {
      "$$typeof": true,
      compare: true,
      defaultProps: true,
      displayName: true,
      propTypes: true,
      type: true
    };
    var TYPE_STATICS = {};
    TYPE_STATICS[reactIs2.ForwardRef] = FORWARD_REF_STATICS;
    TYPE_STATICS[reactIs2.Memo] = MEMO_STATICS;
    function getStatics(component) {
      if (reactIs2.isMemo(component)) {
        return MEMO_STATICS;
      }
      return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
    }
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = Object.prototype;
    function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
      if (typeof sourceComponent !== "string") {
        if (objectPrototype) {
          var inheritedComponent = getPrototypeOf(sourceComponent);
          if (inheritedComponent && inheritedComponent !== objectPrototype) {
            hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
          }
        }
        var keys = getOwnPropertyNames(sourceComponent);
        if (getOwnPropertySymbols) {
          keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }
        var targetStatics = getStatics(targetComponent);
        var sourceStatics = getStatics(sourceComponent);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
            var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
            try {
              defineProperty(targetComponent, key, descriptor);
            } catch (e) {
            }
          }
        }
      }
      return targetComponent;
    }
    hoistNonReactStatics_cjs = hoistNonReactStatics;
    return hoistNonReactStatics_cjs;
  }
  requireHoistNonReactStatics_cjs();
  var isBrowser$1 = true;
  function getRegisteredStyles(registered, registeredStyles, classNames) {
    var rawClassName = "";
    classNames.split(" ").forEach(function(className) {
      if (registered[className] !== void 0) {
        registeredStyles.push(registered[className] + ";");
      } else if (className) {
        rawClassName += className + " ";
      }
    });
    return rawClassName;
  }
  var registerStyles = function registerStyles2(cache2, serialized, isStringTag) {
    var className = cache2.key + "-" + serialized.name;
    if (
      // we only need to add the styles to the registered cache if the
      // class name could be used further down
      // the tree but if it's a string tag, we know it won't
      // so we don't have to add it to registered cache.
      // this improves memory usage since we can avoid storing the whole style string
      (isStringTag === false || // we need to always store it if we're in compat mode and
      // in node since emotion-server relies on whether a style is in
      // the registered cache to know whether a style is global or not
      // also, note that this check will be dead code eliminated in the browser
      isBrowser$1 === false) && cache2.registered[className] === void 0
    ) {
      cache2.registered[className] = serialized.styles;
    }
  };
  var insertStyles = function insertStyles2(cache2, serialized, isStringTag) {
    registerStyles(cache2, serialized, isStringTag);
    var className = cache2.key + "-" + serialized.name;
    if (cache2.inserted[serialized.name] === void 0) {
      var current = serialized;
      do {
        cache2.insert(serialized === current ? "." + className : "", current, cache2.sheet, true);
        current = current.next;
      } while (current !== void 0);
    }
  };
  function murmur2(str) {
    var h = 0;
    var k, i = 0, len = str.length;
    for (; len >= 4; ++i, len -= 4) {
      k = str.charCodeAt(i) & 255 | (str.charCodeAt(++i) & 255) << 8 | (str.charCodeAt(++i) & 255) << 16 | (str.charCodeAt(++i) & 255) << 24;
      k = /* Math.imul(k, m): */
      (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16);
      k ^= /* k >>> r: */
      k >>> 24;
      h = /* Math.imul(k, m): */
      (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
      (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16);
    }
    switch (len) {
      case 3:
        h ^= (str.charCodeAt(i + 2) & 255) << 16;
      case 2:
        h ^= (str.charCodeAt(i + 1) & 255) << 8;
      case 1:
        h ^= str.charCodeAt(i) & 255;
        h = /* Math.imul(h, m): */
        (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16);
    }
    h ^= h >>> 13;
    h = /* Math.imul(h, m): */
    (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16);
    return ((h ^ h >>> 15) >>> 0).toString(36);
  }
  var unitlessKeys = {
    animationIterationCount: 1,
    aspectRatio: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    scale: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    // SVG-related properties
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1
  };
  var isDevelopment$1 = false;
  var hyphenateRegex = /[A-Z]|^ms/g;
  var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;
  var isCustomProperty = function isCustomProperty2(property) {
    return property.charCodeAt(1) === 45;
  };
  var isProcessableValue = function isProcessableValue2(value) {
    return value != null && typeof value !== "boolean";
  };
  var processStyleName = /* @__PURE__ */ memoize(function(styleName) {
    return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, "-$&").toLowerCase();
  });
  var processStyleValue = function processStyleValue2(key, value) {
    switch (key) {
      case "animation":
      case "animationName": {
        if (typeof value === "string") {
          return value.replace(animationRegex, function(match2, p1, p2) {
            cursor = {
              name: p1,
              styles: p2,
              next: cursor
            };
            return p1;
          });
        }
      }
    }
    if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === "number" && value !== 0) {
      return value + "px";
    }
    return value;
  };
  var noComponentSelectorMessage = "Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";
  function handleInterpolation(mergedProps, registered, interpolation) {
    if (interpolation == null) {
      return "";
    }
    var componentSelector = interpolation;
    if (componentSelector.__emotion_styles !== void 0) {
      return componentSelector;
    }
    switch (typeof interpolation) {
      case "boolean": {
        return "";
      }
      case "object": {
        var keyframes = interpolation;
        if (keyframes.anim === 1) {
          cursor = {
            name: keyframes.name,
            styles: keyframes.styles,
            next: cursor
          };
          return keyframes.name;
        }
        var serializedStyles = interpolation;
        if (serializedStyles.styles !== void 0) {
          var next2 = serializedStyles.next;
          if (next2 !== void 0) {
            while (next2 !== void 0) {
              cursor = {
                name: next2.name,
                styles: next2.styles,
                next: cursor
              };
              next2 = next2.next;
            }
          }
          var styles2 = serializedStyles.styles + ";";
          return styles2;
        }
        return createStringFromObject(mergedProps, registered, interpolation);
      }
      case "function": {
        if (mergedProps !== void 0) {
          var previousCursor = cursor;
          var result = interpolation(mergedProps);
          cursor = previousCursor;
          return handleInterpolation(mergedProps, registered, result);
        }
        break;
      }
    }
    var asString = interpolation;
    if (registered == null) {
      return asString;
    }
    var cached = registered[asString];
    return cached !== void 0 ? cached : asString;
  }
  function createStringFromObject(mergedProps, registered, obj) {
    var string = "";
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
      }
    } else {
      for (var key in obj) {
        var value = obj[key];
        if (typeof value !== "object") {
          var asString = value;
          if (registered != null && registered[asString] !== void 0) {
            string += key + "{" + registered[asString] + "}";
          } else if (isProcessableValue(asString)) {
            string += processStyleName(key) + ":" + processStyleValue(key, asString) + ";";
          }
        } else {
          if (key === "NO_COMPONENT_SELECTOR" && isDevelopment$1) {
            throw new Error(noComponentSelectorMessage);
          }
          if (Array.isArray(value) && typeof value[0] === "string" && (registered == null || registered[value[0]] === void 0)) {
            for (var _i = 0; _i < value.length; _i++) {
              if (isProcessableValue(value[_i])) {
                string += processStyleName(key) + ":" + processStyleValue(key, value[_i]) + ";";
              }
            }
          } else {
            var interpolated = handleInterpolation(mergedProps, registered, value);
            switch (key) {
              case "animation":
              case "animationName": {
                string += processStyleName(key) + ":" + interpolated + ";";
                break;
              }
              default: {
                string += key + "{" + interpolated + "}";
              }
            }
          }
        }
      }
    }
    return string;
  }
  var labelPattern = /label:\s*([^\s;{]+)\s*(;|$)/g;
  var cursor;
  function serializeStyles(args, registered, mergedProps) {
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && args[0].styles !== void 0) {
      return args[0];
    }
    var stringMode = true;
    var styles2 = "";
    cursor = void 0;
    var strings = args[0];
    if (strings == null || strings.raw === void 0) {
      stringMode = false;
      styles2 += handleInterpolation(mergedProps, registered, strings);
    } else {
      var asTemplateStringsArr = strings;
      styles2 += asTemplateStringsArr[0];
    }
    for (var i = 1; i < args.length; i++) {
      styles2 += handleInterpolation(mergedProps, registered, args[i]);
      if (stringMode) {
        var templateStringsArr = strings;
        styles2 += templateStringsArr[i];
      }
    }
    labelPattern.lastIndex = 0;
    var identifierName = "";
    var match2;
    while ((match2 = labelPattern.exec(styles2)) !== null) {
      identifierName += "-" + match2[1];
    }
    var name = murmur2(styles2) + identifierName;
    return {
      name,
      styles: styles2,
      next: cursor
    };
  }
  var syncFallback = function syncFallback2(create) {
    return create();
  };
  var useInsertionEffect = React__namespace["useInsertionEffect"] ? React__namespace["useInsertionEffect"] : false;
  var useInsertionEffectAlwaysWithSyncFallback = useInsertionEffect || syncFallback;
  var useInsertionEffectWithLayoutFallback = useInsertionEffect || React__namespace.useLayoutEffect;
  var isDevelopment = false;
  var EmotionCacheContext = /* @__PURE__ */ React__namespace.createContext(
    // we're doing this to avoid preconstruct's dead code elimination in this one case
    // because this module is primarily intended for the browser and node
    // but it's also required in react native and similar environments sometimes
    // and we could have a special build just for that
    // but this is much easier and the native packages
    // might use a different theme context in the future anyway
    typeof HTMLElement !== "undefined" ? /* @__PURE__ */ createCache({
      key: "css"
    }) : null
  );
  var CacheProvider = EmotionCacheContext.Provider;
  var withEmotionCache = function withEmotionCache2(func) {
    return /* @__PURE__ */ React.forwardRef(function(props, ref) {
      var cache2 = React.useContext(EmotionCacheContext);
      return func(props, cache2, ref);
    });
  };
  var ThemeContext = /* @__PURE__ */ React__namespace.createContext({});
  var hasOwn = {}.hasOwnProperty;
  var typePropName = "__EMOTION_TYPE_PLEASE_DO_NOT_USE__";
  var createEmotionProps = function createEmotionProps2(type, props) {
    var newProps = {};
    for (var key in props) {
      if (hasOwn.call(props, key)) {
        newProps[key] = props[key];
      }
    }
    newProps[typePropName] = type;
    return newProps;
  };
  var Insertion = function Insertion2(_ref8) {
    var cache2 = _ref8.cache, serialized = _ref8.serialized, isStringTag = _ref8.isStringTag;
    registerStyles(cache2, serialized, isStringTag);
    useInsertionEffectAlwaysWithSyncFallback(function() {
      return insertStyles(cache2, serialized, isStringTag);
    });
    return null;
  };
  var Emotion = /* @__PURE__ */ withEmotionCache(
    /* <any, any> */
    function(props, cache2, ref) {
      var cssProp = props.css;
      if (typeof cssProp === "string" && cache2.registered[cssProp] !== void 0) {
        cssProp = cache2.registered[cssProp];
      }
      var WrappedComponent = props[typePropName];
      var registeredStyles = [cssProp];
      var className = "";
      if (typeof props.className === "string") {
        className = getRegisteredStyles(cache2.registered, registeredStyles, props.className);
      } else if (props.className != null) {
        className = props.className + " ";
      }
      var serialized = serializeStyles(registeredStyles, void 0, React__namespace.useContext(ThemeContext));
      className += cache2.key + "-" + serialized.name;
      var newProps = {};
      for (var key in props) {
        if (hasOwn.call(props, key) && key !== "css" && key !== typePropName && !isDevelopment) {
          newProps[key] = props[key];
        }
      }
      newProps.className = className;
      if (ref) {
        newProps.ref = ref;
      }
      return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(Insertion, {
        cache: cache2,
        serialized,
        isStringTag: typeof WrappedComponent === "string"
      }), /* @__PURE__ */ React__namespace.createElement(WrappedComponent, newProps));
    }
  );
  var Emotion$1 = Emotion;
  var Fragment = jsxRuntimeExports.Fragment;
  function jsx$1(type, props, key) {
    if (!hasOwn.call(props, "css")) {
      return jsxRuntimeExports.jsx(type, props, key);
    }
    return jsxRuntimeExports.jsx(Emotion$1, createEmotionProps(type, props), key);
  }
  function jsxs(type, props, key) {
    if (!hasOwn.call(props, "css")) {
      return jsxRuntimeExports.jsxs(type, props, key);
    }
    return jsxRuntimeExports.jsxs(Emotion$1, createEmotionProps(type, props), key);
  }
  const cuidaShuffleOutline = (props, ref) => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: [
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M17.793 3.693a1 1 0 0 1 1.414 0l2.5 2.5a1 1 0 0 1 0 1.414l-2.5 2.5a1 1 0 1 1-1.414-1.414L19.586 6.9l-1.793-1.793a1 1 0 0 1 0-1.414m0 10.15a1 1 0 0 1 1.414 0l2.5 2.5a1 1 0 0 1 0 1.414l-2.5 2.5a1 1 0 1 1-1.414-1.414l1.793-1.793l-1.793-1.793a1 1 0 0 1 0-1.414", clipRule: "evenodd" }),
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M19.054 5.913c.352.023.657.043.946.043a1 1 0 1 1 0 2c-.346 0-.776-.028-1.184-.054a37 37 0 0 0-.606-.037c-.614-.03-1.118-.02-1.482.065c-1.456.341-3.07 1.481-4.394 4.117c1.304 2.555 2.9 3.529 4.394 3.879c.364.085.868.094 1.482.064c.186-.009.393-.022.606-.036A19 19 0 0 1 20 15.899a1 1 0 1 1 0 2c-.289 0-.594.02-.946.044c-.227.015-.473.032-.747.045c-.63.03-1.377.04-2.035-.115c-1.812-.424-3.549-1.493-4.972-3.634c-.553 1.02-1.177 1.822-1.927 2.427c-.978.788-2.12 1.106-3.213 1.24c-.882.108-1.81.102-2.64.096L3 18a1 1 0 1 1 0-2l.582.002c.824.005 1.593.01 2.335-.08c.892-.11 1.624-.348 2.201-.813c.687-.554 1.323-1.447 1.962-2.95l.046-.109l-.046-.109c-.651-1.53-1.303-2.495-2.015-3.103c-.56-.477-1.277-.726-2.161-.845c-.763-.102-1.562-.099-2.42-.095L3 7.899a1 1 0 1 1 0-2l.445-.001c.853-.004 1.813-.01 2.724.113c1.094.146 2.234.486 3.194 1.305c.75.64 1.375 1.481 1.93 2.52c1.408-2.187 3.136-3.421 4.979-3.853c.658-.154 1.405-.145 2.035-.115c.274.013.52.03.747.045", clipRule: "evenodd" })
  ] });
  const ForwardRef$T = React.forwardRef(cuidaShuffleOutline);
  const phThumbsDownDuotone = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 256 256", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "currentColor", children: [
    /* @__PURE__ */ jsx$1("path", { d: "M80 48v104H32a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8Z", opacity: 0.2 }),
    /* @__PURE__ */ jsx$1("path", { d: "m239.82 157l-12-96A24 24 0 0 0 204 40H32a16 16 0 0 0-16 16v88a16 16 0 0 0 16 16h43.06l37.78 75.58A8 8 0 0 0 120 240a40 40 0 0 0 40-40v-16h56a24 24 0 0 0 23.82-27M72 144H32V56h40Zm150 21.29a7.88 7.88 0 0 1-6 2.71h-64a8 8 0 0 0-8 8v24a24 24 0 0 1-19.29 23.54L88 150.11V56h116a8 8 0 0 1 7.94 7l12 96a7.87 7.87 0 0 1-1.94 6.29" })
  ] }) });
  const ForwardRef$S = React.forwardRef(phThumbsDownDuotone);
  const iconParkOutlineConfig = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "m24 4l-6 6h-8v8l-6 6l6 6v8h8l6 6l6-6h8v-8l6-6l-6-6v-8h-8z" }),
    /* @__PURE__ */ jsx$1("path", { d: "M24 30a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z" })
  ] }) });
  const ForwardRef$R = React.forwardRef(iconParkOutlineConfig);
  const iconParkOutlinePlayTwo = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("rect", { width: 36, height: 36, x: 6, y: 6, strokeLinecap: "round", rx: 3 }),
    /* @__PURE__ */ jsx$1("path", { d: "M18.5 24v-7.794l6.75 3.897L32 24l-6.75 3.897l-6.75 3.897z" })
  ] }) });
  const ForwardRef$Q = React.forwardRef(iconParkOutlinePlayTwo);
  const materialSymbolsLightOpenInNew = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h5.615v1H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192h12.77q.23 0 .423-.192t.192-.423v-5.616h1v5.616q0 .69-.462 1.152T18.384 20zm4.123-5.03l-.708-.709L18.292 5H14V4h6v6h-1V5.708z" }) });
  const ForwardRef$P = React.forwardRef(materialSymbolsLightOpenInNew);
  const tablerSortAscending2 = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "m14 9l3-3l3 3M5 5.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5zm0 9a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5zM17 6v12" }) });
  const ForwardRef$O = React.forwardRef(tablerSortAscending2);
  const tablerSortDescending2 = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 5.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5zm0 9a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5zm9 .5l3 3l3-3m-3 3V6" }) });
  const ForwardRef$N = React.forwardRef(tablerSortDescending2);
  const iconParkOutlineInfo = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, d: "M24 44a19.94 19.94 0 0 0 14.142-5.858A19.94 19.94 0 0 0 44 24a19.94 19.94 0 0 0-5.858-14.142A19.94 19.94 0 0 0 24 4A19.94 19.94 0 0 0 9.858 9.858A19.94 19.94 0 0 0 4 24a19.94 19.94 0 0 0 5.858 14.142A19.94 19.94 0 0 0 24 44Z" }),
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M24 11a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5", clipRule: "evenodd" }),
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, d: "M24.5 34V20h-2M21 34h7" })
  ] }) });
  const ForwardRef$M = React.forwardRef(iconParkOutlineInfo);
  const mdiShuffleDisabled = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M16 4.5V7H5v2h11v2.5L19.5 8M16 12.5V15H5v2h11v2.5l3.5-3.5" }) });
  const ForwardRef$L = React.forwardRef(mdiShuffleDisabled);
  const iconParkOutlineTime = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z" }),
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", d: "M24.008 12v12.01l8.479 8.48" })
  ] }) });
  const ForwardRef$K = React.forwardRef(iconParkOutlineTime);
  const iconParkOutlineIphone = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("rect", { width: 26, height: 40, x: 11, y: 4, rx: 3 }),
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M22 10h4m-6 28h8" })
  ] }) });
  const ForwardRef$J = React.forwardRef(iconParkOutlineIphone);
  const iconParkOutlineComputer = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 32h10v9H19z" }),
    /* @__PURE__ */ jsx$1("rect", { width: 38, height: 24, x: 5, y: 8, rx: 2 }),
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M22 27h4M14 41h20" })
  ] }) });
  const ForwardRef$I = React.forwardRef(iconParkOutlineComputer);
  const iconParkOutlineConcern = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", children: [
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", strokeWidth: 4, d: "M10.858 9.858A19.94 19.94 0 0 0 5 24a19.94 19.94 0 0 0 5.858 14.142m28.284 0A19.94 19.94 0 0 0 45 24a19.94 19.94 0 0 0-5.858-14.142M34.9 33.9A13.96 13.96 0 0 0 39 24a13.96 13.96 0 0 0-4.1-9.9m-19.8 0A13.96 13.96 0 0 0 11 24a13.96 13.96 0 0 0 4.1 9.9" }),
    /* @__PURE__ */ jsx$1("path", { strokeLinejoin: "round", strokeWidth: 3.5, d: "M28.182 20C30.29 20 32 21.612 32 23.6c0 2.588-2.546 4.8-3.818 6Q26.908 30.8 25 32q-1.909-1.2-3.182-2.4C20.545 28.4 18 26.188 18 23.6c0-1.988 1.71-3.6 3.818-3.6c1.328 0 2.498.64 3.182 1.61c.684-.97 1.854-1.61 3.182-1.61Z" })
  ] }) });
  const ForwardRef$H = React.forwardRef(iconParkOutlineConcern);
  const iconParkOutlineTumblr = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeWidth: 4, d: "M39 6H9a3 3 0 0 0-3 3v30a3 3 0 0 0 3 3h30a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3Z" }),
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M15 22v-5h5v-3l6-2v5h5v5h-5v7s0 1.5 2 2s5-1 5-1l-2 6h-5c-3.5 0-6-3.5-6-6v-8z" })
  ] }) });
  const ForwardRef$G = React.forwardRef(iconParkOutlineTumblr);
  const iconParkOutlineStar = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, d: "m23.999 5l-6.113 12.478L4 19.49l10.059 9.834L11.654 43L24 36.42L36.345 43L33.96 29.325L44 19.491l-13.809-2.013z" }) });
  const ForwardRef$F = React.forwardRef(iconParkOutlineStar);
  const iconParkSolidStar = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, d: "m23.999 5l-6.113 12.478L4 19.49l10.059 9.834L11.654 43L24 36.42L36.345 43L33.96 29.325L44 19.491l-13.809-2.013z" }) });
  const ForwardRef$E = React.forwardRef(iconParkSolidStar);
  const iconParkOutlineFire = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, d: "M24 44c8.235 0 15-6.526 15-14.902c0-2.056-.105-4.26-1.245-7.686s-1.369-3.868-2.574-5.984c-.515 4.317-3.27 6.117-3.97 6.655c0-.56-1.666-6.747-4.193-10.45C24.537 8 21.163 5.617 19.185 4c0 3.07-.863 7.634-2.1 9.96c-1.236 2.325-1.468 2.41-3.013 4.14s-2.253 2.265-3.545 4.365S9 27.362 9 29.418C9 37.794 15.765 44 24 44Z" }) });
  const ForwardRef$D = React.forwardRef(iconParkOutlineFire);
  const iconParkOutlinePeopleDelete = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14Z" }),
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", d: "m33 31l8 8m-8 0l8-8m-14-3h-8.2c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C6 34.08 6 36.32 6 40.8V42h21" })
  ] }) });
  const ForwardRef$C = React.forwardRef(iconParkOutlinePeopleDelete);
  const iconParkOutlineReturn = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "m13 8l-7 6l7 7" }),
    /* @__PURE__ */ jsx$1("path", { d: "M6 14h22.994c6.883 0 12.728 5.62 12.996 12.5c.284 7.27-5.723 13.5-12.996 13.5H11.998" })
  ] }) });
  const ForwardRef$B = React.forwardRef(iconParkOutlineReturn);
  const iconParkOutlineCopy = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", d: "M13 12.432v-4.62A2.813 2.813 0 0 1 15.813 5h24.374A2.813 2.813 0 0 1 43 7.813v24.375A2.813 2.813 0 0 1 40.188 35h-4.672" }),
    /* @__PURE__ */ jsx$1("path", { d: "M32.188 13H7.811A2.813 2.813 0 0 0 5 15.813v24.374A2.813 2.813 0 0 0 7.813 43h24.375A2.813 2.813 0 0 0 35 40.188V15.811A2.813 2.813 0 0 0 32.188 13Z" })
  ] }) });
  const ForwardRef$A = React.forwardRef(iconParkOutlineCopy);
  const materialSymbolsBarChart = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M16 20v-7h4v7zm-6 0V4h4v16zm-6 0V9h4v11z" }) });
  const ForwardRef$z = React.forwardRef(materialSymbolsBarChart);
  const IconForDislike = ForwardRef$S;
  const IconForConfig = ForwardRef$R;
  const IconForPlayer = ForwardRef$Q;
  const IconForOpenExternalLink = ForwardRef$P;
  const IconForAsc = ForwardRef$O;
  const IconForDesc = ForwardRef$N;
  const IconForInfo = ForwardRef$M;
  const IconForDefaultOrder = ForwardRef$L;
  const IconForShuffle = ForwardRef$T;
  const IconForTimestamp = ForwardRef$K;
  const IconForPhone = ForwardRef$J;
  const IconForPc = ForwardRef$I;
  const IconForFollowedOnly = ForwardRef$H;
  const IconForDynamicFeed = ForwardRef$G;
  const IconForFav = ForwardRef$F;
  const IconForFaved = ForwardRef$E;
  const IconForHot = ForwardRef$D;
  const IconForBlacklist = ForwardRef$C;
  const IconForReset = ForwardRef$B;
  const IconForCopy = ForwardRef$A;
  const LIVE_GIF = `data:image/gif;base64,R0lGODlhGAAYAJECAP7+/v///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTI2NTYzMDc2RTNDMTFFREJENEJEMzUxOTQzQjMxMkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTI2NTYzMDg2RTNDMTFFREJENEJEMzUxOTQzQjMxMkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMjY1NjMwNTZFM0MxMUVEQkQ0QkQzNTE5NDNCMzEyRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMjY1NjMwNjZFM0MxMUVEQkQ0QkQzNTE5NDNCMzEyRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAkEAAIALAAAAAAYABgAAAI5lI+py+0Po2QhTFXrRdlu031gJgqhpI0pdJ4sacJv6j6trABeTOMcfFslgp7ar4fcDVcyX+kJjToKACH5BAkEAAIALAAAAAAYABgAAAI2lI+py+0Po5xUhFDRvdls3H0T522SaJkRikKs6qptAr+kYoOzJvc37dPBgKQco3YbdpbM5qQAACH5BAkEAAIALAAAAAAYABgAAAI3lI+py+0Po5y02hhykHqLzmkGiImfCZHkkh0qmrztOSuyt8bmzfC0Z9sJa7qZLwhEwS7MpnNSAAAh+QQJBAACACwAAAAAGAAYAAACPJSPqcvtD6OctJoQ7MFYC55dYQSKHcmZo3J+qdsmJRzO7DvbMs7HSN5b/YIqBvCkGyKJixds4/NIp1RHAQAh+QQJBAACACwAAAAAGAAYAAACOpSPqcvtD6OcLwSarMVHXy54YKhJIrmhn3K25eKmJ/vGa1bnKS3rN2IzzHC94q/jE754yNVyBI1KIQUAIfkECQQAAgAsAAAAABgAGAAAAjmUj6nL7Q+jnLSaEOzBePbLSVwmjGJYopCZfmnDxmoif6xSkzeN5ozfIuF6RBfPVhQeN66Z5gmNTgoAIfkECQQAAgAsAAAAABgAGAAAAjmUj6nL7Q+jnLRaETLSMnMfdJ4Bit8YlRgKqerauOibyCen2OGK1/Pf2wB3NOGNyPLteIfk5QmNTgoAIfkECQQAAgAsAAAAABgAGAAAAjeUj6nL7Q+jnCkEWu3FRm/uHdYUCiVUnk+qSewYvd/amrWKyF2t6DbcuwmBGZgv+OHxOMyms1kAACH5BAkEAAIALAAAAAAYABgAAAI5lI+py+0PowtBLkptwlUf7n1YaIBlF5kmpI6puz5t9tLxBLsCgCpzdxPZcjQfEajbFHVJkvMJtRQAACH5BAkEAAIALAAAAAAYABgAAAI1lI+py+0Po5wpBFrtxUZv7nGdJgqheJ5QSkasJb2bmsFmSyPyaCv73avNcC1fr1gsKZdMSAEAIfkECQQAAgAsAAAAABgAGAAAAjWUj6nL7Q+jnLRaEfI1Wd8ebKDYkR4WHqcyol7Llm4KJ+0tx69cI/i+8vGGQdUpl9sol0xIAQAh+QQJBAACACwAAAAAGAAYAAACNJSPqcvtD6OctNq7QsBCa+xtV9h8DJl5p5qaCtqJsZugNvuyN43sIlzTCXkHnJHISSqXiQIAIfkECQQAAgAsAAAAABgAGAAAAjKUj6nL7Q+jnLTai3MMPLDuLeDXkZwZKqNYsqebJqva0u86yy1e6/feQ9SGL43xiEwUAAAh+QQJBAACACwAAAAAGAAYAAACM5SPqcvtD6OctNp7Q8BCa+xtzDd6JamEp5iai2qgcEvCc2K7N5LXLi3qsXCy4pCDTCoXBQAh+QQJBAACACwAAAAAGAAYAAACNJSPqcvtD6OctNoYcrhC7+txIag1mVkuY/exp5qOayLHqVK/M5J/+9Ez/IQvF7DISSqXkAIAIfkEBQQAAgAsAAAAABgAGAAAAjKUj6nL7Q+jnFSEUNG92WzcfZ21jWJYRucJranyutwig2xSey+e5nQPnMGEMeHoiExCCgA7`;
  function IconForLive({
    active = false,
    ...props
  }) {
    if (active) {
      return /* @__PURE__ */ jsx$1("img", { ...props, src: LIVE_GIF });
    } else {
      return /* @__PURE__ */ jsx$1(ForwardRef$z, { ...props });
    }
  }
  function IconForWatchlater(props) {
    return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", viewBox: "0 0 20 20", width: "20", height: "20", fill: "currentColor", ...props, children: [
      /* @__PURE__ */ jsx$1("path", { className: "circle", d: "M10 3.1248000000000005C6.20305 3.1248000000000005 3.1250083333333336 6.202841666666667 3.1250083333333336 9.999833333333335C3.1250083333333336 13.796750000000001 6.20305 16.874833333333335 10 16.874833333333335C11.898291666666667 16.874833333333335 13.615833333333333 16.106291666666667 14.860625 14.861916666666666C15.104708333333335 14.617916666666666 15.500416666666668 14.617958333333334 15.7445 14.862041666666668C15.9885 15.106166666666669 15.988416666666668 15.501916666666666 15.744333333333334 15.745958333333334C14.274750000000001 17.215041666666668 12.243041666666667 18.124833333333335 10 18.124833333333335C5.512691666666667 18.124833333333335 1.8750083333333334 14.487125 1.8750083333333334 9.999833333333335C1.8750083333333334 5.512483333333334 5.512691666666667 1.8748000000000002 10 1.8748000000000002C14.487291666666668 1.8748000000000002 18.125 5.512483333333334 18.125 9.999833333333335C18.125 10.304458333333333 18.108208333333334 10.605458333333333 18.075458333333337 10.901791666666668C18.0375 11.244916666666667 17.728625 11.492291666666667 17.385583333333333 11.454333333333334C17.0425 11.416416666666667 16.795083333333334 11.107541666666668 16.833000000000002 10.764458333333334C16.860750000000003 10.513625000000001 16.875 10.2585 16.875 9.999833333333335C16.875 6.202841666666667 13.796958333333333 3.1248000000000005 10 3.1248000000000005z", fill: "currentColor" }),
      /* @__PURE__ */ jsx$1("path", { d: "M15.391416666666666 9.141166666666667C15.635458333333334 8.897083333333335 16.031208333333332 8.897083333333335 16.275291666666668 9.141166666666667L17.5 10.365875L18.72475 9.141166666666667C18.968791666666668 8.897083333333335 19.364541666666668 8.897083333333335 19.608625 9.141166666666667C19.852666666666668 9.385291666666667 19.852666666666668 9.780958333333334 19.608625 10.025083333333333L18.08925 11.544416666666669C17.763833333333334 11.869833333333334 17.236208333333334 11.869833333333334 16.91075 11.544416666666669L15.391416666666666 10.025083333333333C15.147333333333334 9.780958333333334 15.147333333333334 9.385291666666667 15.391416666666666 9.141166666666667z", fill: "currentColor" }),
      /* @__PURE__ */ jsx$1("path", { d: "M12.499333333333334 9.278375C13.05475 9.599 13.05475 10.400666666666668 12.499333333333334 10.721291666666668L9.373916666666666 12.525791666666668C8.818541666666667 12.846416666666666 8.124274999999999 12.445583333333333 8.124274999999999 11.804291666666668L8.124274999999999 8.1954C8.124274999999999 7.554066666666667 8.818541666666667 7.153233333333334 9.373916666666666 7.473900000000001L12.499333333333334 9.278375z", fill: "currentColor" })
    ] });
  }
  const parsed = UAParser();
  const isMac = ((_a = parsed.os.name) == null ? void 0 : _a.toLowerCase()) === "mac os";
  const parsedBrowserName = parsed.browser.name || "";
  const isBrand = (brand) => new RegExp(String.raw`\b${brand}\b`, "i").test(parsedBrowserName);
  const isSafari = isBrand("safari");
  const isFirefox = isBrand("firefox");
  isBrand("edge");
  function minmax(value, min, max) {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
  }
  class Node {
    constructor(value) {
      __publicField(this, "value");
      __publicField(this, "next");
      this.value = value;
    }
  }
  class Queue {
    constructor() {
      __privateAdd(this, _head);
      __privateAdd(this, _tail);
      __privateAdd(this, _size);
      this.clear();
    }
    enqueue(value) {
      const node2 = new Node(value);
      if (__privateGet(this, _head)) {
        __privateGet(this, _tail).next = node2;
        __privateSet(this, _tail, node2);
      } else {
        __privateSet(this, _head, node2);
        __privateSet(this, _tail, node2);
      }
      __privateWrapper(this, _size)._++;
    }
    dequeue() {
      const current = __privateGet(this, _head);
      if (!current) {
        return;
      }
      __privateSet(this, _head, __privateGet(this, _head).next);
      __privateWrapper(this, _size)._--;
      return current.value;
    }
    peek() {
      if (!__privateGet(this, _head)) {
        return;
      }
      return __privateGet(this, _head).value;
    }
    clear() {
      __privateSet(this, _head, void 0);
      __privateSet(this, _tail, void 0);
      __privateSet(this, _size, 0);
    }
    get size() {
      return __privateGet(this, _size);
    }
    *[Symbol.iterator]() {
      let current = __privateGet(this, _head);
      while (current) {
        yield current.value;
        current = current.next;
      }
    }
  }
  _head = new WeakMap();
  _tail = new WeakMap();
  _size = new WeakMap();
  function pLimit(concurrency) {
    validateConcurrency(concurrency);
    const queue = new Queue();
    let activeCount = 0;
    const resumeNext = () => {
      if (activeCount < concurrency && queue.size > 0) {
        queue.dequeue()();
        activeCount++;
      }
    };
    const next2 = () => {
      activeCount--;
      resumeNext();
    };
    const run = async (function_, resolve, arguments_) => {
      const result = (async () => function_(...arguments_))();
      resolve(result);
      try {
        await result;
      } catch {
      }
      next2();
    };
    const enqueue = (function_, resolve, arguments_) => {
      new Promise((internalResolve) => {
        queue.enqueue(internalResolve);
      }).then(
        run.bind(void 0, function_, resolve, arguments_)
      );
      (async () => {
        await Promise.resolve();
        if (activeCount < concurrency) {
          resumeNext();
        }
      })();
    };
    const generator = (function_, ...arguments_) => new Promise((resolve) => {
      enqueue(function_, resolve, arguments_);
    });
    Object.defineProperties(generator, {
      activeCount: {
        get: () => activeCount
      },
      pendingCount: {
        get: () => queue.size
      },
      clearQueue: {
        value() {
          queue.clear();
        }
      },
      concurrency: {
        get: () => concurrency,
        set(newConcurrency) {
          validateConcurrency(newConcurrency);
          concurrency = newConcurrency;
          queueMicrotask(() => {
            while (activeCount < concurrency && queue.size > 0) {
              resumeNext();
            }
          });
        }
      }
    });
    return generator;
  }
  function validateConcurrency(concurrency) {
    if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
      throw new TypeError("Expected `concurrency` to be a number from 1 and up");
    }
  }
  function openNewTab(url, active = true) {
    if (isSafari) {
      GM.openInTab(url, !active);
    } else {
      GM.openInTab(url, {
        active,
        insert: true,
        setParent: true
      });
    }
  }
  function reciveGmValueUpdatesFromOtherTab({
    storageKey: storageKey2,
    onUpdate,
    setPersist
  }) {
    if (typeof GM_addValueChangeListener === "undefined") return;
    const limit2 = pLimit(1);
    GM_addValueChangeListener(storageKey2, (name, oldValue, newValue, remote) => {
      if (!remote) return;
      if (!newValue) return;
      limit2(async () => {
        setPersist(false);
        try {
          onUpdate(newValue);
        } finally {
          await Promise.resolve().then(() => {
            setPersist(true);
          });
        }
      });
    });
  }
  function countBy(arr2, mapper) {
    const result = {};
    for (let i = 0; i < arr2.length; i++) {
      const item = arr2[i];
      const key = mapper(item);
      result[key] = (result[key] ?? 0) + 1;
    }
    return result;
  }
  function groupBy(arr2, getKeyFromItem) {
    const result = /* @__PURE__ */ Object.create(null);
    for (let i = 0; i < arr2.length; i++) {
      const item = arr2[i];
      const key = getKeyFromItem(item);
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(item);
    }
    return result;
  }
  function compareValues(a, b, order) {
    if (a < b) {
      return order === "asc" ? -1 : 1;
    }
    if (a > b) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  }
  function orderBy(arr2, criteria, orders) {
    return arr2.slice().sort((a, b) => {
      const ordersLength = orders.length;
      for (let i = 0; i < criteria.length; i++) {
        const order = ordersLength > i ? orders[i] : orders[ordersLength - 1];
        const criterion = criteria[i];
        const criterionIsFunction = typeof criterion === "function";
        const valueA = criterionIsFunction ? criterion(a) : a[criterion];
        const valueB = criterionIsFunction ? criterion(b) : b[criterion];
        const result = compareValues(valueA, valueB, order);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });
  }
  function random(minimum, maximum) {
    if (maximum == null) {
      maximum = minimum;
      minimum = 0;
    }
    if (minimum >= maximum) {
      throw new Error("Invalid input: The maximum value must be greater than the minimum value.");
    }
    return Math.random() * (maximum - minimum) + minimum;
  }
  function randomInt(minimum, maximum) {
    return Math.floor(random(minimum, maximum));
  }
  function shuffle(arr2) {
    const result = arr2.slice();
    for (let i = result.length - 1; i >= 1; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function uniq(arr2) {
    return Array.from(new Set(arr2));
  }
  function uniqBy(arr2, mapper) {
    const map = /* @__PURE__ */ new Map();
    for (let i = 0; i < arr2.length; i++) {
      const item = arr2[i];
      const key = mapper(item);
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
    return Array.from(map.values());
  }
  let AbortError$1 = class AbortError extends Error {
    constructor(message2 = "The operation was aborted") {
      super(message2);
      this.name = "AbortError";
    }
  };
  function debounce$1(func, debounceMs, { signal, edges } = {}) {
    let pendingThis = void 0;
    let pendingArgs = null;
    const leading = edges != null && edges.includes("leading");
    const trailing = edges == null || edges.includes("trailing");
    const invoke = () => {
      if (pendingArgs !== null) {
        func.apply(pendingThis, pendingArgs);
        pendingThis = void 0;
        pendingArgs = null;
      }
    };
    const onTimerEnd = () => {
      if (trailing) {
        invoke();
      }
      cancel();
    };
    let timeoutId = null;
    const schedule = () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        timeoutId = null;
        onTimerEnd();
      }, debounceMs);
    };
    const cancelTimer = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
    const cancel = () => {
      cancelTimer();
      pendingThis = void 0;
      pendingArgs = null;
    };
    const flush = () => {
      cancelTimer();
      invoke();
    };
    const debounced = function(...args) {
      if (signal == null ? void 0 : signal.aborted) {
        return;
      }
      pendingThis = this;
      pendingArgs = args;
      const isFirstCall = timeoutId == null;
      schedule();
      if (leading && isFirstCall) {
        invoke();
      }
    };
    debounced.schedule = schedule;
    debounced.cancel = cancel;
    debounced.flush = flush;
    signal == null ? void 0 : signal.addEventListener("abort", cancel, { once: true });
    return debounced;
  }
  function noop$1() {
  }
  function once(func) {
    let called = false;
    let cache2;
    return function(...args) {
      if (!called) {
        called = true;
        cache2 = func(...args);
      }
      return cache2;
    };
  }
  function throttle$1(func, throttleMs, { signal, edges = ["leading", "trailing"] } = {}) {
    let pendingAt = null;
    const debounced = debounce$1(func, throttleMs, { signal, edges });
    const throttled = function(...args) {
      if (pendingAt == null) {
        pendingAt = Date.now();
      } else {
        if (Date.now() - pendingAt >= throttleMs) {
          pendingAt = Date.now();
          debounced.cancel();
          debounced(...args);
        }
      }
      debounced(...args);
    };
    throttled.cancel = debounced.cancel;
    throttled.flush = debounced.flush;
    return throttled;
  }
  function isPrimitive(value) {
    return value == null || typeof value !== "object" && typeof value !== "function";
  }
  function isTypedArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }
  function getSymbols(object) {
    return Object.getOwnPropertySymbols(object).filter((symbol) => Object.prototype.propertyIsEnumerable.call(object, symbol));
  }
  function cloneDeepWithImpl(valueToClone, keyToClone, objectToClone, stack = /* @__PURE__ */ new Map(), cloneValue = void 0) {
    const cloned = cloneValue == null ? void 0 : cloneValue(valueToClone, keyToClone, objectToClone, stack);
    if (cloned != null) {
      return cloned;
    }
    if (isPrimitive(valueToClone)) {
      return valueToClone;
    }
    if (stack.has(valueToClone)) {
      return stack.get(valueToClone);
    }
    if (Array.isArray(valueToClone)) {
      const result = new Array(valueToClone.length);
      stack.set(valueToClone, result);
      for (let i = 0; i < valueToClone.length; i++) {
        result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
      }
      if (Object.hasOwn(valueToClone, "index")) {
        result.index = valueToClone.index;
      }
      if (Object.hasOwn(valueToClone, "input")) {
        result.input = valueToClone.input;
      }
      return result;
    }
    if (valueToClone instanceof Date) {
      return new Date(valueToClone.getTime());
    }
    if (valueToClone instanceof RegExp) {
      const result = new RegExp(valueToClone.source, valueToClone.flags);
      result.lastIndex = valueToClone.lastIndex;
      return result;
    }
    if (valueToClone instanceof Map) {
      const result = /* @__PURE__ */ new Map();
      stack.set(valueToClone, result);
      for (const [key, value] of valueToClone) {
        result.set(key, cloneDeepWithImpl(value, key, objectToClone, stack, cloneValue));
      }
      return result;
    }
    if (valueToClone instanceof Set) {
      const result = /* @__PURE__ */ new Set();
      stack.set(valueToClone, result);
      for (const value of valueToClone) {
        result.add(cloneDeepWithImpl(value, void 0, objectToClone, stack, cloneValue));
      }
      return result;
    }
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(valueToClone)) {
      return valueToClone.subarray();
    }
    if (isTypedArray(valueToClone)) {
      const result = new (Object.getPrototypeOf(valueToClone)).constructor(valueToClone.length);
      stack.set(valueToClone, result);
      for (let i = 0; i < valueToClone.length; i++) {
        result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
      }
      return result;
    }
    if (valueToClone instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && valueToClone instanceof SharedArrayBuffer) {
      return valueToClone.slice(0);
    }
    if (valueToClone instanceof DataView) {
      const result = new DataView(valueToClone.buffer.slice(0), valueToClone.byteOffset, valueToClone.byteLength);
      stack.set(valueToClone, result);
      copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
      return result;
    }
    if (typeof File !== "undefined" && valueToClone instanceof File) {
      const result = new File([valueToClone], valueToClone.name, {
        type: valueToClone.type
      });
      stack.set(valueToClone, result);
      copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
      return result;
    }
    if (valueToClone instanceof Blob) {
      const result = new Blob([valueToClone], { type: valueToClone.type });
      stack.set(valueToClone, result);
      copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
      return result;
    }
    if (valueToClone instanceof Error) {
      const result = new valueToClone.constructor();
      stack.set(valueToClone, result);
      result.message = valueToClone.message;
      result.name = valueToClone.name;
      result.stack = valueToClone.stack;
      result.cause = valueToClone.cause;
      copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
      return result;
    }
    if (typeof valueToClone === "object" && valueToClone !== null) {
      const result = Object.create(Object.getPrototypeOf(valueToClone));
      stack.set(valueToClone, result);
      copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
      return result;
    }
    return valueToClone;
  }
  function copyProperties(target, source, objectToClone = target, stack, cloneValue) {
    const keys = [...Object.keys(source), ...getSymbols(source)];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (descriptor == null || descriptor.writable) {
        target[key] = cloneDeepWithImpl(source[key], key, objectToClone, stack, cloneValue);
      }
    }
  }
  function cloneDeep(obj) {
    return cloneDeepWithImpl(obj, void 0, obj, /* @__PURE__ */ new Map(), void 0);
  }
  function isPlainObject(value) {
    if (!value || typeof value !== "object") {
      return false;
    }
    const proto = Object.getPrototypeOf(value);
    const hasObjectPrototype = proto === null || proto === Object.prototype || Object.getPrototypeOf(proto) === null;
    if (!hasObjectPrototype) {
      return false;
    }
    return Object.prototype.toString.call(value) === "[object Object]";
  }
  function merge$1(target, source) {
    const sourceKeys = Object.keys(source);
    for (let i = 0; i < sourceKeys.length; i++) {
      const key = sourceKeys[i];
      const sourceValue = source[key];
      const targetValue = target[key];
      if (Array.isArray(sourceValue)) {
        if (Array.isArray(targetValue)) {
          target[key] = merge$1(targetValue, sourceValue);
        } else {
          target[key] = merge$1([], sourceValue);
        }
      } else if (isPlainObject(sourceValue)) {
        if (isPlainObject(targetValue)) {
          target[key] = merge$1(targetValue, sourceValue);
        } else {
          target[key] = merge$1({}, sourceValue);
        }
      } else if (targetValue === void 0 || sourceValue !== void 0) {
        target[key] = sourceValue;
      }
    }
    return target;
  }
  function omit(obj, keys) {
    const result = { ...obj };
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      delete result[key];
    }
    return result;
  }
  function pick$1(obj, keys) {
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (Object.hasOwn(obj, key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }
  function toMerged(target, source) {
    return merge$1(cloneDeep(target), source);
  }
  function getTag(value) {
    if (value == null) {
      return value === void 0 ? "[object Undefined]" : "[object Null]";
    }
    return Object.prototype.toString.call(value);
  }
  const regexpTag = "[object RegExp]";
  const stringTag = "[object String]";
  const numberTag = "[object Number]";
  const booleanTag = "[object Boolean]";
  const argumentsTag = "[object Arguments]";
  const symbolTag = "[object Symbol]";
  const dateTag = "[object Date]";
  const mapTag = "[object Map]";
  const setTag = "[object Set]";
  const arrayTag = "[object Array]";
  const functionTag = "[object Function]";
  const arrayBufferTag = "[object ArrayBuffer]";
  const objectTag = "[object Object]";
  const errorTag = "[object Error]";
  const dataViewTag = "[object DataView]";
  const uint8ArrayTag = "[object Uint8Array]";
  const uint8ClampedArrayTag = "[object Uint8ClampedArray]";
  const uint16ArrayTag = "[object Uint16Array]";
  const uint32ArrayTag = "[object Uint32Array]";
  const bigUint64ArrayTag = "[object BigUint64Array]";
  const int8ArrayTag = "[object Int8Array]";
  const int16ArrayTag = "[object Int16Array]";
  const int32ArrayTag = "[object Int32Array]";
  const bigInt64ArrayTag = "[object BigInt64Array]";
  const float32ArrayTag = "[object Float32Array]";
  const float64ArrayTag = "[object Float64Array]";
  function eq(value, other) {
    return value === other || Number.isNaN(value) && Number.isNaN(other);
  }
  function isEqualWith(a, b, areValuesEqual) {
    return isEqualWithImpl(a, b, void 0, void 0, void 0, void 0, areValuesEqual);
  }
  function isEqualWithImpl(a, b, property, aParent, bParent, stack, areValuesEqual) {
    const result = areValuesEqual(a, b, property, aParent, bParent, stack);
    if (result !== void 0) {
      return result;
    }
    if (typeof a === typeof b) {
      switch (typeof a) {
        case "bigint":
        case "string":
        case "boolean":
        case "symbol":
        case "undefined": {
          return a === b;
        }
        case "number": {
          return a === b || Object.is(a, b);
        }
        case "function": {
          return a === b;
        }
        case "object": {
          return areObjectsEqual(a, b, stack, areValuesEqual);
        }
      }
    }
    return areObjectsEqual(a, b, stack, areValuesEqual);
  }
  function areObjectsEqual(a, b, stack, areValuesEqual) {
    if (Object.is(a, b)) {
      return true;
    }
    let aTag = getTag(a);
    let bTag = getTag(b);
    if (aTag === argumentsTag) {
      aTag = objectTag;
    }
    if (bTag === argumentsTag) {
      bTag = objectTag;
    }
    if (aTag !== bTag) {
      return false;
    }
    switch (aTag) {
      case stringTag:
        return a.toString() === b.toString();
      case numberTag: {
        const x = a.valueOf();
        const y = b.valueOf();
        return eq(x, y);
      }
      case booleanTag:
      case dateTag:
      case symbolTag:
        return Object.is(a.valueOf(), b.valueOf());
      case regexpTag: {
        return a.source === b.source && a.flags === b.flags;
      }
      case functionTag: {
        return a === b;
      }
    }
    stack = stack ?? /* @__PURE__ */ new Map();
    const aStack = stack.get(a);
    const bStack = stack.get(b);
    if (aStack != null && bStack != null) {
      return aStack === b;
    }
    stack.set(a, b);
    stack.set(b, a);
    try {
      switch (aTag) {
        case mapTag: {
          if (a.size !== b.size) {
            return false;
          }
          for (const [key, value] of a.entries()) {
            if (!b.has(key) || !isEqualWithImpl(value, b.get(key), key, a, b, stack, areValuesEqual)) {
              return false;
            }
          }
          return true;
        }
        case setTag: {
          if (a.size !== b.size) {
            return false;
          }
          const aValues = Array.from(a.values());
          const bValues = Array.from(b.values());
          for (let i = 0; i < aValues.length; i++) {
            const aValue = aValues[i];
            const index = bValues.findIndex((bValue) => {
              return isEqualWithImpl(aValue, bValue, void 0, a, b, stack, areValuesEqual);
            });
            if (index === -1) {
              return false;
            }
            bValues.splice(index, 1);
          }
          return true;
        }
        case arrayTag:
        case uint8ArrayTag:
        case uint8ClampedArrayTag:
        case uint16ArrayTag:
        case uint32ArrayTag:
        case bigUint64ArrayTag:
        case int8ArrayTag:
        case int16ArrayTag:
        case int32ArrayTag:
        case bigInt64ArrayTag:
        case float32ArrayTag:
        case float64ArrayTag: {
          if (typeof Buffer !== "undefined" && Buffer.isBuffer(a) !== Buffer.isBuffer(b)) {
            return false;
          }
          if (a.length !== b.length) {
            return false;
          }
          for (let i = 0; i < a.length; i++) {
            if (!isEqualWithImpl(a[i], b[i], i, a, b, stack, areValuesEqual)) {
              return false;
            }
          }
          return true;
        }
        case arrayBufferTag: {
          if (a.byteLength !== b.byteLength) {
            return false;
          }
          return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
        }
        case dataViewTag: {
          if (a.byteLength !== b.byteLength || a.byteOffset !== b.byteOffset) {
            return false;
          }
          return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
        }
        case errorTag: {
          return a.name === b.name && a.message === b.message;
        }
        case objectTag: {
          const areEqualInstances = areObjectsEqual(a.constructor, b.constructor, stack, areValuesEqual) || isPlainObject(a) && isPlainObject(b);
          if (!areEqualInstances) {
            return false;
          }
          const aKeys = [...Object.keys(a), ...getSymbols(a)];
          const bKeys = [...Object.keys(b), ...getSymbols(b)];
          if (aKeys.length !== bKeys.length) {
            return false;
          }
          for (let i = 0; i < aKeys.length; i++) {
            const propKey = aKeys[i];
            const aProp = a[propKey];
            if (!Object.hasOwn(b, propKey)) {
              return false;
            }
            const bProp = b[propKey];
            if (!isEqualWithImpl(aProp, bProp, propKey, a, b, stack, areValuesEqual)) {
              return false;
            }
          }
          return true;
        }
        default: {
          return false;
        }
      }
    } finally {
      stack.delete(a);
      stack.delete(b);
    }
  }
  function isEqual$2(a, b) {
    return isEqualWith(a, b, noop$1);
  }
  function isNil(x) {
    return x == null;
  }
  function delay(ms2, { signal } = {}) {
    return new Promise((resolve, reject) => {
      const abortError = () => {
        reject(new AbortError$1());
      };
      const abortHandler = () => {
        clearTimeout(timeoutId);
        abortError();
      };
      if (signal == null ? void 0 : signal.aborted) {
        return abortError();
      }
      const timeoutId = setTimeout(() => {
        signal == null ? void 0 : signal.removeEventListener("abort", abortHandler);
        resolve();
      }, ms2);
      signal == null ? void 0 : signal.addEventListener("abort", abortHandler, { once: true });
    });
  }
  const CASE_SPLIT_PATTERN = new RegExp("\\p{Lu}?\\p{Ll}+|[0-9]+|\\p{Lu}+(?!\\p{Ll})|\\p{Emoji_Presentation}|\\p{Extended_Pictographic}|\\p{L}+", "gu");
  function words(str) {
    return Array.from(str.match(CASE_SPLIT_PATTERN) ?? []);
  }
  function startCase(str) {
    const words$1 = words(str.trim());
    let result = "";
    for (let i = 0; i < words$1.length; i++) {
      const word = words$1[i];
      if (result) {
        result += " ";
      }
      result += word[0].toUpperCase() + word.slice(1).toLowerCase();
    }
    return result;
  }
  function invariant(condition, message2) {
    if (condition) {
      return;
    }
    throw new Error(message2);
  }
  const TRACK_MEMO_SYMBOL = Symbol();
  const GET_ORIGINAL_SYMBOL = Symbol();
  const AFFECTED_PROPERTY = "a";
  const IS_TARGET_COPIED_PROPERTY = "f";
  const PROXY_PROPERTY = "p";
  const PROXY_CACHE_PROPERTY = "c";
  const TARGET_CACHE_PROPERTY = "t";
  const NEXT_OBJECT_PROPERTY = "n";
  const CHANGED_PROPERTY = "g";
  const HAS_KEY_PROPERTY = "h";
  const ALL_OWN_KEYS_PROPERTY = "w";
  const HAS_OWN_KEY_PROPERTY = "o";
  const KEYS_PROPERTY = "k";
  let newProxy$1 = (target, handler) => new Proxy(target, handler);
  const getProto = Object.getPrototypeOf;
  const objectsToTrack = /* @__PURE__ */ new WeakMap();
  const isObjectToTrack = (obj) => obj && (objectsToTrack.has(obj) ? objectsToTrack.get(obj) : getProto(obj) === Object.prototype || getProto(obj) === Array.prototype);
  const isObject$1 = (x) => typeof x === "object" && x !== null;
  const needsToCopyTargetObject = (obj) => Object.values(Object.getOwnPropertyDescriptors(obj)).some((descriptor) => !descriptor.configurable && !descriptor.writable);
  const copyTargetObject = (obj) => {
    if (Array.isArray(obj)) {
      return Array.from(obj);
    }
    const descriptors2 = Object.getOwnPropertyDescriptors(obj);
    Object.values(descriptors2).forEach((desc) => {
      desc.configurable = true;
    });
    return Object.create(getProto(obj), descriptors2);
  };
  const createProxyHandler = (origObj, isTargetCopied) => {
    const state = {
      [IS_TARGET_COPIED_PROPERTY]: isTargetCopied
    };
    let trackObject = false;
    const recordUsage = (type, key) => {
      if (!trackObject) {
        let used = state[AFFECTED_PROPERTY].get(origObj);
        if (!used) {
          used = {};
          state[AFFECTED_PROPERTY].set(origObj, used);
        }
        if (type === ALL_OWN_KEYS_PROPERTY) {
          used[ALL_OWN_KEYS_PROPERTY] = true;
        } else {
          let set2 = used[type];
          if (!set2) {
            set2 = /* @__PURE__ */ new Set();
            used[type] = set2;
          }
          set2.add(key);
        }
      }
    };
    const recordObjectAsUsed = () => {
      trackObject = true;
      state[AFFECTED_PROPERTY].delete(origObj);
    };
    const handler = {
      get(target, key) {
        if (key === GET_ORIGINAL_SYMBOL) {
          return origObj;
        }
        recordUsage(KEYS_PROPERTY, key);
        return createProxy(Reflect.get(target, key), state[AFFECTED_PROPERTY], state[PROXY_CACHE_PROPERTY], state[TARGET_CACHE_PROPERTY]);
      },
      has(target, key) {
        if (key === TRACK_MEMO_SYMBOL) {
          recordObjectAsUsed();
          return true;
        }
        recordUsage(HAS_KEY_PROPERTY, key);
        return Reflect.has(target, key);
      },
      getOwnPropertyDescriptor(target, key) {
        recordUsage(HAS_OWN_KEY_PROPERTY, key);
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
      ownKeys(target) {
        recordUsage(ALL_OWN_KEYS_PROPERTY);
        return Reflect.ownKeys(target);
      }
    };
    if (isTargetCopied) {
      handler.set = handler.deleteProperty = () => false;
    }
    return [handler, state];
  };
  const getOriginalObject = (obj) => (
    // unwrap proxy
    obj[GET_ORIGINAL_SYMBOL] || // otherwise
    obj
  );
  const createProxy = (obj, affected, proxyCache2, targetCache2) => {
    if (!isObjectToTrack(obj))
      return obj;
    let targetAndCopied = targetCache2 && targetCache2.get(obj);
    if (!targetAndCopied) {
      const target2 = getOriginalObject(obj);
      if (needsToCopyTargetObject(target2)) {
        targetAndCopied = [target2, copyTargetObject(target2)];
      } else {
        targetAndCopied = [target2];
      }
      targetCache2 === null || targetCache2 === void 0 ? void 0 : targetCache2.set(obj, targetAndCopied);
    }
    const [target, copiedTarget] = targetAndCopied;
    let handlerAndState = proxyCache2 && proxyCache2.get(target);
    if (!handlerAndState || handlerAndState[1][IS_TARGET_COPIED_PROPERTY] !== !!copiedTarget) {
      handlerAndState = createProxyHandler(target, !!copiedTarget);
      handlerAndState[1][PROXY_PROPERTY] = newProxy$1(copiedTarget || target, handlerAndState[0]);
      if (proxyCache2) {
        proxyCache2.set(target, handlerAndState);
      }
    }
    handlerAndState[1][AFFECTED_PROPERTY] = affected;
    handlerAndState[1][PROXY_CACHE_PROPERTY] = proxyCache2;
    handlerAndState[1][TARGET_CACHE_PROPERTY] = targetCache2;
    return handlerAndState[1][PROXY_PROPERTY];
  };
  const isAllOwnKeysChanged = (prevObj, nextObj) => {
    const prevKeys = Reflect.ownKeys(prevObj);
    const nextKeys = Reflect.ownKeys(nextObj);
    return prevKeys.length !== nextKeys.length || prevKeys.some((k, i) => k !== nextKeys[i]);
  };
  const isChanged = (prevObj, nextObj, affected, cache2, isEqual2 = Object.is) => {
    if (isEqual2(prevObj, nextObj)) {
      return false;
    }
    if (!isObject$1(prevObj) || !isObject$1(nextObj))
      return true;
    const used = affected.get(getOriginalObject(prevObj));
    if (!used)
      return true;
    if (cache2) {
      const hit = cache2.get(prevObj);
      if (hit && hit[NEXT_OBJECT_PROPERTY] === nextObj) {
        return hit[CHANGED_PROPERTY];
      }
      cache2.set(prevObj, {
        [NEXT_OBJECT_PROPERTY]: nextObj,
        [CHANGED_PROPERTY]: false
      });
    }
    let changed = null;
    try {
      for (const key of used[HAS_KEY_PROPERTY] || []) {
        changed = Reflect.has(prevObj, key) !== Reflect.has(nextObj, key);
        if (changed)
          return changed;
      }
      if (used[ALL_OWN_KEYS_PROPERTY] === true) {
        changed = isAllOwnKeysChanged(prevObj, nextObj);
        if (changed)
          return changed;
      } else {
        for (const key of used[HAS_OWN_KEY_PROPERTY] || []) {
          const hasPrev = !!Reflect.getOwnPropertyDescriptor(prevObj, key);
          const hasNext = !!Reflect.getOwnPropertyDescriptor(nextObj, key);
          changed = hasPrev !== hasNext;
          if (changed)
            return changed;
        }
      }
      for (const key of used[KEYS_PROPERTY] || []) {
        changed = isChanged(prevObj[key], nextObj[key], affected, cache2, isEqual2);
        if (changed)
          return changed;
      }
      if (changed === null)
        changed = true;
      return changed;
    } finally {
      if (cache2) {
        cache2.set(prevObj, {
          [NEXT_OBJECT_PROPERTY]: nextObj,
          [CHANGED_PROPERTY]: changed
        });
      }
    }
  };
  const getUntracked = (obj) => {
    if (isObjectToTrack(obj)) {
      return obj[GET_ORIGINAL_SYMBOL] || null;
    }
    return null;
  };
  const markToTrack = (obj, mark = true) => {
    objectsToTrack.set(obj, mark);
  };
  const affectedToPathList = (obj, affected, onlyWithValues) => {
    const list = [];
    const seen = /* @__PURE__ */ new WeakSet();
    const walk = (x, path2) => {
      var _a2, _b2, _c2;
      if (seen.has(x)) {
        return;
      }
      if (isObject$1(x)) {
        seen.add(x);
      }
      const used = isObject$1(x) && affected.get(getOriginalObject(x));
      if (used) {
        (_a2 = used[HAS_KEY_PROPERTY]) === null || _a2 === void 0 ? void 0 : _a2.forEach((key) => {
          const segment = `:has(${String(key)})`;
          list.push(path2 ? [...path2, segment] : [segment]);
        });
        if (used[ALL_OWN_KEYS_PROPERTY] === true) {
          const segment = ":ownKeys";
          list.push(path2 ? [...path2, segment] : [segment]);
        } else {
          (_b2 = used[HAS_OWN_KEY_PROPERTY]) === null || _b2 === void 0 ? void 0 : _b2.forEach((key) => {
            const segment = `:hasOwn(${String(key)})`;
            list.push(path2 ? [...path2, segment] : [segment]);
          });
        }
        (_c2 = used[KEYS_PROPERTY]) === null || _c2 === void 0 ? void 0 : _c2.forEach((key) => {
          if ("value" in (Object.getOwnPropertyDescriptor(x, key) || {})) {
            walk(x[key], path2 ? [...path2, key] : [key]);
          }
        });
      } else if (path2) {
        list.push(path2);
      }
    };
    walk(obj);
    return list;
  };
  const __vite_import_meta_env__$1 = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false };
  const isObject = (x) => typeof x === "object" && x !== null;
  const canProxyDefault = (x) => isObject(x) && !refSet.has(x) && (Array.isArray(x) || !(Symbol.iterator in x)) && !(x instanceof WeakMap) && !(x instanceof WeakSet) && !(x instanceof Error) && !(x instanceof Number) && !(x instanceof Date) && !(x instanceof String) && !(x instanceof RegExp) && !(x instanceof ArrayBuffer) && !(x instanceof Promise);
  const createSnapshotDefault = (target, version) => {
    const cache2 = snapCache$2.get(target);
    if ((cache2 == null ? void 0 : cache2[0]) === version) {
      return cache2[1];
    }
    const snap = Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target));
    markToTrack(snap, true);
    snapCache$2.set(target, [version, snap]);
    Reflect.ownKeys(target).forEach((key) => {
      if (Object.getOwnPropertyDescriptor(snap, key)) {
        return;
      }
      const value = Reflect.get(target, key);
      const { enumerable } = Reflect.getOwnPropertyDescriptor(
        target,
        key
      );
      const desc = {
        value,
        enumerable,
        // This is intentional to avoid copying with proxy-compare.
        // It's still non-writable, so it avoids assigning a value.
        configurable: true
      };
      if (refSet.has(value)) {
        markToTrack(value, false);
      } else if (proxyStateMap$2.has(value)) {
        const [target2, ensureVersion] = proxyStateMap$2.get(
          value
        );
        desc.value = createSnapshotDefault(target2, ensureVersion());
      }
      Object.defineProperty(snap, key, desc);
    });
    return Object.preventExtensions(snap);
  };
  const createHandlerDefault = (isInitializing, addPropListener, removePropListener, notifyUpdate) => ({
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      removePropListener(prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        notifyUpdate(["delete", [prop], prevValue]);
      }
      return deleted;
    },
    set(target, prop, value, receiver) {
      const hasPrevValue = !isInitializing() && Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrevValue && (objectIs(prevValue, value) || proxyCache.has(value) && objectIs(prevValue, proxyCache.get(value)))) {
        return true;
      }
      removePropListener(prop);
      if (isObject(value)) {
        value = getUntracked(value) || value;
      }
      const nextValue = !proxyStateMap$2.has(value) && canProxy(value) ? proxy(value) : value;
      addPropListener(prop, nextValue);
      Reflect.set(target, prop, nextValue, receiver);
      notifyUpdate(["set", [prop], value, prevValue]);
      return true;
    }
  });
  const proxyStateMap$2 = /* @__PURE__ */ new WeakMap();
  const refSet = /* @__PURE__ */ new WeakSet();
  const snapCache$2 = /* @__PURE__ */ new WeakMap();
  const versionHolder = [1, 1];
  const proxyCache = /* @__PURE__ */ new WeakMap();
  let objectIs = Object.is;
  let newProxy = (target, handler) => new Proxy(target, handler);
  let canProxy = canProxyDefault;
  let createSnapshot = createSnapshotDefault;
  let createHandler = createHandlerDefault;
  function proxy(baseObject = {}) {
    if (!isObject(baseObject)) {
      throw new Error("object required");
    }
    const found = proxyCache.get(baseObject);
    if (found) {
      return found;
    }
    let version = versionHolder[0];
    const listeners2 = /* @__PURE__ */ new Set();
    const notifyUpdate = (op, nextVersion = ++versionHolder[0]) => {
      if (version !== nextVersion) {
        version = nextVersion;
        listeners2.forEach((listener) => listener(op, nextVersion));
      }
    };
    let checkVersion = versionHolder[1];
    const ensureVersion = (nextCheckVersion = ++versionHolder[1]) => {
      if (checkVersion !== nextCheckVersion && !listeners2.size) {
        checkVersion = nextCheckVersion;
        propProxyStates.forEach(([propProxyState]) => {
          const propVersion = propProxyState[1](nextCheckVersion);
          if (propVersion > version) {
            version = propVersion;
          }
        });
      }
      return version;
    };
    const createPropListener = (prop) => (op, nextVersion) => {
      const newOp = [...op];
      newOp[1] = [prop, ...newOp[1]];
      notifyUpdate(newOp, nextVersion);
    };
    const propProxyStates = /* @__PURE__ */ new Map();
    const addPropListener = (prop, propValue) => {
      const propProxyState = !refSet.has(propValue) && proxyStateMap$2.get(propValue);
      if (propProxyState) {
        if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && propProxyStates.has(prop)) {
          throw new Error("prop listener already exists");
        }
        if (listeners2.size) {
          const remove = propProxyState[2](createPropListener(prop));
          propProxyStates.set(prop, [propProxyState, remove]);
        } else {
          propProxyStates.set(prop, [propProxyState]);
        }
      }
    };
    const removePropListener = (prop) => {
      var _a2;
      const entry = propProxyStates.get(prop);
      if (entry) {
        propProxyStates.delete(prop);
        (_a2 = entry[1]) == null ? void 0 : _a2.call(entry);
      }
    };
    const addListener = (listener) => {
      listeners2.add(listener);
      if (listeners2.size === 1) {
        propProxyStates.forEach(([propProxyState, prevRemove], prop) => {
          if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && prevRemove) {
            throw new Error("remove already exists");
          }
          const remove = propProxyState[2](createPropListener(prop));
          propProxyStates.set(prop, [propProxyState, remove]);
        });
      }
      const removeListener = () => {
        listeners2.delete(listener);
        if (listeners2.size === 0) {
          propProxyStates.forEach(([propProxyState, remove], prop) => {
            if (remove) {
              remove();
              propProxyStates.set(prop, [propProxyState]);
            }
          });
        }
      };
      return removeListener;
    };
    let initializing = true;
    const handler = createHandler(
      () => initializing,
      addPropListener,
      removePropListener,
      notifyUpdate
    );
    const proxyObject = newProxy(baseObject, handler);
    proxyCache.set(baseObject, proxyObject);
    const proxyState = [baseObject, ensureVersion, addListener];
    proxyStateMap$2.set(proxyObject, proxyState);
    Reflect.ownKeys(baseObject).forEach((key) => {
      const desc = Object.getOwnPropertyDescriptor(
        baseObject,
        key
      );
      if ("value" in desc && desc.writable) {
        proxyObject[key] = baseObject[key];
      }
    });
    initializing = false;
    return proxyObject;
  }
  function subscribe$3(proxyObject, callback, notifyInSync) {
    const proxyState = proxyStateMap$2.get(proxyObject);
    if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && !proxyState) {
      console.warn("Please use proxy object");
    }
    let promise;
    const ops = [];
    const addListener = proxyState[2];
    let isListenerActive = false;
    const listener = (op) => {
      ops.push(op);
      if (!promise) {
        promise = Promise.resolve().then(() => {
          promise = void 0;
          if (isListenerActive) {
            callback(ops.splice(0));
          }
        });
      }
    };
    const removeListener = addListener(listener);
    isListenerActive = true;
    return () => {
      isListenerActive = false;
      removeListener();
    };
  }
  function snapshot(proxyObject) {
    const proxyState = proxyStateMap$2.get(proxyObject);
    if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && !proxyState) {
      console.warn("Please use proxy object");
    }
    const [target, ensureVersion] = proxyState;
    return createSnapshot(target, ensureVersion());
  }
  const unstable_getInternalStates = () => ({
    proxyStateMap: proxyStateMap$2,
    refSet,
    snapCache: snapCache$2,
    versionHolder,
    proxyCache
  });
  const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false };
  const useAffectedDebugValue = (state, affected) => {
    const pathList = React.useRef();
    React.useEffect(() => {
      pathList.current = affectedToPathList(state, affected);
    });
    React.useDebugValue(pathList.current);
  };
  const condUseAffectedDebugValue = useAffectedDebugValue;
  const targetCache = /* @__PURE__ */ new WeakMap();
  function useSnapshot(proxyObject, options) {
    const notifyInSync = void 0;
    const affected = React.useMemo(
      () => proxyObject && /* @__PURE__ */ new WeakMap(),
      [proxyObject]
    );
    const lastSnapshot = React.useRef();
    let inRender = true;
    const currSnapshot = React.useSyncExternalStore(
      React.useCallback(
        (callback) => {
          const unsub = subscribe$3(proxyObject, callback);
          callback();
          return unsub;
        },
        [proxyObject, notifyInSync]
      ),
      () => {
        const nextSnapshot = snapshot(proxyObject);
        try {
          if (!inRender && lastSnapshot.current && !isChanged(
            lastSnapshot.current,
            nextSnapshot,
            affected,
            /* @__PURE__ */ new WeakMap()
          )) {
            return lastSnapshot.current;
          }
        } catch (e) {
        }
        return nextSnapshot;
      },
      () => snapshot(proxyObject)
    );
    inRender = false;
    React.useLayoutEffect(() => {
      lastSnapshot.current = currSnapshot;
    });
    if ((__vite_import_meta_env__ ? "production" : void 0) !== "production") {
      condUseAffectedDebugValue(currSnapshot, affected);
    }
    const proxyCache2 = React.useMemo(() => /* @__PURE__ */ new WeakMap(), []);
    return createProxy(currSnapshot, affected, proxyCache2, targetCache);
  }
  const { proxyStateMap: proxyStateMap$1, snapCache: snapCache$1 } = unstable_getInternalStates();
  const maybeProxify = (x) => typeof x === "object" ? proxy({ x }).x : x;
  const isProxy$1 = (x) => proxyStateMap$1.has(x);
  function proxySet(initialValues) {
    const initialData = [];
    const indexMap = /* @__PURE__ */ new Map();
    let initialIndex = 0;
    const snapMapCache = /* @__PURE__ */ new WeakMap();
    const registerSnapMap = () => {
      const cache2 = snapCache$1.get(vObject);
      const latestSnap = cache2 == null ? void 0 : cache2[1];
      if (latestSnap && !snapMapCache.has(latestSnap)) {
        const clonedMap = new Map(indexMap);
        snapMapCache.set(latestSnap, clonedMap);
      }
    };
    const getMapForThis = (x) => snapMapCache.get(x) || indexMap;
    if (initialValues) {
      if (typeof initialValues[Symbol.iterator] !== "function") {
        throw new TypeError("not iterable");
      }
      for (const value of initialValues) {
        if (!indexMap.has(value)) {
          const v = maybeProxify(value);
          indexMap.set(v, initialIndex);
          initialData[initialIndex++] = v;
        }
      }
    }
    const vObject = {
      data: initialData,
      index: initialIndex,
      epoch: 0,
      get size() {
        if (!isProxy$1(this)) {
          registerSnapMap();
        }
        return indexMap.size;
      },
      has(value) {
        const map = getMapForThis(this);
        const v = maybeProxify(value);
        this.epoch;
        return map.has(v);
      },
      add(value) {
        if (!isProxy$1(this)) {
          throw new Error("Cannot perform mutations on a snapshot");
        }
        const v = maybeProxify(value);
        if (!indexMap.has(v)) {
          indexMap.set(v, this.index);
          this.data[this.index++] = v;
          this.epoch++;
        }
        return this;
      },
      delete(value) {
        if (!isProxy$1(this)) {
          throw new Error("Cannot perform mutations on a snapshot");
        }
        const v = maybeProxify(value);
        const index = indexMap.get(v);
        if (index === void 0) {
          return false;
        }
        delete this.data[index];
        indexMap.delete(v);
        this.epoch++;
        return true;
      },
      clear() {
        if (!isProxy$1(this)) {
          throw new Error("Cannot perform mutations on a snapshot");
        }
        this.data.length = 0;
        this.index = 0;
        this.epoch++;
        indexMap.clear();
      },
      forEach(cb) {
        this.epoch;
        const map = getMapForThis(this);
        map.forEach((index) => {
          cb(this.data[index], this.data[index], this);
        });
      },
      *values() {
        this.epoch;
        const map = getMapForThis(this);
        for (const index of map.values()) {
          yield this.data[index];
        }
      },
      keys() {
        this.epoch;
        return this.values();
      },
      *entries() {
        this.epoch;
        const map = getMapForThis(this);
        for (const index of map.values()) {
          const value = this.data[index];
          yield [value, value];
        }
      },
      toJSON() {
        return new Set(this.values());
      },
      [Symbol.iterator]() {
        return this.values();
      },
      get [Symbol.toStringTag]() {
        return "Set";
      },
      intersection(other) {
        this.epoch;
        const otherSet = proxySet(other);
        const resultSet = proxySet();
        for (const value of this.values()) {
          if (otherSet.has(value)) {
            resultSet.add(value);
          }
        }
        return proxySet(resultSet);
      },
      isDisjointFrom(other) {
        this.epoch;
        const otherSet = proxySet(other);
        return this.size === other.size && [...this.values()].every((value) => !otherSet.has(value));
      },
      isSubsetOf(other) {
        this.epoch;
        const otherSet = proxySet(other);
        return this.size <= other.size && [...this.values()].every((value) => otherSet.has(value));
      },
      isSupersetOf(other) {
        this.epoch;
        const otherSet = proxySet(other);
        return this.size >= other.size && [...otherSet].every((value) => this.has(value));
      },
      symmetricDifference(other) {
        this.epoch;
        const resultSet = proxySet();
        const otherSet = proxySet(other);
        for (const value of this.values()) {
          if (!otherSet.has(value)) {
            resultSet.add(value);
          }
        }
        return proxySet(resultSet);
      },
      union(other) {
        this.epoch;
        const resultSet = proxySet();
        const otherSet = proxySet(other);
        for (const value of this.values()) {
          resultSet.add(value);
        }
        for (const value of otherSet) {
          resultSet.add(value);
        }
        return proxySet(resultSet);
      }
    };
    const proxiedObject = proxy(vObject);
    Object.defineProperties(proxiedObject, {
      size: { enumerable: false },
      data: { enumerable: false },
      index: { enumerable: false },
      epoch: { enumerable: false },
      toJSON: { enumerable: false }
    });
    Object.seal(proxiedObject);
    return proxiedObject;
  }
  const { proxyStateMap, snapCache } = unstable_getInternalStates();
  const isProxy = (x) => proxyStateMap.has(x);
  function proxyMap(entries) {
    const initialData = [];
    let initialIndex = 0;
    const indexMap = /* @__PURE__ */ new Map();
    const snapMapCache = /* @__PURE__ */ new WeakMap();
    const registerSnapMap = () => {
      const cache2 = snapCache.get(vObject);
      const latestSnap = cache2 == null ? void 0 : cache2[1];
      if (latestSnap && !snapMapCache.has(latestSnap)) {
        const clonedMap = new Map(indexMap);
        snapMapCache.set(latestSnap, clonedMap);
      }
    };
    const getMapForThis = (x) => snapMapCache.get(x) || indexMap;
    if (entries) {
      if (typeof entries[Symbol.iterator] !== "function") {
        throw new TypeError(
          "proxyMap:\n	initial state must be iterable\n		tip: structure should be [[key, value]]"
        );
      }
      for (const [key, value] of entries) {
        indexMap.set(key, initialIndex);
        initialData[initialIndex++] = value;
      }
    }
    const vObject = {
      data: initialData,
      index: initialIndex,
      epoch: 0,
      get size() {
        if (!isProxy(this)) {
          registerSnapMap();
        }
        const map = getMapForThis(this);
        return map.size;
      },
      get(key) {
        const map = getMapForThis(this);
        const index = map.get(key);
        if (index === void 0) {
          this.epoch;
          return void 0;
        }
        return this.data[index];
      },
      has(key) {
        const map = getMapForThis(this);
        this.epoch;
        return map.has(key);
      },
      set(key, value) {
        if (!isProxy(this)) {
          throw new Error("Cannot perform mutations on a snapshot");
        }
        const index = indexMap.get(key);
        if (index === void 0) {
          indexMap.set(key, this.index);
          this.data[this.index++] = value;
        } else {
          this.data[index] = value;
        }
        this.epoch++;
        return this;
      },
      delete(key) {
        if (!isProxy(this)) {
          throw new Error("Cannot perform mutations on a snapshot");
        }
        const index = indexMap.get(key);
        if (index === void 0) {
          return false;
        }
        delete this.data[index];
        indexMap.delete(key);
        this.epoch++;
        return true;
      },
      clear() {
        if (!isProxy(this)) {
          throw new Error("Cannot perform mutations on a snapshot");
        }
        this.data.length = 0;
        this.index = 0;
        this.epoch++;
        indexMap.clear();
      },
      forEach(cb) {
        this.epoch;
        const map = getMapForThis(this);
        map.forEach((index, key) => {
          cb(this.data[index], key, this);
        });
      },
      *entries() {
        this.epoch;
        const map = getMapForThis(this);
        for (const [key, index] of map) {
          yield [key, this.data[index]];
        }
      },
      *keys() {
        this.epoch;
        const map = getMapForThis(this);
        for (const key of map.keys()) {
          yield key;
        }
      },
      *values() {
        this.epoch;
        const map = getMapForThis(this);
        for (const index of map.values()) {
          yield this.data[index];
        }
      },
      [Symbol.iterator]() {
        return this.entries();
      },
      get [Symbol.toStringTag]() {
        return "Map";
      },
      toJSON() {
        return new Map(this.entries());
      }
    };
    const proxiedObject = proxy(vObject);
    Object.defineProperties(proxiedObject, {
      size: { enumerable: false },
      index: { enumerable: false },
      epoch: { enumerable: false },
      data: { enumerable: false },
      toJSON: { enumerable: false }
    });
    Object.seal(proxiedObject);
    return proxiedObject;
  }
  function valtioFactory(computeValue) {
    const state = proxy({
      value: computeValue()
    });
    function use() {
      return useSnapshot(state).value;
    }
    function get2() {
      return state.value;
    }
    function update() {
      state.value = computeValue();
    }
    const updateThrottled = throttle$1(update, 100, {
      edges: ["leading", "trailing"]
    });
    return {
      state,
      use,
      get: get2,
      update,
      updateThrottled
    };
  }
  function subscribeOnKeys(state, keys, callback) {
    let prevVal = pick$1(snapshot(state), keys);
    subscribe$3(state, () => {
      const snap = snapshot(state);
      const val = pick$1(snap, keys);
      if (!isEqual$2(prevVal, val)) {
        callback(snap);
      }
      prevVal = val;
    });
  }
  async function proxyWithGmStorage(initialVaue, storageKey2) {
    async function load() {
      const allowedKeys = Object.keys(initialVaue);
      return pick$1(await GM.getValue(storageKey2) || {}, allowedKeys);
    }
    const p = proxy({
      ...initialVaue,
      ...await load()
    });
    setTimeout(() => {
      const limit2 = pLimit(1);
      subscribe$3(p, () => limit2(async () => {
        const existing = await load();
        const newValue = toMerged(existing, snapshot(p));
        GM.setValue(storageKey2, newValue);
      }));
    });
    return p;
  }
  async function proxySetWithGmStorage(storageKey2) {
    const load = async () => await GM.getValue(storageKey2) || [];
    const p = proxySet(await load());
    const replaceAllWith = (newVal) => {
      const newSet = new Set(newVal);
      for (const x of [...p, ...newSet]) {
        if (!newSet.has(x)) p.delete(x);
        else p.add(x);
      }
    };
    setTimeout(setupSubscribe);
    let persist = true;
    function setupSubscribe() {
      subscribe$3(p, () => {
        if (!persist) return;
        GM.setValue(storageKey2, Array.from(snapshot(p)));
      });
      reciveGmValueUpdatesFromOtherTab({
        storageKey: storageKey2,
        setPersist: (val) => persist = val,
        onUpdate: replaceAllWith
      });
    }
    return {
      set: p,
      replaceAllWith
    };
  }
  async function proxyMapWithGmStorage(storageKey2, beforeSave) {
    const load = async () => await GM.getValue(storageKey2) || [];
    const p = proxyMap(await load());
    const replaceAllWith = (newVal) => {
      const newMap = new Map(newVal);
      for (const [k, v] of [...p, ...newMap]) {
        if (!newMap.has(k)) p.delete(k);
        else p.set(k, v);
      }
    };
    setTimeout(setupSubscribe);
    let persist = true;
    function setupSubscribe() {
      subscribe$3(p, () => {
        if (!persist) return;
        let val = Array.from(snapshot(p));
        GM.setValue(storageKey2, val);
      });
      reciveGmValueUpdatesFromOtherTab({
        storageKey: storageKey2,
        setPersist: (val) => persist = val,
        onUpdate: replaceAllWith
      });
    }
    return {
      map: p,
      replaceAllWith
    };
  }
  const defaultHeader = () => document.querySelector(".bili-header__bar");
  function isUsingCustomHeader() {
    const el = defaultHeader();
    return Boolean(el && window.getComputedStyle(el).display === "none");
  }
  const $usingEvolevdHeader = valtioFactory(isUsingCustomHeader);
  function calcHeaderHeight() {
    if (!isUsingCustomHeader()) return 64;
    const fixed = document.body.classList.contains("fixed-navbar");
    if (!fixed) return 0;
    const heightDef = document.documentElement.style.getPropertyValue("--navbar-height");
    if (!heightDef) return 50;
    const height = Number(heightDef.replace("px", ""));
    if (isNaN(height)) return 50;
    return height;
  }
  const $headerHeight = valtioFactory(calcHeaderHeight);
  function calcHeaderWidth() {
    const paddingDef = document.documentElement.style.getPropertyValue("--navbar-bounds-padding");
    if (!paddingDef) return;
    const percent = minmax(Number(paddingDef.replace("%", "")), 2, 10);
    const width = 100 - percent * 2;
    return width;
  }
  const $headerWidth = valtioFactory(calcHeaderWidth);
  function useBackToTopRight() {
    const width = $headerWidth.use();
    const {
      pureRecommend,
      style: {
        pureRecommend: {
          useCustomGrid
        }
      }
    } = useSettingsSnapshot();
    if (!pureRecommend || !useCustomGrid) return;
    if (!width) return;
    const rest = (1 - width / 100) / 2 * window.innerWidth + /* padding */
    10;
    const backToTopWidth = 40;
    if (rest > backToTopWidth + /** default back-top-right */
    24 + /** visual padding */
    5) {
      return;
    }
    if (rest < backToTopWidth) {
      return 0;
    }
    const right = Math.floor((rest - backToTopWidth) / 2);
    return right;
  }
  function calcEvolvedThemeColor() {
    return window.getComputedStyle(document.documentElement).getPropertyValue("--theme-color");
  }
  const $evolvedThemeColor = valtioFactory(calcEvolvedThemeColor);
  function action() {
    $usingEvolevdHeader.updateThrottled();
    $headerHeight.updateThrottled();
    $headerWidth.updateThrottled();
    $evolvedThemeColor.updateThrottled();
  }
  const ob$1 = new MutationObserver(() => action());
  ob$1.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style"]
  });
  ob$1.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
  window.addEventListener("unload", () => {
    ob$1.disconnect();
  });
  document.body.addEventListener("click", (e) => {
    const el = e.target;
    const isClickOnButton = (el2) => !!(el2 == null ? void 0 : el2.matches(".be-button.ok"));
    if (!isClickOnButton(el) && !isClickOnButton(el.parentElement)) return;
    if (!el.closest(".be-popup.picker.open")) return;
    setTimeout($evolvedThemeColor.updateThrottled, 1e3);
  }, {
    capture: true,
    passive: true
  });
  const messageConfig = {
    // duration: default 3, 单位秒
    maxCount: 5,
    top: $headerHeight.get() - 4
  };
  antd.message.config(messageConfig);
  function UseApp() {
    const h = $headerHeight.use();
    return /* @__PURE__ */ jsx$1(antd.App, { component: false, message: {
      ...messageConfig,
      top: h - 4
    }, children: /* @__PURE__ */ jsx$1(UseAppInner, {}) });
  }
  let antStatic;
  let antMessage = antd.message;
  let antNotification = antd.notification;
  function UseAppInner() {
    antStatic = antd.App.useApp();
    antMessage = antStatic.message;
    antNotification = antStatic.notification;
    return null;
  }
  function defineAntMenus(arr2) {
    return arr2.filter((x) => !isNil(x) && x !== false).map((x) => {
      const testResult = typeof x.test === "undefined" ? true : typeof x.test === "function" ? x.test() : x.test;
      return {
        ...x,
        testResult
      };
    }).filter((x) => x.testResult).map((x) => omit(x, ["test", "testResult"]));
  }
  function mitt(n) {
    return { all: n = n || /* @__PURE__ */ new Map(), on: function(t, e) {
      var i = n.get(t);
      i ? i.push(e) : n.set(t, [e]);
    }, off: function(t, e) {
      var i = n.get(t);
      i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t, []));
    }, emit: function(t, e) {
      var i = n.get(t);
      i && i.slice().map(function(n2) {
        n2(e);
      }), (i = n.get("*")) && i.slice().map(function(n2) {
        n2(t, e);
      });
    } };
  }
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
      return t2.__proto__ = e2, t2;
    }, _setPrototypeOf(t, e);
  }
  function _inheritsLoose(t, o) {
    t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
  }
  function _getPrototypeOf(t) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
      return t2.__proto__ || Object.getPrototypeOf(t2);
    }, _getPrototypeOf(t);
  }
  function _isNativeFunction(t) {
    try {
      return -1 !== Function.toString.call(t).indexOf("[native code]");
    } catch (n) {
      return "function" == typeof t;
    }
  }
  function _isNativeReflectConstruct() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t2) {
    }
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
      return !!t;
    })();
  }
  function _construct(t, e, r2) {
    if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
    var o = [null];
    o.push.apply(o, e);
    var p = new (t.bind.apply(t, o))();
    return r2 && _setPrototypeOf(p, r2.prototype), p;
  }
  function _wrapNativeSuper(t) {
    var r2 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
    return _wrapNativeSuper = function _wrapNativeSuper2(t2) {
      if (null === t2 || !_isNativeFunction(t2)) return t2;
      if ("function" != typeof t2) throw new TypeError("Super expression must either be null or a function");
      if (void 0 !== r2) {
        if (r2.has(t2)) return r2.get(t2);
        r2.set(t2, Wrapper);
      }
      function Wrapper() {
        return _construct(t2, arguments, _getPrototypeOf(this).constructor);
      }
      return Wrapper.prototype = Object.create(t2.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      }), _setPrototypeOf(Wrapper, t2);
    }, _wrapNativeSuper(t);
  }
  var PolishedError = /* @__PURE__ */ function(_Error) {
    _inheritsLoose(PolishedError2, _Error);
    function PolishedError2(code) {
      var _this;
      {
        _this = _Error.call(this, "An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#" + code + " for more information.") || this;
      }
      return _assertThisInitialized(_this);
    }
    return PolishedError2;
  }(/* @__PURE__ */ _wrapNativeSuper(Error));
  function colorToInt(color) {
    return Math.round(color * 255);
  }
  function convertToInt(red, green, blue) {
    return colorToInt(red) + "," + colorToInt(green) + "," + colorToInt(blue);
  }
  function hslToRgb(hue, saturation, lightness, convert) {
    if (convert === void 0) {
      convert = convertToInt;
    }
    if (saturation === 0) {
      return convert(lightness, lightness, lightness);
    }
    var huePrime = (hue % 360 + 360) % 360 / 60;
    var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    var secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
    var red = 0;
    var green = 0;
    var blue = 0;
    if (huePrime >= 0 && huePrime < 1) {
      red = chroma;
      green = secondComponent;
    } else if (huePrime >= 1 && huePrime < 2) {
      red = secondComponent;
      green = chroma;
    } else if (huePrime >= 2 && huePrime < 3) {
      green = chroma;
      blue = secondComponent;
    } else if (huePrime >= 3 && huePrime < 4) {
      green = secondComponent;
      blue = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
      red = secondComponent;
      blue = chroma;
    } else if (huePrime >= 5 && huePrime < 6) {
      red = chroma;
      blue = secondComponent;
    }
    var lightnessModification = lightness - chroma / 2;
    var finalRed = red + lightnessModification;
    var finalGreen = green + lightnessModification;
    var finalBlue = blue + lightnessModification;
    return convert(finalRed, finalGreen, finalBlue);
  }
  var namedColorMap = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "00ffff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000",
    blanchedalmond: "ffebcd",
    blue: "0000ff",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "00ffff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgreen: "006400",
    darkgrey: "a9a9a9",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "ff00ff",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    green: "008000",
    greenyellow: "adff2f",
    grey: "808080",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgreen: "90ee90",
    lightgrey: "d3d3d3",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "789",
    lightslategrey: "789",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "0f0",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "f0f",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    rebeccapurple: "639",
    red: "f00",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "fff",
    whitesmoke: "f5f5f5",
    yellow: "ff0",
    yellowgreen: "9acd32"
  };
  function nameToHex(color) {
    if (typeof color !== "string") return color;
    var normalizedColorName = color.toLowerCase();
    return namedColorMap[normalizedColorName] ? "#" + namedColorMap[normalizedColorName] : color;
  }
  var hexRegex = /^#[a-fA-F0-9]{6}$/;
  var hexRgbaRegex = /^#[a-fA-F0-9]{8}$/;
  var reducedHexRegex = /^#[a-fA-F0-9]{3}$/;
  var reducedRgbaHexRegex = /^#[a-fA-F0-9]{4}$/;
  var rgbRegex = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i;
  var rgbaRegex = /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
  var hslRegex = /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i;
  var hslaRegex = /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
  function parseToRgb(color) {
    if (typeof color !== "string") {
      throw new PolishedError(3);
    }
    var normalizedColor = nameToHex(color);
    if (normalizedColor.match(hexRegex)) {
      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[2], 16),
        green: parseInt("" + normalizedColor[3] + normalizedColor[4], 16),
        blue: parseInt("" + normalizedColor[5] + normalizedColor[6], 16)
      };
    }
    if (normalizedColor.match(hexRgbaRegex)) {
      var alpha = parseFloat((parseInt("" + normalizedColor[7] + normalizedColor[8], 16) / 255).toFixed(2));
      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[2], 16),
        green: parseInt("" + normalizedColor[3] + normalizedColor[4], 16),
        blue: parseInt("" + normalizedColor[5] + normalizedColor[6], 16),
        alpha
      };
    }
    if (normalizedColor.match(reducedHexRegex)) {
      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[1], 16),
        green: parseInt("" + normalizedColor[2] + normalizedColor[2], 16),
        blue: parseInt("" + normalizedColor[3] + normalizedColor[3], 16)
      };
    }
    if (normalizedColor.match(reducedRgbaHexRegex)) {
      var _alpha = parseFloat((parseInt("" + normalizedColor[4] + normalizedColor[4], 16) / 255).toFixed(2));
      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[1], 16),
        green: parseInt("" + normalizedColor[2] + normalizedColor[2], 16),
        blue: parseInt("" + normalizedColor[3] + normalizedColor[3], 16),
        alpha: _alpha
      };
    }
    var rgbMatched = rgbRegex.exec(normalizedColor);
    if (rgbMatched) {
      return {
        red: parseInt("" + rgbMatched[1], 10),
        green: parseInt("" + rgbMatched[2], 10),
        blue: parseInt("" + rgbMatched[3], 10)
      };
    }
    var rgbaMatched = rgbaRegex.exec(normalizedColor.substring(0, 50));
    if (rgbaMatched) {
      return {
        red: parseInt("" + rgbaMatched[1], 10),
        green: parseInt("" + rgbaMatched[2], 10),
        blue: parseInt("" + rgbaMatched[3], 10),
        alpha: parseFloat("" + rgbaMatched[4]) > 1 ? parseFloat("" + rgbaMatched[4]) / 100 : parseFloat("" + rgbaMatched[4])
      };
    }
    var hslMatched = hslRegex.exec(normalizedColor);
    if (hslMatched) {
      var hue = parseInt("" + hslMatched[1], 10);
      var saturation = parseInt("" + hslMatched[2], 10) / 100;
      var lightness = parseInt("" + hslMatched[3], 10) / 100;
      var rgbColorString = "rgb(" + hslToRgb(hue, saturation, lightness) + ")";
      var hslRgbMatched = rgbRegex.exec(rgbColorString);
      if (!hslRgbMatched) {
        throw new PolishedError(4, normalizedColor, rgbColorString);
      }
      return {
        red: parseInt("" + hslRgbMatched[1], 10),
        green: parseInt("" + hslRgbMatched[2], 10),
        blue: parseInt("" + hslRgbMatched[3], 10)
      };
    }
    var hslaMatched = hslaRegex.exec(normalizedColor.substring(0, 50));
    if (hslaMatched) {
      var _hue = parseInt("" + hslaMatched[1], 10);
      var _saturation = parseInt("" + hslaMatched[2], 10) / 100;
      var _lightness = parseInt("" + hslaMatched[3], 10) / 100;
      var _rgbColorString = "rgb(" + hslToRgb(_hue, _saturation, _lightness) + ")";
      var _hslRgbMatched = rgbRegex.exec(_rgbColorString);
      if (!_hslRgbMatched) {
        throw new PolishedError(4, normalizedColor, _rgbColorString);
      }
      return {
        red: parseInt("" + _hslRgbMatched[1], 10),
        green: parseInt("" + _hslRgbMatched[2], 10),
        blue: parseInt("" + _hslRgbMatched[3], 10),
        alpha: parseFloat("" + hslaMatched[4]) > 1 ? parseFloat("" + hslaMatched[4]) / 100 : parseFloat("" + hslaMatched[4])
      };
    }
    throw new PolishedError(5);
  }
  function rgbToHsl(color) {
    var red = color.red / 255;
    var green = color.green / 255;
    var blue = color.blue / 255;
    var max2 = Math.max(red, green, blue);
    var min2 = Math.min(red, green, blue);
    var lightness = (max2 + min2) / 2;
    if (max2 === min2) {
      if (color.alpha !== void 0) {
        return {
          hue: 0,
          saturation: 0,
          lightness,
          alpha: color.alpha
        };
      } else {
        return {
          hue: 0,
          saturation: 0,
          lightness
        };
      }
    }
    var hue;
    var delta = max2 - min2;
    var saturation = lightness > 0.5 ? delta / (2 - max2 - min2) : delta / (max2 + min2);
    switch (max2) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
    hue *= 60;
    if (color.alpha !== void 0) {
      return {
        hue,
        saturation,
        lightness,
        alpha: color.alpha
      };
    }
    return {
      hue,
      saturation,
      lightness
    };
  }
  function parseToHsl(color) {
    return rgbToHsl(parseToRgb(color));
  }
  var reduceHexValue = function reduceHexValue2(value) {
    if (value.length === 7 && value[1] === value[2] && value[3] === value[4] && value[5] === value[6]) {
      return "#" + value[1] + value[3] + value[5];
    }
    return value;
  };
  var reduceHexValue$1 = reduceHexValue;
  function numberToHex(value) {
    var hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }
  function colorToHex(color) {
    return numberToHex(Math.round(color * 255));
  }
  function convertToHex(red, green, blue) {
    return reduceHexValue$1("#" + colorToHex(red) + colorToHex(green) + colorToHex(blue));
  }
  function hslToHex(hue, saturation, lightness) {
    return hslToRgb(hue, saturation, lightness, convertToHex);
  }
  function hsl(value, saturation, lightness) {
    if (typeof value === "number" && typeof saturation === "number" && typeof lightness === "number") {
      return hslToHex(value, saturation, lightness);
    } else if (typeof value === "object" && saturation === void 0 && lightness === void 0) {
      return hslToHex(value.hue, value.saturation, value.lightness);
    }
    throw new PolishedError(1);
  }
  function hsla(value, saturation, lightness, alpha) {
    if (typeof value === "number" && typeof saturation === "number" && typeof lightness === "number" && typeof alpha === "number") {
      return "rgba(" + hslToRgb(value, saturation, lightness) + "," + alpha + ")";
    } else if (typeof value === "object" && saturation === void 0 && lightness === void 0 && alpha === void 0) {
      return value.alpha >= 1 ? hslToHex(value.hue, value.saturation, value.lightness) : "rgba(" + hslToRgb(value.hue, value.saturation, value.lightness) + "," + value.alpha + ")";
    }
    throw new PolishedError(2);
  }
  function rgb(value, green, blue) {
    if (typeof value === "number" && typeof green === "number" && typeof blue === "number") {
      return reduceHexValue$1("#" + numberToHex(value) + numberToHex(green) + numberToHex(blue));
    } else if (typeof value === "object" && green === void 0 && blue === void 0) {
      return reduceHexValue$1("#" + numberToHex(value.red) + numberToHex(value.green) + numberToHex(value.blue));
    }
    throw new PolishedError(6);
  }
  function rgba(firstValue, secondValue, thirdValue, fourthValue) {
    if (typeof firstValue === "string" && typeof secondValue === "number") {
      var rgbValue = parseToRgb(firstValue);
      return "rgba(" + rgbValue.red + "," + rgbValue.green + "," + rgbValue.blue + "," + secondValue + ")";
    } else if (typeof firstValue === "number" && typeof secondValue === "number" && typeof thirdValue === "number" && typeof fourthValue === "number") {
      return "rgba(" + firstValue + "," + secondValue + "," + thirdValue + "," + fourthValue + ")";
    } else if (typeof firstValue === "object" && secondValue === void 0 && thirdValue === void 0 && fourthValue === void 0) {
      return firstValue.alpha >= 1 ? rgb(firstValue.red, firstValue.green, firstValue.blue) : "rgba(" + firstValue.red + "," + firstValue.green + "," + firstValue.blue + "," + firstValue.alpha + ")";
    }
    throw new PolishedError(7);
  }
  var isRgb = function isRgb2(color) {
    return typeof color.red === "number" && typeof color.green === "number" && typeof color.blue === "number" && (typeof color.alpha !== "number" || typeof color.alpha === "undefined");
  };
  var isRgba = function isRgba2(color) {
    return typeof color.red === "number" && typeof color.green === "number" && typeof color.blue === "number" && typeof color.alpha === "number";
  };
  var isHsl = function isHsl2(color) {
    return typeof color.hue === "number" && typeof color.saturation === "number" && typeof color.lightness === "number" && (typeof color.alpha !== "number" || typeof color.alpha === "undefined");
  };
  var isHsla = function isHsla2(color) {
    return typeof color.hue === "number" && typeof color.saturation === "number" && typeof color.lightness === "number" && typeof color.alpha === "number";
  };
  function toColorString(color) {
    if (typeof color !== "object") throw new PolishedError(8);
    if (isRgba(color)) return rgba(color);
    if (isRgb(color)) return rgb(color);
    if (isHsla(color)) return hsla(color);
    if (isHsl(color)) return hsl(color);
    throw new PolishedError(8);
  }
  function curried(f, length2, acc) {
    return function fn() {
      var combined = acc.concat(Array.prototype.slice.call(arguments));
      return combined.length >= length2 ? f.apply(this, combined) : curried(f, length2, combined);
    };
  }
  function curry(f) {
    return curried(f, f.length, []);
  }
  function adjustHue(degree, color) {
    if (color === "transparent") return color;
    var hslColor = parseToHsl(color);
    return toColorString(_extends({}, hslColor, {
      hue: hslColor.hue + parseFloat(degree)
    }));
  }
  curry(adjustHue);
  function guard(lowerBoundary, upperBoundary, value) {
    return Math.max(lowerBoundary, Math.min(upperBoundary, value));
  }
  function darken(amount, color) {
    if (color === "transparent") return color;
    var hslColor = parseToHsl(color);
    return toColorString(_extends({}, hslColor, {
      lightness: guard(0, 1, hslColor.lightness - parseFloat(amount))
    }));
  }
  curry(darken);
  function desaturate(amount, color) {
    if (color === "transparent") return color;
    var hslColor = parseToHsl(color);
    return toColorString(_extends({}, hslColor, {
      saturation: guard(0, 1, hslColor.saturation - parseFloat(amount))
    }));
  }
  curry(desaturate);
  function lighten(amount, color) {
    if (color === "transparent") return color;
    var hslColor = parseToHsl(color);
    return toColorString(_extends({}, hslColor, {
      lightness: guard(0, 1, hslColor.lightness + parseFloat(amount))
    }));
  }
  curry(lighten);
  function mix(weight, color, otherColor) {
    if (color === "transparent") return otherColor;
    if (otherColor === "transparent") return color;
    if (weight === 0) return otherColor;
    var parsedColor1 = parseToRgb(color);
    var color1 = _extends({}, parsedColor1, {
      alpha: typeof parsedColor1.alpha === "number" ? parsedColor1.alpha : 1
    });
    var parsedColor2 = parseToRgb(otherColor);
    var color2 = _extends({}, parsedColor2, {
      alpha: typeof parsedColor2.alpha === "number" ? parsedColor2.alpha : 1
    });
    var alphaDelta = color1.alpha - color2.alpha;
    var x = parseFloat(weight) * 2 - 1;
    var y = x * alphaDelta === -1 ? x : x + alphaDelta;
    var z = 1 + x * alphaDelta;
    var weight1 = (y / z + 1) / 2;
    var weight2 = 1 - weight1;
    var mixedColor = {
      red: Math.floor(color1.red * weight1 + color2.red * weight2),
      green: Math.floor(color1.green * weight1 + color2.green * weight2),
      blue: Math.floor(color1.blue * weight1 + color2.blue * weight2),
      alpha: color1.alpha * parseFloat(weight) + color2.alpha * (1 - parseFloat(weight))
    };
    return rgba(mixedColor);
  }
  var curriedMix = curry(mix);
  var mix$1 = curriedMix;
  function opacify(amount, color) {
    if (color === "transparent") return color;
    var parsedColor = parseToRgb(color);
    var alpha = typeof parsedColor.alpha === "number" ? parsedColor.alpha : 1;
    var colorWithAlpha = _extends({}, parsedColor, {
      alpha: guard(0, 1, (alpha * 100 + parseFloat(amount) * 100) / 100)
    });
    return rgba(colorWithAlpha);
  }
  curry(opacify);
  function saturate(amount, color) {
    if (color === "transparent") return color;
    var hslColor = parseToHsl(color);
    return toColorString(_extends({}, hslColor, {
      saturation: guard(0, 1, hslColor.saturation + parseFloat(amount))
    }));
  }
  curry(saturate);
  function setHue(hue, color) {
    if (color === "transparent") return color;
    return toColorString(_extends({}, parseToHsl(color), {
      hue: parseFloat(hue)
    }));
  }
  curry(setHue);
  function setLightness(lightness, color) {
    if (color === "transparent") return color;
    return toColorString(_extends({}, parseToHsl(color), {
      lightness: parseFloat(lightness)
    }));
  }
  curry(setLightness);
  function setSaturation(saturation, color) {
    if (color === "transparent") return color;
    return toColorString(_extends({}, parseToHsl(color), {
      saturation: parseFloat(saturation)
    }));
  }
  curry(setSaturation);
  function shade(percentage, color) {
    if (color === "transparent") return color;
    return mix$1(parseFloat(percentage), "rgb(0, 0, 0)", color);
  }
  curry(shade);
  function tint(percentage, color) {
    if (color === "transparent") return color;
    return mix$1(parseFloat(percentage), "rgb(255, 255, 255)", color);
  }
  curry(tint);
  function transparentize(amount, color) {
    if (color === "transparent") return color;
    var parsedColor = parseToRgb(color);
    var alpha = typeof parsedColor.alpha === "number" ? parsedColor.alpha : 1;
    var colorWithAlpha = _extends({}, parsedColor, {
      alpha: guard(0, 1, +(alpha * 100 - parseFloat(amount) * 100).toFixed(2) / 100)
    });
    return rgba(colorWithAlpha);
  }
  curry(transparentize);
  function size(height, width) {
    if (width === void 0) {
      width = height;
    }
    return {
      height,
      width
    };
  }
  const akarIconsMiniplayer = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, children: [
    /* @__PURE__ */ jsx$1("rect", { width: 20, height: 16, x: 2, y: 4, rx: 2 }),
    /* @__PURE__ */ jsx$1("rect", { width: 9, height: 7, x: 13, y: 13, rx: 2 })
  ] }) });
  const ForwardRef$y = React.forwardRef(akarIconsMiniplayer);
  const eosIconsBackgroundTasks = (props, ref) => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: [
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M6 3h8.99v1.5H6zM2.99 6h1.5v1.5h-1.5zm0-3h1.5v1.5h-1.5zm0 6.01H4.5v1.5H2.99z" }),
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M4.5 12h-3V1.49h15V6H18V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v9.48a2 2 0 0 0 2 2h2.5Z" }),
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M22 7.5H8a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h5.53v1.53H12V24h6v-1.49h-1.5V21H22a2 2 0 0 0 2-2V9.5a2 2 0 0 0-2-2m.51 12h-15V9h15Z" })
  ] });
  const ForwardRef$x = React.forwardRef(eosIconsBackgroundTasks);
  const riFullscreenFill = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M16 3h6v6h-2V5h-4zM2 3h6v2H4v4H2zm18 16v-4h2v6h-6v-2zM4 19h4v2H2v-6h2z" }) });
  const ForwardRef$w = React.forwardRef(riFullscreenFill);
  const materialSymbolsLightOpenInNewOff = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "m19.833 21.26l-1.298-1.298q-.096.019-.173.029q-.077.009-.173.009H5.616q-.691 0-1.153-.462T4 18.384V5.813q0-.096.01-.173t.029-.173l-1.299-1.3l.713-.713l17.092 17.092zM5.616 19h11.957l-5.933-5.933l-1.902 1.902l-.707-.708l1.902-1.902L5 6.427v11.958q0 .23.192.423t.423.192M7.813 5l-1-1h4.419v1zm5.948 5.948l-.708-.707L18.292 5H14V4h6v6h-1V5.708zm6.24 6.24l-1-1V12.77h1z" }) });
  const ForwardRef$v = React.forwardRef(materialSymbolsLightOpenInNewOff);
  const STAT_NUMBER_FALLBACK = "0";
  var QueryKey = ((QueryKey2) => {
    QueryKey2["PlayerScreenMode"] = `${APP_SHORT_PREFIX}-player-screen-mode`;
    QueryKey2["ForceAutoPlay"] = `${APP_SHORT_PREFIX}-force-auto-play`;
    return QueryKey2;
  })(QueryKey || {});
  var PlayerScreenMode = /* @__PURE__ */ ((PlayerScreenMode2) => {
    PlayerScreenMode2["Normal"] = "normal";
    PlayerScreenMode2["Wide"] = "wide";
    PlayerScreenMode2["WebFullscreen"] = "web";
    PlayerScreenMode2["Fullscreen"] = "full";
    return PlayerScreenMode2;
  })(PlayerScreenMode || {});
  var ForceAutoPlay = /* @__PURE__ */ ((ForceAutoPlay2) => {
    ForceAutoPlay2["ON"] = "on";
    ForceAutoPlay2["OFF"] = "off";
    return ForceAutoPlay2;
  })(ForceAutoPlay || {});
  var VideoLinkOpenMode = /* @__PURE__ */ ((VideoLinkOpenMode2) => {
    VideoLinkOpenMode2["Normal"] = "Normal";
    VideoLinkOpenMode2["CurrentPage"] = "CurrentPage";
    VideoLinkOpenMode2["NormalWebFullscreen"] = "NormalWebFullscreen";
    VideoLinkOpenMode2["Popup"] = "Popup";
    VideoLinkOpenMode2["Background"] = "Background";
    VideoLinkOpenMode2["Iina"] = "Iina";
    return VideoLinkOpenMode2;
  })(VideoLinkOpenMode || {});
  const VideoLinkOpenModeKey = Object.entries(VideoLinkOpenMode).reduce((record, [key, value]) => {
    return {
      ...record,
      [value]: `LinkOpenMode.${key}`
    };
  }, {});
  const VideoLinkOpenModeConfig = {
    [
      "Normal"
      /* Normal */
    ]: {
      icon: /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { ...size(16) }),
      label: "打开",
      desc: "默认在新标签页中打开"
    },
    [
      "CurrentPage"
      /* CurrentPage */
    ]: {
      icon: /* @__PURE__ */ jsx$1(ForwardRef$v, { ...size(16) }),
      label: "当前页中打开",
      desc: "不打开新标签页, 使用当前标签页打开, 适用于将网站作为应用安装场景"
    },
    [
      "NormalWebFullscreen"
      /* NormalWebFullscreen */
    ]: {
      icon: /* @__PURE__ */ jsx$1(ForwardRef$w, { ...size(15) }),
      label: "打开-网页全屏",
      desc: /* @__PURE__ */ jsx$1(Fragment, { children: "默认在新标签页中打开, 打开后自动网页全屏" })
    },
    [
      "Popup"
      /* Popup */
    ]: {
      icon: /* @__PURE__ */ jsx$1(ForwardRef$y, { ...size(15) }),
      label: "小窗打开",
      desc: /* @__PURE__ */ jsxs(Fragment, { children: [
        "当",
        " ",
        /* @__PURE__ */ jsx$1("a", { href: "https://developer.chrome.com/docs/web-platform/document-picture-in-picture", target: "_blank", children: "画中画窗口 API" }),
        " ",
        "可用时, 会使用画中画窗口的形式: 窗口置顶 + 播放页网页全屏.",
        /* @__PURE__ */ jsx$1("br", {}),
        "当该 API 不可用时, 会使用 popup window + 播放页网页全屏 的形式."
      ] })
    },
    [
      "Background"
      /* Background */
    ]: {
      icon: /* @__PURE__ */ jsx$1(ForwardRef$x, { ...size(15) }),
      label: "后台打开"
    },
    [
      "Iina"
      /* Iina */
    ]: {
      icon: /* @__PURE__ */ jsx$1(IconForPlayer, { ...size(15) }),
      label: "在 IINA 中打开",
      enabled: isMac,
      desc: /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsx$1("a", { href: "https://github.com/magicdawn/bilibili-gate/blob/main/notes/iina.md", target: "_blank", children: "macOS IINA 设置教程" }) })
    }
  };
  const defaultEmitter = mitt();
  function copyContent(content) {
    GM.setClipboard(content);
    antMessage.success(`已复制: ${content}`);
  }
  var EAppApiDevice = /* @__PURE__ */ ((EAppApiDevice2) => {
    EAppApiDevice2["android"] = "android";
    EAppApiDevice2["ipad"] = "ipad";
    return EAppApiDevice2;
  })(EAppApiDevice || {});
  var EApiType = /* @__PURE__ */ ((EApiType2) => {
    EApiType2["Separator"] = "separator";
    EApiType2["AppRecommend"] = "app-recommend";
    EApiType2["PcRecommend"] = "pc-recommend";
    EApiType2["DynamicFeed"] = "dynamic-feed";
    EApiType2["Watchlater"] = "watchlater";
    EApiType2["Fav"] = "fav";
    EApiType2["PopularGeneral"] = "popular-general";
    EApiType2["PopularWeekly"] = "popular-weekly";
    EApiType2["Ranking"] = "ranking";
    EApiType2["Live"] = "live";
    return EApiType2;
  })(EApiType || {});
  function getPaths(obj, parentPath = "", result = []) {
    if (parentPath) {
      result.push(parentPath);
    }
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      result.push(currentPath);
      if (value && typeof value === "object" && !Array.isArray(value) && // 如果是数组，不再递归处理
      !(value instanceof Date) && !(value instanceof RegExp)) {
        getPaths(value, currentPath, result);
      }
    }
    return [...new Set(result)];
  }
  function getObjectPaths(obj, parentPath = "") {
    const result = [];
    if (parentPath) {
      result.push(parentPath);
    }
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof RegExp) && Object.getPrototypeOf(value) === Object.prototype) {
        result.push(currentPath);
        result.push(...getObjectPaths(value, currentPath));
      }
    }
    return [...new Set(result)];
  }
  function getLeafPaths(obj) {
    const allPaths = getPaths(obj);
    const objPaths = getObjectPaths(obj);
    return allPaths.filter((p) => !objPaths.includes(p));
  }
  const appColorPrimaryId = "--bilibili-gate--color-primary";
  const appBorderColorId = "--bilibili-gate--border-color";
  const appCustomFontFamilyId = "--bilibili-gate--custom-font-family";
  const appVideoCardBorderRadiusId = "--bilibili-gate--video-card--border-radius";
  const appBgId = "--bilibili-gate--bg";
  const appBgLv1Id = "--bilibili-gate--bg--lv1";
  const appBgLv2Id = "--bilibili-gate--bg--lv2";
  const appBgLv3Id = "--bilibili-gate--bg--lv3";
  const biliPink = "#ff6699";
  const appCustomFontFamily = '"Alibaba PuHuiTi 3.0", "PingFang SC", HarmonyOS_Regular, "Helvetica Neue", "Microsoft YaHei", sans-serif';
  const appUsingFont = "var(--custom-font-family--options--font-family, var(--bilibili-gate--custom-font-family))";
  const appClsRoot = "bilibili-gate-root";
  const appClsDark = "bilibili-gate-dark";
  const appClsDarkSelector = "html.bilibili-gate-dark";
  const appClsColorPrimary = "bilibili-gate-color-primary";
  const cssVars = {
    appColorPrimaryId,
    appBorderColorId,
    appCustomFontFamilyId,
    appVideoCardBorderRadiusId,
    appBgId,
    appBgLv1Id,
    appBgLv2Id,
    appBgLv3Id,
    biliPink,
    appCustomFontFamily,
    appUsingFont,
    appClsRoot,
    appClsDark,
    appClsDarkSelector,
    appClsColorPrimary
  };
  const debug$d = baseDebug.extend("components:css-vars");
  debug$d(":export = %O", cssVars);
  const cssVar = (id) => {
    if (!id.startsWith("--")) id = `--${id}`;
    return `var(${id})`;
  };
  const colorPrimaryValue = cssVar(cssVars.appColorPrimaryId);
  const borderColorValue = cssVar(cssVars.appBorderColorId);
  const videoCardBorderRadiusValue = cssVar(cssVars.appVideoCardBorderRadiusId);
  const bgValue = cssVar(cssVars.appBgId);
  const bgLv1Value = cssVar(cssVars.appBgLv1Id);
  const bgLv2Value = cssVar(cssVars.appBgLv2Id);
  const bgLv3Value = cssVar(cssVars.appBgLv3Id);
  function insertWithoutScoping(cache2, serialized) {
    if (cache2.inserted[serialized.name] === void 0) {
      return cache2.insert("", serialized, cache2.sheet, true);
    }
  }
  function merge(registered, css2, className) {
    var registeredStyles = [];
    var rawClassName = getRegisteredStyles(registered, registeredStyles, className);
    if (registeredStyles.length < 2) {
      return className;
    }
    return rawClassName + css2(registeredStyles);
  }
  var createEmotion = function createEmotion2(options) {
    var cache2 = createCache(options);
    cache2.sheet.speedy = function(value) {
      this.isSpeedy = value;
    };
    cache2.compat = true;
    var css2 = function css3() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var serialized = serializeStyles(args, cache2.registered, void 0);
      insertStyles(cache2, serialized, false);
      return cache2.key + "-" + serialized.name;
    };
    var keyframes = function keyframes2() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var serialized = serializeStyles(args, cache2.registered);
      var animation = "animation-" + serialized.name;
      insertWithoutScoping(cache2, {
        name: serialized.name,
        styles: "@keyframes " + animation + "{" + serialized.styles + "}"
      });
      return animation;
    };
    var injectGlobal = function injectGlobal2() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      var serialized = serializeStyles(args, cache2.registered);
      insertWithoutScoping(cache2, serialized);
    };
    var cx = function cx2() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return merge(cache2.registered, css2, classnames(args));
    };
    return {
      css: css2,
      cx,
      injectGlobal,
      keyframes,
      hydrate: function hydrate(ids2) {
        ids2.forEach(function(key) {
          cache2.inserted[key] = true;
        });
      },
      flush: function flush() {
        cache2.registered = {};
        cache2.inserted = {};
        cache2.sheet.flush();
      },
      sheet: cache2.sheet,
      cache: cache2,
      getRegisteredStyles: getRegisteredStyles.bind(null, cache2.registered),
      merge: merge.bind(null, cache2.registered, css2)
    };
  };
  var classnames = function classnames2(args) {
    var cls = "";
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (arg == null) continue;
      var toAdd = void 0;
      switch (typeof arg) {
        case "boolean":
          break;
        case "object": {
          if (Array.isArray(arg)) {
            toAdd = classnames2(arg);
          } else {
            toAdd = "";
            for (var k in arg) {
              if (arg[k] && k) {
                toAdd && (toAdd += " ");
                toAdd += k;
              }
            }
          }
          break;
        }
        default: {
          toAdd = arg;
        }
      }
      if (toAdd) {
        cls && (cls += " ");
        cls += toAdd;
      }
    }
    return cls;
  };
  var _createEmotion = createEmotion({
    key: "css"
  }), css$1 = _createEmotion.css, cache$5 = _createEmotion.cache;
  const toastContainer = /* @__PURE__ */ css$1("position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);z-index:90000;padding:12px 24px;font-size:14px;min-width:200px;width:max-content;max-width:450px;color:#fff;background-color:#ffb243;background-color:", colorPrimaryValue, ";border-radius:6px;white-space:pre-wrap;", "");
  const singleLine = /* @__PURE__ */ css$1({
    name: "1azakc",
    styles: "text-align:center"
  });
  function toast(msg, duration2 = 2e3, container = document.body) {
    const div = document.createElement("div");
    div.classList.add(toastContainer, APP_CLS_ROOT);
    div.innerText = msg;
    if (!msg.includes("\n") && !msg.includes("<br")) {
      div.classList.add(singleLine);
    }
    container.appendChild(div);
    setTimeout(() => div.remove(), duration2);
  }
  function toastRequestFail() {
    return toast(REQUEST_FAIL_MSG);
  }
  function isDeepKey(key) {
    switch (typeof key) {
      case "number":
      case "symbol": {
        return false;
      }
      case "string": {
        return key.includes(".") || key.includes("[") || key.includes("]");
      }
    }
  }
  function toKey(value) {
    if (Object.is(value, -0)) {
      return "-0";
    }
    return value.toString();
  }
  function toPath(deepKey) {
    const result = [];
    const length2 = deepKey.length;
    if (length2 === 0) {
      return result;
    }
    let index = 0;
    let key = "";
    let quoteChar = "";
    let bracket = false;
    if (deepKey.charCodeAt(0) === 46) {
      result.push("");
      index++;
    }
    while (index < length2) {
      const char2 = deepKey[index];
      if (quoteChar) {
        if (char2 === "\\" && index + 1 < length2) {
          index++;
          key += deepKey[index];
        } else if (char2 === quoteChar) {
          quoteChar = "";
        } else {
          key += char2;
        }
      } else if (bracket) {
        if (char2 === '"' || char2 === "'") {
          quoteChar = char2;
        } else if (char2 === "]") {
          bracket = false;
          result.push(key);
          key = "";
        } else {
          key += char2;
        }
      } else {
        if (char2 === "[") {
          bracket = true;
          if (key) {
            result.push(key);
            key = "";
          }
        } else if (char2 === ".") {
          if (key) {
            result.push(key);
            key = "";
          }
        } else {
          key += char2;
        }
      }
      index++;
    }
    if (key) {
      result.push(key);
    }
    return result;
  }
  function get(object, path2, defaultValue2) {
    if (object == null) {
      return defaultValue2;
    }
    switch (typeof path2) {
      case "string": {
        const result = object[path2];
        if (result === void 0) {
          if (isDeepKey(path2)) {
            return get(object, toPath(path2), defaultValue2);
          } else {
            return defaultValue2;
          }
        }
        return result;
      }
      case "number":
      case "symbol": {
        if (typeof path2 === "number") {
          path2 = toKey(path2);
        }
        const result = object[path2];
        if (result === void 0) {
          return defaultValue2;
        }
        return result;
      }
      default: {
        if (Array.isArray(path2)) {
          return getWithPath(object, path2, defaultValue2);
        }
        if (Object.is(path2 == null ? void 0 : path2.valueOf(), -0)) {
          path2 = "-0";
        } else {
          path2 = String(path2);
        }
        const result = object[path2];
        if (result === void 0) {
          return defaultValue2;
        }
        return result;
      }
    }
  }
  function getWithPath(object, path2, defaultValue2) {
    if (path2.length === 0) {
      return defaultValue2;
    }
    let current = object;
    for (let index = 0; index < path2.length; index++) {
      if (current == null) {
        return defaultValue2;
      }
      current = current[path2[index]];
    }
    if (current === void 0) {
      return defaultValue2;
    }
    return current;
  }
  const IS_UNSIGNED_INTEGER = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length2 = Number.MAX_SAFE_INTEGER) {
    switch (typeof value) {
      case "number": {
        return Number.isInteger(value) && value >= 0 && value < length2;
      }
      case "symbol": {
        return false;
      }
      case "string": {
        return IS_UNSIGNED_INTEGER.test(value);
      }
    }
  }
  function isSymbol(value) {
    return typeof value === "symbol" || value instanceof Symbol;
  }
  function toNumber(value) {
    if (isSymbol(value)) {
      return NaN;
    }
    return Number(value);
  }
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === Infinity || value === -Infinity) {
      const sign = value < 0 ? -1 : 1;
      return sign * Number.MAX_VALUE;
    }
    return value === value ? value : 0;
  }
  function toInteger(value) {
    const finite = toFinite(value);
    const remainder = finite % 1;
    return remainder ? finite - remainder : finite;
  }
  function set(obj, path2, value) {
    const resolvedPath = Array.isArray(path2) ? path2 : typeof path2 === "string" ? toPath(path2) : [path2];
    let current = obj;
    for (let i = 0; i < resolvedPath.length - 1; i++) {
      const key = resolvedPath[i];
      const nextKey = resolvedPath[i + 1];
      if (current[key] == null) {
        current[key] = isIndex(nextKey) ? [] : {};
      }
      current = current[key];
    }
    const lastKey = resolvedPath[resolvedPath.length - 1];
    current[lastKey] = value;
    return obj;
  }
  function times(n, getValue) {
    n = toInteger(n);
    if (n < 1 || !Number.isSafeInteger(n)) {
      return [];
    }
    const result = new Array(n);
    for (let i = 0; i < n; i++) {
      result[i] = typeof getValue === "function" ? getValue(i) : i;
    }
    return result;
  }
  var msExports = requireMs();
  const ms = /* @__PURE__ */ getDefaultExportFromCjs(msExports);
  const genDate = () => dayjs().format("YYYY-MM-DD");
  function dailyCache(namespace) {
    async function cleanUp() {
      const date = genDate();
      const keys = await GM.listValues();
      keys.filter((k) => k.startsWith(namespace + ":") && k !== namespace + ":" + date).forEach((k) => GM.deleteValue(k));
    }
    cleanUp();
    return {
      async set(val) {
        cleanUp();
        await GM.setValue(namespace + ":" + genDate(), val);
      },
      async get() {
        cleanUp();
        return GM.getValue(namespace + ":" + genDate());
      }
    };
  }
  var md5$1 = { exports: {} };
  var crypt = { exports: {} };
  var hasRequiredCrypt;
  function requireCrypt() {
    if (hasRequiredCrypt) return crypt.exports;
    hasRequiredCrypt = 1;
    (function() {
      var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", crypt$1 = {
        // Bit-wise rotation left
        rotl: function(n, b) {
          return n << b | n >>> 32 - b;
        },
        // Bit-wise rotation right
        rotr: function(n, b) {
          return n << 32 - b | n >>> b;
        },
        // Swap big-endian to little-endian and vice versa
        endian: function(n) {
          if (n.constructor == Number) {
            return crypt$1.rotl(n, 8) & 16711935 | crypt$1.rotl(n, 24) & 4278255360;
          }
          for (var i = 0; i < n.length; i++)
            n[i] = crypt$1.endian(n[i]);
          return n;
        },
        // Generate an array of any length of random bytes
        randomBytes: function(n) {
          for (var bytes = []; n > 0; n--)
            bytes.push(Math.floor(Math.random() * 256));
          return bytes;
        },
        // Convert a byte array to big-endian 32-bit words
        bytesToWords: function(bytes) {
          for (var words2 = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
            words2[b >>> 5] |= bytes[i] << 24 - b % 32;
          return words2;
        },
        // Convert big-endian 32-bit words to a byte array
        wordsToBytes: function(words2) {
          for (var bytes = [], b = 0; b < words2.length * 32; b += 8)
            bytes.push(words2[b >>> 5] >>> 24 - b % 32 & 255);
          return bytes;
        },
        // Convert a byte array to a hex string
        bytesToHex: function(bytes) {
          for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 15).toString(16));
          }
          return hex.join("");
        },
        // Convert a hex string to a byte array
        hexToBytes: function(hex) {
          for (var bytes = [], c2 = 0; c2 < hex.length; c2 += 2)
            bytes.push(parseInt(hex.substr(c2, 2), 16));
          return bytes;
        },
        // Convert a byte array to a base-64 string
        bytesToBase64: function(bytes) {
          for (var base64 = [], i = 0; i < bytes.length; i += 3) {
            var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
            for (var j = 0; j < 4; j++)
              if (i * 8 + j * 6 <= bytes.length * 8)
                base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 63));
              else
                base64.push("=");
          }
          return base64.join("");
        },
        // Convert a base-64 string to a byte array
        base64ToBytes: function(base64) {
          base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");
          for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
            if (imod4 == 0) continue;
            bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
          }
          return bytes;
        }
      };
      crypt.exports = crypt$1;
    })();
    return crypt.exports;
  }
  var charenc_1;
  var hasRequiredCharenc;
  function requireCharenc() {
    if (hasRequiredCharenc) return charenc_1;
    hasRequiredCharenc = 1;
    var charenc = {
      // UTF-8 encoding
      utf8: {
        // Convert a string to a byte array
        stringToBytes: function(str) {
          return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
        },
        // Convert a byte array to a string
        bytesToString: function(bytes) {
          return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
        }
      },
      // Binary encoding
      bin: {
        // Convert a string to a byte array
        stringToBytes: function(str) {
          for (var bytes = [], i = 0; i < str.length; i++)
            bytes.push(str.charCodeAt(i) & 255);
          return bytes;
        },
        // Convert a byte array to a string
        bytesToString: function(bytes) {
          for (var str = [], i = 0; i < bytes.length; i++)
            str.push(String.fromCharCode(bytes[i]));
          return str.join("");
        }
      }
    };
    charenc_1 = charenc;
    return charenc_1;
  }
  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  var isBuffer_1;
  var hasRequiredIsBuffer;
  function requireIsBuffer() {
    if (hasRequiredIsBuffer) return isBuffer_1;
    hasRequiredIsBuffer = 1;
    isBuffer_1 = function(obj) {
      return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
    };
    function isBuffer(obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
    }
    function isSlowBuffer(obj) {
      return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
    }
    return isBuffer_1;
  }
  var hasRequiredMd5;
  function requireMd5() {
    if (hasRequiredMd5) return md5$1.exports;
    hasRequiredMd5 = 1;
    (function() {
      var crypt2 = requireCrypt(), utf8 = requireCharenc().utf8, isBuffer = requireIsBuffer(), bin = requireCharenc().bin, md52 = function(message2, options) {
        if (message2.constructor == String)
          if (options && options.encoding === "binary")
            message2 = bin.stringToBytes(message2);
          else
            message2 = utf8.stringToBytes(message2);
        else if (isBuffer(message2))
          message2 = Array.prototype.slice.call(message2, 0);
        else if (!Array.isArray(message2) && message2.constructor !== Uint8Array)
          message2 = message2.toString();
        var m = crypt2.bytesToWords(message2), l = message2.length * 8, a = 1732584193, b = -271733879, c2 = -1732584194, d2 = 271733878;
        for (var i = 0; i < m.length; i++) {
          m[i] = (m[i] << 8 | m[i] >>> 24) & 16711935 | (m[i] << 24 | m[i] >>> 8) & 4278255360;
        }
        m[l >>> 5] |= 128 << l % 32;
        m[(l + 64 >>> 9 << 4) + 14] = l;
        var FF = md52._ff, GG = md52._gg, HH = md52._hh, II = md52._ii;
        for (var i = 0; i < m.length; i += 16) {
          var aa = a, bb = b, cc = c2, dd = d2;
          a = FF(a, b, c2, d2, m[i + 0], 7, -680876936);
          d2 = FF(d2, a, b, c2, m[i + 1], 12, -389564586);
          c2 = FF(c2, d2, a, b, m[i + 2], 17, 606105819);
          b = FF(b, c2, d2, a, m[i + 3], 22, -1044525330);
          a = FF(a, b, c2, d2, m[i + 4], 7, -176418897);
          d2 = FF(d2, a, b, c2, m[i + 5], 12, 1200080426);
          c2 = FF(c2, d2, a, b, m[i + 6], 17, -1473231341);
          b = FF(b, c2, d2, a, m[i + 7], 22, -45705983);
          a = FF(a, b, c2, d2, m[i + 8], 7, 1770035416);
          d2 = FF(d2, a, b, c2, m[i + 9], 12, -1958414417);
          c2 = FF(c2, d2, a, b, m[i + 10], 17, -42063);
          b = FF(b, c2, d2, a, m[i + 11], 22, -1990404162);
          a = FF(a, b, c2, d2, m[i + 12], 7, 1804603682);
          d2 = FF(d2, a, b, c2, m[i + 13], 12, -40341101);
          c2 = FF(c2, d2, a, b, m[i + 14], 17, -1502002290);
          b = FF(b, c2, d2, a, m[i + 15], 22, 1236535329);
          a = GG(a, b, c2, d2, m[i + 1], 5, -165796510);
          d2 = GG(d2, a, b, c2, m[i + 6], 9, -1069501632);
          c2 = GG(c2, d2, a, b, m[i + 11], 14, 643717713);
          b = GG(b, c2, d2, a, m[i + 0], 20, -373897302);
          a = GG(a, b, c2, d2, m[i + 5], 5, -701558691);
          d2 = GG(d2, a, b, c2, m[i + 10], 9, 38016083);
          c2 = GG(c2, d2, a, b, m[i + 15], 14, -660478335);
          b = GG(b, c2, d2, a, m[i + 4], 20, -405537848);
          a = GG(a, b, c2, d2, m[i + 9], 5, 568446438);
          d2 = GG(d2, a, b, c2, m[i + 14], 9, -1019803690);
          c2 = GG(c2, d2, a, b, m[i + 3], 14, -187363961);
          b = GG(b, c2, d2, a, m[i + 8], 20, 1163531501);
          a = GG(a, b, c2, d2, m[i + 13], 5, -1444681467);
          d2 = GG(d2, a, b, c2, m[i + 2], 9, -51403784);
          c2 = GG(c2, d2, a, b, m[i + 7], 14, 1735328473);
          b = GG(b, c2, d2, a, m[i + 12], 20, -1926607734);
          a = HH(a, b, c2, d2, m[i + 5], 4, -378558);
          d2 = HH(d2, a, b, c2, m[i + 8], 11, -2022574463);
          c2 = HH(c2, d2, a, b, m[i + 11], 16, 1839030562);
          b = HH(b, c2, d2, a, m[i + 14], 23, -35309556);
          a = HH(a, b, c2, d2, m[i + 1], 4, -1530992060);
          d2 = HH(d2, a, b, c2, m[i + 4], 11, 1272893353);
          c2 = HH(c2, d2, a, b, m[i + 7], 16, -155497632);
          b = HH(b, c2, d2, a, m[i + 10], 23, -1094730640);
          a = HH(a, b, c2, d2, m[i + 13], 4, 681279174);
          d2 = HH(d2, a, b, c2, m[i + 0], 11, -358537222);
          c2 = HH(c2, d2, a, b, m[i + 3], 16, -722521979);
          b = HH(b, c2, d2, a, m[i + 6], 23, 76029189);
          a = HH(a, b, c2, d2, m[i + 9], 4, -640364487);
          d2 = HH(d2, a, b, c2, m[i + 12], 11, -421815835);
          c2 = HH(c2, d2, a, b, m[i + 15], 16, 530742520);
          b = HH(b, c2, d2, a, m[i + 2], 23, -995338651);
          a = II(a, b, c2, d2, m[i + 0], 6, -198630844);
          d2 = II(d2, a, b, c2, m[i + 7], 10, 1126891415);
          c2 = II(c2, d2, a, b, m[i + 14], 15, -1416354905);
          b = II(b, c2, d2, a, m[i + 5], 21, -57434055);
          a = II(a, b, c2, d2, m[i + 12], 6, 1700485571);
          d2 = II(d2, a, b, c2, m[i + 3], 10, -1894986606);
          c2 = II(c2, d2, a, b, m[i + 10], 15, -1051523);
          b = II(b, c2, d2, a, m[i + 1], 21, -2054922799);
          a = II(a, b, c2, d2, m[i + 8], 6, 1873313359);
          d2 = II(d2, a, b, c2, m[i + 15], 10, -30611744);
          c2 = II(c2, d2, a, b, m[i + 6], 15, -1560198380);
          b = II(b, c2, d2, a, m[i + 13], 21, 1309151649);
          a = II(a, b, c2, d2, m[i + 4], 6, -145523070);
          d2 = II(d2, a, b, c2, m[i + 11], 10, -1120210379);
          c2 = II(c2, d2, a, b, m[i + 2], 15, 718787259);
          b = II(b, c2, d2, a, m[i + 9], 21, -343485551);
          a = a + aa >>> 0;
          b = b + bb >>> 0;
          c2 = c2 + cc >>> 0;
          d2 = d2 + dd >>> 0;
        }
        return crypt2.endian([a, b, c2, d2]);
      };
      md52._ff = function(a, b, c2, d2, x, s, t) {
        var n = a + (b & c2 | ~b & d2) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md52._gg = function(a, b, c2, d2, x, s, t) {
        var n = a + (b & d2 | c2 & ~d2) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md52._hh = function(a, b, c2, d2, x, s, t) {
        var n = a + (b ^ c2 ^ d2) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md52._ii = function(a, b, c2, d2, x, s, t) {
        var n = a + (c2 ^ (b | ~d2)) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md52._blocksize = 16;
      md52._digestsize = 16;
      md5$1.exports = function(message2, options) {
        if (message2 === void 0 || message2 === null)
          throw new Error("Illegal argument " + message2);
        var digestbytes = crypt2.wordsToBytes(md52(message2, options));
        return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt2.bytesToHex(digestbytes);
      };
    })();
    return md5$1.exports;
  }
  var md5Exports = requireMd5();
  const md5 = /* @__PURE__ */ getDefaultExportFromCjs(md5Exports);
  const mixinKeyEncTab = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52];
  const getMixinKey = (orig) => mixinKeyEncTab.map((n) => orig[n]).join("").slice(0, 32);
  async function encWbi(_params) {
    const {
      img_key,
      sub_key
    } = await getWbiKeys();
    const mixin_key = getMixinKey(img_key + sub_key);
    const wts = Math.round(Date.now() / 1e3);
    const params = {
      ..._params,
      wts
    };
    const chr_filter = /[!'()*]/g;
    const query = Object.keys(params).sort().map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(
      // 过滤 value 中的 "!'()*" 字符
      params[key].toString().replace(chr_filter, "")
    )}`;
    }).join("&");
    const wbi_sign = md5(query + mixin_key);
    return {
      ...params,
      wts,
      w_rid: wbi_sign
    };
  }
  const keysCache = dailyCache("wbi-keys");
  async function getWbiKeys() {
    const cached = await keysCache.get();
    const shouldReuse = (cached == null ? void 0 : cached.val) && (cached == null ? void 0 : cached.ts) && Date.now() - cached.ts <= ms("6h");
    if (shouldReuse) {
      return cached.val;
    }
    const res = await axios.get("/x/web-interface/nav", {
      baseURL: HOST_API
    });
    const json = res.data;
    const img_url = json.data.wbi_img.img_url;
    const sub_url = json.data.wbi_img.sub_url;
    const keys = {
      img_key: img_url.slice(img_url.lastIndexOf("/") + 1, img_url.lastIndexOf(".")),
      sub_key: sub_url.slice(sub_url.lastIndexOf("/") + 1, sub_url.lastIndexOf("."))
    };
    keysCache.set({
      val: keys,
      ts: Date.now()
    });
    return keys;
  }
  function appSign(params, appkey2, appsec2) {
    params.appkey = appkey2;
    const searchParams2 = new URLSearchParams(params);
    searchParams2.sort();
    return md5(searchParams2.toString() + appsec2);
  }
  var isAbsoluteURL;
  var hasRequiredIsAbsoluteURL;
  function requireIsAbsoluteURL() {
    if (hasRequiredIsAbsoluteURL) return isAbsoluteURL;
    hasRequiredIsAbsoluteURL = 1;
    isAbsoluteURL = function isAbsoluteURL2(url) {
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };
    return isAbsoluteURL;
  }
  var combineURLs;
  var hasRequiredCombineURLs;
  function requireCombineURLs() {
    if (hasRequiredCombineURLs) return combineURLs;
    hasRequiredCombineURLs = 1;
    combineURLs = function combineURLs2(baseURL, relativeURL) {
      return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
    };
    return combineURLs;
  }
  var buildFullPath$1;
  var hasRequiredBuildFullPath;
  function requireBuildFullPath() {
    if (hasRequiredBuildFullPath) return buildFullPath$1;
    hasRequiredBuildFullPath = 1;
    var isAbsoluteURL2 = requireIsAbsoluteURL();
    var combineURLs2 = requireCombineURLs();
    buildFullPath$1 = function buildFullPath2(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL2(requestedURL)) {
        return combineURLs2(baseURL, requestedURL);
      }
      return requestedURL;
    };
    return buildFullPath$1;
  }
  var buildFullPathExports = requireBuildFullPath();
  const buildFullPath = /* @__PURE__ */ getDefaultExportFromCjs(buildFullPathExports);
  var bind;
  var hasRequiredBind;
  function requireBind() {
    if (hasRequiredBind) return bind;
    hasRequiredBind = 1;
    bind = function bind2(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };
    return bind;
  }
  var utils$1;
  var hasRequiredUtils;
  function requireUtils() {
    if (hasRequiredUtils) return utils$1;
    hasRequiredUtils = 1;
    var bind2 = requireBind();
    var toString2 = Object.prototype.toString;
    var kindOf = /* @__PURE__ */ function(cache2) {
      return function(thing) {
        var str = toString2.call(thing);
        return cache2[str] || (cache2[str] = str.slice(8, -1).toLowerCase());
      };
    }(/* @__PURE__ */ Object.create(null));
    function kindOfTest(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf(thing) === type;
      };
    }
    function isArray(val) {
      return Array.isArray(val);
    }
    function isUndefined(val) {
      return typeof val === "undefined";
    }
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === "function" && val.constructor.isBuffer(val);
    }
    var isArrayBuffer = kindOfTest("ArrayBuffer");
    function isArrayBufferView(val) {
      var result;
      if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
      } else {
        result = val && val.buffer && isArrayBuffer(val.buffer);
      }
      return result;
    }
    function isString2(val) {
      return typeof val === "string";
    }
    function isNumber2(val) {
      return typeof val === "number";
    }
    function isObject2(val) {
      return val !== null && typeof val === "object";
    }
    function isPlainObject2(val) {
      if (kindOf(val) !== "object") {
        return false;
      }
      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }
    var isDate = kindOfTest("Date");
    var isFile = kindOfTest("File");
    var isBlob = kindOfTest("Blob");
    var isFileList = kindOfTest("FileList");
    function isFunction2(val) {
      return toString2.call(val) === "[object Function]";
    }
    function isStream(val) {
      return isObject2(val) && isFunction2(val.pipe);
    }
    function isFormData(thing) {
      var pattern = "[object FormData]";
      return thing && (typeof FormData === "function" && thing instanceof FormData || toString2.call(thing) === pattern || isFunction2(thing.toString) && thing.toString() === pattern);
    }
    var isURLSearchParams = kindOfTest("URLSearchParams");
    function trim2(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    }
    function isStandardBrowserEnv() {
      if (typeof navigator !== "undefined" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS")) {
        return false;
      }
      return typeof window !== "undefined" && typeof document !== "undefined";
    }
    function forEach(obj, fn) {
      if (obj === null || typeof obj === "undefined") {
        return;
      }
      if (typeof obj !== "object") {
        obj = [obj];
      }
      if (isArray(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }
    function merge2() {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject2(result[key]) && isPlainObject2(val)) {
          result[key] = merge2(result[key], val);
        } else if (isPlainObject2(val)) {
          result[key] = merge2({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }
      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === "function") {
          a[key] = bind2(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }
    function stripBOM(content) {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    }
    function inherits(constructor, superConstructor, props, descriptors2) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }
    function toFlatObject(sourceObj, destObj, filter) {
      var props;
      var i;
      var prop;
      var merged = {};
      destObj = destObj || {};
      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
      return destObj;
    }
    function endsWith(str, searchString, position2) {
      str = String(str);
      if (position2 === void 0 || position2 > str.length) {
        position2 = str.length;
      }
      position2 -= searchString.length;
      var lastIndex = str.indexOf(searchString, position2);
      return lastIndex !== -1 && lastIndex === position2;
    }
    function toArray(thing) {
      if (!thing) return null;
      var i = thing.length;
      if (isUndefined(i)) return null;
      var arr2 = new Array(i);
      while (i-- > 0) {
        arr2[i] = thing[i];
      }
      return arr2;
    }
    var isTypedArray2 = /* @__PURE__ */ function(TypedArray) {
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    }(typeof Uint8Array !== "undefined" && Object.getPrototypeOf(Uint8Array));
    utils$1 = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString: isString2,
      isNumber: isNumber2,
      isObject: isObject2,
      isPlainObject: isPlainObject2,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isFunction: isFunction2,
      isStream,
      isURLSearchParams,
      isStandardBrowserEnv,
      forEach,
      merge: merge2,
      extend,
      trim: trim2,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      isTypedArray: isTypedArray2,
      isFileList
    };
    return utils$1;
  }
  var AxiosError_1;
  var hasRequiredAxiosError;
  function requireAxiosError() {
    if (hasRequiredAxiosError) return AxiosError_1;
    hasRequiredAxiosError = 1;
    var utils2 = requireUtils();
    function AxiosError2(message2, code, config, request2, response) {
      Error.call(this);
      this.message = message2;
      this.name = "AxiosError";
      code && (this.code = code);
      config && (this.config = config);
      request2 && (this.request = request2);
      response && (this.response = response);
    }
    utils2.inherits(AxiosError2, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });
    var prototype = AxiosError2.prototype;
    var descriptors2 = {};
    [
      "ERR_BAD_OPTION_VALUE",
      "ERR_BAD_OPTION",
      "ECONNABORTED",
      "ETIMEDOUT",
      "ERR_NETWORK",
      "ERR_FR_TOO_MANY_REDIRECTS",
      "ERR_DEPRECATED",
      "ERR_BAD_RESPONSE",
      "ERR_BAD_REQUEST",
      "ERR_CANCELED"
      // eslint-disable-next-line func-names
    ].forEach(function(code) {
      descriptors2[code] = { value: code };
    });
    Object.defineProperties(AxiosError2, descriptors2);
    Object.defineProperty(prototype, "isAxiosError", { value: true });
    AxiosError2.from = function(error, code, config, request2, response, customProps) {
      var axiosError = Object.create(prototype);
      utils2.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      });
      AxiosError2.call(axiosError, error.message, code, config, request2, response);
      axiosError.name = error.name;
      customProps && Object.assign(axiosError, customProps);
      return axiosError;
    };
    AxiosError_1 = AxiosError2;
    return AxiosError_1;
  }
  var settle$1;
  var hasRequiredSettle;
  function requireSettle() {
    if (hasRequiredSettle) return settle$1;
    hasRequiredSettle = 1;
    var AxiosError2 = requireAxiosError();
    settle$1 = function settle2(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError2(
          "Request failed with status code " + response.status,
          [AxiosError2.ERR_BAD_REQUEST, AxiosError2.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    };
    return settle$1;
  }
  var settleExports = requireSettle();
  const settle = /* @__PURE__ */ getDefaultExportFromCjs(settleExports);
  var buildURL$1;
  var hasRequiredBuildURL;
  function requireBuildURL() {
    if (hasRequiredBuildURL) return buildURL$1;
    hasRequiredBuildURL = 1;
    var utils2 = requireUtils();
    function encode(val) {
      return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    }
    buildURL$1 = function buildURL2(url, params, paramsSerializer) {
      if (!params) {
        return url;
      }
      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils2.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];
        utils2.forEach(params, function serialize2(val, key) {
          if (val === null || typeof val === "undefined") {
            return;
          }
          if (utils2.isArray(val)) {
            key = key + "[]";
          } else {
            val = [val];
          }
          utils2.forEach(val, function parseValue(v) {
            if (utils2.isDate(v)) {
              v = v.toISOString();
            } else if (utils2.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + "=" + encode(v));
          });
        });
        serializedParams = parts.join("&");
      }
      if (serializedParams) {
        var hashmarkIndex = url.indexOf("#");
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
      }
      return url;
    };
    return buildURL$1;
  }
  var buildURLExports = requireBuildURL();
  const buildURL = /* @__PURE__ */ getDefaultExportFromCjs(buildURLExports);
  var parseHeaders$1;
  var hasRequiredParseHeaders;
  function requireParseHeaders() {
    if (hasRequiredParseHeaders) return parseHeaders$1;
    hasRequiredParseHeaders = 1;
    var utils2 = requireUtils();
    var ignoreDuplicateOf = [
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent"
    ];
    parseHeaders$1 = function parseHeaders2(headers) {
      var parsed2 = {};
      var key;
      var val;
      var i;
      if (!headers) {
        return parsed2;
      }
      utils2.forEach(headers.split("\n"), function parser(line2) {
        i = line2.indexOf(":");
        key = utils2.trim(line2.substr(0, i)).toLowerCase();
        val = utils2.trim(line2.substr(i + 1));
        if (key) {
          if (parsed2[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === "set-cookie") {
            parsed2[key] = (parsed2[key] ? parsed2[key] : []).concat([val]);
          } else {
            parsed2[key] = parsed2[key] ? parsed2[key] + ", " + val : val;
          }
        }
      });
      return parsed2;
    };
    return parseHeaders$1;
  }
  var parseHeadersExports = requireParseHeaders();
  const parseHeaders = /* @__PURE__ */ getDefaultExportFromCjs(parseHeadersExports);
  var utilsExports = requireUtils();
  const utils = /* @__PURE__ */ getDefaultExportFromCjs(utilsExports);
  function xhrAdapter(config) {
    return new Promise((resolve, reject) => {
      let requestData = config.data;
      const requestHeaders = config.headers ?? {};
      if (utils.isFormData(requestData)) {
        delete requestHeaders["Content-Type"];
      }
      if (config.auth) {
        const username = config.auth.username || "";
        const password = config.auth.password || "";
        requestHeaders.Authorization = "Basic " + Buffer.from(username + ":" + password).toString("base64");
      }
      const onerror = function handleError() {
        reject(new axios.AxiosError("Network Error", axios.AxiosError.ERR_NETWORK, config));
      };
      const ontimeout = function handleTimeout() {
        reject(new axios.AxiosError("timeout of " + config.timeout + "ms exceeded", axios.AxiosError.ECONNABORTED, config));
      };
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === "undefined" && key.toLowerCase() === "content-type") {
          delete requestHeaders[key];
        }
      });
      if (requestData === void 0) {
        requestData = null;
      }
      const onload = function handleLoad(resp) {
        const responseHeaders = "responseHeaders" in resp ? parseHeaders(resp.responseHeaders) : {};
        const responseData = !config.responseType || config.responseType === "text" ? resp.responseText : resp.response;
        const response = {
          data: responseData,
          status: resp.status,
          statusText: resp.statusText,
          headers: responseHeaders,
          config,
          request: {
            // can't got real XMLHttpRequest object, only some property is available
            responseURL: resp.finalUrl,
            status: resp.status,
            statusText: resp.statusText,
            responseXML: null
          }
        };
        settle(resolve, reject, response);
      };
      if (config.cancelToken) {
        config.cancelToken.promise.then(function onCanceled(cancel) {
          reject(cancel);
        });
      }
      let responseType;
      if (config.responseType && config.responseType !== "json") {
        responseType = config.responseType;
      }
      const method = config.method.toUpperCase();
      if (method === "UNLINK" || method === "PURGE" || method === "LINK") {
        reject(new axios.AxiosError(`${method} is not a supported method by GM.xmlHttpRequest`));
      } else {
        GM.xmlHttpRequest({
          method,
          url: buildURL(buildFullPath(config.baseURL, config.url), config.params, config.paramsSerializer),
          headers: Object.fromEntries(Object.entries(requestHeaders).map(([key, val]) => [key, val.toString()])),
          responseType,
          data: requestData,
          timeout: config.timeout,
          ontimeout,
          onload,
          onerror
        });
      }
    });
  }
  const request = axios.create({
    baseURL: HOST_API,
    withCredentials: true
  });
  request.interceptors.request.use(async function(config) {
    var _a2;
    config.params || (config.params = {});
    if (((_a2 = config.url) == null ? void 0 : _a2.includes("/wbi/")) && !(config.params.w_rid || config.params.wts)) {
      config.params = await encWbi(config.params);
    }
    return config;
  });
  function isWebApiSuccess(json) {
    return (json == null ? void 0 : json.code) === 0 && ((json == null ? void 0 : json.message) === "0" || (json == null ? void 0 : json.message) === "success");
  }
  const gmrequest = axios.create({
    // @ts-ignore
    adapter: xhrAdapter
  });
  const appkey = TVKeyInfo.appkey;
  const appsec = TVKeyInfo.appsec;
  gmrequest.interceptors.request.use(function(config) {
    config.params = {
      appkey,
      access_key: settings.accessKey || "",
      ...config.params
    };
    config.params.sign = appSign(config.params, appkey, appsec);
    return config;
  });
  gmrequest.interceptors.response.use((res) => {
    if (res.config.responseType === "json" && res.data && res.data instanceof ArrayBuffer) {
      const decoder = new TextDecoder();
      const u8arr = new Uint8Array(res.data);
      const text = decoder.decode(u8arr);
      res.data = text;
      try {
        res.data = JSON.parse(text);
      } catch (e) {
      }
    }
    return res;
  });
  function parseCookie() {
    const cookies = {};
    document.cookie.split(";").map((pair) => pair.trim()).filter(Boolean).forEach((pair) => {
      const [key, val] = pair.split("=").map((s) => s.trim()).filter(Boolean);
      if (!key) return;
      cookies[key] = val;
    });
    return cookies;
  }
  function getCsrfToken() {
    const csrfToken = parseCookie().bili_jct;
    if (!csrfToken) {
      toast("找不到 csrf token, 请检查是否登录");
      throw new Error("找不到 csrf token, 请检查是否登录");
    }
    return csrfToken;
  }
  function getUid() {
    return parseCookie().DedeUserID;
  }
  function getHasLogined() {
    const cookies = parseCookie();
    return !!cookies.DedeUserID;
  }
  const loginState = proxy({
    cookie: document.cookie,
    logined: getHasLogined()
  });
  function checkLoginStatus() {
    Object.assign(loginState, {
      cookie: document.cookie,
      logined: getHasLogined()
    });
    return loginState.logined;
  }
  function useHasLogined() {
    return useSnapshot(loginState).logined;
  }
  async function listAll() {
    var _a2;
    const json = (await request.get("https://member.bilibili.com/x/web/draft/list")).data;
    const drafts = ((_a2 = json.artlist) == null ? void 0 : _a2.drafts) || [];
    return drafts;
  }
  async function addupdate(payload) {
    var _a2, _b2;
    const form = new URLSearchParams({
      title: "",
      banner_url: "",
      content: "",
      summary: "",
      words: "0",
      category: "15",
      tid: "0",
      reprint: "0",
      tags: "",
      image_urls: "",
      origin_image_urls: "",
      dynamic_intro: "",
      media_id: "0",
      spoiler: "0",
      original: "0",
      top_video_bvid: "",
      aid: "",
      csrf: getCsrfToken(),
      ...payload
    });
    const json = (await request.post("/x/article/creative/draft/addupdate", form)).data;
    const aid = (_b2 = (_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.aid) == null ? void 0 : _b2.toString();
    const success = isWebApiSuccess(json);
    if (!success) {
      toast(json.message || "addupdate error");
    }
    return {
      success,
      aid
    };
  }
  async function draftView(aid) {
    var _a2;
    const json = (await request.get("/x/article/creative/draft/view", {
      params: {
        aid
      }
    })).data;
    return ((_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.content) || "";
  }
  class BilibiliArticleDraft {
    constructor(title) {
      __publicField(this, "title");
      __publicField(this, "getData", async () => {
        const {
          title
        } = this;
        const allDrafts = await listAll();
        const draft = allDrafts.find((d2) => d2.title === title);
        if (!draft) {
          await addupdate({
            title
          });
          return;
        }
        const content = await draftView(draft.id);
        const parser = new DOMParser();
        const parsed2 = parser.parseFromString(content, "text/html");
        const text = (parsed2.body.textContent || "").trim();
        if (!text) return;
        try {
          return JSON.parse(text);
        } catch (e) {
          return;
        }
      });
      // cache aid for setData
      // a refresh is needed after manual delete article draft by bilibili dashboard
      __publicField(this, "_aid");
      __publicField(this, "setData", async (data2) => {
        const {
          title
        } = this;
        if (!this._aid) {
          const allDrafts = await listAll();
          const draft = allDrafts.find((d2) => d2.title === title);
          if (!draft) {
            const {
              success: success2,
              aid: newDraftAid
            } = await addupdate({
              title
            });
            if (!success2) return false;
            this._aid = newDraftAid;
          } else {
            this._aid = draft.id.toString();
          }
        }
        const dataStr = JSON.stringify(data2);
        const {
          success
        } = await addupdate({
          aid: this._aid,
          title,
          content: `<p>${dataStr}</p>`,
          words: dataStr.length.toString()
        });
        return success;
      });
      this.title = title;
    }
  }
  const debug$c = baseDebug.extend("settings");
  const articleDraft = new BilibiliArticleDraft(APP_NAME);
  const privateKeys = ["accessKey", "accessKeyExpireAt"];
  const getBackupOmitPaths = () => [
    ...privateKeys,
    ...internalBooleanPaths,
    // the flag
    "backupSettingsToArticleDraft",
    // 无关紧要
    "fav.addSeparator",
    "watchlaterUseShuffle",
    "watchlaterAddSeparator",
    "popularWeeklyUseShuffle",
    "popularGeneralUseAnonymous"
  ];
  const restoreOmitPaths = [
    ...privateKeys,
    // the flag
    "backupSettingsToArticleDraft"
  ];
  let HAS_RESTORED_SETTINGS = false;
  function set_HAS_RESTORED_SETTINGS(val) {
    HAS_RESTORED_SETTINGS = val;
  }
  let lastBackupVal;
  const setDataThrottled = throttle$1(articleDraft.setData, ms("5s"));
  async function saveToDraft(val) {
    if (!val.backupSettingsToArticleDraft) return;
    if (HAS_RESTORED_SETTINGS) return;
    const {
      pickedSettings: currentBackupVal
    } = pickSettings(val, allowedLeafSettingsPaths, getBackupOmitPaths());
    const shouldBackup = !lastBackupVal || !isEqual$2(lastBackupVal, currentBackupVal);
    if (!shouldBackup) return;
    try {
      await setDataThrottled(currentBackupVal);
      lastBackupVal = currentBackupVal;
      debug$c("backup to article draft complete");
    } catch (e) {
      console.error(e.stack || e);
    }
  }
  const debug$b = baseDebug.extend("settings");
  const initialSettings = {
    accessKey: "",
    accessKeyExpireAt: 0,
    // 窄屏模式
    useNarrowMode: false,
    // 全屏模式
    // @history
    //  - 2024-03-18 bili-feed4 以前的内测首页现在是默认首页, 这里更名为全屏模式, 默认为 true
    pureRecommend: true,
    /**
     * tab = app-recommend
     */
    appRecommend: {
      deviceParamForApi: EAppApiDevice.ipad,
      addOtherTabContents: false
      // this flag will results MUCH more requests
    },
    /**
     * 查看更多, aka ModalFeed
     */
    // 自动查看更多
    showModalFeedOnLoad: false,
    // "查看更多" 按钮
    showModalFeedEntry: false,
    // ModalFeed.全屏
    modalFeedFullScreen: false,
    /**
     * Video Card
     */
    // 自动开始预览: 按键选择
    autoPreviewWhenKeyboardSelect: false,
    // 自动开始预览: 鼠标悬浮; 不再跟随鼠标位置, 默认: 跟随鼠标
    autoPreviewWhenHover: true,
    // 自动预览: 连续式进度条 跳跃式进度条
    autoPreviewUseContinuousProgress: true,
    // 自动预览: 更新间隔
    // 跳跃式(400) 连续式(700)
    autoPreviewUpdateInterval: 700,
    // hover 延时
    useDelayForHover: false,
    // 从预览处开始播放视频
    // /video/BVID/?t=start
    startPlayFromPreviewPoint: false,
    /**
     * tab=dynamic-feed
     */
    dynamicFeed: {
      showLive: true,
      // 在动态中显示直播
      followGroup: {
        enabled: true,
        // 下拉筛选支持 - 关注分组
        forceUseMergeTimelineIds: []
      },
      whenViewAll: {
        enableHideSomeContents: false,
        // 在「全部」动态中隐藏 UP 的动态 & 在「全部」动态中隐藏此分组的动态
        hideIds: []
        // `up:${mid}` | `follow-group:${id}`
      },
      advancedSearch: false,
      __internal: {
        cacheAllItemsEntry: false,
        cacheAllItemsUpMids: [],
        // enable for these up
        addCopyBvidButton: false,
        externalSearchInput: false
        // more convenient
      }
    },
    /**
     * tab=watchlater
     */
    watchlaterUseShuffle: false,
    // 打乱顺序
    watchlaterAddSeparator: true,
    // 添加 "近期" / "更早" 分割线
    watchlaterNormalOrderSortByAddAtAsc: false,
    /**
     * tab=fav
     */
    fav: {
      // useShuffle: false, // 打乱顺序
      addSeparator: true,
      // 收藏夹分割线
      excludedFolderIds: []
      // 忽略的收藏夹
    },
    /**
     * tab=popular-general
     */
    popularGeneralUseAnonymous: false,
    // without credentials
    /**
     * tab=popular-weekly
     */
    popularWeeklyUseShuffle: false,
    // shuffle
    /**
     * tab=live
     */
    /**
     * 过滤器模块
     */
    filter: {
      enabled: true,
      // 最少播放量
      minPlayCount: {
        enabled: false,
        value: 1e4
      },
      // 时长
      minDuration: {
        enabled: false,
        value: 60
        // 60s
      },
      // 已关注豁免
      exemptForFollowed: {
        video: true,
        // 图文也是有 rcmd_reason = '已关注' 的
        picture: true
      },
      // filter out goto = 'picture' | 'bangumi'
      hideGotoTypePicture: false,
      hideGotoTypeBangumi: false,
      byAuthor: {
        enabled: false,
        keywords: []
      },
      byTitle: {
        enabled: false,
        keywords: []
      }
    },
    /**
     * 外观
     */
    style: {
      general: {
        // video-source-tab 高度: true 高; false compact;
        videoSourceTabStandardHeight: true,
        popoverBorderColorUseColorPrimary: false
      },
      pureRecommend: {
        // sticky tabbar
        useStickyTabbar: true,
        // custom grid | default grid
        useCustomGrid: true,
        // bg1
        useWhiteBackground: true,
        // 隐藏顶部分区
        hideTopChannel: false
      },
      videoCard: {
        // 使用卡片模式
        // inspired by https://ai.taobao.com
        useBorder: true,
        useBorderOnlyOnHover: true,
        useBoxShadow: false,
        usePadding: false
      }
    },
    /**
     * 颜色主题
     */
    theme: "",
    colorPickerThemeSelectedColor: "",
    // 自定义颜色
    /**
     * 功能
     */
    // 备份
    backupSettingsToArticleDraft: false,
    // 默认打开模式
    videoLinkOpenMode: VideoLinkOpenMode.Normal,
    // 小窗默认锁定
    pipWindowDefaultLocked: true,
    /**
     * 隐藏的 tab, 使用黑名单, 功能迭代之后新增的 tab, 默认开启.
     * 如果使用白名单, 新增的 tab 会被隐藏
     */
    hidingTabKeys: [ETab.KeepFollowOnly, ETab.Live],
    customTabKeysOrder: [],
    /**
     * internal
     */
    __internalEnableCopyBvidInfoContextMenu: false,
    __internalHotSubUseDropdown: false
  };
  const settings = proxy(cloneDeep(initialSettings));
  const allowedLeafSettingsPaths = getLeafPaths(initialSettings);
  const internalBooleanPaths = allowedLeafSettingsPaths.filter((p) => p.includes("__internal") && typeof get(initialSettings, p) === "boolean");
  debug$b("allowedLeafSettingsPaths = %O, internalBooleanPaths = %O", allowedLeafSettingsPaths, internalBooleanPaths);
  function useSettingsSnapshot() {
    return useSnapshot(settings);
  }
  function getSettingsSnapshot() {
    return snapshot(settings);
  }
  const storageKey = `settings`;
  function runSettingsMigration(val) {
    const config = [
      ["dynamicFeed.showLive", "dynamicFeedShowLive"],
      ["dynamicFeed.followGroup.enabled", "dynamicFeedFollowGroupEnabled"],
      ["dynamicFeed.followGroup.forceUseMergeTimelineIds", "dynamicFeedFollowGroupForceUseMergeTimelineIds"],
      ["dynamicFeed.whenViewAll.enableHideSomeContents", "dynamicFeedWhenViewAllEnableHideSomeContents"],
      ["dynamicFeed.whenViewAll.hideIds", "dynamicFeedWhenViewAllHideIds"],
      ["dynamicFeed.advancedSearch", "dynamicFeedAdvancedSearch"],
      // ['fav.useShuffle', 'favUseShuffle'],
      ["fav.addSeparator", "favAddSeparator"],
      ["fav.excludedFolderIds", "favExcludedFolderIds"],
      ["filter.enabled", "filterEnabled"],
      ["filter.minPlayCount.enabled", "filterMinPlayCountEnabled"],
      ["filter.minPlayCount.value", "filterMinPlayCount"],
      ["filter.minDuration.enabled", "filterMinDurationEnabled"],
      ["filter.minDuration.value", "filterMinDuration"],
      ["filter.exemptForFollowed.video", "exemptForFollowedVideo"],
      ["filter.exemptForFollowed.picture", "exemptForFollowedPicture"],
      ["filter.hideGotoTypePicture", "filterOutGotoTypePicture"],
      ["filter.hideGotoTypeBangumi", "filterOutGotoTypeBangumi"],
      ["filter.byAuthor.enabled", "filterByAuthorNameEnabled"],
      ["filter.byAuthor.keywords", "filterByAuthorNameKeywords"],
      ["filter.byTitle.enabled", "filterByTitleEnabled"],
      ["filter.byTitle.keywords", "filterByTitleKeywords"],
      ["style.general.videoSourceTabStandardHeight", "styleUseStandardVideoSourceTab"],
      ["style.pureRecommend.useStickyTabbar", "styleUseStickyTabbarInPureRecommend"],
      ["style.pureRecommend.useCustomGrid", "styleUseCustomGrid"],
      ["style.pureRecommend.useWhiteBackground", "styleUseWhiteBackground"],
      ["style.pureRecommend.hideTopChannel", "styleHideTopChannel"],
      ["style.videoCard.useBorder", "styleUseCardBorder"],
      ["style.videoCard.useBorderOnlyOnHover", "styleUseCardBorderOnlyOnHover"],
      ["style.videoCard.useBoxShadow", "styleUseCardBoxShadow"],
      ["style.videoCard.usePadding", "styleUseCardPadding"],
      // 2024-12-17
      ["appRecommend.deviceParamForApi", "appApiDecice"]
    ];
    for (const [configPath, legacyConfigPath] of config) {
      const haveValue = (v) => !isNil(v);
      if (haveValue(get(val, configPath))) {
        continue;
      }
      if (!haveValue(get(val, legacyConfigPath))) {
        continue;
      }
      set(val, configPath, get(val, legacyConfigPath));
    }
  }
  async function __pickSettingsFromGmStorage() {
    const saved = await GM.getValue(storageKey);
    if (!saved || typeof saved !== "object") return {};
    runSettingsMigration(saved);
    return pickSettings(saved, allowedLeafSettingsPaths).pickedSettings;
  }
  async function loadAndSetup() {
    const val = await __pickSettingsFromGmStorage();
    updateSettings(val);
    subscribe$3(settings, () => {
      _onSettingsChange();
    });
    reciveGmValueUpdatesFromOtherTab({
      storageKey,
      setPersist(val2) {
        _persist = val2;
      },
      onUpdate(newValue) {
        updateSettings(newValue);
      }
    });
  }
  async function _onSettingsChange() {
    const snap = cloneDeep(snapshot(settings));
    await _saveToGmStorage(snap);
    await saveToDraft(snap);
  }
  let _persist = true;
  async function _saveToGmStorage(snap) {
    if (!_persist) return;
    await GM.setValue(storageKey, snap);
  }
  function pickSettings(source, paths, omit2 = []) {
    const pickedSettings = {};
    const pickedPaths = paths.filter((p) => allowedLeafSettingsPaths.includes(p) && !omit2.includes(p) && !isNil(get(source, p)));
    pickedPaths.forEach((p) => {
      const v = get(source, p);
      set(pickedSettings, p, v);
    });
    return {
      pickedPaths,
      pickedSettings
    };
  }
  function updateSettings(payload) {
    const {
      pickedPaths
    } = pickSettings(payload, allowedLeafSettingsPaths);
    for (const p of pickedPaths) {
      const v = get(payload, p);
      set(settings, p, v);
    }
  }
  function resetSettings() {
    return updateSettings(initialSettings);
  }
  async function getNewestValueOfSettingsInnerArray(path2) {
    const newest = await __pickSettingsFromGmStorage();
    return get(newest, path2) || get(getSettingsSnapshot(), path2);
  }
  function setSettingsInnerArray(path2, value) {
    set(settings, path2, value);
  }
  async function updateSettingsInnerArray(path2, {
    add: add2,
    remove
  }) {
    const arr2 = await getNewestValueOfSettingsInnerArray(path2);
    const s = new Set(arr2);
    for (const x of add2 ?? []) s.add(x);
    for (const x of remove ?? []) s.delete(x);
    setSettingsInnerArray(path2, Array.from(s));
  }
  await( loadAndSetup());
  if (IN_BILIBILI_HOMEPAGE && settings.accessKey && settings.accessKeyExpireAt && Date.now() >= settings.accessKeyExpireAt) {
    toast("access_key 已过期, 请重新获取 !!!");
  }
  const debug$a = baseDebug.extend("utility:dom");
  const DEFAULT_POLL_TIMEOUT = 10 * 1e3;
  const DEFAULT_POLL_INTERVAL = 200;
  async function poll$1(fn, options) {
    const interval = (options == null ? void 0 : options.interval) ?? DEFAULT_POLL_INTERVAL;
    let timeout = (options == null ? void 0 : options.timeout) ?? DEFAULT_POLL_TIMEOUT;
    if (timeout === 0) timeout = Infinity;
    const validate = (options == null ? void 0 : options.validate) ?? ((val) => !isNil(val));
    const start = performance.now();
    let result = fn();
    while (!validate(result) && performance.now() - start < timeout) {
      await delay(interval);
      result = fn();
    }
    return result;
  }
  async function tryAction(selector, action2, moreOptions) {
    const pollTimeout = (moreOptions == null ? void 0 : moreOptions.pollTimeout) ?? DEFAULT_POLL_TIMEOUT;
    const pollInterval = (moreOptions == null ? void 0 : moreOptions.pollInterval) ?? DEFAULT_POLL_INTERVAL;
    const selectorPredicate = moreOptions == null ? void 0 : moreOptions.selectorPredicate;
    const warnOnTimeout = (moreOptions == null ? void 0 : moreOptions.warnOnTimeout) ?? false;
    const arr2 = await poll$1(() => {
      let arr22 = Array.from(document.querySelectorAll(selector));
      if (selectorPredicate) arr22 = arr22.filter(selectorPredicate);
      if (arr22.length) return arr22;
    }, {
      timeout: pollTimeout,
      interval: pollInterval
    });
    if (!(arr2 == null ? void 0 : arr2.length)) {
      debug$a("tryAction: timeout for selector = `%s`", selector);
      if (warnOnTimeout) {
        appWarn("tryAction timeout, selector = `%s`", selector);
      }
      return;
    }
    debug$a("tryAction: selector=`%s` count=%s", selector, arr2.length);
    for (const el of arr2) {
      await Promise.resolve(action2(el));
    }
  }
  async function tryToRemove(selector, selectorPredicate, delayMs) {
    return tryAction(selector, (el) => el.remove(), {
      selectorPredicate,
      warnOnTimeout: false
    });
  }
  function shouldDisableShortcut() {
    var _a2;
    const activeTagName = (((_a2 = document.activeElement) == null ? void 0 : _a2.tagName) || "").toLowerCase();
    if (["input", "textarea"].includes(activeTagName)) {
      return true;
    }
    if (document.querySelector(".center-search__bar.is-focus")) {
      return true;
    }
    return false;
  }
  function getElementOffset(el, rect) {
    rect ?? (rect = el.getBoundingClientRect());
    const docElem = document.documentElement;
    return {
      top: rect.top + window.scrollY - docElem.clientTop,
      left: rect.left + window.scrollX - docElem.clientLeft
    };
  }
  function whenIdle(options) {
    return new Promise((resolve) => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => resolve(), options);
      } else {
        setTimeout(resolve);
      }
    });
  }
  let ORIGINAL_TITLE = "";
  function setPageTitle(title) {
    if (!ORIGINAL_TITLE) {
      ORIGINAL_TITLE = document.title;
    }
    document.title = `${title} - ${ORIGINAL_TITLE}`;
  }
  var createUpdateEffect = function(hook) {
    return function(effect, deps) {
      var isMounted = React.useRef(false);
      hook(function() {
        return function() {
          isMounted.current = false;
        };
      }, []);
      hook(function() {
        if (!isMounted.current) {
          isMounted.current = true;
        } else {
          return effect();
        }
      }, deps);
    };
  };
  var __assign = function() {
    __assign = Object.assign || function __assign2(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r2, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r2 = i.next()).done) ar.push(r2.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r2 && !r2.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from2, pack) {
    if (arguments.length === 2) for (var i = 0, l = from2.length, ar; i < l; i++) {
      if (ar || !(i in from2)) {
        if (!ar) ar = Array.prototype.slice.call(from2, 0, i);
        ar[i] = from2[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from2));
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message2) {
    var e = new Error(message2);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  var isFunction$2 = function(value) {
    return typeof value === "function";
  };
  var isString = function(value) {
    return typeof value === "string";
  };
  var isNumber = function(value) {
    return typeof value === "number";
  };
  function useMemoizedFn(fn) {
    var fnRef = React.useRef(fn);
    fnRef.current = React.useMemo(function() {
      return fn;
    }, [fn]);
    var memoizedFn = React.useRef();
    if (!memoizedFn.current) {
      memoizedFn.current = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return fnRef.current.apply(this, args);
      };
    }
    return memoizedFn.current;
  }
  const useUpdateEffect = createUpdateEffect(React.useEffect);
  var useAutoRunPlugin = function(fetchInstance, _a2) {
    var manual = _a2.manual, _b2 = _a2.ready, ready = _b2 === void 0 ? true : _b2, _c2 = _a2.defaultParams, defaultParams = _c2 === void 0 ? [] : _c2, _d = _a2.refreshDeps, refreshDeps = _d === void 0 ? [] : _d, refreshDepsAction = _a2.refreshDepsAction;
    var hasAutoRun = React.useRef(false);
    hasAutoRun.current = false;
    useUpdateEffect(function() {
      if (!manual && ready) {
        hasAutoRun.current = true;
        fetchInstance.run.apply(fetchInstance, __spreadArray([], __read(defaultParams), false));
      }
    }, [ready]);
    useUpdateEffect(function() {
      if (hasAutoRun.current) {
        return;
      }
      if (!manual) {
        hasAutoRun.current = true;
        if (refreshDepsAction) {
          refreshDepsAction();
        } else {
          fetchInstance.refresh();
        }
      }
    }, __spreadArray([], __read(refreshDeps), false));
    return {
      onBefore: function() {
        if (!ready) {
          return {
            stopNow: true
          };
        }
      }
    };
  };
  useAutoRunPlugin.onInit = function(_a2) {
    var _b2 = _a2.ready, ready = _b2 === void 0 ? true : _b2, manual = _a2.manual;
    return {
      loading: !manual && ready
    };
  };
  function depsAreSame(oldDeps, deps) {
    if (oldDeps === deps) return true;
    for (var i = 0; i < oldDeps.length; i++) {
      if (!Object.is(oldDeps[i], deps[i])) return false;
    }
    return true;
  }
  function useCreation(factory, deps) {
    var current = React.useRef({
      deps,
      obj: void 0,
      initialized: false
    }).current;
    if (current.initialized === false || !depsAreSame(current.deps, deps)) {
      current.deps = deps;
      current.obj = factory();
      current.initialized = true;
    }
    return current.obj;
  }
  function useLatest(value) {
    var ref = React.useRef(value);
    ref.current = value;
    return ref;
  }
  var useUnmount = function(fn) {
    var fnRef = useLatest(fn);
    React.useEffect(function() {
      return function() {
        fnRef.current();
      };
    }, []);
  };
  var cache$4 = /* @__PURE__ */ new Map();
  var setCache = function(key, cacheTime, cachedData) {
    var currentCache = cache$4.get(key);
    if (currentCache === null || currentCache === void 0 ? void 0 : currentCache.timer) {
      clearTimeout(currentCache.timer);
    }
    var timer = void 0;
    if (cacheTime > -1) {
      timer = setTimeout(function() {
        cache$4.delete(key);
      }, cacheTime);
    }
    cache$4.set(key, __assign(__assign({}, cachedData), {
      timer
    }));
  };
  var getCache = function(key) {
    return cache$4.get(key);
  };
  var cachePromise = /* @__PURE__ */ new Map();
  var getCachePromise = function(cacheKey2) {
    return cachePromise.get(cacheKey2);
  };
  var setCachePromise = function(cacheKey2, promise) {
    cachePromise.set(cacheKey2, promise);
    promise.then(function(res) {
      cachePromise.delete(cacheKey2);
      return res;
    }).catch(function() {
      cachePromise.delete(cacheKey2);
    });
  };
  var listeners$2 = {};
  var trigger = function(key, data2) {
    if (listeners$2[key]) {
      listeners$2[key].forEach(function(item) {
        return item(data2);
      });
    }
  };
  var subscribe$2 = function(key, listener) {
    if (!listeners$2[key]) {
      listeners$2[key] = [];
    }
    listeners$2[key].push(listener);
    return function unsubscribe() {
      var index = listeners$2[key].indexOf(listener);
      listeners$2[key].splice(index, 1);
    };
  };
  var useCachePlugin = function(fetchInstance, _a2) {
    var cacheKey2 = _a2.cacheKey, _b2 = _a2.cacheTime, cacheTime = _b2 === void 0 ? 5 * 60 * 1e3 : _b2, _c2 = _a2.staleTime, staleTime = _c2 === void 0 ? 0 : _c2, customSetCache = _a2.setCache, customGetCache = _a2.getCache;
    var unSubscribeRef = React.useRef();
    var currentPromiseRef = React.useRef();
    var _setCache = function(key, cachedData) {
      if (customSetCache) {
        customSetCache(cachedData);
      } else {
        setCache(key, cacheTime, cachedData);
      }
      trigger(key, cachedData.data);
    };
    var _getCache = function(key, params) {
      if (params === void 0) {
        params = [];
      }
      if (customGetCache) {
        return customGetCache(params);
      }
      return getCache(key);
    };
    useCreation(function() {
      if (!cacheKey2) {
        return;
      }
      var cacheData = _getCache(cacheKey2);
      if (cacheData && Object.hasOwnProperty.call(cacheData, "data")) {
        fetchInstance.state.data = cacheData.data;
        fetchInstance.state.params = cacheData.params;
        if (staleTime === -1 || (/* @__PURE__ */ new Date()).getTime() - cacheData.time <= staleTime) {
          fetchInstance.state.loading = false;
        }
      }
      unSubscribeRef.current = subscribe$2(cacheKey2, function(data2) {
        fetchInstance.setState({
          data: data2
        });
      });
    }, []);
    useUnmount(function() {
      var _a3;
      (_a3 = unSubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unSubscribeRef);
    });
    if (!cacheKey2) {
      return {};
    }
    return {
      onBefore: function(params) {
        var cacheData = _getCache(cacheKey2, params);
        if (!cacheData || !Object.hasOwnProperty.call(cacheData, "data")) {
          return {};
        }
        if (staleTime === -1 || (/* @__PURE__ */ new Date()).getTime() - cacheData.time <= staleTime) {
          return {
            loading: false,
            data: cacheData === null || cacheData === void 0 ? void 0 : cacheData.data,
            error: void 0,
            returnNow: true
          };
        } else {
          return {
            data: cacheData === null || cacheData === void 0 ? void 0 : cacheData.data,
            error: void 0
          };
        }
      },
      onRequest: function(service, args) {
        var servicePromise = getCachePromise(cacheKey2);
        if (servicePromise && servicePromise !== currentPromiseRef.current) {
          return {
            servicePromise
          };
        }
        servicePromise = service.apply(void 0, __spreadArray([], __read(args), false));
        currentPromiseRef.current = servicePromise;
        setCachePromise(cacheKey2, servicePromise);
        return {
          servicePromise
        };
      },
      onSuccess: function(data2, params) {
        var _a3;
        if (cacheKey2) {
          (_a3 = unSubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unSubscribeRef);
          _setCache(cacheKey2, {
            data: data2,
            params,
            time: (/* @__PURE__ */ new Date()).getTime()
          });
          unSubscribeRef.current = subscribe$2(cacheKey2, function(d2) {
            fetchInstance.setState({
              data: d2
            });
          });
        }
      },
      onMutate: function(data2) {
        var _a3;
        if (cacheKey2) {
          (_a3 = unSubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unSubscribeRef);
          _setCache(cacheKey2, {
            data: data2,
            params: fetchInstance.state.params,
            time: (/* @__PURE__ */ new Date()).getTime()
          });
          unSubscribeRef.current = subscribe$2(cacheKey2, function(d2) {
            fetchInstance.setState({
              data: d2
            });
          });
        }
      }
    };
  };
  var isObject_1;
  var hasRequiredIsObject;
  function requireIsObject() {
    if (hasRequiredIsObject) return isObject_1;
    hasRequiredIsObject = 1;
    function isObject2(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    isObject_1 = isObject2;
    return isObject_1;
  }
  var _freeGlobal;
  var hasRequired_freeGlobal;
  function require_freeGlobal() {
    if (hasRequired_freeGlobal) return _freeGlobal;
    hasRequired_freeGlobal = 1;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    _freeGlobal = freeGlobal;
    return _freeGlobal;
  }
  var _root$1;
  var hasRequired_root;
  function require_root() {
    if (hasRequired_root) return _root$1;
    hasRequired_root = 1;
    var freeGlobal = require_freeGlobal();
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root2 = freeGlobal || freeSelf || Function("return this")();
    _root$1 = root2;
    return _root$1;
  }
  var now_1;
  var hasRequiredNow;
  function requireNow() {
    if (hasRequiredNow) return now_1;
    hasRequiredNow = 1;
    var root2 = require_root();
    var now = function() {
      return root2.Date.now();
    };
    now_1 = now;
    return now_1;
  }
  var _trimmedEndIndex;
  var hasRequired_trimmedEndIndex;
  function require_trimmedEndIndex() {
    if (hasRequired_trimmedEndIndex) return _trimmedEndIndex;
    hasRequired_trimmedEndIndex = 1;
    var reWhitespace = /\s/;
    function trimmedEndIndex(string) {
      var index = string.length;
      while (index-- && reWhitespace.test(string.charAt(index))) {
      }
      return index;
    }
    _trimmedEndIndex = trimmedEndIndex;
    return _trimmedEndIndex;
  }
  var _baseTrim;
  var hasRequired_baseTrim;
  function require_baseTrim() {
    if (hasRequired_baseTrim) return _baseTrim;
    hasRequired_baseTrim = 1;
    var trimmedEndIndex = require_trimmedEndIndex();
    var reTrimStart = /^\s+/;
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    _baseTrim = baseTrim;
    return _baseTrim;
  }
  var _Symbol;
  var hasRequired_Symbol;
  function require_Symbol() {
    if (hasRequired_Symbol) return _Symbol;
    hasRequired_Symbol = 1;
    var root2 = require_root();
    var Symbol2 = root2.Symbol;
    _Symbol = Symbol2;
    return _Symbol;
  }
  var _getRawTag;
  var hasRequired_getRawTag;
  function require_getRawTag() {
    if (hasRequired_getRawTag) return _getRawTag;
    hasRequired_getRawTag = 1;
    var Symbol2 = require_Symbol();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var nativeObjectToString = objectProto.toString;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    _getRawTag = getRawTag;
    return _getRawTag;
  }
  var _objectToString;
  var hasRequired_objectToString;
  function require_objectToString() {
    if (hasRequired_objectToString) return _objectToString;
    hasRequired_objectToString = 1;
    var objectProto = Object.prototype;
    var nativeObjectToString = objectProto.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    _objectToString = objectToString;
    return _objectToString;
  }
  var _baseGetTag;
  var hasRequired_baseGetTag;
  function require_baseGetTag() {
    if (hasRequired_baseGetTag) return _baseGetTag;
    hasRequired_baseGetTag = 1;
    var Symbol2 = require_Symbol(), getRawTag = require_getRawTag(), objectToString = require_objectToString();
    var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    _baseGetTag = baseGetTag;
    return _baseGetTag;
  }
  var isObjectLike_1;
  var hasRequiredIsObjectLike;
  function requireIsObjectLike() {
    if (hasRequiredIsObjectLike) return isObjectLike_1;
    hasRequiredIsObjectLike = 1;
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    isObjectLike_1 = isObjectLike;
    return isObjectLike_1;
  }
  var isSymbol_1;
  var hasRequiredIsSymbol;
  function requireIsSymbol() {
    if (hasRequiredIsSymbol) return isSymbol_1;
    hasRequiredIsSymbol = 1;
    var baseGetTag = require_baseGetTag(), isObjectLike = requireIsObjectLike();
    var symbolTag2 = "[object Symbol]";
    function isSymbol2(value) {
      return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag2;
    }
    isSymbol_1 = isSymbol2;
    return isSymbol_1;
  }
  var toNumber_1;
  var hasRequiredToNumber;
  function requireToNumber() {
    if (hasRequiredToNumber) return toNumber_1;
    hasRequiredToNumber = 1;
    var baseTrim = require_baseTrim(), isObject2 = requireIsObject(), isSymbol2 = requireIsSymbol();
    var NAN = 0 / 0;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    function toNumber2(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol2(value)) {
        return NAN;
      }
      if (isObject2(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject2(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = baseTrim(value);
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    toNumber_1 = toNumber2;
    return toNumber_1;
  }
  var debounce_1;
  var hasRequiredDebounce;
  function requireDebounce() {
    if (hasRequiredDebounce) return debounce_1;
    hasRequiredDebounce = 1;
    var isObject2 = requireIsObject(), now = requireNow(), toNumber2 = requireToNumber();
    var FUNC_ERROR_TEXT = "Expected a function";
    var nativeMax = Math.max, nativeMin = Math.min;
    function debounce2(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber2(wait) || 0;
      if (isObject2(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber2(options.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
        return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            clearTimeout(timerId);
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    debounce_1 = debounce2;
    return debounce_1;
  }
  var debounceExports = requireDebounce();
  const debounce = /* @__PURE__ */ getDefaultExportFromCjs(debounceExports);
  var useDebouncePlugin = function(fetchInstance, _a2) {
    var debounceWait = _a2.debounceWait, debounceLeading = _a2.debounceLeading, debounceTrailing = _a2.debounceTrailing, debounceMaxWait = _a2.debounceMaxWait;
    var debouncedRef = React.useRef();
    var options = React.useMemo(function() {
      var ret = {};
      if (debounceLeading !== void 0) {
        ret.leading = debounceLeading;
      }
      if (debounceTrailing !== void 0) {
        ret.trailing = debounceTrailing;
      }
      if (debounceMaxWait !== void 0) {
        ret.maxWait = debounceMaxWait;
      }
      return ret;
    }, [debounceLeading, debounceTrailing, debounceMaxWait]);
    React.useEffect(function() {
      if (debounceWait) {
        var _originRunAsync_1 = fetchInstance.runAsync.bind(fetchInstance);
        debouncedRef.current = debounce(function(callback) {
          callback();
        }, debounceWait, options);
        fetchInstance.runAsync = function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return new Promise(function(resolve, reject) {
            var _a3;
            (_a3 = debouncedRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(debouncedRef, function() {
              _originRunAsync_1.apply(void 0, __spreadArray([], __read(args), false)).then(resolve).catch(reject);
            });
          });
        };
        return function() {
          var _a3;
          (_a3 = debouncedRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
          fetchInstance.runAsync = _originRunAsync_1;
        };
      }
    }, [debounceWait, options]);
    if (!debounceWait) {
      return {};
    }
    return {
      onCancel: function() {
        var _a3;
        (_a3 = debouncedRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
      }
    };
  };
  var useLoadingDelayPlugin = function(fetchInstance, _a2) {
    var loadingDelay = _a2.loadingDelay, ready = _a2.ready;
    var timerRef = React.useRef();
    if (!loadingDelay) {
      return {};
    }
    var cancelTimeout = function() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    return {
      onBefore: function() {
        cancelTimeout();
        if (ready !== false) {
          timerRef.current = setTimeout(function() {
            fetchInstance.setState({
              loading: true
            });
          }, loadingDelay);
        }
        return {
          loading: false
        };
      },
      onFinally: function() {
        cancelTimeout();
      },
      onCancel: function() {
        cancelTimeout();
      }
    };
  };
  var isBrowser = !!(typeof window !== "undefined" && window.document && window.document.createElement);
  function isDocumentVisible() {
    if (isBrowser) {
      return document.visibilityState !== "hidden";
    }
    return true;
  }
  var listeners$1 = [];
  function subscribe$1(listener) {
    listeners$1.push(listener);
    return function unsubscribe() {
      var index = listeners$1.indexOf(listener);
      listeners$1.splice(index, 1);
    };
  }
  if (isBrowser) {
    var revalidate$1 = function() {
      if (!isDocumentVisible()) return;
      for (var i = 0; i < listeners$1.length; i++) {
        var listener = listeners$1[i];
        listener();
      }
    };
    window.addEventListener("visibilitychange", revalidate$1, false);
  }
  var usePollingPlugin = function(fetchInstance, _a2) {
    var pollingInterval = _a2.pollingInterval, _b2 = _a2.pollingWhenHidden, pollingWhenHidden = _b2 === void 0 ? true : _b2, _c2 = _a2.pollingErrorRetryCount, pollingErrorRetryCount = _c2 === void 0 ? -1 : _c2;
    var timerRef = React.useRef();
    var unsubscribeRef = React.useRef();
    var countRef = React.useRef(0);
    var stopPolling = function() {
      var _a3;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      (_a3 = unsubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unsubscribeRef);
    };
    useUpdateEffect(function() {
      if (!pollingInterval) {
        stopPolling();
      }
    }, [pollingInterval]);
    if (!pollingInterval) {
      return {};
    }
    return {
      onBefore: function() {
        stopPolling();
      },
      onError: function() {
        countRef.current += 1;
      },
      onSuccess: function() {
        countRef.current = 0;
      },
      onFinally: function() {
        if (pollingErrorRetryCount === -1 || // When an error occurs, the request is not repeated after pollingErrorRetryCount retries
        pollingErrorRetryCount !== -1 && countRef.current <= pollingErrorRetryCount) {
          timerRef.current = setTimeout(function() {
            if (!pollingWhenHidden && !isDocumentVisible()) {
              unsubscribeRef.current = subscribe$1(function() {
                fetchInstance.refresh();
              });
            } else {
              fetchInstance.refresh();
            }
          }, pollingInterval);
        } else {
          countRef.current = 0;
        }
      },
      onCancel: function() {
        stopPolling();
      }
    };
  };
  function limit(fn, timespan) {
    var pending = false;
    return function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (pending) return;
      pending = true;
      fn.apply(void 0, __spreadArray([], __read(args), false));
      setTimeout(function() {
        pending = false;
      }, timespan);
    };
  }
  function isOnline() {
    if (isBrowser && typeof navigator.onLine !== "undefined") {
      return navigator.onLine;
    }
    return true;
  }
  var listeners = [];
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      var index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  if (isBrowser) {
    var revalidate = function() {
      if (!isDocumentVisible() || !isOnline()) return;
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }
    };
    window.addEventListener("visibilitychange", revalidate, false);
    window.addEventListener("focus", revalidate, false);
  }
  var useRefreshOnWindowFocusPlugin = function(fetchInstance, _a2) {
    var refreshOnWindowFocus = _a2.refreshOnWindowFocus, _b2 = _a2.focusTimespan, focusTimespan = _b2 === void 0 ? 5e3 : _b2;
    var unsubscribeRef = React.useRef();
    var stopSubscribe = function() {
      var _a3;
      (_a3 = unsubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unsubscribeRef);
    };
    React.useEffect(function() {
      if (refreshOnWindowFocus) {
        var limitRefresh_1 = limit(fetchInstance.refresh.bind(fetchInstance), focusTimespan);
        unsubscribeRef.current = subscribe(function() {
          limitRefresh_1();
        });
      }
      return function() {
        stopSubscribe();
      };
    }, [refreshOnWindowFocus, focusTimespan]);
    useUnmount(function() {
      stopSubscribe();
    });
    return {};
  };
  var useRetryPlugin = function(fetchInstance, _a2) {
    var retryInterval = _a2.retryInterval, retryCount = _a2.retryCount;
    var timerRef = React.useRef();
    var countRef = React.useRef(0);
    var triggerByRetry = React.useRef(false);
    if (!retryCount) {
      return {};
    }
    return {
      onBefore: function() {
        if (!triggerByRetry.current) {
          countRef.current = 0;
        }
        triggerByRetry.current = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      },
      onSuccess: function() {
        countRef.current = 0;
      },
      onError: function() {
        countRef.current += 1;
        if (retryCount === -1 || countRef.current <= retryCount) {
          var timeout = retryInterval !== null && retryInterval !== void 0 ? retryInterval : Math.min(1e3 * Math.pow(2, countRef.current), 3e4);
          timerRef.current = setTimeout(function() {
            triggerByRetry.current = true;
            fetchInstance.refresh();
          }, timeout);
        } else {
          countRef.current = 0;
        }
      },
      onCancel: function() {
        countRef.current = 0;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }
    };
  };
  var throttle_1;
  var hasRequiredThrottle;
  function requireThrottle() {
    if (hasRequiredThrottle) return throttle_1;
    hasRequiredThrottle = 1;
    var debounce2 = requireDebounce(), isObject2 = requireIsObject();
    var FUNC_ERROR_TEXT = "Expected a function";
    function throttle2(func, wait, options) {
      var leading = true, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject2(options)) {
        leading = "leading" in options ? !!options.leading : leading;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      return debounce2(func, wait, {
        "leading": leading,
        "maxWait": wait,
        "trailing": trailing
      });
    }
    throttle_1 = throttle2;
    return throttle_1;
  }
  var throttleExports = requireThrottle();
  const throttle = /* @__PURE__ */ getDefaultExportFromCjs(throttleExports);
  var useThrottlePlugin = function(fetchInstance, _a2) {
    var throttleWait = _a2.throttleWait, throttleLeading = _a2.throttleLeading, throttleTrailing = _a2.throttleTrailing;
    var throttledRef = React.useRef();
    var options = {};
    if (throttleLeading !== void 0) {
      options.leading = throttleLeading;
    }
    if (throttleTrailing !== void 0) {
      options.trailing = throttleTrailing;
    }
    React.useEffect(function() {
      if (throttleWait) {
        var _originRunAsync_1 = fetchInstance.runAsync.bind(fetchInstance);
        throttledRef.current = throttle(function(callback) {
          callback();
        }, throttleWait, options);
        fetchInstance.runAsync = function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return new Promise(function(resolve, reject) {
            var _a3;
            (_a3 = throttledRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(throttledRef, function() {
              _originRunAsync_1.apply(void 0, __spreadArray([], __read(args), false)).then(resolve).catch(reject);
            });
          });
        };
        return function() {
          var _a3;
          fetchInstance.runAsync = _originRunAsync_1;
          (_a3 = throttledRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
        };
      }
    }, [throttleWait, throttleLeading, throttleTrailing]);
    if (!throttleWait) {
      return {};
    }
    return {
      onCancel: function() {
        var _a3;
        (_a3 = throttledRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
      }
    };
  };
  var useMount = function(fn) {
    React.useEffect(function() {
      fn === null || fn === void 0 ? void 0 : fn();
    }, []);
  };
  var useUpdate = function() {
    var _a2 = __read(React.useState({}), 2), setState = _a2[1];
    return React.useCallback(function() {
      return setState({});
    }, []);
  };
  var Fetch = (
    /** @class */
    function() {
      function Fetch2(serviceRef, options, subscribe2, initState2) {
        if (initState2 === void 0) {
          initState2 = {};
        }
        this.serviceRef = serviceRef;
        this.options = options;
        this.subscribe = subscribe2;
        this.initState = initState2;
        this.count = 0;
        this.state = {
          loading: false,
          params: void 0,
          data: void 0,
          error: void 0
        };
        this.state = __assign(__assign(__assign({}, this.state), {
          loading: !options.manual
        }), initState2);
      }
      Fetch2.prototype.setState = function(s) {
        if (s === void 0) {
          s = {};
        }
        this.state = __assign(__assign({}, this.state), s);
        this.subscribe();
      };
      Fetch2.prototype.runPluginHandler = function(event) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          rest[_i - 1] = arguments[_i];
        }
        var r2 = this.pluginImpls.map(function(i) {
          var _a2;
          return (_a2 = i[event]) === null || _a2 === void 0 ? void 0 : _a2.call.apply(_a2, __spreadArray([i], __read(rest), false));
        }).filter(Boolean);
        return Object.assign.apply(Object, __spreadArray([{}], __read(r2), false));
      };
      Fetch2.prototype.runAsync = function() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          params[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function() {
          var currentCount, _a2, _b2, stopNow, _c2, returnNow, state, servicePromise, res, error_1;
          var _d;
          var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
          return __generator(this, function(_q) {
            switch (_q.label) {
              case 0:
                this.count += 1;
                currentCount = this.count;
                _a2 = this.runPluginHandler("onBefore", params), _b2 = _a2.stopNow, stopNow = _b2 === void 0 ? false : _b2, _c2 = _a2.returnNow, returnNow = _c2 === void 0 ? false : _c2, state = __rest(_a2, ["stopNow", "returnNow"]);
                if (stopNow) {
                  return [2, new Promise(function() {
                  })];
                }
                this.setState(__assign({
                  loading: true,
                  params
                }, state));
                if (returnNow) {
                  return [2, Promise.resolve(state.data)];
                }
                (_f = (_e = this.options).onBefore) === null || _f === void 0 ? void 0 : _f.call(_e, params);
                _q.label = 1;
              case 1:
                _q.trys.push([1, 3, , 4]);
                servicePromise = this.runPluginHandler("onRequest", this.serviceRef.current, params).servicePromise;
                if (!servicePromise) {
                  servicePromise = (_d = this.serviceRef).current.apply(_d, __spreadArray([], __read(params), false));
                }
                return [4, servicePromise];
              case 2:
                res = _q.sent();
                if (currentCount !== this.count) {
                  return [2, new Promise(function() {
                  })];
                }
                this.setState({
                  data: res,
                  error: void 0,
                  loading: false
                });
                (_h = (_g = this.options).onSuccess) === null || _h === void 0 ? void 0 : _h.call(_g, res, params);
                this.runPluginHandler("onSuccess", res, params);
                (_k = (_j = this.options).onFinally) === null || _k === void 0 ? void 0 : _k.call(_j, params, res, void 0);
                if (currentCount === this.count) {
                  this.runPluginHandler("onFinally", params, res, void 0);
                }
                return [2, res];
              case 3:
                error_1 = _q.sent();
                if (currentCount !== this.count) {
                  return [2, new Promise(function() {
                  })];
                }
                this.setState({
                  error: error_1,
                  loading: false
                });
                (_m = (_l = this.options).onError) === null || _m === void 0 ? void 0 : _m.call(_l, error_1, params);
                this.runPluginHandler("onError", error_1, params);
                (_p = (_o = this.options).onFinally) === null || _p === void 0 ? void 0 : _p.call(_o, params, void 0, error_1);
                if (currentCount === this.count) {
                  this.runPluginHandler("onFinally", params, void 0, error_1);
                }
                throw error_1;
              case 4:
                return [
                  2
                  /*return*/
                ];
            }
          });
        });
      };
      Fetch2.prototype.run = function() {
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          params[_i] = arguments[_i];
        }
        this.runAsync.apply(this, __spreadArray([], __read(params), false)).catch(function(error) {
          if (!_this.options.onError) {
            console.error(error);
          }
        });
      };
      Fetch2.prototype.cancel = function() {
        this.count += 1;
        this.setState({
          loading: false
        });
        this.runPluginHandler("onCancel");
      };
      Fetch2.prototype.refresh = function() {
        this.run.apply(this, __spreadArray([], __read(this.state.params || []), false));
      };
      Fetch2.prototype.refreshAsync = function() {
        return this.runAsync.apply(this, __spreadArray([], __read(this.state.params || []), false));
      };
      Fetch2.prototype.mutate = function(data2) {
        var targetData = isFunction$2(data2) ? data2(this.state.data) : data2;
        this.runPluginHandler("onMutate", targetData);
        this.setState({
          data: targetData
        });
      };
      return Fetch2;
    }()
  );
  function useRequestImplement(service, options, plugins) {
    if (options === void 0) {
      options = {};
    }
    if (plugins === void 0) {
      plugins = [];
    }
    var _a2 = options.manual, manual = _a2 === void 0 ? false : _a2, _b2 = options.ready, ready = _b2 === void 0 ? true : _b2, rest = __rest(options, ["manual", "ready"]);
    var fetchOptions = __assign({
      manual,
      ready
    }, rest);
    var serviceRef = useLatest(service);
    var update = useUpdate();
    var fetchInstance = useCreation(function() {
      var initState2 = plugins.map(function(p) {
        var _a3;
        return (_a3 = p === null || p === void 0 ? void 0 : p.onInit) === null || _a3 === void 0 ? void 0 : _a3.call(p, fetchOptions);
      }).filter(Boolean);
      return new Fetch(serviceRef, fetchOptions, update, Object.assign.apply(Object, __spreadArray([{}], __read(initState2), false)));
    }, []);
    fetchInstance.options = fetchOptions;
    fetchInstance.pluginImpls = plugins.map(function(p) {
      return p(fetchInstance, fetchOptions);
    });
    useMount(function() {
      if (!manual && ready) {
        var params = fetchInstance.state.params || options.defaultParams || [];
        fetchInstance.run.apply(fetchInstance, __spreadArray([], __read(params), false));
      }
    });
    useUnmount(function() {
      fetchInstance.cancel();
    });
    return {
      loading: fetchInstance.state.loading,
      data: fetchInstance.state.data,
      error: fetchInstance.state.error,
      params: fetchInstance.state.params || [],
      cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
      refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
      refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
      run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
      runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
      mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance))
    };
  }
  function useRequest(service, options, plugins) {
    return useRequestImplement(service, options, __spreadArray(__spreadArray([], __read([]), false), [useDebouncePlugin, useLoadingDelayPlugin, usePollingPlugin, useRefreshOnWindowFocusPlugin, useThrottlePlugin, useAutoRunPlugin, useCachePlugin, useRetryPlugin], false));
  }
  function useToggle(defaultValue2, reverseValue) {
    if (defaultValue2 === void 0) {
      defaultValue2 = false;
    }
    var _a2 = __read(React.useState(defaultValue2), 2), state = _a2[0], setState = _a2[1];
    var actions = React.useMemo(function() {
      var reverseValueOrigin = !defaultValue2;
      var toggle = function() {
        return setState(function(s) {
          return s === defaultValue2 ? reverseValueOrigin : defaultValue2;
        });
      };
      var set2 = function(value) {
        return setState(value);
      };
      var setLeft = function() {
        return setState(defaultValue2);
      };
      var setRight = function() {
        return setState(reverseValueOrigin);
      };
      return {
        toggle,
        set: set2,
        setLeft,
        setRight
      };
    }, []);
    return [state, actions];
  }
  function useBoolean(defaultValue2) {
    var _a2 = __read(useToggle(!!defaultValue2), 2), state = _a2[0], _b2 = _a2[1], toggle = _b2.toggle, set2 = _b2.set;
    var actions = React.useMemo(function() {
      var setTrue = function() {
        return set2(true);
      };
      var setFalse = function() {
        return set2(false);
      };
      return {
        toggle,
        set: function(v) {
          return set2(!!v);
        },
        setTrue,
        setFalse
      };
    }, []);
    return [state, actions];
  }
  function getTargetElement(target, defaultElement) {
    if (!isBrowser) {
      return void 0;
    }
    if (!target) {
      return defaultElement;
    }
    var targetElement;
    if (isFunction$2(target)) {
      targetElement = target();
    } else if ("current" in target) {
      targetElement = target.current;
    } else {
      targetElement = target;
    }
    return targetElement;
  }
  var createEffectWithTarget = function(useEffectType) {
    var useEffectWithTarget2 = function(effect, deps, target) {
      var hasInitRef = React.useRef(false);
      var lastElementRef = React.useRef([]);
      var lastDepsRef = React.useRef([]);
      var unLoadRef = React.useRef();
      useEffectType(function() {
        var _a2;
        var targets = Array.isArray(target) ? target : [target];
        var els = targets.map(function(item) {
          return getTargetElement(item);
        });
        if (!hasInitRef.current) {
          hasInitRef.current = true;
          lastElementRef.current = els;
          lastDepsRef.current = deps;
          unLoadRef.current = effect();
          return;
        }
        if (els.length !== lastElementRef.current.length || !depsAreSame(lastElementRef.current, els) || !depsAreSame(lastDepsRef.current, deps)) {
          (_a2 = unLoadRef.current) === null || _a2 === void 0 ? void 0 : _a2.call(unLoadRef);
          lastElementRef.current = els;
          lastDepsRef.current = deps;
          unLoadRef.current = effect();
        }
      });
      useUnmount(function() {
        var _a2;
        (_a2 = unLoadRef.current) === null || _a2 === void 0 ? void 0 : _a2.call(unLoadRef);
        hasInitRef.current = false;
      });
    };
    return useEffectWithTarget2;
  };
  var useEffectWithTarget = createEffectWithTarget(React.useEffect);
  var reactFastCompare;
  var hasRequiredReactFastCompare;
  function requireReactFastCompare() {
    if (hasRequiredReactFastCompare) return reactFastCompare;
    hasRequiredReactFastCompare = 1;
    var hasElementType = typeof Element !== "undefined";
    var hasMap = typeof Map === "function";
    var hasSet = typeof Set === "function";
    var hasArrayBuffer = typeof ArrayBuffer === "function" && !!ArrayBuffer.isView;
    function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length2, i, keys;
        if (Array.isArray(a)) {
          length2 = a.length;
          if (length2 != b.length) return false;
          for (i = length2; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        var it;
        if (hasMap && a instanceof Map && b instanceof Map) {
          if (a.size !== b.size) return false;
          it = a.entries();
          while (!(i = it.next()).done)
            if (!b.has(i.value[0])) return false;
          it = a.entries();
          while (!(i = it.next()).done)
            if (!equal(i.value[1], b.get(i.value[0]))) return false;
          return true;
        }
        if (hasSet && a instanceof Set && b instanceof Set) {
          if (a.size !== b.size) return false;
          it = a.entries();
          while (!(i = it.next()).done)
            if (!b.has(i.value[0])) return false;
          return true;
        }
        if (hasArrayBuffer && ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
          length2 = a.length;
          if (length2 != b.length) return false;
          for (i = length2; i-- !== 0; )
            if (a[i] !== b[i]) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf && typeof a.valueOf === "function" && typeof b.valueOf === "function") return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString && typeof a.toString === "function" && typeof b.toString === "function") return a.toString() === b.toString();
        keys = Object.keys(a);
        length2 = keys.length;
        if (length2 !== Object.keys(b).length) return false;
        for (i = length2; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        if (hasElementType && a instanceof Element) return false;
        for (i = length2; i-- !== 0; ) {
          if ((keys[i] === "_owner" || keys[i] === "__v" || keys[i] === "__o") && a.$$typeof) {
            continue;
          }
          if (!equal(a[keys[i]], b[keys[i]])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    }
    reactFastCompare = function isEqual2(a, b) {
      try {
        return equal(a, b);
      } catch (error) {
        if ((error.message || "").match(/stack|recursion/i)) {
          console.warn("react-fast-compare cannot handle circular refs");
          return false;
        }
        throw error;
      }
    };
    return reactFastCompare;
  }
  var reactFastCompareExports = requireReactFastCompare();
  const isEqual$1 = /* @__PURE__ */ getDefaultExportFromCjs(reactFastCompareExports);
  var depsEqual = function(aDeps, bDeps) {
    if (aDeps === void 0) {
      aDeps = [];
    }
    if (bDeps === void 0) {
      bDeps = [];
    }
    return isEqual$1(aDeps, bDeps);
  };
  function useEventListener(eventName, handler, options) {
    if (options === void 0) {
      options = {};
    }
    var _a2 = options.enable, enable = _a2 === void 0 ? true : _a2;
    var handlerRef = useLatest(handler);
    useEffectWithTarget(function() {
      if (!enable) {
        return;
      }
      var targetElement = getTargetElement(options.target, window);
      if (!(targetElement === null || targetElement === void 0 ? void 0 : targetElement.addEventListener)) {
        return;
      }
      var eventListener = function(event) {
        return handlerRef.current(event);
      };
      var eventNameArray = Array.isArray(eventName) ? eventName : [eventName];
      eventNameArray.forEach(function(event) {
        targetElement.addEventListener(event, eventListener, {
          capture: options.capture,
          once: options.once,
          passive: options.passive
        });
      });
      return function() {
        eventNameArray.forEach(function(event) {
          targetElement.removeEventListener(event, eventListener, {
            capture: options.capture
          });
        });
      };
    }, [eventName, options.capture, options.once, options.passive, enable], options.target);
  }
  const useHover = function(target, options) {
    var _a2 = {}, onEnter = _a2.onEnter, onLeave = _a2.onLeave, onChange = _a2.onChange;
    var _b2 = __read(useBoolean(false), 2), state = _b2[0], _c2 = _b2[1], setTrue = _c2.setTrue, setFalse = _c2.setFalse;
    useEventListener("mouseenter", function() {
      onEnter === null || onEnter === void 0 ? void 0 : onEnter();
      setTrue();
      onChange === null || onChange === void 0 ? void 0 : onChange(true);
    }, {
      target
    });
    useEventListener("mouseleave", function() {
      onLeave === null || onLeave === void 0 ? void 0 : onLeave();
      setFalse();
      onChange === null || onChange === void 0 ? void 0 : onChange(false);
    }, {
      target
    });
    return state;
  };
  var useDeepCompareEffectWithTarget = function(effect, deps, target) {
    var ref = React.useRef();
    var signalRef = React.useRef(0);
    if (!depsEqual(deps, ref.current)) {
      signalRef.current += 1;
    }
    ref.current = deps;
    useEffectWithTarget(effect, [signalRef.current], target);
  };
  var isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(typeof navigator !== "undefined" ? navigator === null || navigator === void 0 ? void 0 : navigator.platform : "");
  var aliasKeyCodeMap = {
    "0": 48,
    "1": 49,
    "2": 50,
    "3": 51,
    "4": 52,
    "5": 53,
    "6": 54,
    "7": 55,
    "8": 56,
    "9": 57,
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pausebreak: 19,
    capslock: 20,
    esc: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    leftarrow: 37,
    uparrow: 38,
    rightarrow: 39,
    downarrow: 40,
    insert: 45,
    delete: 46,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    leftwindowkey: 91,
    rightwindowkey: 92,
    meta: isAppleDevice ? [91, 93] : [91, 92],
    selectkey: 93,
    numpad0: 96,
    numpad1: 97,
    numpad2: 98,
    numpad3: 99,
    numpad4: 100,
    numpad5: 101,
    numpad6: 102,
    numpad7: 103,
    numpad8: 104,
    numpad9: 105,
    multiply: 106,
    add: 107,
    subtract: 109,
    decimalpoint: 110,
    divide: 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    numlock: 144,
    scrolllock: 145,
    semicolon: 186,
    equalsign: 187,
    comma: 188,
    dash: 189,
    period: 190,
    forwardslash: 191,
    graveaccent: 192,
    openbracket: 219,
    backslash: 220,
    closebracket: 221,
    singlequote: 222
  };
  var modifierKey = {
    ctrl: function(event) {
      return event.ctrlKey;
    },
    shift: function(event) {
      return event.shiftKey;
    },
    alt: function(event) {
      return event.altKey;
    },
    meta: function(event) {
      if (event.type === "keyup") {
        return aliasKeyCodeMap.meta.includes(event.keyCode);
      }
      return event.metaKey;
    }
  };
  function isValidKeyType(value) {
    return isString(value) || isNumber(value);
  }
  function countKeyByEvent(event) {
    var countOfModifier = Object.keys(modifierKey).reduce(function(total, key) {
      if (modifierKey[key](event)) {
        return total + 1;
      }
      return total;
    }, 0);
    return [16, 17, 18, 91, 92].includes(event.keyCode) ? countOfModifier : countOfModifier + 1;
  }
  function genFilterKey(event, keyFilter, exactMatch) {
    var e_1, _a2;
    if (!event.key) {
      return false;
    }
    if (isNumber(keyFilter)) {
      return event.keyCode === keyFilter ? keyFilter : false;
    }
    var genArr = keyFilter.split(".");
    var genLen = 0;
    try {
      for (var genArr_1 = __values(genArr), genArr_1_1 = genArr_1.next(); !genArr_1_1.done; genArr_1_1 = genArr_1.next()) {
        var key = genArr_1_1.value;
        var genModifier = modifierKey[key];
        var aliasKeyCode = aliasKeyCodeMap[key.toLowerCase()];
        if (genModifier && genModifier(event) || aliasKeyCode && aliasKeyCode === event.keyCode) {
          genLen++;
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (genArr_1_1 && !genArr_1_1.done && (_a2 = genArr_1.return)) _a2.call(genArr_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    if (exactMatch) {
      return genLen === genArr.length && countKeyByEvent(event) === genArr.length ? keyFilter : false;
    }
    return genLen === genArr.length ? keyFilter : false;
  }
  function genKeyFormatter(keyFilter, exactMatch) {
    if (isFunction$2(keyFilter)) {
      return keyFilter;
    }
    if (isValidKeyType(keyFilter)) {
      return function(event) {
        return genFilterKey(event, keyFilter, exactMatch);
      };
    }
    if (Array.isArray(keyFilter)) {
      return function(event) {
        return keyFilter.find(function(item) {
          return genFilterKey(event, item, exactMatch);
        });
      };
    }
    return function() {
      return Boolean(keyFilter);
    };
  }
  var defaultEvents = ["keydown"];
  function useKeyPress(keyFilter, eventHandler, option) {
    var _a2 = option || {}, _b2 = _a2.events, events2 = _b2 === void 0 ? defaultEvents : _b2, target = _a2.target, _c2 = _a2.exactMatch, exactMatch = _c2 === void 0 ? false : _c2, _d = _a2.useCapture, useCapture = _d === void 0 ? false : _d;
    var eventHandlerRef = useLatest(eventHandler);
    var keyFilterRef = useLatest(keyFilter);
    useDeepCompareEffectWithTarget(function() {
      var e_2, _a3;
      var _b3;
      var el = getTargetElement(target, window);
      if (!el) {
        return;
      }
      var callbackHandler = function(event) {
        var _a4;
        var genGuard = genKeyFormatter(keyFilterRef.current, exactMatch);
        var keyGuard = genGuard(event);
        var firedKey = isValidKeyType(keyGuard) ? keyGuard : event.key;
        if (keyGuard) {
          return (_a4 = eventHandlerRef.current) === null || _a4 === void 0 ? void 0 : _a4.call(eventHandlerRef, event, firedKey);
        }
      };
      try {
        for (var events_1 = __values(events2), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
          var eventName = events_1_1.value;
          (_b3 = el === null || el === void 0 ? void 0 : el.addEventListener) === null || _b3 === void 0 ? void 0 : _b3.call(el, eventName, callbackHandler, useCapture);
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (events_1_1 && !events_1_1.done && (_a3 = events_1.return)) _a3.call(events_1);
        } finally {
          if (e_2) throw e_2.error;
        }
      }
      return function() {
        var e_3, _a4;
        var _b4;
        try {
          for (var events_2 = __values(events2), events_2_1 = events_2.next(); !events_2_1.done; events_2_1 = events_2.next()) {
            var eventName2 = events_2_1.value;
            (_b4 = el === null || el === void 0 ? void 0 : el.removeEventListener) === null || _b4 === void 0 ? void 0 : _b4.call(el, eventName2, callbackHandler, useCapture);
          }
        } catch (e_3_1) {
          e_3 = {
            error: e_3_1
          };
        } finally {
          try {
            if (events_2_1 && !events_2_1.done && (_a4 = events_2.return)) _a4.call(events_2);
          } finally {
            if (e_3) throw e_3.error;
          }
        }
      };
    }, [events2], target);
  }
  function useLockFn(fn) {
    var _this = this;
    var lockRef = React.useRef(false);
    return React.useCallback(function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return __awaiter(_this, void 0, void 0, function() {
        var ret, e_1;
        return __generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              if (lockRef.current) return [
                2
                /*return*/
              ];
              lockRef.current = true;
              _a2.label = 1;
            case 1:
              _a2.trys.push([1, 3, 4, 5]);
              return [4, fn.apply(void 0, __spreadArray([], __read(args), false))];
            case 2:
              ret = _a2.sent();
              return [2, ret];
            case 3:
              e_1 = _a2.sent();
              throw e_1;
            case 4:
              lockRef.current = false;
              return [
                7
                /*endfinally*/
              ];
            case 5:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, [fn]);
  }
  function useRafState(initialState) {
    var ref = React.useRef(0);
    var _a2 = __read(React.useState(initialState), 2), state = _a2[0], setState = _a2[1];
    var setRafState = React.useCallback(function(value) {
      cancelAnimationFrame(ref.current);
      ref.current = requestAnimationFrame(function() {
        setState(value);
      });
    }, []);
    useUnmount(function() {
      cancelAnimationFrame(ref.current);
    });
    return [state, setRafState];
  }
  var initState = {
    screenX: NaN,
    screenY: NaN,
    clientX: NaN,
    clientY: NaN,
    pageX: NaN,
    pageY: NaN,
    elementX: NaN,
    elementY: NaN,
    elementH: NaN,
    elementW: NaN,
    elementPosX: NaN,
    elementPosY: NaN
  };
  const useMouse = function(target) {
    var _a2 = __read(useRafState(initState), 2), state = _a2[0], setState = _a2[1];
    useEventListener("mousemove", function(event) {
      var screenX = event.screenX, screenY = event.screenY, clientX = event.clientX, clientY = event.clientY, pageX = event.pageX, pageY = event.pageY;
      var newState = {
        screenX,
        screenY,
        clientX,
        clientY,
        pageX,
        pageY,
        elementX: NaN,
        elementY: NaN,
        elementH: NaN,
        elementW: NaN,
        elementPosX: NaN,
        elementPosY: NaN
      };
      var targetElement = getTargetElement(target);
      if (targetElement) {
        var _a3 = targetElement.getBoundingClientRect(), left = _a3.left, top_1 = _a3.top, width = _a3.width, height = _a3.height;
        newState.elementPosX = left + window.pageXOffset;
        newState.elementPosY = top_1 + window.pageYOffset;
        newState.elementX = pageX - newState.elementPosX;
        newState.elementY = pageY - newState.elementPosY;
        newState.elementW = width;
        newState.elementH = height;
      }
      setState(newState);
    }, {
      target: function() {
        return document;
      }
    });
    return state;
  };
  var defaultShouldUpdate = function(a, b) {
    return !Object.is(a, b);
  };
  function usePrevious$1(state, shouldUpdate) {
    if (shouldUpdate === void 0) {
      shouldUpdate = defaultShouldUpdate;
    }
    var prevRef = React.useRef();
    var curRef = React.useRef();
    if (shouldUpdate(curRef.current, state)) {
      prevRef.current = curRef.current;
      curRef.current = state;
    }
    return prevRef.current;
  }
  var useUnmountedRef = function() {
    var unmountedRef = React.useRef(false);
    React.useEffect(function() {
      unmountedRef.current = false;
      return function() {
        unmountedRef.current = true;
      };
    }, []);
    return unmountedRef;
  };
  const useUpdateLayoutEffect = createUpdateEffect(React.useLayoutEffect);
  const $darkMode = valtioFactory(() => {
    return document.body.classList.contains("dark") || document.body.classList.contains("bilibili-helper-dark-mode") || document.documentElement.classList.contains("dark");
  });
  function useIsDarkMode() {
    return $darkMode.use();
  }
  const $colors = valtioFactory(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    const c2 = window.getComputedStyle(document.body).color;
    return {
      bg,
      c: c2
    };
  });
  function useColors() {
    return $colors.use();
  }
  setTimeout($colors.updateThrottled, 2e3);
  const onDarkModeChange = () => {
    $colors.updateThrottled();
    $darkMode.get() ? document.documentElement.classList.add(appClsDark) : document.documentElement.classList.remove(appClsDark);
  };
  onDarkModeChange();
  subscribe$3($darkMode.state, onDarkModeChange);
  subscribeOnKeys(settings.style.pureRecommend, ["useWhiteBackground"], () => setTimeout($colors.updateThrottled, 500));
  const ob = new MutationObserver(() => {
    setTimeout(() => {
      $darkMode.updateThrottled();
      setTimeout($colors.updateThrottled);
    });
  });
  ob.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
  ob.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-darkreader-scheme"]
  });
  document.addEventListener("click", evolvedDarkModeClickHandler, {
    passive: true
  });
  async function evolvedDarkModeClickHandler(e) {
    const t = e.target;
    if (!t.closest(EVOLVED_DARK_MODE_SELECTOR)) return;
    await delay(0);
    $darkMode.updateThrottled();
    $colors.updateThrottled();
  }
  window.addEventListener("unload", () => {
    ob.disconnect();
    document.removeEventListener("click", evolvedDarkModeClickHandler);
  });
  const EVOLVED_DARK_MODE_SELECTOR = '.custom-navbar-item[role="listitem"][data-name="darkMode"]';
  const EVOLVED_DARK_MODE_INNER_SELECTOR = '.navbar-dark-mode[item="darkMode"]';
  function toggleEvolvedDarkMode() {
    var _a2;
    (_a2 = document.querySelector(EVOLVED_DARK_MODE_INNER_SELECTOR)) == null ? void 0 : _a2.click();
  }
  function useHotkeyForToggleEvolvedDarkMode() {
    return useKeyPress(
      ["shift.d", "shift.h"],
      // shift + d 被什么 prevent 了
      () => {
        if (shouldDisableShortcut()) return;
        toggleEvolvedDarkMode();
      },
      {
        exactMatch: true
      }
    );
  }
  var jsx = function jsx2(type, props) {
    var args = arguments;
    if (props == null || !hasOwn.call(props, "css")) {
      return React__namespace.createElement.apply(void 0, args);
    }
    var argsLength = args.length;
    var createElementArgArray = new Array(argsLength);
    createElementArgArray[0] = Emotion$1;
    createElementArgArray[1] = createEmotionProps(type, props);
    for (var i = 2; i < argsLength; i++) {
      createElementArgArray[i] = args[i];
    }
    return React__namespace.createElement.apply(null, createElementArgArray);
  };
  var Global = /* @__PURE__ */ withEmotionCache(function(props, cache2) {
    var styles2 = props.styles;
    var serialized = serializeStyles([styles2], void 0, React__namespace.useContext(ThemeContext));
    var sheetRef = React__namespace.useRef();
    useInsertionEffectWithLayoutFallback(function() {
      var key = cache2.key + "-global";
      var sheet = new cache2.sheet.constructor({
        key,
        nonce: cache2.sheet.nonce,
        container: cache2.sheet.container,
        speedy: cache2.sheet.isSpeedy
      });
      var rehydrating = false;
      var node2 = document.querySelector('style[data-emotion="' + key + " " + serialized.name + '"]');
      if (cache2.sheet.tags.length) {
        sheet.before = cache2.sheet.tags[0];
      }
      if (node2 !== null) {
        rehydrating = true;
        node2.setAttribute("data-emotion", key);
        sheet.hydrate([node2]);
      }
      sheetRef.current = [sheet, rehydrating];
      return function() {
        sheet.flush();
      };
    }, [cache2]);
    useInsertionEffectWithLayoutFallback(function() {
      var sheetRefCurrent = sheetRef.current;
      var sheet = sheetRefCurrent[0], rehydrating = sheetRefCurrent[1];
      if (rehydrating) {
        sheetRefCurrent[1] = false;
        return;
      }
      if (serialized.next !== void 0) {
        insertStyles(cache2, serialized.next, true);
      }
      if (sheet.tags.length) {
        var element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
        sheet.before = element;
        sheet.flush();
      }
      cache2.insert("", serialized, sheet, false);
    }, [cache2, serialized.name]);
    return null;
  });
  function css() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return serializeStyles(args);
  }
  const flexVerticalCenterStyle = {
    name: "s5xdrg",
    styles: "display:flex;align-items:center"
  };
  const inlineFlexVerticalCenterStyle = {
    name: "8irbms",
    styles: "display:inline-flex;align-items:center"
  };
  const flexCenterStyle = /* @__PURE__ */ css(flexVerticalCenterStyle, " justify-content:center;", "");
  const C = {
    size(size2) {
      return /* @__PURE__ */ css("width:", size2, "px;height:", size2, "px;", "");
    },
    ml(size2) {
      return /* @__PURE__ */ css("margin-left:", size2, "px;", "");
    },
    mr(size2) {
      return /* @__PURE__ */ css("margin-right:", size2, "px;", "");
    },
    mt(size2) {
      return /* @__PURE__ */ css("margin-top:", size2, "px;", "");
    },
    mb(size2) {
      return /* @__PURE__ */ css("margin-bottom:", size2, "px;", "");
    }
  };
  const iconOnlyRoundButtonCss = /* @__PURE__ */ css("padding:0;width:32px;height:32px;border-radius:50%;", flexCenterStyle, ";", "");
  const buttonOpenCss = {
    name: "rmyi3a",
    styles: "color:var(--ant-button-default-hover-color);border-color:var(--ant-button-default-hover-border-color);background:var(--ant-button-default-hover-bg)"
  };
  function useButtonOpenColor() {
    return antd.theme.useToken().token.colorPrimaryHover;
  }
  function usePopoverBorderColor() {
    const {
      popoverBorderColorUseColorPrimary
    } = useSnapshot(settings.style.general);
    const buttonOpenColor = useButtonOpenColor();
    return popoverBorderColorUseColorPrimary ? buttonOpenColor : borderColorValue;
  }
  function useAntLinkCss() {
    const {
      colorLink,
      colorLinkActive,
      colorLinkHover
    } = antd.theme.useToken().token;
    return React.useMemo(() => /* @__PURE__ */ css("color:", colorLink, ";&:visited{color:", colorLink, ";}&:hover{color:", colorLinkHover, ";}&:active{color:", colorLinkActive, ";}", ""), [colorLink, colorLinkActive, colorLinkHover]);
  }
  const APP_CLS_USE_ANT_LINK_COLOR = `${APP_NAMESPACE}--use-ant-link-color`;
  function useAntLinkColorGlobalCss() {
    const s = useAntLinkCss();
    return /* @__PURE__ */ css(":root .", APP_CLS_USE_ANT_LINK_COLOR, "{", s, ";}", "");
  }
  const LX_THEMES = [
    {
      id: "green",
      name: "绿意盎然",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(77, 175, 124)",
      colorTheme: "rgb(77, 175, 124)"
    },
    {
      id: "blue",
      name: "蓝田生玉",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(52, 152, 219)",
      colorTheme: "rgb(52, 152, 219)"
    },
    {
      id: "blue_plus",
      name: "蛋雅深蓝",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(77, 131, 175)",
      colorTheme: "rgb(77, 131, 175)"
    },
    {
      id: "orange",
      name: "橙黄橘绿",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(245, 171, 53)",
      colorTheme: "rgb(245, 171, 53)"
    },
    {
      id: "red",
      name: "热情似火",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(214, 69, 65)",
      colorTheme: "rgb(214, 69, 65)"
    },
    {
      id: "pink",
      name: "粉装玉琢",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(241, 130, 141)",
      colorTheme: "rgb(241, 130, 141)"
    },
    {
      id: "purple",
      name: "重斤球紫",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(155, 89, 182)",
      colorTheme: "rgb(155, 89, 182)"
    },
    {
      id: "grey",
      name: "灰常美丽",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(108, 122, 137)",
      colorTheme: "rgb(108, 122, 137)"
    },
    {
      id: "ming",
      name: "青出于黑",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(51, 110, 123)",
      colorTheme: "rgb(51, 110, 123)"
    },
    {
      id: "blue2",
      name: "清热板蓝",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(79, 98, 208)",
      colorTheme: "rgb(79, 98, 208)"
    },
    {
      id: "black",
      name: "黑灯瞎火",
      isDark: true,
      isCustom: false,
      colorPrimary: "rgb(150, 150, 150)",
      colorTheme: "rgb(59,59,59)"
    },
    {
      id: "mid_autumn",
      name: "月里嫦娥",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(74, 55, 82)",
      colorTheme: "rgb(74, 55, 82)"
    },
    {
      id: "naruto",
      name: "木叶之村",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(87, 144, 167)",
      colorTheme: "rgb(87, 144, 167)"
    },
    {
      id: "china_ink",
      name: "近墨者黑",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgba(47, 47, 47, 1)",
      colorTheme: "rgba(47, 47, 47, 1)"
    },
    {
      id: "happy_new_year",
      name: "新年快乐",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(192, 57, 43)",
      colorTheme: "rgb(192, 57, 43)"
    }
  ];
  const DEFAULT_BILI_PINK_THEME = {
    id: "default-bili-pink",
    name: "B站粉",
    isDark: false,
    isCustom: false,
    colorPrimary: "#ff6699"
  };
  const COLOR_PICKER_THEME = {
    id: "color-picker",
    name: "自定义",
    isDark: false,
    isCustom: true,
    colorPrimary: "#ff6699"
  };
  function toThemes(groupName, definitionStr) {
    return definitionStr.split("\n").map((s) => s.trim()).filter(Boolean).map((line2) => {
      const [colorPrimary, name] = line2.split(" ").filter(Boolean);
      return {
        id: groupName + ":" + name,
        name,
        colorPrimary
      };
    });
  }
  const LongwashingGroupName = "UP长期洗涤";
  const LongwashingThemes = toThemes(LongwashingGroupName, `
  #0545b2 理想之蓝
  #f4cd00 柠檬黄
  #ef2729 石榴红
  #f89c00 鹿箭
  #233728 黛绿
  #f2b9b7 和熙粉
  #f3cc91 芝士黄
  #6b4c68 葡萄紫
  #ff7227 落日橙
  #004d62 碧海天
  #23909b 洗碧空
  #aeb400 芥丝绿
  #425a17 箬叶青

  #002fa7 克莱因蓝
  #003153 普鲁士蓝
  #01847f 马尔斯绿
  #fbd26a 申布伦黄
  #470024 勃艮第红
  #492d22 凡戴克棕
  `);
  const BIBIBILI_EVOLVED_SYNC_ID = "bilibili-evolved-sync";
  const ThemeGroups = [{
    name: "预设",
    themes: [DEFAULT_BILI_PINK_THEME, {
      id: "bilibili-blue",
      name: "B站蓝",
      colorPrimary: "#00aeec"
    }, {
      id: "app-靓紫",
      name: "靓紫",
      colorPrimary: "#8500ff"
    }, {
      id: BIBIBILI_EVOLVED_SYNC_ID,
      name: "B-Evolved",
      colorPrimary: "var(--theme-color, #f69)",
      tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
        "使用 Bilibili-Evolved 的主题色",
        /* @__PURE__ */ jsx$1("br", {}),
        "在 Bilibili-Evolved 设置中修改主题色后可能需要刷新页面同步"
      ] })
    }, COLOR_PICKER_THEME]
  }, {
    name: "移动端",
    themes: [{
      id: "app-custom-高能红",
      name: "高能红",
      colorPrimary: "#fd453e"
    }, {
      id: "app-custom-咸蛋黄",
      name: "咸蛋黄",
      colorPrimary: "#ffc034"
    }, {
      id: "app-custom-早苗绿",
      name: "早苗绿",
      colorPrimary: "#85c255"
    }, {
      id: "app-custom-宝石蓝",
      name: "宝石蓝",
      colorPrimary: "#0095ef"
    }, {
      id: "app-custom-罗兰紫",
      name: "罗兰紫",
      colorPrimary: "#a029ac"
    }]
  }, {
    name: "LX Themes",
    themes: LX_THEMES,
    tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
      "提取自",
      " ",
      /* @__PURE__ */ jsx$1("a", { target: "_blank", href: "https://github.com/lyswhut/lx-music-desktop/", children: "lx-music-desktop" }),
      /* @__PURE__ */ jsx$1("br", {}),
      "Apache License 2.0"
    ] })
  }, {
    name: LongwashingGroupName,
    themes: LongwashingThemes,
    tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
      "提取自",
      " ",
      /* @__PURE__ */ jsx$1("a", { target: "_blank", href: "https://www.bilibili.com/video/BV1g3411u7Lg/", children: "BV1g3411u7Lg" }),
      " ",
      "&",
      " ",
      /* @__PURE__ */ jsx$1("a", { target: "_blank", href: "https://www.bilibili.com/video/BV1xu411q7sU/", children: "BV1xu411q7sU" })
    ] })
  }];
  const ALL_THEMES = ThemeGroups.map((x) => x.themes).flat();
  function useCurrentTheme() {
    let {
      theme: themeId,
      colorPickerThemeSelectedColor
    } = useSettingsSnapshot();
    themeId || (themeId = DEFAULT_BILI_PINK_THEME.id);
    return React.useMemo(() => {
      const theme2 = ALL_THEMES.find((t) => t.id === themeId) || DEFAULT_BILI_PINK_THEME;
      if (theme2.id === COLOR_PICKER_THEME.id && colorPickerThemeSelectedColor) {
        return {
          ...theme2,
          colorPrimary: colorPickerThemeSelectedColor
        };
      }
      return theme2;
    }, [themeId, colorPickerThemeSelectedColor]);
  }
  function useColorPrimaryHex() {
    const currentTheme = useCurrentTheme();
    const evolvedThemeColor = $evolvedThemeColor.use();
    let colorPrimary = currentTheme.colorPrimary;
    if (currentTheme.id === BIBIBILI_EVOLVED_SYNC_ID) {
      colorPrimary = evolvedThemeColor || DEFAULT_BILI_PINK_THEME.colorPrimary;
    }
    return colorPrimary;
  }
  var _ref$r = {
    name: "1ughwg6",
    styles: ".bili-feed4 .bili-header{min-height:64px!important;}"
  };
  var _ref2$l = {
    name: "19h4ou9",
    styles: "body,.large-header,#i_cecream,.bili-header .bili-header__channel{background-color:var(--bg2);}.bili-header .bili-header__channel .channel-entry-more__link,.bili-header .bili-header__channel .channel-link{background-color:var(--bg1);}"
  };
  var _ref3$f = {
    name: "ykj9m0",
    styles: "body{background-color:var(--bg1);}"
  };
  var _ref4$9 = {
    name: "xrkb6a",
    styles: "#i_cecream .bili-feed4-layout{display:none;}.desktop-download-tip,.vip-login-tip,.palette-button-adcard{display:none!important;}"
  };
  function GlobalStyle() {
    const colorPrimary = useColorPrimaryHex();
    const {
      pureRecommend,
      style
    } = useSettingsSnapshot();
    const dark = useIsDarkMode();
    useColors();
    const backToTopRight = useBackToTopRight();
    const usingEvolevdHeader = $usingEvolevdHeader.use();
    const width = $headerWidth.use() ?? 90;
    const padding = "0 10px";
    const more = [useAntLinkColorGlobalCss()];
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(Global, { styles: [css`
            :root {
              ${appColorPrimaryId}: ${colorPrimary};
              ${appBgId}: ${dark ? "#222" : style.pureRecommend.useWhiteBackground ? `var(--bg1)` : `var(--bg2)`};
            }
          `, more, "", ""] }),
      pureRecommend && /* @__PURE__ */ jsx$1(Global, { styles: [
        _ref4$9,
        style.pureRecommend.useCustomGrid && /* @__PURE__ */ css("#i_cecream,.bili-feed4 .bili-header,.bili-feed4 .bili-header .bili-header__bar{max-width:unset;}.bili-feed4-layout,.bili-feed4 .bili-header .bili-header__channel{max-width:", width, "%;padding:", padding, ";}", ""),
        style.pureRecommend.useCustomGrid && typeof backToTopRight === "number" && /* @__PURE__ */ css(".", APP_CLS_ROOT, "{--back-top-right:", backToTopRight, "px;}", ""),
        /**
         * extra background-color work for `PureRecommend`
         */
        style.pureRecommend.useWhiteBackground ? _ref3$f : _ref2$l,
        style.pureRecommend.hideTopChannel && /* @__PURE__ */ css(".bili-header__channel,.bili-header__banner{display:none!important;}", !usingEvolevdHeader && _ref$r, " .bili-feed4 .bili-header .bili-header__bar{&.slide-down,&:not(.slide-down){animation:headerSlideDown 0.3s linear forwards!important;box-shadow:0 2px 4px ", dark ? "rgb(255 255 255 / 5%)" : "rgb(0 0 0 / 8%)", "!important;}}.bili-header__bar:not(.slide-down){background-color:var(--bg1);color:var(--text1);transition:background-color 0.2s linear;animation-name:headerSlideDown;.left-entry{.mini-header__title,.entry-title,.default-entry,.loc-mc-box__text,.download-entry,.loc-entry{color:var(--text1);}}.right-entry .right-entry__outside{.right-entry-text,.right-entry-icon{color:var(--text2);}}}.area-header-wrapper{margin-top:10px;}", ""),
        "",
        ""
      ] })
    ] });
  }
  cache$5.compat = true;
  function compose(...fns) {
    return function(c2) {
      return fns.reduceRight((content, fn) => fn(content), c2);
    };
  }
  function AntdApp({
    children,
    injectGlobalStyle = false,
    renderAppComponent = false,
    emotionCache = cache$5,
    styleProviderProps
  }) {
    const dark = useIsDarkMode();
    const colorPrimary = useColorPrimaryHex();
    const wrap = compose(
      // emotion cache
      (c2) => /* @__PURE__ */ jsx$1(CacheProvider, { value: emotionCache, children: c2 }),
      // antd style
      (c2) => /* @__PURE__ */ jsx$1(cssinjs.StyleProvider, { ...styleProviderProps, children: c2 }),
      // antd config
      (c2) => /* @__PURE__ */ jsx$1(antd.ConfigProvider, { locale: zhCN, button: {
        autoInsertSpace: false
      }, theme: {
        cssVar: true,
        algorithm: dark ? antd.theme.darkAlgorithm : antd.theme.defaultAlgorithm,
        token: {
          colorPrimary,
          colorBgSpotlight: colorPrimary,
          // tooltip bg
          zIndexPopupBase: 11e3,
          // base-modal 10002
          fontFamily: appUsingFont
        },
        components: {
          Notification: {
            zIndexPopup: 11e3
          }
          // Message: {
          //   contentBg: colorPrimary,
          //   colorText: '#fff',
          // },
        }
      }, children: c2 })
    );
    return wrap(/* @__PURE__ */ jsxs(Fragment, { children: [
      renderAppComponent && /* @__PURE__ */ jsx$1(UseApp, {}),
      injectGlobalStyle && /* @__PURE__ */ jsx$1(GlobalStyle, {}),
      children
    ] }));
  }
  function useRefState(initialValue2) {
    const [state, setState] = React.useState(initialValue2);
    const ref = React.useRef(state);
    const setStateWraped = React.useCallback((payload) => {
      const nextState = typeof payload === "function" ? payload(ref.current) : payload;
      ref.current = nextState;
      setState(nextState);
    }, [setState]);
    const getState = React.useCallback(() => ref.current, []);
    return [state, setStateWraped, getState];
  }
  function useRefStateBox(initialValue2) {
    const [state, set2, get2] = useRefState(initialValue2);
    const box = React.useMemo(() => ({
      state,
      // use state in render, other case use `.val`
      get: get2,
      set: set2,
      get val() {
        return get2();
      },
      set val(newValue) {
        set2(newValue);
      }
    }), [get2, set2]);
    box.state = state;
    return box;
  }
  function useRefBox(initialValue2) {
    const ref = React.useRef(initialValue2);
    const get2 = React.useCallback(() => ref.current, []);
    const set2 = React.useCallback((newValue) => ref.current = newValue, []);
    return React.useMemo(() => ({
      get: get2,
      set: set2,
      get val() {
        return get2();
      },
      set val(newValue) {
        set2(newValue);
      }
    }), [get2, set2]);
  }
  function tweakColorWithOklch(originalColor, {
    l,
    c: c2,
    h,
    alpha,
    deltaL,
    deltaC,
    deltaH,
    deltaAlpha
  } = {}) {
    const lValue = l ?? (deltaL ? `calc(l + ${deltaL})` : "l");
    const cValue = c2 ?? (deltaC ? `calc(c + ${deltaC})` : "c");
    const hValue = h ?? (deltaH ? `calc(h + ${deltaH})` : "h");
    const alphaValue = alpha ?? (deltaAlpha ? `calc(alpha + ${deltaAlpha})` : "");
    const alphaComponent = alphaValue ? `/ ${alphaValue}` : "";
    return `oklch(from ${originalColor} ${[lValue, cValue, hValue, alphaComponent].filter(Boolean).join(" ")})`;
  }
  function tweakLightness(originalColor, delta) {
    return tweakColorWithOklch(originalColor, {
      deltaL: delta
    });
  }
  function getClassList(className) {
    return uniq((className || "").split(" ").map((x) => x.trim()).filter(Boolean));
  }
  function hasSize(className) {
    return getClassList(className).some((x) => x.startsWith("size-"));
  }
  function hasMarginLeft(className) {
    const classList = getClassList(className);
    return classList.some((x) => x.startsWith("ml-") || x.startsWith("mx-"));
  }
  function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx() {
    for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
  }
  const iconParkOutlineClose = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, d: "m8 8l32 32M8 40L40 8" }) });
  const ForwardRef$u = React.forwardRef(iconParkOutlineClose);
  const BaseModalStyle = {
    modalMask: {
      name: "mf58g4",
      styles: "position:fixed;left:0;top:0;right:0;bottom:0;background-color:rgba(0, 0, 0, 0.5);z-index:10002;display:flex;align-items:center;justify-content:center"
    },
    modal: {
      name: "ozops8",
      styles: "width:500px;max-height:calc(90vh - 50px);background-color:#fff;border-radius:10px;padding:0 15px 15px 15px;display:flex;flex-direction:column;overflow:hidden"
    },
    modalHeader: {
      name: "18tqhux",
      styles: "padding-top:10px;padding-bottom:10px;border-bottom:none;display:flex;align-items:center"
    },
    modalBody: {
      name: "oytyiq",
      styles: "padding-top:0;flex-grow:1;overflow-y:scroll"
    },
    modalTitle: {
      name: "m8duop",
      styles: "font-size:1.5rem;margin-bottom:0;line-height:1.5;display:flex;align-items:center"
    },
    btnClose: /* @__PURE__ */ css("margin-left:10px;svg{width:10px;height:10px;margin-right:3px;margin-top:-1px;}:global(", appClsDarkSelector, ") &{color:#eee!important;background-color:#333!important;border-color:transparent!important;height:auto;padding:8px 12px;line-height:16px;font-size:13px;}", "")
  };
  let showedCount = 0;
  const modalShowCheck = () => {
    showedCount++;
    document.body.style.overflow = "hidden";
  };
  const modalHideCheck = () => {
    showedCount--;
    if (showedCount < 0) showedCount = 0;
    if (showedCount === 0) {
      document.body.style.overflow = "";
    }
  };
  function BaseModal({
    show,
    onHide: onHide2,
    children,
    clsModalMask,
    cssModalMask,
    clsModal,
    cssModal,
    width,
    hideWhenMaskOnClick = false,
    hideWhenEsc = false
  }) {
    React.useLayoutEffect(() => {
      if (show) {
        modalShowCheck();
      } else {
        modalHideCheck();
      }
    }, [show]);
    const wrapperRef = React.useRef(null);
    const isDarkMode = useIsDarkMode();
    const {
      bg,
      c: c2
    } = React.useMemo(() => {
      const bg2 = window.getComputedStyle(document.body).backgroundColor;
      const c22 = window.getComputedStyle(document.body).color;
      return {
        bg: bg2,
        c: c22
      };
    }, [isDarkMode]);
    const wrapperStyle = React.useMemo(() => {
      return isDarkMode ? {
        "--bg": bg,
        "--c": c2,
        "backgroundColor": bg,
        "color": c2
      } : (
        // 白色不用特殊处理
        {}
      );
    }, [bg, c2, isDarkMode]);
    const containerId = React.useId();
    const container = React.useMemo(() => {
      const div = document.createElement("div");
      div.classList.add(APP_CLS_ROOT);
      div.setAttribute("data-id", "base-modal-" + containerId);
      document.body.appendChild(div);
      return div;
    }, []);
    const onMaskClick = useMemoizedFn((e) => {
      var _a2;
      const target = e.target;
      if ((_a2 = wrapperRef.current) == null ? void 0 : _a2.contains(target)) return;
      if (target.closest('.ant-tooltip-inner[role="tooltip"]')) return;
      if (target.closest('.ant-popover-inner[role="tooltip"]')) return;
      if (target.closest(".ant-select-dropdown")) return;
      if (hideWhenMaskOnClick) {
        onHide2();
      }
    });
    useKeyPress("esc", (e) => {
      if (!show) return;
      if (hideWhenEsc) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setTimeout(onHide2);
      }
    });
    if (!show) {
      return null;
    }
    return require$$0.createPortal(/* @__PURE__ */ jsx$1("div", { className: clsModalMask, css: [BaseModalStyle.modalMask, cssModalMask, "", ""], onClick: onMaskClick, children: /* @__PURE__ */ jsx$1("div", { style: {
      ...wrapperStyle,
      width
    }, className: clsModal, css: [BaseModalStyle.modal, cssModal, "", ""], ref: wrapperRef, children }) }), container);
  }
  const ModalClose = ({
    className,
    ...props
  }) => {
    return /* @__PURE__ */ jsx$1(ForwardRef$u, { ...props, className: clsx("cursor-pointer", !hasSize(className) && "size-18px", !hasMarginLeft(className) && "ml-10px", className) });
  };
  var client = {};
  var hasRequiredClient;
  function requireClient() {
    if (hasRequiredClient) return client;
    hasRequiredClient = 1;
    var m = require$$0;
    {
      client.createRoot = m.createRoot;
      client.hydrateRoot = m.hydrateRoot;
    }
    return client;
  }
  var clientExports = requireClient();
  function supportAvif() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = (err) => resolve(false);
      img.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
    });
  }
  const shouldUseAvif = !isSafari && await( supportAvif());
  function getAvatarSrc(avatar) {
    const suffix = shouldUseAvif ? ".avif" : ".webp";
    return `${avatar}@96w_96h_1c_1s_!web-avatar${suffix}`;
  }
  function preloadImg(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  }
  class QuickLRU extends Map {
    constructor(options = {}) {
      super();
      __privateAdd(this, _QuickLRU_instances);
      __privateAdd(this, _size2, 0);
      __privateAdd(this, _cache, /* @__PURE__ */ new Map());
      __privateAdd(this, _oldCache, /* @__PURE__ */ new Map());
      __privateAdd(this, _maxSize);
      __privateAdd(this, _maxAge);
      __privateAdd(this, _onEviction);
      if (!(options.maxSize && options.maxSize > 0)) {
        throw new TypeError("`maxSize` must be a number greater than 0");
      }
      if (typeof options.maxAge === "number" && options.maxAge === 0) {
        throw new TypeError("`maxAge` must be a number greater than 0");
      }
      __privateSet(this, _maxSize, options.maxSize);
      __privateSet(this, _maxAge, options.maxAge || Number.POSITIVE_INFINITY);
      __privateSet(this, _onEviction, options.onEviction);
    }
    // For tests.
    get __oldCache() {
      return __privateGet(this, _oldCache);
    }
    get(key) {
      if (__privateGet(this, _cache).has(key)) {
        const item = __privateGet(this, _cache).get(key);
        return __privateMethod(this, _QuickLRU_instances, getItemValue_fn).call(this, key, item);
      }
      if (__privateGet(this, _oldCache).has(key)) {
        const item = __privateGet(this, _oldCache).get(key);
        if (__privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, item) === false) {
          __privateMethod(this, _QuickLRU_instances, moveToRecent_fn).call(this, key, item);
          return item.value;
        }
      }
    }
    set(key, value, { maxAge = __privateGet(this, _maxAge) } = {}) {
      const expiry = typeof maxAge === "number" && maxAge !== Number.POSITIVE_INFINITY ? Date.now() + maxAge : void 0;
      if (__privateGet(this, _cache).has(key)) {
        __privateGet(this, _cache).set(key, {
          value,
          expiry
        });
      } else {
        __privateMethod(this, _QuickLRU_instances, set_fn).call(this, key, { value, expiry });
      }
      return this;
    }
    has(key) {
      if (__privateGet(this, _cache).has(key)) {
        return !__privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, __privateGet(this, _cache).get(key));
      }
      if (__privateGet(this, _oldCache).has(key)) {
        return !__privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, __privateGet(this, _oldCache).get(key));
      }
      return false;
    }
    peek(key) {
      if (__privateGet(this, _cache).has(key)) {
        return __privateMethod(this, _QuickLRU_instances, peek_fn).call(this, key, __privateGet(this, _cache));
      }
      if (__privateGet(this, _oldCache).has(key)) {
        return __privateMethod(this, _QuickLRU_instances, peek_fn).call(this, key, __privateGet(this, _oldCache));
      }
    }
    delete(key) {
      const deleted = __privateGet(this, _cache).delete(key);
      if (deleted) {
        __privateWrapper(this, _size2)._--;
      }
      return __privateGet(this, _oldCache).delete(key) || deleted;
    }
    clear() {
      __privateGet(this, _cache).clear();
      __privateGet(this, _oldCache).clear();
      __privateSet(this, _size2, 0);
    }
    resize(newSize) {
      if (!(newSize && newSize > 0)) {
        throw new TypeError("`maxSize` must be a number greater than 0");
      }
      const items = [...__privateMethod(this, _QuickLRU_instances, entriesAscending_fn).call(this)];
      const removeCount = items.length - newSize;
      if (removeCount < 0) {
        __privateSet(this, _cache, new Map(items));
        __privateSet(this, _oldCache, /* @__PURE__ */ new Map());
        __privateSet(this, _size2, items.length);
      } else {
        if (removeCount > 0) {
          __privateMethod(this, _QuickLRU_instances, emitEvictions_fn).call(this, items.slice(0, removeCount));
        }
        __privateSet(this, _oldCache, new Map(items.slice(removeCount)));
        __privateSet(this, _cache, /* @__PURE__ */ new Map());
        __privateSet(this, _size2, 0);
      }
      __privateSet(this, _maxSize, newSize);
    }
    *keys() {
      for (const [key] of this) {
        yield key;
      }
    }
    *values() {
      for (const [, value] of this) {
        yield value;
      }
    }
    *[Symbol.iterator]() {
      for (const item of __privateGet(this, _cache)) {
        const [key, value] = item;
        const deleted = __privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, value);
        if (deleted === false) {
          yield [key, value.value];
        }
      }
      for (const item of __privateGet(this, _oldCache)) {
        const [key, value] = item;
        if (!__privateGet(this, _cache).has(key)) {
          const deleted = __privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, value);
          if (deleted === false) {
            yield [key, value.value];
          }
        }
      }
    }
    *entriesDescending() {
      let items = [...__privateGet(this, _cache)];
      for (let i = items.length - 1; i >= 0; --i) {
        const item = items[i];
        const [key, value] = item;
        const deleted = __privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, value);
        if (deleted === false) {
          yield [key, value.value];
        }
      }
      items = [...__privateGet(this, _oldCache)];
      for (let i = items.length - 1; i >= 0; --i) {
        const item = items[i];
        const [key, value] = item;
        if (!__privateGet(this, _cache).has(key)) {
          const deleted = __privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, value);
          if (deleted === false) {
            yield [key, value.value];
          }
        }
      }
    }
    *entriesAscending() {
      for (const [key, value] of __privateMethod(this, _QuickLRU_instances, entriesAscending_fn).call(this)) {
        yield [key, value.value];
      }
    }
    get size() {
      if (!__privateGet(this, _size2)) {
        return __privateGet(this, _oldCache).size;
      }
      let oldCacheSize = 0;
      for (const key of __privateGet(this, _oldCache).keys()) {
        if (!__privateGet(this, _cache).has(key)) {
          oldCacheSize++;
        }
      }
      return Math.min(__privateGet(this, _size2) + oldCacheSize, __privateGet(this, _maxSize));
    }
    get maxSize() {
      return __privateGet(this, _maxSize);
    }
    entries() {
      return this.entriesAscending();
    }
    forEach(callbackFunction, thisArgument = this) {
      for (const [key, value] of this.entriesAscending()) {
        callbackFunction.call(thisArgument, value, key, this);
      }
    }
    get [Symbol.toStringTag]() {
      return JSON.stringify([...this.entriesAscending()]);
    }
  }
  _size2 = new WeakMap();
  _cache = new WeakMap();
  _oldCache = new WeakMap();
  _maxSize = new WeakMap();
  _maxAge = new WeakMap();
  _onEviction = new WeakMap();
  _QuickLRU_instances = new WeakSet();
  emitEvictions_fn = function(cache2) {
    if (typeof __privateGet(this, _onEviction) !== "function") {
      return;
    }
    for (const [key, item] of cache2) {
      __privateGet(this, _onEviction).call(this, key, item.value);
    }
  };
  deleteIfExpired_fn = function(key, item) {
    if (typeof item.expiry === "number" && item.expiry <= Date.now()) {
      if (typeof __privateGet(this, _onEviction) === "function") {
        __privateGet(this, _onEviction).call(this, key, item.value);
      }
      return this.delete(key);
    }
    return false;
  };
  getOrDeleteIfExpired_fn = function(key, item) {
    const deleted = __privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, item);
    if (deleted === false) {
      return item.value;
    }
  };
  getItemValue_fn = function(key, item) {
    return item.expiry ? __privateMethod(this, _QuickLRU_instances, getOrDeleteIfExpired_fn).call(this, key, item) : item.value;
  };
  peek_fn = function(key, cache2) {
    const item = cache2.get(key);
    return __privateMethod(this, _QuickLRU_instances, getItemValue_fn).call(this, key, item);
  };
  set_fn = function(key, value) {
    __privateGet(this, _cache).set(key, value);
    __privateWrapper(this, _size2)._++;
    if (__privateGet(this, _size2) >= __privateGet(this, _maxSize)) {
      __privateSet(this, _size2, 0);
      __privateMethod(this, _QuickLRU_instances, emitEvictions_fn).call(this, __privateGet(this, _oldCache));
      __privateSet(this, _oldCache, __privateGet(this, _cache));
      __privateSet(this, _cache, /* @__PURE__ */ new Map());
    }
  };
  moveToRecent_fn = function(key, item) {
    __privateGet(this, _oldCache).delete(key);
    __privateMethod(this, _QuickLRU_instances, set_fn).call(this, key, item);
  };
  entriesAscending_fn = function* () {
    for (const item of __privateGet(this, _oldCache)) {
      const [key, value] = item;
      if (!__privateGet(this, _cache).has(key)) {
        const deleted = __privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, value);
        if (deleted === false) {
          yield item;
        }
      }
    }
    for (const item of __privateGet(this, _cache)) {
      const [key, value] = item;
      const deleted = __privateMethod(this, _QuickLRU_instances, deleteIfExpired_fn).call(this, key, value);
      if (deleted === false) {
        yield item;
      }
    }
  };
  async function videoshot(bvid) {
    const res = await request.get("/x/player/videoshot", {
      params: {
        bvid,
        index: "1"
      }
    });
    const json = res.data;
    if (!isWebApiSuccess(json)) {
      appWarn("videoshot error for %s: %o", bvid, json);
    }
    if (!isVideoshotDataValid(json.data)) {
      appWarn("videoshot data invalid bvid=%s: %o", bvid, json.data);
    }
    return json;
  }
  function isVideoshotDataValid(videoshotData) {
    var _a2, _b2;
    return !!(((_a2 = videoshotData == null ? void 0 : videoshotData.image) == null ? void 0 : _a2.length) && ((_b2 = videoshotData == null ? void 0 : videoshotData.index) == null ? void 0 : _b2.length));
  }
  function isVideoshotJsonCacheable(json) {
    const success = isWebApiSuccess(json);
    if (!success) {
      return true;
    } else {
      return isVideoshotDataValid(json.data);
    }
  }
  const cache$3 = new QuickLRU({
    maxSize: 1e4
  });
  async function fetchVideoData(bvid) {
    if (cache$3.has(bvid)) {
      const cached = cache$3.get(bvid);
      if (cached) return cached;
    }
    let retryTimes = 0;
    let videoshotJson;
    do {
      retryTimes++;
      videoshotJson = await videoshot(bvid);
      if (isVideoshotJsonCacheable(videoshotJson)) {
        break;
      } else {
        await delay(500);
      }
    } while (retryTimes < 3);
    const cacheable = isVideoshotJsonCacheable(videoshotJson);
    if (cacheable) {
      cache$3.set(bvid, {
        videoshotJson
      });
    }
    const videoshotData = videoshotJson.data;
    if (settings.autoPreviewWhenHover) {
      const imgs = (videoshotData == null ? void 0 : videoshotData.image) || [];
      await preloadImg(imgs[0]);
      (async () => {
        for (const src of imgs.slice(1)) {
          await preloadImg(src);
        }
      })();
    }
    return {
      videoshotJson
    };
  }
  function watchlaterFactory(action2) {
    return async function watchlaterOp(avid) {
      const form = new URLSearchParams({
        aid: avid,
        csrf: getCsrfToken()
      });
      const res = await request.post("/x/v2/history/toview/" + action2, form);
      const json = res.data;
      const success = isWebApiSuccess(json);
      if (!success) {
        toast((json == null ? void 0 : json.message) || "出错了");
      }
      return success;
    };
  }
  const watchlaterAdd = watchlaterFactory("add");
  const watchlaterDel = watchlaterFactory("del");
  const dislikeFactory = (type) => {
    const pathname2 = {
      dislike: "/x/feed/dislike",
      cancel: "/x/feed/dislike/cancel"
    }[type];
    return async function(item, reasonId) {
      const res = await gmrequest.get(HOST_APP + pathname2, {
        params: {
          goto: item.goto,
          id: item.param,
          // mid: item.mid,
          // rid: item.tid,
          // tag_id: item.tag?.tag_id,
          reason_id: reasonId,
          // other stuffs
          build: "1",
          mobi_app: "android",
          idx: (Date.now() / 1e3).toFixed(0)
        }
      });
      const json = res.data;
      const success = isWebApiSuccess(json);
      let message2 = json.message;
      if (!success) {
        message2 || (message2 = OPERATION_FAIL_MSG);
        message2 += `(code ${json.code})`;
        message2 += "\n请重新获取 access_key 后重试";
      }
      return {
        success,
        json,
        message: message2
      };
    };
  };
  const dislike = dislikeFactory("dislike");
  const cancelDislike = dislikeFactory("cancel");
  const svgSpinnersBarsRotateFade = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx$1("rect", { width: 2, height: 5, x: 11, y: 1, fill: "currentColor", opacity: 0.14 }),
    /* @__PURE__ */ jsx$1("rect", { width: 2, height: 5, x: 11, y: 1, fill: "currentColor", opacity: 0.29, transform: "rotate(30 12 12)" }),
    /* @__PURE__ */ jsx$1("rect", { width: 2, height: 5, x: 11, y: 1, fill: "currentColor", opacity: 0.43, transform: "rotate(60 12 12)" }),
    /* @__PURE__ */ jsx$1("rect", { width: 2, height: 5, x: 11, y: 1, fill: "currentColor", opacity: 0.57, transform: "rotate(90 12 12)" }),
    /* @__PURE__ */ jsx$1("rect", { width: 2, height: 5, x: 11, y: 1, fill: "currentColor", opacity: 0.71, transform: "rotate(120 12 12)" }),
    /* @__PURE__ */ jsx$1("rect", { width: 2, height: 5, x: 11, y: 1, fill: "currentColor", opacity: 0.86, transform: "rotate(150 12 12)" }),
    /* @__PURE__ */ jsx$1("rect", { width: 2, height: 5, x: 11, y: 1, fill: "currentColor", transform: "rotate(180 12 12)" }),
    /* @__PURE__ */ jsx$1("animateTransform", { attributeName: "transform", calcMode: "discrete", dur: "0.75s", repeatCount: "indefinite", type: "rotate", values: "0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12" })
  ] }) });
  const ForwardRef$t = React.forwardRef(svgSpinnersBarsRotateFade);
  const dislikedIds = proxyMap();
  function useDislikedIds() {
    return useSnapshot(dislikedIds);
  }
  function useDislikedReason(id) {
    const map = useDislikedIds();
    if (!id) return void 0;
    return map.get(id);
  }
  function delDislikeId(id) {
    dislikedIds.delete(id);
  }
  var _ref$q = {
    name: "iqoq9n",
    styles: "margin-top:20px"
  };
  var _ref2$k = {
    name: "1crg5pf",
    styles: "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between"
  };
  var _ref3$e = {
    name: "1mp6qp1",
    styles: "font-size:60%;margin-top:7px"
  };
  function ModalDislike({
    show,
    onHide: onHide2,
    item
  }) {
    const $req = useRequest(async (item2, reason) => dislike(item2, reason.id), {
      manual: true
    });
    const onDislike = useLockFn(async (reason) => {
      if (!item) return;
      let success = false;
      let message2 = "";
      let err;
      try {
        ;
        ({
          success,
          message: message2
        } = await $req.runAsync(item, reason));
      } catch (e) {
        err = e;
      }
      if (err) {
        console.error(err.stack || err);
        return toastRequestFail();
      }
      if (success) {
        antMessage.success("已标记不想看");
        dislikedIds.set(item.param, {
          ...reason
        });
        await delay(100);
        onHide2();
      } else {
        antMessage.error(message2 || OPERATION_FAIL_MSG);
      }
    });
    const reasons = React.useMemo(() => {
      var _a2;
      return ((_a2 = item == null ? void 0 : item.three_point) == null ? void 0 : _a2.dislike_reasons) || [];
    }, [item]);
    const modalBodyRef = React.useRef(null);
    const keyPressEnabled = () => !!show && !!item;
    const KEYS = ["1", "2", "3", "4", "5", "6"];
    useKeyPress(KEYS, (e) => {
      var _a2;
      if (!keyPressEnabled()) return;
      if (!KEYS.includes(e.key)) return;
      const index = Number(e.key) - 1;
      setActiveIndex(index);
      const btn = (_a2 = modalBodyRef.current) == null ? void 0 : _a2.querySelectorAll(".reason")[index];
      btn == null ? void 0 : btn.click();
    });
    const [activeIndex, setActiveIndex] = React.useState(reasons.length - 1);
    useUpdateLayoutEffect(() => {
      setActiveIndex(reasons.length - 1);
    }, [reasons]);
    const increaseIndex = (by) => {
      return () => {
        if (!keyPressEnabled()) return;
        const newIndex = activeIndex + by;
        if (newIndex < 0 || newIndex > reasons.length - 1) return;
        setActiveIndex(newIndex);
      };
    };
    useKeyPress("leftarrow", increaseIndex(-1), {
      exactMatch: true
    });
    useKeyPress("rightarrow", increaseIndex(1), {
      exactMatch: true
    });
    useKeyPress("uparrow", increaseIndex(-2), {
      exactMatch: true
    });
    useKeyPress("downarrow", increaseIndex(2), {
      exactMatch: true
    });
    useKeyPress("enter", (e) => {
      var _a2;
      if (!keyPressEnabled()) return;
      if (activeIndex < 0 || activeIndex > reasons.length - 1) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const btn = (_a2 = modalBodyRef.current) == null ? void 0 : _a2.querySelector(".reason.active");
      btn == null ? void 0 : btn.click();
    }, {
      exactMatch: true
    });
    const activeReasonName = React.useMemo(() => {
      var _a2;
      return ((_a2 = reasons[activeIndex]) == null ? void 0 : _a2.name) || "";
    }, [reasons, activeIndex]);
    return /* @__PURE__ */ jsxs(BaseModal, { show, onHide: onHide2, hideWhenMaskOnClick: true, hideWhenEsc: true, width: 500, children: [
      /* @__PURE__ */ jsxs("div", { css: BaseModalStyle.modalHeader, children: [
        /* @__PURE__ */ jsxs("div", { css: BaseModalStyle.modalTitle, children: [
          /* @__PURE__ */ jsx$1(IconForDislike, { className: "size-25" }),
          /* @__PURE__ */ jsx$1("span", { className: "m-inline-5", children: "我不想看" }),
          /* @__PURE__ */ jsx$1("span", { css: _ref3$e, children: "(选择后将减少相似内容推荐)" })
        ] }),
        /* @__PURE__ */ jsx$1("div", { className: "flex-1" }),
        /* @__PURE__ */ jsx$1(ModalClose, { onClick: onHide2 })
      ] }),
      /* @__PURE__ */ jsxs("div", { css: BaseModalStyle.modalBody, ref: modalBodyRef, children: [
        /* @__PURE__ */ jsx$1(antd.Spin, { spinning: $req.loading, indicator: /* @__PURE__ */ jsx$1(ForwardRef$t, { css: /* @__PURE__ */ css("color:", colorPrimaryValue, ";.ant-spin .ant-spin-dot&{width:25px;height:25px;}", "") }), children: /* @__PURE__ */ jsx$1("div", { className: "reason-list", css: _ref2$k, children: reasons.map((reason, index) => {
          const active = index === activeIndex;
          return /* @__PURE__ */ jsxs("button", { className: clsx("reason", {
            active
          }), css: [S$8.reason, active && S$8.reasonActive, "", ""], "data-id": reason.id, disabled: $req.loading, onClick: () => {
            setActiveIndex(index);
            onDislike(reason);
          }, children: [
            /* @__PURE__ */ jsx$1("span", { className: "reason-no", css: /* @__PURE__ */ css("position:absolute;left:6px;width:20px;height:20px;border-radius:50%;top:", (32 - 20) / 2, "px;display:flex;align-items:center;justify-content:center;background-color:", colorPrimaryValue, ";color:#fff;", ""), children: index + 1 }),
            reason.name
          ] }, reason.id);
        }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "tips-container", css: _ref$q, children: [
          /* @__PURE__ */ jsxs("div", { className: "tips", css: S$8.tips, children: [
            /* @__PURE__ */ jsx$1(IconForInfo, { className: "mr-5 size-15" }),
            "使用删除键打开弹窗, 数字键选择, Esc 关闭"
          ] }),
          activeReasonName && /* @__PURE__ */ jsxs("div", { className: "tips", css: S$8.tips, children: [
            /* @__PURE__ */ jsx$1(IconForInfo, { className: "mr-5 size-15" }),
            "已选择「",
            activeReasonName,
            "」, 回车键提交"
          ] })
        ] })
      ] })
    ] });
  }
  const S$8 = {
    reason: /* @__PURE__ */ css("color:inherit;width:48%;text-align:center;line-height:20px;position:relative;border-radius:4px;border:2px solid ", borderColorValue, ";padding-top:5px;padding-bottom:5px;margin-top:5px;margin-bottom:5px;", ""),
    reasonActive: /* @__PURE__ */ css("&.active{border-color:", colorPrimaryValue, ";}", ""),
    tips: {
      name: "s5xdrg",
      styles: "display:flex;align-items:center"
    }
  };
  const currentProps = {
    show: false,
    onHide,
    item: null
  };
  const modalDislikeVisibleState = proxy({
    value: currentProps.show
  });
  const useModalDislikeVisible = function() {
    return useSnapshot(modalDislikeVisibleState).value;
  };
  function onHide() {
    setTimeout(() => {
      updateProps({
        show: false,
        item: null
      });
    });
  }
  function updateProps(newProps) {
    Object.assign(currentProps, newProps);
    modalDislikeVisibleState.value = currentProps.show;
    getRoot().render(/* @__PURE__ */ jsx$1(ModalDislike, { ...currentProps, onHide }));
  }
  let _root;
  function getRoot() {
    _root || (_root = (() => {
      const container = document.createElement("div");
      container.classList.add("show-dislike-container", APP_CLS_ROOT);
      document.body.appendChild(container);
      return clientExports.createRoot(container);
    })());
    return _root;
  }
  function showModalDislike(item) {
    if ((item == null ? void 0 : item.param) && dislikedIds.has(item.param)) return;
    updateProps({
      show: true,
      item
    });
  }
  const iconParkOutlineTips = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M40 20c0 6.808-4.252 12.622-10.244 14.934H18.244C12.252 32.622 8 26.808 8 20c0-8.837 7.163-16 16-16s16 7.163 16 16" }),
    /* @__PURE__ */ jsx$1("path", { d: "m29.756 34.934l-.68 8.15a1 1 0 0 1-.996.916h-8.16a1 1 0 0 1-.996-.917l-.68-8.15M18 17v6l6-3l6 3v-6" })
  ] }) });
  const ForwardRef$s = React.forwardRef(iconParkOutlineTips);
  function AntdTooltip(props) {
    return /* @__PURE__ */ jsx$1(antd.Tooltip, { ...props, overlayStyle: {
      width: "max-content",
      maxWidth: "50vw",
      ...props.overlayStyle
    }, children: props.children });
  }
  const DefaultIconComponent = ForwardRef$s;
  function HelpInfo({
    children,
    tooltipProps,
    IconComponent,
    className,
    ...restSvgProps
  }) {
    const [_hasSize, _hasMarginLeft] = React.useMemo(() => [hasSize(className), hasMarginLeft(className)], [className]);
    const _className = clsx("cursor-pointer", !_hasSize && "size-16px", !_hasMarginLeft && "ml-4px", className);
    IconComponent ?? (IconComponent = DefaultIconComponent);
    const icon = /* @__PURE__ */ jsx$1(IconComponent, { ...restSvgProps, className: _className });
    return !!children && /* @__PURE__ */ jsx$1(AntdTooltip, { ...tooltipProps, title: children, children: icon });
  }
  const radixIconsPerson = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 15 15", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.5.875a3.625 3.625 0 0 0-1.006 7.109c-1.194.145-2.218.567-2.99 1.328c-.982.967-1.479 2.408-1.479 4.288a.475.475 0 1 0 .95 0c0-1.72.453-2.88 1.196-3.612c.744-.733 1.856-1.113 3.329-1.113s2.585.38 3.33 1.113c.742.733 1.195 1.892 1.195 3.612a.475.475 0 1 0 .95 0c0-1.88-.497-3.32-1.48-4.288c-.77-.76-1.795-1.183-2.989-1.328A3.627 3.627 0 0 0 7.5.875M4.825 4.5a2.675 2.675 0 1 1 5.35 0a2.675 2.675 0 0 1-5.35 0", clipRule: "evenodd" }) });
  const ForwardRef$r = React.forwardRef(radixIconsPerson);
  const mynauiUsersGroup = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17 19.5c0-1.657-2.239-3-5-3s-5 1.343-5 3m14-3c0-1.23-1.234-2.287-3-2.75M3 16.5c0-1.23 1.234-2.287 3-2.75m12-4.014a3 3 0 1 0-4-4.472M6 9.736a3 3 0 0 1 4-4.472m2 8.236a3 3 0 1 1 0-6a3 3 0 0 1 0 6" }) });
  const ForwardRef$q = React.forwardRef(mynauiUsersGroup);
  const tablerPlus = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 5v14m-7-7h14" }) });
  const ForwardRef$p = React.forwardRef(tablerPlus);
  const IconForUp = ForwardRef$r;
  const IconForGroup = ForwardRef$q;
  const IconForPopoverTrigger = ForwardRef$p;
  function formatFollowGroupUrl(followGroupId) {
    return `https://space.bilibili.com/${getUid()}/fans/follow?tagid=${followGroupId}`;
  }
  function formatSpaceUrl(mid) {
    return `https://space.bilibili.com/${mid}`;
  }
  function createUpdateDataFunction({
    fn,
    getCached
  }) {
    const limit2 = pLimit(1);
    return async (...args) => {
      const ret = await getCached(...args);
      if (ret) return ret;
      return await limit2(async () => {
        const ret2 = await getCached(...args);
        if (ret2) return ret2;
        return await fn(...args);
      });
    };
  }
  const cache$2 = dailyCache("w_webid");
  const get_w_webId = createUpdateDataFunction({
    fn: fetch_w_webId,
    getCached() {
      return cache$2.get();
    }
  });
  async function fetch_w_webId() {
    var _a2, _b2;
    const mid = getUid();
    if (!mid) return;
    const spacePageUrl = formatSpaceUrl(mid);
    const res = await request.get(spacePageUrl, {
      responseType: "text",
      withCredentials: true
    });
    const html2 = res.data;
    const parser = new DOMParser();
    const parsed2 = parser.parseFromString(html2, "text/html");
    const jsonText = decodeURIComponent(((_a2 = parsed2.getElementById("__RENDER_DATA__")) == null ? void 0 : _a2.innerText.trim()) || "");
    if (!jsonText) return;
    const id = (_b2 = JSON.parse(jsonText)) == null ? void 0 : _b2.access_id;
    if (id) await cache$2.set(id);
    return id;
  }
  async function getAllFollowGroups() {
    const params = await encWbi({
      web_location: "0.0",
      w_webid: await get_w_webId() || ""
    });
    const res = await request.get("/x/relation/tags", {
      params
    });
    const json = res.data;
    const groups = json.data || [];
    return groups;
  }
  async function getFollowGroupContent(tagid) {
    const ps = 20;
    const singleRequest = async (page) => {
      const res = await request.get("/x/relation/tag", {
        params: {
          mid: getUid(),
          tagid,
          pn: page,
          ps
        }
      });
      const json = res.data;
      return json.data;
    };
    let pn = 1;
    let items = [];
    let currentPageItems = [];
    do {
      currentPageItems = await singleRequest(pn++);
      items = items.concat(currentPageItems);
    } while (currentPageItems.length > 0);
    const mids = uniq(items.map((x) => x.mid));
    return mids;
  }
  async function getRecentUpdateUpList() {
    var _a2;
    const res = await request.get("/x/polymer/web-dynamic/v1/portal");
    const json = res.data;
    const list = ((_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.up_list) || [];
    return list;
  }
  var DynamicFeedQueryKey = /* @__PURE__ */ ((DynamicFeedQueryKey2) => {
    DynamicFeedQueryKey2["Mid"] = "dyn-mid";
    DynamicFeedQueryKey2["Offset"] = "dyn-offset";
    DynamicFeedQueryKey2["SearchText"] = "dyn-search";
    DynamicFeedQueryKey2["MinId"] = "dyn-min-id";
    DynamicFeedQueryKey2["MinTs"] = "dyn-min-ts";
    return DynamicFeedQueryKey2;
  })(DynamicFeedQueryKey || {});
  const searchParams$1 = new URLSearchParams(location.search);
  const QUERY_DYNAMIC_UP_MID = (_b = searchParams$1.get(
    "dyn-mid"
    /* Mid */
  )) == null ? void 0 : _b.trim();
  const QUERY_DYNAMIC_OFFSET = searchParams$1.get(
    "dyn-offset"
    /* Offset */
  ) || void 0;
  const QUERY_DYNAMIC_SEARCH_TEXT = QUERY_DYNAMIC_UP_MID ? searchParams$1.get(
    "dyn-search"
    /* SearchText */
  ) || void 0 : void 0;
  const QUERY_DYNAMIC_MIN_ID = QUERY_DYNAMIC_UP_MID ? searchParams$1.get(
    "dyn-min-id"
    /* MinId */
  ) : void 0;
  const QUERY_DYNAMIC_MIN_TS = QUERY_DYNAMIC_MIN_ID ? searchParams$1.get(
    "dyn-min-ts"
    /* MinTs */
  ) : void 0;
  let upMidInitial = void 0;
  let upNameInitial = void 0;
  if (QUERY_DYNAMIC_UP_MID) {
    upMidInitial = QUERY_DYNAMIC_UP_MID;
    upNameInitial = searchParams$1.get("dyn-name") ?? upMidInitial.toString() ?? void 0;
  }
  var DynamicFeedVideoType = /* @__PURE__ */ ((DynamicFeedVideoType2) => {
    DynamicFeedVideoType2["All"] = "all";
    DynamicFeedVideoType2["UploadOnly"] = "upload-only";
    DynamicFeedVideoType2["DynamicOnly"] = "dynamic-only";
    return DynamicFeedVideoType2;
  })(DynamicFeedVideoType || {});
  const DynamicFeedVideoTypeLabel = {
    [
      "all"
      /* All */
    ]: "全部",
    [
      "upload-only"
      /* UploadOnly */
    ]: "仅投稿视频",
    [
      "dynamic-only"
      /* DynamicOnly */
    ]: "仅动态视频"
  };
  var DynamicFeedVideoMinDuration = /* @__PURE__ */ ((DynamicFeedVideoMinDuration2) => {
    DynamicFeedVideoMinDuration2["All"] = "all";
    DynamicFeedVideoMinDuration2["_5m"] = "5min";
    DynamicFeedVideoMinDuration2["_2m"] = "2min";
    DynamicFeedVideoMinDuration2["_1m"] = "1min";
    DynamicFeedVideoMinDuration2["_30s"] = "30s";
    DynamicFeedVideoMinDuration2["_10s"] = "10s";
    return DynamicFeedVideoMinDuration2;
  })(DynamicFeedVideoMinDuration || {});
  const DynamicFeedVideoMinDurationConfig = {
    // 及以上
    [
      "all"
      /* All */
    ]: {
      label: "全部时长",
      duration: 0
    },
    [
      "5min"
      /* _5m */
    ]: {
      label: "5分钟",
      duration: 5 * 60
    },
    [
      "2min"
      /* _2m */
    ]: {
      label: "2分钟",
      duration: 2 * 60
    },
    [
      "1min"
      /* _1m */
    ]: {
      label: "1分钟",
      duration: 60
    },
    [
      "30s"
      /* _30s */
    ]: {
      label: "30秒",
      duration: 30
    },
    [
      "10s"
      /* _10s */
    ]: {
      label: "10秒",
      duration: 10
    }
  };
  const DF_SELECTED_KEY_ALL = "all";
  const DF_SELECTED_KEY_PREFIX_UP = "up:";
  const DF_SELECTED_KEY_PREFIX_GROUP = "group:";
  const dfStore = proxy({
    upMid: upMidInitial,
    upName: upNameInitial,
    upFace: void 0,
    upList: [],
    upListUpdatedAt: 0,
    followGroups: [],
    followGroupsUpdatedAt: 0,
    selectedFollowGroupTagId: void 0,
    get selectedFollowGroup() {
      if (typeof this.selectedFollowGroupTagId !== "number") return;
      return this.followGroups.find((x) => x.tagid === this.selectedFollowGroupTagId);
    },
    dynamicFeedVideoType: "all",
    searchText: QUERY_DYNAMIC_SEARCH_TEXT ?? void 0,
    // 选择状态
    get viewingAll() {
      return this.selectedKey === DF_SELECTED_KEY_ALL;
    },
    get viewingSomeUp() {
      return !!this.upMid;
    },
    get viewingSomeGroup() {
      return typeof this.selectedFollowGroupTagId === "number";
    },
    // 筛选 UP & 分组 select 控件的 key
    get selectedKey() {
      if (this.upMid) return `${DF_SELECTED_KEY_PREFIX_UP}${this.upMid}`;
      if (this.selectedFollowGroup) return `${DF_SELECTED_KEY_PREFIX_GROUP}${this.selectedFollowGroup.tagid}`;
      return DF_SELECTED_KEY_ALL;
    },
    hideChargeOnlyVideosForKeysSet: (await( proxySetWithGmStorage("dynamic-feed:hide-charge-only-videos-for-keys"))).set,
    get hideChargeOnlyVideos() {
      return this.hideChargeOnlyVideosForKeysSet.has(this.selectedKey);
    },
    filterMinDuration: "all",
    get filterMinDurationValue() {
      return DynamicFeedVideoMinDurationConfig[this.filterMinDuration].duration;
    },
    /**
     * methods
     */
    updateUpList,
    updateFollowGroups
  });
  proxy({
    followGroupInfo: {}
  });
  async function updateUpList(force = false) {
    const cacheHit = !force && dfStore.upList.length && dfStore.upListUpdatedAt && dfStore.upListUpdatedAt - Date.now() < ms("5min");
    if (cacheHit) return;
    const list = await getRecentUpdateUpList();
    dfStore.upList = list;
    dfStore.upListUpdatedAt = Date.now();
  }
  async function updateFollowGroups(force = false) {
    {
      const {
        followGroup,
        whenViewAll
      } = settings.dynamicFeed;
      const enabled = followGroup.enabled || !!whenViewAll.hideIds.filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_GROUP)).length;
      if (!enabled) return;
    }
    const cacheHit = !force && dfStore.followGroups.length && dfStore.followGroupsUpdatedAt && dfStore.followGroupsUpdatedAt - Date.now() < ms("1h");
    if (cacheHit) return;
    const groups = await getAllFollowGroups();
    dfStore.followGroups = groups.filter((x) => !!x.count);
    dfStore.followGroupsUpdatedAt = Date.now();
  }
  async function updateFilterData() {
    if (!getUid()) return;
    return Promise.all([updateUpList(), updateFollowGroups()]);
  }
  void (async () => {
    if (!IN_BILIBILI_HOMEPAGE) return;
    await delay(5e3);
    if (!dfStore.upList.length || !dfStore.followGroups.length) {
      await whenIdle();
      updateFilterData();
    }
  })();
  if (QUERY_DYNAMIC_UP_MID) {
    subscribeOnKeys(dfStore, ["upName", "searchText", "selectedFollowGroup", "viewingSomeUp", "viewingAll"], ({
      upName,
      searchText,
      selectedFollowGroup,
      viewingSomeUp,
      viewingAll
    }) => {
      let title = viewingAll ? "动态" : viewingSomeUp ? `「${upName}」的动态` : `「${selectedFollowGroup == null ? void 0 : selectedFollowGroup.name}」分组动态`;
      if (searchText) {
        title = `🔍【${searchText}】 - ` + title;
      }
      setPageTitle(title);
    });
  }
  async function fetchFavCollections(page) {
    const res = await request.get("/x/v3/fav/folder/collected/list", {
      params: {
        up_mid: getUid(),
        platform: "web",
        ps: 20,
        pn: page
      }
    });
    const json = res.data;
    return json.data;
  }
  async function fetchAllFavCollections() {
    let page = 1;
    let hasMore = true;
    let items = [];
    while (hasMore) {
      const data2 = await fetchFavCollections(page);
      items.push(...data2.list);
      hasMore = data2.has_more;
      page++;
    }
    items = items.filter((x) => {
      if (x.title === "该合集已失效" && x.upper.mid === 0) return false;
      return true;
    });
    items = uniqBy(items, (x) => x.id);
    return items;
  }
  async function fetchCollectionDetail(collectionId, page) {
    const res = await request.get("/x/space/fav/season/list", {
      params: {
        season_id: collectionId,
        ps: 20,
        pn: page
      }
    });
    const json = res.data;
    return json.data;
  }
  var FavItemsOrder = /* @__PURE__ */ ((FavItemsOrder2) => {
    FavItemsOrder2["Default"] = "default";
    FavItemsOrder2["Shuffle"] = "shuffle";
    FavItemsOrder2["PubTimeDesc"] = "pub-time-desc";
    FavItemsOrder2["PubTimeAsc"] = "pub-time-asc";
    FavItemsOrder2["PlayCountDesc"] = "play-count-desc";
    FavItemsOrder2["CollectCountDesc"] = "collect-count-desc";
    FavItemsOrder2["FavTimeDesc"] = "fav-time-desc";
    FavItemsOrder2["FavTimeAsc"] = "fav-time-asc";
    return FavItemsOrder2;
  })(FavItemsOrder || {});
  function handleItemsOrder(items, itemsOrder) {
    if (itemsOrder === "default") {
      return items;
    }
    if (itemsOrder === "shuffle") {
      return shuffle(items);
    }
    if (itemsOrder === "pub-time-desc" || itemsOrder === "pub-time-asc") {
      const order = itemsOrder === "pub-time-desc" ? "desc" : "asc";
      return orderBy(items, [(x) => x.pubtime], [order]);
    }
    if ((itemsOrder === "fav-time-desc" || itemsOrder === "fav-time-asc") && items.every((x) => x.from === "fav-folder")) {
      const order = itemsOrder === "fav-time-desc" ? "desc" : "asc";
      return orderBy(items, [(x) => x.fav_time], [order]);
    }
    if (itemsOrder === "play-count-desc") {
      return orderBy(items, [(x) => x.cnt_info.play], ["desc"]);
    }
    if (itemsOrder === "collect-count-desc") {
      return orderBy(items, [(x) => x.cnt_info.collect], ["desc"]);
    }
    return items;
  }
  const styled = {
    createClass: css$1,
    c: css$1
  };
  class BaseTabService {
    constructor(qsPageSize) {
      __publicField(this, "qs");
      this.qs = new QueueStrategy(qsPageSize);
    }
    get hasMore() {
      return !!this.qs.bufferQueue.length || this.hasMoreExceptQueue;
    }
    restore() {
      this.qs.restore();
    }
    async loadMore(abortSignal) {
      if (!this.hasMore) return;
      if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue();
      const more = await this.fetchMore(abortSignal);
      if (more == null ? void 0 : more.length) this.qs.bufferQueue.push(...more);
      return this.qs.sliceFromQueue();
    }
  }
  class QueueStrategy {
    constructor(ps = 20) {
      // full-list = returnQueue + bufferQueue + more
      __publicField(this, "returnQueue", []);
      __publicField(this, "bufferQueue", []);
      __publicField(this, "ps");
      this.ps = ps;
    }
    get hasCache() {
      return !!this.returnQueue.length;
    }
    sliceCountFromQueue(count) {
      if (this.bufferQueue.length) {
        const sliced = this.bufferQueue.slice(0, count);
        this.bufferQueue = this.bufferQueue.slice(count);
        return this.doReturnItems(sliced) ?? [];
      } else {
        return [];
      }
    }
    sliceFromQueue(page = 1) {
      return this.sliceCountFromQueue(this.ps * page);
    }
    // add to returnQueue
    doReturnItems(items) {
      this.returnQueue = [...this.returnQueue, ...items ?? []];
      return items;
    }
    // restore from returnQueue
    restore() {
      this.bufferQueue = [...this.returnQueue, ...this.bufferQueue];
      this.returnQueue = [];
    }
  }
  function usePopupContainer() {
    const ref = React.useRef(null);
    const getPopupContainer = React.useCallback(() => {
      var _a2;
      return ((_a2 = ref.current) == null ? void 0 : _a2.closest("." + APP_CLS_TAB_BAR)) || document.body;
    }, []);
    return {
      ref,
      getPopupContainer
    };
  }
  function useBooleanSettingsPath(configPath, extraAction) {
    const snap = useSettingsSnapshot();
    const checked = !!get(snap, configPath, false);
    const onChange = React.useCallback((val) => {
      set(settings, configPath, val);
      extraAction == null ? void 0 : extraAction(val);
    }, []);
    const checkboxOnChange = React.useCallback((e) => {
      onChange(e.target.checked);
    }, []);
    const onToggle = React.useCallback(() => {
      onChange(!get(settings, configPath, false));
    }, []);
    return {
      checked,
      onChange,
      checkboxOnChange,
      onToggle
    };
  }
  function __FlagSettingItem({
    configPath,
    label,
    extraAction,
    tooltip,
    tooltipProps,
    as,
    checkboxProps,
    switchProps
  }) {
    const {
      checked,
      onChange,
      checkboxOnChange
    } = useBooleanSettingsPath(configPath, extraAction);
    const wrapTooltip = (children) => {
      if (!tooltip) return children;
      return /* @__PURE__ */ jsx$1(AntdTooltip, { ...tooltipProps, title: tooltip, children });
    };
    let usingLabel;
    if (typeof label === "function") {
      usingLabel = label(checked);
    } else {
      usingLabel = label || configPath;
    }
    if (as === "checkbox") {
      let inner = /* @__PURE__ */ jsx$1("span", { style: {
        userSelect: "none"
      }, children: usingLabel });
      if (tooltip) inner = wrapTooltip(inner);
      return /* @__PURE__ */ jsx$1(antd.Checkbox, { ...checkboxProps, checked, onChange: checkboxOnChange, children: inner });
    }
    if (as === "switch") {
      let content = /* @__PURE__ */ jsx$1(antd.Switch, { ...switchProps, checked, onChange });
      if (tooltip) content = wrapTooltip(content);
      return content;
    }
  }
  function CheckboxSettingItem({
    configPath,
    label,
    extraAction,
    tooltip,
    tooltipProps,
    ...otherProps
  }) {
    return /* @__PURE__ */ jsx$1(__FlagSettingItem, { ...{
      configPath,
      label,
      extraAction,
      tooltip,
      tooltipProps,
      as: "checkbox",
      checkboxProps: otherProps
    } });
  }
  function SwitchSettingItem({
    configPath,
    extraAction,
    tooltip,
    tooltipProps,
    ...otherProps
  }) {
    return /* @__PURE__ */ jsx$1(__FlagSettingItem, { ...{
      configPath,
      extraAction,
      tooltip,
      tooltipProps,
      as: "switch",
      switchProps: otherProps
    } });
  }
  function ButtonSettingItem({
    configPath,
    tooltip,
    tooltipProps,
    extraAction,
    checkedChildren,
    unCheckedChildren
  }) {
    const {
      checked,
      onToggle
    } = useBooleanSettingsPath(configPath, extraAction);
    return /* @__PURE__ */ jsx$1(AntdTooltip, { title: tooltip, ...tooltipProps, children: /* @__PURE__ */ jsx$1(antd.Button, { onClick: onToggle, children: /* @__PURE__ */ jsx$1("span", { className: "inline-flex items-center justify-center line-height-[1] gap-4", children: checked ? checkedChildren ?? "✅" : unCheckedChildren ?? "❎" }) }) });
  }
  class PopularGeneralRecService {
    constructor() {
      __publicField(this, "hasMore", true);
      __publicField(this, "page", 0);
      // pages loaded
      // shuffle: boolean
      __publicField(this, "anonymous");
      this.anonymous = settings.popularGeneralUseAnonymous;
    }
    async loadMore() {
      if (!this.hasMore) return;
      const res = await request.get("/x/web-interface/popular", {
        params: {
          ps: 20,
          pn: this.page + 1
        },
        withCredentials: !this.anonymous
      });
      const json = res.data;
      if (!isWebApiSuccess(json)) {
        return toast(json.message || REQUEST_FAIL_MSG), void 0;
      }
      this.page++;
      this.hasMore = !json.data.no_more;
      const items = (json.data.list || []).map((item) => {
        return {
          ...item,
          api: EApiType.PopularGeneral,
          uniqId: item.bvid
        };
      });
      return items;
    }
    get usageInfo() {
      return /* @__PURE__ */ jsx$1(PopularGeneralUsageInfo, {});
    }
  }
  function PopularGeneralUsageInfo() {
    const onRefresh = useOnRefreshContext();
    const tooltip = /* @__PURE__ */ jsx$1(Fragment, { children: "✅ 匿名访问: 使用游客身份访问" });
    const extraAction = async () => {
      await delay(100);
      onRefresh == null ? void 0 : onRefresh();
    };
    const checkbox = /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "popularGeneralUseAnonymous", tooltip, label: "匿名访问", extraAction });
    return checkbox;
  }
  function getBiliPlayerConfig() {
    const key = "bpx_player_profile";
    const str = localStorage.getItem(key);
    if (!str) return;
    try {
      const val = JSON.parse(str);
      return val;
    } catch {
      return;
    }
  }
  function getBiliPlayerConfigAutoPlay() {
    const config = getBiliPlayerConfig();
    return !!(config == null ? void 0 : config.media.autoplay);
  }
  function getIdbCache(tableName) {
    const db = localforage.createInstance({
      driver: localforage.INDEXEDDB,
      name: APP_NAMESPACE,
      storeName: tableName
    });
    return {
      db,
      get(key) {
        return db.getItem(key.toString());
      },
      set(key, entry) {
        return db.setItem(key.toString(), entry);
      },
      delete(key) {
        return db.removeItem(key.toString());
      }
    };
  }
  function wrapWithIdbCache({
    fn,
    generateKey,
    tableName,
    ttl,
    concurrency,
    // concurrency for `fn`
    autoCleanUp = true
  }) {
    const cache2 = getIdbCache(tableName);
    const limit2 = concurrency && concurrency > 0 ? pLimit(concurrency) : void 0;
    const cleanUp = throttle$1(async () => {
      cache2.db.iterate((cached, key) => {
        if (!cache2 || !shouldReuseCached(cached)) {
          cache2.db.removeItem(key);
        }
      });
    }, 1e3);
    if (autoCleanUp) {
      whenIdle().then(cleanUp);
    }
    function shouldReuseCached(cached) {
      return cached.val && cached.ts && Date.now() - cached.ts <= ttl;
    }
    async function wrapped(...args) {
      const key = generateKey(...args);
      const cached = await cache2.get(key);
      if (cached && shouldReuseCached(cached)) return cached.val;
      const result = await (limit2 ? limit2(() => fn(...args)) : fn(...args));
      await cache2.set(key, {
        ts: Date.now(),
        val: result
      });
      return result;
    }
    Object.defineProperties(wrapped, {
      cache: {
        value: cache2
      },
      cleanUp: {
        value: cleanUp
      },
      generateKey: {
        value: generateKey
      },
      shouldReuseCached: {
        value: shouldReuseCached
      }
    });
    return wrapped;
  }
  async function __fetchVideoDetail(bvid) {
    const res = await request.get("/x/web-interface/view", {
      params: {
        bvid
      }
    });
    const json = res.data;
    const data2 = json.data;
    return data2;
  }
  const getVideoDetail = wrapWithIdbCache({
    fn: __fetchVideoDetail,
    generateKey: (bvid) => bvid,
    tableName: "video_detail",
    ttl: ms("3M")
  });
  function isBangumiCategory(c2) {
    return c2.type === "bangumi";
  }
  function isCinemaCategory(c2) {
    return c2.type === "cinema";
  }
  function isNormalCategory(c2) {
    return !isBangumiCategory(c2) && !isCinemaCategory(c2);
  }
  function isNormalRankingItem(item) {
    const c2 = RANKING_CATEGORIES_MAP[item.slug];
    return isNormalCategory(c2);
  }
  function isBangumiRankingItem(item) {
    const c2 = RANKING_CATEGORIES_MAP[item.slug];
    return isBangumiCategory(c2);
  }
  function isCinemaRankingItem(item) {
    const c2 = RANKING_CATEGORIES_MAP[item.slug];
    return isCinemaCategory(c2);
  }
  function getRequestUrl(c2) {
    if (c2.type === "bangumi") {
      if (c2.slug === "guochan") {
        return `/pgc/season/rank/web/list?day=3&season_type=${c2.season_type}`;
      }
      return `/pgc/web/rank/list?day=3&season_type=${c2.season_type}`;
    }
    if (c2.type === "cinema") {
      return `/pgc/season/rank/web/list?day=3&season_type=${c2.season_type}`;
    }
    return `/x/web-interface/ranking/v2?rid=${c2.tid}&type=${c2.rank_type || "all"}`;
  }
  const arr = [{
    name: "全站",
    tid: 0,
    slug: "all"
  }, {
    name: "番剧",
    type: "bangumi",
    tid: 13,
    slug: "bangumi",
    season_type: 1
  }, {
    name: "国产动画",
    type: "bangumi",
    tid: 168,
    slug: "guochan",
    season_type: 4
  }, {
    name: "国创相关",
    tid: 168,
    slug: "guochuang"
  }, {
    name: "纪录片",
    type: "cinema",
    slug: "documentary",
    tid: 177,
    season_type: 3
  }, {
    name: "动画",
    tid: 1,
    slug: "douga"
  }, {
    name: "音乐",
    tid: 3,
    slug: "music"
  }, {
    name: "舞蹈",
    tid: 129,
    slug: "dance"
  }, {
    name: "游戏",
    tid: 4,
    slug: "game"
  }, {
    name: "知识",
    tid: 36,
    slug: "knowledge"
  }, {
    name: "科技",
    tid: 188,
    slug: "tech"
  }, {
    name: "运动",
    tid: 234,
    slug: "sports"
  }, {
    name: "汽车",
    tid: 223,
    slug: "car"
  }, {
    name: "生活",
    tid: 160,
    slug: "life"
  }, {
    name: "美食",
    tid: 211,
    slug: "food"
  }, {
    name: "动物圈",
    tid: 217,
    slug: "animal"
  }, {
    name: "鬼畜",
    tid: 119,
    slug: "kichiku"
  }, {
    name: "时尚",
    tid: 155,
    slug: "fashion"
  }, {
    name: "娱乐",
    tid: 5,
    slug: "ent"
  }, {
    name: "影视",
    tid: 181,
    slug: "cinephile"
  }, {
    name: "电影",
    type: "cinema",
    slug: "movie",
    tid: 23,
    season_type: 2
  }, {
    name: "电视剧",
    type: "cinema",
    slug: "tv",
    tid: 11,
    season_type: 5
  }, {
    name: "综艺",
    type: "cinema",
    slug: "variety",
    season_type: 7
  }, {
    name: "原创",
    slug: "origin",
    tid: 0,
    rank_type: "origin"
  }, {
    name: "新人",
    slug: "rookie",
    tid: 0,
    rank_type: "rookie"
  }];
  const RANKING_CATEGORIES = arr;
  const RANKING_CATEGORIES_MAP = RANKING_CATEGORIES.reduce((map, c2) => {
    map[c2.slug] = c2;
    return map;
  }, {});
  const RANKING_CATEGORIES_GROUPDED = groupBy(RANKING_CATEGORIES, (x) => x.type || "normal");
  const baseZ = 3;
  const S$7 = {
    top: (inlinePosition) => /* @__PURE__ */ css("position:absolute;top:8px;", inlinePosition, ":8px;transform:translateZ(0);z-index:", baseZ + 2, ";", ""),
    topContainer: (inlinePosition) => [S$7.top(inlinePosition), /* @__PURE__ */ css("display:flex;flex-direction:", inlinePosition === "left" ? "row" : "row-reverse", ";column-gap:5px;", "")],
    button: (visible) => /* @__PURE__ */ css("position:relative;width:28px;height:28px;border-radius:6px;cursor:pointer;background-color:rgba(33, 33, 33, 0.7);border:1px solid #444;color:#fff;&:hover{border-color:", colorPrimaryValue, ";}display:", visible ? "inline-flex" : "none", ";align-items:center;justify-content:center;svg{pointer-events:none;user-select:none;}", ""),
    tooltip: (inlinePosition, tooltipOffset = 5) => [/* @__PURE__ */ css("position:absolute;bottom:-6px;pointer-events:none;user-select:none;transform:translateY(100%);font-size:12px;white-space:nowrap;border-radius:4px;line-height:18px;padding:4px 8px;color:#fff;background-color:rgba(0, 0, 0, 0.8);background-color:", colorPrimaryValue, ";", ""), css`
      ${inlinePosition}: -${tooltipOffset}px;
    `]
  };
  const VideoCardActionButton = React.memo(function VideoCardActionButton2({
    inlinePosition,
    icon,
    tooltip,
    visible,
    className,
    ...divProps
  }) {
    visible ?? (visible = true);
    const {
      triggerRef,
      tooltipEl
    } = useTooltip({
      inlinePosition,
      tooltip
    });
    return /* @__PURE__ */ jsxs("div", { ...divProps, ref: triggerRef, css: [S$7.button(visible), "", ""], className: clsx("action-button", className), children: [
      icon,
      tooltipEl
    ] });
  });
  function useTooltip({
    inlinePosition,
    tooltip,
    tooltipOffset
  }) {
    const triggerRef = React.useRef(null);
    const hovering = useHover(triggerRef);
    const tooltipEl = /* @__PURE__ */ jsx$1("span", { style: {
      display: hovering ? "block" : "none"
    }, css: S$7.tooltip(inlinePosition, tooltipOffset), children: tooltip });
    return {
      triggerRef,
      tooltipEl
    };
  }
  function createLessFrequentFn(fn, initialTargetTimes, harder = true) {
    let times2 = 0;
    let targetTimes = initialTargetTimes;
    return (...args) => {
      times2++;
      if (times2 === targetTimes) {
        times2 = 0;
        if (harder) targetTimes++;
        return fn(...args);
      }
    };
  }
  function useLessFrequentFn(fn, initialTargetTimes, harder = true) {
    const _fn = useMemoizedFn(fn);
    return React.useMemo(() => {
      return createLessFrequentFn(_fn, initialTargetTimes, harder);
    }, [_fn, initialTargetTimes, harder]);
  }
  const radixIconsCross2 = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 15 15", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5z", clipRule: "evenodd" }) });
  React.forwardRef(radixIconsCross2);
  const radixIconsLockClosed = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 15 15", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M5 4.636c0-.876.242-1.53.643-1.962c.396-.427 1.003-.696 1.858-.696s1.462.269 1.857.694c.4.431.642 1.085.642 1.961V6H5zM4 6V4.636c0-1.055.293-1.978.91-2.643c.623-.67 1.517-1.015 2.591-1.015s1.969.344 2.59 1.014c.617.664.909 1.587.909 2.641V6h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3 7h9v6H3z", clipRule: "evenodd" }) });
  const ForwardRef$o = React.forwardRef(radixIconsLockClosed);
  const radixIconsLockOpen1 = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 15 15", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.499 0C6.326 0 5.36.39 4.738 1.194C4.238 1.839 4 2.682 4 3.634h1c0-.79.197-1.4.528-1.828c.388-.5 1.024-.806 1.97-.806c.859 0 1.465.265 1.86.686c.4.426.642 1.074.642 1.95V6H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V3.636c0-1.055-.293-1.974-.912-2.634C9.465.338 8.57 0 7.498 0M3 7h9v6H3z", clipRule: "evenodd" }) });
  const ForwardRef$n = React.forwardRef(radixIconsLockOpen1);
  const radixIconsOpenInNewWindow = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 15 15", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M12 13a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v3.5a.5.5 0 0 0 1 0V3h9v9H8.5a.5.5 0 0 0 0 1zM9 6.5v3a.5.5 0 0 1-1 0V7.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 7H5.5a.5.5 0 0 1 0-1h3a.5.5 0 0 1 .5.497", clipRule: "evenodd" }) });
  const ForwardRef$m = React.forwardRef(radixIconsOpenInNewWindow);
  function renderInPipWindow(newHref, pipWindow) {
    const cssInsertContainer = pipWindow.document.head;
    const {
      cache: cache2
    } = createEmotion({
      key: "pip-window",
      container: cssInsertContainer
    });
    const container = document.createElement("div");
    container.classList.add(APP_CLS_ROOT);
    container.style.lineHeight = "0";
    pipWindow.document.body.appendChild(container);
    const root2 = clientExports.createRoot(container);
    root2.render(/* @__PURE__ */ jsx$1(AntdApp, { emotionCache: cache2, styleProviderProps: {
      container: cssInsertContainer
    }, injectGlobalStyle: true, children: /* @__PURE__ */ jsx$1(antd.App, { component: false, message: {
      getContainer: () => pipWindow.document.body
    }, children: /* @__PURE__ */ jsx$1(PipWindowContent, { newHref, pipWindow }) }) }));
  }
  var _ref2$j = {
    name: "jep5v2",
    styles: "width:100%;height:100vh;border:none"
  };
  var _ref3$d = {
    name: "pb1257",
    styles: "*{box-sizing:border-box;}:root,body,iframe{margin:0;padding:0;overscroll-behavior:none;}"
  };
  function PipWindowContent({
    newHref,
    pipWindow
  }) {
    const focusOnce = React.useMemo(() => {
      return once(() => {
        window.focus();
      });
    }, []);
    useKeyPress(["leftarrow", "rightarrow", "uparrow", "downawrrow", "esc", "tab"], (e) => {
      focusOnce();
    }, {
      exactMatch: true,
      target: pipWindow.document.documentElement
    });
    const hovering = useHover(pipWindow.document.documentElement);
    const [locked, setLocked] = React.useState(() => {
      return settings.pipWindowDefaultLocked;
    });
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(Global, { styles: [_ref3$d, "", ""] }),
      /* @__PURE__ */ jsx$1("iframe", { src: newHref, css: _ref2$j }),
      /* @__PURE__ */ jsx$1(LockOverlay, { locked }),
      /* @__PURE__ */ jsxs("div", { css: /* @__PURE__ */ css("position:fixed;z-index:9999;right:10px;top:10px;display:", hovering ? "flex" : "none", ";column-gap:6px;flex-direction:row-reverse;", ""), children: [
        /* @__PURE__ */ jsx$1(CloseThenOpenButton, { pipWindow, newHref }),
        /* @__PURE__ */ jsx$1(LockButton, { locked, setLocked })
      ] })
    ] });
  }
  const S$6 = {
    button: {
      name: "1k4rqoq",
      styles: "svg{width:14px;height:14px;}"
    }
  };
  var _ref$p = {
    name: "pesqi8",
    styles: "position:fixed;inset:0;z-index:9999;background-color:transparent;user-select:none"
  };
  function LockOverlay({
    locked
  }) {
    const {
      message: message2
    } = antd.App.useApp();
    const onOverlayClick = useLessFrequentFn(() => {
      message2.info("请先点击右上角 🔓解锁按钮 解锁");
    }, 3);
    return locked && /* @__PURE__ */ jsx$1("div", { className: "locked-overlay", css: _ref$p, onClick: onOverlayClick });
  }
  function CloseThenOpenButton({
    newHref,
    pipWindow
  }) {
    const onClick = () => {
      pipWindow.close();
      const u = new URL(newHref);
      u.searchParams.delete(QueryKey.PlayerScreenMode);
      u.searchParams.delete(QueryKey.ForceAutoPlay);
      openNewTab(u.href);
    };
    return /* @__PURE__ */ jsx$1(VideoCardActionButton, { inlinePosition: "right", icon: /* @__PURE__ */ jsx$1(ForwardRef$m, {}), tooltip: "新窗口打开", onClick, css: S$6.button });
  }
  function LockButton({
    locked,
    setLocked
  }) {
    return /* @__PURE__ */ jsx$1(VideoCardActionButton, { inlinePosition: "right", icon: locked ? /* @__PURE__ */ jsx$1(ForwardRef$o, {}) : /* @__PURE__ */ jsx$1(ForwardRef$n, {}), tooltip: locked ? "已锁定, 点击解锁" : "已解锁, 点击锁定", css: S$6.button, onClick: (e) => {
      setLocked((x) => !x);
    } });
  }
  const debug$9 = baseDebug.extend("VideoCard:useOpenRelated");
  function useOpenRelated({
    href,
    item,
    cardData,
    actionButtonVisible,
    previewImageRef
  }) {
    const {
      videoLinkOpenMode
    } = useSettingsSnapshot();
    function getHref(action2) {
      const u = new URL(href, location.href);
      action2 == null ? void 0 : action2(u);
      const newHref = u.href;
      return newHref;
    }
    const handleVideoLinkClick = useMemoizedFn((e) => {
      e.stopPropagation();
      e.preventDefault();
      onOpenWithMode(void 0, e);
    });
    const onOpenWithMode = useMemoizedFn((mode, e) => {
      var _a2;
      mode || (mode = settings.videoLinkOpenMode);
      const newHref = getHref((u) => {
        var _a3;
        if (mode === VideoLinkOpenMode.Popup || mode === VideoLinkOpenMode.NormalWebFullscreen) {
          u.searchParams.set(QueryKey.PlayerScreenMode, PlayerScreenMode.WebFullscreen);
          if (mode === VideoLinkOpenMode.Popup && !getBiliPlayerConfigAutoPlay()) {
            u.searchParams.set(QueryKey.ForceAutoPlay, ForceAutoPlay.ON);
          }
        }
        if (settings.startPlayFromPreviewPoint) {
          const t = (_a3 = previewImageRef.current) == null ? void 0 : _a3.getT();
          if (t) {
            u.searchParams.set("t", t.toString());
          }
        }
      });
      const handleCommon = () => {
        const backgroud = mode === VideoLinkOpenMode.Background || !!((e == null ? void 0 : e.metaKey) || (e == null ? void 0 : e.ctrlKey));
        const active = !backgroud;
        openNewTab(newHref, active);
      };
      const handleCurrentPage = () => {
        location.href = newHref;
      };
      const handlers = {
        [VideoLinkOpenMode.Normal]: handleCommon,
        [VideoLinkOpenMode.Background]: handleCommon,
        [VideoLinkOpenMode.CurrentPage]: handleCurrentPage,
        [VideoLinkOpenMode.NormalWebFullscreen]: handleCommon,
        [VideoLinkOpenMode.Popup]: () => handlePopup(newHref),
        [VideoLinkOpenMode.Iina]: handleIINA
      };
      (_a2 = handlers[mode]) == null ? void 0 : _a2.call(handlers);
    });
    function handlePopup(newHref) {
      var _a2;
      let videoWidth;
      let videoHeight;
      if (item.api === EApiType.AppRecommend && ((_a2 = item.uri) == null ? void 0 : _a2.startsWith("bilibili://"))) {
        const searchParams2 = new URL(item.uri).searchParams;
        const playerWidth = Number(searchParams2.get("player_width") || 0);
        const playerHeight = Number(searchParams2.get("player_height") || 0);
        if (playerWidth && playerHeight && !isNaN(playerWidth) && !isNaN(playerHeight)) {
          videoWidth = playerWidth;
          videoHeight = playerHeight;
        }
      }
      if (item.api === EApiType.Ranking && isNormalRankingItem(item)) {
        const w = item.dimension.width;
        const h = item.dimension.height;
        if (w && h && !isNaN(w) && !isNaN(h)) {
          videoWidth = w;
          videoHeight = h;
        }
      }
      return openInPipOrPopup(newHref, cardData.bvid, videoWidth, videoHeight);
    }
    function handleIINA() {
      let usingHref = href;
      if (item.api === EApiType.Watchlater) usingHref = `/video/${item.bvid}`;
      const fullHref = new URL(usingHref, location.href).href;
      const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`;
      window.open(iinaUrl, "_self");
    }
    const consistentOpenMenus = React.useMemo(() => {
      return Object.values(VideoLinkOpenMode).filter((mode) => typeof VideoLinkOpenModeConfig[mode].enabled === "undefined").map((mode) => {
        return {
          key: VideoLinkOpenModeKey[mode],
          label: VideoLinkOpenModeConfig[mode].label,
          icon: VideoLinkOpenModeConfig[mode].icon,
          onClick: () => onOpenWithMode(mode)
        };
      });
    }, []);
    const conditionalOpenMenus = React.useMemo(() => {
      return Object.values(VideoLinkOpenMode).filter((mode) => typeof VideoLinkOpenModeConfig[mode].enabled === "boolean" && VideoLinkOpenModeConfig[mode].enabled).length ? Object.values(VideoLinkOpenMode).filter((mode) => typeof VideoLinkOpenModeConfig[mode].enabled === "boolean" && VideoLinkOpenModeConfig[mode].enabled).map((mode) => {
        return {
          key: VideoLinkOpenModeKey[mode],
          label: VideoLinkOpenModeConfig[mode].label,
          icon: VideoLinkOpenModeConfig[mode].icon,
          onClick: () => onOpenWithMode(mode)
        };
      }) : [];
    }, []);
    const openInPopupButtonEl = React.useMemo(() => {
      if (videoLinkOpenMode === VideoLinkOpenMode.Popup) return;
      if (item.api === EApiType.Live) return;
      if (!hasDocumentPictureInPicture) return;
      return /* @__PURE__ */ jsx$1(VideoCardActionButton, { visible: actionButtonVisible, inlinePosition: "right", icon: VideoLinkOpenModeConfig.Popup.icon, tooltip: VideoLinkOpenModeConfig.Popup.label, onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenWithMode(VideoLinkOpenMode.Popup);
      } });
    }, [videoLinkOpenMode, actionButtonVisible]);
    const onOpenInPopup = useMemoizedFn(() => {
      onOpenWithMode(VideoLinkOpenMode.Popup);
    });
    return {
      onOpenWithMode,
      handleVideoLinkClick,
      consistentOpenMenus,
      conditionalOpenMenus,
      openInPopupButtonEl,
      onOpenInPopup
    };
  }
  const hasDocumentPictureInPicture = !!((_c = window.documentPictureInPicture) == null ? void 0 : _c.requestWindow);
  async function openInPipOrPopup(newHref, bvid, videoWidth, videoHeight) {
    var _a2;
    let popupWidth = 1e3;
    let popupHeight = Math.ceil(popupWidth / 16 * 9);
    const MAX_API_WAIT = 200;
    if ((!videoWidth || !videoHeight) && bvid) {
      const detail = await Promise.race([getVideoDetail(bvid), delay(MAX_API_WAIT)]);
      if (detail) {
        videoWidth = detail.dimension.width;
        videoHeight = detail.dimension.height;
      }
    }
    if (videoWidth && videoHeight && videoWidth < videoHeight) {
      const maxHeight = Math.min(Math.floor(window.screen.availHeight * 0.8), 1e3);
      const maxWidth = Math.floor(maxHeight / videoHeight * videoWidth);
      popupWidth = Math.min(720, maxWidth);
      popupHeight = Math.floor(popupWidth / videoWidth * videoHeight);
    }
    debug$9("openInPipOrPopup newHref=%s size=%sx%s", newHref, popupWidth, popupHeight);
    let pipWindow;
    if (hasDocumentPictureInPicture) {
      try {
        pipWindow = await ((_a2 = window.documentPictureInPicture) == null ? void 0 : _a2.requestWindow({
          width: popupWidth,
          height: popupHeight,
          disallowReturnToOpener: true
        }));
      } catch (e) {
      }
    }
    if (pipWindow) {
      renderInPipWindow(newHref, pipWindow);
    } else {
      openPopupWindow(newHref, popupWidth, popupHeight);
    }
  }
  function openPopupWindow(newHref, popupWidth, popupHeight) {
    const left = (window.innerWidth - popupWidth) / 2;
    const top = (window.innerHeight - popupHeight) / 2 - 50;
    const features = ["popup=true", `width=${popupWidth}`, `height=${popupHeight}`, `left=${left}`, `top=${top}`].join(",");
    debug$9("openInPopup: features -> %s", features);
    window.open(newHref, "_blank", features);
  }
  function useLinkNewTab() {
    const {
      videoLinkOpenMode
    } = useSettingsSnapshot();
    return videoLinkOpenMode !== VideoLinkOpenMode.CurrentPage;
  }
  function useLinkTarget() {
    const newTab = useLinkNewTab();
    return newTab ? "_blank" : "_self";
  }
  function getLinkTarget() {
    const newTab = settings.videoLinkOpenMode !== VideoLinkOpenMode.CurrentPage;
    return newTab ? "_blank" : "_self";
  }
  function CustomTargetLink(props) {
    const target = useLinkTarget();
    return /* @__PURE__ */ jsx$1("a", { ...props, target, children: props.children });
  }
  function unwrapRef(ref) {
    return ref.value;
  }
  var Dispatcher = class _Dispatcher {
    constructor(executors) {
      __publicField(this, "executorRefs");
      __publicField(this, "idleState");
      __publicField(this, "aborted", false);
      __publicField(this, "pendingResolves", []);
      __publicField(this, "replenish", (executor) => {
        var _a2;
        if (this.aborted) return;
        if (!this.pendingResolves.length) return;
        (_a2 = this.pendingResolves.shift()) == null ? void 0 : _a2();
      });
      if (!executors.length) throw new Error("executors can not be empty");
      this.executorRefs = executors.map((x) => ({ value: x }));
      this.idleState = /* @__PURE__ */ new WeakMap();
      this.executorRefs.forEach((x) => this.idleState.set(x, true));
    }
    static fromConcurrency(concurrency, label = "") {
      if (!isFinite(concurrency)) throw new Error("concurrency must be finite");
      if (!(concurrency > 0)) throw new Error("concurrency must be greater than 0");
      const executors = new Array(concurrency).fill(0).map(
        (_, index) => [label, `executors(${concurrency})`, index].map((x) => x && x.toString().trim()).filter(Boolean).join(".")
      );
      return new _Dispatcher(executors);
    }
    abort() {
      this.aborted = true;
      this.pendingResolves = [];
    }
    async getExecutorRef() {
      const find = () => this.executorRefs.find((x) => this.idleState.get(x));
      let executorRef = find();
      while (!executorRef) {
        const { promise, resolve } = Promise.withResolvers();
        this.pendingResolves.push(resolve);
        await promise;
        executorRef = find();
      }
      this.idleState.set(executorRef, false);
      return executorRef;
    }
    async dispatch(action2) {
      const executorRef = await this.getExecutorRef();
      const executor = unwrapRef(executorRef);
      try {
        return await action2(executor);
      } finally {
        this.idleState.set(executorRef, true);
        setTimeout(() => this.replenish(executorRef));
      }
    }
  };
  async function pmap(arr2, fn, concurrency) {
    concurrency = Math.min(concurrency, arr2.length);
    const dispatcher = Dispatcher.fromConcurrency(concurrency, "pmap");
    try {
      return await Promise.all(
        arr2.map((item, index) => dispatcher.dispatch(() => fn(item, index, arr2)))
      );
    } catch (e) {
      dispatcher.abort();
      throw e;
    }
  }
  let episodes = [];
  let cacheKey = "";
  function genCacheKey() {
    const now = dayjs();
    return [now.format("YYYYMMDD"), now.hour() < 18 ? "lt-18" : "gte-18"].join("_");
  }
  async function getEpisodeList() {
    const useCache = episodes.length && cacheKey && cacheKey === genCacheKey();
    if (useCache) return episodes;
    const res = await request.get("/x/web-interface/popular/series/list");
    const json = res.data;
    const list = json.data.list;
    episodes = list;
    cacheKey = genCacheKey();
    return episodes;
  }
  const _PopularWeeklyRecService = class _PopularWeeklyRecService {
    constructor() {
      __publicField(this, "episodesLoaded", false);
      __publicField(this, "episodes", []);
      __publicField(this, "id");
      __publicField(this, "useShuffle");
      // full-list = returnedItems + bufferQueue + more
      __publicField(this, "qs", new QueueStrategy(_PopularWeeklyRecService.PAGE_SIZE));
      this.id = _PopularWeeklyRecService.id++;
      this.useShuffle = settings.popularWeeklyUseShuffle;
    }
    get hasMore() {
      if (!this.episodesLoaded) return true;
      return !!this.qs.bufferQueue.length || !!this.episodes.length;
    }
    async loadMore() {
      if (!this.episodesLoaded) {
        this.episodes = await getEpisodeList();
        this.episodesLoaded = true;
        if (this.useShuffle) this.episodes = shuffle(this.episodes);
      }
      if (!this.hasMore) return;
      if (!this.useShuffle) {
        if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue();
        const ep = this.episodes[0];
        const epNum = ep.number;
        const items = await fetchWeeklyItems(epNum);
        this.qs.bufferQueue.push({
          api: EApiType.Separator,
          uniqId: `popular-weekly-${epNum}`,
          content: /* @__PURE__ */ jsx$1(CustomTargetLink, { href: `https://www.bilibili.com/v/popular/weekly?num=${epNum}`, children: ep.name })
        }, ...items);
        this.episodes = this.episodes.slice(1);
        return this.qs.sliceFromQueue();
      }
      const prefetchPage = 5;
      while (this.qs.bufferQueue.length < _PopularWeeklyRecService.PAGE_SIZE * prefetchPage && this.episodes.length) {
        this.episodes = shuffle(this.episodes);
        const episodes2 = this.episodes.slice(0, prefetchPage);
        this.episodes = this.episodes.slice(prefetchPage);
        const fetched = await pmap(episodes2.map((x) => x.number), (episodeNum) => fetchWeeklyItems(episodeNum), 2);
        this.qs.bufferQueue = shuffle([...this.qs.bufferQueue, ...fetched.flat()]);
      }
      return this.qs.sliceFromQueue();
    }
    get usageInfo() {
      return /* @__PURE__ */ jsx$1(PopularWeeklyUsageInfo, {});
    }
  };
  __publicField(_PopularWeeklyRecService, "id", 0);
  __publicField(_PopularWeeklyRecService, "PAGE_SIZE", 20);
  let PopularWeeklyRecService = _PopularWeeklyRecService;
  const cache$1 = {};
  async function fetchWeeklyItems(episodeNum) {
    var _a2;
    if (!((_a2 = cache$1[episodeNum]) == null ? void 0 : _a2.length)) {
      const res = await request.get("/x/web-interface/popular/series/one", {
        params: {
          number: episodeNum
        }
      });
      const json = res.data;
      const items2 = (json.data.list || []).map((item) => {
        return {
          ...item,
          api: EApiType.PopularWeekly,
          uniqId: item.bvid
        };
      });
      cache$1[episodeNum] = items2;
    }
    const items = cache$1[episodeNum];
    return items;
  }
  function PopularWeeklyUsageInfo() {
    const onRefresh = useOnRefreshContext();
    return /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsx$1(SwitchSettingItem, { configPath: "popularWeeklyUseShuffle", checkedChildren: "随机顺序: 开", unCheckedChildren: "随机顺序: 关", extraAction: async () => {
      await delay(100);
      onRefresh == null ? void 0 : onRefresh();
    } }) });
  }
  class RankingRecService {
    constructor(slug) {
      __publicField(this, "loaded", false);
      __publicField(this, "slug");
      __publicField(this, "qs", new QueueStrategy(20));
      this.slug = slug || rankingStore.slug;
    }
    get hasMore() {
      if (!this.loaded) return true;
      return !!this.qs.bufferQueue.length;
    }
    async loadMore(abortSignal) {
      var _a2, _b2;
      if (!this.hasMore) return;
      if (!this.loaded) {
        const c2 = RANKING_CATEGORIES_MAP[this.slug];
        const url = getRequestUrl(c2);
        const res = await request.get(url, {
          signal: abortSignal
        });
        const json = res.data;
        this.loaded = true;
        if (!isWebApiSuccess(json)) {
          toast(json.message || REQUEST_FAIL_MSG);
          return;
        }
        const list = ((_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.list) || ((_b2 = json == null ? void 0 : json.result) == null ? void 0 : _b2.list) || [];
        const items = list.map((item, index) => {
          return {
            ...item,
            api: EApiType.Ranking,
            uniqId: crypto.randomUUID(),
            rankingNo: index + 1,
            slug: this.slug,
            categoryType: c2.type
          };
        });
        this.qs.bufferQueue = items;
      }
      return this.qs.sliceFromQueue();
    }
    get usageInfo() {
      return /* @__PURE__ */ jsx$1(RankingUsageInfo, {});
    }
  }
  const rankingStore = await( proxyWithGmStorage({
    slug: "all"
  }, "ranking-store"));
  if (!RANKING_CATEGORIES.map((x) => x.slug).includes(rankingStore.slug)) {
    rankingStore.slug = "all";
  }
  var _ref$o = {
    name: "8755wl",
    styles: "display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:8px 12px;padding-inline:2px"
  };
  var _ref2$i = {
    name: "1rhmfkj",
    styles: "max-width:500px;margin-top:15px;padding-top:5px;&:first-child{margin-top:0;padding-top:0;}"
  };
  function RankingUsageInfo() {
    const {
      ref,
      getPopupContainer
    } = usePopupContainer();
    const onRefresh = useOnRefreshContext();
    const {
      slug
    } = useSnapshot(rankingStore);
    const category = React.useMemo(() => RANKING_CATEGORIES_MAP[slug], [slug]);
    const renderCategoryList = (list, key, label) => {
      return /* @__PURE__ */ jsxs("div", { css: _ref2$i, children: [
        /* @__PURE__ */ jsxs("p", { css: [flexVerticalCenterStyle, /* @__PURE__ */ css("margin-bottom:8px;color:#fff;background-color:", colorPrimaryValue, ";padding:5px 0;padding-left:6px;border-radius:5px;", ""), "", ""], children: [
          label,
          key !== "normal" && /* @__PURE__ */ jsx$1(HelpInfo, { children: "不能提供预览" })
        ] }),
        /* @__PURE__ */ jsx$1("div", { className: "grid", css: _ref$o, children: list.map((c2) => {
          const active = c2.slug === slug;
          return /* @__PURE__ */ jsx$1(antd.Button, { css: [active && /* @__PURE__ */ css("border-color:", colorPrimaryValue, ";color:", colorPrimaryValue, ";", ""), "", ""], onClick: (e) => {
            setPopoverOpen(false);
            rankingStore.slug = c2.slug;
            onRefresh == null ? void 0 : onRefresh();
          }, children: /* @__PURE__ */ jsx$1("span", { children: c2.name }) }, c2.slug);
        }) })
      ] });
    };
    const popoverContent = /* @__PURE__ */ jsxs(Fragment, { children: [
      renderCategoryList(RANKING_CATEGORIES_GROUPDED.normal, "normal", "视频"),
      renderCategoryList(RANKING_CATEGORIES_GROUPDED.cinema, "cinema", "影视"),
      renderCategoryList(RANKING_CATEGORIES_GROUPDED.bangumi, "bangumi", "番剧")
    ] });
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const popover = /* @__PURE__ */ jsx$1(antd.Popover, { arrow: false, open: popoverOpen, onOpenChange: setPopoverOpen, placement: "bottomLeft", getPopupContainer, content: popoverContent, overlayInnerStyle: {
      border: `1px solid ${usePopoverBorderColor()}`
    }, children: /* @__PURE__ */ jsx$1(antd.Button, { css: [popoverOpen && buttonOpenCss, "", ""], children: category.name }) });
    return /* @__PURE__ */ jsx$1("div", { ref, children: popover });
  }
  const ServiceMap = {
    [EHotSubTab.PopularGeneral]: PopularGeneralRecService,
    [EHotSubTab.PopularWeekly]: PopularWeeklyRecService,
    [EHotSubTab.Ranking]: RankingRecService
  };
  function isHotTabUsingShuffle(shuffleForPopularWeekly) {
    const {
      subtab
    } = hotStore;
    shuffleForPopularWeekly ?? (shuffleForPopularWeekly = settings.popularWeeklyUseShuffle);
    const change = subtab === EHotSubTab.PopularWeekly && shuffleForPopularWeekly;
    return change;
  }
  const iconSize = 18;
  const imgOf = (src) => /* @__PURE__ */ jsx$1("img", { src, alt: "", style: {
    ...size(`${iconSize}px`)
  } });
  const groupedButtonCss = {
    name: "1bgyaa0",
    styles: ".ant-btn-icon{line-height:0;}"
  };
  const HotSubTabConfig = {
    [EHotSubTab.PopularGeneral]: {
      // icon: <IconPark name='Fire' size={15} />,
      icon: imgOf("https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_popular.png"),
      label: "综合热门",
      desc: "各个领域中新奇好玩的优质内容都在这里~",
      swr: true,
      anonymousUsage: true
    },
    [EHotSubTab.PopularWeekly]: {
      // icon: <IconPark name='TrendTwo' size={15} />,
      icon: imgOf("https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_weekly.png"),
      label: "每周必看",
      desc: "每周五晚 18:00 更新",
      anonymousUsage: true
    },
    [EHotSubTab.Ranking]: {
      // icon: <IconPark name='Ranking' size={15} />,
      icon: imgOf("https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_rank.png"),
      label: "排行榜",
      desc: "排行榜根据稿件内容质量，近期的数据综合展示，动态更新",
      anonymousUsage: true,
      swr: true
    }
  };
  class HotRecService extends BaseTabService {
    constructor() {
      super(20);
      __publicField(this, "subtab");
      __publicField(this, "service");
      this.subtab = hotStore.subtab;
      this.service = new ServiceMap[hotStore.subtab]();
    }
    get usageInfo() {
      return /* @__PURE__ */ jsx$1(HotUsageInfo, { children: this.service.usageInfo });
    }
    get hasMoreExceptQueue() {
      return this.service.hasMore;
    }
    fetchMore(abortSignal) {
      return this.service.loadMore(abortSignal);
    }
  }
  const hotStore = await( proxyWithGmStorage({
    subtab: EHotSubTab.PopularGeneral
  }, "hot-store"));
  if (!Object.values(EHotSubTab).includes(hotStore.subtab)) {
    hotStore.subtab = EHotSubTab.PopularGeneral;
  }
  function HotUsageInfo({
    children
  }) {
    const {
      subtab: activeSubtab
    } = useSnapshot(hotStore);
    const {
      icon,
      label
    } = HotSubTabConfig[activeSubtab];
    const onRefresh = useOnRefreshContext();
    const {
      ref,
      getPopupContainer
    } = usePopupContainer();
    const {
      __internalHotSubUseDropdown
    } = useSettingsSnapshot();
    const menus = React.useMemo(() => [EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Ranking].map((subtab, index) => {
      const config = HotSubTabConfig[subtab];
      const active = subtab === activeSubtab;
      return [index > 0 && {
        type: "divider"
      }, {
        key: subtab,
        label: /* @__PURE__ */ jsx$1("span", { css: [active && /* @__PURE__ */ css("color:", colorPrimaryValue, ";", ""), "", ""], children: config.label }),
        icon: config.icon,
        onClick() {
          if (subtab === hotStore.subtab) return;
          hotStore.subtab = subtab;
          onRefresh == null ? void 0 : onRefresh();
        }
      }].filter(Boolean);
    }).flat(), [activeSubtab]);
    const dropdownMenu = /* @__PURE__ */ jsx$1(antd.Dropdown, { menu: {
      items: menus
    }, getPopupContainer, rootClassName: styled.createClass`
        .ant-dropdown-menu-item-divider {
          margin: 2px 0 !important;
        }
      `, children: /* @__PURE__ */ jsxs(antd.Button, { ref, className: "w-114px gap-0 flex items-center justify-start pl-16px", children: [
      icon,
      /* @__PURE__ */ jsx$1("span", { css: C.ml(8), children: label })
    ] }) });
    const tab2 = React.useMemo(() => {
      return /* @__PURE__ */ jsx$1(antd.Button.Group, { children: [EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Ranking].map((subtab, index) => {
        const {
          icon: icon2,
          label: label2,
          desc
        } = HotSubTabConfig[subtab];
        const active = subtab === activeSubtab;
        return /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
          label2,
          ": ",
          desc
        ] }), children: /* @__PURE__ */ jsx$1(antd.Button, { css: groupedButtonCss, icon: icon2, variant: active ? "solid" : "outlined", color: active ? "primary" : "default", onClick: () => {
          if (subtab === hotStore.subtab) return;
          hotStore.subtab = subtab;
          onRefresh == null ? void 0 : onRefresh();
        }, children: label2 }) }, subtab);
      }) });
    }, [activeSubtab]);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      __internalHotSubUseDropdown ? dropdownMenu : tab2,
      children
    ] });
  }
  const TabConfig = {
    [ETab.AppRecommend]: {
      icon: /* @__PURE__ */ jsx$1(IconForPhone, { ...size(18) }),
      label: "推荐",
      desc: "使用 Bilibili App 端推荐 API",
      anonymousUsage: true
    },
    [ETab.PcRecommend]: {
      icon: /* @__PURE__ */ jsx$1(IconForPc, { ...size(18) }),
      label: "推荐",
      desc: "使用新版首页顶部推荐 API",
      anonymousUsage: true
    },
    [ETab.KeepFollowOnly]: {
      icon: /* @__PURE__ */ jsx$1(IconForFollowedOnly, { ...size(18) }),
      label: "已关注",
      desc: "从PC端推荐中筛选出「已关注」,可能比较慢; 关注的UP更新在动态~"
    },
    [ETab.DynamicFeed]: {
      icon: /* @__PURE__ */ jsx$1(IconForDynamicFeed, { ...size(16) }),
      label: "动态",
      desc: "视频投稿动态",
      swr: true
    },
    [ETab.Watchlater]: {
      icon: /* @__PURE__ */ jsx$1(IconForWatchlater, { ...size(17), css: {
        name: "1jijiug",
        styles: ".circle{stroke:currentColor;}"
      } }),
      label: "稍后再看",
      desc: "你添加的稍后再看; 默认随机乱序, 可在设置中关闭乱序",
      swr: true
    },
    [ETab.Fav]: {
      icon: /* @__PURE__ */ jsx$1(IconForFav, { ...size(16), css: C.mt(-1) }),
      label: "收藏",
      desc: "你添加的收藏; 默认随机乱序, 可在设置中关闭乱序",
      get swr() {
        return !favStore.usingShuffle;
      }
    },
    [ETab.Hot]: {
      icon: /* @__PURE__ */ jsx$1(IconForHot, { ...size(16) }),
      label: "热门",
      desc: "各个领域中新奇好玩的优质内容都在这里~",
      anonymousUsage: true,
      get swr() {
        return !isHotTabUsingShuffle();
      }
    },
    [ETab.Live]: {
      icon: /* @__PURE__ */ jsx$1(IconForLive, { ...size(16) }),
      // icon: <MaterialSymbolsBarChart {...size(16)} />,
      label: "直播",
      desc: "直播~",
      swr: true
    }
  };
  function TabIcon({
    tabKey,
    moreCss,
    size: _size3,
    ml,
    mr,
    mt,
    mb,
    active
  }) {
    const {
      icon
    } = TabConfig[tabKey];
    const newCssProp = [icon.props.css, moreCss, ml && C.ml(ml), mr && C.mr(mr), mt && C.mt(mt), mb && C.mb(mb)].flat().filter(Boolean);
    const cloned = React.cloneElement(icon, {
      css: newCssProp,
      width: _size3 ? size(_size3).width : icon.props.width,
      height: _size3 ? size(_size3).height : icon.props.height,
      active: tabKey === ETab.Live ? active : void 0
      // 否则 warn: svg recived boolean props
    });
    return cloned;
  }
  function toastNeedLogin() {
    return toast("你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~");
  }
  function useShortcut({
    enabled,
    refresh,
    minIndex = 0,
    maxIndex,
    containerRef,
    getScrollerRect,
    changeScrollY,
    videoCardEmitters
  }) {
    const [activeIndex, setActiveIndex] = React.useState(void 0);
    const isEnabled = useMemoizedFn(() => {
      if (!enabled) return false;
      if (shouldDisableShortcut()) return false;
      return true;
    });
    const activeIndexIsValid = useMemoizedFn(() => {
      var _a2;
      if (typeof activeIndex !== "number") return false;
      if (!containerRef.current) return false;
      const scrollerRect = getScrollerRect();
      const rect = (_a2 = containerRef.current.querySelector(`.${APP_CLS_CARD}.${APP_CLS_CARD_ACTIVE}`)) == null ? void 0 : _a2.getBoundingClientRect();
      if (!scrollerRect || !rect) return false;
      if (rect.top - scrollerRect.top < -(scrollerRect.height + rect.height)) {
        return false;
      }
      if (rect.top - scrollerRect.top > scrollerRect.height * 2 + rect.height) {
        return false;
      }
      return true;
    });
    function getStep(direction) {
      const card = getCardAt(activeIndex);
      const activeLeft = card.getBoundingClientRect().left;
      const isLeftSame = (left) => Math.abs(activeLeft - left) < 1;
      {
        const col = getColumnCount(containerRef.current);
        const step2 = direction === "down" ? col : -col;
        const newCard = getCardAt(activeIndex + step2);
        if (newCard) {
          const left = newCard.getBoundingClientRect().left;
          if (isLeftSame(left)) {
            return step2;
          }
        }
      }
      let step = 0;
      let cur = card;
      const next2 = () => direction === "down" ? cur.nextElementSibling : cur.previousElementSibling;
      while (next2()) {
        cur = next2();
        if (!cur.classList.contains(APP_CLS_CARD)) continue;
        direction === "down" ? step++ : step--;
        const left = cur.getBoundingClientRect().left;
        if (isLeftSame(left)) {
          return step;
        }
      }
      return 0;
    }
    const addActiveIndex = (step) => (e) => {
      if (!isEnabled()) return;
      e == null ? void 0 : e.preventDefault();
      let newActiveIndex;
      if (activeIndexIsValid()) {
        const _step = typeof step === "number" ? step : getStep(step);
        newActiveIndex = activeIndex + _step;
      } else {
        newActiveIndex = getInitialIndex();
      }
      if (newActiveIndex < minIndex) {
        makeVisible(minIndex);
        return;
      }
      if (newActiveIndex > maxIndex) {
        makeVisible(maxIndex);
        return;
      }
      setActiveIndex(newActiveIndex);
      makeVisible(newActiveIndex);
    };
    const useKey = (keyFilter, eventHandler) => {
      useKeyPress(keyFilter, (event, key) => {
        if (!isEnabled()) return;
        eventHandler(event, key);
      }, {
        exactMatch: true
      });
    };
    useKey("leftarrow", addActiveIndex(-1));
    useKey("rightarrow", addActiveIndex(1));
    useKey("tab", addActiveIndex(1));
    useKey("shift.tab", addActiveIndex(-1));
    useKey("uparrow", addActiveIndex("up"));
    useKey("downarrow", addActiveIndex("down"));
    const clearActiveIndex = () => {
      if (!isEnabled()) return;
      setActiveIndex(void 0);
    };
    const getActiveEmitter = () => {
      if (!isEnabled() || typeof activeIndex !== "number") return;
      return videoCardEmitters[activeIndex];
    };
    useKey("esc", clearActiveIndex);
    useKey("enter", () => {
      var _a2;
      return (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("open");
    });
    useKey("x", () => {
      var _a2;
      return (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("open-in-popup");
    });
    useKey("backspace", () => {
      var _a2;
      return (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("trigger-dislike");
    });
    useKey(["s", "w"], () => {
      var _a2;
      return (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("toggle-watch-later");
    });
    useKey(["period", "p"], () => {
      var _a2;
      return (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("hotkey-preview-animation");
    });
    function getInitialIndex() {
      const scrollerRect = getScrollerRect();
      if (!scrollerRect) return 0;
      const cards = getCards();
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rect = card.getBoundingClientRect();
        if (rect.top >= scrollerRect.top) {
          return i;
        }
      }
      return 0;
    }
    const CARDS_SELECTOR = `.${APP_CLS_CARD}`;
    function getCards() {
      var _a2;
      return [...((_a2 = containerRef.current) == null ? void 0 : _a2.querySelectorAll(CARDS_SELECTOR)) || []];
    }
    function getCardAt(index) {
      return getCards()[index];
    }
    function makeVisible(index) {
      var _a2;
      const card = getCardAt(index);
      (_a2 = card == null ? void 0 : card.scrollIntoViewIfNeeded) == null ? void 0 : _a2.call(card, false);
      const scrollerRect = getScrollerRect();
      const rect = card.getBoundingClientRect();
      if (!scrollerRect || !rect) return;
      if (rect.top <= scrollerRect.top) {
        const offset = -(scrollerRect.top - rect.top + 10);
        changeScrollY == null ? void 0 : changeScrollY({
          offset
        });
        return;
      }
      if (scrollerRect.bottom - rect.bottom < 20) {
        const offset = 20 - (scrollerRect.bottom - rect.bottom);
        changeScrollY == null ? void 0 : changeScrollY({
          offset
        });
        return;
      }
    }
    return {
      activeIndex,
      clearActiveIndex
    };
  }
  const countCache1 = /* @__PURE__ */ new Map();
  const countCache2 = /* @__PURE__ */ new Map();
  function getColumnCount(container, mayHaveNarrowMode = true) {
    if (mayHaveNarrowMode && settings.useNarrowMode) return 2;
    const countCache = settings.style.pureRecommend.useCustomGrid ? countCache1 : countCache2;
    {
      const count2 = countCache.get(Math.trunc(window.innerWidth));
      if (count2) return count2;
    }
    container || (container = document.querySelector(`.${videoGrid}`));
    if (!container) return 0;
    const style = window.getComputedStyle(container);
    if (style.display !== "grid") return 0;
    const count = style.gridTemplateColumns.split(" ").length;
    countCache.set(window.innerWidth, count);
    return count;
  }
  async function modifyRelations(upMid, act) {
    const uid2 = getUid();
    const csrf = getCsrfToken();
    const params = new URLSearchParams({
      fid: upMid,
      act: String(act),
      re_src: "11",
      gaia_source: "web_main",
      spmid: "333.999.0.0",
      extend_content: JSON.stringify({
        entity: "user",
        entity_id: uid2,
        fp: d()
      }),
      csrf
    });
    const res = await request.post("/x/relation/modify", params);
    const json = res.data;
    const success = isWebApiSuccess(json);
    if (!success) {
      toast(json.message || "未知错误");
    }
    return success;
  }
  function d() {
    let t;
    let e;
    const i = (
      // @ts-ignore
      (null === (t = window.reportObserver) || void 0 === t || null === (e = t.cache) || void 0 === e ? void 0 : e.fpriskMsg) || {}
    );
    let n = "empty";
    return i && (n = i.webdriver + "" + i.screenResolution + "" + i.platform + "" + i.hardwareConcurrency + "" + i.deviceMemory + "" + i.colorDepth + "" + i.indexedDb + "" + i.language + "" + i.openDatabase + "" + i.touchSupport + "" + i.userAgent), decodeURIComponent(n);
  }
  const debug$8 = baseDebug.extend("service:user:relations:blacklist");
  const blacklistAdd = blacklistActionFactory("follow");
  const blacklistRemove = blacklistActionFactory("remove");
  const UserBlacklistService = {
    add: blacklistAdd,
    remove: blacklistRemove
  };
  const {
    set: blacklistMids,
    replaceAllWith: blacklistMidsReplaceAllWith
  } = await( proxySetWithGmStorage("blacklist-mids"));
  function useInBlacklist(upMid) {
    const set2 = useSnapshot(blacklistMids);
    return !!upMid && set2.has(upMid);
  }
  function blacklistActionFactory(action2) {
    const act = action2 === "follow" ? 5 : 6;
    return async function blacklistAction(upMid) {
      const success = await modifyRelations(upMid, act);
      if (success) {
        const set2 = blacklistMids;
        if (action2 === "follow") {
          set2.add(upMid);
        } else if (action2 === "remove") {
          set2.delete(upMid);
        }
      }
      return success;
    };
  }
  async function getUserBlacklist() {
    const ps = 20;
    const getPage = async (pn) => {
      const res = await request.get("/x/relation/blacks", {
        params: {
          re_version: 0,
          ps,
          pn
        }
      });
      const json = res.data;
      if (!isWebApiSuccess(json)) return;
      const total2 = json.data.total;
      const mids2 = json.data.list.map((x) => x.mid);
      return {
        total: total2,
        mids: mids2
      };
    };
    const ret = await getPage(1);
    if (!ret) return;
    const {
      total,
      mids = []
    } = ret;
    let blackMids = mids;
    if (total) {
      const maxPn = Math.ceil(total / ps);
      for (let pn = 2; pn <= maxPn; pn++) {
        const {
          mids: mids2 = []
        } = await getPage(pn) || {};
        blackMids = blackMids.concat(mids2);
      }
    }
    return blackMids;
  }
  (async () => {
    if (!IN_BILIBILI_HOMEPAGE) return;
    await whenIdle();
    const ids2 = await getUserBlacklist();
    debug$8("user blocklist fetched: %o", ids2);
    if (ids2) {
      blacklistMidsReplaceAllWith(ids2.map((x) => x.toString()));
    }
  })();
  function isAppRecommend(item) {
    return item.api === EApiType.AppRecommend;
  }
  function isPcRecommend(item) {
    return item.api === EApiType.PcRecommend;
  }
  function isDynamicFeed(item) {
    return item.api === EApiType.DynamicFeed;
  }
  function isWatchlater(item) {
    return item.api === EApiType.Watchlater;
  }
  function isFav(item) {
    return item.api === EApiType.Fav;
  }
  function isPopularGeneral(item) {
    return item.api === EApiType.PopularGeneral;
  }
  function isPopularWeekly(item) {
    return item.api === EApiType.PopularWeekly;
  }
  function isRanking(item) {
    return item.api === EApiType.Ranking;
  }
  function isLive(item) {
    return item.api === EApiType.Live;
  }
  function isFavFolderDefault(attr) {
    return attr.toString(2).at(-2) === "0";
  }
  function isFavFolderPrivate(attr) {
    return attr.toString(2).at(-1) === "1";
  }
  function ShuffleSettingsItemFor({
    configPath,
    ...rest
  }) {
    return /* @__PURE__ */ jsx$1(ButtonSettingItem, { ...rest, configPath, checkedChildren: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(IconForShuffle, { ...size(18) }),
      "随机顺序"
    ] }), unCheckedChildren: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(IconForDefaultOrder, { ...size(18), className: "position-relative top-[-1px]" }),
      "默认顺序"
    ] }) });
  }
  const dropdownMenuStyle = {
    overscrollBehavior: "contain",
    maxHeight: "60vh",
    overflowY: "scroll",
    scrollbarWidth: "thin",
    paddingRight: "12px"
  };
  const lucideList = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13" }) });
  const ForwardRef$l = React.forwardRef(lucideList);
  const lucideFolderLock = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, children: [
    /* @__PURE__ */ jsx$1("rect", { width: 8, height: 5, x: 14, y: 17, rx: 1 }),
    /* @__PURE__ */ jsx$1("path", { d: "M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5" }),
    /* @__PURE__ */ jsx$1("path", { d: "M20 17v-2a2 2 0 1 0-4 0v2" })
  ] }) });
  const ForwardRef$k = React.forwardRef(lucideFolderLock);
  const lucideFolder = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" }) });
  const ForwardRef$j = React.forwardRef(lucideFolder);
  const ionLayersOutline = (props, ref) => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 512 512", width: "1.2em", height: "1.2em", ref, ...props, children: [
    /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 32, d: "m434.8 137.65l-149.36-68.1c-16.19-7.4-42.69-7.4-58.88 0L77.3 137.65c-17.6 8-17.6 21.09 0 29.09l148 67.5c16.89 7.7 44.69 7.7 61.58 0l148-67.5c17.52-8 17.52-21.1-.08-29.09M160 308.52l-82.7 37.11c-17.6 8-17.6 21.1 0 29.1l148 67.5c16.89 7.69 44.69 7.69 61.58 0l148-67.5c17.6-8 17.6-21.1 0-29.1l-79.94-38.47" }),
    /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 32, d: "m160 204.48l-82.8 37.16c-17.6 8-17.6 21.1 0 29.1l148 67.49c16.89 7.7 44.69 7.7 61.58 0l148-67.49c17.7-8 17.7-21.1.1-29.1L352 204.48" })
  ] });
  const ForwardRef$i = React.forwardRef(ionLayersOutline);
  const IconForAll = ForwardRef$l;
  const IconForPrivateFolder = ForwardRef$k;
  const IconForPublicFolder = ForwardRef$j;
  const IconForCollection = ForwardRef$i;
  function FavUsageInfo({
    extraContent
  }) {
    const {
      fav
    } = useSettingsSnapshot();
    const {
      favFolders,
      selectedFavFolder,
      favCollections,
      selectedFavCollection,
      selectedLabel,
      selectedKey
    } = useSnapshot(favStore);
    const onRefresh = useOnRefreshContext();
    const {
      ref,
      getPopupContainer
    } = usePopupContainer();
    useMount(() => {
      favStore.updateList();
    });
    useUpdateEffect(() => {
      void (async () => {
        await delay(100);
        onRefresh == null ? void 0 : onRefresh();
      })();
    }, [fav.addSeparator]);
    const scopeSelectionDropdownMenus = React.useMemo(() => {
      const collectionSubMenus = [];
      const collectionGrouped = groupBy(favCollections, (x) => x.upper.name);
      const entries = Object.entries(collectionGrouped).map(([upName, collections]) => ({
        upName,
        collections: collections.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
      }));
      entries.sort((a, b) => a.upName.localeCompare(b.upName, "zh-CN"));
      for (const {
        upName,
        collections
      } of entries) {
        collectionSubMenus.push(...defineAntMenus([{
          type: "group",
          label: `@${upName}`,
          children: collections.map((f) => {
            const key = `fav-collection:${f.id}`;
            const icon = /* @__PURE__ */ jsx$1(IconForCollection, {});
            const label = `${f.title} (${f.media_count})`;
            return {
              key,
              icon,
              label,
              async onClick() {
                favStore.selectedFavFolderId = void 0;
                favStore.selectedFavCollectionId = f.id;
                setScopeDropdownOpen(false);
                await delay(100);
                onRefresh == null ? void 0 : onRefresh();
              }
            };
          })
        }]));
      }
      return defineAntMenus([{
        key: "all",
        icon: /* @__PURE__ */ jsx$1(IconForAll, {}),
        label: "全部",
        async onClick() {
          favStore.selectedFavFolderId = void 0;
          favStore.selectedFavCollectionId = void 0;
          setScopeDropdownOpen(false);
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        }
      }, !!favFolders.length && {
        type: "group",
        label: "收藏夹",
        children: favFolders.map((f) => {
          isFavFolderDefault(f.attr);
          const isPrivate = isFavFolderPrivate(f.attr);
          const key = `fav-folder:${f.id}`;
          const icon = isPrivate ? /* @__PURE__ */ jsx$1(IconForPrivateFolder, {}) : /* @__PURE__ */ jsx$1(IconForPublicFolder, {});
          const label = `${f.title} (${f.media_count})`;
          return {
            key,
            icon,
            label,
            async onClick() {
              favStore.selectedFavFolderId = f.id;
              favStore.selectedFavCollectionId = void 0;
              setScopeDropdownOpen(false);
              await delay(100);
              onRefresh == null ? void 0 : onRefresh();
            }
          };
        })
      }, !!favCollections.length && {
        type: "group",
        label: "合集",
        children: collectionSubMenus
      }]);
    }, [favFolders, favCollections]);
    const [scopeDropdownOpen, setScopeDropdownOpen] = React.useState(false);
    const dropdownButtonIcon = selectedFavFolder ? isFavFolderPrivate(selectedFavFolder.attr) ? /* @__PURE__ */ jsx$1(IconForPrivateFolder, {}) : /* @__PURE__ */ jsx$1(IconForPublicFolder, {}) : selectedFavCollection ? /* @__PURE__ */ jsx$1(IconForCollection, {}) : /* @__PURE__ */ jsx$1(IconForAll, {});
    const dropdownButtonLabel = selectedLabel;
    const scopeSelectionDropdown = /* @__PURE__ */ jsx$1(antd.Dropdown, { open: scopeDropdownOpen, onOpenChange: setScopeDropdownOpen, placement: "bottomLeft", getPopupContainer, menu: {
      items: scopeSelectionDropdownMenus,
      style: {
        ...dropdownMenuStyle,
        border: `1px solid ${usePopoverBorderColor()}`
      },
      selectedKeys: [selectedKey]
    }, children: /* @__PURE__ */ jsx$1(antd.Button, { className: "gap-4px", css: [scopeDropdownOpen && buttonOpenCss, "", ""], icon: dropdownButtonIcon, children: dropdownButtonLabel }) });
    return /* @__PURE__ */ jsxs(antd.Space, { ref, size: 10, children: [
      scopeSelectionDropdown,
      extraContent
    ] });
  }
  var _ref$n = {
    name: "7xidhj",
    styles: "cursor:pointer;font-size:12px"
  };
  function ViewingAllExcludeFolderConfig({
    allFavFolderServices,
    state
  }) {
    const {
      fav
    } = useSettingsSnapshot();
    const onRefresh = useOnRefreshContext();
    const {
      ref,
      getPopupContainer
    } = usePopupContainer();
    const {
      totalCountInFavFolders
    } = useSnapshot(state);
    const [excludeFavFolderIdsChanged, setExcludeFavFolderIdsChanged] = React.useState(false);
    const handleChange = useMemoizedFn((newTargetKeys, direction, moveKeys) => {
      setExcludeFavFolderIdsChanged(true);
      settings.fav.excludedFolderIds = newTargetKeys.map((k) => k.toString());
    });
    const foldersCount = React.useMemo(() => allFavFolderServices.filter((x) => !fav.excludedFolderIds.includes(x.entry.id.toString())).length, [allFavFolderServices, fav.excludedFolderIds]);
    const onPopupOpenChange = useMemoizedFn((open) => {
      if (open) {
        setExcludeFavFolderIdsChanged(false);
      } else {
        if (excludeFavFolderIdsChanged) {
          onRefresh == null ? void 0 : onRefresh();
        }
      }
    });
    return /* @__PURE__ */ jsx$1(antd.Popover, { getTooltipContainer: getPopupContainer, trigger: "click", placement: "bottom", onOpenChange: onPopupOpenChange, getPopupContainer: (el) => el.parentElement || document.body, content: /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsx$1(antd.Transfer, { dataSource: allFavFolderServices, rowKey: (row2) => row2.entry.id.toString(), titles: ["收藏夹", "忽略"], targetKeys: fav.excludedFolderIds, onChange: handleChange, render: (item) => item.entry.title, oneWay: true, style: {
      marginBottom: 10
    } }) }), children: /* @__PURE__ */ jsxs(antd.Tag, { ref, color: "success", css: _ref$n, children: [
      "收藏夹(",
      foldersCount,
      ") 收藏(",
      totalCountInFavFolders,
      ")"
    ] }) });
  }
  var ELiveStatus = /* @__PURE__ */ ((ELiveStatus2) => {
    ELiveStatus2[ELiveStatus2["Offline"] = 0] = "Offline";
    ELiveStatus2[ELiveStatus2["Streaming"] = 1] = "Streaming";
    ELiveStatus2[ELiveStatus2["Rolling"] = 2] = "Rolling";
    return ELiveStatus2;
  })(ELiveStatus || {});
  const toHttps = (url) => (url || "").replace(/^http:\/\//, "https://");
  function parseDuration(d2) {
    if (!d2) return 0;
    const units = [1, 60, 360];
    const splited = d2.split(":").map((s) => Number(s)).reverse();
    const total = splited.reduce((total2, cur, index) => {
      return total2 + cur * units[index];
    }, 0);
    return total;
  }
  function formatDuration(d2) {
    d2 || (d2 = 0);
    return dayjs.duration(d2 || 0, "seconds").format(d2 >= 3600 ? "HH:mm:ss" : "mm:ss");
  }
  function formatCount(count) {
    if (!count) {
      if (typeof count === "number") return "0";
      else return count;
    }
    if (count <= 9999) {
      return count.toString();
    }
    const trimDotZero = (s) => s.replace(/\.0$/, "");
    count /= 1e4;
    if (count <= 9999) {
      const c2 = trimDotZero(count.toFixed(1));
      return `${c2}万`;
    }
    count /= 1e4;
    if (count <= 9999) {
      const c2 = trimDotZero(count.toFixed(1));
      return `${c2}亿`;
    }
    console.warn(`formatCount(count = ${count}); can not handle input`);
  }
  function parseCount(str) {
    if (!str) return void 0;
    if (str === "-") return 0;
    if (/^\d+$/.test(str)) return Number(str);
    if (/^\d+(\.\d+?)?万$/.test(str)) return Number(str.slice(0, -1)) * 1e4;
    if (/^\d+(\.\d+?)?亿$/.test(str)) return Number(str.slice(0, -1)) * 1e8;
  }
  const currentYear = dayjs().format("YYYY");
  function formatTimeStamp(unixTs, includeTime = false) {
    if (!unixTs) return "";
    const t = dayjs.unix(unixTs);
    const extraFormat = includeTime ? " HH:mm" : "";
    if (t.format("YYYY") === currentYear) {
      return t.format("M-D" + extraFormat);
    } else {
      return t.format("YY-M-D" + extraFormat);
    }
  }
  const VideoStateMap = {
    "1": "橙色通过",
    "0": "开放浏览",
    "-1": "待审",
    "-2": "被打回",
    "-3": "网警锁定",
    "-4": "被锁定",
    "-5": "管理员锁定",
    "-6": "修复待审",
    "-7": "暂缓审核",
    "-8": "补档待审",
    "-9": "等待转码",
    "-10": "延迟审核",
    "-11": "视频源待修",
    "-12": "转储失败",
    "-13": "允许评论待审",
    "-14": "临时回收站",
    "-15": "分发中",
    "-16": "转码失败",
    "-20": "创建未提交",
    "-30": "创建已提交",
    "-40": "定时发布",
    "-100": "用户删除"
  };
  function getVideoInvalidReason(state) {
    if (typeof state === "undefined") return;
    if (state >= 0) return;
    return VideoStateMap[state];
  }
  var XOR_CODE = 23442827791579n;
  var MASK_CODE = 2251799813685247n;
  var MAX_AID = 1n << 51n;
  var BASE = 58n;
  var data = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";
  function av2bv(aid) {
    const bytes = ["B", "V", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
    let bvIndex = bytes.length - 1;
    let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;
    while (tmp > 0) {
      bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
      tmp = tmp / BASE;
      bvIndex -= 1;
    }
    [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
    [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
    return bytes.join("");
  }
  function bv2av(bvid) {
    const bvidArr = Array.from(bvid);
    [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
    [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
    bvidArr.splice(0, 3);
    const tmp = bvidArr.reduce((pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)), 0n);
    return Number(tmp & MASK_CODE ^ XOR_CODE);
  }
  var BvCode = { av2bv, bv2av };
  const iconParkOutlinePreviewOpen = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M24 36c11.046 0 20-12 20-12s-8.954-12-20-12S4 24 4 24s8.954 12 20 12Z" }),
    /* @__PURE__ */ jsx$1("path", { d: "M24 29a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z" })
  ] }) });
  const ForwardRef$h = React.forwardRef(iconParkOutlinePreviewOpen);
  function defineStatItems(items) {
    return items;
  }
  const StatFieldConfig = {
    "play": {
      svgHref: "#widget-video-play-count"
    },
    // or #widget-play-count,
    "danmaku": {
      svgHref: "#widget-video-danmaku"
    },
    "like": {
      svgHref: "#widget-agree"
    },
    "bangumi:follow": {
      svgHref: "#widget-followed",
      svgScale: 1.3
    },
    "favorite": {
      svgHref: "#widget-favorite",
      svgScale: 0.9
    },
    "coin": {
      svgHref: "#widget-coin"
    },
    "live:viewed-by": {
      render({
        className
      }) {
        return /* @__PURE__ */ jsx$1(ForwardRef$h, { className });
      }
    }
  };
  const AppRecStatItemFieldMap = {
    1: "play",
    2: "like",
    // 没出现过, 猜的
    3: "danmaku",
    4: "bangumi:follow",
    // 追番
    20: "like"
    // 动态点赞
  };
  function getField(id) {
    return AppRecStatItemFieldMap[id] || AppRecStatItemFieldMap[1];
  }
  function StatItemDisplay({
    field,
    value
  }) {
    const text = value;
    const usingText = React.useMemo(() => {
      if (typeof text === "number" || text && /^\d+$/.test(text)) {
        return formatCount(Number(text)) ?? STAT_NUMBER_FALLBACK;
      } else {
        return text ?? STAT_NUMBER_FALLBACK;
      }
    }, [text]);
    const svgClassName = "bili-video-card__stats--icon";
    const icon = React.useMemo(() => {
      const {
        svgHref,
        svgScale,
        render: render5
      } = StatFieldConfig[field];
      if (render5) {
        return render5({
          className: svgClassName
        });
      }
      if (svgHref) {
        return /* @__PURE__ */ jsx$1("svg", { className: svgClassName, style: {
          transform: svgScale ? `scale(${svgScale})` : void 0
        }, children: /* @__PURE__ */ jsx$1("use", { href: svgHref }) });
      }
    }, [field]);
    return /* @__PURE__ */ jsxs("span", { className: "bili-video-card__stats--item", children: [
      icon,
      /* @__PURE__ */ jsx$1("span", { className: "bili-video-card__stats--text", style: {
        lineHeight: "calc(var(--icon-size) + 1px)"
      }, children: usingText })
    ] });
  }
  const DESC_SEPARATOR = " · ";
  function lookinto(item, opts) {
    if (isAppRecommend(item)) return opts[EApiType.AppRecommend](item);
    if (isPcRecommend(item)) return opts[EApiType.PcRecommend](item);
    if (isDynamicFeed(item)) return opts[EApiType.DynamicFeed](item);
    if (isWatchlater(item)) return opts.watchlater(item);
    if (isFav(item)) return opts.fav(item);
    if (isPopularGeneral(item)) return opts["popular-general"](item);
    if (isPopularWeekly(item)) return opts["popular-weekly"](item);
    if (isRanking(item)) return opts["ranking"](item);
    if (isLive(item)) return opts.live(item);
    throw new Error(`unknown api type`);
  }
  function normalizeCardData(item) {
    const ret = lookinto(item, {
      [EApiType.AppRecommend]: apiAppAdapter,
      [EApiType.PcRecommend]: apiPcAdapter,
      [EApiType.DynamicFeed]: apiDynamicAdapter,
      [EApiType.Watchlater]: apiWatchLaterAdapter,
      [EApiType.Fav]: apiFavAdapter,
      [EApiType.PopularGeneral]: apiPopularGeneralAdapter,
      [EApiType.PopularWeekly]: apiPopularWeeklyAdapter,
      [EApiType.Ranking]: apiRankingAdapter,
      [EApiType.Live]: apiLiveAdapter
    });
    if (ret.authorFace) ret.authorFace = toHttps(ret.authorFace);
    ret.cover = toHttps(ret.cover);
    return ret;
  }
  function apiAppAdapter(item) {
    return item.device === "android" ? apiAndroidAppAdapter(item) : apiIpadAppAdapter(item);
  }
  function apiAndroidAppAdapter(item) {
    var _a2, _b2, _c2;
    const extractCountFor = (target) => {
      const {
        cover_left_icon_1,
        cover_left_text_1,
        cover_left_icon_2,
        cover_left_text_2
      } = item;
      if (cover_left_icon_1 && AppRecStatItemFieldMap[cover_left_icon_1] === target) {
        return parseCount(cover_left_text_1);
      }
      if (cover_left_icon_2 && AppRecStatItemFieldMap[cover_left_icon_2] === target) {
        return parseCount(cover_left_text_2);
      }
    };
    const avid = item.param;
    const bvid = BvCode.av2bv(Number(item.param));
    const href = (() => {
      var _a3;
      if (item.uri.startsWith("http://") || item.uri.startsWith("https://")) {
        return item.uri;
      }
      if (item.goto === "av") {
        return `/video/${bvid}/`;
      }
      if (item.goto === "bangumi") {
        appWarn(`bangumi uri should not starts with 'bilibili://': %s`, item.uri);
        return item.uri;
      }
      if (item.goto === "picture") {
        const id = (_a3 = /^bilibili:\/\/article\/(\d+)$/.exec(item.uri)) == null ? void 0 : _a3[1];
        if (id) return `/read/cv${id}`;
        return item.uri;
      }
      return item.uri;
    })();
    return {
      // video
      avid,
      bvid,
      goto: item.goto,
      href,
      title: item.title,
      cover: item.cover,
      pubts: void 0,
      pubdateDisplay: void 0,
      duration: ((_a2 = item.player_args) == null ? void 0 : _a2.duration) || 0,
      durationStr: formatDuration((_b2 = item.player_args) == null ? void 0 : _b2.duration),
      recommendReason: item.rcmd_reason,
      // stat
      play: extractCountFor("play"),
      danmaku: extractCountFor("danmaku"),
      bangumiFollow: extractCountFor("bangumi:follow"),
      like: void 0,
      coin: void 0,
      favorite: void 0,
      // e.g 2023-09-17
      // cover_left_1_content_description: "156点赞"
      // cover_left_icon_1: 20
      // cover_left_text_1: "156"
      statItems: [item.cover_left_text_1 && {
        field: getField(item.cover_left_icon_1),
        value: item.cover_left_text_1
      }, item.cover_left_text_2 && {
        field: getField(item.cover_left_icon_2),
        value: item.cover_left_text_2
      }].filter(Boolean),
      // author
      authorName: item.args.up_name,
      authorFace: void 0,
      authorMid: String(item.args.up_id),
      appBadge: item.badge,
      appBadgeDesc: ((_c2 = item.desc_button) == null ? void 0 : _c2.text) || item.desc || ""
    };
  }
  function apiIpadAppAdapter(item) {
    var _a2, _b2;
    const extractCountFor = (target) => {
      const {
        cover_left_text_1,
        cover_left_text_2,
        cover_left_text_3
      } = item;
      const arr2 = [cover_left_text_1, cover_left_text_2, cover_left_text_3].filter(Boolean);
      if (target === "play") {
        const text = arr2.find((text2) => /观看|播放$/.test(text2));
        if (!text) return;
        const rest = text.replace(/观看|播放$/, "");
        return parseCount(rest);
      }
      if (target === "danmaku") {
        const text = arr2.find((text2) => /弹幕$/.test(text2));
        if (!text) return;
        const rest = text.replace(/弹幕$/, "");
        return parseCount(rest);
      }
      if (target === "bangumi:follow") {
        const text = arr2.find((text2) => /追[剧番]$/.test(text2));
        if (!text) return;
        const rest = text.replace(/追[剧番]$/, "");
        return parseCount(rest);
      }
    };
    const avid = item.param;
    const bvid = item.bvid || BvCode.av2bv(Number(item.param));
    const href = (() => {
      var _a3;
      if (item.uri.startsWith("http://") || item.uri.startsWith("https://")) {
        return item.uri;
      }
      if (item.goto === "av") {
        return `/video/${bvid}/`;
      }
      if (item.goto === "bangumi") {
        appWarn(`bangumi uri should not starts with 'bilibili://': %s`, item.uri);
        return item.uri;
      }
      if (item.goto === "picture") {
        const id = (_a3 = /^bilibili:\/\/article\/(\d+)$/.exec(item.uri)) == null ? void 0 : _a3[1];
        if (id) return `/read/cv${id}`;
        return item.uri;
      }
      return item.uri;
    })();
    const play = extractCountFor("play");
    const like = void 0;
    const coin = void 0;
    const danmaku = extractCountFor("danmaku");
    const favorite = void 0;
    const bangumiFollow = extractCountFor("bangumi:follow");
    const statItems = [{
      field: "play",
      value: play
    }, typeof danmaku === "number" ? {
      field: "danmaku",
      value: danmaku
    } : {
      field: "bangumi:follow",
      value: bangumiFollow
    }];
    const desc = item.desc || "";
    const [descAuthorName = void 0, descDate = void 0] = desc.split(DESC_SEPARATOR);
    return {
      // video
      avid,
      bvid,
      goto: item.goto,
      href,
      title: item.title,
      cover: item.cover,
      pubts: void 0,
      pubdateDisplay: descDate,
      duration: ((_a2 = item.player_args) == null ? void 0 : _a2.duration) || 0,
      durationStr: formatDuration((_b2 = item.player_args) == null ? void 0 : _b2.duration),
      recommendReason: item.bottom_rcmd_reason || item.top_rcmd_reason,
      // TODO: top_rcmd_reason
      // stat
      play,
      like,
      coin,
      danmaku,
      favorite,
      bangumiFollow,
      statItems,
      // author
      authorName: item.args.up_name || descAuthorName,
      authorFace: item.avatar.cover,
      authorMid: String(item.args.up_id || ""),
      appBadge: item.cover_badge,
      appBadgeDesc: item.desc
    };
  }
  function apiPcAdapter(item) {
    var _a2;
    return {
      // video
      avid: String(item.id),
      bvid: item.bvid,
      goto: item.goto,
      href: item.goto === "av" ? `/video/${item.bvid}/` : item.uri,
      title: item.title,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: (_a2 = item.rcmd_reason) == null ? void 0 : _a2.content,
      // stat
      play: item.stat.view,
      like: item.stat.like,
      coin: void 0,
      danmaku: item.stat.danmaku,
      favorite: void 0,
      statItems: [{
        field: "play",
        value: item.stat.view
      }, {
        field: "like",
        value: item.stat.like
      }],
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function apiDynamicAdapter(item) {
    const v = item.modules.module_dynamic.major.archive;
    const author = item.modules.module_author;
    const gateTs = dayjs().subtract(2, "days").unix();
    const pubdateDisplay = (() => {
      const ts = author.pub_ts;
      if (ts > gateTs) {
        return author.pub_time;
      } else {
        return formatTimeStamp(ts);
      }
    })();
    return {
      // video
      avid: v.aid,
      bvid: v.bvid,
      goto: "av",
      href: `/video/${v.bvid}/`,
      title: v.title,
      cover: v.cover,
      pubts: author.pub_ts,
      pubdateDisplay,
      duration: parseDuration(v.duration_text) || 0,
      durationStr: v.duration_text,
      recommendReason: v.badge.text,
      // stat
      statItems: [{
        field: "play",
        value: v.stat.play
      }, {
        field: "danmaku",
        value: v.stat.danmaku
      }],
      play: parseCount(v.stat.play),
      danmaku: parseCount(v.stat.danmaku),
      // author
      authorName: author.name,
      authorFace: author.face,
      authorMid: author.mid.toString()
    };
  }
  function apiWatchLaterAdapter(item) {
    const invalidReason = getVideoInvalidReason(item.state);
    const viewed = item.progress > 0;
    const title = `${viewed ? "【已观看】· " : ""}${item.title}`;
    const titleRender = invalidReason ? /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "视频已失效, 原因: ",
      invalidReason
    ] }), align: {
      offset: [0, -5]
    }, placement: "topLeft", children: /* @__PURE__ */ jsxs("del", { children: [
      viewed ? "【已观看】· " : "",
      item.title,
      "`"
    ] }) }) : void 0;
    return {
      // video
      avid: String(item.aid),
      bvid: item.bvid,
      goto: "av",
      href: `https://www.bilibili.com/list/watchlater?bvid=${item.bvid}&oid=${item.aid}`,
      title,
      titleRender,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      pubdateDisplayForTitleAttr: `${formatTimeStamp(item.pubdate, true)} 发布, ${formatTimeStamp(item.add_at, true)} 添加稍后再看`,
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: `${formatTimeStamp(item.add_at)} · 稍后再看`,
      // stat
      statItems: [
        {
          field: "play",
          value: item.stat.view
        },
        {
          field: "like",
          value: item.stat.like
        },
        // { field: 'coin', value: item.stat.coin },
        {
          field: "favorite",
          value: item.stat.favorite
        }
      ],
      play: item.stat.view,
      like: item.stat.like,
      danmaku: item.stat.danmaku,
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  const fillWithColorPrimary = styled.createClass`
  & path {
    fill: ${colorPrimaryValue};
  }
`;
  function apiFavAdapter(item) {
    const belongsToTitle = item.from === "fav-folder" ? item.folder.title : item.collection.title;
    const iconInTitleStyle = {
      display: "inline-block",
      verticalAlign: "middle",
      marginRight: 4,
      marginTop: -2
    };
    const iconInTitle = item.from === "fav-folder" ? isFavFolderPrivate(item.folder.attr) ? /* @__PURE__ */ jsx$1(IconForPrivateFolder, { style: iconInTitleStyle, ...size(15), className: fillWithColorPrimary }) : /* @__PURE__ */ jsx$1(IconForPublicFolder, { style: iconInTitleStyle, ...size(15), className: fillWithColorPrimary }) : /* @__PURE__ */ jsx$1(IconForCollection, { style: iconInTitleStyle, ...size(15), className: fillWithColorPrimary });
    return {
      // video
      avid: String(item.id),
      bvid: item.bvid,
      goto: "av",
      href: `/video/${item.bvid}/`,
      title: `【${belongsToTitle}】· ${item.title}`,
      titleRender: /* @__PURE__ */ jsxs(Fragment, { children: [
        "【",
        iconInTitle,
        belongsToTitle,
        "】· ",
        item.title
      ] }),
      cover: item.cover,
      pubts: item.pubtime,
      pubdateDisplay: formatTimeStamp(item.pubtime),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: item.from === "fav-folder" ? `${formatTimeStamp(item.fav_time)} · 收藏` : void 0,
      // stat
      play: item.cnt_info.play,
      danmaku: item.cnt_info.danmaku,
      favorite: item.cnt_info.collect,
      statItems: [{
        field: "play",
        value: item.cnt_info.play
      }, {
        field: "danmaku",
        value: item.cnt_info.danmaku
      }, {
        field: "favorite",
        value: item.cnt_info.collect
      }],
      // author
      authorName: item.upper.name,
      authorFace: item.upper.face,
      authorMid: String(item.upper.mid)
    };
  }
  function apiPopularGeneralAdapter(item) {
    var _a2;
    return {
      // video
      avid: String(item.aid),
      bvid: item.bvid,
      goto: "av",
      href: `/video/${item.bvid}/`,
      title: item.title,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: (_a2 = item.rcmd_reason) == null ? void 0 : _a2.content,
      // stat
      play: item.stat.view,
      like: item.stat.like,
      coin: void 0,
      danmaku: item.stat.danmaku,
      favorite: void 0,
      statItems: [{
        field: "play",
        value: item.stat.view
      }, {
        field: "like",
        value: item.stat.like
      }, {
        field: "danmaku",
        value: item.stat.danmaku
      }],
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function apiPopularWeeklyAdapter(item) {
    return {
      // video
      avid: String(item.aid),
      bvid: item.bvid,
      goto: "av",
      href: `/video/${item.bvid}/`,
      title: item.title,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: item.rcmd_reason,
      // stat
      play: item.stat.view,
      like: item.stat.like,
      danmaku: item.stat.danmaku,
      statItems: [{
        field: "play",
        value: item.stat.view
      }, {
        field: "like",
        value: item.stat.like
      }, {
        field: "danmaku",
        value: item.stat.danmaku
      }],
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function apiRankingAdapter(item) {
    if (isBangumiRankingItem(item) || isCinemaRankingItem(item)) {
      const cover = item.new_ep.cover;
      const rankingDesc = item.new_ep.index_show;
      return {
        // video
        avid: "",
        bvid: "",
        goto: "bangumi",
        href: item.url,
        title: item.title,
        cover,
        pubts: void 0,
        pubdateDisplay: void 0,
        duration: 0,
        durationStr: "",
        // stat
        play: item.stat.view,
        like: item.stat.follow,
        danmaku: item.stat.danmaku,
        statItems: defineStatItems([{
          field: "play",
          value: item.stat.view
        }, {
          field: "bangumi:follow",
          value: item.stat.follow
        }, {
          field: "danmaku",
          value: item.stat.danmaku
        }]),
        rankingDesc
      };
    }
    return {
      // video
      avid: String(item.aid),
      bvid: item.bvid,
      goto: "av",
      href: `/video/${item.bvid}/`,
      title: item.title,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: void 0,
      // TODO: write something here
      // stat
      play: item.stat.view,
      like: item.stat.like,
      danmaku: item.stat.danmaku,
      statItems: [{
        field: "play",
        value: item.stat.view
      }, {
        field: "like",
        value: item.stat.like
      }, {
        field: "danmaku",
        value: item.stat.danmaku
      }].filter(Boolean),
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function apiLiveAdapter(item) {
    const area = `${item.area_name_v2}`;
    const liveDesc = item.live_status === ELiveStatus.Streaming ? "" : `${DESC_SEPARATOR}${formatLiveTime(item.record_live_time)} 直播过`;
    function formatLiveTime(ts) {
      const today = dayjs().format("YYYYMMDD");
      const yesterday = dayjs().subtract(1, "day").format("YYYYMMDD");
      const d2 = dayjs.unix(ts);
      if (d2.format("YYYYMMDD") === today) {
        return d2.format("HH:mm");
      }
      if (d2.format("YYYYMMDD") === yesterday) {
        return `昨天 ${d2.format("HH:mm")}`;
      }
      return d2.format("MM-DD HH:mm");
    }
    return {
      // video
      goto: "live",
      href: `https://live.bilibili.com/${item.roomid}`,
      title: item.title,
      liveDesc,
      cover: item.room_cover,
      recommendReason: area,
      // stat
      statItems: defineStatItems([{
        field: "live:viewed-by",
        value: item.text_small
      }]),
      // author
      authorName: item.uname,
      authorFace: item.face,
      authorMid: String(item.uid)
    };
  }
  const debug$7 = baseDebug.extend("VideoCard:filter");
  function getFollowedStatus(recommendReason) {
    return !!recommendReason && ["已关注", "新关注"].includes(recommendReason);
  }
  function anyFilterEnabled(tab2) {
    if (tab2 === ETab.KeepFollowOnly) {
      return true;
    }
    const mayNeedCheck_blacklist_filterByUp_filterByTitle = [ETab.AppRecommend, ETab.PcRecommend, ETab.Hot].includes(tab2);
    if (mayNeedCheck_blacklist_filterByUp_filterByTitle) {
      if (blacklistMids.size || settings.filter.enabled && (settings.filter.byAuthor.enabled && !!settings.filter.byAuthor.keywords.length || settings.filter.byTitle.enabled && !!settings.filter.byTitle.keywords.length)) {
        return true;
      }
    }
    if (tab2 === ETab.AppRecommend || tab2 === ETab.PcRecommend) {
      if (settings.filter.enabled) {
        return true;
      }
    }
    return false;
  }
  function isApiRecLike(api) {
    return [EApiType.AppRecommend, EApiType.PcRecommend, EApiType.Ranking, EApiType.PopularGeneral, EApiType.PopularWeekly].includes(api);
  }
  function filterRecItems(items, tab2) {
    if (!anyFilterEnabled(tab2)) {
      return items;
    }
    const filter = getSettingsSnapshot().filter;
    const {
      minDuration,
      minPlayCount,
      byAuthor,
      byTitle
    } = filter;
    const blockUpMids = /* @__PURE__ */ new Set();
    const blockUpNames = /* @__PURE__ */ new Set();
    const regMidWithRemark = /^(?<mid>\d+)\([\S ]+\)$/;
    const regMid = /^\d+$/;
    byAuthor.keywords.forEach((x) => {
      var _a2, _b2;
      if (regMidWithRemark.test(x)) {
        const mid = (_b2 = (_a2 = regMidWithRemark.exec(x)) == null ? void 0 : _a2.groups) == null ? void 0 : _b2.mid;
        if (mid) blockUpMids.add(mid);
      } else if (regMid.test(x)) {
        blockUpMids.add(x);
      } else {
        blockUpNames.add(x);
      }
    });
    const titleRegexList = [];
    const titleKeywordList = [];
    byTitle.keywords.forEach((keyword) => {
      if (keyword.startsWith("/") && keyword.endsWith("/")) {
        const regex = new RegExp(keyword.slice(1, -1), "i");
        titleRegexList.push(regex);
      } else {
        titleKeywordList.push(keyword);
      }
    });
    return items.filter((item) => {
      if (item.api === EApiType.Separator) return true;
      const {
        play,
        duration: duration2,
        recommendReason,
        goto,
        authorName,
        authorMid,
        title,
        bvid,
        href
      } = normalizeCardData(item);
      const followed = getFollowedStatus(recommendReason);
      if (tab2 === "keep-follow-only") {
        if (!followed) return false;
      }
      function check_blacklist_filterByUp_filterByTitle() {
        if (authorMid && blacklistMids.size) {
          if (blacklistMids.has(authorMid)) {
            debug$7("filter out by blacklist-rule: %s %o", authorMid, {
              bvid,
              title
            });
            return false;
          }
        }
        if (filter.enabled && byAuthor.enabled && (blockUpMids.size || blockUpNames.size) && (authorName || authorMid)) {
          if (authorName && blockUpNames.has(authorName) || authorMid && blockUpMids.has(authorMid)) {
            debug$7("filter out by author-rule: %o", {
              authorName,
              authorMid,
              rules: byAuthor.keywords,
              blockUpMids,
              blockUpNames,
              bvid,
              title
            });
            return false;
          }
        }
        let possibleTitles = [title];
        if (item.api === EApiType.Ranking && isNormalRankingItem(item) && item.desc) {
          possibleTitles.push(item.desc);
        }
        possibleTitles = possibleTitles.filter(Boolean);
        if (filter.enabled && byTitle.enabled && byTitle.keywords.length && possibleTitles.length) {
          const titleHit = (title2) => titleKeywordList.some((keyword) => title2.includes(keyword)) || titleRegexList.some((regex) => regex.test(title2));
          if (possibleTitles.some(titleHit)) {
            debug$7("filter out by title-rule: %o", {
              possibleTitles,
              rules: byTitle.keywords,
              bvid
            });
            return false;
          }
        }
      }
      if (isApiRecLike(item.api)) {
        if (check_blacklist_filterByUp_filterByTitle() === false) {
          return false;
        }
      }
      if (item.api === EApiType.AppRecommend || item.api === EApiType.PcRecommend) {
        if (filter.enabled) {
          const isVideo = goto === "av";
          const isPicture = goto === "picture";
          const isBangumi = goto === "bangumi";
          if (isVideo) return filterVideo();
          if (isPicture) return filterPicture();
          if (isBangumi) return filterBangumi();
        }
      }
      function filterVideo() {
        if (followed && filter.exemptForFollowed.video) return true;
        if (recommendReason === "关注了你") {
          debug$7("filter out by recommendReason-rule: %s %o", recommendReason, {
            bvid,
            title
          });
          return false;
        }
        if (minPlayCount.enabled && minPlayCount.value && typeof play === "number" && play < minPlayCount.value) {
          debug$7("filter out by min-play-count-rule: %s < %s, %o", play, minPlayCount.value, {
            bvid,
            title
          });
          return false;
        }
        if (minDuration.enabled && minDuration.value && duration2 && duration2 < minDuration.value) {
          debug$7("filter out by min-duration-rule: %s < %s %o", duration2, minDuration.value, {
            bvid,
            title
          });
          return false;
        }
        return true;
      }
      function filterPicture() {
        if (filter.hideGotoTypePicture) {
          if (followed && filter.exemptForFollowed.picture) {
            return true;
          }
          debug$7("filter out by goto-type-picture-rule: %s %o", goto, {
            bvid,
            title
          });
          return false;
        } else {
          return true;
        }
      }
      function filterBangumi() {
        if (filter.hideGotoTypeBangumi) {
          debug$7("filter out by goto-type-bangumi-rule: %s %o", goto, {
            title,
            href
          });
          return false;
        }
        return true;
      }
      return true;
    });
  }
  const iconParkOutlineMore = (props, ref) => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: [
    /* @__PURE__ */ jsx$1("circle", { cx: 12, cy: 24, r: 3, fill: "currentColor" }),
    /* @__PURE__ */ jsx$1("circle", { cx: 24, cy: 24, r: 3, fill: "currentColor" }),
    /* @__PURE__ */ jsx$1("circle", { cx: 36, cy: 24, r: 3, fill: "currentColor" })
  ] });
  const ForwardRef$g = React.forwardRef(iconParkOutlineMore);
  const phCrownFill = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 256 256", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M248 80a28 28 0 1 0-51.12 15.77l-26.79 33L146 73.4a28 28 0 1 0-36.06 0l-24.03 55.34l-26.79-33a28 28 0 1 0-26.6 12L47 194.63A16 16 0 0 0 62.78 208h130.44A16 16 0 0 0 209 194.63l14.47-86.85A28 28 0 0 0 248 80M128 40a12 12 0 1 1-12 12a12 12 0 0 1 12-12M24 80a12 12 0 1 1 12 12a12 12 0 0 1-12-12m196 12a12 12 0 1 1 12-12a12 12 0 0 1-12 12" }) });
  const ForwardRef$f = React.forwardRef(phCrownFill);
  const CHARGE_ONLY_TEXT = "充电专属";
  function isChargeOnlyVideo(item, recommendReason) {
    var _a2, _b2, _c2, _d, _e;
    if (item.api !== EApiType.DynamicFeed) return false;
    recommendReason || (recommendReason = (_e = (_d = (_c2 = (_b2 = (_a2 = item.modules) == null ? void 0 : _a2.module_dynamic) == null ? void 0 : _b2.major) == null ? void 0 : _c2.archive) == null ? void 0 : _d.badge) == null ? void 0 : _e.text);
    return recommendReason === CHARGE_ONLY_TEXT;
  }
  function ChargeOnlyTag() {
    return /* @__PURE__ */ jsxs("div", { css: [S$7.top("left"), flexVerticalCenterStyle, /* @__PURE__ */ css("padding:1px 6px 1px 4px;font-size:10px;color:#fff;text-align:center;line-height:17px;border-radius:2px;margin-left:4px;white-space:nowrap;background-color:#f69;background-color:", colorPrimaryValue, ";", ""), "", ""], children: [
      /* @__PURE__ */ jsx$1("svg", { width: "16", height: "17", viewBox: "0 0 16 17", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx$1("path", { d: "M5.00014 14.9839C4.94522 15.1219 5.12392 15.2322 5.22268 15.1212L11.5561 8.00214C11.7084 7.83093 11.5869 7.56014 11.3578 7.56014H9.13662L11.6019 3.57178C11.7112 3.39489 11.584 3.16666 11.376 3.16666H7.4475C7.22576 3.16666 7.02737 3.30444 6.94992 3.51221L4.68362 9.59189C4.61894 9.76539 4.74725 9.95014 4.93241 9.95014H7.00268L5.00014 14.9839Z", fill: "white" }) }),
      CHARGE_ONLY_TEXT
    ] });
  }
  function getColor(no) {
    return no === 1 ? (
      // gold
      "#FFD700"
    ) : no === 2 ? "#C0C0C0" : no === 3 ? "#B36700" : colorPrimaryValue;
  }
  function RankingNumMark({
    item
  }) {
    var _a2;
    const category = RANKING_CATEGORIES_MAP[item.slug];
    const hasMedal = item.rankingNo <= 3;
    const medalIcon = /* @__PURE__ */ jsx$1(ForwardRef$f, {});
    let hasOthers = false;
    let others = [];
    if (isNormalRankingItem(item) && ((_a2 = item.others) == null ? void 0 : _a2.length)) {
      hasOthers = true;
      others = item.others;
    }
    const tooltip = `「${category.name}」排行第 ${item.rankingNo} 名`;
    const {
      triggerRef,
      tooltipEl
    } = useTooltip({
      inlinePosition: "left",
      tooltip,
      tooltipOffset: 2
    });
    const roundButtonCss = [flexCenterStyle, /* @__PURE__ */ css("position:relative;color:#fff;border-radius:50%;white-space:nowrap;width:28px;height:28px;background-color:", getColor(item.rankingNo), ";", "")];
    const newTab = useLinkNewTab();
    return /* @__PURE__ */ jsxs("div", { css: S$7.topContainer("left"), children: [
      /* @__PURE__ */ jsxs("div", { ref: triggerRef, css: roundButtonCss, children: [
        hasMedal ? medalIcon : /* @__PURE__ */ jsx$1("span", { style: {
          marginLeft: -1
        }, children: item.rankingNo }),
        tooltipEl
      ] }),
      hasOthers && /* @__PURE__ */ jsx$1(antd.Dropdown, { placement: "bottomLeft", menu: {
        items: [{
          type: "group",
          label: "「其他上榜视频」",
          children: others.map((x) => {
            return {
              key: x.bvid,
              label: x.title,
              onClick() {
                const href = new URL(`/video/${x.bvid}`, location.href).href;
                if (newTab) {
                  openNewTab(href);
                } else {
                  location.href = href;
                }
              }
            };
          })
        }]
      }, children: /* @__PURE__ */ jsx$1("div", { css: roundButtonCss, children: /* @__PURE__ */ jsx$1(ForwardRef$g, {}) }) })
    ] });
  }
  var _ref$m = {
    name: "1ovvbhh",
    styles: "font-weight:normal;font-size:11px;color:#fff;line-height:1;position:relative;top:1px"
  };
  function SomeBadge({
    icon,
    label,
    className
  }) {
    return /* @__PURE__ */ jsxs("span", { className, css: [S$7.top("left"), /* @__PURE__ */ css("height:16px;line-height:16px;border-radius:16px;padding-inline:4px 6px;background-color:", colorPrimaryValue, ";display:inline-flex;align-items:center;justify-content:center;", ""), "", ""], children: [
      icon,
      label && typeof label === "string" ? /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsx$1("span", { css: _ref$m, children: label }) }) : label
    ] });
  }
  function LiveBadge({
    className
  }) {
    return /* @__PURE__ */ jsx$1(SomeBadge, { className, icon: /* @__PURE__ */ jsx$1(IconForLive, { active: true, ...size(14) }), label: "直播中" });
  }
  function ApiTypeTag({
    item
  }) {
    const text = isDynamicFeed(item) ? "动态" : isWatchlater(item) ? "稍后再看" : isFav(item) ? item.from === "fav-folder" ? "收藏夹" : "合集" : item.api;
    return /* @__PURE__ */ jsx$1("div", { css: [S$7.top("left"), flexVerticalCenterStyle, /* @__PURE__ */ css("padding-inline:6px;padding-block:1px;font-size:11px;color:#fff;text-align:center;line-height:17px;border-radius:2px;margin-left:4px;white-space:nowrap;background-color:", colorPrimaryValue, ";", ""), "", ""], children: text });
  }
  async function getLiveList(page) {
    const res = await request.get("https://api.live.bilibili.com/xlive/web-ucenter/user/following", {
      params: {
        page,
        page_size: LiveRecService.PAGE_SIZE,
        ignoreRecord: 1,
        hit_ab: true
      }
    });
    const json = res.data;
    return json;
  }
  const _LiveRecService = class _LiveRecService extends BaseTabService {
    constructor(streamingOnly = false) {
      super(_LiveRecService.PAGE_SIZE);
      __publicField(this, "usageInfo");
      __publicField(this, "hasMoreExceptQueue", true);
      __publicField(this, "separatorAdded", false);
      __publicField(this, "liveCount", -1);
      __publicField(this, "page", 1);
      __publicField(this, "totalPage", Infinity);
      this.streamingOnly = streamingOnly;
    }
    async fetchMore(abortSignal) {
      if (this.page > this.totalPage) {
        this.hasMoreExceptQueue = false;
        return;
      }
      const json = await getLiveList(this.page);
      if (!isWebApiSuccess(json)) {
        toast(json.message || REQUEST_FAIL_MSG);
        this.hasMoreExceptQueue = false;
      }
      this.page++;
      const {
        count,
        live_count,
        totalPage
      } = json.data;
      this.totalPage = totalPage;
      this.liveCount = live_count;
      const items = json.data.list.map((item) => {
        const _item = {
          ...item,
          api: EApiType.Live,
          uniqId: item.roomid.toString()
        };
        return _item;
      });
      const last = items.at(-1);
      const gateTime = dayjs().subtract(2, "weeks").unix();
      if (last) {
        const lastStatus = last.live_status;
        const lastLiveTime = last.record_live_time;
        if (lastStatus !== ELiveStatus.Streaming && lastLiveTime && lastLiveTime < gateTime) {
          this.hasMoreExceptQueue = false;
        }
      }
      let ret = items;
      if (!this.streamingOnly && !this.separatorAdded && items.some((x) => x.live_status !== ELiveStatus.Streaming)) {
        this.separatorAdded = true;
        const index = items.findIndex((x) => x.live_status !== ELiveStatus.Streaming);
        ret.splice(index, 0, {
          api: EApiType.Separator,
          uniqId: "live-separator",
          content: "最近直播过"
        });
      }
      if (this.streamingOnly && items.some((x) => x.live_status !== ELiveStatus.Streaming)) {
        this.hasMoreExceptQueue = false;
        ret = items.filter((x) => x.live_status === ELiveStatus.Streaming);
      }
      return ret;
    }
  };
  __publicField(_LiveRecService, "PAGE_SIZE", 20);
  let LiveRecService = _LiveRecService;
  async function fetchVideoDynamicFeeds({
    offset,
    page,
    upMid,
    abortSignal
  }) {
    var _a2;
    const params = {
      "timezone_offset": "-480",
      "type": "video",
      "platform": "web",
      "features": "itemOpusStyle",
      "web_location": "0.0",
      "x-bili-device-req-json": JSON.stringify({
        platform: "web",
        device: "pc"
      }),
      "x-bili-web-req-json": JSON.stringify({
        spm_id: "0.0"
      }),
      "page": page
    };
    if (offset) {
      params.offset = offset;
    }
    if (upMid) {
      params.host_mid = upMid;
    }
    const res = await request.get("/x/polymer/web-dynamic/v1/feed/all", {
      signal: abortSignal,
      params
    });
    const json = res.data;
    if (!isWebApiSuccess(json)) {
      const msg = json.message || REQUEST_FAIL_MSG;
      toast(msg);
      throw new Error(msg, {
        cause: json
      });
    }
    const data2 = json.data;
    if ((_a2 = data2 == null ? void 0 : data2.items) == null ? void 0 : _a2.length) {
      data2.items = data2.items.filter((x) => x.type === "DYNAMIC_TYPE_AV");
    }
    return data2;
  }
  const cache = getIdbCache("dynamic-feed-items");
  const infoCache = getIdbCache("dynamic-feed-items-info");
  async function hasLocalDynamicFeedCache(upMid) {
    const existing = await infoCache.get(upMid);
    return !!(existing == null ? void 0 : existing.count);
  }
  function createUpdateSearchCacheNotifyFns(upMid, upName) {
    const notiKey = (mid) => `update-search-cache-${mid}`;
    const _onProgress = (page, total) => {
      antNotification.info({
        icon: /* @__PURE__ */ jsx$1(ForwardRef$t, { ...size(16) }),
        key: notiKey(upMid),
        message: `搜索缓存更新中...`,
        description: `「${upName}」更新中: Page(${page}) Total(${total})`,
        duration: null
        // do not auto close
      });
    };
    const onProgress = throttle$1(_onProgress, 200);
    const onSuccess = () => {
      onProgress.flush();
      antNotification.success({
        key: notiKey(upMid),
        message: `缓存更新成功`,
        description: `「${upName}」的搜索缓存更新成功`,
        duration: null
        // do not auto close
      });
    };
    return {
      notifyOnProgress: onProgress,
      notifyOnSuccess: onSuccess
    };
  }
  async function updateLocalDynamicFeedCache(upMid, onProgress) {
    if (await hasLocalDynamicFeedCache(upMid)) {
      await performIncrementalUpdate(upMid);
    } else {
      await performFullUpdate(upMid, void 0, onProgress);
    }
  }
  async function performIncrementalUpdateIfNeed(upMid, force = false) {
    const info = await infoCache.get(upMid);
    if (!force && info && info.count && info.updatedAt && Date.now() - info.updatedAt < 60 * 1e3) {
      return;
    }
    return performIncrementalUpdate(upMid);
  }
  async function performIncrementalUpdate(upMid) {
    if (!await hasLocalDynamicFeedCache(upMid)) return;
    const existing = await cache.get(upMid) || [];
    const existingIds = new Set(existing.map((x) => x.id_str));
    let page = 1;
    let offset = "";
    let hasMore = true;
    let newItems = [];
    while (hasMore) {
      const data2 = await fetchVideoDynamicFeeds({
        upMid,
        page,
        offset
      });
      const items = data2.items;
      newItems = [...newItems, ...items];
      offset = data2.offset;
      hasMore = data2.has_more;
      page++;
      if (hasMore && existingIds.size) {
        const allIncluded = items.every((item) => existingIds.has(item.id_str));
        if (allIncluded) {
          hasMore = false;
        }
      }
    }
    const allItems = uniqBy([...newItems, ...existing], (x) => x.id_str);
    await cache.set(upMid, allItems);
    await infoCache.set(upMid, {
      count: allItems.length,
      updatedAt: Date.now()
    });
  }
  const fullUpdateInProgressCache = getIdbCache("dynamic-feed-items-in-progress");
  async function performFullUpdate(upMid, skipCache = false, onProgress) {
    const inProgressCached = skipCache ? void 0 : await fullUpdateInProgressCache.get(upMid);
    let page = (inProgressCached == null ? void 0 : inProgressCached.page) ?? 1;
    let offset = (inProgressCached == null ? void 0 : inProgressCached.offset) ?? "";
    let allItems = (inProgressCached == null ? void 0 : inProgressCached.items) ?? [];
    let hasMore = true;
    while (hasMore) {
      const data2 = await fetchVideoDynamicFeeds({
        upMid,
        page,
        offset
      });
      const items = data2.items;
      allItems = [...allItems, ...items];
      offset = data2.offset;
      hasMore = data2.has_more;
      page++;
      await fullUpdateInProgressCache.set(upMid, {
        page,
        offset,
        items: allItems
      });
      onProgress == null ? void 0 : onProgress(page, allItems.length);
    }
    const _allItems = uniqBy(allItems, (x) => x.id_str);
    await cache.set(upMid, _allItems);
    await infoCache.set(upMid, {
      count: _allItems.length,
      updatedAt: Date.now()
    });
    await fullUpdateInProgressCache.delete(upMid);
  }
  function parseSearchInput(input) {
    const includes = [];
    const excludes = [];
    if (!input.trim()) {
      return {
        includes,
        excludes
      };
    }
    let currentPos = 0;
    const inputLength = input.length;
    while (currentPos < inputLength) {
      while (currentPos < inputLength && input[currentPos] === " ") {
        currentPos++;
      }
      if (currentPos >= inputLength) break;
      let isExclude = false;
      let word = "";
      if (input[currentPos] === "-") {
        const nextChar = input[currentPos + 1];
        if (nextChar === '"' || nextChar === "'") {
          isExclude = true;
          currentPos++;
        }
      }
      if (input[currentPos] === '"' || input[currentPos] === "'") {
        const startQuoteChar = input[currentPos];
        currentPos++;
        let escaped = false;
        while (currentPos < inputLength) {
          const char2 = input[currentPos];
          if (escaped) {
            word += char2;
            escaped = false;
            currentPos++;
            continue;
          }
          if (char2 === "\\") {
            const nextChar = input[currentPos + 1];
            if (nextChar === '"' || nextChar === "'") {
              escaped = true;
              currentPos++;
              continue;
            }
            word += char2;
            currentPos++;
            continue;
          }
          if (char2 === startQuoteChar) {
            currentPos++;
            break;
          }
          word += char2;
          currentPos++;
        }
      } else {
        while (currentPos < inputLength && input[currentPos] !== " ") {
          if (input[currentPos] === "\\") {
            currentPos++;
            if (currentPos < inputLength) {
              word += input[currentPos];
              currentPos++;
            }
            continue;
          }
          word += input[currentPos];
          currentPos++;
        }
      }
      if (word) {
        if (isExclude) {
          excludes.push(word);
        } else {
          includes.push(word);
        }
      }
    }
    return {
      includes,
      excludes
    };
  }
  const fetchVideoDynamicFeedsWithCache = wrapWithIdbCache({
    fn: fetchVideoDynamicFeeds,
    generateKey: ({
      upMid
    }) => `${upMid}`,
    tableName: "dynamic-feed-newest-items",
    // only head
    ttl: 5 * 60 * 1e3
    // 5 minutes
  });
  class FollowGroupUpService {
    constructor(upMid, enableHeadCache = false) {
      __publicField(this, "bufferQueue", []);
      __publicField(this, "hasMoreForApi", true);
      __publicField(this, "offset", "");
      __publicField(this, "page", 1);
      this.upMid = upMid;
      this.enableHeadCache = enableHeadCache;
    }
    // current page
    get hasMore() {
      return !!this.bufferQueue.length || this.hasMoreForApi;
    }
    async loadMore() {
      const enableCache = this.page === 1 && !this.offset && this.enableHeadCache;
      const fn = enableCache ? fetchVideoDynamicFeedsWithCache : fetchVideoDynamicFeeds;
      const data2 = await fn({
        upMid: this.upMid,
        page: this.page,
        offset: this.offset
      });
      this.offset = data2.offset;
      this.hasMoreForApi = data2.has_more;
      this.page++;
      return data2.items;
    }
    async fillQueue(minimalQueueSize, abortSignal) {
      while (!(abortSignal == null ? void 0 : abortSignal.aborted) && this.hasMoreForApi && this.bufferQueue.length < minimalQueueSize) {
        const items = await this.loadMore();
        this.bufferQueue.push(...items);
      }
    }
  }
  const _FollowGroupMergeTimelineService = class _FollowGroupMergeTimelineService {
    constructor(upMids) {
      __publicField(this, "upServices", []);
      this.upMids = upMids;
      const enableHeadCache = upMids.length > _FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD;
      this.upServices = upMids.map((upMid) => new FollowGroupUpService(upMid, enableHeadCache));
    }
    get hasMore() {
      return this.upServices.some((s) => s.hasMore);
    }
    async loadMore(abortSignal) {
      if (!this.hasMore) return [];
      const refillQueues = async () => {
        const minimalQueueSize = 1;
        await pmap(this.upServices, (s) => s.fillQueue(minimalQueueSize, abortSignal), 5);
      };
      const pickedItems = [];
      const expectSize = 10;
      while (this.hasMore && pickedItems.length < expectSize) {
        await refillQueues();
        const restServices = this.upServices.filter((s) => s.hasMore);
        const pickedService = orderBy(restServices.map((service) => {
          const item = service.bufferQueue[0];
          const id = BigInt(item.id_str);
          return {
            service,
            item,
            id
          };
        }), ["id"], ["desc"]).map((x) => x.service)[0];
        if (!pickedService) break;
        const head = pickedService.bufferQueue[0];
        pickedService.bufferQueue = pickedService.bufferQueue.slice(1);
        pickedItems.push(head);
      }
      return pickedItems;
    }
  };
  // fillQueues 会对每一个 upMid 请求, 多了不适合
  __publicField(_FollowGroupMergeTimelineService, "ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD", 20);
  // if upMids > 10, enable head cache
  __publicField(_FollowGroupMergeTimelineService, "ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD", 10);
  let FollowGroupMergeTimelineService = _FollowGroupMergeTimelineService;
  const isFunction$1 = (value) => {
    return !!(value && value.constructor && value.call && value.apply);
  };
  const isPromise = (value) => {
    if (!value)
      return false;
    if (!value.then)
      return false;
    if (!isFunction$1(value.then))
      return false;
    return true;
  };
  const isEqual = (x, y) => {
    if (Object.is(x, y))
      return true;
    if (x instanceof Date && y instanceof Date) {
      return x.getTime() === y.getTime();
    }
    if (x instanceof RegExp && y instanceof RegExp) {
      return x.toString() === y.toString();
    }
    if (typeof x !== "object" || x === null || typeof y !== "object" || y === null) {
      return false;
    }
    const keysX = Reflect.ownKeys(x);
    const keysY = Reflect.ownKeys(y);
    if (keysX.length !== keysY.length)
      return false;
    for (let i = 0; i < keysX.length; i++) {
      if (!Reflect.has(y, keysX[i]))
        return false;
      if (!isEqual(x[keysX[i]], y[keysX[i]]))
        return false;
    }
    return true;
  };
  const tryit = (func) => {
    return (...args) => {
      try {
        const result = func(...args);
        if (isPromise(result)) {
          return result.then((value) => [void 0, value]).catch((err) => [err, void 0]);
        }
        return [void 0, result];
      } catch (err) {
        return [err, void 0];
      }
    };
  };
  const pick = (obj, keys2) => {
    if (!obj)
      return {};
    return keys2.reduce((acc, key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key))
        acc[key] = obj[key];
      return acc;
    }, {});
  };
  const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : globalThis;
  const setWinValue = (key, val) => void tryit(() => win[key] = val)();
  const gridItemsKey = `${APP_KEY_PREFIX}_gridItems`;
  let currentGridItems = [];
  function setGlobalGridItems(itemsWithSep) {
    const items = itemsWithSep.filter((x) => x.api !== EApiType.Separator);
    currentGridItems = items;
    setWinValue(gridItemsKey, currentGridItems);
  }
  function getGridCardData() {
    return currentGridItems.map((item) => normalizeCardData(item));
  }
  function copyBvidsSingleLine() {
    const bvids = getGridCardData().map((cardData) => cardData.bvid);
    GM.setClipboard(bvids.join(" "));
  }
  function copyBvidInfos() {
    const lines = getGridCardData().map(getBvidInfo);
    GM.setClipboard(lines.join("\n"));
  }
  function getBvidInfo(cardData) {
    let {
      bvid,
      authorName,
      pubts,
      title
    } = cardData;
    const date = dayjs.unix(pubts ?? 0).format("YYYY-MM-DD");
    title = title.replace(/\n+/g, " ");
    return `${bvid} ;; [${authorName}] ${date} ${title}`;
  }
  const BIND_TO_UNSAFE_WINDOW_FNS = {
    getGridCardData,
    copyBvidsSingleLine,
    copyBvidInfos
  };
  setTimeout(() => {
    Object.entries(BIND_TO_UNSAFE_WINDOW_FNS).forEach(([fnName, fn]) => {
      setWinValue(`${APP_KEY_PREFIX}_${fnName}`, fn);
    });
  });
  var castComparer = function(comparer) {
    return function(a, b, order) {
      return comparer(a, b, order) * order;
    };
  };
  var throwInvalidConfigErrorIfTrue = function(condition, context) {
    if (condition)
      throw Error("Invalid sort config: " + context);
  };
  var unpackObjectSorter = function(sortByObj) {
    var _a2 = sortByObj || {}, asc = _a2.asc, desc = _a2.desc;
    var order = asc ? 1 : -1;
    var sortBy = asc || desc;
    throwInvalidConfigErrorIfTrue(!sortBy, "Expected `asc` or `desc` property");
    throwInvalidConfigErrorIfTrue(asc && desc, "Ambiguous object with `asc` and `desc` config properties");
    var comparer = sortByObj.comparer && castComparer(sortByObj.comparer);
    return { order, sortBy, comparer };
  };
  var multiPropertySorterProvider = function(defaultComparer2) {
    return function multiPropertySorter(sortBy, sortByArr, depth, order, comparer, a, b) {
      var valA;
      var valB;
      if (typeof sortBy === "string") {
        valA = a[sortBy];
        valB = b[sortBy];
      } else if (typeof sortBy === "function") {
        valA = sortBy(a);
        valB = sortBy(b);
      } else {
        var objectSorterConfig = unpackObjectSorter(sortBy);
        return multiPropertySorter(objectSorterConfig.sortBy, sortByArr, depth, objectSorterConfig.order, objectSorterConfig.comparer || defaultComparer2, a, b);
      }
      var equality = comparer(valA, valB, order);
      if ((equality === 0 || valA == null && valB == null) && sortByArr.length > depth) {
        return multiPropertySorter(sortByArr[depth], sortByArr, depth + 1, order, comparer, a, b);
      }
      return equality;
    };
  };
  function getSortStrategy(sortBy, comparer, order) {
    if (sortBy === void 0 || sortBy === true) {
      return function(a, b) {
        return comparer(a, b, order);
      };
    }
    if (typeof sortBy === "string") {
      throwInvalidConfigErrorIfTrue(sortBy.includes("."), "String syntax not allowed for nested properties.");
      return function(a, b) {
        return comparer(a[sortBy], b[sortBy], order);
      };
    }
    if (typeof sortBy === "function") {
      return function(a, b) {
        return comparer(sortBy(a), sortBy(b), order);
      };
    }
    if (Array.isArray(sortBy)) {
      var multiPropSorter_1 = multiPropertySorterProvider(comparer);
      return function(a, b) {
        return multiPropSorter_1(sortBy[0], sortBy, 1, order, comparer, a, b);
      };
    }
    var objectSorterConfig = unpackObjectSorter(sortBy);
    return getSortStrategy(objectSorterConfig.sortBy, objectSorterConfig.comparer || comparer, objectSorterConfig.order);
  }
  var sortArray = function(order, ctx, sortBy, comparer) {
    var _a2;
    if (!Array.isArray(ctx)) {
      return ctx;
    }
    if (Array.isArray(sortBy) && sortBy.length < 2) {
      _a2 = sortBy, sortBy = _a2[0];
    }
    return ctx.sort(getSortStrategy(sortBy, comparer, order));
  };
  function createNewSortInstance(opts) {
    var comparer = castComparer(opts.comparer);
    return function(arrayToSort) {
      var ctx = Array.isArray(arrayToSort) && !opts.inPlaceSorting ? arrayToSort.slice() : arrayToSort;
      return {
        asc: function(sortBy) {
          return sortArray(1, ctx, sortBy, comparer);
        },
        desc: function(sortBy) {
          return sortArray(-1, ctx, sortBy, comparer);
        },
        by: function(sortBy) {
          return sortArray(1, ctx, sortBy, comparer);
        }
      };
    };
  }
  var defaultComparer = function(a, b, order) {
    if (a == null)
      return order;
    if (b == null)
      return -order;
    if (typeof a !== typeof b) {
      return typeof a < typeof b ? -1 : 1;
    }
    if (a < b)
      return -1;
    if (a > b)
      return 1;
    return 0;
  };
  var sort = createNewSortInstance({
    comparer: defaultComparer
  });
  createNewSortInstance({
    comparer: defaultComparer,
    inPlaceSorting: true
  });
  function fastSortWithOrders(list, orders) {
    const _by = orders.map(({ order, prop }) => {
      if (order === "asc") return { asc: prop };
      else if (order === "desc") return { desc: prop };
      return { asc: prop, comparer: order };
    });
    return sort(list).by(_by);
  }
  function dynamicFeedFilterSelectUp(payload) {
    Object.assign(dfStore, payload);
    if (payload.upMid) {
      const item = dfStore.upList.find((x) => x.mid.toString() === payload.upMid);
      if (item) item.has_update = false;
    }
  }
  const clearPayload = {
    upMid: void 0,
    upName: void 0,
    upFace: void 0,
    searchText: void 0,
    selectedFollowGroupTagId: void 0,
    dynamicFeedVideoType: DynamicFeedVideoType.All,
    filterMinDuration: DynamicFeedVideoMinDuration.All
  };
  const classes = {
    popover: {
      wrapper: "max-w-350px",
      section: "mt-10 first:mt-0 min-w-300px",
      sectionTilte: "flex items-center text-20px pl-2px pb-2px"
    }
  };
  const flexBreak = /* @__PURE__ */ jsx$1("div", { css: {
    name: "1f76xva",
    styles: "flex-basis:100%;height:0"
  } });
  var _ref$l = {
    name: "1kbjhvc",
    styles: "overflow:hidden;.ant-radio-button-wrapper{padding-inline:10px;}"
  };
  var _ref2$h = {
    name: "1qkltea",
    styles: "margin-left:5px"
  };
  var _ref3$c = {
    name: "1mkc8b8",
    styles: "display:block;max-width:130px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden"
  };
  function DynamicFeedUsageInfo() {
    const {
      ref,
      getPopupContainer
    } = usePopupContainer();
    const onRefresh = useOnRefreshContext();
    const dfSettings = useSettingsSnapshot().dynamicFeed;
    const {
      addCopyBvidButton,
      externalSearchInput
    } = dfSettings.__internal;
    const {
      viewingSomeUp,
      upName,
      upMid,
      upFace,
      upList,
      followGroups,
      selectedFollowGroup,
      viewingSomeGroup,
      selectedKey,
      dynamicFeedVideoType,
      filterMinDuration,
      searchText,
      hideChargeOnlyVideos
    } = useSnapshot(dfStore);
    const showPopoverBadge = React.useMemo(() => {
      return !!(dynamicFeedVideoType !== DynamicFeedVideoType.All || hideChargeOnlyVideos || searchText || filterMinDuration !== DynamicFeedVideoMinDuration.All);
    }, [dynamicFeedVideoType, hideChargeOnlyVideos, searchText, filterMinDuration]);
    useMount(() => {
      updateFilterData();
    });
    const onSelect = useMemoizedFn(async (payload) => {
      dynamicFeedFilterSelectUp(payload);
      await delay(100);
      onRefresh == null ? void 0 : onRefresh();
    });
    const onClear = useMemoizedFn(() => {
      onSelect({
        ...clearPayload
      });
    });
    const menuItems = React.useMemo(() => {
      const itemAll = {
        key: "all",
        icon: /* @__PURE__ */ jsx$1(antd.Avatar, { size: "small", children: "全" }),
        label: "全部",
        onClick: onClear
      };
      let groupItems = [];
      if (dfSettings.followGroup.enabled) {
        groupItems = followGroups.map((group) => {
          return {
            key: `group:${group.tagid}`,
            label: group.name + ` (${group.count})`,
            icon: /* @__PURE__ */ jsx$1(antd.Avatar, { size: "small", children: "组" }),
            onClick() {
              onSelect({
                ...clearPayload,
                selectedFollowGroupTagId: group.tagid
              });
            }
          };
        });
      }
      function mapName(name) {
        return name.toLowerCase().replace(/^([a-z])/, "999999$1");
      }
      const upListSorted = fastSortWithOrders(upList, [{
        prop: (it) => it.has_update ? 1 : 0,
        order: "desc"
      }, {
        prop: "uname",
        order: (a, b) => {
          [a, b] = [a, b].map(mapName);
          return a.localeCompare(b, "zh-CN");
        }
      }]);
      const items = upListSorted.map((up) => {
        let avatar = /* @__PURE__ */ jsx$1(antd.Avatar, { size: "small", src: getAvatarSrc(up.face) });
        if (up.has_update) {
          avatar = /* @__PURE__ */ jsx$1(antd.Badge, { dot: true, children: avatar });
        }
        return {
          key: `up:${up.mid}`,
          icon: avatar,
          // label: up.uname,
          label: /* @__PURE__ */ jsx$1("span", { title: up.uname, css: _ref3$c, children: up.uname }),
          onClick() {
            onSelect({
              ...clearPayload,
              upMid: up.mid.toString(),
              upName: up.uname,
              upFace: up.face
            });
          }
        };
      });
      return [itemAll, ...groupItems, ...items];
    }, [upList, dfSettings.followGroup.enabled, followGroups]);
    const followGroupMidsCount = selectedFollowGroup == null ? void 0 : selectedFollowGroup.count;
    const upIcon = /* @__PURE__ */ jsx$1(IconForUp, { ...size(14), className: "mt--2px" });
    const upAvtar = upFace ? /* @__PURE__ */ jsx$1(antd.Avatar, { size: 20, src: getAvatarSrc(upFace) }) : void 0;
    const dropdownButtonIcon = viewingSomeUp ? upAvtar || upIcon : selectedFollowGroup ? /* @__PURE__ */ jsx$1(IconForGroup, { ...size(18) }) : void 0;
    const dropdownButtonLabel = viewingSomeUp ? upName : selectedFollowGroup ? selectedFollowGroup.name + (followGroupMidsCount ? ` (${followGroupMidsCount})` : "") : "全部";
    const [scopeDropdownOpen, setScopeDropdownOpen] = React.useState(false);
    const scopeDropdownMenu = /* @__PURE__ */ jsx$1(antd.Dropdown, { open: scopeDropdownOpen, onOpenChange: setScopeDropdownOpen, placement: "bottomLeft", getPopupContainer, menu: {
      items: menuItems,
      style: {
        ...dropdownMenuStyle,
        border: `1px solid ${usePopoverBorderColor()}`
      },
      selectedKeys: [selectedKey]
    }, children: /* @__PURE__ */ jsx$1(antd.Button, { icon: dropdownButtonIcon, className: "gap-4px", css: [scopeDropdownOpen && buttonOpenCss, "", ""], children: dropdownButtonLabel }) });
    const searchInput = /* @__PURE__ */ jsx$1(
      antd.Input.Search,
      {
        style: {
          width: externalSearchInput ? "250px" : void 0
        },
        placeholder: "按标题关键字过滤",
        type: "search",
        autoCorrect: "off",
        autoCapitalize: "off",
        name: `searchText_${upMid}`,
        variant: "outlined",
        defaultValue: dfStore.searchText,
        autoComplete: "off",
        allowClear: true,
        onChange: (e) => {
          tryInstantSearchWithCache({
            searchText: e.target.value,
            upMid,
            onRefresh
          });
        },
        onSearch: async (val) => {
          dfStore.searchText = val || void 0;
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        }
      }
    );
    const popoverContent = /* @__PURE__ */ jsxs("div", { className: classes.popover.wrapper, children: [
      /* @__PURE__ */ jsxs("div", { className: classes.popover.section, children: [
        /* @__PURE__ */ jsxs("div", { className: classes.popover.sectionTilte, children: [
          "视频类型",
          /* @__PURE__ */ jsxs(HelpInfo, { children: [
            "「",
            CHARGE_ONLY_TEXT,
            "」在此程序中归类为「投稿视频」",
            /* @__PURE__ */ jsx$1("br", {}),
            "「动态视频」时长通常较短"
          ] })
        ] }),
        /* @__PURE__ */ jsx$1("div", { children: /* @__PURE__ */ jsx$1(antd.Radio.Group, { buttonStyle: "solid", value: dynamicFeedVideoType, onChange: async (v) => {
          dfStore.dynamicFeedVideoType = v.target.value;
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        }, children: Object.values(DynamicFeedVideoType).map((v) => {
          return /* @__PURE__ */ jsx$1(antd.Radio.Button, { value: v, children: DynamicFeedVideoTypeLabel[v] }, v);
        }) }) })
      ] }),
      dynamicFeedVideoType !== DynamicFeedVideoType.DynamicOnly && /* @__PURE__ */ jsxs("div", { className: classes.popover.section, children: [
        /* @__PURE__ */ jsx$1("div", { className: classes.popover.sectionTilte, children: "充电专属" }),
        /* @__PURE__ */ jsx$1("div", { css: flexVerticalCenterStyle, children: /* @__PURE__ */ jsx$1(antd.Checkbox, { checked: hideChargeOnlyVideos, onChange: async (e) => {
          const val = e.target.checked;
          const set2 = dfStore.hideChargeOnlyVideosForKeysSet;
          if (val) {
            set2.add(selectedKey);
          } else {
            set2.delete(selectedKey);
          }
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        }, css: _ref2$h, children: /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
          "隐藏「",
          CHARGE_ONLY_TEXT,
          "」视频 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "仅对当前 UP 或 分组生效"
        ] }), children: /* @__PURE__ */ jsxs("span", { style: {
          userSelect: "none"
        }, children: [
          "隐藏「",
          CHARGE_ONLY_TEXT,
          "」"
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: classes.popover.section, children: [
        /* @__PURE__ */ jsx$1("div", { className: classes.popover.sectionTilte, children: "最短时长" }),
        /* @__PURE__ */ jsx$1("div", { children: /* @__PURE__ */ jsx$1(antd.Radio.Group, { css: _ref$l, buttonStyle: "solid", value: filterMinDuration, onChange: async (v) => {
          dfStore.filterMinDuration = v.target.value;
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        }, children: Object.values(DynamicFeedVideoMinDuration).map((k) => {
          const {
            label
          } = DynamicFeedVideoMinDurationConfig[k];
          return /* @__PURE__ */ jsx$1(antd.Radio.Button, { value: k, children: label }, k);
        }) }) })
      ] }),
      !externalSearchInput && /* @__PURE__ */ jsxs("div", { className: classes.popover.section, children: [
        /* @__PURE__ */ jsx$1("div", { className: classes.popover.sectionTilte, children: "搜索" }),
        /* @__PURE__ */ jsx$1("div", { children: searchInput })
      ] }),
      /* @__PURE__ */ jsx$1(SearchCacheRelated, {}),
      viewingSomeGroup && !!selectedFollowGroup && /* @__PURE__ */ jsxs("div", { className: classes.popover.section, children: [
        /* @__PURE__ */ jsxs("div", { className: classes.popover.sectionTilte, children: [
          "分组",
          /* @__PURE__ */ jsx$1(HelpInfo, { children: "当前分组的一些操作~" }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center ml-15 font-size-14", children: [
            "(",
            /* @__PURE__ */ jsxs("a", { href: formatFollowGroupUrl((selectedFollowGroup == null ? void 0 : selectedFollowGroup.tagid) || ""), target: "_blank", className: `inline-flex items-center font-size-16 mx-4 ${APP_CLS_USE_ANT_LINK_COLOR}`, children: [
              /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { className: "size-18 mr-2" }),
              selectedFollowGroup == null ? void 0 : selectedFollowGroup.name
            ] }),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx$1("div", { children: /* @__PURE__ */ jsx$1(FollowGroupActions, { followGroup: selectedFollowGroup, onRefresh }) })
      ] })
    ] });
    const [popoverOpen, setPopoverOpen] = React.useState(
      false
      // dev: change to true for debug if needed);
    );
    const onPopoverOpenChange = setPopoverOpen;
    const popoverTrigger = /* @__PURE__ */ jsx$1(antd.Popover, { open: popoverOpen, onOpenChange: onPopoverOpenChange, arrow: false, placement: "bottomLeft", getPopupContainer, content: popoverContent, overlayInnerStyle: {
      border: `1px solid ${usePopoverBorderColor()}`
    }, children: /* @__PURE__ */ jsx$1(antd.Badge, { dot: showPopoverBadge, color: colorPrimaryValue, offset: [-5, 5], children: /* @__PURE__ */ jsx$1(antd.Button, { css: [iconOnlyRoundButtonCss, popoverOpen && buttonOpenCss, "", ""], children: /* @__PURE__ */ jsx$1(IconForPopoverTrigger, { className: "ml-1" }) }) }) });
    return /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsxs(antd.Space, { ref, children: [
      scopeDropdownMenu,
      (viewingSomeUp || selectedFollowGroup) && /* @__PURE__ */ jsxs(antd.Button, { onClick: onClear, className: "gap-0", children: [
        /* @__PURE__ */ jsx$1(IconForReset, { className: "size-14px mr-5px" }),
        /* @__PURE__ */ jsx$1("span", { children: "清除" })
      ] }),
      popoverTrigger,
      externalSearchInput && searchInput,
      addCopyBvidButton && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx$1(antd.Button, { onClick: () => {
          copyBvidsSingleLine();
          antMessage.success("已复制");
        }, children: "Copy Bvids SingleLine" }),
        /* @__PURE__ */ jsx$1(antd.Button, { onClick: () => {
          copyBvidInfos();
          antMessage.success("已复制");
        }, children: "Copy Bvid Infos" })
      ] })
    ] }) });
  }
  function SearchCacheRelated() {
    const {
      cacheAllItemsEntry,
      cacheAllItemsUpMids
    } = useSettingsSnapshot().dynamicFeed.__internal;
    const {
      viewingSomeUp,
      upMid,
      upName
    } = useSnapshot(dfStore);
    const $req = useRequest(async (upMid2, upName2) => {
      const {
        notifyOnProgress,
        notifyOnSuccess
      } = createUpdateSearchCacheNotifyFns(upMid2, upName2);
      await updateLocalDynamicFeedCache(upMid2, notifyOnProgress);
      notifyOnSuccess();
    }, {
      manual: true
    });
    const checked = React.useMemo(() => !!upMid && cacheAllItemsUpMids.includes(upMid.toString()), [upMid, cacheAllItemsUpMids]);
    const onChange = React.useCallback(async (e) => {
      if (!upMid) return;
      const val = e.target.checked;
      const args = val ? {
        add: [upMid]
      } : {
        remove: [upMid]
      };
      await updateSettingsInnerArray("dynamicFeed.__internal.cacheAllItemsUpMids", args);
    }, []);
    return /* @__PURE__ */ jsx$1(Fragment, { children: cacheAllItemsEntry && viewingSomeUp && upMid && upName && /* @__PURE__ */ jsxs("div", { className: classes.popover.section, children: [
      /* @__PURE__ */ jsxs("div", { className: classes.popover.sectionTilte, children: [
        "搜索缓存",
        /* @__PURE__ */ jsxs(HelpInfo, { children: [
          "开启搜索缓存后, 会加载并缓存 UP 所有的动态 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "当本地有缓存且总条数 <= 5000时, 搜索框成为及时搜索, 无需点击搜索按钮"
        ] })
      ] }),
      /* @__PURE__ */ jsx$1("div", { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-y-3 gap-x-10 flex-wrap", children: [
        /* @__PURE__ */ jsx$1(antd.Checkbox, { className: "inline-flex items-center", checked, onChange, children: /* @__PURE__ */ jsx$1(AntdTooltip, { title: "只有开启此项, 搜索时才会使用缓存", children: /* @__PURE__ */ jsxs("span", { children: [
          "为「",
          upName,
          "」开启"
        ] }) }) }),
        /* @__PURE__ */ jsx$1(antd.Button, { loading: $req.loading, onClick: async () => {
          await $req.runAsync(upMid, upName);
        }, children: "更新缓存" }),
        flexBreak,
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "dynamicFeed.advancedSearch", label: "使用高级搜索", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "高级搜索 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "1. 可以使用多个搜索词, 用空格分隔, 逻辑关系为且 (AND) ",
          /* @__PURE__ */ jsx$1("br", {}),
          '2. 可以使用引号包裹搜索词, 如 "word or sentence" ',
          /* @__PURE__ */ jsx$1("br", {}),
          '2. 可以使用 -"word or sentence" 排除关键词 ',
          /* @__PURE__ */ jsx$1("br", {})
        ] }) })
      ] }) })
    ] }) });
  }
  const tryInstantSearchWithCache = throttle$1(async function({
    searchText,
    upMid,
    onRefresh
  }) {
    if (!upMid) return;
    if (!(searchText || !searchText && dfStore.searchText)) return;
    if (!settings.dynamicFeed.__internal.cacheAllItemsEntry) return;
    if (!settings.dynamicFeed.__internal.cacheAllItemsUpMids.includes(upMid.toString())) return;
    if (!await hasLocalDynamicFeedCache(upMid)) return;
    const info = await infoCache.get(upMid);
    if (!info || !info.count) return;
    if (info.count >= 5e3) return;
    dfStore.searchText = searchText;
    await delay(0);
    onRefresh == null ? void 0 : onRefresh();
  }, 100);
  function FollowGroupActions({
    followGroup,
    onRefresh
  }) {
    const {
      whenViewAll
    } = useSnapshot(settings.dynamicFeed);
    const midCount = followGroup.count;
    let forceMergeTimelineCheckbox;
    const forceMergeTimelineHandle = useValueInSettingsCollection(followGroup.tagid, "dynamicFeed.followGroup.forceUseMergeTimelineIds");
    {
      const {
        checked,
        onChange
      } = forceMergeTimelineHandle;
      const disabled = midCount <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD;
      forceMergeTimelineCheckbox = /* @__PURE__ */ jsx$1(antd.Checkbox, { checked, onChange: (e) => {
        onChange(e);
        onRefresh == null ? void 0 : onRefresh();
      }, disabled, children: /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "默认分组 UP 数量不超过",
        " ",
        FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD,
        " ",
        "时会使用「拼接时间线」",
        disabled && /* @__PURE__ */ jsxs("p", { css: /* @__PURE__ */ css("color:oklch(from ", colorPrimaryValue, " calc(1 - l) calc(c + 0.1) h);font-style:italic;", ""), children: [
          "当前分组 UP 数量: ",
          midCount,
          ", 无需设置"
        ] })
      ] }), children: "分组动态: 强制使用「拼接时间线」" }) });
    }
    let clearMergeTimelineHeadCacheButton;
    {
      const usingMergeTimeline = midCount <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD || forceMergeTimelineHandle.checked;
      const usingMergeTimelineHeadCache = usingMergeTimeline && midCount > FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD;
      clearMergeTimelineHeadCacheButton = usingMergeTimelineHeadCache && /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "当分组 UP 数量",
        " >  ",
        FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD,
        "时, 「拼接时间线」功能会缓存每个 UP 的最新动态5分钟. ",
        /* @__PURE__ */ jsx$1("br", {}),
        "这里可以手动清除缓存"
      ] }), children: /* @__PURE__ */ jsx$1(antd.Button, { onClick: () => {
        fetchVideoDynamicFeedsWithCache.cache.db.clear();
        antMessage.success("已清除缓存");
      }, children: "清除「拼接时间线」- 队头缓存" }) });
    }
    let addTo_dynamicFeedWhenViewAllHideIds_checkbox;
    {
      const {
        checked,
        onChange
      } = useValueInSettingsCollection(`${DF_SELECTED_KEY_PREFIX_GROUP}${followGroup.tagid}`, "dynamicFeed.whenViewAll.hideIds");
      addTo_dynamicFeedWhenViewAllHideIds_checkbox = whenViewAll.enableHideSomeContents && /* @__PURE__ */ jsx$1(antd.Checkbox, { checked, onChange, children: /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "在「全部」动态中隐藏来自此 ",
        followGroup.name,
        " 的动态"
      ] }), children: "在「全部」动态中隐藏来自此分组的动态" }) });
    }
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-wrap gap-x-10 gap-y-6", children: [
      addTo_dynamicFeedWhenViewAllHideIds_checkbox,
      forceMergeTimelineCheckbox,
      clearMergeTimelineHeadCacheButton
    ] });
  }
  function useValueInSettingsCollection(value, listSettingsPath) {
    const snap = useSettingsSnapshot();
    const list = get(snap, listSettingsPath);
    const checked = React.useMemo(() => list.includes(value), [list]);
    const setChecked = useMemoizedFn(async (checked2) => {
      const arg = checked2 ? {
        add: [value]
      } : {
        remove: [value]
      };
      await updateSettingsInnerArray(listSettingsPath, arg);
    });
    const onChange = React.useCallback((e) => {
      setChecked(e.target.checked);
    }, []);
    return {
      checked,
      setChecked,
      onChange
    };
  }
  function getDynamicFeedServiceConfig() {
    var _a2;
    const snap = snapshot(dfStore);
    return {
      /**
       * from dfStore
       */
      // UP | 分组
      upMid: snap.upMid,
      followGroupTagId: (_a2 = snap.selectedFollowGroup) == null ? void 0 : _a2.tagid,
      // 搜索
      searchText: snap.searchText,
      // 类型
      dynamicFeedVideoType: snap.dynamicFeedVideoType,
      hideChargeOnlyVideos: snap.hideChargeOnlyVideos,
      // 时长
      filterMinDuration: snap.filterMinDuration,
      filterMinDurationValue: snap.filterMinDurationValue,
      // flags
      selectedKey: snap.selectedKey,
      viewingAll: snap.viewingAll,
      viewingSomeUp: snap.viewingSomeUp,
      viewingSomeGroup: snap.viewingSomeGroup,
      /**
       * from settings
       */
      showLiveInDynamicFeed: settings.dynamicFeed.showLive,
      whenViewAllEnableHideSomeContents: settings.dynamicFeed.whenViewAll.enableHideSomeContents,
      whenViewAllHideIds: new Set(settings.dynamicFeed.whenViewAll.hideIds),
      advancedSearch: settings.dynamicFeed.advancedSearch,
      searchCacheEnabled: !!snap.upMid && settings.dynamicFeed.__internal.cacheAllItemsEntry && // the main switch
      settings.dynamicFeed.__internal.cacheAllItemsUpMids.includes(snap.upMid.toString()),
      // the switch for this up
      forceUseMergeTime: !!snap.selectedFollowGroup && settings.dynamicFeed.followGroup.forceUseMergeTimelineIds.includes(snap.selectedFollowGroup.tagid),
      /**
       * from query
       */
      startingOffset: QUERY_DYNAMIC_OFFSET,
      minId: isValidNumber(QUERY_DYNAMIC_MIN_ID) ? BigInt(QUERY_DYNAMIC_MIN_ID) : void 0,
      minTs: isValidNumber(QUERY_DYNAMIC_MIN_TS) ? Number(QUERY_DYNAMIC_MIN_TS) : void 0
    };
  }
  function isValidNumber(str) {
    return !!str && /^\d+$/.test(str);
  }
  const debug$6 = baseDebug.extend("modules:rec-services:dynamic-feed");
  const _DynamicFeedRecService = class _DynamicFeedRecService extends BaseTabService {
    constructor(config) {
      super(_DynamicFeedRecService.PAGE_SIZE);
      __publicField(this, "usageInfo", /* @__PURE__ */ jsx$1(DynamicFeedUsageInfo, {}));
      __publicField(this, "hasMoreExceptQueue", true);
      __publicField(this, "offset", "");
      __publicField(this, "page", 0);
      // pages loaded
      __publicField(this, "liveRecService");
      __publicField(this, "whenViewSomeGroupMergeTimelineService");
      __publicField(this, "whenViewSomeGroupMids", /* @__PURE__ */ new Set());
      __publicField(this, "whenViewAllHideMids", /* @__PURE__ */ new Set());
      __publicField(this, "whenViewAllHideMidsLoaded", false);
      __publicField(this, "_queueForSearchCache");
      this.config = config;
      if (this.config.showLiveInDynamicFeed) {
        const filterEmpty = !this.upMid && typeof this.followGroupTagId === "undefined" && !this.searchText && this.dynamicFeedVideoType === DynamicFeedVideoType.All && this.filterMinDuration === DynamicFeedVideoMinDuration.All;
        if (filterEmpty) {
          this.liveRecService = new LiveRecService(true);
        }
      }
      if (this.config.startingOffset) {
        this.offset = this.config.startingOffset;
      }
    }
    get hasMore() {
      var _a2;
      if (this.qs.bufferQueue.length) return true;
      if ((_a2 = this.liveRecService) == null ? void 0 : _a2.hasMore) return true;
      if (this.viewingSomeGroup && this.whenViewSomeGroupMergeTimelineService) {
        return this.whenViewSomeGroupMergeTimelineService.hasMore;
      }
      if (this.hasMoreExceptQueue) return true;
      return false;
    }
    /**
     * shortcuts for ServiceConfig(this.config)
     */
    get upMid() {
      return this.config.upMid;
    }
    // NOTE: number | undefined 默认分组是 0
    get followGroupTagId() {
      return this.config.followGroupTagId;
    }
    get searchText() {
      return this.config.searchText;
    }
    get dynamicFeedVideoType() {
      return this.config.dynamicFeedVideoType;
    }
    get hideChargeOnlyVideos() {
      return this.config.hideChargeOnlyVideos;
    }
    get filterMinDuration() {
      return this.config.filterMinDuration;
    }
    get filterMinDurationValue() {
      return this.config.filterMinDurationValue;
    }
    get viewingSomeUp() {
      return this.config.viewingSomeUp;
    }
    /**
     * 查看分组
     */
    get viewingSomeGroup() {
      return this.config.viewingSomeGroup;
    }
    async loadWhenViewSomeGroupMids() {
      if (typeof this.followGroupTagId !== "number") return;
      if (this.whenViewSomeGroupMids.size) return;
      const mids = await getFollowGroupContent(this.followGroupTagId);
      this.whenViewSomeGroupMids = new Set(mids);
      if (mids.length > 0 && (mids.length <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD || // <- 太多了则从全部过滤
      this.config.forceUseMergeTime)) {
        this.whenViewSomeGroupMergeTimelineService = new FollowGroupMergeTimelineService(mids.map((x) => x.toString()));
      }
    }
    /**
     * 查看全部
     */
    get viewingAll() {
      return this.config.viewingAll;
    }
    async loadWhenViewAllHideMids() {
      if (!this.viewingAll) return;
      if (!this.config.whenViewAllEnableHideSomeContents) return;
      if (!this.config.whenViewAllHideIds.size) return;
      if (this.whenViewAllHideMidsLoaded) return;
      const mids = Array.from(this.config.whenViewAllHideIds).filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_UP)).map((x) => x.slice(DF_SELECTED_KEY_PREFIX_UP.length));
      const groupIds = Array.from(this.config.whenViewAllHideIds).filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_GROUP)).map((x) => x.slice(DF_SELECTED_KEY_PREFIX_GROUP.length));
      const set2 = this.whenViewAllHideMids;
      mids.forEach((x) => set2.add(x));
      const midsInGroup = (await pmap(groupIds, async (id) => getFollowGroupContent(id), 3)).flat();
      midsInGroup.forEach((x) => set2.add(x.toString()));
      this.whenViewAllHideMidsLoaded = true;
    }
    async fetchMore(abortSignal) {
      var _a2;
      if ((_a2 = this.liveRecService) == null ? void 0 : _a2.hasMore) {
        const items2 = await this.liveRecService.loadMore(abortSignal) || [];
        return items2.filter((x) => x.api !== EApiType.Separator);
      }
      let rawItems;
      if (this.viewingSomeGroup) {
        await this.loadWhenViewSomeGroupMids();
      }
      if (this.viewingAll) {
        await this.loadWhenViewAllHideMids();
        debug$6("viewingAll: hide-mids = %o", this.whenViewAllHideMids);
      }
      const useSearchCache = !!(this.upMid && this.searchText && this.config.searchCacheEnabled && await hasLocalDynamicFeedCache(this.upMid));
      const useAdvancedSearch = useSearchCache && this.config.advancedSearch;
      const useAdvancedSearchParsed = useAdvancedSearch ? parseSearchInput((this.searchText || "").toLowerCase()) : void 0;
      if (useSearchCache) {
        if (!this._queueForSearchCache) {
          await performIncrementalUpdateIfNeed(this.upMid);
          this._queueForSearchCache = new QueueStrategy(20);
          this._queueForSearchCache.bufferQueue = (await cache.get(this.upMid) || []).filter((x) => {
            var _a3, _b2, _c2, _d;
            const title = ((_d = (_c2 = (_b2 = (_a3 = x == null ? void 0 : x.modules) == null ? void 0 : _a3.module_dynamic) == null ? void 0 : _b2.major) == null ? void 0 : _c2.archive) == null ? void 0 : _d.title) || "";
            return filterBySearchText({
              searchText: this.searchText,
              title,
              useAdvancedSearch,
              useAdvancedSearchParsed
            });
          });
        }
        rawItems = this._queueForSearchCache.sliceFromQueue(this.page + 1) || [];
        this.page++;
        this.hasMoreExceptQueue = !!this._queueForSearchCache.bufferQueue.length;
      } else if (this.viewingSomeGroup && this.whenViewSomeGroupMergeTimelineService) {
        rawItems = await this.whenViewSomeGroupMergeTimelineService.loadMore(abortSignal);
      } else {
        const data2 = await fetchVideoDynamicFeeds({
          abortSignal,
          page: this.page + 1,
          // ++this.page, starts from 1, 实测 page 没啥用, 分页基于 offset
          offset: this.offset,
          upMid: this.upMid
        });
        this.page++;
        this.hasMoreExceptQueue = data2.has_more;
        this.offset = data2.offset;
        rawItems = data2.items;
        if (this.config.minId) {
          const minId = this.config.minId;
          const idx = rawItems.findIndex((x) => BigInt(x.id_str) <= minId);
          if (idx !== -1) {
            this.hasMoreExceptQueue = false;
            rawItems = rawItems.slice(0, idx + 1);
          }
        }
        if (this.config.minTs) {
          const minTs = this.config.minTs;
          const idx = rawItems.findIndex((x) => x.modules.module_author.pub_ts <= minTs);
          if (idx !== -1) {
            this.hasMoreExceptQueue = false;
            rawItems = rawItems.slice(0, idx + 1);
          }
        }
      }
      const items = rawItems.filter((x) => {
        var _a3, _b2;
        if (!this.viewingSomeGroup) return true;
        if (!this.whenViewSomeGroupMids.size) return true;
        const mid = (_b2 = (_a3 = x == null ? void 0 : x.modules) == null ? void 0 : _a3.module_author) == null ? void 0 : _b2.mid;
        if (!mid) return true;
        return this.whenViewSomeGroupMids.has(mid);
      }).filter((x) => {
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.All) return true;
        const currentLabel = x.modules.module_dynamic.major.archive.badge.text;
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly) {
          return currentLabel === "动态视频";
        }
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.UploadOnly) {
          return currentLabel === "投稿视频" || currentLabel === CHARGE_ONLY_TEXT;
        }
        return false;
      }).filter((x) => {
        var _a3, _b2, _c2, _d, _e;
        if (!this.hideChargeOnlyVideos) return true;
        const chargeOnly = ((_e = (_d = (_c2 = (_b2 = (_a3 = x.modules) == null ? void 0 : _a3.module_dynamic) == null ? void 0 : _b2.major) == null ? void 0 : _c2.archive) == null ? void 0 : _d.badge) == null ? void 0 : _e.text) === CHARGE_ONLY_TEXT;
        return !chargeOnly;
      }).filter((x) => {
        if (this.filterMinDuration === DynamicFeedVideoMinDuration.All) return true;
        const v = x.modules.module_dynamic.major.archive;
        const duration2 = parseDuration(v.duration_text);
        return duration2 >= this.filterMinDurationValue;
      }).filter((x) => {
        var _a3, _b2, _c2, _d;
        if (!this.searchText) return true;
        const title = ((_d = (_c2 = (_b2 = (_a3 = x == null ? void 0 : x.modules) == null ? void 0 : _a3.module_dynamic) == null ? void 0 : _b2.major) == null ? void 0 : _c2.archive) == null ? void 0 : _d.title) || "";
        return filterBySearchText({
          searchText: this.searchText,
          title,
          useAdvancedSearch,
          useAdvancedSearchParsed
        });
      }).filter((x) => {
        var _a3, _b2;
        if (this.config.selectedKey !== DF_SELECTED_KEY_ALL) return true;
        const set2 = this.whenViewAllHideMids;
        if (!set2.size) return true;
        const mid = (_b2 = (_a3 = x == null ? void 0 : x.modules) == null ? void 0 : _a3.module_author) == null ? void 0 : _b2.mid;
        if (!mid) return true;
        return !set2.has(mid.toString());
      }).map((item) => {
        return {
          ...item,
          api: EApiType.DynamicFeed,
          uniqId: item.id_str || crypto.randomUUID()
        };
      });
      function filterBySearchText({
        title,
        searchText,
        useAdvancedSearch: useAdvancedSearch2,
        useAdvancedSearchParsed: useAdvancedSearchParsed2
      }) {
        title = title.toLowerCase();
        searchText = searchText.toLowerCase();
        const simpleSearch = () => title.includes(searchText);
        const advancedSearch = () => {
          return ((useAdvancedSearchParsed2 == null ? void 0 : useAdvancedSearchParsed2.includes) ?? []).every((x) => title.includes(x)) && ((useAdvancedSearchParsed2 == null ? void 0 : useAdvancedSearchParsed2.excludes) ?? []).every((x) => !title.includes(x));
        };
        return useAdvancedSearch2 ? advancedSearch() : simpleSearch();
      }
      const {
        upMid,
        upName
      } = dfStore;
      if (
        //
        QUERY_DYNAMIC_UP_MID && upMid && upName && upName === upMid.toString() && items[0]
      ) {
        const authorName = items[0].modules.module_author.name;
        const authorFace = items[0].modules.module_author.face;
        dfStore.upName = authorName;
        dfStore.upFace = authorFace;
      }
      if (this.viewingSomeGroup && dfStore.followGroups.length) {
        const group = dfStore.followGroups.find((x) => x.tagid === this.followGroupTagId);
        if (group) group.count = this.whenViewSomeGroupMids.size;
      }
      return items;
    }
  };
  __publicField(_DynamicFeedRecService, "PAGE_SIZE", 15);
  let DynamicFeedRecService = _DynamicFeedRecService;
  const FAV_PAGE_SIZE = 20;
  const favSeparatorCss = {
    item: {
      name: "1hrg5ji",
      styles: "display:inline-flex;align-items:center;font-size:15px;&:not(:first-child){margin-left:30px;}svg{margin-right:5px;margin-top:-1px;}"
    }
  };
  async function __fetchSpaceAccInfo(mid) {
    const res = await request.get("/x/space/wbi/acc/info", {
      params: {
        mid,
        w_webid: await get_w_webId() || ""
      }
    });
    const json = res.data;
    if (!isWebApiSuccess(json)) {
      appWarn("space acc info error for %s: %o", mid, json);
      return;
    }
    const info = json.data;
    return info;
  }
  const getSpaceAccInfo = wrapWithIdbCache({
    fn: __fetchSpaceAccInfo,
    generateKey: (mid) => mid.toString(),
    tableName: "space_acc_info",
    ttl: ms("10d"),
    concurrency: 2
    // 因在 react component 中使用, 可能会导致瞬时并发, 引发风控
  });
  function formatFavFolderUrl(id, ctype = 21) {
    return `https://space.bilibili.com/${getUid()}/favlist?fid=${id}&ftype=create`;
  }
  function formatFavCollectionUrl(id, ctype = 21) {
    return `https://space.bilibili.com/${getUid()}/favlist?fid=${id}&ftype=collect&ctype=${ctype}`;
  }
  function formatFavPlaylistUrl(id) {
    return `https://www.bilibili.com/list/ml${id}`;
  }
  function formatBvidUrl(bvid) {
    return `https://www.bilibili.com/video/${bvid}`;
  }
  class FavCollectionService {
    constructor(collectionId, addSeparator, itemsOrder) {
      /**
       * 这是个假分页... 一次返回所有
       */
      __publicField(this, "loaded", false);
      __publicField(this, "bufferQueue", []);
      __publicField(this, "separatorAdded", false);
      // reactive state
      __publicField(this, "state", proxy({
        firstBvid: void 0,
        info: void 0
      }));
      this.collectionId = collectionId;
      this.addSeparator = addSeparator;
      this.itemsOrder = itemsOrder;
    }
    get hasMore() {
      if (this.addSeparator && !this.separatorAdded) return true;
      if (!this.loaded) return true;
      return !!this.bufferQueue.length;
    }
    get separator() {
      return {
        api: EApiType.Separator,
        uniqId: `fav-collection-${this.collectionId}`,
        content: /* @__PURE__ */ jsx$1(FavCollectionSeparator, { service: this })
      };
    }
    async loadMore(abortSignal) {
      var _a2;
      if (!this.hasMore) return;
      if (this.addSeparator && !this.separatorAdded) {
        this.separatorAdded = true;
        return [this.separator];
      }
      if (!this.loaded) {
        const data2 = await fetchCollectionDetail(this.collectionId, 1);
        const medias = (data2 == null ? void 0 : data2.medias) || [];
        const info = data2 == null ? void 0 : data2.info;
        await tryit(() => this.loadUserAvatarFromSpaceAccInfo(medias, abortSignal))();
        let items = medias.map((x) => {
          return {
            ...x,
            api: EApiType.Fav,
            uniqId: `fav-${this.collectionId}-${x.bvid}`,
            collection: data2.info,
            from: "fav-collection"
          };
        });
        items = handleItemsOrder(items, this.itemsOrder);
        this.bufferQueue = items;
        this.loaded = true;
        this.state.firstBvid = (_a2 = items[0]) == null ? void 0 : _a2.bvid;
        this.state.info = cloneDeep(info);
        favStore.selectedFavCollectionDetailInfo = cloneDeep(info);
      }
      if (this.itemsOrder === FavItemsOrder.Shuffle) {
        this.bufferQueue = shuffle(this.bufferQueue);
      }
      let sliced;
      [sliced, this.bufferQueue] = [this.bufferQueue.slice(0, FAV_PAGE_SIZE), this.bufferQueue.slice(FAV_PAGE_SIZE)];
      return sliced;
    }
    // 合集返回的数据没有头像, 这里通过 space-acc-info 补全
    async loadUserAvatarFromSpaceAccInfo(items, abortSignal) {
      if (!items.length) return;
      const midsCount = countBy(items, (x) => x.upper.mid);
      const list = Object.entries(midsCount).map(([mid, count]) => ({
        mid,
        count
      }));
      const topMids = orderBy(list, [(x) => x.count], ["desc"]).slice(0, 3).map((x) => x.mid);
      await Promise.all(topMids.map(async (mid) => {
        if (abortSignal == null ? void 0 : abortSignal.aborted) return;
        const info = await getSpaceAccInfo(mid);
        const face = info == null ? void 0 : info.face;
        if (face) {
          items.filter((x) => x.upper.mid.toString() === mid).forEach((x) => {
            var _a2;
            (_a2 = x.upper).face || (_a2.face = face);
          });
        }
      }));
    }
    get extraUsageInfo() {
      return /* @__PURE__ */ jsx$1(FavItemsOrderSwitcher, {});
    }
  }
  function FavCollectionSeparator({
    service
  }) {
    const {
      firstBvid,
      info
    } = useSnapshot(service.state);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "UP: ",
        info == null ? void 0 : info.upper.name,
        " ",
        /* @__PURE__ */ jsx$1("br", {}),
        (info == null ? void 0 : info.intro) || "简介: N/A"
      ] }), children: /* @__PURE__ */ jsxs(CustomTargetLink, { href: formatFavCollectionUrl(service.collectionId), css: favSeparatorCss.item, children: [
        /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { css: C.size(16) }),
        info == null ? void 0 : info.title
      ] }) }),
      firstBvid && /* @__PURE__ */ jsxs(CustomTargetLink, { href: formatBvidUrl(firstBvid), css: favSeparatorCss.item, children: [
        /* @__PURE__ */ jsx$1(IconForPlayer, { css: C.size(16) }),
        "播放全部"
      ] })
    ] });
  }
  function FavFolderSeparator({
    service
  }) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(CustomTargetLink, { href: formatFavFolderUrl(service.entry.id, service.entry.attr), css: favSeparatorCss.item, children: [
        /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { css: C.size(16) }),
        service.entry.title
      ] }),
      /* @__PURE__ */ jsxs(CustomTargetLink, { href: formatFavPlaylistUrl(service.entry.id), css: favSeparatorCss.item, children: [
        /* @__PURE__ */ jsx$1(IconForPlayer, { css: C.size(16) }),
        "播放全部"
      ] })
    ] });
  }
  const FAV_FOLDER_API_SUPPOETED_ORDER = [FavItemsOrder.FavTimeDesc, FavItemsOrder.PlayCountDesc, FavItemsOrder.PubTimeDesc];
  function isFavFolderApiSuppoetedOrder(order) {
    return FAV_FOLDER_API_SUPPOETED_ORDER.includes(order);
  }
  class FavFolderService {
    constructor(entry, addSeparator, itemsOrder) {
      __publicField(this, "basicService");
      __publicField(this, "needLoadAll");
      __publicField(this, "separatorAdded", false);
      __publicField(this, "allItemsLoaded", false);
      __publicField(this, "bufferQueue", []);
      __publicField(this, "__fetchAllItems", async (abortSignal = new AbortController().signal) => {
        const allItems = [];
        while (this.basicService.hasMore && !abortSignal.aborted) {
          const items = await this.basicService.loadMore(abortSignal) || [];
          allItems.push(...items);
        }
        return allItems;
      });
      // __fetchAllItems will result multiple requests, so cache it
      __publicField(this, "fetchAllItemsWithCache", wrapWithIdbCache({
        fn: this.__fetchAllItems,
        tableName: "fav-folder-all-items",
        generateKey: () => `${this.entry.id}`,
        ttl: ms("5min")
      }));
      __publicField(this, "addToFetchAllItemsWithCache", async (items) => {
        const {
          cache: cache2,
          generateKey,
          shouldReuseCached
        } = this.fetchAllItemsWithCache;
        const cached = await cache2.get(generateKey());
        if (!cached || !shouldReuseCached(cached)) return;
        const newItems = uniqBy([...cached.val, ...items], (x) => x.bvid);
        await cache2.set(generateKey(), {
          ...cached,
          val: newItems
        });
      });
      this.entry = entry;
      this.addSeparator = addSeparator;
      this.itemsOrder = itemsOrder;
      if (this.itemsOrder === FavItemsOrder.Default) {
        throw new Error("this should not happen!");
      }
      if (isFavFolderApiSuppoetedOrder(this.itemsOrder)) {
        this.basicService = new FavFolderBasicService(this.entry, this.itemsOrder);
        this.needLoadAll = false;
      } else {
        this.basicService = new FavFolderBasicService(this.entry);
        this.needLoadAll = true;
      }
    }
    get hasMore() {
      if (this.addSeparator && !this.separatorAdded) return true;
      if (this.needLoadAll) {
        if (!this.allItemsLoaded) return true;
        return !!this.bufferQueue.length;
      } else {
        return this.basicService.hasMore;
      }
    }
    get separator() {
      return {
        api: EApiType.Separator,
        uniqId: `fav-folder-${this.entry.id}`,
        content: /* @__PURE__ */ jsx$1(FavFolderSeparator, { service: this.basicService })
      };
    }
    async loadMore(abortSignal) {
      if (!this.hasMore) return;
      if (this.addSeparator && !this.separatorAdded) {
        this.separatorAdded = true;
        return [this.separator];
      }
      if (this.needLoadAll) {
        if (!this.allItemsLoaded) await this.loadAllItems(abortSignal);
        if (this.itemsOrder === FavItemsOrder.Shuffle) {
          this.bufferQueue = shuffle(this.bufferQueue);
        }
        const sliced = this.bufferQueue.slice(0, FAV_PAGE_SIZE);
        this.bufferQueue = this.bufferQueue.slice(FAV_PAGE_SIZE);
        return sliced;
      } else {
        const ret = await this.basicService.loadMore(abortSignal);
        if (ret == null ? void 0 : ret.length) await this.addToFetchAllItemsWithCache(ret);
        this.runSideEffects();
        return ret;
      }
    }
    async loadAllItems(abortSignal) {
      const allItems = await this.fetchAllItemsWithCache(abortSignal);
      this.bufferQueue = handleItemsOrder(allItems, this.itemsOrder);
      this.allItemsLoaded = true;
      this.runSideEffects();
    }
    runSideEffects() {
      var _a2;
      if (typeof ((_a2 = this.basicService.info) == null ? void 0 : _a2.media_count) === "number") {
        updateFavFolderMediaCount(this.entry.id, this.basicService.info.media_count);
      }
    }
    get extraUsageInfo() {
      return /* @__PURE__ */ jsx$1(FavItemsOrderSwitcher, {});
    }
  }
  class FavFolderBasicService {
    constructor(entry, itemsOrder = FavItemsOrder.FavTimeDesc) {
      __publicField(this, "hasMore");
      __publicField(this, "info");
      __publicField(this, "page", 0);
      this.entry = entry;
      this.itemsOrder = itemsOrder;
      this.hasMore = entry.media_count > 0;
    }
    // pages loaded
    async loadMore(abortSignal) {
      if (!this.hasMore) return;
      const order = {
        [FavItemsOrder.FavTimeDesc]: "mtime",
        [FavItemsOrder.PlayCountDesc]: "view",
        [FavItemsOrder.PubTimeDesc]: "pubtime"
      }[this.itemsOrder];
      const res = await request.get("/x/v3/fav/resource/list", {
        params: {
          media_id: this.entry.id,
          pn: this.page + 1,
          // start from 1
          ps: 20,
          keyword: "",
          order,
          // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
          type: "0",
          // unkown
          tid: "0",
          // 分区
          platform: "web"
        }
      });
      const json = res.data;
      if (!isWebApiSuccess(json)) {
        toast(json.message || REQUEST_FAIL_MSG);
        return;
      }
      this.page++;
      this.hasMore = json.data.has_more;
      this.info = json.data.info;
      let items = json.data.medias || [];
      items = items.filter((item) => {
        if (item.title === "已失效视频") return false;
        return true;
      });
      return items.map((item) => {
        var _a2;
        return {
          ...item,
          from: "fav-folder",
          folder: this.info,
          api: EApiType.Fav,
          uniqId: `fav-${(_a2 = this.info) == null ? void 0 : _a2.id}-${item.bvid}`
        };
      });
    }
  }
  class FavAllService {
    constructor(addSeparator, itemsOrder, excludedFolderIds) {
      __publicField(this, "shuffleBufferQueue", []);
      // fav-folder
      __publicField(this, "allFolderServices", []);
      // before exclude
      __publicField(this, "state", proxy({
        totalCountInFavFolders: 0
      }));
      __publicField(this, "serviceCreated", false);
      __publicField(this, "allServices", []);
      this.addSeparator = addSeparator;
      this.itemsOrder = itemsOrder;
      this.excludedFolderIds = excludedFolderIds;
      if (![FavItemsOrder.Default, FavItemsOrder.Shuffle].includes(this.itemsOrder)) {
        throw new Error("invalid items order");
      }
    }
    get useShuffle() {
      return this.itemsOrder === FavItemsOrder.Shuffle;
    }
    get hasMoreInService() {
      if (!this.serviceCreated) return true;
      return this.allServices.some((s) => s.hasMore);
    }
    get hasMore() {
      if (this.useShuffle) {
        return !!this.shuffleBufferQueue.length || this.hasMoreInService;
      } else {
        return this.hasMoreInService;
      }
    }
    get extraUsageInfo() {
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx$1(FavItemsOrderSwitcher, {}),
        /* @__PURE__ */ jsx$1(ViewingAllExcludeFolderConfig, { allFavFolderServices: this.allFolderServices, state: this.state })
      ] });
    }
    async loadMore(abortSignal) {
      if (!this.serviceCreated) await this.createServices();
      if (!this.hasMore) return;
      if (!this.useShuffle) {
        const service = this.allServices.find((s) => s.hasMore);
        return service == null ? void 0 : service.loadMore(abortSignal);
      }
      if (this.shuffleBufferQueue.length < FAV_PAGE_SIZE) {
        const count = 6;
        const batch = 2;
        while (this.hasMoreInService && this.shuffleBufferQueue.length < FAV_PAGE_SIZE * 3) {
          const restServices = this.allServices.filter((s) => s.hasMore);
          const pickedServices = shuffle(restServices).slice(0, count);
          const fetched = (await pmap(pickedServices, async (s) => await s.loadMore(abortSignal) || [], batch)).flat().filter((x) => x.api !== EApiType.Separator);
          this.shuffleBufferQueue = shuffle([...this.shuffleBufferQueue, ...shuffle(fetched)]);
        }
      }
      const sliced = this.shuffleBufferQueue.slice(0, FAV_PAGE_SIZE);
      this.shuffleBufferQueue = this.shuffleBufferQueue.slice(FAV_PAGE_SIZE);
      return sliced;
    }
    async createServices() {
      await favStore.updateList();
      const {
        favFolders,
        favCollections
      } = cloneDeep(snapshot(favStore));
      this.allFolderServices = favFolders.map((f) => new FavFolderBasicService(f));
      this.state.totalCountInFavFolders = favFolders.filter((f) => !this.excludedFolderIds.includes(f.id.toString())).reduce((count, f) => count + f.media_count, 0);
      {
        const folders = favFolders.filter((f) => !this.excludedFolderIds.includes(f.id.toString()));
        let itemsOrder = this.itemsOrder;
        if (itemsOrder === FavItemsOrder.Default) itemsOrder = FavItemsOrder.FavTimeDesc;
        this.allServices.push(...folders.map((f) => new FavFolderService(f, this.addSeparator, itemsOrder)));
      }
      {
        this.allServices.push(...favCollections.map((f) => new FavCollectionService(f.id, this.addSeparator, this.itemsOrder)));
      }
      this.serviceCreated = true;
    }
  }
  function getFavServiceConfig() {
    const snap = snapshot(favStore);
    return {
      selectedKey: snap.selectedKey,
      itemsOrder: getSavedOrder(snap.selectedKey, snap.savedOrderMap),
      selectedFavFolderId: snap.selectedFavFolderId,
      selectedFavFolder: snap.selectedFavFolder,
      selectedFavCollectionId: snap.selectedFavCollectionId,
      selectedFavCollection: snap.selectedFavCollection,
      // from settings
      addSeparator: settings.fav.addSeparator,
      excludedFolderIds: settings.fav.excludedFolderIds
    };
  }
  const _FavRecService = class _FavRecService extends BaseTabService {
    constructor(config) {
      super(_FavRecService.PAGE_SIZE);
      __publicField(this, "innerService");
      this.config = config;
      if (this.viewingAll) {
        this.innerService = new FavAllService(this.config.addSeparator, this.config.itemsOrder, this.config.excludedFolderIds);
      } else if (this.viewingSomeFolder) {
        this.innerService = new FavFolderService(this.config.selectedFavFolder, this.config.addSeparator, this.config.itemsOrder);
      } else if (this.viewingSomeCollection) {
        this.innerService = new FavCollectionService(this.config.selectedFavCollectionId, this.config.addSeparator, this.config.itemsOrder);
      } else {
        throw new Error("unexpected case!");
      }
    }
    get viewingAll() {
      return this.config.selectedKey === "all";
    }
    get viewingSomeFolder() {
      return typeof this.config.selectedFavFolderId === "number";
    }
    get viewingSomeCollection() {
      return typeof this.config.selectedFavCollectionId === "number";
    }
    get usageInfo() {
      const {
        usageInfo,
        extraUsageInfo
      } = this.innerService;
      if (usageInfo) return usageInfo;
      return /* @__PURE__ */ jsx$1(FavUsageInfo, { extraContent: extraUsageInfo });
    }
    get hasMoreExceptQueue() {
      return this.innerService.hasMore;
    }
    fetchMore(abortSignal) {
      return this.innerService.loadMore(abortSignal);
    }
    // for remove card
    decreaseTotal() {
      if (this.viewingAll) {
        this.innerService.state.totalCountInFavFolders -= 1;
      } else if (this.viewingSomeFolder && this.config.selectedFavFolder) {
        updateFavFolderMediaCount(this.config.selectedFavFolder.id, (x) => x - 1);
      } else if (this.viewingSomeCollection && this.config.selectedFavCollection) ;
    }
  };
  __publicField(_FavRecService, "PAGE_SIZE", FAV_PAGE_SIZE);
  let FavRecService = _FavRecService;
  async function getWatchlaterItemFrom(startKey = "", asc = false) {
    const res = await request.get("/x/v2/history/toview/v2/list", {
      params: await encWbi({
        start_key: startKey,
        asc,
        sort_field: 1,
        web_location: 333.881
      })
    });
    const json = res.data;
    if (!isWebApiSuccess(json)) {
      appWarn("getAllWatchlaterItemsV2 error %s, fulljson %o", json.message, json);
      return {
        err: json.message
      };
    }
    return {
      total: json.data.show_count,
      hasMore: json.data.has_more,
      nextKey: json.data.next_key,
      items: filterOutApiReturnedRecent(json.data.list || [])
    };
  }
  async function getAllWatchlaterItemsV2(asc = false, abortSignal) {
    let hasMore = true;
    let startKey = "";
    let items = [];
    let err;
    while (hasMore) {
      if (abortSignal == null ? void 0 : abortSignal.aborted) break;
      const result = await getWatchlaterItemFrom(startKey, asc);
      if (typeof result.err !== "undefined") {
        err = result.err;
        break;
      }
      items = items.concat(result.items);
      startKey = result.nextKey;
      hasMore = result.hasMore;
      result.total;
    }
    return {
      err,
      items
    };
  }
  function filterOutApiReturnedRecent(items) {
    return items.filter((item) => !(item.title === "以下为更早添加的视频" && item.aid === 0 && item.bvid === "" && item.add_at === 0));
  }
  async function toastAndReload(msg = "即将刷新网页!") {
    antMessage.info(msg);
    await delay(500);
    location.reload();
  }
  function explainForFlag(checked, unchecked) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      "✅: ",
      checked,
      " ",
      /* @__PURE__ */ jsx$1("br", {}),
      "❎: ",
      unchecked,
      " ",
      /* @__PURE__ */ jsx$1("br", {})
    ] });
  }
  function WatchLaterUsageInfo({
    total
  }) {
    const color = "success";
    const title = `共 ${total} 个视频`;
    const {
      watchlaterUseShuffle,
      watchlaterAddSeparator,
      watchlaterNormalOrderSortByAddAtAsc
    } = useSettingsSnapshot();
    const onRefresh = useOnRefreshContext();
    useUpdateEffect(() => {
      void (async () => {
        await delay(100);
        onRefresh == null ? void 0 : onRefresh();
      })();
    }, [watchlaterUseShuffle, watchlaterAddSeparator, watchlaterNormalOrderSortByAddAtAsc]);
    const btnDisplay = /* @__PURE__ */ jsx$1(ShuffleSettingsItemFor, { configPath: "watchlaterUseShuffle", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
      "随机顺序不包括近期添加的稍后再看 ",
      /* @__PURE__ */ jsx$1("br", {}),
      "近期: 最近48小时内"
    ] }) });
    return /* @__PURE__ */ jsxs(antd.Space, { size: 12, children: [
      /* @__PURE__ */ jsx$1(antd.Tag, { color, style: {
        marginRight: 0,
        marginTop: 1,
        cursor: "pointer"
      }, title, onClick: () => {
        toast(`稍后再看: ${title}`);
      }, children: total }),
      btnDisplay,
      !watchlaterUseShuffle && /* @__PURE__ */ jsx$1(ButtonSettingItem, { configPath: "watchlaterNormalOrderSortByAddAtAsc", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
        "最近添加: 按添加时间倒序 ",
        /* @__PURE__ */ jsx$1("br", {}),
        "最早添加: 按添加时间增序 ",
        /* @__PURE__ */ jsx$1("br", {})
      ] }), checkedChildren: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx$1(IconForAsc, { ...size(18) }),
        "最早添加"
      ] }), unCheckedChildren: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx$1(IconForDesc, { ...size(18) }),
        "最近添加"
      ] }) })
    ] });
  }
  const watchlaterState = proxy({
    updatedAt: 0,
    bvidSet: proxySet()
  });
  function useWatchlaterState(bvid) {
    const set2 = useSnapshot(watchlaterState).bvidSet;
    return !!bvid && set2.has(bvid);
  }
  if (getHasLogined() && getUid()) {
    void (async () => {
      await whenIdle();
      const {
        items: allWatchLaterItems
      } = await getAllWatchlaterItemsV2();
      if (!allWatchLaterItems.length) return;
      watchlaterState.updatedAt = Date.now();
      watchlaterState.bvidSet = proxySet(allWatchLaterItems.map((x) => x.bvid));
    })();
  }
  const _WatchLaterRecService = class _WatchLaterRecService extends BaseTabService {
    constructor(useShuffle, prevShuffleBvidIndexMap) {
      super(_WatchLaterRecService.PAGE_SIZE);
      __publicField(this, "innerService");
      this.useShuffle = useShuffle;
      this.innerService = settings.watchlaterUseShuffle ? new ShuffleOrderService(prevShuffleBvidIndexMap) : new NormalOrderService();
    }
    get hasMoreExceptQueue() {
      return this.innerService.hasMore;
    }
    fetchMore(abortSignal) {
      return this.innerService.loadMore(abortSignal);
    }
    get usageInfo() {
      return this.innerService.usageInfo;
    }
    // for remove watchlater card
    decreaseTotal() {
      this.innerService.total--;
    }
    getSnapshot() {
      const bvidIndexMap = this.innerService instanceof ShuffleOrderService ? this.innerService.currentBvidIndexMap : void 0;
      return {
        bvidIndexMap
      };
    }
  };
  __publicField(_WatchLaterRecService, "PAGE_SIZE", 10);
  let WatchLaterRecService = _WatchLaterRecService;
  function extendItem(item) {
    return {
      ...item,
      api: EApiType.Watchlater,
      uniqId: `watchlater-${item.bvid}`
    };
  }
  const getRecentGate = () => dayjs().subtract(2, "days").unix();
  const recentSeparator = {
    api: EApiType.Separator,
    uniqId: "watchlater-recent",
    content: "近期"
  };
  const earlierSeparator = {
    api: EApiType.Separator,
    uniqId: "watchlater-earlier",
    content: "更早"
  };
  function showApiRequestError(err) {
    toast(`获取稍后再看失败: ${err}`);
    throw new Error(`获取稍后再看失败: ${err}`, {
      cause: err
    });
  }
  class ShuffleOrderService {
    constructor(prevBvidIndexMap) {
      __publicField(this, "addSeparator", settings.watchlaterAddSeparator);
      __publicField(this, "loaded", false);
      __publicField(this, "total", 0);
      __publicField(this, "hasMore", true);
      // shuffle related
      __publicField(this, "keepOrder");
      __publicField(this, "prevBvidIndexMap");
      __publicField(this, "currentBvidIndexMap");
      if (prevBvidIndexMap == null ? void 0 : prevBvidIndexMap.size) {
        this.keepOrder = true;
        this.prevBvidIndexMap = prevBvidIndexMap;
      } else {
        this.keepOrder = false;
      }
    }
    get usageInfo() {
      if (!this.loaded) return;
      const {
        total
      } = this;
      return /* @__PURE__ */ jsx$1(WatchLaterUsageInfo, { total });
    }
    async loadMore(abortSignal) {
      if (!this.hasMore) return;
      if (this.loaded) return;
      const items = await this.fetch(abortSignal);
      this.loaded = true;
      return items;
    }
    async fetch(abortSignal) {
      var _a2;
      const {
        items: rawItems,
        err
      } = await getAllWatchlaterItemsV2(false, abortSignal);
      if (typeof err !== "undefined") {
        showApiRequestError(err);
      }
      const items = rawItems.map(extendItem);
      const recentGate = getRecentGate();
      const firstNotRecentIndex = items.findIndex((item) => item.add_at < recentGate);
      let itemsWithSeparator = items;
      if (firstNotRecentIndex !== -1) {
        const recent = items.slice(0, firstNotRecentIndex);
        let earlier = items.slice(firstNotRecentIndex);
        if (this.keepOrder && ((_a2 = this.prevBvidIndexMap) == null ? void 0 : _a2.size)) {
          earlier = orderBy(earlier, [(item) => {
            var _a3;
            return ((_a3 = this.prevBvidIndexMap) == null ? void 0 : _a3.get(item.bvid)) ?? -1;
          }], ["asc"]);
        } else {
          earlier = shuffle(earlier);
        }
        itemsWithSeparator = [!!recent.length && this.addSeparator && recentSeparator, ...recent, !!earlier.length && this.addSeparator && earlierSeparator, ...earlier].filter(Boolean);
      }
      this.total = rawItems.length;
      this.currentBvidIndexMap = new Map(itemsWithSeparator.filter((x) => x.api !== EApiType.Separator).map((x, index) => [x.bvid, index]));
      return itemsWithSeparator;
    }
  }
  class NormalOrderService {
    constructor() {
      // configs
      __publicField(this, "addSeparator", settings.watchlaterAddSeparator);
      __publicField(this, "addAtAsc", settings.watchlaterNormalOrderSortByAddAtAsc);
      __publicField(this, "firstPageLoaded", false);
      __publicField(this, "count", 0);
      __publicField(this, "hasMore", true);
      __publicField(this, "nextKey", "");
      __publicField(this, "total", 0);
      __publicField(this, "recentSeparatorInserted", false);
      __publicField(this, "earlierSeparatorInserted", false);
    }
    get usageInfo() {
      if (!this.firstPageLoaded) return;
      return /* @__PURE__ */ jsx$1(WatchLaterUsageInfo, { total: this.total });
    }
    async loadMore() {
      if (!this.hasMore) return;
      const result = await getWatchlaterItemFrom(this.nextKey, this.addAtAsc);
      if (typeof result.err !== "undefined") {
        this.hasMore = false;
        showApiRequestError(result.err);
        return;
      }
      this.firstPageLoaded = true;
      this.hasMore = result.hasMore;
      this.nextKey = result.nextKey;
      this.total = result.total;
      const items = result.items.map(extendItem);
      return this.insertSeparator(items);
    }
    insertSeparator(items) {
      if (!this.addSeparator) return items;
      let newItems = [...items];
      const recentGate = getRecentGate();
      const needEarlierSeparator = items.some((item) => item.add_at < recentGate);
      const needRecentSeparator = items.some((item) => item.add_at >= recentGate);
      if (this.addAtAsc) {
        if (!this.earlierSeparatorInserted && needEarlierSeparator) {
          newItems = [earlierSeparator, ...newItems];
          this.earlierSeparatorInserted = true;
        }
        if (!this.recentSeparatorInserted && needRecentSeparator) {
          const idx = newItems.findIndex((item) => item.api === EApiType.Watchlater && item.add_at >= recentGate);
          newItems = [...newItems.slice(0, idx), recentSeparator, ...newItems.slice(idx)];
          this.recentSeparatorInserted = true;
        }
      } else {
        if (!this.recentSeparatorInserted && needRecentSeparator) {
          newItems = [recentSeparator, ...items];
          this.recentSeparatorInserted = true;
        }
        if (!this.earlierSeparatorInserted && needEarlierSeparator) {
          const idx = newItems.findIndex((item) => item.api === EApiType.Watchlater && item.add_at < recentGate);
          newItems = [...newItems.slice(0, idx), earlierSeparator, ...newItems.slice(idx)];
          this.earlierSeparatorInserted = true;
        }
      }
      return newItems;
    }
  }
  function getAppRecServiceConfig() {
    const snap = getSettingsSnapshot().appRecommend;
    let deviceParamForApi = snap.deviceParamForApi;
    if (!Object.values(EAppApiDevice).includes(deviceParamForApi)) {
      deviceParamForApi = EAppApiDevice.ipad;
    }
    return {
      deviceParamForApi,
      addOtherTabContents: snap.addOtherTabContents
    };
  }
  const _AppRecService = class _AppRecService extends BaseTabService {
    constructor(config) {
      super(_AppRecService.PAGE_SIZE);
      __publicField(this, "usageInfo");
      __publicField(this, "innerService");
      __publicField(this, "allServices", []);
      __publicField(this, "otherTabServices", []);
      __publicField(this, "hasMoreExceptQueue", true);
      this.config = config;
      this.innerService = new AppRecInnerService(this.config.deviceParamForApi);
      this.allServices = [this.innerService];
      this.initOtherTabServices();
    }
    initOtherTabServices() {
      if (!getHasLogined()) return;
      if (!this.config.addOtherTabContents) return;
      let dynamicFeedService;
      let favService;
      let watchlaterService;
      {
        const config = Object.assign(getDynamicFeedServiceConfig(), {
          upMid: void 0,
          followGroupTagId: void 0,
          searchText: void 0,
          dynamicFeedVideoType: DynamicFeedVideoType.All,
          hideChargeOnlyVideos: true,
          filterMinDuration: DynamicFeedVideoMinDuration.All,
          filterMinDurationValue: 0,
          selectedKey: DF_SELECTED_KEY_ALL,
          viewingAll: true,
          viewingSomeUp: false,
          viewingSomeGroup: false,
          showLiveInDynamicFeed: true,
          whenViewAllEnableHideSomeContents: false,
          whenViewAllHideIds: /* @__PURE__ */ new Set(),
          advancedSearch: false,
          searchCacheEnabled: false,
          forceUseMergeTime: false,
          startingOffset: void 0,
          minId: void 0,
          minTs: void 0
        });
        dynamicFeedService = new DynamicFeedRecService(config);
      }
      {
        const config = Object.assign(getFavServiceConfig(), {
          selectedKey: "all",
          itemsOrder: FavItemsOrder.Shuffle,
          selectedFavFolderId: void 0,
          selectedFavFolder: void 0,
          selectedFavCollectionId: void 0,
          selectedFavCollection: void 0,
          addSeparator: false
        });
        favService = new FavRecService(config);
      }
      {
        watchlaterService = new WatchLaterRecService(false);
      }
      this.otherTabServices = [dynamicFeedService, favService, watchlaterService];
      const allServices = [];
      const rate = 7 / 3;
      allServices.push(...this.otherTabServices);
      times(Math.round(rate * this.otherTabServices.length), () => allServices.push(this.innerService));
      this.allServices = shuffle(allServices);
    }
    get hasMore() {
      return !!this.qs.bufferQueue.length || this.innerService.hasMore || this.otherTabServices.some((s) => s.hasMore);
    }
    // this is not used, since below `override loadMore`
    fetchMore(abortSignal) {
      throw new Error("Method not implemented.");
    }
    async loadMore(abortSignal) {
      if (!this.hasMore) return;
      while (this.hasMore && this.qs.bufferQueue.length < _AppRecService.PAGE_SIZE * 3) {
        const restServices = this.allServices.filter((s) => s.hasMore);
        if (!restServices.length) break;
        const pickedServices = shuffle(restServices).slice(0, 3);
        const more = (await Promise.all(pickedServices.map(async (s) => await s.loadMore(abortSignal) || []))).flat().filter((x) => x.api !== EApiType.Separator);
        this.qs.bufferQueue.push(...more);
        this.qs.bufferQueue = shuffle(this.qs.bufferQueue);
      }
      return this.qs.sliceFromQueue();
    }
    // for filter
    async loadMoreBatch(abortSignal, times2) {
      if (!this.hasMore) return;
      if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue(times2);
      return this.qs.doReturnItems(await this.innerService.getRecommendTimes(abortSignal, times2));
    }
  };
  __publicField(_AppRecService, "PAGE_SIZE", 20);
  let AppRecService = _AppRecService;
  class AppRecInnerService {
    constructor(deviceParamForApi) {
      __publicField(this, "hasMore", true);
      this.deviceParamForApi = deviceParamForApi;
    }
    async getRecommend(device) {
      var _a2;
      let platformParams = {};
      if (device === EAppApiDevice.android) {
        platformParams = {
          mobi_app: "android"
        };
      }
      if (device === EAppApiDevice.ipad) {
        platformParams = {
          mobi_app: "iphone",
          device: "pad"
        };
      }
      const res = await gmrequest.get(HOST_APP + "/x/v2/feed/index", {
        timeout: 2e4,
        responseType: "json",
        params: {
          build: "1",
          ...platformParams,
          // idx: 返回的 items.idx 为传入 idx+1, idx+2, ...
          idx: Math.floor(Date.now() / 1e3) + randomInt(1e3)
        }
      });
      const json = res.data;
      if (!json.data) {
        throw new Error("Request fail with none invalid json", {
          cause: {
            type: "invalid-json",
            statusCode: res.status,
            json
          }
        });
      }
      const items = ((_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.items) || [];
      return items;
    }
    loadMore(abortSignal, times2 = 2) {
      return this.getRecommendTimes(abortSignal, times2);
    }
    // 一次不够, 多来几次
    async getRecommendTimes(abortSignal, times2) {
      let list = [];
      const parallel = async () => {
        list = (await Promise.all(new Array(times2).fill(0).map(() => this.getRecommend(this.deviceParamForApi)))).flat();
      };
      await parallel();
      list = list.filter((item) => {
        var _a2, _b2;
        if ((_a2 = item.card_goto) == null ? void 0 : _a2.includes("ad")) return false;
        if ((_b2 = item.goto) == null ? void 0 : _b2.includes("ad")) return false;
        if (item.ad_info) return false;
        if (item.card_goto === "banner") return false;
        return true;
      });
      list = uniqBy(list, (item) => item.param);
      const _list = list.map((item) => {
        return {
          ...item,
          api: EApiType.AppRecommend,
          device: this.deviceParamForApi,
          // android | ipad
          uniqId: item.param + "-" + crypto.randomUUID()
        };
      });
      return _list;
    }
  }
  // 无法指定, 16 根据返回得到
  __publicField(AppRecInnerService, "PAGE_SIZE", 16);
  const _PcRecService = class _PcRecService extends BaseTabService {
    constructor(isKeepFollowOnly) {
      super(_PcRecService.PAGE_SIZE);
      __publicField(this, "usageInfo");
      __publicField(this, "page", 0);
      __publicField(this, "hasMoreExceptQueue", true);
      this.isKeepFollowOnly = isKeepFollowOnly;
      this.isKeepFollowOnly = isKeepFollowOnly;
    }
    fetchMore(abortSignal) {
      const times2 = this.isKeepFollowOnly ? 5 : 2;
      return this.getRecommendTimes(times2, abortSignal);
    }
    // for filter
    async loadMoreBatch(times2, abortSignal) {
      if (!this.hasMore) return;
      if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue(times2);
      return this.qs.doReturnItems(await this.getRecommendTimes(times2, abortSignal));
    }
    async getRecommendTimes(times2, abortSignal) {
      let list = [];
      const parallel = async () => {
        list = (await Promise.all(new Array(times2).fill(0).map(() => this.getRecommend(abortSignal)))).flat();
      };
      await parallel();
      list = list.filter((item) => {
        const goto = item.goto;
        if (goto === "ad") return false;
        if (goto.includes("ad")) return false;
        if (goto === "live") return false;
        return true;
      });
      list = uniqBy(list, (item) => item.id);
      list.forEach((item) => {
        var _a2, _b2;
        if (((_a2 = item.rcmd_reason) == null ? void 0 : _a2.reason_type) === 1) {
          (_b2 = item.rcmd_reason).content || (_b2.content = "已关注");
        }
      });
      const _list = list.map((item) => {
        return {
          ...item,
          uniqId: item.id + "-" + crypto.randomUUID(),
          api: EApiType.PcRecommend
        };
      });
      return _list;
    }
    async getRecommend(abortSignal) {
      var _a2, _b2;
      const curpage = ++this.page;
      let url;
      let params;
      url = "/x/web-interface/wbi/index/top/rcmd";
      params = {
        fresh_type: 3,
        version: 1,
        ps: _PcRecService.PAGE_SIZE,
        // >14 errors
        fresh_idx: curpage,
        fresh_idx_1h: curpage,
        homepage_ver: 1
      };
      const res = await request.get(url, {
        signal: abortSignal,
        params
      });
      const json = res.data;
      if (!isWebApiSuccess(json)) {
        if (json.code === -62011 && json.message === "暂时没有更多内容了") {
          this.hasMoreExceptQueue = false;
          return [];
        }
      }
      if (!((_a2 = json.data) == null ? void 0 : _a2.item)) {
        toast(json.message || "API 请求没有返回结果");
      }
      const items = ((_b2 = json.data) == null ? void 0 : _b2.item) || [];
      return items;
    }
  };
  __publicField(_PcRecService, "PAGE_SIZE", 14);
  let PcRecService = _PcRecService;
  const REC_TABS = [ETab.KeepFollowOnly, ETab.PcRecommend, ETab.AppRecommend];
  const createServiceMap = {
    [ETab.AppRecommend]: () => new AppRecService(getAppRecServiceConfig()),
    [ETab.PcRecommend]: () => new PcRecService(false),
    [ETab.KeepFollowOnly]: () => new PcRecService(true),
    [ETab.DynamicFeed]: () => new DynamicFeedRecService(getDynamicFeedServiceConfig()),
    [ETab.Watchlater]: ({
      existingService
    }) => {
      const useShuffle = settings.watchlaterUseShuffle;
      const prevShuffleBvidIndexMap = existingService && existingService instanceof WatchLaterRecService ? existingService.getSnapshot().bvidIndexMap : void 0;
      return new WatchLaterRecService(useShuffle, prevShuffleBvidIndexMap);
    },
    [ETab.Fav]: () => new FavRecService(getFavServiceConfig()),
    [ETab.Hot]: () => new HotRecService(),
    [ETab.Live]: () => new LiveRecService()
  };
  function getServiceFromRegistry(servicesRegistry, tab2) {
    const service = servicesRegistry.val[tab2];
    invariant(service, `servicesRegistry.val[tab=${tab2}] should not be nil`);
    return service;
  }
  const debug$5 = baseDebug.extend("service");
  const recItemUniqer = (item) => item.api === EApiType.Separator ? item.uniqId : lookinto(item, {
    [EApiType.AppRecommend]: (item2) => item2.param,
    [EApiType.PcRecommend]: (item2) => item2.bvid,
    [EApiType.DynamicFeed]: (item2) => item2.modules.module_dynamic.major.archive.bvid,
    [EApiType.Watchlater]: (item2) => item2.bvid,
    [EApiType.Fav]: (item2) => item2.bvid,
    [EApiType.PopularGeneral]: (item2) => item2.bvid,
    [EApiType.PopularWeekly]: (item2) => item2.bvid,
    [EApiType.Ranking]: (item2) => item2.uniqId,
    [EApiType.Live]: (item2) => item2.roomid
  });
  function concatThenUniq(existing, newItems) {
    return uniqBy([...existing, ...newItems], recItemUniqer);
  }
  const usePcApi = (tab2) => tab2 === ETab.PcRecommend || tab2 === ETab.KeepFollowOnly;
  async function fetchMinCount(count, fetcherOptions, filterMultiplier = 5) {
    const {
      tab: tab2,
      abortSignal,
      servicesRegistry
    } = fetcherOptions;
    let items = [];
    let hasMore = true;
    const addMore = async (restCount) => {
      let cur = [];
      if (!REC_TABS.includes(tab2)) {
        const service = getServiceFromRegistry(servicesRegistry, tab2);
        cur = await service.loadMore(abortSignal) || [];
        hasMore = service.hasMore;
        cur = filterRecItems(cur, tab2);
        items = concatThenUniq(items, cur);
        return;
      }
      let times2;
      if (tab2 === ETab.KeepFollowOnly) {
        times2 = 8;
        debug$5("getMinCount: addMore(restCount = %s) times=%s", restCount, times2);
      } else {
        const pagesize = usePcApi(tab2) ? PcRecService.PAGE_SIZE : AppRecService.PAGE_SIZE;
        const multipler = anyFilterEnabled(tab2) ? filterMultiplier : 1.2;
        times2 = Math.ceil(restCount * multipler / pagesize);
        debug$5("getMinCount: addMore(restCount = %s) multipler=%s pagesize=%s times=%s", restCount, multipler, pagesize, times2);
      }
      if (usePcApi(tab2)) {
        const service = getServiceFromRegistry(servicesRegistry, tab2);
        cur = await service.loadMoreBatch(times2, abortSignal) || [];
        hasMore = service.hasMore;
      } else {
        const service = getServiceFromRegistry(servicesRegistry, ETab.AppRecommend);
        cur = await (service.config.addOtherTabContents ? service.loadMore(abortSignal) : service.loadMoreBatch(abortSignal, times2)) || [];
        hasMore = service.hasMore;
      }
      cur = filterRecItems(cur, tab2);
      items = concatThenUniq(items, cur);
    };
    await addMore(count);
    while (true) {
      if (abortSignal == null ? void 0 : abortSignal.aborted) {
        debug$5("getMinCount: break for abortSignal");
        break;
      }
      if (!hasMore) {
        debug$5("getMinCount: break for tab=%s hasMore=false", tab2);
        break;
      }
      const len = items.filter((x) => x.api !== EApiType.Separator).length;
      if (len >= count) break;
      await addMore(count - items.length);
    }
    return items;
  }
  async function refreshForHome(fetcherOptions) {
    let items = await fetchMinCount(getColumnCount(void 0, false) * 2, fetcherOptions, 5);
    if (fetcherOptions.tab === ETab.Watchlater) {
      items = items.slice(0, 20);
    }
    return items;
  }
  const getGridRefreshCount = () => getColumnCount() * 4;
  async function refreshForGrid(fetcherOptions) {
    let minCount = getGridRefreshCount();
    if (fetcherOptions.tab === ETab.DynamicFeed) {
      const service = getServiceFromRegistry(fetcherOptions.servicesRegistry, ETab.DynamicFeed);
      if (typeof service.followGroupTagId !== "undefined" || // 选择了分组 & 分组很少更新, TODO: 考虑 merge-timeline
      // 过滤结果可能比较少
      service.searchText || service.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly || service.filterMinDuration !== DynamicFeedVideoMinDuration.All) {
        minCount = 1;
      }
    }
    return fetchMinCount(minCount, fetcherOptions, 5);
  }
  var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
  var __typeError2 = (msg) => {
    throw TypeError(msg);
  };
  var __using = (stack, value, async) => {
    if (value != null) {
      if (typeof value !== "object" && typeof value !== "function") __typeError2("Object expected");
      var dispose, inner;
      dispose = value[__knownSymbol("asyncDispose")];
      if (dispose === void 0) {
        dispose = value[__knownSymbol("dispose")];
        inner = dispose;
      }
      if (typeof dispose !== "function") __typeError2("Object not disposable");
      if (inner) dispose = function() {
        try {
          inner.call(this);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      stack.push([async, dispose, value]);
    } else {
      stack.push([async]);
    }
    return value;
  };
  var __callDispose = (stack, error, hasError) => {
    var E = typeof SuppressedError === "function" ? SuppressedError : function(e, s, m, _) {
      return _ = Error(m), _.name = "SuppressedError", _.error = e, _.suppressed = s, _;
    };
    var fail = (e) => error = hasError ? new E(e, error, "An error was suppressed during disposal") : (hasError = true, e);
    var next2 = (it) => {
      while (it = stack.pop()) {
        try {
          var result = it[1] && it[1].call(it[2]);
          if (it[0]) return Promise.resolve(result).then(next2, (e) => (fail(e), next2()));
        } catch (e) {
          fail(e);
        }
      }
      if (hasError) throw error;
    };
    return next2();
  };
  const OnRefreshContext = React.createContext(void 0);
  function useOnRefreshContext() {
    return React.useContext(OnRefreshContext);
  }
  function useRefresh({
    tab: tab2,
    servicesRegistry,
    debug: debug2,
    fetcher,
    preAction,
    postAction,
    onUpdateRefreshing
  }) {
    const hasMoreBox = useRefStateBox(true);
    const itemsBox = useRefStateBox([]);
    React.useEffect(() => {
      setGlobalGridItems(itemsBox.state);
    }, [itemsBox.state]);
    const refreshingBox = useRefStateBox(false);
    const refreshTsBox = useRefStateBox(() => Date.now());
    const [refreshAbortController, setRefreshAbortController] = React.useState(() => new AbortController());
    const [showSkeleton, setShowSkeleton] = React.useState(false);
    const [error, setError] = React.useState(void 0);
    const [beforeMount, setBeforeMount] = React.useState(true);
    useMount(() => {
      setBeforeMount(false);
      refresh(true);
    });
    useUnmount(() => {
      refreshAbortController.abort();
    });
    const refresh = useMemoizedFn(async (reuse = false) => {
      var _stack = [];
      try {
        const start = performance.now();
        const stack = __using(_stack, new AsyncDisposableStack(), true);
        const serviceMap = servicesRegistry.val;
        const refreshing = refreshingBox.val;
        if (refreshing) {
          let s;
          const debugSameTabConditionsChange = () => {
            debug2("refresh(): tab=%s [start], current refreshing, sametab but conditions change, abort existing", tab2);
          };
          if (tab2 === ETab.DynamicFeed && (s = serviceMap[ETab.DynamicFeed]) && !isEqual(s.config, getDynamicFeedServiceConfig())) {
            debugSameTabConditionsChange();
            refreshAbortController.abort();
          } else if (tab2 === ETab.Fav && (s = serviceMap[ETab.Fav]) && !isEqual(s.config, getFavServiceConfig())) {
            debugSameTabConditionsChange();
            refreshAbortController.abort();
          } else if (tab2 === ETab.Hot && (s = serviceMap[ETab.Hot]) && s.subtab !== hotStore.subtab) {
            debug2("refresh(): tab=%s [start], current refreshing, sametab but subtab changed, abort existing", tab2);
            refreshAbortController.abort();
          } else {
            debug2("refresh() tab=%s [start], current refreshing, prevent same tab refresh()", tab2);
            return;
          }
        } else {
          debug2("refresh(): tab=%s [start]", tab2);
        }
        const updateRefreshing = (val) => {
          refreshingBox.set(val);
          onUpdateRefreshing == null ? void 0 : onUpdateRefreshing(val);
        };
        refreshTsBox.set(Date.now());
        updateRefreshing(true);
        setError(void 0);
        itemsBox.set([]);
        hasMoreBox.set(true);
        stack.defer(() => {
          updateRefreshing(false);
          hasMoreBox.set(getServiceFromRegistry(servicesRegistry, tab2).hasMore);
        });
        await (preAction == null ? void 0 : preAction());
        const _abortController = new AbortController();
        const _signal = _abortController.signal;
        setRefreshAbortController(_abortController);
        const onError = (err) => {
          updateRefreshing(false);
          console.error(err);
          setError(err);
        };
        const doFetch = async () => {
          let currentItems = [];
          let err;
          const fetcherOptions = {
            tab: tab2,
            abortSignal: _signal,
            servicesRegistry
          };
          try {
            currentItems = await fetcher(fetcherOptions);
          } catch (e) {
            err = e;
          }
          if (err) return onError(err);
          itemsBox.set(currentItems);
          return true;
        };
        let willRefresh;
        const existingService = reuse ? servicesRegistry.val[tab2] : void 0;
        if (existingService) {
          existingService.restore();
          itemsBox.set(existingService.qs.bufferQueue.slice(0, getGridRefreshCount()));
          const success = !!await doFetch();
          willRefresh = success && !!TabConfig[tab2].swr;
        } else {
          setShowSkeleton(true);
          stack.defer(() => {
            setShowSkeleton(false);
          });
          willRefresh = true;
        }
        if (willRefresh) {
          const [err, service] = tryit(() => createServiceMap[tab2]({
            existingService
          }))();
          if (err) {
            onError(err);
          } else {
            servicesRegistry.set({
              ...servicesRegistry.val,
              [tab2]: service
            });
            await doFetch();
          }
        }
        await (postAction == null ? void 0 : postAction());
        const cost = performance.now() - start;
        debug2("refresh(): tab=%s [success] cost %s ms", tab2, cost.toFixed(0));
      } catch (_) {
        var _error = _, _hasError = true;
      } finally {
        var _promise = __callDispose(_stack, _error, _hasError);
        _promise && await _promise;
      }
    });
    return {
      itemsBox,
      error,
      refresh,
      hasMoreBox,
      refreshingBox,
      refreshTsBox,
      refreshAbortController,
      showSkeleton,
      beforeMount
    };
  }
  const clsIconTextWrapper = "inline-flex items-center justify-center line-height-[0]";
  function withDescIcon(label) {
    return /* @__PURE__ */ jsxs("span", { className: clsx(clsIconTextWrapper, "gap-1px"), children: [
      label,
      /* @__PURE__ */ jsx$1(IconForDesc, { ...size(16) })
    ] });
  }
  function withAscIcon(label) {
    return /* @__PURE__ */ jsxs("span", { className: clsx(clsIconTextWrapper, "gap-1px"), children: [
      label,
      /* @__PURE__ */ jsx$1(IconForAsc, { ...size(16) })
    ] });
  }
  const clsIconSize = "size-16px";
  const FavItemsOrderConfig = {
    [FavItemsOrder.Default]: {
      icon: /* @__PURE__ */ jsx$1(IconForDefaultOrder, { className: clsIconSize }),
      label: "默认顺序"
    },
    [FavItemsOrder.Shuffle]: {
      icon: /* @__PURE__ */ jsx$1(IconForShuffle, { className: clsIconSize }),
      label: "随机顺序"
    },
    [FavItemsOrder.PubTimeDesc]: {
      icon: /* @__PURE__ */ jsx$1(IconForTimestamp, { className: clsIconSize }),
      label: withDescIcon("最新投稿")
    },
    [FavItemsOrder.PubTimeAsc]: {
      icon: /* @__PURE__ */ jsx$1(IconForTimestamp, { className: clsIconSize }),
      label: withAscIcon("最早投稿")
    },
    [FavItemsOrder.PlayCountDesc]: {
      icon: /* @__PURE__ */ jsx$1(IconForPlayer, { className: clsIconSize }),
      label: withDescIcon("最多播放")
    },
    [FavItemsOrder.CollectCountDesc]: {
      icon: /* @__PURE__ */ jsx$1(IconForFav, { className: clsx(clsIconSize, "mt--1px") }),
      label: withDescIcon("最多收藏")
    },
    [FavItemsOrder.FavTimeDesc]: {
      icon: /* @__PURE__ */ jsx$1(IconForFav, { className: clsx(clsIconSize, "mt--1px") }),
      label: withDescIcon("最近收藏")
    },
    [FavItemsOrder.FavTimeAsc]: {
      icon: /* @__PURE__ */ jsx$1(IconForFav, { className: clsx(clsIconSize, "mt--1px") }),
      label: withAscIcon("最早收藏")
    }
  };
  const MenuItemsConfig = {
    "all": [FavItemsOrder.Default, FavItemsOrder.Shuffle],
    "fav-folder": [FavItemsOrder.FavTimeDesc, FavItemsOrder.PubTimeDesc, FavItemsOrder.PlayCountDesc, FavItemsOrder.CollectCountDesc, "divider", FavItemsOrder.FavTimeAsc, FavItemsOrder.PubTimeAsc, "divider", FavItemsOrder.Shuffle],
    "fav-collection": [FavItemsOrder.Default, FavItemsOrder.PubTimeDesc, FavItemsOrder.PlayCountDesc, FavItemsOrder.CollectCountDesc, "divider", FavItemsOrder.PubTimeAsc, "divider", FavItemsOrder.Shuffle]
  };
  function getMenuItemsFor(selectedKey) {
    const prefix2 = selectedKey.split(":")[0];
    return MenuItemsConfig[prefix2] || Object.values(FavItemsOrder);
  }
  function useDropdownMenus({
    selectedKey,
    onRefresh
  }) {
    return React.useMemo(() => {
      const orders = getMenuItemsFor(selectedKey);
      return defineAntMenus(orders.map((x) => {
        if (x === "divider") return {
          type: "divider"
        };
        const {
          icon,
          label
        } = FavItemsOrderConfig[x];
        return {
          key: x,
          icon,
          label,
          async onClick() {
            favStore.savedOrderMap.set(selectedKey, x);
            await delay(100);
            onRefresh == null ? void 0 : onRefresh();
          }
        };
      }));
    }, [selectedKey, onRefresh]);
  }
  function _getFallbackOrder(selectedKey) {
    if (selectedKey.startsWith("fav-folder:")) return FavItemsOrder.FavTimeDesc;
    return FavItemsOrder.Default;
  }
  function getSavedOrder(selectedKey, savedOrderMap) {
    const allowed = getMenuItemsFor(selectedKey).filter((x) => x !== "divider");
    const current = savedOrderMap.get(selectedKey) || _getFallbackOrder(selectedKey);
    if (allowed.includes(current)) return current;
    return _getFallbackOrder(selectedKey);
  }
  function useSavedOrder(selectedKey, savedOrderMap) {
    return React.useMemo(() => getSavedOrder(selectedKey, savedOrderMap), [savedOrderMap, selectedKey]);
  }
  const clsMenuRoot = styled.createClass`
  .ant-dropdown &.ant-dropdown-menu .ant-dropdown-menu-item {
    font-size: 13px; // same as Button
    justify-content: flex-start;
    .ant-dropdown-menu-title-content {
      flex-shrink: 0;
    }
  }
`;
  function FavItemsOrderSwitcher() {
    const onRefresh = useOnRefreshContext();
    const {
      selectedKey,
      savedOrderMap
    } = useSnapshot(favStore);
    const {
      ref,
      getPopupContainer
    } = usePopupContainer();
    const current = useSavedOrder(selectedKey, savedOrderMap);
    const {
      icon,
      label
    } = FavItemsOrderConfig[current];
    const onToggle = useMemoizedFn(async (e) => {
      const allowed = getMenuItemsFor(selectedKey).filter((x) => x !== "divider");
      const index = allowed.indexOf(current);
      if (index === -1) return;
      const nextIndex = (index + (e.shiftKey ? -1 : 1) + allowed.length) % allowed.length;
      const next2 = allowed[nextIndex];
      favStore.savedOrderMap.set(selectedKey, next2);
      await delay(100);
      onRefresh == null ? void 0 : onRefresh();
    });
    const dropdownMenuItems = useDropdownMenus({
      selectedKey,
      onRefresh
    });
    const dropdownStyle = {
      // width: 'max-content',
      overscrollBehavior: "contain",
      border: `1px solid ${usePopoverBorderColor()}`
    };
    const [open, setOpen] = React.useState(false);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(
        antd.Dropdown,
        {
          open,
          onOpenChange: setOpen,
          getPopupContainer,
          menu: {
            items: dropdownMenuItems,
            style: dropdownStyle,
            className: clsMenuRoot,
            selectedKeys: [current]
          },
          placement: "bottomRight",
          children: /* @__PURE__ */ jsx$1(antd.Button, { ref, onClick: onToggle, css: [open && buttonOpenCss, "", ""], icon, className: "gap-8px px-16px", children: label })
        }
      ),
      /* @__PURE__ */ jsxs(HelpInfo, { children: [
        "1. 点击/下拉切换 ",
        /* @__PURE__ */ jsx$1("br", {}),
        "2. 按住 ",
        /* @__PURE__ */ jsx$1("kbd", { children: "Shift" }),
        " 键点击逆序切换 ",
        /* @__PURE__ */ jsx$1("br", {})
      ] })
    ] });
  }
  const UserFavService = {
    removeFav,
    addFav,
    getVideoFavState
  };
  async function removeFav(folderId, resource) {
    const form = new URLSearchParams({
      resources: resource,
      media_id: folderId.toString(),
      platform: "web",
      csrf: getCsrfToken()
    });
    const res = await request.post("/x/v3/fav/resource/batch-del", form);
    const json = res.data;
    const success = isWebApiSuccess(json);
    if (!success) {
      toast(json.message || OPERATION_FAIL_MSG);
    }
    return success;
  }
  async function getVideoFavState(avid) {
    if (!getHasLogined()) return;
    const res = await request.get("/x/v3/fav/folder/created/list-all", {
      params: {
        up_mid: getUid(),
        type: 2,
        rid: avid
      }
    });
    const json = res.data;
    const favFolders = json.data.list.filter((folder) => folder.fav_state > 0);
    const favFolderNames = favFolders.map((f) => f.title);
    const favFolderUrls = favFolders.map((f) => formatFavFolderUrl(f.id));
    return {
      favFolders,
      favFolderNames,
      favFolderUrls
    };
  }
  async function favDeal({
    avid,
    add_media_ids = "",
    del_media_ids = ""
  }) {
    const form = new URLSearchParams({
      rid: avid.toString(),
      type: "2",
      add_media_ids,
      del_media_ids,
      platform: "web",
      eab_x: "2",
      ramval: "0",
      ga: "1",
      gaia_source: "web_normal",
      csrf: getCsrfToken()
    });
    const res = await request.post("/x/v3/fav/resource/deal", form);
    const json = res.data;
    const success = isWebApiSuccess(json);
    if (!success) {
      toast((json == null ? void 0 : json.message) || "fav deal api fail");
    }
    return success;
  }
  let defaultFavFolderId = 0;
  let defaultFavFolderName = "";
  async function addFav(avid) {
    if (!defaultFavFolderId || !defaultFavFolderName) {
      const folders = await fetchFavFolder();
      defaultFavFolderId = folders[0].id;
      defaultFavFolderName = folders[0].title;
    }
    return await favDeal({
      avid,
      add_media_ids: defaultFavFolderId.toString()
    });
  }
  async function fetchFavFolder() {
    const res = await request.get("/x/v3/fav/folder/created/list-all", {
      params: {
        up_mid: getUid()
      }
    });
    const json = res.data;
    const folders = json.data.list;
    return folders;
  }
  const debug$4 = baseDebug.extend("modules:rec-services:fav:store");
  var FavSearchParamsKey = /* @__PURE__ */ ((FavSearchParamsKey2) => {
    FavSearchParamsKey2["CollectionIdFull"] = "fav-collection-id";
    FavSearchParamsKey2["CollectionId"] = "fav-cid";
    FavSearchParamsKey2["FolderIdFull"] = "fav-folder-id";
    FavSearchParamsKey2["FolderId"] = "fav-fid";
    return FavSearchParamsKey2;
  })(FavSearchParamsKey || {});
  const parseId = (text) => {
    if (!text) return;
    const num = Number(text);
    if (isNaN(num)) return;
    return num;
  };
  const searchParams = new URLSearchParams(location.search);
  const QUERY_FAV_COLLECTION_ID = parseId(searchParams.get(
    "fav-collection-id"
    /* CollectionIdFull */
  ) ?? searchParams.get(
    "fav-cid"
    /* CollectionId */
  ));
  const QUERY_FAV_FOLDER_ID = parseId(searchParams.get(
    "fav-folder-id"
    /* FolderIdFull */
  ) ?? searchParams.get(
    "fav-fid"
    /* FolderId */
  ));
  const SHOW_FAV_TAB_ONLY = typeof QUERY_FAV_FOLDER_ID === "number" || typeof QUERY_FAV_COLLECTION_ID === "number";
  const favStore = proxy({
    // methods
    updateList,
    favFolders: [],
    favFoldersUpdateAt: 0,
    selectedFavFolderId: QUERY_FAV_FOLDER_ID,
    get selectedFavFolder() {
      if (typeof this.selectedFavFolderId !== "number") return;
      return this.favFolders.find((x) => x.id === this.selectedFavFolderId);
    },
    favCollections: [],
    favCollectionsUpdateAt: 0,
    selectedFavCollectionId: QUERY_FAV_COLLECTION_ID,
    selectedFavCollectionDetailInfo: void 0,
    get selectedFavCollection() {
      if (typeof this.selectedFavCollectionId !== "number") return;
      return this.favCollections.find((x) => x.id === this.selectedFavCollectionId);
    },
    get selectedKey() {
      let prefix2;
      let id;
      if (typeof this.selectedFavFolderId !== "undefined") {
        prefix2 = "fav-folder";
        id = this.selectedFavFolderId;
      } else if (typeof this.selectedFavCollectionId !== "undefined") {
        prefix2 = "fav-collection";
        id = this.selectedFavCollectionId;
      } else {
        return "all";
      }
      return `${prefix2}:${id}`;
    },
    get selectedLabel() {
      if (this.selectedFavFolder) {
        return `${this.selectedFavFolder.title} (${this.selectedFavFolder.media_count})`;
      }
      if (typeof this.selectedFavCollectionId === "number") {
        if (this.selectedFavCollection) {
          return `${this.selectedFavCollection.title} (${this.selectedFavCollection.media_count})`;
        }
        const info = this.selectedFavCollectionDetailInfo;
        if ((info == null ? void 0 : info.id) === this.selectedFavCollectionId) {
          return `${info.title} (${info.media_count})`;
        }
        return;
      }
      return "全部";
    },
    // 保存的顺序
    savedOrderMap: (await( proxyMapWithGmStorage("fav-saved-order"))).map,
    get usingShuffle() {
      const curret = getSavedOrder(this.selectedKey, this.savedOrderMap);
      return curret === FavItemsOrder.Shuffle;
    }
  });
  function updateFavFolderMediaCount(targetFavFolderId, count) {
    const folder = favStore.favFolders.find((x) => x.id === targetFavFolderId);
    if (!folder) return;
    const newCount = typeof count === "function" ? count(folder.media_count) : count;
    if (newCount !== folder.media_count) {
      folder.media_count = newCount;
      debug$4("update folder(id=%s title=%s) media_count to %s", folder.id, folder.title, newCount);
    }
  }
  async function updateList(force = false) {
    return Promise.all([updateFolderList(force), updateCollectionList(force)]);
  }
  const updateFolderList = createUpdateDataFunction({
    async fn(force) {
      const folders = await fetchFavFolder();
      favStore.favFolders = folders;
      favStore.favFoldersUpdateAt = Date.now();
      return favStore.favFolders;
    },
    async getCached(force = false) {
      if (force) return;
      const {
        favFolders,
        favFoldersUpdateAt
      } = favStore;
      if (favFolders.length && favFoldersUpdateAt && Date.now() - favFoldersUpdateAt < ms("5min")) {
        return favFolders;
      }
    }
  });
  const updateCollectionList = createUpdateDataFunction({
    async fn(force) {
      const collections = await fetchAllFavCollections();
      favStore.favCollections = collections;
      favStore.favCollectionsUpdateAt = Date.now();
      return favStore.favCollections;
    },
    async getCached(force = false) {
      if (force) return;
      const {
        favCollections,
        favCollectionsUpdateAt
      } = favStore;
      if (favCollections.length && favCollectionsUpdateAt && Date.now() - favCollectionsUpdateAt < ms("5min")) {
        return favCollections;
      }
    }
  });
  if (SHOW_FAV_TAB_ONLY && QUERY_FAV_FOLDER_ID) {
    await( updateFolderList());
  }
  const videoSourceTabState = await( proxyWithGmStorage({
    value: ETab.AppRecommend
  }, `video-source-tab`));
  if (QUERY_DYNAMIC_UP_MID && videoSourceTabState.value !== ETab.DynamicFeed) {
    videoSourceTabState.value = ETab.DynamicFeed;
  }
  if (SHOW_FAV_TAB_ONLY && videoSourceTabState.value !== ETab.Fav) {
    videoSourceTabState.value = ETab.Fav;
  }
  function getSortedTabKeys(customTabKeysOrder) {
    return TabKeys.slice().sort((a, b) => {
      let aIndex = customTabKeysOrder.indexOf(a);
      let bIndex = customTabKeysOrder.indexOf(b);
      if (aIndex === -1) aIndex = TabKeys.indexOf(a);
      if (bIndex === -1) bIndex = TabKeys.indexOf(b);
      return aIndex - bIndex;
    });
  }
  function useSortedTabKeys() {
    const {
      customTabKeysOrder
    } = useSettingsSnapshot();
    return React.useMemo(() => getSortedTabKeys(customTabKeysOrder), [customTabKeysOrder]);
  }
  function useCurrentDisplayingTabKeys() {
    const {
      hidingTabKeys,
      customTabKeysOrder
    } = useSettingsSnapshot();
    const logined = useHasLogined();
    const keys = React.useMemo(() => {
      const tabkeys = getSortedTabKeys(customTabKeysOrder);
      return tabkeys.filter((key) => {
        if (key === ETab.AppRecommend && !logined) {
          return true;
        }
        if (key === ETab.DynamicFeed && QUERY_DYNAMIC_UP_MID) {
          return true;
        }
        if (key === ETab.Fav && SHOW_FAV_TAB_ONLY) {
          return true;
        }
        return !hidingTabKeys.includes(key);
      });
    }, [hidingTabKeys, customTabKeysOrder, logined]);
    if (QUERY_DYNAMIC_UP_MID && keys.includes(ETab.DynamicFeed)) {
      return [ETab.DynamicFeed];
    }
    if (SHOW_FAV_TAB_ONLY && keys.includes(ETab.Fav)) {
      return [ETab.Fav];
    }
    return keys;
  }
  function useCurrentDisplayingTabConfigList() {
    const keys = useCurrentDisplayingTabKeys();
    return React.useMemo(() => keys.map((key) => ({
      key,
      ...TabConfig[key]
    })), [keys]);
  }
  function useCurrentUsingTab() {
    const tab2 = useSnapshot(videoSourceTabState).value;
    const displayTabKeys = useCurrentDisplayingTabKeys();
    const logined = useHasLogined();
    const fallbackTab = ETab.AppRecommend;
    if (!displayTabKeys.includes(tab2)) return fallbackTab;
    if (!logined) {
      if (!TabConfig[tab2].anonymousUsage) {
        return fallbackTab;
      }
    }
    return tab2;
  }
  const iconCss = {
    name: "qamjgr",
    styles: "margin-right:4px"
  };
  const radioBtnCss = {
    name: "1dwyqh0",
    styles: "height:26px;line-height:unset;&:has(:focus-visible){outline:none;outline-offset:unset;}>.ant-radio-button+span{height:100%;}"
  };
  const radioBtnStandardCss = {
    name: "s0vnfv",
    styles: "height:32px"
  };
  var _ref$k = {
    name: "shwixj",
    styles: "display:flex;align-items:center;height:22px"
  };
  var _ref2$g = {
    name: "1k4kcw8",
    styles: "display:flex;align-items:center;line-height:unset;height:100%"
  };
  var _ref3$b = {
    name: "iiaypl",
    styles: "display:inline-flex;align-items:center;overflow:hidden"
  };
  function VideoSourceTab({
    onRefresh
  }) {
    const logined = useHasLogined();
    const tab2 = useCurrentUsingTab();
    const {
      videoSourceTabStandardHeight
    } = useSnapshot(settings.style.general);
    const currentTabConfigList = useCurrentDisplayingTabConfigList();
    return /* @__PURE__ */ jsxs("div", { css: flexVerticalCenterStyle, children: [
      /* @__PURE__ */ jsx$1(antd.Radio.Group, { optionType: "button", buttonStyle: "solid", size: "middle", value: tab2, css: _ref3$b, onFocus: (e) => {
        const target = e.target;
        target.blur();
      }, onChange: async (e) => {
        const newValue = e.target.value;
        if (!logined) {
          if (!TabConfig[newValue].anonymousUsage) {
            if (!checkLoginStatus()) {
              return toastNeedLogin();
            }
          }
        }
        videoSourceTabState.value = newValue;
      }, children: currentTabConfigList.map(({
        key,
        label
      }) => /* @__PURE__ */ jsx$1(
        antd.Radio.Button,
        {
          css: [radioBtnCss, videoSourceTabStandardHeight && radioBtnStandardCss, "", ""],
          className: "video-source-tab",
          tabIndex: -1,
          value: key,
          children: /* @__PURE__ */ jsxs("span", { css: _ref2$g, children: [
            /* @__PURE__ */ jsx$1(TabIcon, { tabKey: key, moreCss: iconCss, active: key === tab2 }),
            label
          ] })
        },
        key
      )) }),
      /* @__PURE__ */ jsx$1(HelpInfo, { className: "size-16px ml-6px", children: /* @__PURE__ */ jsx$1(Fragment, { children: currentTabConfigList.map(({
        key,
        label,
        desc
      }) => /* @__PURE__ */ jsxs("div", { css: _ref$k, children: [
        /* @__PURE__ */ jsx$1(TabIcon, { tabKey: key, moreCss: iconCss, active: true }),
        label,
        ": ",
        desc
      ] }, key)) }) })
    ] });
  }
  function useMittOn(emitter2, type, handler) {
    const fn = useMemoizedFn(handler);
    React.useEffect(() => {
      emitter2.on(type, fn);
      return () => {
        emitter2.off(type, fn);
      };
    }, [emitter2]);
  }
  var _ref$j = {
    name: "10vwvoh",
    styles: "display:block;width:100%;height:100%;object-fit:inherit"
  };
  var _ref2$f = {
    name: "4uwt2b",
    styles: "width:100%;height:100%;object-fit:cover"
  };
  function Picture({
    src,
    avif,
    webp,
    imgProps,
    ...props
  }) {
    avif ?? (avif = !isSafari);
    webp ?? (webp = true);
    return /* @__PURE__ */ jsxs("picture", { css: _ref2$f, ...props, children: [
      avif && /* @__PURE__ */ jsx$1("source", { srcSet: `${src}.avif`, type: "image/avif" }),
      webp && /* @__PURE__ */ jsx$1("source", { srcSet: `${src}.webp`, type: "image/webp" }),
      /* @__PURE__ */ jsx$1("img", { src, loading: "lazy", css: _ref$j, ...imgProps })
    ] });
  }
  const c = tweakLightness(colorPrimaryValue, 0.1);
  const borderAndShadow = /* @__PURE__ */ css("border-color:", c, ";box-shadow:0px 0px 9px 4px ", c, ";", "");
  const coverZoom = {
    name: "dj03ws",
    styles: ".bili-video-card__cover{transform-origin:center center;transition:transform 0.2s ease-out;transform:scale(1.05);}"
  };
  function useInNormalCardCss(showingInNormalCard) {
    const sepIdentifier = `--${APP_NAMESPACE}-separator-color`;
    return React.useMemo(() => {
      if (!showingInNormalCard) return void 0;
      return css`
      border-color: ${borderColorValue};

      background-color: ${bgValue};
      ${sepIdentifier}:  ${bgLv1Value};
      &:hover {
        background-color: ${bgLv1Value};
        ${sepIdentifier}: ${bgLv2Value};
      }

      /* disable padding */
      margin-inline: 0;
      .bili-video-card__wrap {
        padding: 0;
      }
    `;
    }, [showingInNormalCard]);
  }
  var _ref$i = {
    name: "1ytxauw",
    styles: "margin-inline:-6px;.bili-video-card__wrap{padding:6px;padding-bottom:0;}"
  };
  var _ref2$e = {
    name: "7dle4o",
    styles: "border:1px solid transparent;transition-property:border-color,box-shadow,background-color;transition-duration:0.3s;transition-timing-function:ease-in-out"
  };
  function useCardBorderCss() {
    const {
      useDelayForHover,
      style: {
        videoCard: {
          useBorder,
          useBorderOnlyOnHover,
          useBoxShadow,
          usePadding
        }
      }
    } = useSettingsSnapshot();
    return React.useMemo(() => {
      return [_ref2$e, useBorder && [
        /* @__PURE__ */ css("cursor:pointer;border-radius:", videoCardBorderRadiusValue, ";&:hover{border-color:", borderColorValue, ";background-color:", bgLv1Value, ";", useBoxShadow && borderAndShadow, " ", useDelayForHover && coverZoom, ";}", ""),
        !useBorderOnlyOnHover && /* @__PURE__ */ css("border-color:", borderColorValue, ";", ""),
        // add padding & negative margin
        useBorderOnlyOnHover && !useBoxShadow && usePadding && _ref$i
      ]];
    }, [useBorder, useBorderOnlyOnHover, useBoxShadow, usePadding, useDelayForHover]);
  }
  function getActiveCardBorderCss(active) {
    return active && /* @__PURE__ */ css("border-radius:", videoCardBorderRadiusValue, ";", borderAndShadow, ";", "");
  }
  const S$5 = {
    previewCardWrapper: /* @__PURE__ */ css("position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;pointer-events:none;border-top-left-radius:", videoCardBorderRadiusValue, ";border-top-right-radius:", videoCardBorderRadiusValue, ";border-bottom-left-radius:0;border-bottom-right-radius:0;", ""),
    previewCardInner: {
      name: "w1atjl",
      styles: "width:100%;height:100%"
    }
  };
  function fallbackWhenNan(...args) {
    for (const num of args) {
      if (isNaN(num)) continue;
      return num;
    }
    return 0;
  }
  const PreviewImage = React.memo(React.forwardRef(function({
    progress,
    t,
    videoDuration,
    pvideo,
    mouseEnterRelativeX,
    className,
    ...restProps
  }, ref) {
    const divRef = React.useRef(null);
    const cursorState = useMouse(divRef);
    const [size2, setSize] = React.useState(() => ({
      width: 0,
      height: 0
    }));
    useMount(() => {
      var _a2;
      const rect = (_a2 = divRef.current) == null ? void 0 : _a2.getBoundingClientRect();
      if (!rect) return;
      setSize({
        width: rect.width,
        height: rect.height
      });
    });
    const usingProgress = React.useMemo(() => {
      let ret = 0;
      if (typeof progress === "number") {
        ret = progress;
      } else {
        const relativeX = fallbackWhenNan(cursorState.elementX, mouseEnterRelativeX || 0);
        if (size2.width && relativeX && !isNaN(relativeX)) {
          ret = relativeX / size2.width;
        }
      }
      if (ret < 0) ret = 0;
      if (ret > 1) ret = 1;
      return ret;
    }, [progress, cursorState.elementX, mouseEnterRelativeX, size2.width]);
    const usingT = React.useMemo(() => t ?? Math.floor((videoDuration || 0) * usingProgress), [t, videoDuration, usingProgress]);
    const __getTDirect = useMemoizedFn(() => usingT);
    useMemoizedFn(() => {
      const arr2 = (pvideo == null ? void 0 : pvideo.index) || [];
      const index = calcIndex(arr2, usingT) ?? -1;
      if (index === -1) return;
      return arr2[index];
    });
    React.useImperativeHandle(ref, () => {
      return {
        getT: __getTDirect
      };
    }, [__getTDirect]);
    const innerProps = {
      progress: usingProgress,
      t: usingT,
      pvideo,
      elWidth: size2.width,
      elHeight: size2.height
    };
    return /* @__PURE__ */ jsx$1("div", { ...restProps, ref: divRef, className: clsx(previewCardWrapper, className), css: S$5.previewCardWrapper, children: !!(pvideo && size2.width && size2.height && usingProgress) && /* @__PURE__ */ jsx$1(PreviewImageInner, { ...innerProps }) });
  }));
  const PreviewImageInner = React.memo(function PreviewImageInner2({
    t,
    progress,
    pvideo,
    elWidth,
    elHeight
  }) {
    var _a2;
    let index = React.useMemo(() => {
      return calcIndex((pvideo == null ? void 0 : pvideo.index) || [], t) ?? 0;
    }, [pvideo, t]);
    const {
      img_x_len: colCount,
      img_y_len: rowCount,
      img_x_size: w,
      img_y_size: h
    } = pvideo;
    const countPerPreview = rowCount * colCount;
    index = index + 1;
    const snapshotIndex = Math.floor(index / countPerPreview);
    const indexInSnapshot = index - snapshotIndex * countPerPreview;
    const snapshotUrl = ((_a2 = pvideo.image) == null ? void 0 : _a2[snapshotIndex]) || "";
    const indexRow = Math.floor(indexInSnapshot / colCount) + 1;
    const indexCol = indexInSnapshot - (indexRow - 1) * colCount;
    const newImgWidth = elWidth * colCount;
    const newImgHeight = elHeight * rowCount;
    const startY = (indexRow - 1) * elHeight;
    const startX = (indexCol - 1) * elWidth;
    return /* @__PURE__ */ jsx$1("div", { css: S$5.previewCardInner, style: {
      backgroundColor: "black",
      // 防止加载过程中闪屏
      backgroundImage: `url(${snapshotUrl})`,
      backgroundPosition: `-${startX}px -${startY}px`,
      backgroundSize: `${newImgWidth}px ${newImgHeight}px`
    }, children: /* @__PURE__ */ jsx$1(SimplePregressBar, { progress }) });
  });
  function SimplePregressBar({
    progress,
    ...rest
  }) {
    const backgroundColor = bgLv1Value;
    return /* @__PURE__ */ jsx$1("div", { ...rest, className: clsx("track", rest.className), css: /* @__PURE__ */ css("position:absolute;bottom:0;left:0;right:0;background-color:", backgroundColor, ";height:2px;", ""), children: /* @__PURE__ */ jsx$1("div", { className: "bar", style: {
      backgroundColor: colorPrimaryValue,
      height: "100%",
      width: `${progress * 100}%`
    } }) });
  }
  function calcIndex(arr2, t) {
    let index = findIndex(arr2, t);
    if (index !== -1) {
      return index;
    }
    if (t > arr2[arr2.length - 1]) {
      index = arr2.length - 1;
    }
  }
  function findIndex(arr2, target) {
    let l = 0;
    let r2 = arr2.length - 1;
    let possible = -1;
    while (l <= r2) {
      const mid = Math.floor((l + r2) / 2);
      const mv = arr2[mid];
      if (target === mv) {
        return mid;
      }
      if (mv < target) {
        l = mid + 1;
        possible = mid;
      } else {
        r2 = mid - 1;
      }
    }
    if (possible === -1) return -1;
    const v = arr2[possible];
    const v1 = arr2[possible + 1] ?? 0;
    if (v < target && target < v1) {
      return possible;
    } else {
      return -1;
    }
  }
  var render = function render2(props) {
    if (typeof props.children === "function") {
      return React.createElement(React.Fragment, null, props.children());
    }
    return React.createElement(React.Fragment, null, props.children || null);
  };
  var Case = function Case2(_ref8) {
    var _ref$children = _ref8.children, children = _ref$children === void 0 ? null : _ref$children;
    return render({
      children
    });
  };
  var Default = function Default2(_ref8) {
    var _ref$children = _ref8.children, children = _ref$children === void 0 ? null : _ref$children;
    return render({
      children
    });
  };
  var getConditionResult = function getConditionResult2(condition) {
    var conditionResult = Boolean(typeof condition === "function" ? condition() : condition);
    return conditionResult;
  };
  function isFunction(input) {
    return typeof input === "function";
  }
  var Switch = function Switch2(_ref8) {
    var _ref22, _matchingCase;
    var children = _ref8.children;
    var matchingCase = void 0;
    var defaultCase = void 0;
    if (isFunction(children)) {
      children = children();
    }
    React.Children.forEach(children, function(child) {
      if (!React.isValidElement(child)) {
        return;
      }
      if (!matchingCase && child.type === Case) {
        var condition = child.props.condition;
        var conditionResult = getConditionResult(condition);
        if (conditionResult) {
          matchingCase = child;
        }
      } else if (!defaultCase && child.type === Default) {
        defaultCase = child;
      }
    });
    return (_ref22 = (_matchingCase = matchingCase) != null ? _matchingCase : defaultCase) != null ? _ref22 : null;
  };
  const S$4 = {
    recommendReason: {
      name: "rqkir0",
      styles: "display:inline-block;cursor:default;color:var(--Or5);background-color:var(--Or1);border-radius:4px;font-size:var(--follow-icon-font-size);line-height:var(--follow-icon-line-height);height:var(--follow-icon-line-height);width:max-content;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-block:0;padding-inline:2px"
    },
    appBadge: {
      name: "1atx64h",
      styles: "color:#fa6a9d;border-radius:2px;border:1px #fa6a9d solid;line-height:20px;padding:0 10px;transform:scale(0.8);transform-origin:center left"
    }
  };
  const descOwnerCss = {
    name: "nux2qa",
    styles: "font-size:var(--subtitle-font-size);line-height:var(--subtitle-line-height);color:var(--text3);a&:visited{color:var(--text3);}display:inline-flex;width:max-content;max-width:100%;align-items:center;justify-content:flex-start"
  };
  var _ref$h = {
    name: "15xw6zv",
    styles: "display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden;text-overflow:ellipsis;max-width:100%"
  };
  var _ref2$d = {
    name: "feo88y",
    styles: ".bili-video-card .bili-video-card__info--tit>a&{font-family:inherit;font-weight:initial;}"
  };
  var _ref3$a = {
    name: "1eyh0r6",
    styles: "text-indent:0!important;.bili-video-card &.bili-video-card__info--tit{padding-right:0;height:auto;max-height:calc(2 * var(--title-line-height));}"
  };
  var _ref4$8 = {
    name: "11xeuy9",
    styles: "flex:1;display:flex;flex-direction:column;row-gap:4px;margin-left:5px"
  };
  function VideoCardBottom({
    item,
    cardData,
    handleVideoLinkClick,
    className
  }) {
    const {
      useBorder
    } = useSnapshot(settings.style.videoCard);
    const target = useLinkTarget();
    const {
      // video
      goto,
      href,
      title,
      titleRender,
      pubdateDisplay,
      pubdateDisplayForTitleAttr,
      recommendReason,
      // author
      authorName,
      authorFace,
      authorMid,
      // adpater specific
      appBadge,
      appBadgeDesc,
      rankingDesc,
      liveDesc
    } = cardData;
    const isNormalVideo = goto === "av";
    const authorHref = authorMid ? formatSpaceUrl(authorMid) : href;
    const streaming = item.api === EApiType.Live && item.live_status === ELiveStatus.Streaming;
    const avatarExtraCss = [/* @__PURE__ */ css(flexCenterStyle, " padding:1px;border:1px solid transparent;border-radius:50%;position:relative;", ""), streaming && /* @__PURE__ */ css("border-color:", colorPrimaryValue, ";", "")];
    let descTitleAttr;
    if (isNormalVideo) {
      if (authorName || pubdateDisplay || pubdateDisplayForTitleAttr) {
        descTitleAttr = [
          //
          authorName,
          pubdateDisplayForTitleAttr || pubdateDisplay
        ].filter(Boolean).join(" · ");
      }
    }
    let hideAvatar = false;
    return /* @__PURE__ */ jsxs("div", { className, css: /* @__PURE__ */ css("margin-top:15px;margin-bottom:", useBorder ? 10 : 5, "px;padding-inline:5px;display:flex;column-gap:5px;overflow:hidden;", ""), children: [
      !!authorMid && !hideAvatar && /* @__PURE__ */ jsx$1("a", { href: authorHref, target, children: /* @__PURE__ */ jsxs("span", { css: avatarExtraCss, children: [
        authorFace ? /* @__PURE__ */ jsx$1(antd.Avatar, { src: getAvatarSrc(authorFace) }) : /* @__PURE__ */ jsx$1(antd.Avatar, { children: (authorName == null ? void 0 : authorName[0]) || (appBadgeDesc == null ? void 0 : appBadgeDesc[0]) || "" }),
        streaming && /* @__PURE__ */ jsx$1(IconForLive, { ...size(12), active: true, css: /* @__PURE__ */ css("position:absolute;bottom:0;right:0;background-color:", colorPrimaryValue, ";border-radius:50%;", "") })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { css: _ref4$8, children: [
        /* @__PURE__ */ jsx$1("h3", { className: "bili-video-card__info--tit", title, css: _ref3$a, children: /* @__PURE__ */ jsx$1("a", { onClick: handleVideoLinkClick, href, target, rel: "noopener", css: _ref2$d, children: titleRender ?? title }) }),
        renderDesc()
      ] })
    ] });
    function renderDesc() {
      if (isNormalVideo) {
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("a", { className: "bili-video-card__info--owner", href: authorHref, target, title: descTitleAttr, css: descOwnerCss, children: [
            /* @__PURE__ */ jsx$1("span", { className: "bili-video-card__info--author", children: authorName }),
            pubdateDisplay && /* @__PURE__ */ jsx$1("span", { className: "bili-video-card__info--date", children: DESC_SEPARATOR + pubdateDisplay })
          ] }),
          !!recommendReason && /* @__PURE__ */ jsx$1("span", { css: S$4.recommendReason, children: recommendReason })
        ] });
      }
      return /* @__PURE__ */ jsxs(Switch, { children: [
        /* @__PURE__ */ jsx$1(Case, { condition: appBadge || appBadgeDesc, children: /* @__PURE__ */ jsxs("a", { className: "bili-video-card__info--owner", css: descOwnerCss, href, target, children: [
          !!appBadge && /* @__PURE__ */ jsx$1("span", { css: S$4.appBadge, children: appBadge }),
          !!appBadgeDesc && /* @__PURE__ */ jsx$1("span", { children: appBadgeDesc })
        ] }) }),
        /* @__PURE__ */ jsx$1(Case, { condition: isRanking(item) && rankingDesc, children: /* @__PURE__ */ jsx$1("div", { css: descOwnerCss, children: rankingDesc }) }),
        /* @__PURE__ */ jsx$1(Case, { condition: isLive(item), children: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("a", { css: [descOwnerCss, _ref$h, "", ""], href: authorHref, target, title: (authorName || "") + (liveDesc || ""), children: [
            authorName,
            liveDesc && /* @__PURE__ */ jsx$1("span", { css: [C.ml(4), "", ""], children: liveDesc })
          ] }),
          !!recommendReason && /* @__PURE__ */ jsx$1("span", { css: S$4.recommendReason, children: recommendReason })
        ] }) })
      ] });
    }
  }
  const skeletonActive = "_skeleton-active_npcc8_15";
  const iconParkOutlineDistraughtFace = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z" }),
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", d: "M24 29c5 0 7 4 7 4H17s2-4 7-4m8-12l-3 3l3 3m-16-6l3 3l-3 3" })
  ] }) });
  const ForwardRef$e = React.forwardRef(iconParkOutlineDistraughtFace);
  var _ref$g = {
    name: "16dof6j",
    styles: "flex:1;margin-left:10px"
  };
  var _ref2$c = {
    name: "1po2nvr",
    styles: "width:32px;height:32px;border-radius:50%"
  };
  var _ref3$9 = {
    name: "1a4u54f",
    styles: "padding-inline:5px"
  };
  const SkeletonCard = React.memo(function SkeletonCard2({
    loading
  }) {
    return /* @__PURE__ */ jsxs("div", { className: clsx("bili-video-card__skeleton", {
      hide: !loading,
      [skeletonActive]: loading
    }), children: [
      /* @__PURE__ */ jsx$1("div", { className: "bili-video-card__skeleton--cover", style: {
        borderRadius: videoCardBorderRadiusValue
      } }),
      /* @__PURE__ */ jsxs("div", { className: "bili-video-card__skeleton--info", css: _ref3$9, children: [
        /* @__PURE__ */ jsx$1("div", { className: "bili-video-card__skeleton--avatar", css: _ref2$c }),
        /* @__PURE__ */ jsxs("div", { className: "bili-video-card__skeleton--right", css: _ref$g, children: [
          /* @__PURE__ */ jsx$1("p", { className: "bili-video-card__skeleton--text" }),
          /* @__PURE__ */ jsx$1("p", { className: "bili-video-card__skeleton--text short" }),
          /* @__PURE__ */ jsx$1("p", { className: "bili-video-card__skeleton--light" }),
          /* @__PURE__ */ jsx$1("p", { className: "bili-video-card__skeleton--text tiny" })
        ] })
      ] })
    ] });
  });
  const blockedCardCss = {
    wrapper: {
      name: "1cwsiuk",
      styles: "height:100%;display:flex;flex-direction:column;overflow:hidden;border-radius:var(--video-card-border-radius)"
    },
    cover: {
      name: "gcx5o1",
      styles: "border-top-left-radius:6px;border-top-right-radius:6px;aspect-ratio:16/9;position:relative"
    },
    coverInner: {
      name: "168b1mf",
      styles: "position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center"
    },
    dislikeReason: {
      name: "1965z4g",
      styles: "font-size:20px;text-align:center"
    },
    dislikeDesc: {
      name: "o0p24g",
      styles: "font-size:16px;text-align:center"
    },
    action: {
      name: "r7fjfn",
      styles: "flex:1;position:relative"
    },
    actionInner: /* @__PURE__ */ css("position:absolute;top:0;left:0;width:100%;height:100%;border-top:1px solid var(--", APP_NAMESPACE, "-separator-color);transition:border-top-color 0.3s;display:flex;align-items:center;justify-content:center;button{font-size:16px;color:inherit;display:flex;align-items:center;}", "")
  };
  const DislikedCard = React.memo(function DislikedCard2({
    item,
    cardData,
    dislikedReason,
    emitter: emitter2 = defaultEmitter
  }) {
    const onCancelDislike = useMemoizedFn(async () => {
      if (!(dislikedReason == null ? void 0 : dislikedReason.id)) return;
      let success = false;
      let message2 = "";
      let err;
      try {
        ;
        ({
          success,
          message: message2
        } = await cancelDislike(item, dislikedReason.id));
      } catch (e) {
        err = e;
      }
      if (err) {
        console.error(err.stack || err);
        return toastRequestFail();
      }
      if (success) {
        antMessage.success("已撤销");
        delDislikeId(item.param);
      } else {
        antMessage.error(message2 || OPERATION_FAIL_MSG);
      }
    });
    useMittOn(emitter2, "cancel-dislike", onCancelDislike);
    return /* @__PURE__ */ jsxs("div", { css: blockedCardCss.wrapper, children: [
      /* @__PURE__ */ jsx$1("div", { css: blockedCardCss.cover, children: /* @__PURE__ */ jsxs("div", { css: blockedCardCss.coverInner, children: [
        /* @__PURE__ */ jsx$1(ForwardRef$e, { className: "size-32px mb-5px" }),
        /* @__PURE__ */ jsx$1("div", { css: blockedCardCss.dislikeReason, children: dislikedReason == null ? void 0 : dislikedReason.name }),
        /* @__PURE__ */ jsx$1("div", { css: blockedCardCss.dislikeDesc, children: (dislikedReason == null ? void 0 : dislikedReason.toast) || "将减少此类内容推荐" })
      ] }) }),
      /* @__PURE__ */ jsx$1(__BottomRevertAction, { item, cardData, onClick: onCancelDislike })
    ] });
  });
  function __BottomRevertAction({
    item,
    cardData,
    onClick
  }) {
    return /* @__PURE__ */ jsxs("div", { css: blockedCardCss.action, children: [
      /* @__PURE__ */ jsx$1(VideoCardBottom, { item, cardData, className: "invisible" }),
      /* @__PURE__ */ jsx$1("div", { css: blockedCardCss.actionInner, children: /* @__PURE__ */ jsxs("button", { onClick, children: [
        /* @__PURE__ */ jsx$1(IconForReset, { className: "size-16px mr-4px mt--2px" }),
        "撤销"
      ] }) })
    ] });
  }
  const BlacklistCard = React.memo(function BlacklistCard2({
    item,
    cardData
  }) {
    const {
      authorMid,
      authorName
    } = cardData;
    const onCancel = useMemoizedFn(async () => {
      if (!authorMid) return;
      const success = await UserBlacklistService.remove(authorMid);
      if (success) antMessage.success(`已移出黑名单: ${authorName}`);
    });
    return /* @__PURE__ */ jsxs("div", { css: blockedCardCss.wrapper, children: [
      /* @__PURE__ */ jsx$1("div", { css: blockedCardCss.cover, children: /* @__PURE__ */ jsxs("div", { css: blockedCardCss.coverInner, children: [
        /* @__PURE__ */ jsx$1(IconForBlacklist, { className: "size-32px mb-5px" }),
        /* @__PURE__ */ jsx$1("div", { css: blockedCardCss.dislikeReason, children: "已拉黑" }),
        /* @__PURE__ */ jsxs("div", { css: blockedCardCss.dislikeDesc, children: [
          "UP: ",
          authorName
        ] })
      ] }) }),
      /* @__PURE__ */ jsx$1(__BottomRevertAction, { item, cardData, onClick: onCancel })
    ] });
  });
  const follow = followActionFactory("follow");
  const unfollow = followActionFactory("unfollow");
  const UserfollowService = {
    follow,
    unfollow
  };
  function followActionFactory(action2) {
    const act = action2 === "follow" ? 1 : 2;
    return async function followAction(upMid) {
      const success = await modifyRelations(upMid, act);
      return success;
    };
  }
  async function __fetchUserNickname(mid) {
    const info = await getSpaceAccInfo(mid);
    const nickname = info == null ? void 0 : info.name;
    return nickname;
  }
  const getUserNickname = wrapWithIdbCache({
    fn: __fetchUserNickname,
    generateKey: (mid) => mid.toString(),
    tableName: "user_nickname",
    ttl: ms("10d")
  });
  async function setNicknameCache(mid, nickname) {
    await getUserNickname.cache.set(mid.toString(), {
      val: nickname,
      ts: Date.now()
    });
  }
  const iconParkOutlinePeopleSearch = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14Z" }),
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", d: "M27 28h-8.2c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C6 34.08 6 36.32 6 40.8V42h21m13-1l-3.172-3.171M38 35a4 4 0 0 1-1.172 2.828A4 4 0 1 1 38 35" })
  ] }) });
  const ForwardRef$d = React.forwardRef(iconParkOutlinePeopleSearch);
  const materialSymbolsDeleteOutlineRounded = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", d: "M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z" }) });
  const ForwardRef$c = React.forwardRef(materialSymbolsDeleteOutlineRounded);
  const iconParkOutlineAddTwo = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M33 7.263A18.9 18.9 0 0 0 24 5C13.507 5 5 13.507 5 24s8.507 19 19 19a18.9 18.9 0 0 0 8-1.761" }),
    /* @__PURE__ */ jsx$1("path", { strokeLinejoin: "round", d: "M31 30h12m-28-8l7 7l19-18m-4 13v12" })
  ] }) });
  const ForwardRef$b = React.forwardRef(iconParkOutlineAddTwo);
  const iconParkOutlinePeopleMinus = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, d: "M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14Z" }),
    /* @__PURE__ */ jsx$1("path", { d: "M30 35h12z", clipRule: "evenodd" }),
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, d: "M30 35h12m-15-7h-8.2c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C6 34.08 6 36.32 6 40.8V42h21" })
  ] }) });
  const ForwardRef$a = React.forwardRef(iconParkOutlinePeopleMinus);
  const letsIconsViewHide = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M15.92 12.799Q16 12.41 16 12a4 4 0 0 0-4.799-3.92zM8.667 9.788a4 4 0 0 0 5.545 5.545l-1.474-1.474a2 2 0 0 1-2.597-2.597z", clipRule: "evenodd" }),
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "m16.52 17.64l-1.47-1.469c-.972.51-2.002.829-3.05.829c-1.526 0-3.014-.678-4.34-1.632c-1.32-.95-2.396-2.112-3.076-2.938c-.1-.121-.174-.212-.236-.291a2 2 0 0 1-.1-.139q.028-.045.1-.139c.062-.08.136-.17.236-.291c.665-.808 1.71-1.938 2.99-2.875l-1.43-1.43C4.797 8.297 3.723 9.47 3.04 10.3l-.073.088c-.314.375-.737.883-.737 1.613s.423 1.238.737 1.613l.073.088c.74.899 1.94 2.203 3.451 3.29C7.994 18.073 9.891 19 12 19c1.67 0 3.206-.581 4.52-1.36M8.806 5.686C9.79 5.269 10.864 5 12 5c2.11 0 4.006.927 5.509 2.009c1.51 1.087 2.711 2.391 3.45 3.29l.074.088c.314.375.737.883.737 1.613s-.423 1.238-.737 1.613l-.073.088a20.5 20.5 0 0 1-2.015 2.123l-1.416-1.416a18.5 18.5 0 0 0 2.123-2.27a2 2 0 0 0 .1-.138a2 2 0 0 0-.1-.139a14 14 0 0 0-.236-.291c-.68-.826-1.756-1.989-3.075-2.938C15.014 7.678 13.526 7 12 7c-.551 0-1.097.088-1.632.246z", clipRule: "evenodd" }),
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeWidth: 2, d: "m5 2l16 16" })
  ] }) });
  const ForwardRef$9 = React.forwardRef(letsIconsViewHide);
  function useContextMenus({
    item,
    cardData,
    tab: tab2,
    href,
    authorMid,
    authorName,
    recommendReason,
    isNormalVideo,
    onRefresh,
    watchlaterAdded,
    bvid,
    hasWatchLaterEntry,
    onToggleWatchLater,
    favFolderNames,
    avid,
    favFolderUrls,
    onMoveToFirst,
    hasDislikeEntry,
    onTriggerDislike,
    onRemoveCurrent,
    consistentOpenMenus,
    conditionalOpenMenus
  }) {
    const {
      enableHideSomeContents
    } = useSnapshot(settings.dynamicFeed.whenViewAll);
    const onCopyLink = useMemoizedFn(() => {
      let content = href;
      if (href.startsWith("/")) {
        content = new URL(href, location.href).href;
      }
      copyContent(content);
    });
    const hasBlacklistEntry = !!authorMid && isApiRecLike(item.api) && tab2 !== ETab.KeepFollowOnly;
    const onBlacklistUp = useMemoizedFn(async () => {
      if (!authorMid) return antMessage.error("UP mid 为空!");
      const success = await UserBlacklistService.add(authorMid);
      if (success) {
        antMessage.success(`已加入黑名单: ${authorName}`);
      }
    });
    const onAddUpToFilterList = useMemoizedFn(async () => {
      if (!authorMid) return antMessage.error("UP mid 为空!");
      const content = `${authorMid}`;
      if (settings.filter.byAuthor.keywords.includes(content)) {
        return toast(`已在过滤名单中: ${content}`);
      }
      await updateSettingsInnerArray("filter.byAuthor.keywords", {
        add: [content]
      });
      if (authorName) setNicknameCache(authorMid, authorName);
      let toastContent = content;
      if (authorName) toastContent += ` 用户名: ${authorName}`;
      antMessage.success(`已加入过滤名单: ${toastContent}, 刷新后生效~`);
    });
    const hasUnfollowEntry = item.api === EApiType.DynamicFeed || (item.api === EApiType.AppRecommend || item.api === EApiType.PcRecommend) && getFollowedStatus(recommendReason);
    const onUnfollowUp = useMemoizedFn(async () => {
      if (!authorMid) return;
      const success = await UserfollowService.unfollow(authorMid);
      if (success) {
        antMessage.success("已取消关注");
      }
    });
    const hasDynamicFeedFilterSelectUpEntry = (isNormalVideo || isLive(item)) && !!authorMid && !!authorName;
    const onDynamicFeedFilterSelectUp = useMemoizedFn(async (newWindow) => {
      if (!hasDynamicFeedFilterSelectUpEntry) return;
      async function openInCurrentWindow() {
        dynamicFeedFilterSelectUp({
          upMid: authorMid,
          upName: authorName,
          searchText: void 0
        });
        videoSourceTabState.value = ETab.DynamicFeed;
        await delay(100);
        await (onRefresh == null ? void 0 : onRefresh());
      }
      function openInNewWindow() {
        const u = `/?dyn-mid=${authorMid}`;
        openNewTab(u);
      }
      newWindow ?? (newWindow = true);
      if (newWindow) {
        openInNewWindow();
      } else {
        openInCurrentWindow();
      }
    });
    const hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds = enableHideSomeContents && isDynamicFeed(item) && dfStore.selectedKey === DF_SELECTED_KEY_ALL && !!authorMid;
    const onAddMidTo_dynamicFeedWhenViewAllHideIds = useMemoizedFn(async () => {
      if (!hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds) return;
      await updateSettingsInnerArray("dynamicFeed.whenViewAll.hideIds", {
        add: [DF_SELECTED_KEY_PREFIX_UP + authorMid]
      });
      setNicknameCache(authorMid, authorName || "");
      antMessage.success(`在「全部」动态中隐藏【${authorName}】的动态`);
    });
    const hasEntry_dynamicFeed_offsetAndMinId = !!(isDynamicFeed(item) && QUERY_DYNAMIC_UP_MID && dfStore.viewingSomeUp && authorMid);
    const dynamicViewStartFromHere = React.useMemo(() => hasEntry_dynamicFeed_offsetAndMinId && {
      label: "动态: 从此项开始查看",
      key: "动态: 从此项开始查看",
      icon: /* @__PURE__ */ jsx$1(ForwardRef$N, { ...size(17) }),
      onClick() {
        var _a2;
        const u = new URL("/", location.href);
        u.searchParams.set(DynamicFeedQueryKey.Mid, authorMid);
        const currentIndexInGrid = currentGridItems.findIndex((x) => x.api === EApiType.DynamicFeed && x.id_str === item.id_str);
        const prevIdStr = ((_a2 = currentGridItems[currentIndexInGrid - 1]) == null ? void 0 : _a2.id_str) || item.id_str;
        u.searchParams.set(DynamicFeedQueryKey.Offset, prevIdStr);
        openNewTab(u.href);
      }
    }, [hasEntry_dynamicFeed_offsetAndMinId, item]);
    const dynamicViewUpdateSinceThis = React.useMemo(() => hasEntry_dynamicFeed_offsetAndMinId && {
      icon: /* @__PURE__ */ jsx$1(ForwardRef$O, { ...size(17) }),
      label: "动态: 从此项开始截止",
      key: "动态: 从此项开始截止",
      onClick() {
        const u = new URL("/", location.href);
        u.searchParams.set(DynamicFeedQueryKey.Mid, authorMid);
        u.searchParams.set(DynamicFeedQueryKey.MinId, item.id_str);
        openNewTab(u.href);
      }
    }, [hasEntry_dynamicFeed_offsetAndMinId, item]);
    return React.useMemo(() => {
      const divider = {
        type: "divider"
      };
      const copyMenus = defineAntMenus([{
        key: "copy-link",
        label: "复制视频链接",
        icon: /* @__PURE__ */ jsx$1(IconForCopy, { className: "size-15px" }),
        onClick: onCopyLink
      }, {
        test: !!bvid,
        key: "copy-bvid",
        label: "复制 BVID",
        icon: /* @__PURE__ */ jsx$1(IconForCopy, { className: "size-15px" }),
        onClick() {
          copyContent(bvid);
        }
      }, {
        test: !!bvid && settings.__internalEnableCopyBvidInfoContextMenu,
        key: "copy-bvid-info",
        label: "复制 BVID 信息",
        icon: /* @__PURE__ */ jsx$1(IconForCopy, { className: "size-15px" }),
        onClick() {
          copyContent(getBvidInfo(cardData));
        }
      }]);
      const interestedMenus = defineAntMenus([
        {
          test: hasDynamicFeedFilterSelectUpEntry,
          key: "dymamic-feed-filter-select-up",
          label: "查看 UP 的动态",
          icon: /* @__PURE__ */ jsx$1(ForwardRef$d, { className: "size-15px" }),
          onClick() {
            onDynamicFeedFilterSelectUp();
          }
        },
        {
          test: hasWatchLaterEntry,
          key: "watchlater",
          label: watchlaterAdded ? "移除稍后再看" : "稍后再看",
          icon: watchlaterAdded ? /* @__PURE__ */ jsx$1(ForwardRef$c, { ...size(15) }) : /* @__PURE__ */ jsx$1(IconForWatchlater, { ...size(15) }),
          onClick() {
            onToggleWatchLater();
          }
        },
        {
          test: isWatchlater(item),
          key: "add-fav",
          icon: (favFolderNames == null ? void 0 : favFolderNames.length) ? /* @__PURE__ */ jsx$1(IconForFaved, { className: clsx("size-15px", appClsColorPrimary) }) : /* @__PURE__ */ jsx$1(IconForFav, { className: "size-15px" }),
          label: (favFolderNames == null ? void 0 : favFolderNames.length) ? `已收藏 ${favFolderNames.map((n) => `「${n}」`).join("")}` : "快速收藏",
          async onClick() {
            if (!avid) return;
            const hasFaved = Boolean(favFolderNames == null ? void 0 : favFolderNames.length);
            if (hasFaved) {
              favFolderUrls == null ? void 0 : favFolderUrls.forEach((u) => {
                window.open(u, getLinkTarget());
              });
            } else {
              const success = await UserFavService.addFav(avid);
              if (success) {
                antMessage.success(`已加入收藏夹「${defaultFavFolderName}」`);
              }
            }
          }
        },
        {
          test: isWatchlater(item) && watchlaterAdded,
          key: "watchlater-readd",
          label: "重新添加稍候再看 (移到最前)",
          icon: /* @__PURE__ */ jsx$1(ForwardRef$b, { className: "size-15px" }),
          async onClick() {
            const {
              success
            } = await onToggleWatchLater(void 0, watchlaterAdd);
            if (!success) return;
            onMoveToFirst == null ? void 0 : onMoveToFirst(item, cardData);
          }
        },
        // 动态
        dynamicViewUpdateSinceThis,
        dynamicViewStartFromHere
      ]);
      const dislikeMenus = defineAntMenus([{
        test: hasDislikeEntry,
        key: "dislike",
        label: "我不想看",
        icon: /* @__PURE__ */ jsx$1(IconForDislike, { width: 15, height: 15 }),
        onClick() {
          onTriggerDislike();
        }
      }, {
        test: hasUnfollowEntry,
        key: "unfollow-up",
        label: "取消关注",
        icon: /* @__PURE__ */ jsx$1(ForwardRef$a, { className: "size-15px" }),
        onClick: onUnfollowUp
      }, {
        test: hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds,
        key: "hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds",
        label: "在「全部」动态中隐藏 UP 的动态",
        icon: /* @__PURE__ */ jsx$1(ForwardRef$9, { ...size(15) }),
        onClick: onAddMidTo_dynamicFeedWhenViewAllHideIds
      }, {
        test: hasBlacklistEntry,
        key: "blacklist-up",
        label: "将 UP 加入黑名单",
        icon: /* @__PURE__ */ jsx$1(IconForBlacklist, { className: "size-15" }),
        onClick: onBlacklistUp
      }, {
        test: hasBlacklistEntry,
        key: "add-up-to-filterlist",
        label: "将 UP 加入过滤列表",
        icon: /* @__PURE__ */ jsx$1(IconForBlacklist, { className: "size-15" }),
        onClick: onAddUpToFilterList
      }]);
      const favMenus = !isFav(item) ? [] : defineAntMenus([
        // 收藏夹
        ...item.from === "fav-folder" ? [{
          key: "open-fav-folder",
          label: "浏览收藏夹",
          icon: /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { css: C.size(15) }),
          onClick() {
            if (!isFav(item)) return;
            const {
              id
            } = item.folder;
            const url = tab2 !== ETab.Fav || favStore.selectedKey === "all" && favStore.usingShuffle ? `/?${FavSearchParamsKey.FolderIdFull}=${id}` : formatFavFolderUrl(id);
            window.open(url, getLinkTarget());
          }
        }, {
          key: "remove-fav",
          label: "移除收藏",
          icon: /* @__PURE__ */ jsx$1(ForwardRef$c, { ...size(15) }),
          async onClick() {
            if (!isFav(item)) return;
            const success = await UserFavService.removeFav(item.folder.id, `${item.id}:${item.type}`);
            if (success) {
              await delay(1e3);
              onRemoveCurrent == null ? void 0 : onRemoveCurrent(item, cardData);
            }
          }
        }] : [],
        // 合集
        ...item.from === "fav-collection" ? [{
          key: "open-fav-collection",
          label: "浏览合集",
          icon: /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { css: C.size(15) }),
          onClick() {
            if (!isFav(item)) return;
            const {
              id
            } = item.collection;
            const url = tab2 !== ETab.Fav || favStore.selectedKey === "all" && favStore.usingShuffle ? `/?${FavSearchParamsKey.CollectionIdFull}=${id}` : formatFavCollectionUrl(id);
            window.open(url, getLinkTarget());
          }
        }] : []
      ]);
      return defineAntMenus([...consistentOpenMenus, !!copyMenus.length && divider, ...copyMenus, !!interestedMenus.length && divider, ...interestedMenus, !!dislikeMenus.length && divider, ...dislikeMenus, !!favMenus.length && divider, ...favMenus, !!conditionalOpenMenus.length && divider, ...conditionalOpenMenus]);
    }, [
      item,
      cardData,
      tab2,
      // entries
      hasWatchLaterEntry,
      watchlaterAdded,
      hasDislikeEntry,
      hasUnfollowEntry,
      hasBlacklistEntry,
      hasDynamicFeedFilterSelectUpEntry,
      hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds,
      // others
      favFolderNames,
      favFolderUrls,
      consistentOpenMenus,
      conditionalOpenMenus
    ]);
  }
  const dislikeIcon = /* @__PURE__ */ jsx$1(IconForDislike, { ...size(16) });
  function useDislikeRelated({
    item,
    authed,
    actionButtonVisible
  }) {
    var _a2, _b2;
    const hasDislikeEntry = isAppRecommend(item) && !!((_b2 = (_a2 = item.three_point) == null ? void 0 : _a2.dislike_reasons) == null ? void 0 : _b2.length);
    const onTriggerDislike = useMemoizedFn((e) => {
      e == null ? void 0 : e.preventDefault();
      e == null ? void 0 : e.stopPropagation();
      if (!hasDislikeEntry) {
        if (item.api !== EApiType.AppRecommend) {
          return antMessage.error("当前视频不支持提交「我不想看」");
        }
        return;
      }
      if (!authed) {
        return toast("请先获取 access_key ~");
      }
      showModalDislike(item);
    });
    const dislikeButtonEl = hasDislikeEntry && /* @__PURE__ */ jsx$1(VideoCardActionButton, { visible: actionButtonVisible, inlinePosition: "left", icon: dislikeIcon, tooltip: "我不想看", onClick: onTriggerDislike });
    return {
      dislikeButtonEl,
      hasDislikeEntry,
      onTriggerDislike
    };
  }
  const DEBUG_ANIMATION = false;
  function usePreviewAnimation({
    uniqId,
    emitter: emitter2,
    title,
    active,
    videoDuration,
    tryFetchVideoData,
    videoDataBox,
    autoPreviewWhenHover,
    videoPreviewWrapperRef
  }) {
    const hasVideoData = useMemoizedFn(() => {
      var _a2, _b2, _c2;
      const data2 = (_a2 = videoDataBox.val) == null ? void 0 : _a2.videoshotJson.data;
      return Boolean(((_b2 = data2 == null ? void 0 : data2.index) == null ? void 0 : _b2.length) && ((_c2 = data2 == null ? void 0 : data2.image) == null ? void 0 : _c2.length));
    });
    const [autoPreviewing, setAutoPreviewing] = React.useState(false);
    const [previewProgress, setPreviewProgress] = useRafState();
    const [previewT, setPreviewT] = useRafState();
    const getProgress = useMemoizedFn(() => previewProgress || 0);
    const [mouseMoved, setMouseMoved] = React.useState(false);
    const isHoveringBox = useRefStateBox(false);
    const isHoveringAfterDelayBox = useRefStateBox(false);
    const startByHoverBox = useRefBox(false);
    const [mouseEnterRelativeX, setMouseEnterRelativeX] = React.useState(void 0);
    const updateMouseEnterRelativeX = (e) => {
      var _a2;
      const rect = (_a2 = videoPreviewWrapperRef.current) == null ? void 0 : _a2.getBoundingClientRect();
      if (!rect) return;
      const {
        x
      } = rect;
      const relativeX = e.pageX - window.pageXOffset - x;
      setMouseEnterRelativeX(relativeX);
    };
    useEventListener("mouseenter", async (e) => {
      emitter2.emit("mouseenter", uniqId);
      isHoveringBox.set(true);
      updateMouseEnterRelativeX(e);
      const p = tryFetchVideoData();
      const HOVER_DELAY = 800;
      let delayPromise;
      if (settings.useDelayForHover) {
        delayPromise = delay(HOVER_DELAY);
      }
      await Promise.all([p, delayPromise].filter(Boolean));
      if (!isHoveringBox.val) return;
      isHoveringAfterDelayBox.set(true);
      if (autoPreviewWhenHover && !idBox.val && hasVideoData()) {
        onStartPreviewAnimation(true);
      }
    }, {
      target: videoPreviewWrapperRef
    });
    const _mouseleaveAction = useMemoizedFn(() => {
      isHoveringBox.set(false);
      isHoveringAfterDelayBox.set(false);
    });
    useEventListener("mouseleave", _mouseleaveAction, {
      target: videoPreviewWrapperRef
    });
    useMittOn(emitter2, "mouseenter-other-card", (srcUniqId) => {
      if (srcUniqId === uniqId) return;
      _mouseleaveAction();
    });
    useEventListener("mousemove", (e) => {
      setMouseMoved(true);
      if (isHoveringBox.val && !isHoveringAfterDelayBox.val) {
        updateMouseEnterRelativeX(e);
      }
      if (!autoPreviewWhenHover) {
        animationController.stop();
      }
    }, {
      target: videoPreviewWrapperRef
    });
    const idBox = useRefBox(void 0);
    const animationController = useAnimationController({
      startByHoverBox,
      isHoveringBox,
      active,
      mouseMoved,
      idBox,
      autoPreviewWhenHover,
      setAutoPreviewing,
      setPreviewT,
      setPreviewProgress
    });
    const onHotkeyPreviewAnimation = useMemoizedFn(async () => {
      if (!idBox.val) {
        await tryFetchVideoData();
        if (hasVideoData()) {
          onStartPreviewAnimation(false);
        }
        return;
      }
      animationController.togglePaused();
    });
    const onStartPreviewAnimation = useMemoizedFn((startByHover) => {
      startByHoverBox.set(startByHover);
      setMouseMoved(false);
      animationController.reset();
      animationController.stop(true);
      setAutoPreviewing(true);
      setPreviewProgress((val) => typeof val === "undefined" ? 0 : val);
      setPreviewT(void 0);
      const runDuration = 8e3;
      {
        if (videoDataBox.val) ;
      }
      const getInterval = () => {
        return settings.autoPreviewUpdateInterval;
      };
      let start = performance.now();
      let tUpdateAt = 0;
      animationController.resumeImplRef.current = () => {
        start = performance.now() - getProgress() * runDuration;
      };
      function frame(t) {
        if (animationController.shouldStop()) {
          animationController.stop();
          return;
        }
        if (!animationController.paused) {
          const now = performance.now();
          const elapsed = now - start;
          const p = minmax(elapsed % runDuration / runDuration, 0, 1);
          if (settings.autoPreviewUseContinuousProgress) {
            setPreviewProgress(p);
          }
          if (!tUpdateAt || now - tUpdateAt >= getInterval()) {
            setPreviewProgress(p);
            tUpdateAt = now;
            if (videoDuration) {
              const t2 = minmax(Math.round(p * videoDuration), 0, videoDuration);
              setPreviewT(t2);
            }
          }
        }
        idBox.val = requestAnimationFrame(frame);
      }
      idBox.val = requestAnimationFrame(frame);
    });
    return {
      onHotkeyPreviewAnimation,
      onStartPreviewAnimation,
      autoPreviewing,
      previewProgress,
      previewT,
      isHovering: isHoveringBox.state,
      isHoveringAfterDelay: isHoveringAfterDelayBox.state,
      mouseEnterRelativeX
    };
  }
  function useAnimationController({
    startByHoverBox,
    isHoveringBox,
    idBox,
    active,
    mouseMoved,
    autoPreviewWhenHover,
    setAutoPreviewing,
    setPreviewT,
    setPreviewProgress
  }) {
    const unmounted = useUnmountedRef();
    const shouldStop = useMemoizedFn(() => {
      if (unmounted.current) return true;
      if (startByHoverBox.val) {
        if (!isHoveringBox.val) return true;
      } else {
        if (!active) return true;
        if (mouseMoved) return true;
      }
      return false;
    });
    const stop = useMemoizedFn((isClear = false) => {
      if (!isClear && DEBUG_ANIMATION) {
        appLog(`[animation] stopAnimation: %o`, {
          autoPreviewWhenHover,
          unmounted: unmounted.current,
          isHovering: isHoveringBox.val,
          active,
          mouseMoved
        });
      }
      if (idBox.val) cancelAnimationFrame(idBox.val);
      idBox.val = void 0;
      setAutoPreviewing(false);
      setPreviewProgress(void 0);
      setPreviewT(void 0);
      animationController.reset();
    });
    const resumeImplRef = React.useRef();
    const pausedBox = useRefStateBox(false);
    const animationController = {
      shouldStop,
      stop,
      get paused() {
        return pausedBox.val;
      },
      set paused(val) {
        pausedBox.val = val;
      },
      togglePaused() {
        var _a2;
        const prev2 = this.paused;
        this.paused = !this.paused;
        if (prev2) {
          (_a2 = resumeImplRef.current) == null ? void 0 : _a2.call(resumeImplRef);
        }
      },
      reset() {
        this.paused = false;
      },
      resumeImplRef
    };
    return animationController;
  }
  function IconAnimatedChecked({
    size: size2 = 18,
    useAnimation = false,
    ...restProps
  }) {
    return /* @__PURE__ */ jsx$1("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: size2, height: size2, ...restProps, children: /* @__PURE__ */ jsx$1(framerMotion.motion.path, { fill: "transparent", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 11L11 17L21 7", ...useAnimation ? {
      initial: {
        pathLength: 0
      },
      animate: {
        pathLength: 1
      },
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    } : void 0 }) });
  }
  function useWatchlaterRelated({
    item,
    cardData,
    onRemoveCurrent,
    actionButtonVisible,
    watchlaterAdded
  }) {
    const {
      avid,
      bvid
    } = cardData;
    const hasWatchLaterEntry = (() => {
      if (item.api === EApiType.AppRecommend) {
        return item.goto === "av";
      }
      if (item.api === EApiType.Ranking) {
        return cardData.goto === "av";
      }
      if (item.api === EApiType.Live) {
        return false;
      }
      return true;
    })();
    const $req = useRequest((usingAction, avid2) => usingAction(avid2), {
      manual: true
    });
    const watchlaterAddedPrevious = usePrevious$1(watchlaterAdded);
    const onToggleWatchLater = useMemoizedFn(async (e, usingAction) => {
      e == null ? void 0 : e.preventDefault();
      e == null ? void 0 : e.stopPropagation();
      if ($req.loading) return {
        success: false
      };
      if (!avid || !bvid) {
        return {
          success: false
        };
      }
      usingAction ?? (usingAction = watchlaterAdded ? watchlaterDel : watchlaterAdd);
      const success = await $req.runAsync(usingAction, avid);
      const targetState = usingAction === watchlaterAdd ? true : false;
      if (success) {
        if (targetState) {
          watchlaterState.bvidSet.add(bvid);
        } else {
          watchlaterState.bvidSet.delete(bvid);
        }
        if (item.api === EApiType.Watchlater) {
          if (!targetState) {
            await delay(1e3);
            onRemoveCurrent == null ? void 0 : onRemoveCurrent(item, cardData);
          }
        } else {
          antMessage.success(`已${targetState ? "添加" : "移除"}稍后再看`);
        }
      }
      return {
        success,
        targetState
      };
    });
    const addSize = 20;
    const addedSize = 18;
    const icon = (() => {
      if ($req.loading) {
        return /* @__PURE__ */ jsx$1(ForwardRef$t, { ...size(16) });
      }
      if (item.api === EApiType.Watchlater) {
        return watchlaterAdded ? /* @__PURE__ */ jsx$1(ForwardRef$c, { ...size(16) }) : /* @__PURE__ */ jsx$1(IconAnimatedChecked, { size: addedSize, useAnimation: watchlaterAddedPrevious === true });
      }
      return watchlaterAdded ? /* @__PURE__ */ jsx$1(IconAnimatedChecked, { size: addedSize, useAnimation: watchlaterAddedPrevious === false }) : /* @__PURE__ */ jsx$1(IconForWatchlater, { ...size(addSize) });
    })();
    const tooltip = item.api === EApiType.Watchlater ? watchlaterAdded ? "已添加稍后再看, 点击移除" : "已移除稍后再看" : watchlaterAdded ? "已添加稍后再看, 点击移除" : "稍后再看";
    const watchlaterButtonEl = hasWatchLaterEntry && /* @__PURE__ */ jsx$1(VideoCardActionButton, { visible: actionButtonVisible, inlinePosition: "right", icon, tooltip, onClick: onToggleWatchLater });
    return {
      watchlaterButtonEl,
      onToggleWatchLater,
      watchlaterAdded,
      hasWatchLaterEntry
    };
  }
  const VideoCard = React.memo(function VideoCard2({
    style,
    className,
    item,
    loading,
    active,
    onRemoveCurrent,
    onMoveToFirst,
    onRefresh,
    emitter: emitter2,
    tab: tab2,
    baseCss,
    ...restProps
  }) {
    loading = loading ?? !item;
    const dislikedReason = useDislikedReason((item == null ? void 0 : item.api) === EApiType.AppRecommend && item.param);
    const cardData = React.useMemo(() => item && normalizeCardData(item), [item]);
    const blacklisted = useInBlacklist(cardData == null ? void 0 : cardData.authorMid);
    const watchlaterAdded = useWatchlaterState(cardData == null ? void 0 : cardData.bvid);
    const showingDislikeCard = !!dislikedReason;
    const showingBlacklistCard = blacklisted;
    const showingInNormalCard = showingDislikeCard || showingBlacklistCard;
    const inNormalCardCss = useInNormalCardCss(showingInNormalCard);
    return /* @__PURE__ */ jsx$1("div", { style, "data-bvid": cardData == null ? void 0 : cardData.bvid, className: clsx("bili-video-card", styles.biliVideoCard, className), css: [baseCss, inNormalCardCss, "", ""], ...restProps, children: loading ? /* @__PURE__ */ jsx$1(SkeletonCard, { loading }) : item && cardData && (showingDislikeCard ? /* @__PURE__ */ jsx$1(DislikedCard, { item, cardData, emitter: emitter2, dislikedReason }) : showingBlacklistCard ? /* @__PURE__ */ jsx$1(BlacklistCard, { item, cardData }) : /* @__PURE__ */ jsx$1(VideoCardInner, { item, cardData, active, emitter: emitter2, tab: tab2, onRemoveCurrent, onMoveToFirst, onRefresh, watchlaterAdded })) });
  });
  var _ref$f = {
    name: "vpmszz",
    styles: "background-color:unset;position:static;height:100%"
  };
  var _ref2$b = {
    name: "zvlda9",
    styles: "display:block;position:relative;overflow:hidden"
  };
  var _ref3$8 = {
    name: "113yigl",
    styles: "z-index:2;height:3px"
  };
  const VideoCardInner = React.memo(function VideoCardInner2({
    item,
    cardData,
    tab: tab2,
    active = false,
    onRemoveCurrent,
    onMoveToFirst,
    onRefresh,
    emitter: emitter2 = defaultEmitter,
    watchlaterAdded
  }) {
    var _a2, _b2, _c2;
    const {
      autoPreviewWhenHover,
      accessKey,
      style: {
        videoCard: {
          useBorder: cardUseBorder,
          useBorderOnlyOnHover: cardUseBorderOnlyOnHover
        }
      }
    } = useSettingsSnapshot();
    const authed = !!accessKey;
    const {
      // video
      avid,
      bvid,
      goto,
      href,
      title,
      cover,
      duration: duration2,
      durationStr,
      recommendReason,
      // stat
      statItems,
      // author
      authorName,
      authorMid
    } = cardData;
    const isNormalVideo = goto === "av";
    const allowed = ["av", "bangumi", "picture", "live"];
    if (!allowed.includes(goto)) {
      appWarn(`none (${allowed.join(",")}) goto type %s`, goto, item);
    }
    const videoDataBox = useRefStateBox(null);
    const videoshotData = (_b2 = (_a2 = videoDataBox.state) == null ? void 0 : _a2.videoshotJson) == null ? void 0 : _b2.data;
    const tryFetchVideoData = useLockFn(async () => {
      var _a3, _b3;
      if (!bvid) return;
      if (!bvid.startsWith("BV")) return;
      if (goto !== "av") return;
      if (isVideoshotDataValid((_b3 = (_a3 = videoDataBox.val) == null ? void 0 : _a3.videoshotJson) == null ? void 0 : _b3.data)) return;
      const data2 = await fetchVideoData(bvid);
      videoDataBox.set(data2);
      if (!isWebApiSuccess(data2.videoshotJson)) {
        warnNoPreview(data2.videoshotJson);
      }
    });
    const warnNoPreview = useLessFrequentFn((json) => {
      antNotification.warning({
        message: `${json.message} (code: ${json.code})`,
        description: `${title} (${bvid})`,
        duration: 2
      });
    }, 3, false);
    const cardRef = React.useRef(null);
    const coverRef = React.useRef(null);
    const videoPreviewWrapperRef = cardUseBorder ? cardRef : coverRef;
    const previewImageRef = React.useRef(null);
    const {
      onStartPreviewAnimation,
      onHotkeyPreviewAnimation,
      autoPreviewing,
      previewProgress,
      previewT,
      isHovering,
      isHoveringAfterDelay,
      mouseEnterRelativeX
    } = usePreviewAnimation({
      uniqId: item.uniqId,
      emitter: emitter2,
      title,
      active,
      videoDuration: duration2,
      tryFetchVideoData,
      videoDataBox,
      autoPreviewWhenHover,
      videoPreviewWrapperRef
    });
    useUpdateEffect(() => {
      if (!active) return;
      tryit(() => {
        ;
        unsafeWindow[`${APP_KEY_PREFIX}_activeItem`] = item;
      })();
      if (settings.autoPreviewWhenKeyboardSelect) {
        tryFetchVideoData().then(() => {
          onStartPreviewAnimation(false);
        });
      }
    }, [active]);
    const actionButtonVisible = active || isHovering;
    const {
      watchlaterButtonEl,
      onToggleWatchLater,
      hasWatchLaterEntry
    } = useWatchlaterRelated({
      item,
      cardData,
      onRemoveCurrent,
      actionButtonVisible,
      watchlaterAdded
    });
    const {
      dislikeButtonEl,
      hasDislikeEntry,
      onTriggerDislike
    } = useDislikeRelated({
      item,
      authed,
      actionButtonVisible
    });
    const [favFolderNames, setFavFolderNames] = React.useState(void 0);
    const [favFolderUrls, setFavFolderUrls] = React.useState(void 0);
    const updateFavFolderNames = useMemoizedFn(async () => {
      if (item.api !== "watchlater") return;
      if (!avid) return;
      const result = await UserFavService.getVideoFavState(avid);
      if (result) {
        const {
          favFolderNames: favFolderNames2,
          favFolderUrls: favFolderUrls2
        } = result;
        setFavFolderNames(favFolderNames2);
        setFavFolderUrls(favFolderUrls2);
      }
    });
    const {
      onOpenWithMode,
      handleVideoLinkClick,
      consistentOpenMenus,
      conditionalOpenMenus,
      openInPopupButtonEl,
      onOpenInPopup
    } = useOpenRelated({
      href,
      item,
      cardData,
      actionButtonVisible,
      previewImageRef
    });
    const handleCardClick = useMemoizedFn((e) => {
      if (!cardUseBorder) return;
      if (e.target.closest("a")) return;
      onOpenWithMode();
    });
    useMittOn(emitter2, "open", onOpenWithMode);
    useMittOn(emitter2, "open-in-popup", onOpenInPopup);
    useMittOn(emitter2, "toggle-watch-later", () => onToggleWatchLater());
    useMittOn(emitter2, "trigger-dislike", () => onTriggerDislike());
    useMittOn(emitter2, "start-preview-animation", onStartPreviewAnimation);
    useMittOn(emitter2, "hotkey-preview-animation", onHotkeyPreviewAnimation);
    const contextMenus = useContextMenus({
      item,
      cardData,
      tab: tab2,
      // details
      href,
      authorMid,
      authorName,
      recommendReason,
      isNormalVideo,
      onRefresh,
      watchlaterAdded,
      bvid,
      hasWatchLaterEntry,
      onToggleWatchLater,
      favFolderNames,
      avid,
      favFolderUrls,
      onMoveToFirst,
      hasDislikeEntry,
      onTriggerDislike,
      onRemoveCurrent,
      consistentOpenMenus,
      conditionalOpenMenus
    });
    const onContextMenuOpenChange = useMemoizedFn((open) => {
      if (!open) return;
      updateFavFolderNames();
    });
    const _isChargeOnly = isChargeOnlyVideo(item, recommendReason);
    const _isRanking = isRanking(item);
    const _isStreaming = isLive(item) && item.live_status === ELiveStatus.Streaming;
    const topMarks = /* @__PURE__ */ jsxs(Fragment, { children: [
      _isChargeOnly && /* @__PURE__ */ jsx$1(ChargeOnlyTag, {}),
      _isRanking && /* @__PURE__ */ jsx$1(RankingNumMark, { item }),
      _isStreaming && /* @__PURE__ */ jsx$1(LiveBadge, {}),
      tab2 === ETab.AppRecommend && !isAppRecommend(item) && !isLive(item) && /* @__PURE__ */ jsx$1(ApiTypeTag, { item })
    ] });
    const watchlaterProgressBar = isWatchlater(item) && item.progress > 0 ? /* @__PURE__ */ jsx$1(SimplePregressBar, { progress: item.progress / item.duration, css: _ref3$8 }) : void 0;
    const prefixCls = `.${APP_CLS_ROOT} .${APP_CLS_CARD}`;
    const coverBottomNoRoundCss = /* @__PURE__ */ css(prefixCls, " &{border-bottom-left-radius:0;border-bottom-right-radius:0;}", "");
    const coverRoundCss = [/* @__PURE__ */ css(prefixCls, " &{overflow:hidden;border-radius:", videoCardBorderRadiusValue, ";}", ""), (isHovering || active || cardUseBorder && !cardUseBorderOnlyOnHover) && coverBottomNoRoundCss];
    const dark = useIsDarkMode();
    const coverBorderCss = (() => {
      if (cardUseBorder && !cardUseBorderOnlyOnHover) return void 0;
      const visible = !dark && (!cardUseBorder || cardUseBorder && cardUseBorderOnlyOnHover && !isHovering);
      return /* @__PURE__ */ css("border:1px solid ", visible ? borderColorValue : "transparent", ";", "");
    })();
    const target = useLinkTarget();
    const coverContent = /* @__PURE__ */ jsxs("a", { ref: (el) => coverRef.current = el, href, target, css: [coverRoundCss, _ref2$b, coverBorderCss, "", ""], onClick: handleVideoLinkClick, onContextMenu: (e) => {
      e.preventDefault();
    }, children: [
      /* @__PURE__ */ jsx$1("div", { className: "bili-video-card__image", style: {
        aspectRatio: "16 / 9"
      }, children: /* @__PURE__ */ jsx$1("div", { className: "bili-video-card__image--wrap", children: /* @__PURE__ */ jsx$1(Picture, { src: `${cover}@672w_378h_1c_!web-home-common-cover`, className: "v-img bili-video-card__cover", style: {
        borderRadius: 0
      }, imgProps: {
        // in firefox, alt text is visible during loading
        alt: isFirefox ? "" : title
      } }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "bili-video-card__stats", css: [/* @__PURE__ */ css(prefixCls, " &{pointer-events:none;border-radius:0;}", ""), "", ""], children: [
        /* @__PURE__ */ jsx$1("div", { className: "bili-video-card__stats--left", children: statItems.map(({
          field,
          value
        }) => /* @__PURE__ */ jsx$1(StatItemDisplay, { field, value }, field)) }),
        /* @__PURE__ */ jsx$1("span", { className: "bili-video-card__stats__duration", children: isNormalVideo && durationStr })
      ] }),
      watchlaterProgressBar,
      !!(((_c2 = videoshotData == null ? void 0 : videoshotData.image) == null ? void 0 : _c2.length) && duration2 && (isHoveringAfterDelay || active)) && (autoPreviewWhenHover ? (
        // auto-preview: start-by (hover | keyboard)
        autoPreviewing && /* @__PURE__ */ jsx$1(PreviewImage, { ref: previewImageRef, videoDuration: duration2, pvideo: videoshotData, mouseEnterRelativeX, progress: previewProgress, t: previewT })
      ) : (
        // follow-mouse
        /* @__PURE__ */ jsx$1(PreviewImage, { ref: previewImageRef, videoDuration: duration2, pvideo: videoshotData, mouseEnterRelativeX })
      )),
      !!dislikeButtonEl && /* @__PURE__ */ jsx$1("div", { className: "left-actions", css: S$7.topContainer("left"), children: dislikeButtonEl }),
      !!(watchlaterButtonEl || openInPopupButtonEl) && /* @__PURE__ */ jsxs("div", { className: "right-actions", css: S$7.topContainer("right"), children: [
        watchlaterButtonEl,
        openInPopupButtonEl
      ] }),
      topMarks
    ] });
    const bottomContent = /* @__PURE__ */ jsx$1(VideoCardBottom, { item, cardData, handleVideoLinkClick });
    function wrapDropdown(c2) {
      return /* @__PURE__ */ jsx$1(antd.Dropdown, { getPopupContainer: () => {
        if (isSafari) return document.body;
        return cardRef.current || document.body;
      }, menu: {
        items: contextMenus,
        style: {
          // 需要设置宽度, 否则闪屏
          width: "max-content"
        }
      }, trigger: ["contextMenu"], onOpenChange: onContextMenuOpenChange, children: c2 });
    }
    function wrapCardWrapper(c2) {
      return /* @__PURE__ */ jsx$1("div", { ref: (el) => cardRef.current = el, className: "bili-video-card__wrap", css: _ref$f, onClick: handleCardClick, onContextMenu: (e) => {
        if (cardUseBorder) {
          e.preventDefault();
        }
      }, children: c2 });
    }
    if (cardUseBorder) {
      return wrapDropdown(wrapCardWrapper(/* @__PURE__ */ jsxs(Fragment, { children: [
        coverContent,
        bottomContent
      ] })));
    } else {
      return wrapCardWrapper(/* @__PURE__ */ jsxs(Fragment, { children: [
        wrapDropdown(coverContent),
        bottomContent
      ] }));
    }
  });
  var observerMap = /* @__PURE__ */ new Map();
  var RootIds = /* @__PURE__ */ new WeakMap();
  var rootId = 0;
  var unsupportedValue = void 0;
  function getRootId(root2) {
    if (!root2) return "0";
    if (RootIds.has(root2)) return RootIds.get(root2);
    rootId += 1;
    RootIds.set(root2, rootId.toString());
    return RootIds.get(root2);
  }
  function optionsToId(options) {
    return Object.keys(options).sort().filter(
      (key) => options[key] !== void 0
    ).map((key) => {
      return `${key}_${key === "root" ? getRootId(options.root) : options[key]}`;
    }).toString();
  }
  function createObserver(options) {
    const id = optionsToId(options);
    let instance = observerMap.get(id);
    if (!instance) {
      const elements = /* @__PURE__ */ new Map();
      let thresholds;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          var _a2;
          const inView = entry.isIntersecting && thresholds.some((threshold) => entry.intersectionRatio >= threshold);
          if (options.trackVisibility && typeof entry.isVisible === "undefined") {
            entry.isVisible = inView;
          }
          (_a2 = elements.get(entry.target)) == null ? void 0 : _a2.forEach((callback) => {
            callback(inView, entry);
          });
        });
      }, options);
      thresholds = observer.thresholds || (Array.isArray(options.threshold) ? options.threshold : [options.threshold || 0]);
      instance = {
        id,
        observer,
        elements
      };
      observerMap.set(id, instance);
    }
    return instance;
  }
  function observe(element, callback, options = {}, fallbackInView = unsupportedValue) {
    if (typeof window.IntersectionObserver === "undefined" && fallbackInView !== void 0) {
      const bounds = element.getBoundingClientRect();
      callback(fallbackInView, {
        isIntersecting: fallbackInView,
        target: element,
        intersectionRatio: typeof options.threshold === "number" ? options.threshold : 0,
        time: 0,
        boundingClientRect: bounds,
        intersectionRect: bounds,
        rootBounds: bounds
      });
      return () => {
      };
    }
    const { id, observer, elements } = createObserver(options);
    const callbacks = elements.get(element) || [];
    if (!elements.has(element)) {
      elements.set(element, callbacks);
    }
    callbacks.push(callback);
    observer.observe(element);
    return function unobserve() {
      callbacks.splice(callbacks.indexOf(callback), 1);
      if (callbacks.length === 0) {
        elements.delete(element);
        observer.unobserve(element);
      }
      if (elements.size === 0) {
        observer.disconnect();
        observerMap.delete(id);
      }
    };
  }
  function useInView({
    threshold,
    delay: delay2,
    trackVisibility,
    rootMargin,
    root: root2,
    triggerOnce,
    skip,
    initialInView,
    fallbackInView,
    onChange
  } = {}) {
    var _a2;
    const [ref, setRef] = React__namespace.useState(null);
    const callback = React__namespace.useRef(onChange);
    const [state, setState] = React__namespace.useState({
      inView: !!initialInView,
      entry: void 0
    });
    callback.current = onChange;
    React__namespace.useEffect(
      () => {
        if (skip || !ref) return;
        let unobserve;
        unobserve = observe(
          ref,
          (inView, entry) => {
            setState({
              inView,
              entry
            });
            if (callback.current) callback.current(inView, entry);
            if (entry.isIntersecting && triggerOnce && unobserve) {
              unobserve();
              unobserve = void 0;
            }
          },
          {
            root: root2,
            rootMargin,
            threshold,
            // @ts-ignore
            trackVisibility,
            // @ts-ignore
            delay: delay2
          },
          fallbackInView
        );
        return () => {
          if (unobserve) {
            unobserve();
          }
        };
      },
      // We break the rule here, because we aren't including the actual `threshold` variable
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        // If the threshold is an array, convert it to a string, so it won't change between renders.
        Array.isArray(threshold) ? threshold.toString() : threshold,
        ref,
        root2,
        rootMargin,
        triggerOnce,
        skip,
        trackVisibility,
        fallbackInView,
        delay2
      ]
    );
    const entryTarget = (_a2 = state.entry) == null ? void 0 : _a2.target;
    const previousEntryTarget = React__namespace.useRef(void 0);
    if (!ref && entryTarget && !triggerOnce && !skip && previousEntryTarget.current !== entryTarget) {
      previousEntryTarget.current = entryTarget;
      setState({
        inView: !!initialInView,
        entry: void 0
      });
    }
    const result = [setRef, state.inView, state.entry];
    result.ref = result[0];
    result.inView = result[1];
    result.entry = result[2];
    return result;
  }
  ({
    List: React.forwardRef(({
      context: ctx,
      children,
      ...props
    }, ref) => {
      function setForwardedRef(el) {
        if (!ref) return;
        if (typeof ref === "function") {
          ref(el);
        } else {
          ref.current = el;
        }
      }
      return /* @__PURE__ */ jsx$1("div", { ref: (el) => {
        setForwardedRef(el);
        ctx.containerRef.current = el;
      }, ...props, className: ctx.gridClassName, children });
    }),
    Footer({
      context: ctx,
      ...props
    }) {
      return /* @__PURE__ */ jsx$1(Fragment, { children: ctx.footerContent });
    }
    // Item: ({ context: ctx, children, ...props }) => {
    //   // const cloned = cloneElement(children)
    //   // return null
    // },
  });
  const iconParkOutlineLoading = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M4 24c0 11.046 8.954 20 20 20v0c11.046 0 20-8.954 20-20S35.046 4 24 4" }),
    /* @__PURE__ */ jsx$1("path", { d: "M36 24c0-6.627-5.373-12-12-12s-12 5.373-12 12s5.373 12 12 12v0" })
  ] }) });
  const ForwardRef$8 = React.forwardRef(iconParkOutlineLoading);
  const tablerFaceIdError = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2m8-16h2a2 2 0 0 1 2 2v2m-4 12h2a2 2 0 0 0 2-2v-2M9 10h.01M15 10h.01M9.5 15.05a3.5 3.5 0 0 1 5 0" }) });
  const ForwardRef$7 = React.forwardRef(tablerFaceIdError);
  const debug$3 = baseDebug.extend("components:RecGrid");
  const RecGrid = React.forwardRef(function(props, ref) {
    const servicesRegistry = useRefStateBox(() => ({}));
    const tab2 = React.useDeferredValue(useCurrentUsingTab());
    const prevTab = usePrevious$1(tab2);
    const tabOrders = useSortedTabKeys();
    const direction = React.useMemo(() => {
      return prevTab ? tabOrders.indexOf(tab2) > tabOrders.indexOf(prevTab) ? "right" : "left" : void 0;
    }, [tabOrders, tab2]);
    return /* @__PURE__ */ jsx(RecGridInner, { ...props, key: tab2, tab: tab2, direction, handlersRef: ref, servicesRegistry });
  });
  var _ref3$7 = {
    name: "13dbzy7",
    styles: "grid-column:1/-1;.ant-divider-inner-text{display:inline-flex;align-items:center;min-height:30px;a{color:var(--ant-color-link);&:hover{color:var(--ant-color-primary);}}}"
  };
  var _ref4$7 = {
    name: "1uiai01",
    styles: "min-height:100vh"
  };
  var _ref5$5 = {
    name: "bd67qz",
    styles: "grid-column:1/-1;padding:30px 0;display:flex;align-items:center;justify-content:center;font-size:120%"
  };
  const RecGridInner = React.memo(function({
    infiniteScrollUseWindow,
    shortcutEnabled,
    onScrollToTop,
    className,
    scrollerRef,
    onUpdateRefreshing,
    onUpdateExtraInfo,
    tab: tab2,
    handlersRef,
    servicesRegistry
  }) {
    const loadCompleteCountBox = useRefStateBox(0);
    const unmountedRef = useUnmountedRef();
    const updateExtraInfo = useMemoizedFn((tab22) => {
      var _a2;
      if (unmountedRef.current) return;
      const info = (_a2 = servicesRegistry.val[tab22]) == null ? void 0 : _a2.usageInfo;
      onUpdateExtraInfo == null ? void 0 : onUpdateExtraInfo(info);
    });
    const preAction = useMemoizedFn(() => {
      clearActiveIndex();
      updateExtraInfo(tab2);
      onScrollToTop == null ? void 0 : onScrollToTop();
    });
    const postAction = useMemoizedFn(() => {
      clearActiveIndex();
      updateExtraInfo(tab2);
      loadCompleteCountBox.set(1);
      setTimeout(checkShouldLoadMore);
    });
    const {
      itemsBox,
      error: refreshError,
      refresh,
      hasMoreBox,
      refreshingBox,
      refreshTsBox,
      refreshAbortController,
      showSkeleton,
      beforeMount
    } = useRefresh({
      tab: tab2,
      servicesRegistry,
      debug: debug$3,
      fetcher: refreshForGrid,
      // actions
      preAction,
      postAction,
      onUpdateRefreshing
    });
    React.useImperativeHandle(handlersRef, () => ({
      refresh
    }), [refresh]);
    const goOutAt = React.useRef();
    useEventListener("visibilitychange", (e) => {
      const visible = document.visibilityState === "visible";
      if (!visible) {
        goOutAt.current = Date.now();
        return;
      }
      if (refreshingBox.val) return;
      if (loadMoreLocker.current[refreshTsBox.val]) return;
      if (tab2 === ETab.Watchlater && goOutAt.current && Date.now() - goOutAt.current > ms("1h")) {
        refresh(true);
      }
    }, {
      target: document
    });
    const checkShouldLoadMore = useMemoizedFn(async () => {
      await delay(isSafari ? 100 : 0);
      debug$3("checkShouldLoadMore(): footerInView = %s", footerInViewRef.current);
      if (footerInViewRef.current) {
        loadMore();
      }
    });
    const loadMoreLocker = React.useRef({});
    const lock = React.useCallback((refreshedAt) => {
      loadMoreLocker.current = {
        [refreshedAt]: true
      };
    }, []);
    const unlock = React.useCallback((refreshedAt) => {
      loadMoreLocker.current[refreshedAt] = false;
    }, []);
    const isLocked = useMemoizedFn((refreshedAt) => !!loadMoreLocker.current[refreshedAt]);
    const loadMore = useMemoizedFn(async () => {
      if (unmountedRef.current) return;
      if (!hasMoreBox.val) return;
      if (refreshAbortController.signal.aborted) return;
      if (refreshingBox.val) return;
      const refreshTsWhenStart = refreshTsBox.val;
      if (isLocked(refreshTsWhenStart)) return;
      lock(refreshTsWhenStart);
      let newItems = itemsBox.val;
      let newHasMore = true;
      let err;
      try {
        const service = getServiceFromRegistry(servicesRegistry, tab2);
        let more = await service.loadMore(refreshAbortController.signal) || [];
        more = filterRecItems(more, tab2);
        newItems = concatThenUniq(newItems, more);
        newHasMore = service.hasMore;
      } catch (e) {
        err = e;
      }
      if (err) {
        unlock(refreshTsWhenStart);
        throw err;
      }
      if (refreshTsWhenStart !== refreshTsBox.val) {
        debug$3("loadMore: skip update for mismatch refreshedAt, %s != %s", refreshTsWhenStart, refreshTsBox.val);
        return;
      }
      debug$3("loadMore: seq(%s) len %s -> %s", loadCompleteCountBox.val + 1, itemsBox.val.length, newItems.length);
      hasMoreBox.set(newHasMore);
      itemsBox.set(newItems);
      loadCompleteCountBox.set((c2) => c2 + 1);
      unlock(refreshTsWhenStart);
      checkShouldLoadMore();
    });
    const usingItems = itemsBox.state;
    const containerRef = React.useRef(null);
    const getScrollerRect = useMemoizedFn(() => {
      var _a2;
      if (infiniteScrollUseWindow) {
        const yStart = $headerHeight.get() + 50;
        return new DOMRect(0, yStart, window.innerWidth, window.innerHeight - yStart);
      } else {
        return (_a2 = scrollerRef == null ? void 0 : scrollerRef.current) == null ? void 0 : _a2.getBoundingClientRect();
      }
    });
    const modalDislikeVisible = useModalDislikeVisible();
    const usingVideoItems = React.useMemo(() => {
      return usingItems.filter((x) => x.api !== EApiType.Separator);
    }, [usingItems]);
    const emitterCache = React.useMemo(() => /* @__PURE__ */ new Map(), [refreshTsBox.state]);
    const videoCardEmitters = React.useMemo(() => {
      return usingVideoItems.map(({
        uniqId
      }) => {
        const cacheKey2 = uniqId;
        return emitterCache.get(cacheKey2) || (() => {
          const instance = mitt();
          emitterCache.set(cacheKey2, instance);
          return instance;
        })();
      });
    }, [usingVideoItems]);
    React.useEffect(() => {
      const broadcastMouseEnter = (srcUniqId) => {
        videoCardEmitters.forEach((emitter2) => {
          emitter2.emit("mouseenter-other-card", srcUniqId);
        });
      };
      videoCardEmitters.forEach((emitter2) => {
        emitter2.on("mouseenter", broadcastMouseEnter);
      });
      return () => {
        videoCardEmitters.forEach((emitter2) => {
          emitter2.off("mouseenter");
        });
      };
    }, [videoCardEmitters]);
    const {
      activeIndex,
      clearActiveIndex
    } = useShortcut({
      enabled: shortcutEnabled && !modalDislikeVisible,
      refresh,
      maxIndex: usingVideoItems.length - 1,
      containerRef,
      getScrollerRect,
      videoCardEmitters,
      changeScrollY: infiniteScrollUseWindow ? function({
        offset,
        absolute
      }) {
        const scroller = document.documentElement;
        if (typeof offset === "number") {
          scroller.scrollTop += offset;
          return;
        }
        if (typeof absolute === "number") {
          scroller.scrollTop = absolute;
          return;
        }
      } : void 0
    });
    const setItems = itemsBox.set;
    const handleRemoveCard = useMemoizedFn((item, data2) => {
      setItems((items) => {
        var _a2, _b2;
        const index = items.findIndex((x) => x.uniqId === item.uniqId);
        if (index === -1) return items;
        const newItems = items.slice();
        newItems.splice(index, 1);
        antMessage.success(`已移除: ${data2.title}`, 4);
        if (tab2 === ETab.Watchlater) {
          (_a2 = servicesRegistry.val[tab2]) == null ? void 0 : _a2.decreaseTotal();
          updateExtraInfo(tab2);
        }
        if (tab2 === ETab.Fav) {
          (_b2 = servicesRegistry.val[tab2]) == null ? void 0 : _b2.decreaseTotal();
          updateExtraInfo(tab2);
        }
        return newItems;
      });
    });
    const handleMoveCardToFirst = useMemoizedFn((item, data2) => {
      setItems((items) => {
        const currentItem = items.find((x) => x.uniqId === item.uniqId);
        if (!currentItem) return items;
        const index = items.indexOf(currentItem);
        const newItems = items.slice();
        newItems.splice(index, 1);
        const newIndex = newItems.findIndex((x) => x.api !== EApiType.Separator);
        newItems.splice(newIndex, 0, currentItem);
        return newItems;
      });
    });
    const refreshing = refreshingBox.state;
    const hasMore = hasMoreBox.state;
    const {
      ref: footerRef,
      inView: __footerInView
    } = useInView({
      root: infiniteScrollUseWindow ? null : (scrollerRef == null ? void 0 : scrollerRef.current) || null,
      rootMargin: `0px 0px ${window.innerHeight}px 0px`,
      onChange(inView) {
        if (inView) {
          debug$3("footerInView change to visible", inView);
          setTimeout(checkShouldLoadMore);
        }
      }
    });
    const footerInViewRef = useLatest(__footerInView);
    const footer = /* @__PURE__ */ jsx$1("div", { ref: footerRef, css: _ref5$5, children: !refreshing && /* @__PURE__ */ jsx$1(Fragment, { children: hasMore ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(ForwardRef$8, { className: "size-40px animate-spin mr-10px", css: /* @__PURE__ */ css("color:", colorPrimaryValue, ";", "") }),
      "加载中~"
    ] }) : /* @__PURE__ */ jsx$1(Fragment, { children: "没有更多了~" }) }) });
    const {
      useNarrowMode,
      style
    } = useSettingsSnapshot();
    const gridClassName = clsx(
      APP_CLS_GRID,
      // for customize css
      videoGrid,
      newCardStyle,
      style.pureRecommend.useCustomGrid ? videoGridCustom : videoGridBiliFeed4,
      useNarrowMode && narrowMode,
      // 居中
      className
    );
    const cardBorderCss = useCardBorderCss();
    React.useMemo(() => {
      return {
        footerContent: footer,
        containerRef,
        gridClassName
        // renderItem,
      };
    }, [footer, containerRef, gridClassName]);
    const wrap = ({
      gridChildren,
      gridSiblings
    } = {}) => {
      return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: videoGridContainer, css: _ref4$7, children: [
        /* @__PURE__ */ jsx$1("div", { className: gridClassName, children: gridChildren }),
        gridSiblings
      ] });
    };
    if (beforeMount) {
      return wrap();
    }
    if (refreshError) {
      console.error("RecGrid.refresh error:", refreshError.stack || refreshError);
      return wrap({
        gridSiblings: /* @__PURE__ */ jsx$1(ErrorDetail, { tab: tab2, err: refreshError })
      });
    }
    if (refreshing && showSkeleton) {
      const cardCount = getGridRefreshCount();
      return wrap({
        gridChildren: new Array(cardCount).fill(0).map((_, index) => {
          return /* @__PURE__ */ jsx$1(VideoCard, { loading: true, className: APP_CLS_CARD, tab: tab2 }, index);
        })
      });
    }
    const renderItem = (item) => {
      if (item.api === EApiType.Separator) {
        return /* @__PURE__ */ jsx$1(antd.Divider, { css: _ref3$7, orientation: "left", children: item.content }, item.uniqId);
      } else {
        const index = usingVideoItems.findIndex((x) => x.uniqId === item.uniqId);
        const active = index === activeIndex;
        return /* @__PURE__ */ jsx$1(VideoCard, { className: clsx(APP_CLS_CARD, {
          [APP_CLS_CARD_ACTIVE]: active
        }), baseCss: [cardBorderCss, getActiveCardBorderCss(active)], item, active, onRemoveCurrent: handleRemoveCard, onMoveToFirst: handleMoveCardToFirst, onRefresh: refresh, emitter: videoCardEmitters[index], tab: tab2 }, item.uniqId);
      }
    };
    return wrap({
      gridChildren: usingItems.map((item) => renderItem(item)),
      gridSiblings: footer
    });
  });
  const isAxiosError = (err) => {
    return err instanceof Error && err.name === "AxiosError";
  };
  const errorParagraph = {
    name: "1r0yqr6",
    styles: "margin-top:10px"
  };
  function inspectErr(err) {
    var _a2, _b2;
    const nodes = [];
    const wrapParagraph = (node2) => /* @__PURE__ */ jsx$1("p", { css: errorParagraph, children: node2 });
    if (!(err instanceof Error)) {
      nodes.push(JSON.stringify(err));
    } else {
      if (err.stack) {
        nodes.push(wrapParagraph(/* @__PURE__ */ jsxs(Fragment, { children: [
          "Error Stack: ",
          /* @__PURE__ */ jsx$1("br", {}),
          err.stack
        ] })));
      } else {
        nodes.push(wrapParagraph(/* @__PURE__ */ jsxs(Fragment, { children: [
          "Error Message: ",
          err.message
        ] })));
      }
      if (err.cause) {
        nodes.push(wrapParagraph(/* @__PURE__ */ jsxs(Fragment, { children: [
          "Error Cause: ",
          inspectErr(err.cause)
        ] })));
      }
      if (isAxiosError(err)) {
        const _err = cloneDeep(err);
        if ((_b2 = (_a2 = _err.config) == null ? void 0 : _a2.params) == null ? void 0 : _b2.access_key) {
          _err.config.params.access_key = "*".repeat(_err.config.params.access_key.length);
        }
        nodes.push(wrapParagraph(/* @__PURE__ */ jsxs(Fragment, { children: [
          "axios config: ",
          JSON.stringify(_err.config, null, 2)
        ] })));
      }
    }
    return nodes;
  }
  var _ref$e = {
    name: "wlqjk1",
    styles: "overflow:hidden;white-space:pre-wrap;word-break:normal;max-height:50vh;overflow-y:scroll"
  };
  var _ref2$a = {
    name: "33payq",
    styles: "font-size:20px;padding:20px;text-align:center"
  };
  function ErrorDetail({
    err,
    tab: tab2
  }) {
    const target = useLinkTarget();
    const errDetail = React.useMemo(() => inspectErr(err), [err]);
    return /* @__PURE__ */ jsxs("div", { css: _ref2$a, children: [
      /* @__PURE__ */ jsx$1(AntdTooltip, { title: /* @__PURE__ */ jsxs("div", { className: "p-block-10", children: [
        /* @__PURE__ */ jsx$1("h3", { children: "错误详情" }),
        /* @__PURE__ */ jsx$1("div", { css: _ref$e, children: errDetail })
      ] }), children: /* @__PURE__ */ jsxs("p", { className: "cursor-pointer flex items-center justify-center", children: [
        /* @__PURE__ */ jsx$1(ForwardRef$7, { className: "mr-4" }),
        "出错了, 请刷新重试!"
      ] }) }),
      tab2 === ETab.Hot && hotStore.subtab === EHotSubTab.PopularWeekly && /* @__PURE__ */ jsxs("p", { className: "mt-8 flex items-center justify-center", children: [
        "可能需手动输入验证码",
        /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { className: "ml-12" }),
        /* @__PURE__ */ jsx$1("a", { href: "https://www.bilibili.com/v/popular/weekly", target, className: "ml-2", children: "每周必看" })
      ] })
    ] });
  }
  function useSizeExpression(target, fn, initialValue2) {
    const _fn = useMemoizedFn(fn);
    const box = useRefStateBox(initialValue2);
    React.useEffect(() => {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === target && entry.contentRect) {
            const val = _fn(entry);
            if (!isEqual$2(box.val, val)) {
              box.set(val);
            }
          }
        }
      });
      observer.observe(target);
      return () => {
        observer.disconnect();
      };
    }, [target, _fn]);
    return box.state;
  }
  function useSticky() {
    const stickyRef = React.useRef(null);
    const [sticky, setSticky] = React.useState(false);
    React.useEffect(() => {
      function observe2() {
        if (!stickyRef.current) return;
        const refPageOffset = Math.trunc(stickyRef.current.getBoundingClientRect().top * 10) / 10;
        const stickyOffset = parseInt(getComputedStyle(stickyRef.current).top);
        const stickyActive = refPageOffset <= stickyOffset;
        setSticky(stickyActive);
      }
      observe2();
      document.addEventListener("scroll", observe2);
      window.addEventListener("resize", observe2);
      window.addEventListener("orientationchange", observe2);
      return () => {
        document.removeEventListener("scroll", observe2);
        window.removeEventListener("resize", observe2);
        window.removeEventListener("orientationchange", observe2);
      };
    }, [sticky]);
    return [stickyRef, sticky];
  }
  var _ref$d = {
    name: "d3v9zr",
    styles: "overflow:hidden"
  };
  function CollapsePanel({
    expanded,
    children,
    ...props
  }) {
    return /* @__PURE__ */ jsx$1("div", { ...props, "data-classname": "wrapper", css: /* @__PURE__ */ css("transition:grid-template-rows 0.2s ease-out;display:grid;grid-template-rows:", expanded ? 1 : 0, "fr;", ""), children: /* @__PURE__ */ jsx$1("div", { "data-classname": "inner", css: _ref$d, children }) });
  }
  let lastUrl;
  function genUrl() {
    tryit(() => {
      if (lastUrl) URL.revokeObjectURL(lastUrl);
      lastUrl = void 0;
    })();
    const val = getSettingsSnapshot();
    const json = JSON.stringify(val, null, 2);
    const blob = new Blob([json], {
      type: "application/json"
    });
    lastUrl = URL.createObjectURL(blob);
    return lastUrl;
  }
  async function exportSettings() {
    const url = genUrl();
    const filename = `${APP_NAME}-settings ${dayjs().format("YYYY-MM-DD HH:mm:ss")}.json`;
    if (typeof GM_download !== "undefined") {
      GM_download == null ? void 0 : GM_download({
        url,
        name: filename
      });
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    }
  }
  async function importSettings() {
    const file = await chooseSingleJsonFile();
    if (!file) return;
    const text = await file.text();
    if (!text) return toast("文件内容为空!");
    let settingsFromFile;
    try {
      settingsFromFile = JSON.parse(text);
    } catch (error) {
      return toast("无法解析文件内容!");
    }
    runSettingsMigration(settingsFromFile);
    const {
      pickedPaths,
      pickedSettings
    } = pickSettings(settingsFromFile, allowedLeafSettingsPaths);
    if (!pickedPaths.length) {
      return toast("没有有效的设置!");
    }
    set_HAS_RESTORED_SETTINGS(true);
    updateSettings(pickedSettings);
    antMessage.success("导入成功!");
    return toastAndReload();
  }
  function chooseSingleJsonFile() {
    return chooseFile({
      accept: ".json",
      multiple: false
    });
  }
  function chooseFile(options) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      Object.assign(input, options);
      input.addEventListener("change", () => {
        var _a2;
        resolve(((_a2 = input.files) == null ? void 0 : _a2[0]) || null);
      });
      input.click();
    });
  }
  const tablerFileExport = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M14 3v4a1 1 0 0 0 1 1h4" }),
    /* @__PURE__ */ jsx$1("path", { d: "M11.5 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v5m-5 6h7m-3-3l3 3l-3 3" })
  ] }) });
  const ForwardRef$6 = React.forwardRef(tablerFileExport);
  const tablerFileImport = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M14 3v4a1 1 0 0 0 1 1h4" }),
    /* @__PURE__ */ jsx$1("path", { d: "M5 13V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-5.5M2 19h7m-3-3l3 3l-3 3" })
  ] }) });
  const ForwardRef$5 = React.forwardRef(tablerFileImport);
  const tablerRestore = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 24 24", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M3.06 13a9 9 0 1 0 .49-4.087" }),
    /* @__PURE__ */ jsx$1("path", { d: "M3 4.001v5h5M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0" })
  ] }) });
  const ForwardRef$4 = React.forwardRef(tablerRestore);
  const S$3 = {
    settingsGroup: {
      name: "pr10xp",
      styles: "margin-bottom:10px"
    },
    settingsGroupTitle: {
      name: "1njdmmk",
      styles: "font-size:2em;display:flex;align-items:center"
    },
    settingsGroupSubTitle: {
      name: "q5l76e",
      styles: "font-size:1.3em;display:flex;align-items:center;margin-top:15px"
    },
    settingsGroupContent: {
      name: "99q1m7",
      styles: "color:default;button:first-child{margin-left:0;}"
    }
  };
  function SettingsGroup({
    children,
    title,
    titleCss,
    ...rest
  }) {
    return /* @__PURE__ */ jsxs("div", { css: S$3.settingsGroup, "data-as": "settings-group", ...rest, children: [
      /* @__PURE__ */ jsx$1("div", { css: [S$3.settingsGroupTitle, titleCss, "", ""], "data-as": "settings-group-title", children: title }),
      /* @__PURE__ */ jsx$1("div", { css: S$3.settingsGroupContent, "data-as": "settings-group-content", children: /* @__PURE__ */ jsx$1(antd.Space, { size: 5, direction: "vertical", className: "flex", children }) })
    ] });
  }
  function resetPartialSettings(paths) {
    const {
      pickedSettings
    } = pickSettings(initialSettings, paths);
    updateSettings(pickedSettings);
  }
  var _ref$c = {
    name: "1opo4ia",
    styles: "column-gap:4px"
  };
  function ResetPartialSettingsButton({
    paths,
    className
  }) {
    return /* @__PURE__ */ jsx$1(antd.Popconfirm, { title: "确定重置下面的设置项?", onConfirm: () => resetPartialSettings(paths), children: /* @__PURE__ */ jsxs(antd.Button, { className, css: _ref$c, children: [
      /* @__PURE__ */ jsx$1(ForwardRef$B, { ...size(12), css: C.mt(-1) }),
      /* @__PURE__ */ jsx$1("span", { children: "重置" })
    ] }) });
  }
  const iconParkOutlineDownC = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, children: [
    /* @__PURE__ */ jsx$1("path", { d: "M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z" }),
    /* @__PURE__ */ jsx$1("path", { strokeLinecap: "round", d: "m33 21l-9 9l-9-9" })
  ] }) });
  const ForwardRef$3 = React.forwardRef(iconParkOutlineDownC);
  function onResetSettings() {
    resetSettings();
    return toastAndReload();
  }
  async function onRestoreSettings() {
    const remoteSettings = await articleDraft.getData();
    const pickedPaths = getLeafPaths(remoteSettings || {}).filter((p) => allowedLeafSettingsPaths.includes(p) && !restoreOmitPaths.includes(p));
    if (!pickedPaths.length) {
      return antMessage.error("备份不存在或没有有效的配置");
    }
    const pickedSettings = {};
    pickedPaths.forEach((p) => {
      set(pickedSettings, p, get(remoteSettings, p));
    });
    set_HAS_RESTORED_SETTINGS(true);
    updateSettings(pickedSettings);
    return toastAndReload();
  }
  var _ref$b = {
    name: "2o6p8u",
    styles: "justify-content:space-between"
  };
  function TabPaneAdvance() {
    const {
      autoPreviewUpdateInterval
    } = useSettingsSnapshot();
    const [internalKeysExpanded, setInternalKeysExpanded] = React.useState(false);
    return /* @__PURE__ */ jsxs("div", { className: styles$1.tabPane, children: [
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: "设置项", children: /* @__PURE__ */ jsxs(antd.Space, { size: 20, children: [
        /* @__PURE__ */ jsx$1(antd.Popconfirm, { title: "确定", description: "确定恢复默认设置? 此操作不可逆!", onConfirm: onResetSettings, children: /* @__PURE__ */ jsxs(antd.Button, { danger: true, type: "primary", children: [
          /* @__PURE__ */ jsx$1(ForwardRef$4, {}),
          "恢复默认设置"
        ] }) }),
        /* @__PURE__ */ jsxs(antd.Space, { size: 5, children: [
          /* @__PURE__ */ jsx$1(AntdTooltip, { title: "导出所有设置项到文件中, 包含 access_key 等数据", children: /* @__PURE__ */ jsxs(antd.Button, { onClick: () => exportSettings(), children: [
            /* @__PURE__ */ jsx$1(ForwardRef$6, {}),
            "导出设置"
          ] }) }),
          /* @__PURE__ */ jsx$1(AntdTooltip, { title: "从文件中导入设置项, 将覆盖当前设置, 此操作不可逆!", children: /* @__PURE__ */ jsxs(antd.Button, { onClick: () => importSettings(), children: [
            /* @__PURE__ */ jsx$1(ForwardRef$5, {}),
            "导入设置"
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(SettingsGroup, { title: "备份/恢复", children: [
        /* @__PURE__ */ jsxs("div", { css: flexVerticalCenterStyle, children: [
          /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "backupSettingsToArticleDraft", label: "备份设置到专栏草稿箱中", tooltip: `专栏 - 草稿箱 - ${APP_NAME}` }),
          /* @__PURE__ */ jsxs("a", { style: {
            marginLeft: 15,
            display: "inline-flex",
            alignItems: "center"
          }, href: "https://member.bilibili.com/platform/upload/text/draft", target: "_blank", children: [
            /* @__PURE__ */ jsx$1(IconForOpenExternalLink, { css: [C.size(16), C.mr(4), "", ""] }),
            "去草稿箱浏览"
          ] })
        ] }),
        /* @__PURE__ */ jsx$1(antd.Popconfirm, { title: "确定", description: "将覆盖本地设置? 此操作不可逆!", onConfirm: onRestoreSettings, children: /* @__PURE__ */ jsxs(antd.Button, { danger: true, type: "primary", children: [
          /* @__PURE__ */ jsx$1(ForwardRef$4, {}),
          "从专栏草稿箱中恢复"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(SettingsGroup, { titleCss: _ref$b, title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "预览",
        /* @__PURE__ */ jsx$1(ResetPartialSettingsButton, { paths: ["autoPreviewUpdateInterval", "autoPreviewUseContinuousProgress"] })
      ] }), children: [
        /* @__PURE__ */ jsxs("div", { css: flexVerticalCenterStyle, children: [
          "自动预览更新间隔",
          /* @__PURE__ */ jsx$1(antd.Slider, { style: {
            flex: 1,
            margin: "0 15px"
          }, min: 0, max: 1e3, keyboard: true, onChange: (val) => settings.autoPreviewUpdateInterval = val, value: autoPreviewUpdateInterval }),
          /* @__PURE__ */ jsxs("span", { style: {
            width: "65px"
          }, children: [
            "(",
            autoPreviewUpdateInterval,
            "ms)"
          ] })
        ] }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "autoPreviewUseContinuousProgress", label: "自动预览: 使用连续式进度条", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "✅ 连续式进度条",
          /* @__PURE__ */ jsx$1("br", {}),
          "❎ 跳跃式进度条"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "其他",
        /* @__PURE__ */ jsxs(HelpInfo, { children: [
          "这里是一些作者不愿意解释的设置项😬 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "随时会删, don't rely on it"
        ] }),
        /* @__PURE__ */ jsx$1(antd.Button, { onClick: () => setInternalKeysExpanded((v) => !v), className: "ml-10px", css: [iconOnlyRoundButtonCss, internalKeysExpanded && buttonOpenCss, "", ""], children: /* @__PURE__ */ jsx$1(ForwardRef$3, { ...size(16), css: /* @__PURE__ */ css("transition:transform 0.3s ease;transform:", internalKeysExpanded ? "rotate(180deg)" : "rotate(0deg)", ";", "") }) })
      ] }), children: /* @__PURE__ */ jsx$1(CollapsePanel, { expanded: internalKeysExpanded, children: /* @__PURE__ */ jsxs("div", { css: /* @__PURE__ */ css("border:1px solid ", borderColorValue, ";padding:10px;width:100%;border-radius:6px;display:flex;column-gap:20px;", ""), children: [
        /* @__PURE__ */ jsx$1(ResetPartialSettingsButton, { paths: internalBooleanPaths }),
        /* @__PURE__ */ jsx$1(antd.Space, { size: [20, 10], wrap: true, children: internalBooleanPaths.map((k) => /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: k, tooltip: k, label: startCase(k.slice("__internal".length)) }, k)) })
      ] }) }) })
    ] });
  }
  class TimeoutError extends Error {
    constructor(message2) {
      super(message2);
      this.name = "TimeoutError";
    }
  }
  class AbortError2 extends Error {
    constructor(message2) {
      super();
      this.name = "AbortError";
      this.message = message2;
    }
  }
  const getDOMException = (errorMessage) => globalThis.DOMException === void 0 ? new AbortError2(errorMessage) : new DOMException(errorMessage);
  const getAbortedReason = (signal) => {
    const reason = signal.reason === void 0 ? getDOMException("This operation was aborted.") : signal.reason;
    return reason instanceof Error ? reason : getDOMException(reason);
  };
  function pTimeout(promise, options) {
    const {
      milliseconds,
      fallback,
      message: message2,
      customTimers = { setTimeout, clearTimeout }
    } = options;
    let timer;
    const wrappedPromise = new Promise((resolve, reject) => {
      if (typeof milliseconds !== "number" || Math.sign(milliseconds) !== 1) {
        throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
      }
      if (options.signal) {
        const { signal } = options;
        if (signal.aborted) {
          reject(getAbortedReason(signal));
        }
        signal.addEventListener("abort", () => {
          reject(getAbortedReason(signal));
        });
      }
      if (milliseconds === Number.POSITIVE_INFINITY) {
        promise.then(resolve, reject);
        return;
      }
      const timeoutError = new TimeoutError();
      timer = customTimers.setTimeout.call(void 0, () => {
        if (fallback) {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }
          return;
        }
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        if (message2 === false) {
          resolve();
        } else if (message2 instanceof Error) {
          reject(message2);
        } else {
          timeoutError.message = message2 ?? `Promise timed out after ${milliseconds} milliseconds`;
          reject(timeoutError);
        }
      }, milliseconds);
      (async () => {
        try {
          resolve(await promise);
        } catch (error) {
          reject(error);
        }
      })();
    });
    const cancelablePromise = wrappedPromise.finally(() => {
      cancelablePromise.clear();
    });
    cancelablePromise.clear = () => {
      customTimers.clearTimeout.call(void 0, timer);
      timer = void 0;
    };
    return cancelablePromise;
  }
  const normalizeEmitter = (emitter2) => {
    const addListener = emitter2.addEventListener || emitter2.on || emitter2.addListener;
    const removeListener = emitter2.removeEventListener || emitter2.off || emitter2.removeListener;
    if (!addListener || !removeListener) {
      throw new TypeError("Emitter is not compatible");
    }
    return {
      addListener: addListener.bind(emitter2),
      removeListener: removeListener.bind(emitter2)
    };
  };
  function pEventMultiple(emitter2, event, options) {
    let cancel;
    const returnValue = new Promise((resolve, reject) => {
      var _a2;
      options = {
        rejectionEvents: ["error"],
        multiArgs: false,
        resolveImmediately: false,
        ...options
      };
      if (!(options.count >= 0 && (options.count === Number.POSITIVE_INFINITY || Number.isInteger(options.count)))) {
        throw new TypeError("The `count` option should be at least 0 or more");
      }
      (_a2 = options.signal) == null ? void 0 : _a2.throwIfAborted();
      const events2 = [event].flat();
      const items = [];
      const { addListener, removeListener } = normalizeEmitter(emitter2);
      const onItem = (...arguments_) => {
        const value = options.multiArgs ? arguments_ : arguments_[0];
        if (options.filter && !options.filter(value)) {
          return;
        }
        items.push(value);
        if (options.count === items.length) {
          cancel();
          resolve(items);
        }
      };
      const rejectHandler = (error) => {
        cancel();
        reject(error);
      };
      cancel = () => {
        for (const event2 of events2) {
          removeListener(event2, onItem);
        }
        for (const rejectionEvent of options.rejectionEvents) {
          removeListener(rejectionEvent, rejectHandler);
        }
      };
      for (const event2 of events2) {
        addListener(event2, onItem);
      }
      for (const rejectionEvent of options.rejectionEvents) {
        addListener(rejectionEvent, rejectHandler);
      }
      if (options.signal) {
        options.signal.addEventListener("abort", () => {
          rejectHandler(options.signal.reason);
        }, { once: true });
      }
      if (options.resolveImmediately) {
        resolve(items);
      }
    });
    returnValue.cancel = cancel;
    if (typeof options.timeout === "number") {
      const timeout = pTimeout(returnValue, { milliseconds: options.timeout });
      timeout.cancel = cancel;
      return timeout;
    }
    return returnValue;
  }
  function pEvent(emitter2, event, options) {
    if (typeof options === "function") {
      options = { filter: options };
    }
    options = {
      ...options,
      count: 1,
      resolveImmediately: false
    };
    const arrayPromise = pEventMultiple(emitter2, event, options);
    const promise = arrayPromise.then((array) => array[0]);
    promise.cancel = arrayPromise.cancel;
    return promise;
  }
  const newSignedForm = (params) => {
    const sign = appSign(params, TVKeyInfo.appkey, TVKeyInfo.appsec);
    return new URLSearchParams({
      ...params,
      sign
    });
  };
  async function getQrCodeInfo() {
    const res = await request.post(
      "https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code",
      newSignedForm({
        appkey: TVKeyInfo.appkey,
        local_id: "0",
        ts: "0"
      })
      // sign: 'e134154ed6add881d28fbdf68653cd9c',
    );
    const json = res.data;
    if (!isWebApiSuccess(json)) {
      toast((json == null ? void 0 : json.message) || "获取 auth_code 失败");
      return;
    }
    return json.data;
  }
  async function poll(auth_code) {
    const res = await request.post("https://passport.bilibili.com/x/passport-tv-login/qrcode/poll", newSignedForm({
      appkey: TVKeyInfo.appkey,
      auth_code,
      local_id: "0",
      ts: "0"
    }));
    const json = res.data;
    const msgMap = {
      "0": "成功",
      "-3": "API校验密匙错误",
      "-400": "请求错误",
      "-404": "啥都木有",
      "86038": "二维码已失效",
      "86039": "二维码尚未确认",
      "86090": "二维码已扫码未确认"
    };
    if (!isWebApiSuccess(json)) {
      const code = json.code.toString();
      const message2 = json.message || msgMap[code] || "未知错误";
      if (code === "86038") {
        return {
          success: false,
          message: message2,
          action: "refresh"
        };
      }
      if (code === "86039" || code === "86090") {
        return {
          success: false,
          message: message2,
          action: "wait"
        };
      }
      return {
        success: false,
        message: message2,
        action: void 0
      };
    }
    const accessKey = json.data.access_token;
    const accessKeyExpireAt = Date.now() + json.data.expires_in * 1e3;
    return {
      success: true,
      message: "获取成功",
      accessKey,
      accessKeyExpireAt
    };
  }
  const initialValue = {
    show: false,
    qrcodeUrl: "",
    auth_code: "",
    message: ""
  };
  const store = proxy({
    ...initialValue
  });
  function updateStore(data2) {
    renderOnce$1();
    Object.assign(store, data2);
  }
  function showQrCodeModal(data2) {
    updateStore({
      ...initialValue,
      ...data2,
      show: true
    });
  }
  function hideQrCodeModal() {
    emitter.emit("hide");
    updateStore({
      ...initialValue
    });
  }
  const emitter = mitt();
  function whenQrCodeModalHide() {
    return pEvent(emitter, "hide");
  }
  var _ref$a = {
    name: "vh5nmu",
    styles: "font-size:13px"
  };
  var _ref2$9 = {
    name: "1als4x4",
    styles: "margin:0 auto;margin-bottom:40px;padding:8px;flex-shrink:0"
  };
  var _ref3$6 = {
    name: "zh6ykh",
    styles: "font-size:14px;display:flex;align-items:center;justify-content:center;min-height:25px;margin-bottom:2px"
  };
  var _ref4$6 = {
    name: "z2rh5z",
    styles: "display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center"
  };
  var _ref5$4 = {
    name: "qamrfb",
    styles: "width:260px;aspect-ratio:10/16"
  };
  var _ref6$2 = {
    name: "9vstlm",
    styles: "backdrop-filter:blur(10px)"
  };
  function TvQrCodeAuth() {
    const {
      qrcodeUrl,
      show,
      message: message2
    } = useSnapshot(store);
    const onHide2 = hideQrCodeModal;
    return /* @__PURE__ */ jsxs(BaseModal, { show, onHide: onHide2, hideWhenMaskOnClick: false, hideWhenEsc: false, cssModalMask: _ref6$2, cssModal: _ref5$4, children: [
      /* @__PURE__ */ jsxs("div", { css: BaseModalStyle.modalHeader, children: [
        /* @__PURE__ */ jsx$1("div", { css: BaseModalStyle.modalTitle }),
        /* @__PURE__ */ jsx$1("div", { className: "space", style: {
          flex: 1
        } }),
        /* @__PURE__ */ jsx$1(ModalClose, { onClick: onHide2 })
      ] }),
      /* @__PURE__ */ jsxs("div", { css: [BaseModalStyle.modalBody, _ref4$6, "", ""], children: [
        /* @__PURE__ */ jsx$1("div", { css: _ref3$6, children: message2 || "" }),
        qrcodeUrl && /* @__PURE__ */ jsx$1(antd.QRCode, { css: _ref2$9, value: qrcodeUrl, size: 200, icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/72/9c/b6/729cb6d8-75f5-0a56-0508-3a26cbba69ae/AppIcon-1x_U007emarketing-0-6-0-0-85-220-0.png/230x0w.webp" }),
        /* @__PURE__ */ jsxs("div", { className: "footnote", css: _ref$a, children: [
          "打开「哔哩哔哩」或「bilibili」App ",
          /* @__PURE__ */ jsx$1("br", {}),
          "扫码获取 access_key"
        ] })
      ] })
    ] });
  }
  const renderOnce$1 = once(function render3() {
    const container = document.createElement("div");
    container.classList.add("modal-tv-qrcode-auth", APP_CLS_ROOT);
    document.body.appendChild(container);
    const r2 = clientExports.createRoot(container);
    r2.render(/* @__PURE__ */ jsx$1(AntdApp, { children: /* @__PURE__ */ jsx$1(TvQrCodeAuth, {}) }));
  });
  async function refreshQrCode() {
    const qrinfo = await getQrCodeInfo();
    if (!qrinfo) return;
    showQrCodeModal({
      qrcodeUrl: qrinfo.url,
      auth_code: qrinfo.auth_code
    });
    return true;
  }
  async function getAccessKeyByQrCode() {
    const next2 = await refreshQrCode();
    if (!next2) return;
    let res;
    let pollfor = store.auth_code;
    function shouldBreak() {
      if (!store.show) return true;
      if (!store.auth_code) return true;
      if (pollfor !== store.auth_code) return true;
    }
    while (true) {
      if (shouldBreak()) return;
      const p1 = delay(1500);
      const p2 = whenQrCodeModalHide();
      await Promise.race([p1, p2]);
      p2.cancel();
      if (shouldBreak()) return;
      if (shouldBreak()) return;
      res = await poll(store.auth_code);
      const {
        success,
        accessKey,
        accessKeyExpireAt,
        message: message2,
        action: action2
      } = res;
      if (shouldBreak()) return;
      updateStore({
        message: message2
      });
      if (success) {
        await delay(1e3);
        hideQrCodeModal();
        return {
          accessKey,
          accessKeyExpireAt
        };
      }
      if (action2 === "refresh") {
        if (shouldBreak()) return;
        await delay(2e3);
        if (shouldBreak()) return;
        await refreshQrCode();
        pollfor = store.auth_code;
        updateStore({
          message: "已刷新二维码"
        });
        continue;
      }
      if (action2 === "wait") {
        continue;
      }
      if (shouldBreak()) return;
      updateStore({
        message: message2
      });
      toast(message2);
      return;
    }
  }
  async function getAccessKey() {
    const {
      accessKey,
      accessKeyExpireAt
    } = await getAccessKeyByQrCode() || {};
    if (!accessKey || !accessKeyExpireAt) return;
    settings.accessKey = accessKey;
    settings.accessKeyExpireAt = accessKeyExpireAt;
    toast("获取成功");
  }
  function deleteAccessKey() {
    settings.accessKey = "";
    settings.accessKeyExpireAt = 0;
    toast("已删除 access_key");
  }
  const btnAccessKeyHelpLink = /* @__PURE__ */ jsx$1(antd.Button, { target: "_blank", href: "https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E", children: "access_key 说明" });
  function AccessKeyManage({
    style,
    className
  }) {
    const {
      runAsync,
      loading
    } = useRequest(getAccessKey, {
      manual: true
    });
    const {
      accessKey
    } = useSettingsSnapshot();
    const onDeleteAccessKey = deleteAccessKey;
    return /* @__PURE__ */ jsx$1(antd.Space, { size: "small", style, className, children: !accessKey ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(antd.Button, { onClick: runAsync, loading, children: "获取 access_key" }),
      btnAccessKeyHelpLink
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(antd.Button, { onClick: runAsync, loading, children: "重新获取 access_key" }),
      /* @__PURE__ */ jsx$1(antd.Popconfirm, { onConfirm: onDeleteAccessKey, title: "确定删除 access_key?", children: /* @__PURE__ */ jsx$1(antd.Button, { children: "删除 access_key" }) }),
      btnAccessKeyHelpLink
    ] }) });
  }
  const iconParkOutlineHelp = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsxs("g", { fill: "none", children: [
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 4, d: "M24 44a19.94 19.94 0 0 0 14.142-5.858A19.94 19.94 0 0 0 44 24a19.94 19.94 0 0 0-5.858-14.142A19.94 19.94 0 0 0 24 4A19.94 19.94 0 0 0 9.858 9.858A19.94 19.94 0 0 0 4 24a19.94 19.94 0 0 0 5.858 14.142A19.94 19.94 0 0 0 24 44Z" }),
    /* @__PURE__ */ jsx$1("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, d: "M24 28.625v-4a6 6 0 1 0-6-6" }),
    /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M24 37.625a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5", clipRule: "evenodd" })
  ] }) });
  const ForwardRef$2 = React.forwardRef(iconParkOutlineHelp);
  var _ref$9 = {
    name: "130v2ht",
    styles: "cursor:pointer;margin-inline:4px"
  };
  var _ref2$8 = {
    name: "1jyrt6z",
    styles: "margin-left:8px;margin-right:4px;font-size:14px;position:relative;top:4px;display:inline-flex;align-items:center"
  };
  var _ref3$5 = {
    name: "4gbgy4",
    styles: "width:160px;margin-left:8px"
  };
  var _ref4$5 = {
    name: "1xyxi5t",
    styles: "display:flex;align-items:flex-start;margin-top:10px;&:first-child{margin-top:0;}.label{display:inline-flex;align-items:center;.text{min-width:95px;margin-left:4px;margin-right:10px;}}"
  };
  var _ref5$3 = {
    name: "1i7a47o",
    styles: "display:flex;align-items:center;.label{margin-left:8px;}"
  };
  function TabPaneBasic() {
    const {
      videoLinkOpenMode
    } = useSettingsSnapshot();
    const openModeOptions = React.useMemo(() => {
      return Object.values(VideoLinkOpenMode).filter((mode) => VideoLinkOpenModeConfig[mode].enabled ?? true).map((mode) => {
        const config = VideoLinkOpenModeConfig[mode];
        return {
          config,
          value: mode,
          label: /* @__PURE__ */ jsxs("span", { css: _ref5$3, children: [
            config.icon,
            /* @__PURE__ */ jsx$1("span", { className: "label", children: config.label })
          ] })
        };
      });
    }, []);
    const handleCopyScriptVersion = useMemoizedFn(() => {
      const content = `v${"0.30.2"}`;
      GM.setClipboard(content);
      antMessage.success(`已复制当前版本: ${content}`);
    });
    return /* @__PURE__ */ jsxs("div", { className: styles$1.tabPane, children: [
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx$1(TabIcon, { tabKey: ETab.AppRecommend, size: 30, mr: 5 }),
        " 推荐 access_key",
        /* @__PURE__ */ jsxs(HelpInfo, { className: "size-18px mt-6px ml-5px", IconComponent: ForwardRef$2, children: [
          /* @__PURE__ */ jsxs("span", { css: inlineFlexVerticalCenterStyle, children: [
            "用于「",
            /* @__PURE__ */ jsx$1(TabIcon, { tabKey: ETab.AppRecommend, mr: 5 }),
            "推荐」Tab"
          ] }),
          /* @__PURE__ */ jsx$1("br", {}),
          "用于 获取推荐 / 提交不喜欢等操作"
        ] })
      ] }), children: /* @__PURE__ */ jsx$1(AccessKeyManage, {}) }),
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: "开关", children: /* @__PURE__ */ jsxs(antd.Space, { size: 10, wrap: true, children: [
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "pureRecommend", label: "全屏模式", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "清空自带推荐内容, 只显示脚本推荐",
          /* @__PURE__ */ jsx$1("br", {}),
          "P.S 需要刷新网页~",
          /* @__PURE__ */ jsx$1("br", {}),
          "P.S 之前版本称 (纯推荐模式)"
        ] }), extraAction: () => toastAndReload() }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "useNarrowMode", label: "居中模式", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "居中两列",
          /* @__PURE__ */ jsx$1("br", {}),
          "切换设置快捷键: ",
          /* @__PURE__ */ jsx$1(antd.Tag, { color: "green", children: "shift+c" })
        ] }) }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "showModalFeedOnLoad", label: "自动「查看更多」", tooltip: "打开首页时自动打开「查看更多」弹窗", extraAction: (val) => {
          if (val) {
            antMessage.success("已开启自动「查看更多」: 下次打开首页时将自动打开「查看更多」弹窗");
          }
        } }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "showModalFeedEntry", label: "「查看更多」按钮", tooltip: "是否展示「查看更多」按钮" })
      ] }) }),
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: "视频链接", children: /* @__PURE__ */ jsxs(antd.Space, { size: 10, children: [
        /* @__PURE__ */ jsxs("div", { css: flexVerticalCenterStyle, children: [
          "默认打开模式",
          /* @__PURE__ */ jsxs(
            HelpInfo,
            {
              tooltipProps: {
                color: "rgba(0, 0, 0, 0.85)"
              },
              children: [
                "选择点击视频(封面图片 或 标题)时打开的模式 ",
                /* @__PURE__ */ jsx$1("br", {}),
                openModeOptions.map(({
                  value,
                  config
                }) => {
                  return !!config.desc && /* @__PURE__ */ jsxs("div", { css: _ref4$5, children: [
                    /* @__PURE__ */ jsxs("span", { className: "label", children: [
                      config.icon,
                      /* @__PURE__ */ jsx$1("span", { className: "text", children: config.label })
                    ] }),
                    /* @__PURE__ */ jsx$1("span", { className: "desc", children: config.desc })
                  ] }, value);
                })
              ]
            }
          ),
          /* @__PURE__ */ jsx$1(antd.Select, { css: _ref3$5, options: openModeOptions, value: videoLinkOpenMode, onChange: (v) => {
            updateSettings({
              videoLinkOpenMode: v
            });
          } })
        ] }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "pipWindowDefaultLocked", label: "小窗默认锁定", tooltip: "开启后,小窗打开时默认为锁定状态" })
      ] }) }),
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: "预览", children: /* @__PURE__ */ jsxs(antd.Space, { size: 10, children: [
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "autoPreviewWhenKeyboardSelect", label: "键盘选中后自动开始预览", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "手动预览快捷键: ",
          /* @__PURE__ */ jsx$1(antd.Tag, { color: "green", children: "." }),
          " or ",
          /* @__PURE__ */ jsx$1(antd.Tag, { color: "green", children: "p" }),
          /* @__PURE__ */ jsx$1("br", {}),
          "切换设置快捷键: ",
          /* @__PURE__ */ jsx$1(antd.Tag, { color: "green", children: "shift+p" })
        ] }) }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "autoPreviewWhenHover", label: "鼠标悬浮后自动开始预览", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "鼠标悬浮后自动开始预览, 预览不再跟随鼠标位置 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "切换设置快捷键: ",
          /* @__PURE__ */ jsx$1(antd.Tag, { color: "green", children: "shift+m" })
        ] }) }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "startPlayFromPreviewPoint", label: "从预览处开始播放", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "视频链接会附加",
          /* @__PURE__ */ jsx$1(antd.Tag, { color: "green", className: "m-inline-4", children: "t=val" }),
          "参数, 从",
          /* @__PURE__ */ jsx$1(antd.Tag, { className: "m-inline-4", color: "green-inverse", children: "t" }),
          "秒开始播放"
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "帮助",
        /* @__PURE__ */ jsxs("span", { css: _ref2$8, children: [
          "当前版本",
          /* @__PURE__ */ jsxs(antd.Tag, { color: "green", onClick: handleCopyScriptVersion, css: _ref$9, children: [
            APP_NAME,
            " v",
            "0.30.2"
          ] }),
          /* @__PURE__ */ jsx$1(IconForCopy, { className: "size-16px cursor-pointer", onClick: handleCopyScriptVersion })
        ] })
      ] }), children: /* @__PURE__ */ jsxs(antd.Space, { size: 10, wrap: true, children: [
        /* @__PURE__ */ jsx$1(antd.Button, { href: "https://github.com/magicdawn/bilibili-gate", target: "_blank", children: "GitHub 主页" }),
        /* @__PURE__ */ jsx$1(antd.Button, { href: "https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate", target: "_blank", children: "GreasyFork 主页" }),
        /* @__PURE__ */ jsx$1(antd.Button, { href: "https://github.com/magicdawn/bilibili-gate#%E5%BF%AB%E6%8D%B7%E9%94%AE%E8%AF%B4%E6%98%8E", target: "_blank", children: "查看可用的快捷键" }),
        /* @__PURE__ */ jsx$1(antd.Button, { href: "https://github.com/magicdawn/bilibili-gate/releases", target: "_blank", children: "更新日志" }),
        /* @__PURE__ */ jsx$1(antd.Button, { href: "https://afdian.com/a/magicdawn", target: "_blank", children: "用 ❤️ 发电" })
      ] }) })
    ] });
  }
  const borderCycleList = [
    {
      useBorder: false
    },
    // no border
    {
      useBorder: true,
      useBorderOnlyOnHover: true
    },
    // on hover
    {
      useBorder: true,
      useBorderOnlyOnHover: false
    }
    // always
  ];
  const borderCycleListLabels = ["「卡片边框」: 禁用", "「卡片边框」: 仅在悬浮时显示", "「卡片边框」: 总是显示"];
  function useHotkeyForConfigBorder() {
    return useKeyPress(["shift.b"], (e) => {
      if (shouldDisableShortcut()) return;
      const curState = pick(settings.style.videoCard, ["useBorder", "useBorderOnlyOnHover"]);
      const curIndex = borderCycleList.findIndex((state) => {
        return isEqual$2(state, pick(curState, Object.keys(state)));
      });
      if (curIndex === -1) throw new Error("unexpected curIndex = -1");
      const nextIndex = (curIndex + 1) % borderCycleList.length;
      const nextState = borderCycleList[nextIndex];
      Object.assign(settings.style.videoCard, nextState);
      const nextLabel = borderCycleListLabels[nextIndex];
      antMessage.success(nextLabel);
    }, {
      exactMatch: true
    });
  }
  const S$2 = {
    tabPane: {
      name: "135w72a",
      styles: "display:flex;flex-direction:column;flex-wrap:wrap;gap:10px 30px;align-content:flex-start"
    },
    itemsContainer: {
      name: "oi98q7",
      styles: "row-gap:4px;display:flex;flex-direction:column"
    }
  };
  function TabPaneCustomUI() {
    const {
      style
    } = useSettingsSnapshot();
    return /* @__PURE__ */ jsxs("div", { className: styles$1.tabPane, css: S$2.tabPane, children: [
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "通用",
        /* @__PURE__ */ jsx$1(ResetPartialSettingsButton, { className: "ml-10", paths: ["style.general.videoSourceTabStandardHeight", "style.general.popoverBorderColorUseColorPrimary"] })
      ] }), children: /* @__PURE__ */ jsxs("div", { css: S$2.itemsContainer, children: [
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.general.videoSourceTabStandardHeight", label: "Tab 栏使用标准高度", tooltip: explainForFlag("标准高度", "紧凑高度") }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.general.popoverBorderColorUseColorPrimary", label: "下拉面板使用主题色边框" })
      ] }) }),
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "全屏模式",
        /* @__PURE__ */ jsx$1(ResetPartialSettingsButton, { className: "ml-10", paths: ["style.pureRecommend.useStickyTabbar", "style.pureRecommend.useCustomGrid", "style.pureRecommend.useWhiteBackground", "style.pureRecommend.hideTopChannel"] })
      ] }), children: /* @__PURE__ */ jsxs("div", { css: S$2.itemsContainer, children: [
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.pureRecommend.useStickyTabbar", label: "全屏模式: sticky tab bar", tooltip: explainForFlag("Tab 栏会吸附在顶栏下方", "Tab 栏会随页面一起滚动") }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.pureRecommend.useCustomGrid", label: "全屏模式: 使用自定义网格配置", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "网格配置指: 网格宽度, 间距, 列数等. ",
          /* @__PURE__ */ jsx$1("br", {}),
          "自定义网格配置: 宽度为90%; 可跟随 Bilibili-Evolved 自定义顶栏配置; 列数: 4 - 10列;",
          " ",
          "由",
          APP_NAME,
          " 自定义; ",
          /* @__PURE__ */ jsx$1("br", {}),
          "默认网格配置: bili-feed4 版本B站首页默认的网格配置; 在 Sarari 中使用建议取消勾选此项."
        ] }) }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.pureRecommend.useWhiteBackground", label: "全屏模式: 使用纯白背景", tooltip: explainForFlag("纯白背景", "浅灰色背景") }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.pureRecommend.hideTopChannel", label: "全屏模式: 隐藏顶部分区和Banner" })
      ] }) }),
      /* @__PURE__ */ jsx$1(SettingsGroup, { title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "视频卡片",
        /* @__PURE__ */ jsx$1(ResetPartialSettingsButton, { className: "ml-10", paths: ["style.videoCard.useBorder", "style.videoCard.useBorderOnlyOnHover", "style.videoCard.useBoxShadow", "style.videoCard.usePadding", "useDelayForHover"] })
      ] }), children: /* @__PURE__ */ jsxs("div", { css: S$2.itemsContainer, children: [
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.videoCard.useBorder", label: "使用卡片边框", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "勾选后, 视频卡片会有边框包裹, 更像是一个卡片~ ",
          /* @__PURE__ */ jsx$1("br", {}),
          "整个卡片区域可点击 / 可触发预览 / 可使用右键菜单 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "否则只是封面区域可以 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "使用快捷键 ",
          /* @__PURE__ */ jsx$1(antd.Tag, { color: "green", children: "shift+b" }),
          " 切换状态",
          /* @__PURE__ */ jsx$1("br", {}),
          borderCycleListLabels.map((label) => /* @__PURE__ */ jsx$1(antd.Tag, { color: "success", children: label }, label))
        ] }) }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.videoCard.useBorderOnlyOnHover", label: "仅在悬浮时显示", disabled: !style.videoCard.useBorder, tooltip: explainForFlag("仅在悬浮时显示", "一直显示") }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.videoCard.useBoxShadow", disabled: !style.videoCard.useBorder, label: "悬浮卡片时使用发光效果", tooltip: /* @__PURE__ */ jsx$1(Fragment, { children: "悬浮卡片时使用发光效果, 看起来比较花哨~" }) }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "useDelayForHover", label: "延迟悬浮预览", tooltip: /* @__PURE__ */ jsx$1(Fragment, { children: "延迟悬浮预览" }) }),
        /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "style.videoCard.usePadding", label: "卡片外扩", tooltip: /* @__PURE__ */ jsx$1(Fragment, { children: "卡片会外扩一点距离" }) })
      ] }) })
    ] });
  }
  const iconParkOutlineCloseSmall = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 4, d: "m14 14l20 20m-20 0l20-20" }) });
  const ForwardRef$1 = React.forwardRef(iconParkOutlineCloseSmall);
  const {
    Search
  } = antd.Input;
  var _ref2$7 = {
    name: "n2wo5l",
    styles: "&.ant-empty-normal{margin-block:5px;}"
  };
  var _ref3$4 = {
    name: "gk0sil",
    styles: "display:flex;flex-wrap:wrap;padding:5px;gap:5px 10px;align-items:flex-start;max-height:250px;overflow-y:scroll;padding-right:10px"
  };
  var _ref4$4 = {
    name: "2vv6yp",
    styles: "color:var(--ant-color-text-disabled);background-color:var(--ant-color-bg-container-disabled);border-color:var(--ant-color-border);box-shadow:none;opacity:1;pointer-events:none;cursor:not-allowed"
  };
  var _ref5$2 = {
    name: "1b794sh",
    styles: "margin-top:5px;margin-bottom:5px"
  };
  function EditableListSettingItem({
    configPath,
    searchProps,
    disabled
  }) {
    const snap = useSettingsSnapshot();
    const rawList = get(snap, configPath);
    const list = React.useMemo(() => uniq(rawList).toReversed(), [rawList]);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(Search, { css: _ref5$2, enterButton: "添加", allowClear: true, disabled, ...searchProps, onSearch: async (val, e) => {
        var _a2;
        if (!val) return;
        const set2 = new Set(await getNewestValueOfSettingsInnerArray(configPath));
        if (set2.has(val)) {
          antMessage.warning(`${val} 已存在`);
          return;
        }
        await updateSettingsInnerArray(configPath, {
          add: [val]
        });
        if (e == null ? void 0 : e.target) {
          const el = e.target;
          const clearBtn = (_a2 = el.closest(".ant-input-wrapper")) == null ? void 0 : _a2.querySelector(".ant-input-clear-icon");
          clearBtn == null ? void 0 : clearBtn.click();
        }
      } }),
      /* @__PURE__ */ jsx$1("div", { css: [/* @__PURE__ */ css("min-height:82px;border-radius:6px;border:1px solid ", borderColorValue, ";margin-top:3px;", ""), disabled && _ref4$4, "", ""], children: list.length ? /* @__PURE__ */ jsx$1("div", { css: _ref3$4, children: list.map((t) => {
        return /* @__PURE__ */ jsx$1(TagItemDisplay, { tag: t, onDelete: async (tag) => {
          await updateSettingsInnerArray(configPath, {
            remove: [tag]
          });
        }, renderTag: configPath === "filter.byAuthor.keywords" ? (tag) => /* @__PURE__ */ jsx$1(UpTagItemDisplay, { tag }) : void 0 }, t);
      }) }) : /* @__PURE__ */ jsx$1(antd.Empty, { image: antd.Empty.PRESENTED_IMAGE_SIMPLE, description: "空空如也", css: _ref2$7 }) })
    ] });
  }
  var _ref$8 = {
    name: "1b269ny",
    styles: "margin-left:2px;cursor:pointer;font-size:12px"
  };
  const TagItemDisplay = React.forwardRef(({
    tag,
    renderTag,
    onDelete,
    ...restProps
  }, ref) => {
    return /* @__PURE__ */ jsxs("div", { ...restProps, ref, css: [/* @__PURE__ */ css("border-radius:5px;padding:2px 6px;position:relative;border:1px solid ", borderColorValue, ";display:inline-flex;align-items:center;&:hover{border-color:", colorPrimaryValue, ";color:", colorPrimaryValue, ";.anticon{visibility:visible;}}", ""), "", ""], children: [
      renderTag ? renderTag(tag) : tag,
      /* @__PURE__ */ jsx$1(ForwardRef$1, { onClick: () => {
        onDelete == null ? void 0 : onDelete(tag);
      }, ...size(16), css: _ref$8 })
    ] });
  });
  function UpTagItemDisplay({
    tag
  }) {
    const regMidWithRemark = /^(?<mid>\d+)\((?<remark>[\S ]+)\)$/;
    const regMid = /^\d+$/;
    const {
      mid,
      remark
    } = React.useMemo(() => {
      var _a2;
      if (regMidWithRemark.test(tag)) {
        const groups = (_a2 = regMidWithRemark.exec(tag)) == null ? void 0 : _a2.groups;
        const mid2 = groups == null ? void 0 : groups.mid;
        const remark2 = groups == null ? void 0 : groups.remark;
        return {
          mid: mid2,
          remark: remark2
        };
      } else if (regMid.test(tag)) {
        return {
          mid: tag
        };
      } else {
        return {};
      }
    }, [tag]);
    const [nicknameByMid, setNicknameByMid] = React.useState(void 0);
    React.useEffect(() => {
      void (async () => {
        if (!mid) return;
        const nickname = await getUserNickname(mid);
        if (nickname) setNicknameByMid(nickname);
      })();
    }, [mid]);
    const label = mid ? (
      //
      nicknameByMid || remark || mid
    ) : tag;
    const tooltip = /* @__PURE__ */ jsxs(Fragment, { children: [
      !!mid && /* @__PURE__ */ jsxs(Fragment, { children: [
        "mid: ",
        mid,
        " ",
        /* @__PURE__ */ jsx$1("br", {})
      ] }),
      !!remark && /* @__PURE__ */ jsxs(Fragment, { children: [
        "备注: ",
        remark,
        " ",
        /* @__PURE__ */ jsx$1("br", {}),
        remark === nicknameByMid && /* @__PURE__ */ jsxs(Fragment, { children: [
          "P.S 备注是之前的数据, 现在你只需要填写 mid, 会自动获取昵称 ",
          /* @__PURE__ */ jsx$1("br", {})
        ] })
      ] }),
      !mid && /* @__PURE__ */ jsxs(Fragment, { children: [
        "使用用户名过滤: 用户可能改名, 建议使用 mid 过滤 ",
        /* @__PURE__ */ jsx$1("br", {})
      ] })
    ] });
    return /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsx$1(AntdTooltip, { title: tooltip, children: /* @__PURE__ */ jsxs("span", { css: [flexCenterStyle, /* @__PURE__ */ css("cursor:", mid ? "pointer" : "edit", ";", ""), "", ""], children: [
      mid && /* @__PURE__ */ jsx$1(ForwardRef$r, { ...size(12), className: "mr-2" }),
      mid ? /* @__PURE__ */ jsx$1("a", { href: formatSpaceUrl(mid), target: "_blank", style: {
        color: "inherit"
      }, children: label }) : label
    ] }) }) });
  }
  var _ref$7 = {
    name: "1a2afmv",
    styles: "margin-left:10px"
  };
  var _ref2$6 = {
    name: "1a2afmv",
    styles: "margin-left:10px"
  };
  var _ref3$3 = {
    name: "18re5jk",
    styles: "display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));column-gap:15px"
  };
  var _ref4$3 = {
    name: "kftco8",
    styles: "padding-right:15px"
  };
  function TabPaneFilter() {
    const {
      enabled,
      minPlayCount,
      minDuration,
      hideGotoTypeBangumi,
      hideGotoTypePicture,
      byAuthor,
      byTitle
    } = useSettingsSnapshot().filter;
    const getExemptFollowedTooltipProps = (label) => {
      return {
        label: "「已关注」豁免",
        tooltipProps: {
          color: "rgba(0, 0, 0, 0.85)"
        },
        tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
          "推荐中已关注用户发布的内容(",
          label,
          ") 不会被过滤",
          /* @__PURE__ */ jsx$1("br", {}),
          '"豁免" 一词来源',
          " ",
          /* @__PURE__ */ jsx$1("a", { target: "_blank", href: "https://github.com/magicdawn/bilibili-gate/issues/1#issuecomment-2197868587", children: "pilipala" })
        ] })
      };
    };
    return /* @__PURE__ */ jsx$1("div", { className: styles$1.tabPane, css: _ref4$3, children: /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupTitle, children: [
        "内容过滤",
        /* @__PURE__ */ jsxs(HelpInfo, { children: [
          "启用过滤会大幅降低加载速度, 谨慎开启! ",
          /* @__PURE__ */ jsx$1("br", {}),
          "视频/图文/影视: 仅推荐类 Tab 生效 ",
          /* @__PURE__ */ jsx$1("br", {}),
          "UP/标题: 推荐类 / 热门 等Tab 生效"
        ] }),
        /* @__PURE__ */ jsx$1(SwitchSettingItem, { configPath: "filter.enabled", css: C.ml(10) })
      ] }),
      /* @__PURE__ */ jsx$1("div", { className: clsx(styles$1.settingsGroupContent), children: /* @__PURE__ */ jsxs("div", { css: _ref3$3, children: [
        /* @__PURE__ */ jsxs("div", { className: "col", children: [
          /* @__PURE__ */ jsx$1("div", { className: styles$1.settingsGroupSubTitle, children: "视频" }),
          /* @__PURE__ */ jsxs("div", { className: styles$1.row, children: [
            /* @__PURE__ */ jsx$1(CheckboxSettingItem, { disabled: !enabled, configPath: "filter.minPlayCount.enabled", label: "按播放量过滤", tooltip: /* @__PURE__ */ jsx$1(Fragment, { children: "不显示播放量很少的视频" }) }),
            /* @__PURE__ */ jsx$1(antd.InputNumber, { size: "small", min: 1, step: 1e3, value: minPlayCount.value, onChange: (val) => !isNil(val) && (settings.filter.minPlayCount.value = val), disabled: !enabled || !minPlayCount.enabled })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$1.row, style: {
            marginTop: 3
          }, children: [
            /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "filter.minDuration.enabled", label: "按视频时长过滤", tooltip: /* @__PURE__ */ jsx$1(Fragment, { children: "不显示短视频" }), disabled: !enabled }),
            /* @__PURE__ */ jsx$1(antd.InputNumber, { style: {
              width: 150
            }, size: "small", min: 1, step: 10, addonAfter: "单位:秒", value: minDuration.value, onChange: (val) => !isNil(val) && (settings.filter.minDuration.value = val), disabled: !enabled || !minDuration.enabled })
          ] }),
          /* @__PURE__ */ jsx$1(CheckboxSettingItem, { className: styles$1.row, style: {
            marginTop: 3
          }, configPath: "filter.exemptForFollowed.video", disabled: !enabled, ...getExemptFollowedTooltipProps("视频") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col", children: [
          /* @__PURE__ */ jsx$1("div", { className: styles$1.settingsGroupSubTitle, children: "图文" }),
          /* @__PURE__ */ jsx$1(CheckboxSettingItem, { className: styles$1.row, configPath: "filter.hideGotoTypePicture", label: "过滤图文类型推荐", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
            "过滤 ",
            /* @__PURE__ */ jsx$1("kbd", { children: "goto = picture" }),
            " 的内容: 包括 (动态 & 专栏) 等"
          ] }), disabled: !enabled }),
          /* @__PURE__ */ jsx$1(CheckboxSettingItem, { className: styles$1.row, disabled: !enabled || !hideGotoTypePicture, configPath: "filter.exemptForFollowed.picture", ...getExemptFollowedTooltipProps("图文") }),
          /* @__PURE__ */ jsx$1("div", { className: styles$1.settingsGroupSubTitle, children: "影视" }),
          /* @__PURE__ */ jsx$1(CheckboxSettingItem, { className: styles$1.row, configPath: "filter.hideGotoTypeBangumi", label: "过滤影视类型推荐", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
            "过滤 ",
            /* @__PURE__ */ jsx$1("kbd", { children: "goto = bangumi" }),
            " 的内容: 包括 (番剧 / 电影 / 国创 / 纪录片) 等"
          ] }), disabled: !enabled })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col", children: [
          /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupSubTitle, children: [
            "UP",
            /* @__PURE__ */ jsxs(HelpInfo, { children: [
              "根据 UP 过滤视频",
              /* @__PURE__ */ jsx$1("br", {}),
              "使用 mid 屏蔽时支持备注, 格式: ",
              /* @__PURE__ */ jsx$1(antd.Tag, { color: "success", children: "mid(备注)" }),
              "  ",
              "如 ",
              /* @__PURE__ */ jsx$1(antd.Tag, { color: "success", children: "8047632(B站官方)" }),
              /* @__PURE__ */ jsx$1("br", {}),
              "作用范围: 推荐 / 热门",
              /* @__PURE__ */ jsx$1("br", {}),
              "P.S B站官方支持黑名单, 对于不喜欢的 UP 可以直接拉黑",
              /* @__PURE__ */ jsx$1("br", {}),
              "P.S 这里是客户端过滤, 与黑名单功能重复, 后期版本可能会删除这个功能"
            ] }),
            /* @__PURE__ */ jsx$1(SwitchSettingItem, { configPath: "filter.byAuthor.enabled", disabled: !enabled, css: _ref2$6 })
          ] }),
          /* @__PURE__ */ jsx$1(EditableListSettingItem, { configPath: "filter.byAuthor.keywords", searchProps: {
            placeholder: "添加UP: 全名 / mid / mid(备注)"
          }, disabled: !enabled || !byAuthor.enabled })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col", children: [
          /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupSubTitle, children: [
            /* @__PURE__ */ jsx$1("span", { children: "标题" }),
            /* @__PURE__ */ jsxs(HelpInfo, { children: [
              "根据标题关键词过滤视频 ",
              /* @__PURE__ */ jsx$1("br", {}),
              "支持正则(i), 语法：/abc|\\d+/ ",
              /* @__PURE__ */ jsx$1("br", {}),
              "作用范围: 推荐 / 热门"
            ] }),
            /* @__PURE__ */ jsx$1(SwitchSettingItem, { configPath: "filter.byTitle.enabled", disabled: !enabled, css: _ref$7 })
          ] }),
          /* @__PURE__ */ jsx$1(EditableListSettingItem, { configPath: "filter.byTitle.keywords", searchProps: {
            placeholder: "添加过滤关键词"
          }, disabled: !enabled || !byTitle.enabled })
        ] })
      ] }) })
    ] }) });
  }
  function useCombinedRefs() {
    for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
      refs[_key] = arguments[_key];
    }
    return React.useMemo(
      () => (node2) => {
        refs.forEach((ref) => ref(node2));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      refs
    );
  }
  const canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
  function isWindow(element) {
    const elementString = Object.prototype.toString.call(element);
    return elementString === "[object Window]" || // In Electron context the Window object serializes to [object global]
    elementString === "[object global]";
  }
  function isNode(node2) {
    return "nodeType" in node2;
  }
  function getWindow(target) {
    var _target$ownerDocument, _target$ownerDocument2;
    if (!target) {
      return window;
    }
    if (isWindow(target)) {
      return target;
    }
    if (!isNode(target)) {
      return window;
    }
    return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
  }
  function isDocument(node2) {
    const {
      Document
    } = getWindow(node2);
    return node2 instanceof Document;
  }
  function isHTMLElement(node2) {
    if (isWindow(node2)) {
      return false;
    }
    return node2 instanceof getWindow(node2).HTMLElement;
  }
  function isSVGElement(node2) {
    return node2 instanceof getWindow(node2).SVGElement;
  }
  function getOwnerDocument(target) {
    if (!target) {
      return document;
    }
    if (isWindow(target)) {
      return target.document;
    }
    if (!isNode(target)) {
      return document;
    }
    if (isDocument(target)) {
      return target;
    }
    if (isHTMLElement(target) || isSVGElement(target)) {
      return target.ownerDocument;
    }
    return document;
  }
  const useIsomorphicLayoutEffect = canUseDOM ? React.useLayoutEffect : React.useEffect;
  function useEvent(handler) {
    const handlerRef = React.useRef(handler);
    useIsomorphicLayoutEffect(() => {
      handlerRef.current = handler;
    });
    return React.useCallback(function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return handlerRef.current == null ? void 0 : handlerRef.current(...args);
    }, []);
  }
  function useInterval() {
    const intervalRef = React.useRef(null);
    const set2 = React.useCallback((listener, duration2) => {
      intervalRef.current = setInterval(listener, duration2);
    }, []);
    const clear = React.useCallback(() => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);
    return [set2, clear];
  }
  function useLatestValue(value, dependencies) {
    if (dependencies === void 0) {
      dependencies = [value];
    }
    const valueRef = React.useRef(value);
    useIsomorphicLayoutEffect(() => {
      if (valueRef.current !== value) {
        valueRef.current = value;
      }
    }, dependencies);
    return valueRef;
  }
  function useLazyMemo(callback, dependencies) {
    const valueRef = React.useRef();
    return React.useMemo(
      () => {
        const newValue = callback(valueRef.current);
        valueRef.current = newValue;
        return newValue;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...dependencies]
    );
  }
  function useNodeRef(onChange) {
    const onChangeHandler = useEvent(onChange);
    const node2 = React.useRef(null);
    const setNodeRef = React.useCallback(
      (element) => {
        if (element !== node2.current) {
          onChangeHandler == null ? void 0 : onChangeHandler(element, node2.current);
        }
        node2.current = element;
      },
      //eslint-disable-next-line
      []
    );
    return [node2, setNodeRef];
  }
  function usePrevious(value) {
    const ref = React.useRef();
    React.useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }
  let ids = {};
  function useUniqueId(prefix2, value) {
    return React.useMemo(() => {
      if (value) {
        return value;
      }
      const id = ids[prefix2] == null ? 0 : ids[prefix2] + 1;
      ids[prefix2] = id;
      return prefix2 + "-" + id;
    }, [prefix2, value]);
  }
  function createAdjustmentFn(modifier) {
    return function(object) {
      for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        adjustments[_key - 1] = arguments[_key];
      }
      return adjustments.reduce((accumulator, adjustment) => {
        const entries = Object.entries(adjustment);
        for (const [key, valueAdjustment] of entries) {
          const value = accumulator[key];
          if (value != null) {
            accumulator[key] = value + modifier * valueAdjustment;
          }
        }
        return accumulator;
      }, {
        ...object
      });
    };
  }
  const add = /* @__PURE__ */ createAdjustmentFn(1);
  const subtract = /* @__PURE__ */ createAdjustmentFn(-1);
  function hasViewportRelativeCoordinates(event) {
    return "clientX" in event && "clientY" in event;
  }
  function isKeyboardEvent(event) {
    if (!event) {
      return false;
    }
    const {
      KeyboardEvent
    } = getWindow(event.target);
    return KeyboardEvent && event instanceof KeyboardEvent;
  }
  function isTouchEvent(event) {
    if (!event) {
      return false;
    }
    const {
      TouchEvent
    } = getWindow(event.target);
    return TouchEvent && event instanceof TouchEvent;
  }
  function getEventCoordinates(event) {
    if (isTouchEvent(event)) {
      if (event.touches && event.touches.length) {
        const {
          clientX: x,
          clientY: y
        } = event.touches[0];
        return {
          x,
          y
        };
      } else if (event.changedTouches && event.changedTouches.length) {
        const {
          clientX: x,
          clientY: y
        } = event.changedTouches[0];
        return {
          x,
          y
        };
      }
    }
    if (hasViewportRelativeCoordinates(event)) {
      return {
        x: event.clientX,
        y: event.clientY
      };
    }
    return null;
  }
  const CSS = /* @__PURE__ */ Object.freeze({
    Translate: {
      toString(transform) {
        if (!transform) {
          return;
        }
        const {
          x,
          y
        } = transform;
        return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
      }
    },
    Scale: {
      toString(transform) {
        if (!transform) {
          return;
        }
        const {
          scaleX,
          scaleY
        } = transform;
        return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
      }
    },
    Transform: {
      toString(transform) {
        if (!transform) {
          return;
        }
        return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
      }
    },
    Transition: {
      toString(_ref8) {
        let {
          property,
          duration: duration2,
          easing
        } = _ref8;
        return property + " " + duration2 + "ms " + easing;
      }
    }
  });
  const SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
  function findFirstFocusableNode(element) {
    if (element.matches(SELECTOR)) {
      return element;
    }
    return element.querySelector(SELECTOR);
  }
  const hiddenStyles = {
    display: "none"
  };
  function HiddenText(_ref8) {
    let {
      id,
      value
    } = _ref8;
    return React.createElement("div", {
      id,
      style: hiddenStyles
    }, value);
  }
  function LiveRegion(_ref8) {
    let {
      id,
      announcement,
      ariaLiveType = "assertive"
    } = _ref8;
    const visuallyHidden = {
      position: "fixed",
      top: 0,
      left: 0,
      width: 1,
      height: 1,
      margin: -1,
      border: 0,
      padding: 0,
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
      clipPath: "inset(100%)",
      whiteSpace: "nowrap"
    };
    return React.createElement("div", {
      id,
      style: visuallyHidden,
      role: "status",
      "aria-live": ariaLiveType,
      "aria-atomic": true
    }, announcement);
  }
  function useAnnouncement() {
    const [announcement, setAnnouncement] = React.useState("");
    const announce = React.useCallback((value) => {
      if (value != null) {
        setAnnouncement(value);
      }
    }, []);
    return {
      announce,
      announcement
    };
  }
  const DndMonitorContext = /* @__PURE__ */ React.createContext(null);
  function useDndMonitor(listener) {
    const registerListener = React.useContext(DndMonitorContext);
    React.useEffect(() => {
      if (!registerListener) {
        throw new Error("useDndMonitor must be used within a children of <DndContext>");
      }
      const unsubscribe = registerListener(listener);
      return unsubscribe;
    }, [listener, registerListener]);
  }
  function useDndMonitorProvider() {
    const [listeners2] = React.useState(() => /* @__PURE__ */ new Set());
    const registerListener = React.useCallback((listener) => {
      listeners2.add(listener);
      return () => listeners2.delete(listener);
    }, [listeners2]);
    const dispatch = React.useCallback((_ref8) => {
      let {
        type,
        event
      } = _ref8;
      listeners2.forEach((listener) => {
        var _listener$type;
        return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
      });
    }, [listeners2]);
    return [dispatch, registerListener];
  }
  const defaultScreenReaderInstructions = {
    draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
  };
  const defaultAnnouncements = {
    onDragStart(_ref8) {
      let {
        active
      } = _ref8;
      return "Picked up draggable item " + active.id + ".";
    },
    onDragOver(_ref22) {
      let {
        active,
        over
      } = _ref22;
      if (over) {
        return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
      }
      return "Draggable item " + active.id + " is no longer over a droppable area.";
    },
    onDragEnd(_ref32) {
      let {
        active,
        over
      } = _ref32;
      if (over) {
        return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
      }
      return "Draggable item " + active.id + " was dropped.";
    },
    onDragCancel(_ref42) {
      let {
        active
      } = _ref42;
      return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
    }
  };
  function Accessibility(_ref8) {
    let {
      announcements = defaultAnnouncements,
      container,
      hiddenTextDescribedById,
      screenReaderInstructions = defaultScreenReaderInstructions
    } = _ref8;
    const {
      announce,
      announcement
    } = useAnnouncement();
    const liveRegionId = useUniqueId("DndLiveRegion");
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      setMounted(true);
    }, []);
    useDndMonitor(React.useMemo(() => ({
      onDragStart(_ref22) {
        let {
          active
        } = _ref22;
        announce(announcements.onDragStart({
          active
        }));
      },
      onDragMove(_ref32) {
        let {
          active,
          over
        } = _ref32;
        if (announcements.onDragMove) {
          announce(announcements.onDragMove({
            active,
            over
          }));
        }
      },
      onDragOver(_ref42) {
        let {
          active,
          over
        } = _ref42;
        announce(announcements.onDragOver({
          active,
          over
        }));
      },
      onDragEnd(_ref52) {
        let {
          active,
          over
        } = _ref52;
        announce(announcements.onDragEnd({
          active,
          over
        }));
      },
      onDragCancel(_ref62) {
        let {
          active,
          over
        } = _ref62;
        announce(announcements.onDragCancel({
          active,
          over
        }));
      }
    }), [announce, announcements]));
    if (!mounted) {
      return null;
    }
    const markup = React.createElement(React.Fragment, null, React.createElement(HiddenText, {
      id: hiddenTextDescribedById,
      value: screenReaderInstructions.draggable
    }), React.createElement(LiveRegion, {
      id: liveRegionId,
      announcement
    }));
    return container ? require$$0.createPortal(markup, container) : markup;
  }
  var Action;
  (function(Action2) {
    Action2["DragStart"] = "dragStart";
    Action2["DragMove"] = "dragMove";
    Action2["DragEnd"] = "dragEnd";
    Action2["DragCancel"] = "dragCancel";
    Action2["DragOver"] = "dragOver";
    Action2["RegisterDroppable"] = "registerDroppable";
    Action2["SetDroppableDisabled"] = "setDroppableDisabled";
    Action2["UnregisterDroppable"] = "unregisterDroppable";
  })(Action || (Action = {}));
  function noop() {
  }
  function useSensor(sensor, options) {
    return React.useMemo(
      () => ({
        sensor,
        options: {}
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sensor, options]
    );
  }
  function useSensors() {
    for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) {
      sensors[_key] = arguments[_key];
    }
    return React.useMemo(
      () => [...sensors].filter((sensor) => sensor != null),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...sensors]
    );
  }
  const defaultCoordinates = /* @__PURE__ */ Object.freeze({
    x: 0,
    y: 0
  });
  function distanceBetween(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
  function sortCollisionsAsc(_ref8, _ref22) {
    let {
      data: {
        value: a
      }
    } = _ref8;
    let {
      data: {
        value: b
      }
    } = _ref22;
    return a - b;
  }
  function sortCollisionsDesc(_ref32, _ref42) {
    let {
      data: {
        value: a
      }
    } = _ref32;
    let {
      data: {
        value: b
      }
    } = _ref42;
    return b - a;
  }
  function getFirstCollision(collisions, property) {
    if (!collisions || collisions.length === 0) {
      return null;
    }
    const [firstCollision] = collisions;
    return firstCollision[property];
  }
  function centerOfRectangle(rect, left, top) {
    if (left === void 0) {
      left = rect.left;
    }
    if (top === void 0) {
      top = rect.top;
    }
    return {
      x: left + rect.width * 0.5,
      y: top + rect.height * 0.5
    };
  }
  const closestCenter = (_ref8) => {
    let {
      collisionRect,
      droppableRects,
      droppableContainers
    } = _ref8;
    const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
    const collisions = [];
    for (const droppableContainer of droppableContainers) {
      const {
        id
      } = droppableContainer;
      const rect = droppableRects.get(id);
      if (rect) {
        const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: distBetween
          }
        });
      }
    }
    return collisions.sort(sortCollisionsAsc);
  };
  function getIntersectionRatio(entry, target) {
    const top = Math.max(target.top, entry.top);
    const left = Math.max(target.left, entry.left);
    const right = Math.min(target.left + target.width, entry.left + entry.width);
    const bottom = Math.min(target.top + target.height, entry.top + entry.height);
    const width = right - left;
    const height = bottom - top;
    if (left < right && top < bottom) {
      const targetArea = target.width * target.height;
      const entryArea = entry.width * entry.height;
      const intersectionArea = width * height;
      const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
      return Number(intersectionRatio.toFixed(4));
    }
    return 0;
  }
  const rectIntersection = (_ref8) => {
    let {
      collisionRect,
      droppableRects,
      droppableContainers
    } = _ref8;
    const collisions = [];
    for (const droppableContainer of droppableContainers) {
      const {
        id
      } = droppableContainer;
      const rect = droppableRects.get(id);
      if (rect) {
        const intersectionRatio = getIntersectionRatio(rect, collisionRect);
        if (intersectionRatio > 0) {
          collisions.push({
            id,
            data: {
              droppableContainer,
              value: intersectionRatio
            }
          });
        }
      }
    }
    return collisions.sort(sortCollisionsDesc);
  };
  function adjustScale(transform, rect1, rect2) {
    return {
      ...transform,
      scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
      scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
    };
  }
  function getRectDelta(rect1, rect2) {
    return rect1 && rect2 ? {
      x: rect1.left - rect2.left,
      y: rect1.top - rect2.top
    } : defaultCoordinates;
  }
  function createRectAdjustmentFn(modifier) {
    return function adjustClientRect(rect) {
      for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        adjustments[_key - 1] = arguments[_key];
      }
      return adjustments.reduce((acc, adjustment) => ({
        ...acc,
        top: acc.top + modifier * adjustment.y,
        bottom: acc.bottom + modifier * adjustment.y,
        left: acc.left + modifier * adjustment.x,
        right: acc.right + modifier * adjustment.x
      }), {
        ...rect
      });
    };
  }
  const getAdjustedRect = /* @__PURE__ */ createRectAdjustmentFn(1);
  function parseTransform(transform) {
    if (transform.startsWith("matrix3d(")) {
      const transformArray = transform.slice(9, -1).split(/, /);
      return {
        x: +transformArray[12],
        y: +transformArray[13],
        scaleX: +transformArray[0],
        scaleY: +transformArray[5]
      };
    } else if (transform.startsWith("matrix(")) {
      const transformArray = transform.slice(7, -1).split(/, /);
      return {
        x: +transformArray[4],
        y: +transformArray[5],
        scaleX: +transformArray[0],
        scaleY: +transformArray[3]
      };
    }
    return null;
  }
  function inverseTransform(rect, transform, transformOrigin) {
    const parsedTransform = parseTransform(transform);
    if (!parsedTransform) {
      return rect;
    }
    const {
      scaleX,
      scaleY,
      x: translateX,
      y: translateY
    } = parsedTransform;
    const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
    const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
    const w = scaleX ? rect.width / scaleX : rect.width;
    const h = scaleY ? rect.height / scaleY : rect.height;
    return {
      width: w,
      height: h,
      top: y,
      right: x + w,
      bottom: y + h,
      left: x
    };
  }
  const defaultOptions = {
    ignoreTransform: false
  };
  function getClientRect(element, options) {
    if (options === void 0) {
      options = defaultOptions;
    }
    let rect = element.getBoundingClientRect();
    if (options.ignoreTransform) {
      const {
        transform,
        transformOrigin
      } = getWindow(element).getComputedStyle(element);
      if (transform) {
        rect = inverseTransform(rect, transform, transformOrigin);
      }
    }
    const {
      top,
      left,
      width,
      height,
      bottom,
      right
    } = rect;
    return {
      top,
      left,
      width,
      height,
      bottom,
      right
    };
  }
  function getTransformAgnosticClientRect(element) {
    return getClientRect(element, {
      ignoreTransform: true
    });
  }
  function getWindowClientRect(element) {
    const width = element.innerWidth;
    const height = element.innerHeight;
    return {
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height
    };
  }
  function isFixed(node2, computedStyle) {
    if (computedStyle === void 0) {
      computedStyle = getWindow(node2).getComputedStyle(node2);
    }
    return computedStyle.position === "fixed";
  }
  function isScrollable(element, computedStyle) {
    if (computedStyle === void 0) {
      computedStyle = getWindow(element).getComputedStyle(element);
    }
    const overflowRegex = /(auto|scroll|overlay)/;
    const properties2 = ["overflow", "overflowX", "overflowY"];
    return properties2.some((property) => {
      const value = computedStyle[property];
      return typeof value === "string" ? overflowRegex.test(value) : false;
    });
  }
  function getScrollableAncestors(element, limit2) {
    const scrollParents = [];
    function findScrollableAncestors(node2) {
      if (limit2 != null && scrollParents.length >= limit2) {
        return scrollParents;
      }
      if (!node2) {
        return scrollParents;
      }
      if (isDocument(node2) && node2.scrollingElement != null && !scrollParents.includes(node2.scrollingElement)) {
        scrollParents.push(node2.scrollingElement);
        return scrollParents;
      }
      if (!isHTMLElement(node2) || isSVGElement(node2)) {
        return scrollParents;
      }
      if (scrollParents.includes(node2)) {
        return scrollParents;
      }
      const computedStyle = getWindow(element).getComputedStyle(node2);
      if (node2 !== element) {
        if (isScrollable(node2, computedStyle)) {
          scrollParents.push(node2);
        }
      }
      if (isFixed(node2, computedStyle)) {
        return scrollParents;
      }
      return findScrollableAncestors(node2.parentNode);
    }
    if (!element) {
      return scrollParents;
    }
    return findScrollableAncestors(element);
  }
  function getFirstScrollableAncestor(node2) {
    const [firstScrollableAncestor] = getScrollableAncestors(node2, 1);
    return firstScrollableAncestor != null ? firstScrollableAncestor : null;
  }
  function getScrollableElement(element) {
    if (!canUseDOM || !element) {
      return null;
    }
    if (isWindow(element)) {
      return element;
    }
    if (!isNode(element)) {
      return null;
    }
    if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) {
      return window;
    }
    if (isHTMLElement(element)) {
      return element;
    }
    return null;
  }
  function getScrollXCoordinate(element) {
    if (isWindow(element)) {
      return element.scrollX;
    }
    return element.scrollLeft;
  }
  function getScrollYCoordinate(element) {
    if (isWindow(element)) {
      return element.scrollY;
    }
    return element.scrollTop;
  }
  function getScrollCoordinates(element) {
    return {
      x: getScrollXCoordinate(element),
      y: getScrollYCoordinate(element)
    };
  }
  var Direction;
  (function(Direction2) {
    Direction2[Direction2["Forward"] = 1] = "Forward";
    Direction2[Direction2["Backward"] = -1] = "Backward";
  })(Direction || (Direction = {}));
  function isDocumentScrollingElement(element) {
    if (!canUseDOM || !element) {
      return false;
    }
    return element === document.scrollingElement;
  }
  function getScrollPosition(scrollingContainer) {
    const minScroll = {
      x: 0,
      y: 0
    };
    const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
      height: window.innerHeight,
      width: window.innerWidth
    } : {
      height: scrollingContainer.clientHeight,
      width: scrollingContainer.clientWidth
    };
    const maxScroll = {
      x: scrollingContainer.scrollWidth - dimensions.width,
      y: scrollingContainer.scrollHeight - dimensions.height
    };
    const isTop = scrollingContainer.scrollTop <= minScroll.y;
    const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
    const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
    const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
    return {
      isTop,
      isLeft,
      isBottom,
      isRight,
      maxScroll,
      minScroll
    };
  }
  const defaultThreshold = {
    x: 0.2,
    y: 0.2
  };
  function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref8, acceleration, thresholdPercentage) {
    let {
      top,
      left,
      right,
      bottom
    } = _ref8;
    if (acceleration === void 0) {
      acceleration = 10;
    }
    if (thresholdPercentage === void 0) {
      thresholdPercentage = defaultThreshold;
    }
    const {
      isTop,
      isBottom,
      isLeft,
      isRight
    } = getScrollPosition(scrollContainer);
    const direction = {
      x: 0,
      y: 0
    };
    const speed = {
      x: 0,
      y: 0
    };
    const threshold = {
      height: scrollContainerRect.height * thresholdPercentage.y,
      width: scrollContainerRect.width * thresholdPercentage.x
    };
    if (!isTop && top <= scrollContainerRect.top + threshold.height) {
      direction.y = Direction.Backward;
      speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
    } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
      direction.y = Direction.Forward;
      speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
    }
    if (!isRight && right >= scrollContainerRect.right - threshold.width) {
      direction.x = Direction.Forward;
      speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
    } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
      direction.x = Direction.Backward;
      speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
    }
    return {
      direction,
      speed
    };
  }
  function getScrollElementRect(element) {
    if (element === document.scrollingElement) {
      const {
        innerWidth,
        innerHeight
      } = window;
      return {
        top: 0,
        left: 0,
        right: innerWidth,
        bottom: innerHeight,
        width: innerWidth,
        height: innerHeight
      };
    }
    const {
      top,
      left,
      right,
      bottom
    } = element.getBoundingClientRect();
    return {
      top,
      left,
      right,
      bottom,
      width: element.clientWidth,
      height: element.clientHeight
    };
  }
  function getScrollOffsets(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node2) => {
      return add(acc, getScrollCoordinates(node2));
    }, defaultCoordinates);
  }
  function getScrollXOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node2) => {
      return acc + getScrollXCoordinate(node2);
    }, 0);
  }
  function getScrollYOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node2) => {
      return acc + getScrollYCoordinate(node2);
    }, 0);
  }
  function scrollIntoViewIfNeeded(element, measure) {
    if (measure === void 0) {
      measure = getClientRect;
    }
    if (!element) {
      return;
    }
    const {
      top,
      left,
      bottom,
      right
    } = measure(element);
    const firstScrollableAncestor = getFirstScrollableAncestor(element);
    if (!firstScrollableAncestor) {
      return;
    }
    if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
      element.scrollIntoView({
        block: "center",
        inline: "center"
      });
    }
  }
  const properties = [["x", ["left", "right"], getScrollXOffset], ["y", ["top", "bottom"], getScrollYOffset]];
  class Rect {
    constructor(rect, element) {
      this.rect = void 0;
      this.width = void 0;
      this.height = void 0;
      this.top = void 0;
      this.bottom = void 0;
      this.right = void 0;
      this.left = void 0;
      const scrollableAncestors = getScrollableAncestors(element);
      const scrollOffsets = getScrollOffsets(scrollableAncestors);
      this.rect = {
        ...rect
      };
      this.width = rect.width;
      this.height = rect.height;
      for (const [axis, keys, getScrollOffset] of properties) {
        for (const key of keys) {
          Object.defineProperty(this, key, {
            get: () => {
              const currentOffsets = getScrollOffset(scrollableAncestors);
              const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
              return this.rect[key] + scrollOffsetsDeltla;
            },
            enumerable: true
          });
        }
      }
      Object.defineProperty(this, "rect", {
        enumerable: false
      });
    }
  }
  class Listeners {
    constructor(target) {
      this.target = void 0;
      this.listeners = [];
      this.removeAll = () => {
        this.listeners.forEach((listener) => {
          var _this$target;
          return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
        });
      };
      this.target = target;
    }
    add(eventName, handler, options) {
      var _this$target2;
      (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
      this.listeners.push([eventName, handler, options]);
    }
  }
  function getEventListenerTarget(target) {
    const {
      EventTarget
    } = getWindow(target);
    return target instanceof EventTarget ? target : getOwnerDocument(target);
  }
  function hasExceededDistance(delta, measurement) {
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);
    if (typeof measurement === "number") {
      return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
    }
    if ("x" in measurement && "y" in measurement) {
      return dx > measurement.x && dy > measurement.y;
    }
    if ("x" in measurement) {
      return dx > measurement.x;
    }
    if ("y" in measurement) {
      return dy > measurement.y;
    }
    return false;
  }
  var EventName;
  (function(EventName2) {
    EventName2["Click"] = "click";
    EventName2["DragStart"] = "dragstart";
    EventName2["Keydown"] = "keydown";
    EventName2["ContextMenu"] = "contextmenu";
    EventName2["Resize"] = "resize";
    EventName2["SelectionChange"] = "selectionchange";
    EventName2["VisibilityChange"] = "visibilitychange";
  })(EventName || (EventName = {}));
  function preventDefault(event) {
    event.preventDefault();
  }
  function stopPropagation(event) {
    event.stopPropagation();
  }
  var KeyboardCode;
  (function(KeyboardCode2) {
    KeyboardCode2["Space"] = "Space";
    KeyboardCode2["Down"] = "ArrowDown";
    KeyboardCode2["Right"] = "ArrowRight";
    KeyboardCode2["Left"] = "ArrowLeft";
    KeyboardCode2["Up"] = "ArrowUp";
    KeyboardCode2["Esc"] = "Escape";
    KeyboardCode2["Enter"] = "Enter";
    KeyboardCode2["Tab"] = "Tab";
  })(KeyboardCode || (KeyboardCode = {}));
  const defaultKeyboardCodes = {
    start: [KeyboardCode.Space, KeyboardCode.Enter],
    cancel: [KeyboardCode.Esc],
    end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab]
  };
  const defaultKeyboardCoordinateGetter = (event, _ref8) => {
    let {
      currentCoordinates
    } = _ref8;
    switch (event.code) {
      case KeyboardCode.Right:
        return {
          ...currentCoordinates,
          x: currentCoordinates.x + 25
        };
      case KeyboardCode.Left:
        return {
          ...currentCoordinates,
          x: currentCoordinates.x - 25
        };
      case KeyboardCode.Down:
        return {
          ...currentCoordinates,
          y: currentCoordinates.y + 25
        };
      case KeyboardCode.Up:
        return {
          ...currentCoordinates,
          y: currentCoordinates.y - 25
        };
    }
    return void 0;
  };
  class KeyboardSensor {
    constructor(props) {
      this.props = void 0;
      this.autoScrollEnabled = false;
      this.referenceCoordinates = void 0;
      this.listeners = void 0;
      this.windowListeners = void 0;
      this.props = props;
      const {
        event: {
          target
        }
      } = props;
      this.props = props;
      this.listeners = new Listeners(getOwnerDocument(target));
      this.windowListeners = new Listeners(getWindow(target));
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.attach();
    }
    attach() {
      this.handleStart();
      this.windowListeners.add(EventName.Resize, this.handleCancel);
      this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
      setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
    }
    handleStart() {
      const {
        activeNode,
        onStart
      } = this.props;
      const node2 = activeNode.node.current;
      if (node2) {
        scrollIntoViewIfNeeded(node2);
      }
      onStart(defaultCoordinates);
    }
    handleKeyDown(event) {
      if (isKeyboardEvent(event)) {
        const {
          active,
          context,
          options
        } = this.props;
        const {
          keyboardCodes = defaultKeyboardCodes,
          coordinateGetter = defaultKeyboardCoordinateGetter,
          scrollBehavior = "smooth"
        } = options;
        const {
          code
        } = event;
        if (keyboardCodes.end.includes(code)) {
          this.handleEnd(event);
          return;
        }
        if (keyboardCodes.cancel.includes(code)) {
          this.handleCancel(event);
          return;
        }
        const {
          collisionRect
        } = context.current;
        const currentCoordinates = collisionRect ? {
          x: collisionRect.left,
          y: collisionRect.top
        } : defaultCoordinates;
        if (!this.referenceCoordinates) {
          this.referenceCoordinates = currentCoordinates;
        }
        const newCoordinates = coordinateGetter(event, {
          active,
          context: context.current,
          currentCoordinates
        });
        if (newCoordinates) {
          const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
          const scrollDelta = {
            x: 0,
            y: 0
          };
          const {
            scrollableAncestors
          } = context.current;
          for (const scrollContainer of scrollableAncestors) {
            const direction = event.code;
            const {
              isTop,
              isRight,
              isLeft,
              isBottom,
              maxScroll,
              minScroll
            } = getScrollPosition(scrollContainer);
            const scrollElementRect = getScrollElementRect(scrollContainer);
            const clampedCoordinates = {
              x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
              y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
            };
            const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
            const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
            if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
              const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
              const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
              if (canScrollToNewCoordinates && !coordinatesDelta.y) {
                scrollContainer.scrollTo({
                  left: newScrollCoordinates,
                  behavior: scrollBehavior
                });
                return;
              }
              if (canScrollToNewCoordinates) {
                scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
              } else {
                scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
              }
              if (scrollDelta.x) {
                scrollContainer.scrollBy({
                  left: -scrollDelta.x,
                  behavior: scrollBehavior
                });
              }
              break;
            } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
              const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
              const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
              if (canScrollToNewCoordinates && !coordinatesDelta.x) {
                scrollContainer.scrollTo({
                  top: newScrollCoordinates,
                  behavior: scrollBehavior
                });
                return;
              }
              if (canScrollToNewCoordinates) {
                scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
              } else {
                scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
              }
              if (scrollDelta.y) {
                scrollContainer.scrollBy({
                  top: -scrollDelta.y,
                  behavior: scrollBehavior
                });
              }
              break;
            }
          }
          this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
        }
      }
    }
    handleMove(event, coordinates) {
      const {
        onMove
      } = this.props;
      event.preventDefault();
      onMove(coordinates);
    }
    handleEnd(event) {
      const {
        onEnd
      } = this.props;
      event.preventDefault();
      this.detach();
      onEnd();
    }
    handleCancel(event) {
      const {
        onCancel
      } = this.props;
      event.preventDefault();
      this.detach();
      onCancel();
    }
    detach() {
      this.listeners.removeAll();
      this.windowListeners.removeAll();
    }
  }
  KeyboardSensor.activators = [{
    eventName: "onKeyDown",
    handler: (event, _ref8, _ref22) => {
      let {
        keyboardCodes = defaultKeyboardCodes,
        onActivation
      } = _ref8;
      let {
        active
      } = _ref22;
      const {
        code
      } = event.nativeEvent;
      if (keyboardCodes.start.includes(code)) {
        const activator = active.activatorNode.current;
        if (activator && event.target !== activator) {
          return false;
        }
        event.preventDefault();
        onActivation == null ? void 0 : onActivation({
          event: event.nativeEvent
        });
        return true;
      }
      return false;
    }
  }];
  function isDistanceConstraint(constraint) {
    return Boolean(constraint && "distance" in constraint);
  }
  function isDelayConstraint(constraint) {
    return Boolean(constraint && "delay" in constraint);
  }
  class AbstractPointerSensor {
    constructor(props, events2, listenerTarget) {
      var _getEventCoordinates;
      if (listenerTarget === void 0) {
        listenerTarget = getEventListenerTarget(props.event.target);
      }
      this.props = void 0;
      this.events = void 0;
      this.autoScrollEnabled = true;
      this.document = void 0;
      this.activated = false;
      this.initialCoordinates = void 0;
      this.timeoutId = null;
      this.listeners = void 0;
      this.documentListeners = void 0;
      this.windowListeners = void 0;
      this.props = props;
      this.events = events2;
      const {
        event
      } = props;
      const {
        target
      } = event;
      this.props = props;
      this.events = events2;
      this.document = getOwnerDocument(target);
      this.documentListeners = new Listeners(this.document);
      this.listeners = new Listeners(listenerTarget);
      this.windowListeners = new Listeners(getWindow(target));
      this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
      this.handleStart = this.handleStart.bind(this);
      this.handleMove = this.handleMove.bind(this);
      this.handleEnd = this.handleEnd.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.removeTextSelection = this.removeTextSelection.bind(this);
      this.attach();
    }
    attach() {
      const {
        events: events2,
        props: {
          options: {
            activationConstraint,
            bypassActivationConstraint
          }
        }
      } = this;
      this.listeners.add(events2.move.name, this.handleMove, {
        passive: false
      });
      this.listeners.add(events2.end.name, this.handleEnd);
      if (events2.cancel) {
        this.listeners.add(events2.cancel.name, this.handleCancel);
      }
      this.windowListeners.add(EventName.Resize, this.handleCancel);
      this.windowListeners.add(EventName.DragStart, preventDefault);
      this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
      this.windowListeners.add(EventName.ContextMenu, preventDefault);
      this.documentListeners.add(EventName.Keydown, this.handleKeydown);
      if (activationConstraint) {
        if (bypassActivationConstraint != null && bypassActivationConstraint({
          event: this.props.event,
          activeNode: this.props.activeNode,
          options: this.props.options
        })) {
          return this.handleStart();
        }
        if (isDelayConstraint(activationConstraint)) {
          this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
          this.handlePending(activationConstraint);
          return;
        }
        if (isDistanceConstraint(activationConstraint)) {
          this.handlePending(activationConstraint);
          return;
        }
      }
      this.handleStart();
    }
    detach() {
      this.listeners.removeAll();
      this.windowListeners.removeAll();
      setTimeout(this.documentListeners.removeAll, 50);
      if (this.timeoutId !== null) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
    handlePending(constraint, offset) {
      const {
        active,
        onPending
      } = this.props;
      onPending(active, constraint, this.initialCoordinates, offset);
    }
    handleStart() {
      const {
        initialCoordinates
      } = this;
      const {
        onStart
      } = this.props;
      if (initialCoordinates) {
        this.activated = true;
        this.documentListeners.add(EventName.Click, stopPropagation, {
          capture: true
        });
        this.removeTextSelection();
        this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
        onStart(initialCoordinates);
      }
    }
    handleMove(event) {
      var _getEventCoordinates2;
      const {
        activated,
        initialCoordinates,
        props
      } = this;
      const {
        onMove,
        options: {
          activationConstraint
        }
      } = props;
      if (!initialCoordinates) {
        return;
      }
      const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
      const delta = subtract(initialCoordinates, coordinates);
      if (!activated && activationConstraint) {
        if (isDistanceConstraint(activationConstraint)) {
          if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
            return this.handleCancel();
          }
          if (hasExceededDistance(delta, activationConstraint.distance)) {
            return this.handleStart();
          }
        }
        if (isDelayConstraint(activationConstraint)) {
          if (hasExceededDistance(delta, activationConstraint.tolerance)) {
            return this.handleCancel();
          }
        }
        this.handlePending(activationConstraint, delta);
        return;
      }
      if (event.cancelable) {
        event.preventDefault();
      }
      onMove(coordinates);
    }
    handleEnd() {
      const {
        onAbort,
        onEnd
      } = this.props;
      this.detach();
      if (!this.activated) {
        onAbort(this.props.active);
      }
      onEnd();
    }
    handleCancel() {
      const {
        onAbort,
        onCancel
      } = this.props;
      this.detach();
      if (!this.activated) {
        onAbort(this.props.active);
      }
      onCancel();
    }
    handleKeydown(event) {
      if (event.code === KeyboardCode.Esc) {
        this.handleCancel();
      }
    }
    removeTextSelection() {
      var _this$document$getSel;
      (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
    }
  }
  const events = {
    cancel: {
      name: "pointercancel"
    },
    move: {
      name: "pointermove"
    },
    end: {
      name: "pointerup"
    }
  };
  class PointerSensor extends AbstractPointerSensor {
    constructor(props) {
      const {
        event
      } = props;
      const listenerTarget = getOwnerDocument(event.target);
      super(props, events, listenerTarget);
    }
  }
  PointerSensor.activators = [{
    eventName: "onPointerDown",
    handler: (_ref8, _ref22) => {
      let {
        nativeEvent: event
      } = _ref8;
      let {
        onActivation
      } = _ref22;
      if (!event.isPrimary || event.button !== 0) {
        return false;
      }
      onActivation == null ? void 0 : onActivation({
        event
      });
      return true;
    }
  }];
  const events$1 = {
    move: {
      name: "mousemove"
    },
    end: {
      name: "mouseup"
    }
  };
  var MouseButton;
  (function(MouseButton2) {
    MouseButton2[MouseButton2["RightClick"] = 2] = "RightClick";
  })(MouseButton || (MouseButton = {}));
  class MouseSensor extends AbstractPointerSensor {
    constructor(props) {
      super(props, events$1, getOwnerDocument(props.event.target));
    }
  }
  MouseSensor.activators = [{
    eventName: "onMouseDown",
    handler: (_ref8, _ref22) => {
      let {
        nativeEvent: event
      } = _ref8;
      let {
        onActivation
      } = _ref22;
      if (event.button === MouseButton.RightClick) {
        return false;
      }
      onActivation == null ? void 0 : onActivation({
        event
      });
      return true;
    }
  }];
  const events$2 = {
    cancel: {
      name: "touchcancel"
    },
    move: {
      name: "touchmove"
    },
    end: {
      name: "touchend"
    }
  };
  class TouchSensor extends AbstractPointerSensor {
    constructor(props) {
      super(props, events$2);
    }
    static setup() {
      window.addEventListener(events$2.move.name, noop2, {
        capture: false,
        passive: false
      });
      return function teardown() {
        window.removeEventListener(events$2.move.name, noop2);
      };
      function noop2() {
      }
    }
  }
  TouchSensor.activators = [{
    eventName: "onTouchStart",
    handler: (_ref8, _ref22) => {
      let {
        nativeEvent: event
      } = _ref8;
      let {
        onActivation
      } = _ref22;
      const {
        touches
      } = event;
      if (touches.length > 1) {
        return false;
      }
      onActivation == null ? void 0 : onActivation({
        event
      });
      return true;
    }
  }];
  var AutoScrollActivator;
  (function(AutoScrollActivator2) {
    AutoScrollActivator2[AutoScrollActivator2["Pointer"] = 0] = "Pointer";
    AutoScrollActivator2[AutoScrollActivator2["DraggableRect"] = 1] = "DraggableRect";
  })(AutoScrollActivator || (AutoScrollActivator = {}));
  var TraversalOrder;
  (function(TraversalOrder2) {
    TraversalOrder2[TraversalOrder2["TreeOrder"] = 0] = "TreeOrder";
    TraversalOrder2[TraversalOrder2["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
  })(TraversalOrder || (TraversalOrder = {}));
  function useAutoScroller(_ref8) {
    let {
      acceleration,
      activator = AutoScrollActivator.Pointer,
      canScroll,
      draggingRect,
      enabled,
      interval = 5,
      order = TraversalOrder.TreeOrder,
      pointerCoordinates,
      scrollableAncestors,
      scrollableAncestorRects,
      delta,
      threshold
    } = _ref8;
    const scrollIntent = useScrollIntent({
      delta,
      disabled: !enabled
    });
    const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
    const scrollSpeed = React.useRef({
      x: 0,
      y: 0
    });
    const scrollDirection = React.useRef({
      x: 0,
      y: 0
    });
    const rect = React.useMemo(() => {
      switch (activator) {
        case AutoScrollActivator.Pointer:
          return pointerCoordinates ? {
            top: pointerCoordinates.y,
            bottom: pointerCoordinates.y,
            left: pointerCoordinates.x,
            right: pointerCoordinates.x
          } : null;
        case AutoScrollActivator.DraggableRect:
          return draggingRect;
      }
    }, [activator, draggingRect, pointerCoordinates]);
    const scrollContainerRef = React.useRef(null);
    const autoScroll = React.useCallback(() => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        return;
      }
      const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
      const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
      scrollContainer.scrollBy(scrollLeft, scrollTop);
    }, []);
    const sortedScrollableAncestors = React.useMemo(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
    React.useEffect(
      () => {
        if (!enabled || !scrollableAncestors.length || !rect) {
          clearAutoScrollInterval();
          return;
        }
        for (const scrollContainer of sortedScrollableAncestors) {
          if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
            continue;
          }
          const index = scrollableAncestors.indexOf(scrollContainer);
          const scrollContainerRect = scrollableAncestorRects[index];
          if (!scrollContainerRect) {
            continue;
          }
          const {
            direction,
            speed
          } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
          for (const axis of ["x", "y"]) {
            if (!scrollIntent[axis][direction[axis]]) {
              speed[axis] = 0;
              direction[axis] = 0;
            }
          }
          if (speed.x > 0 || speed.y > 0) {
            clearAutoScrollInterval();
            scrollContainerRef.current = scrollContainer;
            setAutoScrollInterval(autoScroll, interval);
            scrollSpeed.current = speed;
            scrollDirection.current = direction;
            return;
          }
        }
        scrollSpeed.current = {
          x: 0,
          y: 0
        };
        scrollDirection.current = {
          x: 0,
          y: 0
        };
        clearAutoScrollInterval();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        acceleration,
        autoScroll,
        canScroll,
        clearAutoScrollInterval,
        enabled,
        interval,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(rect),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(scrollIntent),
        setAutoScrollInterval,
        scrollableAncestors,
        sortedScrollableAncestors,
        scrollableAncestorRects,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(threshold)
      ]
    );
  }
  const defaultScrollIntent = {
    x: {
      [Direction.Backward]: false,
      [Direction.Forward]: false
    },
    y: {
      [Direction.Backward]: false,
      [Direction.Forward]: false
    }
  };
  function useScrollIntent(_ref22) {
    let {
      delta,
      disabled
    } = _ref22;
    const previousDelta = usePrevious(delta);
    return useLazyMemo((previousIntent) => {
      if (disabled || !previousDelta || !previousIntent) {
        return defaultScrollIntent;
      }
      const direction = {
        x: Math.sign(delta.x - previousDelta.x),
        y: Math.sign(delta.y - previousDelta.y)
      };
      return {
        x: {
          [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
          [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
        },
        y: {
          [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
          [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
        }
      };
    }, [disabled, delta, previousDelta]);
  }
  function useCachedNode(draggableNodes, id) {
    const draggableNode = id != null ? draggableNodes.get(id) : void 0;
    const node2 = draggableNode ? draggableNode.node.current : null;
    return useLazyMemo((cachedNode) => {
      var _ref8;
      if (id == null) {
        return null;
      }
      return (_ref8 = node2 != null ? node2 : cachedNode) != null ? _ref8 : null;
    }, [node2, id]);
  }
  function useCombineActivators(sensors, getSyntheticHandler) {
    return React.useMemo(() => sensors.reduce((accumulator, sensor) => {
      const {
        sensor: Sensor
      } = sensor;
      const sensorActivators = Sensor.activators.map((activator) => ({
        eventName: activator.eventName,
        handler: getSyntheticHandler(activator.handler, sensor)
      }));
      return [...accumulator, ...sensorActivators];
    }, []), [sensors, getSyntheticHandler]);
  }
  var MeasuringStrategy;
  (function(MeasuringStrategy2) {
    MeasuringStrategy2[MeasuringStrategy2["Always"] = 0] = "Always";
    MeasuringStrategy2[MeasuringStrategy2["BeforeDragging"] = 1] = "BeforeDragging";
    MeasuringStrategy2[MeasuringStrategy2["WhileDragging"] = 2] = "WhileDragging";
  })(MeasuringStrategy || (MeasuringStrategy = {}));
  var MeasuringFrequency;
  (function(MeasuringFrequency2) {
    MeasuringFrequency2["Optimized"] = "optimized";
  })(MeasuringFrequency || (MeasuringFrequency = {}));
  const defaultValue = /* @__PURE__ */ new Map();
  function useDroppableMeasuring(containers, _ref8) {
    let {
      dragging,
      dependencies,
      config
    } = _ref8;
    const [queue, setQueue] = React.useState(null);
    const {
      frequency,
      measure,
      strategy
    } = config;
    const containersRef = React.useRef(containers);
    const disabled = isDisabled();
    const disabledRef = useLatestValue(disabled);
    const measureDroppableContainers = React.useCallback(function(ids2) {
      if (ids2 === void 0) {
        ids2 = [];
      }
      if (disabledRef.current) {
        return;
      }
      setQueue((value) => {
        if (value === null) {
          return ids2;
        }
        return value.concat(ids2.filter((id) => !value.includes(id)));
      });
    }, [disabledRef]);
    const timeoutId = React.useRef(null);
    const droppableRects = useLazyMemo((previousValue) => {
      if (disabled && !dragging) {
        return defaultValue;
      }
      if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
        const map = /* @__PURE__ */ new Map();
        for (let container of containers) {
          if (!container) {
            continue;
          }
          if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
            map.set(container.id, container.rect.current);
            continue;
          }
          const node2 = container.node.current;
          const rect = node2 ? new Rect(measure(node2), node2) : null;
          container.rect.current = rect;
          if (rect) {
            map.set(container.id, rect);
          }
        }
        return map;
      }
      return previousValue;
    }, [containers, queue, dragging, disabled, measure]);
    React.useEffect(() => {
      containersRef.current = containers;
    }, [containers]);
    React.useEffect(
      () => {
        if (disabled) {
          return;
        }
        measureDroppableContainers();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [dragging, disabled]
    );
    React.useEffect(
      () => {
        if (queue && queue.length > 0) {
          setQueue(null);
        }
      },
      //eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(queue)]
    );
    React.useEffect(
      () => {
        if (disabled || typeof frequency !== "number" || timeoutId.current !== null) {
          return;
        }
        timeoutId.current = setTimeout(() => {
          measureDroppableContainers();
          timeoutId.current = null;
        }, frequency);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [frequency, disabled, measureDroppableContainers, ...dependencies]
    );
    return {
      droppableRects,
      measureDroppableContainers,
      measuringScheduled: queue != null
    };
    function isDisabled() {
      switch (strategy) {
        case MeasuringStrategy.Always:
          return false;
        case MeasuringStrategy.BeforeDragging:
          return dragging;
        default:
          return !dragging;
      }
    }
  }
  function useInitialValue(value, computeFn) {
    return useLazyMemo((previousValue) => {
      if (!value) {
        return null;
      }
      if (previousValue) {
        return previousValue;
      }
      return typeof computeFn === "function" ? computeFn(value) : value;
    }, [computeFn, value]);
  }
  function useInitialRect(node2, measure) {
    return useInitialValue(node2, measure);
  }
  function useMutationObserver(_ref8) {
    let {
      callback,
      disabled
    } = _ref8;
    const handleMutations = useEvent(callback);
    const mutationObserver = React.useMemo(() => {
      if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") {
        return void 0;
      }
      const {
        MutationObserver: MutationObserver2
      } = window;
      return new MutationObserver2(handleMutations);
    }, [handleMutations, disabled]);
    React.useEffect(() => {
      return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }, [mutationObserver]);
    return mutationObserver;
  }
  function useResizeObserver(_ref8) {
    let {
      callback,
      disabled
    } = _ref8;
    const handleResize = useEvent(callback);
    const resizeObserver = React.useMemo(
      () => {
        if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
          return void 0;
        }
        const {
          ResizeObserver: ResizeObserver2
        } = window;
        return new ResizeObserver2(handleResize);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [disabled]
    );
    React.useEffect(() => {
      return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
    }, [resizeObserver]);
    return resizeObserver;
  }
  function defaultMeasure(element) {
    return new Rect(getClientRect(element), element);
  }
  function useRect(element, measure, fallbackRect) {
    if (measure === void 0) {
      measure = defaultMeasure;
    }
    const [rect, setRect] = React.useState(null);
    function measureRect() {
      setRect((currentRect) => {
        if (!element) {
          return null;
        }
        if (element.isConnected === false) {
          var _ref8;
          return (_ref8 = currentRect != null ? currentRect : fallbackRect) != null ? _ref8 : null;
        }
        const newRect = measure(element);
        if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
          return currentRect;
        }
        return newRect;
      });
    }
    const mutationObserver = useMutationObserver({
      callback(records) {
        if (!element) {
          return;
        }
        for (const record of records) {
          const {
            type,
            target
          } = record;
          if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
            measureRect();
            break;
          }
        }
      }
    });
    const resizeObserver = useResizeObserver({
      callback: measureRect
    });
    useIsomorphicLayoutEffect(() => {
      measureRect();
      if (element) {
        resizeObserver == null ? void 0 : resizeObserver.observe(element);
        mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        resizeObserver == null ? void 0 : resizeObserver.disconnect();
        mutationObserver == null ? void 0 : mutationObserver.disconnect();
      }
    }, [element]);
    return rect;
  }
  function useRectDelta(rect) {
    const initialRect = useInitialValue(rect);
    return getRectDelta(rect, initialRect);
  }
  const defaultValue$1 = [];
  function useScrollableAncestors(node2) {
    const previousNode = React.useRef(node2);
    const ancestors = useLazyMemo((previousValue) => {
      if (!node2) {
        return defaultValue$1;
      }
      if (previousValue && previousValue !== defaultValue$1 && node2 && previousNode.current && node2.parentNode === previousNode.current.parentNode) {
        return previousValue;
      }
      return getScrollableAncestors(node2);
    }, [node2]);
    React.useEffect(() => {
      previousNode.current = node2;
    }, [node2]);
    return ancestors;
  }
  function useScrollOffsets(elements) {
    const [scrollCoordinates, setScrollCoordinates] = React.useState(null);
    const prevElements = React.useRef(elements);
    const handleScroll = React.useCallback((event) => {
      const scrollingElement = getScrollableElement(event.target);
      if (!scrollingElement) {
        return;
      }
      setScrollCoordinates((scrollCoordinates2) => {
        if (!scrollCoordinates2) {
          return null;
        }
        scrollCoordinates2.set(scrollingElement, getScrollCoordinates(scrollingElement));
        return new Map(scrollCoordinates2);
      });
    }, []);
    React.useEffect(() => {
      const previousElements = prevElements.current;
      if (elements !== previousElements) {
        cleanup(previousElements);
        const entries = elements.map((element) => {
          const scrollableElement = getScrollableElement(element);
          if (scrollableElement) {
            scrollableElement.addEventListener("scroll", handleScroll, {
              passive: true
            });
            return [scrollableElement, getScrollCoordinates(scrollableElement)];
          }
          return null;
        }).filter((entry) => entry != null);
        setScrollCoordinates(entries.length ? new Map(entries) : null);
        prevElements.current = elements;
      }
      return () => {
        cleanup(elements);
        cleanup(previousElements);
      };
      function cleanup(elements2) {
        elements2.forEach((element) => {
          const scrollableElement = getScrollableElement(element);
          scrollableElement == null ? void 0 : scrollableElement.removeEventListener("scroll", handleScroll);
        });
      }
    }, [handleScroll, elements]);
    return React.useMemo(() => {
      if (elements.length) {
        return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
      }
      return defaultCoordinates;
    }, [elements, scrollCoordinates]);
  }
  function useScrollOffsetsDelta(scrollOffsets, dependencies) {
    if (dependencies === void 0) {
      dependencies = [];
    }
    const initialScrollOffsets = React.useRef(null);
    React.useEffect(
      () => {
        initialScrollOffsets.current = null;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      dependencies
    );
    React.useEffect(() => {
      const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
      if (hasScrollOffsets && !initialScrollOffsets.current) {
        initialScrollOffsets.current = scrollOffsets;
      }
      if (!hasScrollOffsets && initialScrollOffsets.current) {
        initialScrollOffsets.current = null;
      }
    }, [scrollOffsets]);
    return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
  }
  function useSensorSetup(sensors) {
    React.useEffect(
      () => {
        if (!canUseDOM) {
          return;
        }
        const teardownFns = sensors.map((_ref8) => {
          let {
            sensor
          } = _ref8;
          return sensor.setup == null ? void 0 : sensor.setup();
        });
        return () => {
          for (const teardown of teardownFns) {
            teardown == null ? void 0 : teardown();
          }
        };
      },
      // TO-DO: Sensors length could theoretically change which would not be a valid dependency
      // eslint-disable-next-line react-hooks/exhaustive-deps
      sensors.map((_ref22) => {
        let {
          sensor
        } = _ref22;
        return sensor;
      })
    );
  }
  function useSyntheticListeners(listeners2, id) {
    return React.useMemo(() => {
      return listeners2.reduce((acc, _ref8) => {
        let {
          eventName,
          handler
        } = _ref8;
        acc[eventName] = (event) => {
          handler(event, id);
        };
        return acc;
      }, {});
    }, [listeners2, id]);
  }
  function useWindowRect(element) {
    return React.useMemo(() => element ? getWindowClientRect(element) : null, [element]);
  }
  const defaultValue$2 = [];
  function useRects(elements, measure) {
    if (measure === void 0) {
      measure = getClientRect;
    }
    const [firstElement] = elements;
    const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
    const [rects, setRects] = React.useState(defaultValue$2);
    function measureRects() {
      setRects(() => {
        if (!elements.length) {
          return defaultValue$2;
        }
        return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
      });
    }
    const resizeObserver = useResizeObserver({
      callback: measureRects
    });
    useIsomorphicLayoutEffect(() => {
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      measureRects();
      elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
    }, [elements]);
    return rects;
  }
  function getMeasurableNode(node2) {
    if (!node2) {
      return null;
    }
    if (node2.children.length > 1) {
      return node2;
    }
    const firstChild = node2.children[0];
    return isHTMLElement(firstChild) ? firstChild : node2;
  }
  function useDragOverlayMeasuring(_ref8) {
    let {
      measure
    } = _ref8;
    const [rect, setRect] = React.useState(null);
    const handleResize = React.useCallback((entries) => {
      for (const {
        target
      } of entries) {
        if (isHTMLElement(target)) {
          setRect((rect2) => {
            const newRect = measure(target);
            return rect2 ? {
              ...rect2,
              width: newRect.width,
              height: newRect.height
            } : newRect;
          });
          break;
        }
      }
    }, [measure]);
    const resizeObserver = useResizeObserver({
      callback: handleResize
    });
    const handleNodeChange = React.useCallback((element) => {
      const node2 = getMeasurableNode(element);
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      if (node2) {
        resizeObserver == null ? void 0 : resizeObserver.observe(node2);
      }
      setRect(node2 ? measure(node2) : null);
    }, [measure, resizeObserver]);
    const [nodeRef, setRef] = useNodeRef(handleNodeChange);
    return React.useMemo(() => ({
      nodeRef,
      rect,
      setRef
    }), [rect, nodeRef, setRef]);
  }
  const defaultSensors = [{
    sensor: PointerSensor,
    options: {}
  }, {
    sensor: KeyboardSensor,
    options: {}
  }];
  const defaultData = {
    current: {}
  };
  const defaultMeasuringConfiguration = {
    draggable: {
      measure: getTransformAgnosticClientRect
    },
    droppable: {
      measure: getTransformAgnosticClientRect,
      strategy: MeasuringStrategy.WhileDragging,
      frequency: MeasuringFrequency.Optimized
    },
    dragOverlay: {
      measure: getClientRect
    }
  };
  class DroppableContainersMap extends Map {
    get(id) {
      var _super$get;
      return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
    }
    toArray() {
      return Array.from(this.values());
    }
    getEnabled() {
      return this.toArray().filter((_ref8) => {
        let {
          disabled
        } = _ref8;
        return !disabled;
      });
    }
    getNodeFor(id) {
      var _this$get$node$curren, _this$get;
      return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
    }
  }
  const defaultPublicContext = {
    activatorEvent: null,
    active: null,
    activeNode: null,
    activeNodeRect: null,
    collisions: null,
    containerNodeRect: null,
    draggableNodes: /* @__PURE__ */ new Map(),
    droppableRects: /* @__PURE__ */ new Map(),
    droppableContainers: /* @__PURE__ */ new DroppableContainersMap(),
    over: null,
    dragOverlay: {
      nodeRef: {
        current: null
      },
      rect: null,
      setRef: noop
    },
    scrollableAncestors: [],
    scrollableAncestorRects: [],
    measuringConfiguration: defaultMeasuringConfiguration,
    measureDroppableContainers: noop,
    windowRect: null,
    measuringScheduled: false
  };
  const defaultInternalContext = {
    activatorEvent: null,
    activators: [],
    active: null,
    activeNodeRect: null,
    ariaDescribedById: {
      draggable: ""
    },
    dispatch: noop,
    draggableNodes: /* @__PURE__ */ new Map(),
    over: null,
    measureDroppableContainers: noop
  };
  const InternalContext = /* @__PURE__ */ React.createContext(defaultInternalContext);
  const PublicContext = /* @__PURE__ */ React.createContext(defaultPublicContext);
  function getInitialState() {
    return {
      draggable: {
        active: null,
        initialCoordinates: {
          x: 0,
          y: 0
        },
        nodes: /* @__PURE__ */ new Map(),
        translate: {
          x: 0,
          y: 0
        }
      },
      droppable: {
        containers: new DroppableContainersMap()
      }
    };
  }
  function reducer(state, action2) {
    switch (action2.type) {
      case Action.DragStart:
        return {
          ...state,
          draggable: {
            ...state.draggable,
            initialCoordinates: action2.initialCoordinates,
            active: action2.active
          }
        };
      case Action.DragMove:
        if (state.draggable.active == null) {
          return state;
        }
        return {
          ...state,
          draggable: {
            ...state.draggable,
            translate: {
              x: action2.coordinates.x - state.draggable.initialCoordinates.x,
              y: action2.coordinates.y - state.draggable.initialCoordinates.y
            }
          }
        };
      case Action.DragEnd:
      case Action.DragCancel:
        return {
          ...state,
          draggable: {
            ...state.draggable,
            active: null,
            initialCoordinates: {
              x: 0,
              y: 0
            },
            translate: {
              x: 0,
              y: 0
            }
          }
        };
      case Action.RegisterDroppable: {
        const {
          element
        } = action2;
        const {
          id
        } = element;
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, element);
        return {
          ...state,
          droppable: {
            ...state.droppable,
            containers
          }
        };
      }
      case Action.SetDroppableDisabled: {
        const {
          id,
          key,
          disabled
        } = action2;
        const element = state.droppable.containers.get(id);
        if (!element || key !== element.key) {
          return state;
        }
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, {
          ...element,
          disabled
        });
        return {
          ...state,
          droppable: {
            ...state.droppable,
            containers
          }
        };
      }
      case Action.UnregisterDroppable: {
        const {
          id,
          key
        } = action2;
        const element = state.droppable.containers.get(id);
        if (!element || key !== element.key) {
          return state;
        }
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.delete(id);
        return {
          ...state,
          droppable: {
            ...state.droppable,
            containers
          }
        };
      }
      default: {
        return state;
      }
    }
  }
  function RestoreFocus(_ref8) {
    let {
      disabled
    } = _ref8;
    const {
      active,
      activatorEvent,
      draggableNodes
    } = React.useContext(InternalContext);
    const previousActivatorEvent = usePrevious(activatorEvent);
    const previousActiveId = usePrevious(active == null ? void 0 : active.id);
    React.useEffect(() => {
      if (disabled) {
        return;
      }
      if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
        if (!isKeyboardEvent(previousActivatorEvent)) {
          return;
        }
        if (document.activeElement === previousActivatorEvent.target) {
          return;
        }
        const draggableNode = draggableNodes.get(previousActiveId);
        if (!draggableNode) {
          return;
        }
        const {
          activatorNode,
          node: node2
        } = draggableNode;
        if (!activatorNode.current && !node2.current) {
          return;
        }
        requestAnimationFrame(() => {
          for (const element of [activatorNode.current, node2.current]) {
            if (!element) {
              continue;
            }
            const focusableNode = findFirstFocusableNode(element);
            if (focusableNode) {
              focusableNode.focus();
              break;
            }
          }
        });
      }
    }, [activatorEvent, disabled, draggableNodes, previousActiveId, previousActivatorEvent]);
    return null;
  }
  function applyModifiers(modifiers, _ref8) {
    let {
      transform,
      ...args
    } = _ref8;
    return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
      return modifier({
        transform: accumulator,
        ...args
      });
    }, transform) : transform;
  }
  function useMeasuringConfiguration(config) {
    return React.useMemo(
      () => ({
        draggable: {
          ...defaultMeasuringConfiguration.draggable,
          ...config == null ? void 0 : config.draggable
        },
        droppable: {
          ...defaultMeasuringConfiguration.droppable,
          ...config == null ? void 0 : config.droppable
        },
        dragOverlay: {
          ...defaultMeasuringConfiguration.dragOverlay,
          ...config == null ? void 0 : config.dragOverlay
        }
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [config == null ? void 0 : config.draggable, config == null ? void 0 : config.droppable, config == null ? void 0 : config.dragOverlay]
    );
  }
  function useLayoutShiftScrollCompensation(_ref8) {
    let {
      activeNode,
      measure,
      initialRect,
      config = true
    } = _ref8;
    const initialized = React.useRef(false);
    const {
      x,
      y
    } = typeof config === "boolean" ? {
      x: config,
      y: config
    } : config;
    useIsomorphicLayoutEffect(() => {
      const disabled = !x && !y;
      if (disabled || !activeNode) {
        initialized.current = false;
        return;
      }
      if (initialized.current || !initialRect) {
        return;
      }
      const node2 = activeNode == null ? void 0 : activeNode.node.current;
      if (!node2 || node2.isConnected === false) {
        return;
      }
      const rect = measure(node2);
      const rectDelta = getRectDelta(rect, initialRect);
      if (!x) {
        rectDelta.x = 0;
      }
      if (!y) {
        rectDelta.y = 0;
      }
      initialized.current = true;
      if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
        const firstScrollableAncestor = getFirstScrollableAncestor(node2);
        if (firstScrollableAncestor) {
          firstScrollableAncestor.scrollBy({
            top: rectDelta.y,
            left: rectDelta.x
          });
        }
      }
    }, [activeNode, x, y, initialRect, measure]);
  }
  const ActiveDraggableContext = /* @__PURE__ */ React.createContext({
    ...defaultCoordinates,
    scaleX: 1,
    scaleY: 1
  });
  var Status;
  (function(Status2) {
    Status2[Status2["Uninitialized"] = 0] = "Uninitialized";
    Status2[Status2["Initializing"] = 1] = "Initializing";
    Status2[Status2["Initialized"] = 2] = "Initialized";
  })(Status || (Status = {}));
  const DndContext = /* @__PURE__ */ React.memo(function DndContext2(_ref8) {
    var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
    let {
      id,
      accessibility,
      autoScroll = true,
      children,
      sensors = defaultSensors,
      collisionDetection = rectIntersection,
      measuring,
      modifiers,
      ...props
    } = _ref8;
    const store2 = React.useReducer(reducer, void 0, getInitialState);
    const [state, dispatch] = store2;
    const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
    const [status, setStatus] = React.useState(Status.Uninitialized);
    const isInitialized = status === Status.Initialized;
    const {
      draggable: {
        active: activeId,
        nodes: draggableNodes,
        translate
      },
      droppable: {
        containers: droppableContainers
      }
    } = state;
    const node2 = activeId != null ? draggableNodes.get(activeId) : null;
    const activeRects = React.useRef({
      initial: null,
      translated: null
    });
    const active = React.useMemo(() => {
      var _node$data;
      return activeId != null ? {
        id: activeId,
        // It's possible for the active node to unmount while dragging
        data: (_node$data = node2 == null ? void 0 : node2.data) != null ? _node$data : defaultData,
        rect: activeRects
      } : null;
    }, [activeId, node2]);
    const activeRef = React.useRef(null);
    const [activeSensor, setActiveSensor] = React.useState(null);
    const [activatorEvent, setActivatorEvent] = React.useState(null);
    const latestProps = useLatestValue(props, Object.values(props));
    const draggableDescribedById = useUniqueId("DndDescribedBy", id);
    const enabledDroppableContainers = React.useMemo(() => droppableContainers.getEnabled(), [droppableContainers]);
    const measuringConfiguration = useMeasuringConfiguration(measuring);
    const {
      droppableRects,
      measureDroppableContainers,
      measuringScheduled
    } = useDroppableMeasuring(enabledDroppableContainers, {
      dragging: isInitialized,
      dependencies: [translate.x, translate.y],
      config: measuringConfiguration.droppable
    });
    const activeNode = useCachedNode(draggableNodes, activeId);
    const activationCoordinates = React.useMemo(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
    const autoScrollOptions = getAutoScrollerOptions();
    const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
    useLayoutShiftScrollCompensation({
      activeNode: activeId != null ? draggableNodes.get(activeId) : null,
      config: autoScrollOptions.layoutShiftCompensation,
      initialRect: initialActiveNodeRect,
      measure: measuringConfiguration.draggable.measure
    });
    const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
    const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
    const sensorContext = React.useRef({
      activatorEvent: null,
      active: null,
      activeNode,
      collisionRect: null,
      collisions: null,
      droppableRects,
      draggableNodes,
      draggingNode: null,
      draggingNodeRect: null,
      droppableContainers,
      over: null,
      scrollableAncestors: [],
      scrollAdjustedTranslate: null
    });
    const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
    const dragOverlay = useDragOverlayMeasuring({
      measure: measuringConfiguration.dragOverlay.measure
    });
    const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
    const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
    const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
    const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
    const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
    const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
    const scrollableAncestorRects = useRects(scrollableAncestors);
    const modifiedTranslate = applyModifiers(modifiers, {
      transform: {
        x: translate.x - nodeRectDelta.x,
        y: translate.y - nodeRectDelta.y,
        scaleX: 1,
        scaleY: 1
      },
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggingNodeRect,
      over: sensorContext.current.over,
      overlayNodeRect: dragOverlay.rect,
      scrollableAncestors,
      scrollableAncestorRects,
      windowRect
    });
    const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
    const scrollOffsets = useScrollOffsets(scrollableAncestors);
    const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
    const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
    const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
    const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
    const collisions = active && collisionRect ? collisionDetection({
      active,
      collisionRect,
      droppableRects,
      droppableContainers: enabledDroppableContainers,
      pointerCoordinates
    }) : null;
    const overId = getFirstCollision(collisions, "id");
    const [over, setOver] = React.useState(null);
    const appliedTranslate = usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta);
    const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
    const activeSensorRef = React.useRef(null);
    const instantiateSensor = React.useCallback(
      (event, _ref22) => {
        let {
          sensor: Sensor,
          options
        } = _ref22;
        if (activeRef.current == null) {
          return;
        }
        const activeNode2 = draggableNodes.get(activeRef.current);
        if (!activeNode2) {
          return;
        }
        const activatorEvent2 = event.nativeEvent;
        const sensorInstance = new Sensor({
          active: activeRef.current,
          activeNode: activeNode2,
          event: activatorEvent2,
          options,
          // Sensors need to be instantiated with refs for arguments that change over time
          // otherwise they are frozen in time with the stale arguments
          context: sensorContext,
          onAbort(id2) {
            const draggableNode = draggableNodes.get(id2);
            if (!draggableNode) {
              return;
            }
            const {
              onDragAbort
            } = latestProps.current;
            const event2 = {
              id: id2
            };
            onDragAbort == null ? void 0 : onDragAbort(event2);
            dispatchMonitorEvent({
              type: "onDragAbort",
              event: event2
            });
          },
          onPending(id2, constraint, initialCoordinates, offset) {
            const draggableNode = draggableNodes.get(id2);
            if (!draggableNode) {
              return;
            }
            const {
              onDragPending
            } = latestProps.current;
            const event2 = {
              id: id2,
              constraint,
              initialCoordinates,
              offset
            };
            onDragPending == null ? void 0 : onDragPending(event2);
            dispatchMonitorEvent({
              type: "onDragPending",
              event: event2
            });
          },
          onStart(initialCoordinates) {
            const id2 = activeRef.current;
            if (id2 == null) {
              return;
            }
            const draggableNode = draggableNodes.get(id2);
            if (!draggableNode) {
              return;
            }
            const {
              onDragStart
            } = latestProps.current;
            const event2 = {
              activatorEvent: activatorEvent2,
              active: {
                id: id2,
                data: draggableNode.data,
                rect: activeRects
              }
            };
            require$$0.unstable_batchedUpdates(() => {
              onDragStart == null ? void 0 : onDragStart(event2);
              setStatus(Status.Initializing);
              dispatch({
                type: Action.DragStart,
                initialCoordinates,
                active: id2
              });
              dispatchMonitorEvent({
                type: "onDragStart",
                event: event2
              });
              setActiveSensor(activeSensorRef.current);
              setActivatorEvent(activatorEvent2);
            });
          },
          onMove(coordinates) {
            dispatch({
              type: Action.DragMove,
              coordinates
            });
          },
          onEnd: createHandler2(Action.DragEnd),
          onCancel: createHandler2(Action.DragCancel)
        });
        activeSensorRef.current = sensorInstance;
        function createHandler2(type) {
          return async function handler() {
            const {
              active: active2,
              collisions: collisions2,
              over: over2,
              scrollAdjustedTranslate: scrollAdjustedTranslate2
            } = sensorContext.current;
            let event2 = null;
            if (active2 && scrollAdjustedTranslate2) {
              const {
                cancelDrop
              } = latestProps.current;
              event2 = {
                activatorEvent: activatorEvent2,
                active: active2,
                collisions: collisions2,
                delta: scrollAdjustedTranslate2,
                over: over2
              };
              if (type === Action.DragEnd && typeof cancelDrop === "function") {
                const shouldCancel = await Promise.resolve(cancelDrop(event2));
                if (shouldCancel) {
                  type = Action.DragCancel;
                }
              }
            }
            activeRef.current = null;
            require$$0.unstable_batchedUpdates(() => {
              dispatch({
                type
              });
              setStatus(Status.Uninitialized);
              setOver(null);
              setActiveSensor(null);
              setActivatorEvent(null);
              activeSensorRef.current = null;
              const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
              if (event2) {
                const handler2 = latestProps.current[eventName];
                handler2 == null ? void 0 : handler2(event2);
                dispatchMonitorEvent({
                  type: eventName,
                  event: event2
                });
              }
            });
          };
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [draggableNodes]
    );
    const bindActivatorToSensorInstantiator = React.useCallback((handler, sensor) => {
      return (event, active2) => {
        const nativeEvent = event.nativeEvent;
        const activeDraggableNode = draggableNodes.get(active2);
        if (
          // Another sensor is already instantiating
          activeRef.current !== null || // No active draggable
          !activeDraggableNode || // Event has already been captured
          nativeEvent.dndKit || nativeEvent.defaultPrevented
        ) {
          return;
        }
        const activationContext = {
          active: activeDraggableNode
        };
        const shouldActivate = handler(event, sensor.options, activationContext);
        if (shouldActivate === true) {
          nativeEvent.dndKit = {
            capturedBy: sensor.sensor
          };
          activeRef.current = active2;
          instantiateSensor(event, sensor);
        }
      };
    }, [draggableNodes, instantiateSensor]);
    const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
    useSensorSetup(sensors);
    useIsomorphicLayoutEffect(() => {
      if (activeNodeRect && status === Status.Initializing) {
        setStatus(Status.Initialized);
      }
    }, [activeNodeRect, status]);
    React.useEffect(
      () => {
        const {
          onDragMove
        } = latestProps.current;
        const {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          over: over2
        } = sensorContext.current;
        if (!active2 || !activatorEvent2) {
          return;
        }
        const event = {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          delta: {
            x: scrollAdjustedTranslate.x,
            y: scrollAdjustedTranslate.y
          },
          over: over2
        };
        require$$0.unstable_batchedUpdates(() => {
          onDragMove == null ? void 0 : onDragMove(event);
          dispatchMonitorEvent({
            type: "onDragMove",
            event
          });
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
    );
    React.useEffect(
      () => {
        const {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          droppableContainers: droppableContainers2,
          scrollAdjustedTranslate: scrollAdjustedTranslate2
        } = sensorContext.current;
        if (!active2 || activeRef.current == null || !activatorEvent2 || !scrollAdjustedTranslate2) {
          return;
        }
        const {
          onDragOver
        } = latestProps.current;
        const overContainer = droppableContainers2.get(overId);
        const over2 = overContainer && overContainer.rect.current ? {
          id: overContainer.id,
          rect: overContainer.rect.current,
          data: overContainer.data,
          disabled: overContainer.disabled
        } : null;
        const event = {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          delta: {
            x: scrollAdjustedTranslate2.x,
            y: scrollAdjustedTranslate2.y
          },
          over: over2
        };
        require$$0.unstable_batchedUpdates(() => {
          setOver(over2);
          onDragOver == null ? void 0 : onDragOver(event);
          dispatchMonitorEvent({
            type: "onDragOver",
            event
          });
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [overId]
    );
    useIsomorphicLayoutEffect(() => {
      sensorContext.current = {
        activatorEvent,
        active,
        activeNode,
        collisionRect,
        collisions,
        droppableRects,
        draggableNodes,
        draggingNode,
        draggingNodeRect,
        droppableContainers,
        over,
        scrollableAncestors,
        scrollAdjustedTranslate
      };
      activeRects.current = {
        initial: draggingNodeRect,
        translated: collisionRect
      };
    }, [active, activeNode, collisions, collisionRect, draggableNodes, draggingNode, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate]);
    useAutoScroller({
      ...autoScrollOptions,
      delta: translate,
      draggingRect: collisionRect,
      pointerCoordinates,
      scrollableAncestors,
      scrollableAncestorRects
    });
    const publicContext = React.useMemo(() => {
      const context = {
        active,
        activeNode,
        activeNodeRect,
        activatorEvent,
        collisions,
        containerNodeRect,
        dragOverlay,
        draggableNodes,
        droppableContainers,
        droppableRects,
        over,
        measureDroppableContainers,
        scrollableAncestors,
        scrollableAncestorRects,
        measuringConfiguration,
        measuringScheduled,
        windowRect
      };
      return context;
    }, [active, activeNode, activeNodeRect, activatorEvent, collisions, containerNodeRect, dragOverlay, draggableNodes, droppableContainers, droppableRects, over, measureDroppableContainers, scrollableAncestors, scrollableAncestorRects, measuringConfiguration, measuringScheduled, windowRect]);
    const internalContext = React.useMemo(() => {
      const context = {
        activatorEvent,
        activators,
        active,
        activeNodeRect,
        ariaDescribedById: {
          draggable: draggableDescribedById
        },
        dispatch,
        draggableNodes,
        over,
        measureDroppableContainers
      };
      return context;
    }, [activatorEvent, activators, active, activeNodeRect, dispatch, draggableDescribedById, draggableNodes, over, measureDroppableContainers]);
    return React.createElement(DndMonitorContext.Provider, {
      value: registerMonitorListener
    }, React.createElement(InternalContext.Provider, {
      value: internalContext
    }, React.createElement(PublicContext.Provider, {
      value: publicContext
    }, React.createElement(ActiveDraggableContext.Provider, {
      value: transform
    }, children)), React.createElement(RestoreFocus, {
      disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
    })), React.createElement(Accessibility, {
      ...accessibility,
      hiddenTextDescribedById: draggableDescribedById
    }));
    function getAutoScrollerOptions() {
      const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
      const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
      const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
      if (typeof autoScroll === "object") {
        return {
          ...autoScroll,
          enabled
        };
      }
      return {
        enabled
      };
    }
  });
  const NullContext = /* @__PURE__ */ React.createContext(null);
  const defaultRole = "button";
  const ID_PREFIX$1 = "Draggable";
  function useDraggable(_ref8) {
    let {
      id,
      data: data2,
      disabled = false,
      attributes
    } = _ref8;
    const key = useUniqueId(ID_PREFIX$1);
    const {
      activators,
      activatorEvent,
      active,
      activeNodeRect,
      ariaDescribedById,
      draggableNodes,
      over
    } = React.useContext(InternalContext);
    const {
      role = defaultRole,
      roleDescription = "draggable",
      tabIndex = 0
    } = attributes != null ? attributes : {};
    const isDragging = (active == null ? void 0 : active.id) === id;
    const transform = React.useContext(isDragging ? ActiveDraggableContext : NullContext);
    const [node2, setNodeRef] = useNodeRef();
    const [activatorNode, setActivatorNodeRef] = useNodeRef();
    const listeners2 = useSyntheticListeners(activators, id);
    const dataRef = useLatestValue(data2);
    useIsomorphicLayoutEffect(
      () => {
        draggableNodes.set(id, {
          id,
          key,
          node: node2,
          activatorNode,
          data: dataRef
        });
        return () => {
          const node3 = draggableNodes.get(id);
          if (node3 && node3.key === key) {
            draggableNodes.delete(id);
          }
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [draggableNodes, id]
    );
    const memoizedAttributes = React.useMemo(() => ({
      role,
      tabIndex,
      "aria-disabled": disabled,
      "aria-pressed": isDragging && role === defaultRole ? true : void 0,
      "aria-roledescription": roleDescription,
      "aria-describedby": ariaDescribedById.draggable
    }), [disabled, role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
    return {
      active,
      activatorEvent,
      activeNodeRect,
      attributes: memoizedAttributes,
      isDragging,
      listeners: disabled ? void 0 : listeners2,
      node: node2,
      over,
      setNodeRef,
      setActivatorNodeRef,
      transform
    };
  }
  function useDndContext() {
    return React.useContext(PublicContext);
  }
  const ID_PREFIX$1$1 = "Droppable";
  const defaultResizeObserverConfig = {
    timeout: 25
  };
  function useDroppable(_ref8) {
    let {
      data: data2,
      disabled = false,
      id,
      resizeObserverConfig
    } = _ref8;
    const key = useUniqueId(ID_PREFIX$1$1);
    const {
      active,
      dispatch,
      over,
      measureDroppableContainers
    } = React.useContext(InternalContext);
    const previous = React.useRef({
      disabled
    });
    const resizeObserverConnected = React.useRef(false);
    const rect = React.useRef(null);
    const callbackId = React.useRef(null);
    const {
      disabled: resizeObserverDisabled,
      updateMeasurementsFor,
      timeout: resizeObserverTimeout
    } = {
      ...defaultResizeObserverConfig,
      ...resizeObserverConfig
    };
    const ids2 = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
    const handleResize = React.useCallback(
      () => {
        if (!resizeObserverConnected.current) {
          resizeObserverConnected.current = true;
          return;
        }
        if (callbackId.current != null) {
          clearTimeout(callbackId.current);
        }
        callbackId.current = setTimeout(() => {
          measureDroppableContainers(Array.isArray(ids2.current) ? ids2.current : [ids2.current]);
          callbackId.current = null;
        }, resizeObserverTimeout);
      },
      //eslint-disable-next-line react-hooks/exhaustive-deps
      [resizeObserverTimeout]
    );
    const resizeObserver = useResizeObserver({
      callback: handleResize,
      disabled: resizeObserverDisabled || !active
    });
    const handleNodeChange = React.useCallback((newElement, previousElement) => {
      if (!resizeObserver) {
        return;
      }
      if (previousElement) {
        resizeObserver.unobserve(previousElement);
        resizeObserverConnected.current = false;
      }
      if (newElement) {
        resizeObserver.observe(newElement);
      }
    }, [resizeObserver]);
    const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
    const dataRef = useLatestValue(data2);
    React.useEffect(() => {
      if (!resizeObserver || !nodeRef.current) {
        return;
      }
      resizeObserver.disconnect();
      resizeObserverConnected.current = false;
      resizeObserver.observe(nodeRef.current);
    }, [nodeRef, resizeObserver]);
    React.useEffect(
      () => {
        dispatch({
          type: Action.RegisterDroppable,
          element: {
            id,
            key,
            disabled,
            node: nodeRef,
            rect,
            data: dataRef
          }
        });
        return () => dispatch({
          type: Action.UnregisterDroppable,
          key,
          id
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [id]
    );
    React.useEffect(() => {
      if (disabled !== previous.current.disabled) {
        dispatch({
          type: Action.SetDroppableDisabled,
          id,
          key,
          disabled
        });
        previous.current.disabled = disabled;
      }
    }, [id, key, disabled, dispatch]);
    return {
      active,
      rect,
      isOver: (over == null ? void 0 : over.id) === id,
      node: nodeRef,
      over,
      setNodeRef
    };
  }
  function restrictToBoundingRect(transform, rect, boundingRect) {
    const value = {
      ...transform
    };
    if (rect.top + transform.y <= boundingRect.top) {
      value.y = boundingRect.top - rect.top;
    } else if (rect.bottom + transform.y >= boundingRect.top + boundingRect.height) {
      value.y = boundingRect.top + boundingRect.height - rect.bottom;
    }
    if (rect.left + transform.x <= boundingRect.left) {
      value.x = boundingRect.left - rect.left;
    } else if (rect.right + transform.x >= boundingRect.left + boundingRect.width) {
      value.x = boundingRect.left + boundingRect.width - rect.right;
    }
    return value;
  }
  const restrictToParentElement = (_ref8) => {
    let {
      containerNodeRect,
      draggingNodeRect,
      transform
    } = _ref8;
    if (!draggingNodeRect || !containerNodeRect) {
      return transform;
    }
    return restrictToBoundingRect(transform, draggingNodeRect, containerNodeRect);
  };
  const restrictToVerticalAxis = (_ref8) => {
    let {
      transform
    } = _ref8;
    return {
      ...transform,
      x: 0
    };
  };
  function arrayMove(array, from2, to) {
    const newArray = array.slice();
    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from2, 1)[0]);
    return newArray;
  }
  function getSortedRects(items, rects) {
    return items.reduce((accumulator, id, index) => {
      const rect = rects.get(id);
      if (rect) {
        accumulator[index] = rect;
      }
      return accumulator;
    }, Array(items.length));
  }
  function isValidIndex(index) {
    return index !== null && index >= 0;
  }
  function itemsEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  function normalizeDisabled(disabled) {
    if (typeof disabled === "boolean") {
      return {
        draggable: disabled,
        droppable: disabled
      };
    }
    return disabled;
  }
  const rectSortingStrategy = (_ref8) => {
    let {
      rects,
      activeIndex,
      overIndex,
      index
    } = _ref8;
    const newRects = arrayMove(rects, overIndex, activeIndex);
    const oldRect = rects[index];
    const newRect = newRects[index];
    if (!newRect || !oldRect) {
      return null;
    }
    return {
      x: newRect.left - oldRect.left,
      y: newRect.top - oldRect.top,
      scaleX: newRect.width / oldRect.width,
      scaleY: newRect.height / oldRect.height
    };
  };
  const defaultScale$1 = {
    scaleX: 1,
    scaleY: 1
  };
  const verticalListSortingStrategy = (_ref8) => {
    var _rects$activeIndex;
    let {
      activeIndex,
      activeNodeRect: fallbackActiveRect,
      index,
      rects,
      overIndex
    } = _ref8;
    const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
    if (!activeNodeRect) {
      return null;
    }
    if (index === activeIndex) {
      const overIndexRect = rects[overIndex];
      if (!overIndexRect) {
        return null;
      }
      return {
        x: 0,
        y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
        ...defaultScale$1
      };
    }
    const itemGap = getItemGap$1(rects, index, activeIndex);
    if (index > activeIndex && index <= overIndex) {
      return {
        x: 0,
        y: -activeNodeRect.height - itemGap,
        ...defaultScale$1
      };
    }
    if (index < activeIndex && index >= overIndex) {
      return {
        x: 0,
        y: activeNodeRect.height + itemGap,
        ...defaultScale$1
      };
    }
    return {
      x: 0,
      y: 0,
      ...defaultScale$1
    };
  };
  function getItemGap$1(clientRects, index, activeIndex) {
    const currentRect = clientRects[index];
    const previousRect = clientRects[index - 1];
    const nextRect = clientRects[index + 1];
    if (!currentRect) {
      return 0;
    }
    if (activeIndex < index) {
      return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
    }
    return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
  }
  const ID_PREFIX = "Sortable";
  const Context = /* @__PURE__ */ React.createContext({
    activeIndex: -1,
    containerId: ID_PREFIX,
    disableTransforms: false,
    items: [],
    overIndex: -1,
    useDragOverlay: false,
    sortedRects: [],
    strategy: rectSortingStrategy,
    disabled: {
      draggable: false,
      droppable: false
    }
  });
  function SortableContext(_ref8) {
    let {
      children,
      id,
      items: userDefinedItems,
      strategy = rectSortingStrategy,
      disabled: disabledProp = false
    } = _ref8;
    const {
      active,
      dragOverlay,
      droppableRects,
      over,
      measureDroppableContainers
    } = useDndContext();
    const containerId = useUniqueId(ID_PREFIX, id);
    const useDragOverlay = Boolean(dragOverlay.rect !== null);
    const items = React.useMemo(() => userDefinedItems.map((item) => typeof item === "object" && "id" in item ? item.id : item), [userDefinedItems]);
    const isDragging = active != null;
    const activeIndex = active ? items.indexOf(active.id) : -1;
    const overIndex = over ? items.indexOf(over.id) : -1;
    const previousItemsRef = React.useRef(items);
    const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
    const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
    const disabled = normalizeDisabled(disabledProp);
    useIsomorphicLayoutEffect(() => {
      if (itemsHaveChanged && isDragging) {
        measureDroppableContainers(items);
      }
    }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);
    React.useEffect(() => {
      previousItemsRef.current = items;
    }, [items]);
    const contextValue = React.useMemo(
      () => ({
        activeIndex,
        containerId,
        disabled,
        disableTransforms,
        items,
        overIndex,
        useDragOverlay,
        sortedRects: getSortedRects(items, droppableRects),
        strategy
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [activeIndex, containerId, disabled.draggable, disabled.droppable, disableTransforms, items, overIndex, droppableRects, useDragOverlay, strategy]
    );
    return React.createElement(Context.Provider, {
      value: contextValue
    }, children);
  }
  const defaultNewIndexGetter = (_ref8) => {
    let {
      id,
      items,
      activeIndex,
      overIndex
    } = _ref8;
    return arrayMove(items, activeIndex, overIndex).indexOf(id);
  };
  const defaultAnimateLayoutChanges = (_ref22) => {
    let {
      containerId,
      isSorting,
      wasDragging,
      index,
      items,
      newIndex,
      previousItems,
      previousContainerId,
      transition
    } = _ref22;
    if (!transition || !wasDragging) {
      return false;
    }
    if (previousItems !== items && index === newIndex) {
      return false;
    }
    if (isSorting) {
      return true;
    }
    return newIndex !== index && containerId === previousContainerId;
  };
  const defaultTransition = {
    duration: 200,
    easing: "ease"
  };
  const transitionProperty = "transform";
  const disabledTransition = /* @__PURE__ */ CSS.Transition.toString({
    property: transitionProperty,
    duration: 0,
    easing: "linear"
  });
  const defaultAttributes = {
    roleDescription: "sortable"
  };
  function useDerivedTransform(_ref8) {
    let {
      disabled,
      index,
      node: node2,
      rect
    } = _ref8;
    const [derivedTransform, setDerivedtransform] = React.useState(null);
    const previousIndex = React.useRef(index);
    useIsomorphicLayoutEffect(() => {
      if (!disabled && index !== previousIndex.current && node2.current) {
        const initial = rect.current;
        if (initial) {
          const current = getClientRect(node2.current, {
            ignoreTransform: true
          });
          const delta = {
            x: initial.left - current.left,
            y: initial.top - current.top,
            scaleX: initial.width / current.width,
            scaleY: initial.height / current.height
          };
          if (delta.x || delta.y) {
            setDerivedtransform(delta);
          }
        }
      }
      if (index !== previousIndex.current) {
        previousIndex.current = index;
      }
    }, [disabled, index, node2, rect]);
    React.useEffect(() => {
      if (derivedTransform) {
        setDerivedtransform(null);
      }
    }, [derivedTransform]);
    return derivedTransform;
  }
  function useSortable(_ref8) {
    let {
      animateLayoutChanges = defaultAnimateLayoutChanges,
      attributes: userDefinedAttributes,
      disabled: localDisabled,
      data: customData,
      getNewIndex = defaultNewIndexGetter,
      id,
      strategy: localStrategy,
      resizeObserverConfig,
      transition = defaultTransition
    } = _ref8;
    const {
      items,
      containerId,
      activeIndex,
      disabled: globalDisabled,
      disableTransforms,
      sortedRects,
      overIndex,
      useDragOverlay,
      strategy: globalStrategy
    } = React.useContext(Context);
    const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
    const index = items.indexOf(id);
    const data2 = React.useMemo(() => ({
      sortable: {
        containerId,
        index,
        items
      },
      ...customData
    }), [containerId, customData, index, items]);
    const itemsAfterCurrentSortable = React.useMemo(() => items.slice(items.indexOf(id)), [items, id]);
    const {
      rect,
      node: node2,
      isOver,
      setNodeRef: setDroppableNodeRef
    } = useDroppable({
      id,
      data: data2,
      disabled: disabled.droppable,
      resizeObserverConfig: {
        updateMeasurementsFor: itemsAfterCurrentSortable,
        ...resizeObserverConfig
      }
    });
    const {
      active,
      activatorEvent,
      activeNodeRect,
      attributes,
      setNodeRef: setDraggableNodeRef,
      listeners: listeners2,
      isDragging,
      over,
      setActivatorNodeRef,
      transform
    } = useDraggable({
      id,
      data: data2,
      attributes: {
        ...defaultAttributes,
        ...userDefinedAttributes
      },
      disabled: disabled.draggable
    });
    const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
    const isSorting = Boolean(active);
    const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
    const shouldDisplaceDragSource = !useDragOverlay && isDragging;
    const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
    const strategy = localStrategy != null ? localStrategy : globalStrategy;
    const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
      rects: sortedRects,
      activeNodeRect,
      activeIndex,
      overIndex,
      index
    }) : null;
    const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
      id,
      items,
      activeIndex,
      overIndex
    }) : index;
    const activeId = active == null ? void 0 : active.id;
    const previous = React.useRef({
      activeId,
      items,
      newIndex,
      containerId
    });
    const itemsHaveChanged = items !== previous.current.items;
    const shouldAnimateLayoutChanges = animateLayoutChanges({
      active,
      containerId,
      isDragging,
      isSorting,
      id,
      index,
      items,
      newIndex: previous.current.newIndex,
      previousItems: previous.current.items,
      previousContainerId: previous.current.containerId,
      transition,
      wasDragging: previous.current.activeId != null
    });
    const derivedTransform = useDerivedTransform({
      disabled: !shouldAnimateLayoutChanges,
      index,
      node: node2,
      rect
    });
    React.useEffect(() => {
      if (isSorting && previous.current.newIndex !== newIndex) {
        previous.current.newIndex = newIndex;
      }
      if (containerId !== previous.current.containerId) {
        previous.current.containerId = containerId;
      }
      if (items !== previous.current.items) {
        previous.current.items = items;
      }
    }, [isSorting, newIndex, containerId, items]);
    React.useEffect(() => {
      if (activeId === previous.current.activeId) {
        return;
      }
      if (activeId != null && previous.current.activeId == null) {
        previous.current.activeId = activeId;
        return;
      }
      const timeoutId = setTimeout(() => {
        previous.current.activeId = activeId;
      }, 50);
      return () => clearTimeout(timeoutId);
    }, [activeId]);
    return {
      active,
      activeIndex,
      attributes,
      data: data2,
      rect,
      index,
      newIndex,
      items,
      isOver,
      isSorting,
      isDragging,
      listeners: listeners2,
      node: node2,
      overIndex,
      over,
      setNodeRef,
      setActivatorNodeRef,
      setDroppableNodeRef,
      setDraggableNodeRef,
      transform: derivedTransform != null ? derivedTransform : finalTransform,
      transition: getTransition()
    };
    function getTransition() {
      if (
        // Temporarily disable transitions for a single frame to set up derived transforms
        derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
        itemsHaveChanged && previous.current.newIndex === index
      ) {
        return disabledTransition;
      }
      if (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent) || !transition) {
        return void 0;
      }
      if (isSorting || shouldAnimateLayoutChanges) {
        return CSS.Transition.toString({
          ...transition,
          property: transitionProperty
        });
      }
      return void 0;
    }
  }
  function normalizeLocalDisabled(localDisabled, globalDisabled) {
    var _localDisabled$dragga, _localDisabled$droppa;
    if (typeof localDisabled === "boolean") {
      return {
        draggable: localDisabled,
        // Backwards compatibility
        droppable: false
      };
    }
    return {
      draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
      droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
    };
  }
  [KeyboardCode.Down, KeyboardCode.Right, KeyboardCode.Up, KeyboardCode.Left];
  const iconParkOutlineDrag = (props, ref) => /* @__PURE__ */ jsx$1("svg", { viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", ref, ...props, children: /* @__PURE__ */ jsx$1("path", { fill: "currentColor", fillRule: "evenodd", d: "M19 10a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-4 18a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 14a4 4 0 1 0 0-8a4 4 0 0 0 0 8m22-32a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-4 18a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 14a4 4 0 1 0 0-8a4 4 0 0 0 0 8", clipRule: "evenodd" }) });
  const ForwardRef = React.forwardRef(iconParkOutlineDrag);
  var _ref4$2 = {
    name: "1d3w5wq",
    styles: "width:100%"
  };
  var _ref5$1 = {
    name: "1hzl8wy",
    styles: "margin-left:20px!important"
  };
  var _ref6$1 = {
    name: "1fttcpj",
    styles: "display:flex;flex-direction:column"
  };
  var _ref7$1 = {
    name: "1js6ety",
    styles: "display:grid;grid-template-columns:250px 1fr;column-gap:50px"
  };
  function TabPaneRecTabsConfig() {
    const {
      dynamicFeed,
      appRecommend
    } = useSettingsSnapshot();
    const sortedTabKeys = useSortedTabKeys();
    return /* @__PURE__ */ jsx$1("div", { className: styles$1.tabPane, children: /* @__PURE__ */ jsxs("div", { css: _ref7$1, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupTitle, children: [
          "Tab 设置",
          /* @__PURE__ */ jsx$1(HelpInfo, { className: "ml-5px mr-20px", children: "勾选显示, 拖动排序" }),
          /* @__PURE__ */ jsx$1(antd.Col, { flex: 1 }),
          /* @__PURE__ */ jsx$1(ResetPartialSettingsButton, { paths: ["hidingTabKeys", "customTabKeysOrder"] })
        ] }),
        /* @__PURE__ */ jsx$1(VideoSourceTabOrder, {})
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [
        /* @__PURE__ */ jsx$1("div", { className: styles$1.settingsGroupTitle, children: "更多设置" }),
        /* @__PURE__ */ jsxs("div", { className: clsx(styles$1.settingsGroupContent), css: _ref6$1, children: [
          /* @__PURE__ */ jsxs("div", { css: /* @__PURE__ */ css("order:", sortedTabKeys.indexOf(ETab.Watchlater) + 1, ";", ""), children: [
            /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupSubTitle, children: [
              /* @__PURE__ */ jsx$1(TabIcon, { tabKey: ETab.Watchlater, mr: 5, mt: -1 }),
              "稍后再看"
            ] }),
            /* @__PURE__ */ jsxs(antd.Space, { size: 10, children: [
              /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "watchlaterUseShuffle", label: "随机顺序", tooltip: "不包括近期添加的「稍后再看」" }),
              /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "watchlaterAddSeparator", label: "添加分割线", tooltip: "添加「近期」「更早」分割线", css: _ref5$1 })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { css: /* @__PURE__ */ css("order:", sortedTabKeys.indexOf(ETab.Fav) + 1, ";", ""), children: [
            /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupSubTitle, children: [
              /* @__PURE__ */ jsx$1(TabIcon, { tabKey: ETab.Fav, mr: 5, mt: -2 }),
              "收藏"
            ] }),
            /* @__PURE__ */ jsx$1(antd.Space, { size: 10, children: /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "fav.addSeparator", label: "添加分割线", tooltip: "顺序显示时, 按收藏夹添加分割线" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { css: /* @__PURE__ */ css("order:", sortedTabKeys.indexOf(ETab.DynamicFeed) + 1, ";", ""), children: [
            /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupSubTitle, children: [
              /* @__PURE__ */ jsx$1(TabIcon, { tabKey: ETab.DynamicFeed, mr: 5, mt: -2 }),
              "动态"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap  gap-x-10 gap-y-10", children: [
              /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "dynamicFeed.followGroup.enabled", label: "启用分组筛选", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
                "动态 Tab 启用分组筛选 ",
                /* @__PURE__ */ jsx$1("br", {}),
                "当分组中 UP 较少(不超过",
                " ",
                FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD,
                "), 会使用「拼接时间线」的形式, 速度较快, 可以获取所有动态; ",
                /* @__PURE__ */ jsx$1("br", {}),
                "否则基于全部动态 + 分组UP过滤, 速度可能巨慢, 且貌似只能获取最近一个月的动态数据. ",
                /* @__PURE__ */ jsx$1("br", {})
              ] }) }),
              /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "dynamicFeed.showLive", label: "在动态中显示直播", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
                "动态里显示正在直播的 UP",
                /* @__PURE__ */ jsx$1("br", {}),
                "P.S 仅在选择「全部」时展示"
              ] }) }),
              /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "dynamicFeed.whenViewAll.enableHideSomeContents", label: "「全部」动态过滤", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
                "查看「全部」动态时 ",
                /* @__PURE__ */ jsx$1("br", {}),
                explainForFlag("将添加右键菜单, 点击可添加到「全部」动态的过滤列表", "关闭此功能")
              ] }) }),
              dynamicFeed.whenViewAll.enableHideSomeContents && /* @__PURE__ */ jsx$1(antd.Collapse, { size: "small", css: _ref4$2, items: [{
                key: "1",
                label: "在「全部」动态中隐藏 UP/分组 的动态",
                children: /* @__PURE__ */ jsx$1(DynamicFeedWhenViewAllHideIdsPanel, {})
              }] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { css: /* @__PURE__ */ css("order:", sortedTabKeys.indexOf(ETab.AppRecommend) + 1, ";", ""), children: [
            /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupSubTitle, children: [
              /* @__PURE__ */ jsx$1(TabIcon, { tabKey: ETab.AppRecommend, mr: 5 }),
              "App 推荐"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                "App API 设备类型",
                /* @__PURE__ */ jsxs(HelpInfo, { className: "ml-5px mr-10px", children: [
                  "默认 ipad, 视频有 头像/日期 等信息",
                  /* @__PURE__ */ jsx$1("br", {}),
                  "可选 android, 有图文类型的推荐"
                ] }),
                /* @__PURE__ */ jsx$1(antd.Radio.Group, { optionType: "button", buttonStyle: "solid", size: "small", options: [EAppApiDevice.ipad, EAppApiDevice.android], value: appRecommend.deviceParamForApi, onChange: (e) => void (settings.appRecommend.deviceParamForApi = e.target.value) })
              ] }),
              /* @__PURE__ */ jsx$1("div", { className: "flex items-center", children: /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "appRecommend.addOtherTabContents", label: "显示来自其他 Tab 的内容", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: [
                "显示来自其他 Tab 的内容 ",
                /* @__PURE__ */ jsx$1("br", {}),
                "如动态 / 收藏 / 稍后再看 ",
                /* @__PURE__ */ jsx$1("br", {}),
                "但是: 刷新时间会更长"
              ] }) }) })
            ] })
          ] })
        ] })
      ] })
    ] }) });
  }
  function useCurrentShowingTabKeys() {
    const {
      hidingTabKeys
    } = useSettingsSnapshot();
    return React.useMemo(() => TabKeys.filter((key) => !hidingTabKeys.includes(key)), [hidingTabKeys]);
  }
  var _ref3$2 = {
    name: "b1rfuh",
    styles: "display:block;line-height:unset"
  };
  function VideoSourceTabOrder({
    className,
    style
  }) {
    const currentShowingTabKeys = useCurrentShowingTabKeys();
    const sortedTabKeys = useSortedTabKeys();
    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = useMemoizedFn((e) => {
      const {
        over,
        active
      } = e;
      if (!(over == null ? void 0 : over.id) || over.id === active.id) return;
      const oldIndex = sortedTabKeys.indexOf(active.id.toString());
      const newIndex = sortedTabKeys.indexOf(over.id.toString());
      const newList = arrayMove(sortedTabKeys, oldIndex, newIndex);
      updateSettings({
        customTabKeysOrder: newList
      });
    });
    return /* @__PURE__ */ jsx$1("div", { ...{
      className,
      style
    }, children: /* @__PURE__ */ jsx$1(antd.Checkbox.Group, { css: _ref3$2, value: currentShowingTabKeys, onChange: (newVal) => {
      if (!newVal.length) {
        return antMessage.error("至少选择一项!");
      }
      updateSettings({
        hidingTabKeys: TabKeys.filter((k) => !newVal.includes(k))
      });
    }, children: /* @__PURE__ */ jsx$1(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis, restrictToParentElement], children: /* @__PURE__ */ jsx$1(SortableContext, { items: sortedTabKeys, strategy: verticalListSortingStrategy, children: sortedTabKeys.map((key) => /* @__PURE__ */ jsx$1(VideoSourceTabSortableItem, { id: key }, key)) }) }) }) });
  }
  var _ref$6 = {
    name: "82a6rk",
    styles: "flex:1"
  };
  var _ref2$5 = {
    name: "1krkdi0",
    styles: "display:inline-flex;align-items:center;.ant-checkbox+span{user-select:none;display:inline-flex;align-items:center;}"
  };
  function VideoSourceTabSortableItem({
    id
  }) {
    const {
      attributes,
      listeners: listeners2,
      setNodeRef,
      transform,
      transition,
      setActivatorNodeRef
    } = useSortable({
      id
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    };
    const {
      label,
      desc
    } = TabConfig[id];
    return /* @__PURE__ */ jsxs("div", { ref: setNodeRef, style, ...attributes, css: /* @__PURE__ */ css("display:flex;align-items:center;justify-content:flex-start;height:35px;padding-left:10px;padding-right:6px;border:1px solid ", bgLv2Value, ";border-radius:6px;margin-top:8px;", ""), children: [
      /* @__PURE__ */ jsxs(antd.Checkbox, { value: id, css: _ref2$5, children: [
        /* @__PURE__ */ jsx$1(TabIcon, { tabKey: id, mr: 5 }),
        /* @__PURE__ */ jsx$1(AntdTooltip, { align: {
          offset: [0, -6]
        }, title: desc, children: label })
      ] }),
      /* @__PURE__ */ jsx$1("div", { css: _ref$6 }),
      /* @__PURE__ */ jsx$1("div", { ...listeners2, ref: setActivatorNodeRef, css: /* @__PURE__ */ css("cursor:grab;font-size:0;padding:3px 5px;border-radius:5px;&:hover{background-color:", bgLv3Value, ";}", ""), children: /* @__PURE__ */ jsx$1(ForwardRef, { className: "size-18px" }) })
    ] }, id);
  }
  function DynamicFeedWhenViewAllHideIdsPanel() {
    const {
      hideIds
    } = useSnapshot(settings.dynamicFeed.whenViewAll);
    const onDelete = useMemoizedFn(async (mid) => {
      await updateSettingsInnerArray("dynamicFeed.whenViewAll.hideIds", {
        remove: [mid]
      });
    });
    const {
      followGroups
    } = useSnapshot(dfStore);
    useMount(() => {
      dfStore.updateFollowGroups();
    });
    const empty = !hideIds.length;
    if (empty) {
      return /* @__PURE__ */ jsx$1("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx$1(antd.Empty, {}) });
    }
    return /* @__PURE__ */ jsx$1("div", { className: "flex flex-wrap gap-10 max-h-250px overflow-y-scroll", children: hideIds.map((tag) => {
      return /* @__PURE__ */ jsx$1(TagItemDisplay, { tag, onDelete, renderTag: (t) => /* @__PURE__ */ jsx$1(DynamicFeedWhenViewAllHideIdTag, { tag: t, followGroups }) });
    }) });
  }
  function DynamicFeedWhenViewAllHideIdTag({
    tag,
    followGroups
  }) {
    let mid;
    let followGroupId;
    if (tag.startsWith(DF_SELECTED_KEY_PREFIX_UP)) {
      mid = tag.slice(DF_SELECTED_KEY_PREFIX_UP.length);
    } else if (tag.startsWith(DF_SELECTED_KEY_PREFIX_GROUP)) {
      followGroupId = tag.slice(DF_SELECTED_KEY_PREFIX_GROUP.length);
    } else ;
    const [upNickname, setUpNickname] = React.useState(void 0);
    useMount(async () => {
      if (!mid) return;
      const nickname = await getUserNickname(mid);
      if (nickname) setUpNickname(nickname);
    });
    const [followGroupName, setFollowGroupName] = React.useState(void 0);
    useMount(async () => {
      var _a2;
      if (!followGroupId) return;
      const groupName = (_a2 = followGroups == null ? void 0 : followGroups.find((g) => g.tagid.toString() === followGroupId)) == null ? void 0 : _a2.name;
      if (groupName) setFollowGroupName(groupName);
    });
    const label = React.useMemo(() => mid ? upNickname || mid : followGroupId ? followGroupName || followGroupId : "无效数据", [mid, upNickname, followGroupId, followGroupName]);
    const tooltip = React.useMemo(() => mid ? `mid: ${mid}` : followGroupId ? `分组: ${followGroupId}` : `Tag: ${tag}`, [mid, followGroupId, tag]);
    const icon = React.useMemo(() => mid ? /* @__PURE__ */ jsx$1(IconForUp, { ...size(12), className: "mr-2" }) : followGroupId ? /* @__PURE__ */ jsx$1(IconForGroup, { ...size(16), className: "mr-2" }) : void 0, [mid, followGroupId]);
    const href = React.useMemo(() => mid ? formatSpaceUrl(mid) : followGroupId ? formatFollowGroupUrl(followGroupId) : void 0, [mid, followGroupId]);
    return /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsx$1(AntdTooltip, { title: tooltip, children: /* @__PURE__ */ jsxs("span", { css: [inlineFlexVerticalCenterStyle, /* @__PURE__ */ css("cursor:", mid ? "pointer" : "edit", ";", ""), "", ""], children: [
      icon,
      href ? /* @__PURE__ */ jsx$1("a", { href, target: "_blank", children: label }) : label
    ] }) }) });
  }
  var _ref$5 = {
    name: "1ba68ro",
    styles: "min-width:60px;text-align:center;cursor:pointer"
  };
  var _ref2$4 = {
    name: "1kk26el",
    styles: "font-size:1.5em;display:flex;align-items:center;margin-top:10px"
  };
  function ThemesSelect() {
    const activeId = useCurrentTheme().id;
    const prevActiveId = usePrevious$1(activeId);
    const {
      colorPickerThemeSelectedColor
    } = useSettingsSnapshot();
    const [customColor, setCustomColor] = React.useState(colorPickerThemeSelectedColor || DEFAULT_BILI_PINK_THEME.colorPrimary);
    const customColorHex = React.useMemo(() => {
      return typeof customColor === "string" ? customColor : customColor.toHexString();
    }, [customColor]);
    useMount(() => {
      $evolvedThemeColor.updateThrottled();
    });
    return /* @__PURE__ */ jsx$1("div", { children: ThemeGroups.map(({
      name,
      themes,
      tooltip
    }) => {
      return /* @__PURE__ */ jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { css: _ref2$4, children: [
          name,
          /* @__PURE__ */ jsx$1(
            HelpInfo,
            {
              className: "size-16px",
              children: tooltip,
              tooltipProps: {
                color: "rgba(0, 0, 0, 0.85)"
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsx$1("div", { style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "2px 8px"
        }, children: themes.map((t) => {
          const isActive = activeId === t.id;
          const isCustom = t.isCustom;
          const useAnimation = !!prevActiveId && prevActiveId !== t.id;
          const innerSize = 30;
          const outerSize = innerSize + 8;
          let previewWrapper = /* @__PURE__ */ jsx$1("div", { className: "preview-wrapper", css: [/* @__PURE__ */ css("aspect-ratio:1;width:", outerSize, "px;border:2px solid transparent;border-radius:50%;margin:0 auto;font-size:0;", ""), flexCenterStyle, isActive && /* @__PURE__ */ css("border-color:", t.colorPrimary, ";", ""), "", ""], children: /* @__PURE__ */ jsx$1("div", { className: "preview", css: [/* @__PURE__ */ css("aspect-ratio:1;width:", innerSize, "px;background-color:", isCustom ? customColorHex : t.colorPrimary, ";border-radius:50%;color:#fff;", ""), flexCenterStyle, "", ""], children: isActive && /* @__PURE__ */ jsx$1(IconAnimatedChecked, { size: 18, useAnimation }) }) });
          if (t.isCustom) {
            previewWrapper = /* @__PURE__ */ jsx$1(
              antd.ColorPicker,
              {
                value: customColor,
                onChange: (c2) => setCustomColor(c2),
                onOpenChange: (open) => {
                  if (!open) {
                    updateSettings({
                      colorPickerThemeSelectedColor: customColorHex
                    });
                  }
                },
                children: previewWrapper
              }
            );
          }
          let el = /* @__PURE__ */ jsxs("div", { css: _ref$5, onClick: (e) => {
            updateSettings({
              theme: t.id
            });
          }, children: [
            previewWrapper,
            t.name
          ] });
          if (t.tooltip) {
            el = /* @__PURE__ */ jsx$1(AntdTooltip, { title: t.tooltip, children: el });
          }
          el = /* @__PURE__ */ jsx$1(React.Fragment, { children: el }, t.id);
          return el;
        }) })
      ] }, name);
    }) });
  }
  function useHotkeyForConfig(hotkey, configPath, label) {
    return useKeyPress(hotkey, (e) => {
      if (shouldDisableShortcut()) return;
      const _get = () => !!get(settings, configPath);
      const _set = (val) => set(settings, configPath, val);
      _set(!_get());
      const isCancel = !_get();
      antMessage.success(`已${isCancel ? "禁用" : "启用"}「${label}」`);
    }, {
      exactMatch: true
    });
  }
  const tab = "basic";
  const modalSettingsStore = proxy({
    tab
  });
  function ModalSettingsHotkey() {
    useHotkeyForConfig(["shift.p"], "autoPreviewWhenKeyboardSelect", "键盘选中后自动开始预览");
    useHotkeyForConfig(["shift.m"], "autoPreviewWhenHover", "鼠标悬浮后自动开始预览");
    useHotkeyForConfig(["shift.c"], "useNarrowMode", "居中模式");
    useHotkeyForConfigBorder();
    useHotkeyForToggleEvolvedDarkMode();
    return null;
  }
  var _ref$4 = {
    name: "4k370z",
    styles: "&.ant-tabs{.ant-tabs-tab{justify-content:end;padding-inline:5px 15px;}.ant-tabs-nav-operations{display:none;}}"
  };
  var _ref2$3 = {
    name: "mbnpfd",
    styles: "width:900px;max-height:unset"
  };
  function ModalSettings({
    show,
    onHide: onHide2
  }) {
    const {
      tab: tab2
    } = useSnapshot(modalSettingsStore);
    return /* @__PURE__ */ jsxs(BaseModal, { ...{
      show,
      onHide: onHide2,
      hideWhenMaskOnClick: true,
      hideWhenEsc: true,
      cssModal: _ref2$3
    }, children: [
      /* @__PURE__ */ jsxs("div", { css: BaseModalStyle.modalHeader, children: [
        /* @__PURE__ */ jsxs("div", { css: BaseModalStyle.modalTitle, children: [
          /* @__PURE__ */ jsx$1(IconForConfig, { className: "size-26 mr-4 mt--2" }),
          "设置"
        ] }),
        /* @__PURE__ */ jsx$1("div", { className: "space", style: {
          flex: 1
        } }),
        /* @__PURE__ */ jsx$1(ModalClose, { onClick: onHide2 })
      ] }),
      /* @__PURE__ */ jsx$1("main", { css: BaseModalStyle.modalBody, style: {
        overflow: "hidden"
      }, children: /* @__PURE__ */ jsx$1(antd.Tabs, { tabPosition: "left", size: "middle", css: _ref$4, activeKey: tab2, onChange: (tab3) => modalSettingsStore.tab = tab3, items: [{
        label: "常规设置",
        key: "basic",
        children: /* @__PURE__ */ jsx$1(TabPaneBasic, {})
      }, {
        label: "内容过滤",
        key: "filter",
        children: /* @__PURE__ */ jsx$1(TabPaneFilter, {})
      }, {
        label: "主题选择",
        key: "theme-select",
        children: /* @__PURE__ */ jsx$1("div", { className: styles$1.tabPane, children: /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [
          /* @__PURE__ */ jsx$1("div", { className: styles$1.settingsGroupTitle, style: {
            marginBottom: 15
          }, children: "主题选择" }),
          /* @__PURE__ */ jsx$1("div", { className: clsx(styles$1.settingsGroupContent), children: /* @__PURE__ */ jsx$1(ThemesSelect, {}) })
        ] }) })
      }, {
        label: "样式自定",
        key: "custom-ui",
        children: /* @__PURE__ */ jsx$1(TabPaneCustomUI, {})
      }, {
        label: "Tab 设置",
        key: "video-source-tab-config",
        children: /* @__PURE__ */ jsx$1(TabPaneRecTabsConfig, {})
      }, {
        label: "高级设置",
        key: "advance",
        children: /* @__PURE__ */ jsx$1(TabPaneAdvance, {})
      }] }) })
    ] });
  }
  var _ref$3 = {
    name: "xtte7r",
    styles: "gap:0;&.ant-btn:not(:disabled):focus-visible{outline:none;}"
  };
  const RefreshButton = React.forwardRef(function({
    onRefresh,
    className = "",
    style,
    refreshHotkeyEnabled,
    refreshing
  }, ref) {
    refreshHotkeyEnabled ?? (refreshHotkeyEnabled = true);
    React.useState(0);
    const btn = React.useRef(null);
    const click = useMemoizedFn(() => {
      if (!btn.current) return;
      if (btn.current.disabled) return;
      btn.current.click();
    });
    React.useImperativeHandle(ref, () => ({
      click
    }), []);
    useKeyPress("r", () => {
      if (shouldDisableShortcut()) return;
      if (!refreshHotkeyEnabled) return;
      click();
    }, {
      exactMatch: true
    });
    const tab2 = useCurrentUsingTab();
    const {
      watchlaterUseShuffle,
      popularWeeklyUseShuffle
    } = useSettingsSnapshot();
    const {
      usingShuffle: favUsingShuffle
    } = useSnapshot(favStore);
    const text = tab2 === ETab.AppRecommend || tab2 === ETab.PcRecommend || tab2 === ETab.KeepFollowOnly || tab2 === ETab.Watchlater && watchlaterUseShuffle || tab2 === ETab.Fav && favUsingShuffle || tab2 === ETab.Hot && isHotTabUsingShuffle(popularWeeklyUseShuffle) ? "换一换" : "刷新";
    const [scope, animate] = framerMotion.useAnimate();
    const onClick = useMemoizedFn((e) => {
      animate(scope.current, {
        rotate: [0, 360]
      }, {
        duration: 0.5,
        type: "tween"
      });
      return onRefresh == null ? void 0 : onRefresh();
    });
    return /* @__PURE__ */ jsxs(antd.Button, { disabled: refreshing, className, style, css: _ref$3, ref: btn, onClick, children: [
      /* @__PURE__ */ jsx$1("svg", { ref: scope, style: {
        width: "11px",
        height: "11px",
        marginRight: 5
      }, children: /* @__PURE__ */ jsx$1("use", { href: "#widget-roll" }) }),
      /* @__PURE__ */ jsx$1("span", { children: text })
    ] });
  });
  const headerState = proxy({
    modalFeedVisible: false,
    modalSettingsVisible: false
  });
  function useHeaderState() {
    return useSnapshot(headerState);
  }
  var _ref$2 = {
    name: "q1c343",
    styles: "transform:rotateZ(0deg)"
  };
  var _ref2$2 = {
    name: "1dvos8d",
    styles: "width:13px;height:13px;transform:rotateZ(180deg)"
  };
  const CollapseBtn = React.forwardRef(function CollapseBtn2({
    children,
    initialOpen = false
  }, ref) {
    const [buttonsExpanded, buttonsExpandedActions] = useToggle(initialOpen);
    React.useImperativeHandle(ref, () => buttonsExpandedActions, [buttonsExpandedActions]);
    const btn = /* @__PURE__ */ jsx$1("button", { onClick: buttonsExpandedActions.toggle, className: "primary-btn", css: /* @__PURE__ */ css("padding:0;width:31px;height:31px;border-radius:50%;", appClsDarkSelector, " &{color:#eee!important;border-color:transparent!important;background-color:#333!important;&:hover{background-color:#555!important;}}", ""), children: /* @__PURE__ */ jsx$1("svg", { css: [_ref2$2, buttonsExpanded && _ref$2, "", ""], children: /* @__PURE__ */ jsx$1("use", { href: "#widget-arrow" }) }) });
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      btn,
      buttonsExpanded && children
    ] });
  });
  var _ref5 = {
    name: "1k6795t",
    styles: "width:100vw;height:100vh"
  };
  var _ref6 = {
    name: "m77sh5",
    styles: "width:calc(100vw - 30px);height:calc(100vh - 30px);max-height:unset;padding-right:0"
  };
  var _ref7 = {
    name: "x7zn3p",
    styles: "background-color:rgba(0, 0, 0, 0.9)"
  };
  const S$1 = {
    modalMask: (narrowMode2) => [narrowMode2 && _ref7],
    modal: (narrowMode2, fullScreenMode) => [_ref6, narrowMode2 && /* @__PURE__ */ css("width:", 325 * 2 + 40, "px;height:calc(100vh - 10px);border:none;:global(", appClsDarkSelector, ") &{border:none;}", ""), fullScreenMode && _ref5],
    // 滚动条右移
    modalHeader: {
      name: "kftco8",
      styles: "padding-right:15px"
    },
    modalBody: {
      name: "kftco8",
      styles: "padding-right:15px"
    },
    btnRefresh: /* @__PURE__ */ css(appClsDarkSelector, " &{color:#eee!important;background-color:#333!important;border-color:transparent!important;height:auto;padding:8px 12px;line-height:16px;font-size:13px;}", "")
  };
  var _ref2$1 = {
    name: "za0kxg",
    styles: "display:flex;align-items:center;flex-shrink:0"
  };
  var _ref3$1 = {
    name: "cx5ruc",
    styles: "flex-shrink:1;display:flex;align-items:center;flex-wrap:wrap;row-gap:4px;column-gap:15px"
  };
  var _ref4$1 = {
    name: "15gpyv7",
    styles: "display:flex;align-items:center;justify-content:space-between;column-gap:20px"
  };
  const ModalFeed = React.memo(function ModalFeed2({
    show,
    onHide: onHide2
  }) {
    const scrollerRef = React.useRef(null);
    const recGridRef = React.useRef(null);
    const {
      // 双列模式
      useNarrowMode,
      // 全屏模式
      modalFeedFullScreen
    } = useSettingsSnapshot();
    const useFullScreen = !useNarrowMode && modalFeedFullScreen;
    const modalBorderCss = React.useMemo(() => {
      const borderWidth = useFullScreen ? 5 : 1;
      return /* @__PURE__ */ css("border:", borderWidth, "px solid ", colorPrimaryValue, ";", "");
    }, [useFullScreen]);
    const onRefresh = useMemoizedFn((...args) => {
      var _a2;
      return (_a2 = recGridRef.current) == null ? void 0 : _a2.refresh(...args);
    });
    const [extraInfo, setExtraInfo] = React.useState(null);
    const onScrollToTop = useMemoizedFn(() => {
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = 0;
      }
    });
    const [refreshing, setRefreshing] = React.useState(false);
    return /* @__PURE__ */ jsx$1(BaseModal, { ...{
      show,
      onHide: onHide2
    }, cssModalMask: S$1.modalMask(useNarrowMode), cssModal: [S$1.modal(useNarrowMode, useFullScreen), modalBorderCss], children: /* @__PURE__ */ jsxs(OnRefreshContext.Provider, { value: onRefresh, children: [
      /* @__PURE__ */ jsxs("div", { css: [BaseModalStyle.modalHeader, S$1.modalHeader, _ref4$1, "", ""], children: [
        /* @__PURE__ */ jsxs("div", { className: "left", css: _ref3$1, children: [
          /* @__PURE__ */ jsx$1(VideoSourceTab, { onRefresh }),
          extraInfo
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "right", css: _ref2$1, children: [
          useNarrowMode ? null : useFullScreen ? /* @__PURE__ */ jsx$1(ModalFeedConfigChecks, {}) : /* @__PURE__ */ jsx$1(CollapseBtn, { initialOpen: true, children: /* @__PURE__ */ jsx$1(ModalFeedConfigChecks, {}) }),
          /* @__PURE__ */ jsx$1(RefreshButton, { css: /* @__PURE__ */ css(S$1.btnRefresh, " margin-left:8px;", ""), refreshing, onRefresh, refreshHotkeyEnabled: show }),
          /* @__PURE__ */ jsx$1(ModalClose, { onClick: onHide2 })
        ] })
      ] }),
      /* @__PURE__ */ jsx$1("div", { css: [BaseModalStyle.modalBody, S$1.modalBody, "", ""], ref: scrollerRef, children: /* @__PURE__ */ jsx$1(RecGrid, { ref: recGridRef, shortcutEnabled: show, onScrollToTop, infiniteScrollUseWindow: false, scrollerRef, onUpdateRefreshing: setRefreshing, onUpdateExtraInfo: setExtraInfo }) })
    ] }) });
  });
  var _ref$1 = {
    name: "1qkltea",
    styles: "margin-left:5px"
  };
  function ModalFeedConfigChecks() {
    const inModalFeedStyle = _ref$1;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "showModalFeedOnLoad", label: "自动查看更多", tooltip: "打开首页时默认打开推荐弹窗", css: inModalFeedStyle, extraAction: (val) => {
        if (val) {
          antMessage.success("已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗");
        }
      } }),
      /* @__PURE__ */ jsx$1(CheckboxSettingItem, { configPath: "modalFeedFullScreen", label: "全屏", tooltip: "世界清净了~", css: inModalFeedStyle })
    ] });
  }
  function showModalFeed() {
    renderOnce();
    headerState.modalFeedVisible = true;
  }
  function hideModalFeed() {
    headerState.modalFeedVisible = false;
  }
  if (IN_BILIBILI_HOMEPAGE && settings.showModalFeedOnLoad) {
    setTimeout(showModalFeed);
  }
  function showModalSettings() {
    renderOnce();
    headerState.modalSettingsVisible = true;
  }
  function hideModalSettings() {
    headerState.modalSettingsVisible = false;
  }
  function registerSettingsGmCommand() {
    var _a2;
    (_a2 = GM.registerMenuCommand) == null ? void 0 : _a2.call(GM, "⚙️ 设置", showModalSettings);
  }
  const renderOnce = once(function render4() {
    const container = document.createElement("div");
    container.classList.add("modals-container", APP_CLS_ROOT);
    document.body.appendChild(container);
    const r2 = clientExports.createRoot(container);
    r2.render(/* @__PURE__ */ jsx$1(AntdApp, { children: /* @__PURE__ */ jsx$1(ModalsContainer, {}) }));
  });
  function ModalsContainer() {
    const {
      modalFeedVisible,
      modalSettingsVisible
    } = useHeaderState();
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx$1(ModalFeed, { show: modalFeedVisible, onHide: hideModalFeed }),
      /* @__PURE__ */ jsx$1(ModalSettings, { show: modalSettingsVisible, onHide: hideModalSettings })
    ] });
  }
  const debug$2 = baseDebug.extend("RecHeader");
  const S = {
    leftright: {
      name: "roea7p",
      styles: "height:100%;display:flex;flex-direction:row;align-items:center"
    }
  };
  var _ref = {
    name: "1fkic3w",
    styles: "width:12px;height:12px;margin-left:2px"
  };
  var _ref2 = {
    name: "ozd7xs",
    styles: "flex-shrink:0"
  };
  var _ref3 = {
    name: "q54mpf",
    styles: "flex-shrink:1;flex-wrap:wrap;row-gap:8px;column-gap:15px"
  };
  var _ref4 = {
    name: "ebebjx",
    styles: "position:relative;display:flex;flex-direction:row;justify-content:space-between;align-items:center;margin-bottom:0;height:auto;column-gap:20px;padding-inline:0;padding-block:8px"
  };
  const RecHeader = React.forwardRef(function RecHeader2({
    onRefresh,
    refreshing,
    leftSlot,
    rightSlot
  }, ref) {
    const {
      accessKey,
      pureRecommend,
      showModalFeedEntry,
      style
    } = useSettingsSnapshot();
    const {
      modalFeedVisible,
      modalSettingsVisible
    } = useSnapshot(headerState);
    useKeyPress(["shift.comma"], (e) => {
      if (shouldDisableShortcut()) return;
      headerState.modalSettingsVisible = !headerState.modalSettingsVisible;
    }, {
      exactMatch: true
    });
    const [stickyRef, sticky] = useSticky();
    const scroll = useMemoizedFn(() => {
      var _a2;
      if (!pureRecommend) return;
      const container = (_a2 = stickyRef.current) == null ? void 0 : _a2.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const headerHeight2 = $headerHeight.get();
      if (rect.top < headerHeight2) {
        const yOffset = getElementOffset(container).top;
        debug$2("[refresh:scroll] rect.top = %s, headerHeight = %s", rect.top, headerHeight2);
        document.documentElement.scrollTop = yOffset - headerHeight2 + 2;
      }
    });
    React.useImperativeHandle(ref, () => ({
      scroll
    }));
    const headerHeight = $headerHeight.use();
    const showAccessKeyManage = useShouldShowAccessKeyManage();
    const usingEvolevdHeader = $usingEvolevdHeader.use();
    const dark = useIsDarkMode();
    const boxShadow = (() => {
      if (usingEvolevdHeader) {
        return dark ? "rgba(0, 0, 0, 26%) 0px 2px 10px 1px" : "rgba(0, 0, 0, 13%) 0 1px 10px 1px;";
      } else {
        return `0 2px 4px ${dark ? "rgb(255 255 255 / 5%)" : "rgb(0 0 0 / 8%)"}`;
      }
    })();
    const expandToFullWidthCss = useExpandToFullWidthCss();
    return /* @__PURE__ */ jsx$1(Fragment, { children: /* @__PURE__ */ jsx$1(OnRefreshContext.Provider, { value: onRefresh, children: /* @__PURE__ */ jsx$1("div", { ref: stickyRef, className: clsx("area-header-wrapper", {
      sticky
    }), css: pureRecommend && style.pureRecommend.useStickyTabbar && [/* @__PURE__ */ css("position:sticky;top:", headerHeight - 1, "px;z-index:1000;margin-bottom:10px;transition:background-color 0.3s ease-in-out,box-shadow 0.3s ease-in-out,margin-bottom 0.3s ease-in-out;", ""), sticky && [/* @__PURE__ */ css("border-bottom:1px solid oklch(from ", bgValue, " calc(l + ", dark ? 0.15 : -0.15, ") c h / 50%);background-color:var(--bg1_float);box-shadow:", boxShadow, ";", ""), expandToFullWidthCss]], children: /* @__PURE__ */ jsxs("div", { className: APP_CLS_TAB_BAR, "data-raw-class": "area-header", css: _ref4, children: [
      /* @__PURE__ */ jsxs("div", { "data-class-name": "left", css: [S.leftright, _ref3, "", ""], children: [
        /* @__PURE__ */ jsx$1(VideoSourceTab, { onRefresh }),
        leftSlot
      ] }),
      /* @__PURE__ */ jsx$1("div", { "data-class-name": "right", css: [S.leftright, _ref2, "", ""], children: /* @__PURE__ */ jsxs(antd.Space, { size: "small", children: [
        rightSlot,
        !accessKey && showAccessKeyManage && /* @__PURE__ */ jsx$1(AccessKeyManage, { style: {
          marginLeft: 5
        } }),
        /* @__PURE__ */ jsxs(antd.Button, { onClick: showModalSettings, css: iconOnlyRoundButtonCss, children: [
          /* @__PURE__ */ jsx$1(ModalSettingsHotkey, {}),
          /* @__PURE__ */ jsx$1(IconForConfig, { ...size(14) })
        ] }),
        /* @__PURE__ */ jsx$1(RefreshButton, { refreshing, onRefresh, refreshHotkeyEnabled: !(modalSettingsVisible || modalFeedVisible) }),
        showModalFeedEntry && /* @__PURE__ */ jsxs(antd.Button, { onClick: showModalFeed, className: "gap-0", children: [
          /* @__PURE__ */ jsx$1("span", { children: "查看更多" }),
          /* @__PURE__ */ jsx$1("svg", { css: _ref, children: /* @__PURE__ */ jsx$1("use", { href: "#widget-arrow" }) })
        ] })
      ] }) })
    ] }) }) }) });
  });
  function useExpandToFullWidthCss() {
    const {
      xScrolling,
      bodyWidth
    } = useSizeExpression(document.body, (entry) => {
      const width = entry.contentRect.width;
      const xScrolling2 = !!(width && Math.round(width) > Math.round(window.innerWidth));
      if (!xScrolling2) {
        return {
          xScrolling: xScrolling2
        };
      } else {
        return {
          xScrolling: xScrolling2,
          bodyWidth: width
        };
      }
    }, () => ({
      xScrolling: false
    }));
    return React.useMemo(() => {
      if (!xScrolling) {
        const scrollbarWidth = isMac ? "0px" : "20px";
        return /* @__PURE__ */ css("margin-inline:calc((100% - 100vw + ", scrollbarWidth, ") / 2);padding-inline:calc((100vw - ", scrollbarWidth, " - 100%) / 2);", "");
      } else {
        const w = Math.floor(bodyWidth);
        return /* @__PURE__ */ css("margin-inline:calc((100% - ", w, "px) / 2);padding-inline:calc((", w, "px - 100%) / 2);", "");
      }
    }, [xScrolling, bodyWidth]);
  }
  function useShouldShowAccessKeyManage() {
    const tabKeys = useCurrentDisplayingTabKeys();
    return tabKeys.includes(ETab.AppRecommend);
  }
  const narrowStyle = {
    grid: /* @__PURE__ */ css("width:", 360 * 2 + 20, "px;margin:0 auto;", "")
  };
  function PureRecommend() {
    const {
      useNarrowMode
    } = useSettingsSnapshot();
    const {
      modalFeedVisible,
      modalSettingsVisible
    } = useHeaderState();
    const recHeader = React.useRef(null);
    const recGrid = React.useRef(null);
    const onRefresh = useMemoizedFn((...args) => {
      var _a2;
      return (_a2 = recGrid.current) == null ? void 0 : _a2.refresh(...args);
    });
    const onScrollToTop = useMemoizedFn(() => {
      var _a2;
      return (_a2 = recHeader.current) == null ? void 0 : _a2.scroll();
    });
    const [refreshing, setRefreshing] = React.useState(false);
    const [extraInfo, setExtraInfo] = React.useState(null);
    return /* @__PURE__ */ jsxs("section", { "data-area": "推荐", children: [
      /* @__PURE__ */ jsx$1(RecHeader, { ref: recHeader, refreshing, onRefresh, leftSlot: extraInfo }),
      /* @__PURE__ */ jsx$1(RecGrid, { ref: recGrid, css: [useNarrowMode && narrowStyle.grid, "", ""], shortcutEnabled: !(modalFeedVisible || modalSettingsVisible), infiniteScrollUseWindow: true, onScrollToTop, onUpdateRefreshing: setRefreshing, onUpdateExtraInfo: setExtraInfo })
    ] });
  }
  const debug$1 = baseDebug.extend("components:SectionRecommend");
  function SectionRecommend() {
    const skeletonPlaceholders = React.useMemo(() => new Array(20).fill(0).map(() => crypto.randomUUID()), []);
    const tab2 = React.useDeferredValue(useCurrentUsingTab());
    const servicesRegistry = useRefStateBox(() => ({}));
    const {
      refreshingBox,
      itemsBox,
      refresh,
      error: refreshError,
      showSkeleton
    } = useRefresh({
      tab: tab2,
      debug: debug$1,
      fetcher: refreshForHome,
      servicesRegistry
    });
    const refreshing = refreshingBox.state;
    const items = itemsBox.state;
    const displaySkeleton = !items.length || refreshError || refreshing && showSkeleton;
    const cardBorderCss = useCardBorderCss();
    return /* @__PURE__ */ jsxs("section", { "data-area": "推荐", children: [
      /* @__PURE__ */ jsx$1(RecHeader, { refreshing, onRefresh: refresh }),
      /* @__PURE__ */ jsx$1("div", { className: clsx(videoGrid, limitTwoLines, videoGridBiliFeed4), style: {
        marginBottom: 30
      }, children: displaySkeleton ? skeletonPlaceholders.map((id) => /* @__PURE__ */ jsx$1(VideoCard, { tab: tab2 }, id)) : items.map((item) => {
        return item.api === EApiType.Separator ? null : /* @__PURE__ */ jsx$1(VideoCard, { item, tab: tab2, className: clsx(APP_CLS_CARD), baseCss: cardBorderCss }, item.uniqId);
      }) })
    ] });
  }
  const isHashEntry = (location.hash || "").startsWith(`#/${APP_NAMESPACE}/`);
  const bewlyEnabledSelector = "html.bewly-design:not(:has(#i_cecream))";
  function hasBewlyBewly() {
    return !isHashEntry && !!document.querySelector(bewlyEnabledSelector);
  }
  async function tryDetectBewlyBewly() {
    return tryAction(bewlyEnabledSelector, () => {
      appWarn(`unmount for using bewly-design`);
      root == null ? void 0 : root.unmount();
    }, {
      pollTimeout: 5e3,
      warnOnTimeout: false
    });
  }
  let root;
  async function initHomepage() {
    tryToRemove(".adblock-tips");
    tryAction("html.gray", (el) => el.classList.remove("gray"));
    tryToRemove(".vip-login-tip");
    registerSettingsGmCommand();
    if (hasBewlyBewly()) {
      appWarn(`quit for using bewly-design`);
      return;
    }
    if (settings.pureRecommend) {
      await initHomepagePureRecommend();
    } else {
      await initHomepageSection();
    }
    tryDetectBewlyBewly();
  }
  async function initHomepageSection() {
    const timeout = 10 * 1e3;
    const timeoutAt = Date.now() + timeout;
    let insert;
    while (Date.now() <= timeoutAt) {
      if (document.querySelector(".bili-feed4-layout")) {
        insert = (reactNode) => {
          var _a2;
          return (_a2 = document.querySelector(".bili-feed4-layout")) == null ? void 0 : _a2.insertAdjacentElement("afterbegin", reactNode);
        };
        break;
      }
      await delay(200);
    }
    if (!insert) {
      appWarn(`init fail`);
      return;
    }
    const recommendContainer = document.createElement("section");
    recommendContainer.classList.add(APP_CLS_ROOT);
    insert(recommendContainer);
    root = clientExports.createRoot(recommendContainer);
    root.render(/* @__PURE__ */ jsx$1(AntdApp, { injectGlobalStyle: true, renderAppComponent: true, children: /* @__PURE__ */ jsx$1(SectionRecommend, {}) }));
    tryToRemove(".bili-feed4 .header-channel");
  }
  async function initHomepagePureRecommend() {
    if (isSafari) await delay(500);
    tryToRemove("#i_cecream .bili-feed4-layout");
    tryToRemove(".bili-feed4 .header-channel");
    tryToRemove(".palette-button-wrap");
    const biliLayout = document.createElement("div");
    biliLayout.classList.add("bili-feed4-layout", "pure-recommend");
    const insertFn = (reactContainer2) => document.body.appendChild(reactContainer2);
    insertFn(biliLayout);
    const reactContainer = document.createElement("section");
    reactContainer.classList.add(APP_CLS_ROOT);
    biliLayout.appendChild(reactContainer);
    root = clientExports.createRoot(reactContainer);
    root.render(/* @__PURE__ */ jsxs(AntdApp, { injectGlobalStyle: true, renderAppComponent: true, children: [
      /* @__PURE__ */ jsx$1(PureRecommend, {}),
      /* @__PURE__ */ jsx$1(antd.FloatButton.BackTop, { style: {
        // right
        insetInlineEnd: "var(--back-top-right, 24px)"
      } })
    ] }));
  }
  async function initSpacePage() {
    addDynEntry();
  }
  async function addDynEntry() {
    const mid = parseMid();
    if (!mid) return;
    const oldSelector = ".h-action";
    const oldBtnHtml = `<a
    href="https://www.bilibili.com/?dyn-mid=${mid}"
    target="_blank"
    class="h-f-btn"
    style="width: auto; padding-inline: 15px;">${APP_NAME} 动态</a>`;
    const newBtnClassName = styled.createClass`
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 34px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text_white);
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.14);
    transition: all 0.3s;
    margin-right: 24px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
  `;
    const newSelector = ".upinfo .operations";
    const newBtnHmtl = `<a
    href="https://www.bilibili.com/?dyn-mid=${mid}"
    target="_blank"
    class="${newBtnClassName}">${APP_NAME} 动态</a>`;
    await tryAction([oldSelector, newSelector].join(","), (container) => {
      if (container.matches(oldSelector)) {
        container == null ? void 0 : container.insertAdjacentHTML("afterbegin", oldBtnHtml);
      } else {
        container == null ? void 0 : container.insertAdjacentHTML("afterbegin", newBtnHmtl);
      }
    }, {
      pollTimeout: 1e4,
      pollInterval: 1e3
    });
  }
  function parseMid() {
    const url = new URL(location.href);
    const mid = url.pathname.split("/").map((x) => x.trim()).filter((x) => x)[0];
    if (!mid || !/^\d+$/.test(mid)) return;
    return mid;
  }
  function getBiliPlayer() {
    if (typeof unsafeWindow === "undefined") return;
    return unsafeWindow.player;
  }
  mitt();
  const debug = baseDebug.extend("main:video-play-page");
  async function initVideoPlayPage() {
    if (hasDocumentPictureInPicture) {
      registerOpenInPipCommand();
    }
    await handleFullscreen();
    await handleForceAutoPlay();
  }
  async function handleFullscreen() {
    const targetMode = new URL(location.href).searchParams.get(QueryKey.PlayerScreenMode);
    const next2 = targetMode === PlayerScreenMode.WebFullscreen || targetMode === PlayerScreenMode.Fullscreen;
    if (!next2) return;
    let action2;
    if (targetMode === PlayerScreenMode.WebFullscreen) {
      action2 = () => {
        var _a2;
        return (_a2 = document.querySelector('[role="button"][aria-label="网页全屏"]')) == null ? void 0 : _a2.click();
      };
    }
    if (targetMode === PlayerScreenMode.Fullscreen) {
      action2 = () => {
        var _a2;
        return (_a2 = document.querySelector('[role="button"][aria-label="全屏"]')) == null ? void 0 : _a2.click();
      };
    }
    const getCurrentMode = () => {
      var _a2;
      return ((_a2 = document.querySelector("#bilibili-player .bpx-player-container")) == null ? void 0 : _a2.dataset.screen) || PlayerScreenMode.Normal;
    };
    const timeoutAt = Date.now() + ms("30s");
    while (getCurrentMode() !== targetMode && Date.now() <= timeoutAt) {
      debug("current mode: %s", getCurrentMode());
      action2 == null ? void 0 : action2();
      await delay(100);
    }
    debug("handleFullscreen to %s complete", targetMode);
  }
  async function handleForceAutoPlay() {
    var _a2;
    if (getBiliPlayerConfigAutoPlay()) return;
    const isON = new URL(location.href).searchParams.get(QueryKey.ForceAutoPlay) === ForceAutoPlay.ON;
    if (!isON) return;
    const playing = () => {
      const player = getBiliPlayer();
      return !!player && !player.isPaused();
    };
    const timeoutAt = Date.now() + ms("30s");
    while (Date.now() <= timeoutAt && !playing()) {
      (_a2 = getBiliPlayer()) == null ? void 0 : _a2.play();
      await delay(1e3);
    }
    debug("handleForceAutoPlay complete, playing = %s", playing());
  }
  function pausePlayingVideoAndOpenInPipWindow() {
    const player = getBiliPlayer();
    if (player && !player.isPaused()) {
      player.pause();
    }
    const u = new URL(location.href);
    u.searchParams.set(QueryKey.PlayerScreenMode, PlayerScreenMode.WebFullscreen);
    const newHref = u.href;
    openInPipOrPopup(newHref, "");
  }
  function registerOpenInPipCommand() {
    var _a2;
    (_a2 = GM.registerMenuCommand) == null ? void 0 : _a2.call(GM, "🎦 小窗打开", () => {
      pausePlayingVideoAndOpenInPipWindow();
    });
  }
  dayjs.extend(duration);
  void function main() {
    if (!IN_BILIBILI_HOMEPAGE && !IN_BILIBILI_VIDEO_PLAY_PAGE && !IN_BILIBILI_SPACE_PAGE) {
      return;
    }
    if (IN_BILIBILI_HOMEPAGE) {
      return initHomepage();
    }
    if (IN_BILIBILI_VIDEO_PLAY_PAGE) {
      return initVideoPlayPage();
    }
    if (IN_BILIBILI_SPACE_PAGE) {
      return initSpacePage();
    }
  }();

})(dayjs, dayjs_plugin_duration, React, UAParser, antd, axios, antdCssinjs, antd.locales.zh_CN, ReactDOM, localforage, Motion);