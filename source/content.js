import ReactDOM from "react-dom";
import React from "react";

import { safeElementReady } from "./libs/utils";
import App from "./libs/components/app";
import Drawer from "./libs/components/drawer";

const archiveRegExp = /\/web\/\d+(?:im_)?\/(.*)/;

async function onDomReady() {
  document.body.innerHTML = "";
  document.body.style.marginLeft = 0;
  document.body.style.paddingLeft = 0;

  const box = document.createElement("div");
  box.className = "vandal_box";
  box.id = "vandal-box";
  const drawer = document.createElement("div");
  drawer.className = "vandal_drawer";
  drawer.id = "vandal-drawer";

  // use iframe.html as it's a web accessible resource
  // / to avoid blocked by client errors
  const baseURL = chrome.runtime.getURL("build/iframe.html");
  const frame = document.createElement("iframe");

  let url = new URL(window.location.href);
  if (url.host === "web.archive.org" && archiveRegExp.test(url.pathname)) {
    const match = url.pathname.match(archiveRegExp)[1];
    try {
      url = new URL(match);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Failed to parse url");
    }
  }

  frame.id = "vandal-iframe";
  frame.className = "vandal_iframe";
  frame.setAttribute("frameborder", "0");

  const container = document.createElement("div");
  container.className = "vandal";
  document.body.appendChild(container);
  container.appendChild(box);
  container.appendChild(frame);
  container.appendChild(drawer);

  ReactDOM.render(
    <App baseURL={baseURL} url={url.href} root={container} browser={frame} />,
    box
  );
  ReactDOM.render(<Drawer frame={frame} />, drawer);
}

async function init() {
  await safeElementReady("body");
  onDomReady();
}

init();
