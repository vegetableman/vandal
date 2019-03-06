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
      imgs[i].src.startsWith('data:')
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
    if (!iframes[i].src || (iframes[i].id && iframes[i].id === 'playback')) {
      continue;
    }
    srcList.push(iframes[i].src);
  }

  let scripts = findElementsByTagName(window, 'script');
  for (let i = 0, len = scripts.length; i < len; i++) {
    if (
      !scripts[i].src ||
      scripts[i].src.startsWith(prefix) ||
      !scripts[i].src.startsWith(window.location.origin)
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
      !links[i].href.startsWith(window.location.origin)
    ) {
      continue;
    }
    if (links[i].rel && links[i].rel == 'stylesheet') {
      srcList.push(links[i].href);
    }
  }
  // deduplicate
  return srcList.filter(function(el, i, arr) {
    return arr.indexOf(el) === i;
  });
}

const mousedownHandler = () => {
  chrome.runtime.sendMessage({ message: 'frameMouseDown' });
};

const messageHandler = async function(request, _, sendResponse) {
  console.log(request);
  if (!request) return;
  if (request.message === 'fetchSources') {
    chrome.runtime.sendMessage({ message: 'frameSources', data: getSources() });
  } else if (request.message === 'highlightNode') {
    console.log(request.data.source);
    const node = imageMap[request.data.source];
    if (!node) {
      return;
    }
    if (!overlay) {
      overlay = new Overlay();
    }
    overlay.highlight(node, request.data.ts, request.data.scrollOnHighlight);
  } else if (
    request.message === 'removeHighlight' ||
    request.message === 'drawerClosed'
  ) {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }
};

const VALID_TAGS = [
  'DIV',
  'ARTICLE',
  'SECTION',
  'A',
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BLOCKQUOTE',
  'PRE',
  'TD',
  'TH',
  'DL',
  'IMG'
];

function onDomReady() {
  const style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  console.log('location: ', document.location.href);
  style.innerHTML = `
  @font-face {
    font-family: 'VANDAL__Inconsolata';
    src: url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Regular.eot?#iefix')
        format('embedded-opentype'),
      url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Regular.woff')
        format('woff'),
      url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Regular.ttf')
        format('truetype'),
      url('chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/fonts/Inconsolata-Regular.svg#Inconsolata-Regular')
        format('svg');
    font-weight: normal;
    font-style: normal;
  }
  `;
  document.head.appendChild(style);
  window.removeEventListener('mousedown', mousedownHandler);
  window.addEventListener('mousedown', mousedownHandler);
  chrome.runtime.onMessage.removeListener(messageHandler);
  chrome.runtime.onMessage.addListener(messageHandler);

  let index = 0;
  document.body.querySelectorAll('*').forEach(node => {
    if (node && VALID_TAGS.indexOf(node.nodeName) > -1) {
      node.setAttribute('data-vandal__index', index++);
    }
  });

  console.log('hello: frame: ', document.location.href);

  chrome.runtime.sendMessage({
    message: 'frameHTML',
    data: document.body.innerHTML
  });
}

onDomReady();
