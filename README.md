<h1 align="center">
Nebula Shift Tab
</h1>

[![Release](https://img.shields.io/github/release/FirefoxBar/NebulaShiftTab.svg?label=Release)](https://github.com/FirefoxBar/NebulaShiftTab/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/eningockdidmgiojffjmkdblpjocbhgh?label=Chrome)](https://chrome.google.com/webstore/detail/header-editor/eningockdidmgiojffjmkdblpjocbhgh)
[![Edge](https://img.shields.io/badge/dynamic/json?label=Edge&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fafopnekiinpekooejpchnkgfffaeceko)](https://microsoftedge.microsoft.com/addons/detail/header-editor/afopnekiinpekooejpchnkgfffaeceko)
[![Mozilla Add-ons](https://img.shields.io/amo/users/header-editor?label=Firefox)](https://addons.mozilla.org/en-US/firefox/addon/header-editor/)
[![license](https://img.shields.io/github/license/FirefoxBar/NebulaShiftTab.svg?label=License)](https://github.com/FirefoxBar/NebulaShiftTab/blob/master/LICENSE)
[![Discussions](https://img.shields.io/github/discussions/FirefoxBar/NebulaShiftTab?label=Discussions)](https://github.com/FirefoxBar/NebulaShiftTab/discussions)
[![Build Status](https://github.com/FirefoxBar/NebulaShiftTab/actions/workflows/dev.yml/badge.svg)](https://github.com/FirefoxBar/NebulaShiftTab/actions/workflows/dev.yml)

A lightweight new tab plugin

## Get this extension

| Browser | Download |
| --- | --- |
| ![Firefox Logo](https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/firefox/firefox_16x16.png) Firefox | [Official Download](https://github.com/FirefoxBar/NebulaShiftTab/releases) or [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/header-editor-lite/) |
| ![Chrome Logo](https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/chrome/chrome_16x16.png) Chrome | [Chrome Web Store](https://chrome.google.com/webstore/detail/header-editor/eningockdidmgiojffjmkdblpjocbhgh) |
| ![Edge Logo](https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/edge/edge_16x16.png) Edge | [Edge Addons](https://microsoftedge.microsoft.com/addons/detail/header-editor/afopnekiinpekooejpchnkgfffaeceko) |

## Permissions

Nebula Shift Tab require those permissions:

* `alarms`: Update background images regularly

* `storage`, `unlimitedStorage`: Storage settings

## How to build

### Build

* Install Node.js 20.x and pnpm 10.x.
* Clone this project, or download the source code and extract it.
* Run `pnpm i --frozen-lockfile`.
* Run build command
  * For chrome version, run `npm run build:chrome`
  * For firefox version, run `npm run build:firefox`
* Find build result at `/dist_*`

#### 图标包 Icon pack

图标包均来源于第三方，其中：

* mbe-style: 来源于[meolunr/MBEStyle](https://github.com/meolunr/MBEStyle)，原始协议为 [GPL-3.0](https://github.com/meolunr/MBEStyle/blob/master/LICENSE)
* delta-icons: 来源于[Delta-Icons/android](https://github.com/Delta-Icons/android)，原始协议为 [CC BY-NC-ND License 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
* liquid-glass: 来源于网络收集

上述图标作者未参与本项目开发，不以任何形式为本项目背书。如您认为项目所使用的图标侵犯了您的权利，请提交 issue，我们将从项目中移除相关图标。

All icon packs are sourced from third parties, including:

* mbe-style: from [meolunr/MBEStyle](https://github.com/meolunr/MBEStyle), originally licensed under [GPL-3.0](https://github.com/meolunr/MBEStyle/blob/master/LICENSE)
* delta-icons: from [Delta-Icons/android](https://github.com/Delta-Icons/android), originally licensed under [CC BY-NC-ND License 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
* liquid-glass: Collected from the internet

The authors of the above icons were not involved in the development of this project and do not endorse it in any way. If you believe that the icons used in this project infringe upon your rights, please submit an issue, and we will remove the relevant icons from the project.

## Licenses

Copyright © 2026 [FirefoxBar Team](https://team.firefoxcn.net)

This project is licensed under the ​**GNU GPL v2.0 or later** (Except for icons).
