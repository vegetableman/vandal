<p align="center">
  <img src="docs/logo-full.svg" width="250">
  <div align="center"><i>Navigator for Web Archive</i></div>
</p>

![example workflow](https://github.com/vegetableman/vandal/actions/workflows/test.yml/badge.svg)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)
___

> Vandal is a browser extension that helps you quickly navigate the web archive and travel back in time without leaving the current tab.

<p align="center">
  <img src="https://github.com/vegetableman/vandal/raw/master/docs/sample.gif">
</p>

## Install
[link-chrome]: https://chrome.google.com/webstore/detail/vandal/knoccgahmcfhngbjhdbcodajdioedgdo 'Version published on Chrome Web Store' 

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/chrome/chrome.svg" width="48" alt="Chrome" valign="middle">][link-chrome] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/knoccgahmcfhngbjhdbcodajdioedgdo.svg?label=%20">][link-chrome]

---

- [Why?](#why)
- [Features](#features)
- [Limitations](#limitations)
- [Comparison to Wayback Machine](#comparison-to-wayback-machine)
- [API and Tools Used](#api-and-tools-used)

## Why?
The goal of this project is to present an alternate navigation interface to [Wayback Machine](https://web.archive.org/) focused on ease-of-use. At the same time, it tries to capture the essence of ⌛ time-travel in it's own whimsical way. 

## Features
Vandal supports the following features for navigation and inspection:
- 📅  Calendar View: The default navigation mode which uses the least amount of surface area with a mini calendar view. Supports a calendar input that shows archival stats and allows selection of month across the years.
- 📊  Graph View: Navigation mode based on graphs of year and month.
- 🧭 Navigator: Built-in browser with ◀️ ▶️ 🔄 actions.
- 🎮  Navigation Panel: A bottom panel with navigation buttons to zip through archived snapshots for a date or across the month.
- 🕛 History Panel: Access your navigation history for a website.
- 💡 Info Panel: Access your current navigation URL and redirection info.
- 🔩 Resource Drawer: A drawer that you can toggle to view timestamp differences of resources such as images, scripts, etc. relative to the page. This drawer updates automatically based on URL.
- ⌛ Historical View: Displays the snapshot of a website throughout the years. This feature is [experimental](https://github.com/vegetableman/vandal/issues/1) ⚠️.

## Limitations
- It uses Iframe to load a webpage which has inherent limitations, although Vandal does replicate the behaviour of a browser to some degree, for instance, navigation history, reload, etc. It does not work in cases where pages are using frame busters and when the document matching the URL itself is cached using service workers causing the webRequest API to fail. It does notify with an error message for such cases.
- It does not support saving page to Archive. Although, It does notify you to do so on an unarchived page.
- It's only available in Chrome for now. Firefox support is being delayed to avoid procrastination on my part.

## Comparison to Wayback Machine
Vandal is not affliated to Internet Archive. As for features, it's more of a subset to the mighty Wayback Machine.

## API and Tools Used
Vandal uses the [Wayback Machine API](https://archive.org/help/wayback_api.php).

It is primarily built on frameworks - [XState](https://github.com/davidkpiano/xstate) and [React](https://github.com/facebook/react). Illustrations and logo was created on [Figma](https://figma.com/), video edited on [Kapwing](https://kapwing.com/) and icons have been plucked from the [Icon Project](https://thenounproject.com/).

Icons designed by:
[Christian Antonius](https://thenounproject.com/christian_antonius/), [Ralf Schmitzer](https://thenounproject.com/ralfschmitzer/), [Park Sung Hyo](https://thenounproject.com/parksunghyo126/), [Bhuvan](https://thenounproject.com/bhuvan.mahes/), [Sewon Park](https://thenounproject.com/cosmac/), [Alfa Design](https://thenounproject.com/alfadesign/), [Emmanuel Roy](https://thenounproject.com/emmanuelroy/), [unlimicon](https://thenounproject.com/unlimicon/), [Hui Qin Ng](https://thenounproject.com/hui_qin/), [Bluetip Design](https://thenounproject.com/bluetip/), [iconsmind.com](https://thenounproject.com/imicons/), [mikicon](https://thenounproject.com/mikicon/), [Bharat](https://thenounproject.com/bharatkumara321), [Aaron K. Kim](https://thenounproject.com/inspign/), [i cons](https://thenounproject.com/iconsguru/)

