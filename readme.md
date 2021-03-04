<p align="center">
  <img src="docs/logo-full.svg" width="250">
  <div align="center">Navigator for Web Archive</div>
  <br/>
  <img src="source/libs/assets/images/cover-art.png"/>
</p>

___

> Vandal is a browser extension that helps you quickly navigate the web archive without leaving the current tab.

<p align="center">
  <img src="https://github.com/vegetableman/vandal/raw/master/docs/sample.gif">
</p>

- [Why?](#why)
- [Features](#features)
- [Limitations](#limitations)
- [Security risks](#security-risks)
- [Comparison to Wayback Machine](#comparison-to-wayback-machine)
- [API and Tools Used](#api-and-tools-used)

## Why?
The goal of this project is to present an alternate navigation interface focused on ease-of-use. At the same time, it tries to capture the essence of ⌛ time-travel in it's own whimsical way. 

## Features
Vandal supports the following features:
- 📅  Calendar View: The default navigation mode which uses the least amount of surface area with a mini calendar view. Supports a custom calendar input that shows archival stats across the calendar.
- 📊  Graph View: Navigation mode based on graphs.
- 🎮  Navigation Panel: A bottom panel with navigation buttons to zip through archived snapshots for a date or across the month.
- 🕛 History Panel: Access your navigation history for a website.
- 💡 Info Panel: Access your current navigation URL and redirection info.
- 🔩 Resource Drawer: A drawer that you can toggle to view timestamp differences of resources such as images, scripts, etc. relative to the page. This drawer updates automaticaly based on URL.
- ⌛ Historical View: Displays the snapshots of a website throughout the years. This feature is experimental ⚠️ though.

## Limitations

- It uses Iframe to load a webpage which has inherent limitations, although Vandal does replicate the behaviour of a browser to some degree, for instance, navigation history, reload, etc. It does not work in cases where pages are using frame busters and when the document matching the URL itself is cached using service workers. It shows an error message instead.
- It does not support (and likely won't) saving a page to Archive. Although, It does notify you to do so on an unarchived page. Additionaly, save api requires login and has a complicated post api.
- It's only available in Chrome for now. Firefox support is being delayed to avoid procrastination on my part.

## Security risks

Write more...

## Comparison to Wayback Machine
Vandal is not affliated to Internet Archive. As for features, it's more of a subset to the mighty [Wayback Machine](https://web.archive.org/), a web archive service provided by them.

## API and Tools Used
Vandal uses the [Wayback Machine API](https://archive.org/help/wayback_api.php).

It is primarily built on frameworks - [XState](https://github.com/davidkpiano/xstate) and [React](https://github.com/facebook/react). Illustrations and logo design created on [Figma](https://figma.com/) and icons have been plucked from the [Icon Project](https://thenounproject.com/).

Icons designed by:
[Christian Antonius](https://thenounproject.com/christian_antonius/), [Ralf Schmitzer](https://thenounproject.com/ralfschmitzer/), [Park Sung Hyo](https://thenounproject.com/parksunghyo126/), [Bhuvan](https://thenounproject.com/bhuvan.mahes/), [Sewon Park](https://thenounproject.com/cosmac/), [Alfa Design](https://thenounproject.com/alfadesign/), [Emmanuel Roy](https://thenounproject.com/emmanuelroy/), [unlimicon](https://thenounproject.com/unlimicon/), [Hui Qin Ng](https://thenounproject.com/hui_qin/), [Bluetip Design](https://thenounproject.com/bluetip/), [iconsmind.com](https://thenounproject.com/imicons/), [mikicon](https://thenounproject.com/mikicon/), [Bharat](https://thenounproject.com/bharatkumara321), [Aaron K. Kim](https://thenounproject.com/inspign/), [i cons](https://thenounproject.com/iconsguru/)

