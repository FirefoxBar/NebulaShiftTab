<h1 align="center">
Nebula Shift Tab
</h1>

[![Release](https://img.shields.io/github/release/FirefoxBar/NebulaShiftTab.svg?label=Release)](https://github.com/FirefoxBar/NebulaShiftTab/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/ifpdfibcbnbkebbcaenihbfbocncjdhd?label=Chrome)](https://chrome.google.com/webstore/detail/nebula-shift-tab/ifpdfibcbnbkebbcaenihbfbocncjdhd)
[![Edge](https://img.shields.io/badge/dynamic/json?label=Edge&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Floglacfgaifapahekfegphcggaffdohp)](https://microsoftedge.microsoft.com/addons/detail/nebula-shift-tab/loglacfgaifapahekfegphcggaffdohp)
[![Mozilla Add-ons](https://img.shields.io/amo/users/nebula-shift-tab?label=Firefox)](https://addons.mozilla.org/en-US/firefox/addon/nebula-shift-tab/)
[![license](https://img.shields.io/github/license/FirefoxBar/NebulaShiftTab.svg?label=License)](https://github.com/FirefoxBar/NebulaShiftTab/blob/main/LICENSE)
[![Discussions](https://img.shields.io/github/discussions/FirefoxBar/NebulaShiftTab?label=Discussions)](https://github.com/FirefoxBar/NebulaShiftTab/discussions)
[![Build Status](https://github.com/FirefoxBar/NebulaShiftTab/actions/workflows/dev.yml/badge.svg)](https://github.com/FirefoxBar/NebulaShiftTab/actions/workflows/dev.yml)

A flexible, lightweight new tab page, with the following features:
* Smart Search: Supports custom engines with real-time suggestions.
* Dynamic Backgrounds: Compatible with private APIs and scheduled auto-updates.
* Quick Navigation: Includes multiple built-in icon libraries with full customization support.
* Privacy Safe: This extension is open source and free, and does not collect any data.

一款灵活轻量的新标签页，核心特点：
* 智能搜索：支持自定义引擎及实时建议。
* 动态背景：兼容私有 API，支持定时自动更新。
* 快捷导航：内置多套图标库，支持完全自定义。
* 保护隐私：本扩展开源免费，不收集任何数据。

## Get this extension

| Browser | Download |
| --- | --- |
| ![Firefox Logo](https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/firefox/firefox_16x16.png) Firefox | [Official Download](https://github.com/FirefoxBar/NebulaShiftTab/releases) or [Mozilla Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/nebula-shift-tab/) |
| ![Chrome Logo](https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/chrome/chrome_16x16.png) Chrome | [Chrome Web Store](https://chrome.google.com/webstore/detail/nebula-shift-tab/ifpdfibcbnbkebbcaenihbfbocncjdhd) |
| ![Edge Logo](https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/edge/edge_16x16.png) Edge | [Edge Addons](https://microsoftedge.microsoft.com/addons/detail/nebula-shift-tab/loglacfgaifapahekfegphcggaffdohp) |

## Privacy and Permissions

Nebula Shift Tab require those permissions:

* `alarms`: Update background images regularly
* `storage`, `unlimitedStorage`: Storage settings
* `tabs`: Open search results in new tabs
* `contextMenus`: Add search engines to right-click menu

Nebula Shift Tab does not collect any data. But when using third-party services (such as Google Search), these services may obtain your basic information, such as your IP address. These are not essential features of this extension and are not within its control. You can learn about the privacy policies of third-party services on your own, or you can disable the relevant services.

Nebula Shift Tab 自身不收集任何数据。但是，在使用第三方服务（例如 Google 搜索等）时，相应服务可能会获取你的基本信息，如 IP 地址等。它们不是本扩展的必须功能，也不在本扩展的控制范围内。您可以自行了解并第三方服务的隐私政策，或关闭相关服务。

## How to build

* Install Node.js 20.x and pnpm 10.x.
* Clone this project, or download the source code and extract it.
* Run `pnpm i --frozen-lockfile`.
* Run build command
  * For chrome version, run `npm run build:chrome`
  * For firefox version, run `npm run build:firefox`
* Find build result at `/dist_*`

## 图标包 Icon pack

图标包均来源于第三方，其中：

* default: 从 App Store 获取各应用的原始图标，然后使用 cwebp 转换
* mbe-style: 来源于[meolunr/MBEStyle](https://github.com/meolunr/MBEStyle)，原始协议为 [GPL-3.0](https://github.com/meolunr/MBEStyle/blob/master/LICENSE)
* delta-icons: 来源于[Delta-Icons/android](https://github.com/Delta-Icons/android)，原始协议为 [CC BY-NC-ND License 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
* liquid-glass: 来源于网络收集

上述图标作者未参与本项目开发，不以任何形式为本项目背书。本项目亦无权转授权。如您认为项目所使用的图标侵犯了您的权利，请提交 issue，我们将从项目中移除相关图标。

All icon packs are sourced from third parties, including:

* default: get the original icons of each app from the App Store, then convert them using cwebp
* mbe-style: from [meolunr/MBEStyle](https://github.com/meolunr/MBEStyle), originally licensed under [GPL-3.0](https://github.com/meolunr/MBEStyle/blob/master/LICENSE)
* delta-icons: from [Delta-Icons/android](https://github.com/Delta-Icons/android), originally licensed under [CC BY-NC-ND License 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
* liquid-glass: collected from the internet

The authors of the above icons were not involved in the development of this project and do not endorse it in any way. This project is not authorized for sublicensing. If you believe that the icons used in this project infringe upon your rights, please submit an issue, and we will remove the relevant icons from the project.

> cwebp options: -resize 256 0 -m 6 -q 90 -mt

## Licenses

Copyright © 2026 [FirefoxBar Team](https://team.firefoxcn.net)

This project is licensed under the ​**GNU GPL v2.0 or later** (Except for icons).
