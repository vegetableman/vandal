class Overlay {
  constructor() {
    const doc = window.document;
    this.win = window;
    this.container = doc.createElement('div');
    this.node = doc.createElement('div');
    this.tip = doc.createElement('div');
    this.container.appendChild(this.node);
    this.container.appendChild(this.tip);
    doc.body.appendChild(this.container);
    const style = document.createElement('style');
    style.appendChild(
      document.createTextNode(`
    @font-face {
      font-family: 'VANDAL__Inconsolata';
      src: url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Bold.eot?#iefix')
          format('embedded-opentype'),
        url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Bold.woff')
          format('woff'),
        url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Bold.ttf')
          format('truetype'),
        url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Bold.svg#Inconsolata-Bold')
          format('svg');
      font-weight: bold;
      font-style: normal;
    }
    `)
    );
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
      font-family: VANDAL__Inconsolata;
      font-size: 12px;
      padding: 5px 10px;
      position: fixed;
      z-index: 10000000;
    `;
  }

  highlight(node, ts, scrollOnHighlight) {
    if (scrollOnHighlight) {
      node.scrollIntoViewIfNeeded();
    }
    const box = node.getBoundingClientRect();
    Object.assign(this.container.style, {
      left: box.left + 'px',
      top: box.top + 'px',
      width: box.width + 'px',
      height: box.height + 'px'
    });
    if (!ts) {
      Object.assign(this.tip.style, {
        display: 'none'
      });
    } else {
      Object.assign(this.tip.style, {
        left: box.left + 'px',
        top: box.top + box.height + 'px'
      });
      this.tip.innerText = ts;
    }
  }

  remove() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

function findElementsByTagName(currWindow, tag) {
  let els = currWindow.document.getElementsByTagName(tag);
  let elsArray = Array.prototype.slice.call(els);
  for (let i = 0; i < currWindow.frames.length; i++) {
    try {
      let frameElsArray = findElementsByTagName(
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

let imageMap = {},
  overlay;

let ARCHIVE_STATIC_PATH = 'https://web.archive.org/_static/';
let ARCHIVE_DONATE_PATH = 'https://archive.org/includes/donate.php';

function getSources() {
  imageMap = {};
  overlay = null;
  // images
  let prefix = window.location.origin + '/static/';
  let srcList = [];
  let imgs = findElementsByTagName(window, 'img');
  for (let i = 0, len = imgs.length; i < len; i++) {
    // exclude WBM /static/images, leaked images and embedded data URIs
    if (
      !imgs[i].src ||
      imgs[i].src.startsWith(prefix) ||
      !imgs[i].src.startsWith(window.location.origin) ||
      imgs[i].src.startsWith('data:') ||
      imgs[i].src.startsWith(ARCHIVE_STATIC_PATH)
    ) {
      continue;
    }
    if (!imageMap[imgs[i].src]) {
      imageMap[imgs[i].src] = imgs[i];
    }
    srcList.push(imgs[i].src);
  }

  // frames
  let frames = findElementsByTagName(window, 'frame');
  for (let i = 0, len = frames.length; i < len; i++) {
    if (!frames[i].src) {
      continue;
    }
    srcList.push(frames[i].src);
  }

  let iframes = findElementsByTagName(window, 'iframe');
  for (let i = 0, len = iframes.length; i < len; i++) {
    if (
      !iframes[i].src ||
      (iframes[i].id && iframes[i].id === 'playback') ||
      iframes[i].src.startsWith(ARCHIVE_DONATE_PATH)
    ) {
      continue;
    }
    srcList.push(iframes[i].src);
  }

  let scripts = findElementsByTagName(window, 'script');
  for (let i = 0, len = scripts.length; i < len; i++) {
    if (
      !scripts[i].src ||
      scripts[i].src.startsWith(prefix) ||
      !scripts[i].src.startsWith(window.location.origin) ||
      scripts[i].src.startsWith(ARCHIVE_STATIC_PATH)
    ) {
      continue;
    }
    srcList.push(scripts[i].src);
  }

  // link.href (CSS, RSS, etc)
  let links = findElementsByTagName(window, 'link');
  for (let i = 0, len = links.length; i < len; i++) {
    if (
      !links[i].href ||
      links[i].href.startsWith(prefix) ||
      !links[i].href.startsWith(window.location.origin) ||
      links[i].href.startsWith(ARCHIVE_STATIC_PATH)
    ) {
      continue;
    }
    if (links[i].rel && links[i].rel == 'stylesheet') {
      srcList.push(links[i].href);
    }
  }
  // deduplicate
  return srcList.filter(function (el, i, arr) {
    return arr.indexOf(el) === i;
  });
}

const mousedownHandler = () => {
  chrome.runtime.sendMessage({ message: '__VANDAL__FRAME__MOUSEDOWN' });
};

const messageHandler = async function (request, _, sendResponse) {
  console.log(request);
  if (!request) return;
  if (request.message === '__VANDAL__CLIENT__FETCH__SOURCES') {
    chrome.runtime.sendMessage({
      message: '__VANDAL__FRAME__SOURCES',
      data: getSources()
    });
  } else if (request.message === '__VANDAL__CLIENT__HIGHLIGHT__NODE') {
    console.log(request.data.source);
    const node = imageMap[request.data.source];
    if (!node) {
      return;
    }
    if (!overlay) {
      overlay = new Overlay();
    }
    overlay.highlight(node, request.data.ts, request.data.scrollOnHighlight);
  } else if (request.message === '__VANDAL__CLIENT__REMOVE__HIGHLIGHT') {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }
};

function onDomReady() {
  window.removeEventListener('mousedown', mousedownHandler);
  window.addEventListener('mousedown', mousedownHandler);
  chrome.runtime.onMessage.removeListener(messageHandler);
  chrome.runtime.onMessage.addListener(messageHandler);

  // window.onpopstate = function (event) {
  //   var r = confirm("You pressed a Back button! Are you sure?!");
  // }
}

const link = document.createElement('meta');
link.setAttribute('charset', 'utf-8');
document.head.appendChild(link);

onDomReady();
