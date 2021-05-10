class Overlay {
  constructor() {
    const doc = window.document;
    this.win = window;
    this.container = doc.createElement("div");
    this.node = doc.createElement("div");
    this.tip = doc.createElement("div");
    this.container.appendChild(this.node);
    this.container.appendChild(this.tip);
    doc.body.appendChild(this.container);
    const style = document.createElement("style");
    if (!navigator || !navigator.userAgent || navigator.userAgent.toLowerCase().indexOf("firefox") < 0) {
      style.appendChild(
        document.createTextNode(`
    @font-face {
      font-family: 'VANDAL__Inconsolata';
      src: url('chrome-extension://${browser.runtime.id}/build/fonts/Inconsolata-Bold.eot?#iefix')
          format('embedded-opentype'),
        url('chrome-extension://${browser.runtime.id}/build/fonts/Inconsolata-Bold.woff')
          format('woff'),
        url('chrome-extension://${browser.runtime.id}/build/fonts/Inconsolata-Bold.ttf')
          format('truetype'),
        url('chrome-extension://${browser.runtime.id}/build/fonts/Inconsolata-Bold.svg#Inconsolata-Bold')
          format('svg');
      font-weight: bold;
      font-style: normal;
    }
    `)
      );
    }
    doc.head.appendChild(style);

    this.container.style.cssText = `
      position: fixed;
      z-index: 10000000;
    `;

    this.node.style.cssText = `
      background: rgba(120, 170, 210, 0.7);
      height: 100%;
      width: 100%;
    `;

    this.tip.style.cssText = `
      background-color: #333740;
      border-radius: 3px;
      color: #fff;
      font-family: VANDAL__Inconsolata, Courier New;
      font-weight: bold;
      font-size: 12px;
      padding: 5px 10px;
      position: fixed;
      z-index: 10000000;
    `;
  }

  highlight(node, ts, scrollOnHighlight) {
    if (scrollOnHighlight) {
      if (node.scrollIntoViewIfNeeded) {
        node.scrollIntoViewIfNeeded();
      } else {
        node.scrollIntoView();
      }
    }
    const box = node.getBoundingClientRect();
    Object.assign(this.container.style, {
      display: "block",
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`
    });
    if (!ts) {
      Object.assign(this.tip.style, {
        display: "none"
      });
    } else {
      Object.assign(this.tip.style, {
        display: "block",
        left: `${box.left}px`,
        top: `${box.top + box.height}px`
      });
      this.tip.innerText = ts;
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = "none";
    }
  }

  remove() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }
}

function findElementsByTagName(currWindow, tag) {
  const els = currWindow.document.getElementsByTagName(tag);
  let elsArray = Array.prototype.slice.call(els);
  for (let i = 0; i < currWindow.frames.length; i++) {
    try {
      const frameElsArray = findElementsByTagName(
        currWindow.frames[i].window,
        tag
      );
      elsArray = elsArray.concat(frameElsArray);
    } catch (err) {
      // pass
    }
  }
  return elsArray;
}

let imageMap = {};

const ARCHIVE_STATIC_PATH = "https://web.archive.org/_static/";
const ARCHIVE_DONATE_PATH = "https://archive.org/includes/donate.php";

// Derived from web.archive.org source
function getSources() {
  imageMap = {};
  // images
  const prefix = `${window.location.origin}/static/`;
  const srcList = [];
  const imgs = findElementsByTagName(window, "img");
  for (let i = 0, len = imgs.length; i < len; i++) {
    // exclude WBM /static/images, leaked images and embedded data URIs
    const isImageInvalid = !imgs[i].src ||
      imgs[i].src.startsWith(prefix) ||
      !imgs[i].src.startsWith(window.location.origin) ||
      imgs[i].src.startsWith("data:") ||
      imgs[i].src.startsWith(ARCHIVE_STATIC_PATH);

    if (!isImageInvalid) {
      if (!imageMap[imgs[i].src]) {
        imageMap[imgs[i].src] = imgs[i];
      }
      srcList.push(imgs[i].src);
    }
  }

  // frames
  const frames = findElementsByTagName(window, "frame");
  for (let i = 0, len = frames.length; i < len; i++) {
    if (frames[i].src) {
      srcList.push(frames[i].src);
    }
  }

  const iframes = findElementsByTagName(window, "iframe");
  for (let i = 0, len = iframes.length; i < len; i++) {
    const isPlayback = (iframes[i].id && iframes[i].id === "playback");
    if (iframes[i].src && !iframes[i].src.startsWith(ARCHIVE_DONATE_PATH) && !isPlayback) {
      srcList.push(iframes[i].src);
    }
  }

  const scripts = findElementsByTagName(window, "script");
  for (let i = 0, len = scripts.length; i < len; i++) {
    const isSrcInvalid = !scripts[i].src ||
    scripts[i].src.startsWith(prefix) ||
    !scripts[i].src.startsWith(window.location.origin) ||
    scripts[i].src.startsWith(ARCHIVE_STATIC_PATH);

    if (!isSrcInvalid) {
      srcList.push(scripts[i].src);
    }
  }

  // link.href (CSS, RSS, etc)
  const links = findElementsByTagName(window, "link");
  for (let i = 0, len = links.length; i < len; i++) {
    const isLinkInvalid = !links[i].href ||
    links[i].href.startsWith(prefix) ||
    !links[i].href.startsWith(window.location.origin) ||
    links[i].href.startsWith(ARCHIVE_STATIC_PATH);

    if (!isLinkInvalid) {
      if (links[i].rel && links[i].rel === "stylesheet") {
        srcList.push(links[i].href);
      }
    }
  }
  // deduplicate
  return srcList.filter((el, i, arr) => arr.indexOf(el) === i);
}

const mousedownHandler = () => {
  browser.runtime.sendMessage({ message: "__VANDAL__FRAME__MOUSEDOWN" });
};

let overlay;
const messageHandler = async (request) => {
  if (!request) return;
  if (request.message === "__VANDAL__CLIENT__FETCH__SOURCES") {
    // reset overlay
    if (overlay) {
      overlay.remove();
      overlay = null;
    }

    browser.runtime.sendMessage({
      message: "__VANDAL__FRAME__SOURCES",
      data: getSources()
    });
  } else if (request.message === "__VANDAL__CLIENT__HIGHLIGHT__NODE") {
    const node = imageMap[request.data.source];
    if (!node) {
      return;
    }
    if (!overlay) {
      overlay = new Overlay();
    }
    overlay.highlight(node, request.data.ts, request.data.scrollOnHighlight);
  } else if (request.message === "__VANDAL__CLIENT__REMOVE__HIGHLIGHT") {
    if (overlay) {
      overlay.hide();
    }
  } else if (request.message === "__VANDAL__CLIENT__TOGGLEDRAWER") {
    overlay.remove();
    overlay = null;
  }
};

function onDomReady(window) {
  window.removeEventListener("mousedown", mousedownHandler);
  window.addEventListener("mousedown", mousedownHandler);
  browser.runtime.onMessage.removeListener(messageHandler);
  browser.runtime.onMessage.addListener(messageHandler);
}

(function invoke(global) {
  onDomReady(global);
}(window));
