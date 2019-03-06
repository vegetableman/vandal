const validTabs = {};
let isBrowserActionClicked = false;
let hasNavigationCompleted = true;
let diffModeTS = null;

const isValidTab = (tabId, url) => {
  return !!validTabs[tabId];
};

const hasValidTabs = () => {
  return Object.keys(validTabs).length;
};

const getWindowCount = () => {
  const windowIds = [];
  if (!validTabs) return;
  for (let [__, details] of Object.entries(validTabs)) {
    if (!windowIds.includes(details.windowId)) {
      windowIds.push(details.windowId);
    }
  }
  return windowIds.length;
};

const isValidFrame = (tabId, frameId, parentFrameId) => {
  return (
    validTabs[tabId] &&
    frameId > 0 &&
    !validTabs[tabId].frames.includes(parentFrameId) &&
    (!validTabs[tabId].parentFrameId ||
      diffModeTS ||
      validTabs[tabId].parentFrameId === parentFrameId ||
      validTabs[tabId].frames.includes(frameId))
  );
};

const getTransitionType = (transitionQualifiers = [], transitionType, url) => {
  if (transitionQualifiers.indexOf('server_redirect') > -1) {
    return 'redirect';
  } else if (
    transitionQualifiers.indexOf('forward_back') > -1 ||
    transitionType === 'auto_subframe'
  ) {
    return 'auto';
  }
  return null;
};

class NavigationHandler {
  beforeNavigateHandler = details => {
    const { tabId, parentFrameId, frameId, url } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId)) {
      return;
    }

    console.log('Before navigate');

    if (!validTabs[tabId].parentFrameId) {
      validTabs[tabId].parentFrameId = parentFrameId;
    }

    if (!validTabs[tabId].frames.includes(frameId)) {
      validTabs[tabId].frames.push(frameId);
    }

    hasNavigationCompleted = false;

    chrome.tabs.sendMessage(tabId, {
      message: 'locationChange',
      data: { url }
    });
  };

  commitHandler = details => {
    const {
      tabId,
      frameId,
      url,
      transitionQualifiers,
      transitionType
    } = details;
    if (
      url.indexOf('chrome-extension://') === 0 ||
      !isValidTab(tabId) ||
      !isValidFrame(tabId, frameId)
    ) {
      return;
    }

    console.log('Commit');

    if (isValidTab(tabId) && frameId > 0) {
      console.log(
        'transitionQualifiers: ',
        transitionQualifiers,
        transitionType
      );
      validTabs[tabId].frames.indexOf(frameId) === 0;
      chrome.tabs.sendMessage(tabId, {
        message: 'onCommit',
        data: {
          url,
          type: getTransitionType(transitionQualifiers, transitionType, url)
        }
      });
    }
  };

  domLoadHandler = details => {
    const { tabId, frameId } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }

    console.log('Dom');

    browser.tabs.executeScript(tabId, {
      file: 'frame.js',
      frameId: frameId
    });
  };

  completedHandler = details => {
    const { tabId, frameId } = details;

    //if the user reloaded, then invalidate the tab
    //and remove listeners
    if (frameId === 0) {
      if (isValidTab(tabId)) {
        validTabs[tabId] = null;
        delete validTabs[tabId];
      }
      removeListeners();
      return;
    }

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }
    hasNavigationCompleted = true;
    console.log('complete');
    chrome.tabs.sendMessage(tabId, { message: 'URLLoaded' });
  };

  historyHandler = details => {
    const { tabId, frameId } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }
    const { url, transitionQualifiers, transitionType } = details;
    console.log('history change', details);
    chrome.tabs.sendMessage(tabId, {
      message: 'historyChange',
      data: {
        url,
        type: getTransitionType(transitionQualifiers, transitionType, url)
      }
    });
    hasNavigationCompleted = true;
  };

  errorHandler = details => {
    const { tabId, frameId, url } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }
    console.log('error', details.error);
    hasNavigationCompleted = true;
    chrome.tabs.sendMessage(tabId, {
      message: 'errorOnLocationChange',
      data: {
        error: details.error,
        url
      }
    });
  };

  beforeRequestHandler = details => {
    if (
      details.url &&
      details.url.indexOf('web.archive.org/web') >= 0 &&
      details.url.indexOf('im_') < 0 &&
      isValidTab(details.tabId) &&
      isValidFrame(details.tabId, details.frameId)
    ) {
      console.log('before request');
      const redirectUrl = details.url.replace(/(\d+)(i[a-z]_)?/, '$1im_');
      chrome.tabs.sendMessage(details.tabId, {
        message: 'locationChange',
        data: { url: details.url, type: 'archiveLink' }
      });
      return {
        redirectUrl
      };
    }
  };

  // https://github.com/segmentio/chrome-sidebar/blob/ae9f07e97bb08927631d1f2eb5fb31e965959bde/examples/github-trending/src/background.js
  headerReceivedHandler = details => {
    const { tabId, frameId } = details;
    if (
      details.url.indexOf('web.archive.org') < 0 &&
      (!isValidTab(tabId) || !isValidFrame(tabId, frameId))
    ) {
      return;
    }
    console.log('header received');
    let responseHeaders = details.responseHeaders.map(header => {
      const isCSPHeader = /content-security-policy/i.test(header.name);
      const isFrameHeader = /^x-frame-options/i.test(header.name);

      if (isCSPHeader) {
        let csp = header.value;
        csp = csp.replace(/frame-ancestors ((.*?);|'none'|'self')/gi, '');
        if (csp.indexOf('web.archive.org') === -1) {
          csp = csp.replace(
            /default-src (.*?);/gi,
            'default-src $1 web.archive.org;'
          );
          csp = csp.replace(
            /connect-src (.*?);/gi,
            'connect-src $1 https://web.archive.org;'
          );
          csp = csp.replace(
            /script-src (.*?);/gi,
            'script-src $1 https://web.archive.org;'
          );
          csp = csp.replace(
            /style-src (.*?);/gi,
            'style-src $1 https://web.archive.org;'
          );
          csp = csp.replace(
            /frame-src (.*?);/gi,
            'frame-src $1 https://web.archive.org;'
          );
        }
        header.value = csp;
      } else if (isFrameHeader) {
        header.value = 'ALLOWALL';
      }

      return header;
    });

    return { responseHeaders };
  };

  beforeRedirectHandler = details => {
    const { initiator, redirectUrl, tabId } = details;
    if (initiator.indexOf('chrome-extension://') === 0) {
      return;
    }
    try {
      const redirectHost = new URL(redirectUrl).host;
      const initiatorHost = new URL(initiator).host;
      if (redirectHost !== initiatorHost) {
        console.log('mismatch---');
        chrome.tabs.sendMessage(tabId, {
          message: 'redirectMismatch',
          data: { redirectHost, initiatorHost }
        });
      }
    } catch (ex) {}
  };
}

let handlers = [];

const requestFilters = ['http://*/*', 'https://*/*'];

const eventMap = {
  onBeforeNavigate: {
    type: 'webNavigation',
    name: 'beforeNavigateHandler'
  },
  onCommitted: {
    type: 'webNavigation',
    name: 'commitHandler'
  },
  onDOMContentLoaded: {
    type: 'webNavigation',
    name: 'domLoadHandler'
  },
  onCompleted: {
    type: 'webNavigation',
    name: 'completedHandler'
  },
  onErrorOccurred: {
    type: 'webNavigation',
    name: 'errorHandler'
  },
  onHistoryStateUpdated: {
    type: 'webNavigation',
    name: 'historyHandler'
  },
  onBeforeRequest: {
    type: 'webRequest',
    name: 'beforeRequestHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    },
    extras: ['blocking']
  },
  onHeadersReceived: {
    type: 'webRequest',
    name: 'headerReceivedHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    },
    extras: ['blocking', 'responseHeaders']
  },
  onBeforeRedirect: {
    type: 'webRequest',
    name: 'beforeRedirectHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    },
    extras: ['responseHeaders']
  }
};

let handler, currentWindowId;

function removeListeners() {
  if (!handler) return;
  console.log('remove Listeners');
  for (let [event, value] of Object.entries(eventMap)) {
    chrome[value.type][event].removeListener(handler[value.name]);
  }
  handler = null;
}

function addListeners() {
  if (handler) return;
  handler = new NavigationHandler();
  console.log('add Listeners');
  for (let [event, value] of Object.entries(eventMap)) {
    if (value.type !== 'webRequest') {
      if (!chrome.webNavigation[event].hasListener(handler[value.name])) {
        chrome.webNavigation[event].addListener(handler[value.name]);
      }
    } else {
      if (!chrome.webRequest[event].hasListener(handler[value.name])) {
        chrome.webRequest[event].addListener(
          handler[value.name],
          value.options,
          value.extras
        );
      }
    }
  }
}

function init() {
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log('tab activated');
    const { tabId } = activeInfo;
    if (
      hasValidTabs() &&
      !isValidTab(tabId) &&
      getWindowCount() === 1 &&
      hasNavigationCompleted
    ) {
      console.log('tab activated: invalid');
      removeListeners();
    } else if (isValidTab(tabId)) {
      console.log('tab activated: valid', tabId);
      addListeners();
    }
  });

  chrome.tabs.onHighlighted.addListener(function(highlightInfo) {
    console.log('highlightInfo: ', highlightInfo);
  });

  chrome.tabs.onRemoved.addListener(function(tabId) {
    console.log('tabs removed: ', tabId);
    if (!isValidTab(tabId)) return;
    if (isValidTab(tabId)) {
      validTabs[tabId] = null;
      delete validTabs[tabId];
    }
    chrome.tabs.query(
      {
        active: true
      },
      tabs => {
        if (!isValidTab(tabs[0].id)) {
          console.log('before remove: tab: ', tabs[0].id);
          removeListeners();
        }
      }
    );
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (!isValidTab(tabId)) return;
    console.log('changeInfo:', changeInfo);
  });
}

chrome.runtime.onSuspend.addListener(function() {
  console.log('onsuspend');
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const { message, data } = request;
  const currTab = sender.tab;
  const tabId = currTab.id;
  if (message === 'VandalLoaded') {
    const matchTab = validTabs[tabId];
    const { host } = new URL(currTab.url);
    if (matchTab && matchTab.host === host) {
      matchTab.frames = [];
      matchTab.parentFrameId = null;
      addListeners();
      sendResponse({ message: 'setupDone' });
      return;
    }
    validTabs[tabId] = {
      url: currTab.url,
      frames: [],
      host,
      windowId: currTab.windowId
    };
    removeListeners();
    addListeners();

    sendResponse({ message: 'setupDone' });
    console.log('setup done');
  } else if (message === 'VandalExit') {
    if (getWindowCount() === 1) {
      removeListeners();
    }
    validTabs[tabId] = null;
    delete validTabs[tabId];
  } else if (message === 'checkValidity') {
    sendResponse({ isValid: Boolean(validTabs[tabId]) });
  } else if (message === 'diffModeTS') {
    diffModeTS = data.selectedTS;
  }
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query(
    {
      active: true
    },
    tabs => {
      if (!isBrowserActionClicked) {
        isBrowserActionClicked = true;
        init();
      }
    }
  );
});
