# Bilibili-Gate

> Bilibili 自定义首页

[![Greasy Fork Version](https://img.shields.io/greasyfork/v/443530?style=flat-square)][gfurl]
[![Greasy Fork Downloads](https://img.shields.io/greasyfork/dt/443530?style=flat-square)][gfurl]
[![Greasy Fork Downloads](https://img.shields.io/greasyfork/dd/443530?style=flat-square)][gfurl]
[![Greasy Fork Rating](https://img.shields.io/greasyfork/rating-count/443530?style=flat-square)][gfurl]
[![Build Status](https://img.shields.io/github/actions/workflow/status/magicdawn/bilibili-gate/ci.yml?branch=main&style=flat-square&label=CI%20Build)](https://github.com/magicdawn/bilibili-gate/actions/workflows/ci.yml)

[gfurl]: https://greasyfork.org/zh-CN/scripts/443530

## 安装

👉 [GreasyFork][gfurl]
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
👉 [开发版: 包含未发布的更改](https://github.com/magicdawn/bilibili-gate/raw/release-nightly/bilibili-gate.mini.user.js)

## 功能

- [x] App 推荐: 将手机 App 推荐内容搬到桌面
- [x] App 推荐: 我不想看, 用于推荐系统反馈
- [x] 推荐视频过滤: 支持按视频属性(播放量 / 时长 / 标题) / 按 UP 过滤推荐视频
- [x] 动态: 支持分组查看动态, 支持搜索过滤动态, 支持过滤「全部」动态, 支持缓存全部动态本地快速搜索
- [x] 一站式体验, 方便快捷的访问: 动态 / 稍后再看 / 收藏 / 热门等内容
- [x] 随机的乐趣: 稍后再看, 收藏, 每周必看等支持随机顺序
- [x] 主题设置: 预设主题 + color-picker 自定义
- [x] Bilibili-Evolved 适配: 夜间模式 / 自定义顶栏 / 主题色
- [x] 完善的键盘支持
- [x] IINA

## 链接

- 源代码 https://github.com/magicdawn/bilibili-gate 如果对你有用,请来个 Star :)
- 从 GitHub 安装
  - [Release](https://github.com/magicdawn/bilibili-gate/raw/release/bilibili-gate.user.js) (GreasyFork 版本自动同步源)
  - [Release 最小化版本](https://github.com/magicdawn/bilibili-gate/raw/release/bilibili-gate.mini.user.js)
  - [CI build](https://github.com/magicdawn/bilibili-gate/raw/release-nightly/bilibili-gate.mini.user.js)

## 声明

代码 fork 自 [indefined/UserScripts](https://github.com/indefined/UserScripts/tree/master/bilibiliHome)

- https://github.com/indefined/UserScripts/tree/master/bilibiliHome
- https://github.com/indefined/UserScripts/issues/76

## 杂

### 关于名称 Bilibili-Gate / bilibili-app-recommend

起源于 [Bilibili Home](https://github.com/indefined/UserScripts/issues/76) 的一个 fork, 之前叫 bilibili-app-recommend <br />
后添加了不少不是推荐相关的功能, 遂更名. <br />
bilibili-app-recommend 用户可以通过文件导出全部设置迁移到 Bilibili-Gate 中.

### B 站首页版本

支持当前最新首页(bili-feed4). 旧版首页请看这里 https://github.com/indefined/UserScripts/tree/master/bilibiliHome

### 支持的 浏览器 & 脚本管理器 环境

- ✅ Chrome/Edge/Firefox: 支持 ViolentMonkey(我使用的) 和 TamperMonkey.
- ✅ macOS Safari: [Userscripts](https://itunes.apple.com/us/app/userscripts/id1463298887), iPad Safari 上也可以使用
- ❌ _**不支持**_ macOS Safari + TamperMonkey. (收费 Safari 插件, 已知不兼容, 请使用上述开源免费的 Userscripts)

### 与 [Bilibili-Evolved](https://github.com/the1812/Bilibili-Evolved) 的兼容性

- ❌ 首页相关 (如清爽首页 / 极简首页)
- ✅ 夜间模式
- ✅ 自定义顶栏
- ✅ [自定义字体](https://github.com/the1812/Bilibili-Evolved/discussions/4846)

### 与 [BewlyBewly](https://github.com/hakadao/BewlyBewly) 的兼容性

- ❌ 不兼容, 检测到 BewlyBewly 后, 本脚本会自动退出.
- 使用特殊的地址强制启用本脚本 https://www.bilibili.com/#/bilibili-gate/

### 你可能不需要这个脚本 :)

- B 站桌面端已上线, 支持 macOS / Windows, 首页推荐流
- B 站内测首页也是推荐流

## 介绍

_\* 截图均为不带 access_key 匿名获取, 不代表作者喜好_

### 一站式体验

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/cde676d8-b794-4a6a-a6b9-a813fd97b427)

#### APP 推荐, 默认

- 需要获取 access_key
- 可以使用标记不喜欢功能
- 没有视频发布日期
- 感谢 @Myitian 提供的 v2 API 示例 https://github.com/magicdawn/bilibili-gate/issues/18

#### PC 桌面端推荐

- 不需要 access_key 了
- 标记不喜欢功能没了
- 和首页自带推荐不一样, 自带推荐有视频预览 / 弹幕预览, 本项目还是鼠标滑动查看快照图片.
- 首页自带推荐的 API, 貌似不会给你推荐番剧 (没有看见数据, 所以没有兼容)
- 推荐结果貌似更理想
- 更快!

#### 已关注

> 基于 PC 桌面端推荐, 筛选出「已关注」，可能会比较慢

#### 动态

> 动态页的解析

#### 稍后再看

> 你添加的稍后再看

#### 收藏

> 收藏夹内容的抓取

#### 综合热门

> 数据来源 https://www.bilibili.com/v/popular/all/

#### 每周必看

> 数据来源 https://www.bilibili.com/v/popular/weekly

#### 自定义

可在 设置-高级设置 隐藏不想使用的 Tab

### 模式

可以基于个人喜好定制

#### 主页推荐块 + 查看更多弹窗 (默认模式)

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/a3c303c2-bff4-459b-9bd6-5527ef468386)

- 推荐块作为一个「分区」存在，不影响首页其他地方
  - 新版首页: 推荐下边, 作为第一个「分区」
  - 内测首页: 在最顶部

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/85b06340-257f-4811-b81d-ee3c2b9aa98f)

- [x] 支持无限滚动, 加载更多
- [x] 支持自动查看更多, 即打开 B 站首页自动弹出全屏弹窗.
- [x] 支持快捷键

#### 纯推荐模式

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/4fd66d66-4839-4403-a9e6-6cdd55f0b4a2)

_\* 截图均为不带 access_key 匿名获取, 不代表作者喜好_

- 该模式会去除首页其他所有内容, 仅保留推荐块,
- 在设置中开启

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/e6191158-2b43-42bf-9f12-f271206d9734)
_\* 开关-第一项_

推荐操作栏有吸顶效果, 目前

- 与 B 站首页自带顶栏兼容
- 与 Bilibili-Evolved 的自定义顶栏兼容. (自定义顶栏: 全局固定 / 高度 可自由设置)

### 功能

#### 居中模式

![image](https://user-images.githubusercontent.com/4067115/182653003-e48befbe-c69a-4ccc-9bee-b4fe97149052.png)

- 像手机一样的居中双列
- 「查看更多」弹窗 & 纯推荐模式可用

#### 稍候再看

- 视频卡片右上角
- 快捷键支持

#### 我不想看

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/75516f49-43e0-4827-aa4c-3216b7f51374)
![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/f113f8bd-56bb-4482-a54d-2dbcd3e429c1)

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/9674e212-9ff9-4d97-a2fd-46561d762b65)

- 仅 APP 推荐 Tab, 获取 access_key 后可用

#### 深色模式兼容

- 方案1: 使用 [Bilibili-Evolved](https://github.com/the1812/Bilibili-Evolved) 提供的深色模式切换, 这个脚本适配了 Evolved 的夜间模式.
- 方案2: 使用 [Dark Reader](https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh) 扩展: 无适配, 但基本可用.

#### 视频过滤

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/69dc596a-b504-47e1-bd3c-809cba99a708)

#### 主题选择

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/3ce3c3f3-3d39-4147-8393-b1b9c0baddde)

### 视频卡片

- [x] 支持鼠标滑动快速预览.
- [x] 支持右键菜单
- [ ] 弹幕预览, 个人需求不是很大. (原版有该功能, 可以试试旧版首页)

### 视频卡片右键菜单

因 Tab 功能不同有差异

![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/b7cbe6de-dc4c-4c45-909a-0392aaa66add)
![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/26053d9c-2543-4ffb-ac20-9b052a6807c2)
![image](https://github.com/magicdawn/bilibili-gate/assets/4067115/451e3705-99a0-422e-8d33-e893bc09be71)

#### 黑名单

推荐类 Tab, 快速拉黑

#### 取消关注

已关注 or 动态 Tab 中会有

#### 动态 Tab

- 快速筛选 UP 的动态

#### 稍后再看 Tab

- 快速收藏
- 移除稍后再看
- 重新添加(aka 移到最前)

#### 收藏 Tab

- 浏览收藏夹
- 移除收藏

### 快捷键说明

#### 「查看更多」弹窗 & 纯推荐模式

- [x] 方向键, 选择视频
- [x] `Tab` / `Shift + Tab`, 选择视频
- [x] `Esc`: 清除选中状态
- [x] 没有选中时, 按方向键, 会选中顶部第一个可见视频
- [x] `Enter`: 打开选中的视频
- [x] `Backspace`: 即删除键, 打开标记不喜欢弹窗
- [x] `r`: 刷新, 效果同顶部 "换一换" 按钮, 取自 `refresh`
- [x] `s` / `w`: 添加/移除 稍候再看, 取自 `save` / `watch`. `s` 与 Bilibili-Evolved 快捷键冲突, 你可以使用 `w`

#### 各种其他弹窗

- 设置弹窗 / 标记为不喜欢弹窗: 可以通过点击透明区域 or `Esc` 键关闭
- `shift+,` 打开/关闭设置弹窗.

#### 标记为不喜欢弹窗

- 数字键(1 到 6)直接提交不喜欢理由
- 也可以方向键选择理由, 回车提交
- 默认选中最后一个理由, 通常是「不感兴趣」

## 开发 or 使用源代码构建最新版本

- git clone this repo
- pnpm install
- pnpm build, build 完会自动使用 Chrome 打开安装地址

### CI build

- 会使用 main 分支代码自动构建
- 构建结果: 即上面提到的 [开发版](https://github.com/magicdawn/bilibili-gate/raw/release-nightly/bilibili-gate.mini.user.js)

## 支持

- 如果对你有用,请来个 Star :)
- 如果你喜欢这个项目, 可以 「[爱发电](https://afdian.com/a/magicdawn)」 支持一下

![afdian-magicdawn_w375](https://ghp.ci/https://raw.githubusercontent.com/magicdawn/magicdawn/master/images/afdian-magicdawn_w375_v2.jpg)

## 更新日志

[GitHub Release](https://github.com/magicdawn/bilibili-gate/releases)

## ❤️ 参考的项目

代码 / 样式 / 文档

- https://github.com/indefined/UserScripts/tree/master/bilibiliHome
- https://socialsisteryi.github.io/bilibili-API-collect/
- https://github.com/hakadao/BewlyBewly/issues/101#issuecomment-1874308120
- https://greasyfork.org/zh-CN/scripts/415804-%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9-bilibili-com-%E6%92%AD%E6%94%BE%E9%A1%B5%E8%B0%83%E6%95%B4
- https://github.com/imsyy/SPlayer
- ...more

## License

the MIT License http://magicdawn.mit-license.org
