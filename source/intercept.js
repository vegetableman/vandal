const validTabs = {};
let isBrowserActionClicked = false;
let hasNavigationCompleted = true;

const log = (message, ...args) => {
  console.info(`Vandal: ${message}`, ...args);
};

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
      validTabs[tabId].parentFrameId === parentFrameId ||
      validTabs[tabId].frames.includes(frameId))
  );
};

const getTransitionType = (transitionQualifiers = [], transitionType, url) => {
  if (transitionQualifiers.indexOf('server_redirect') > -1) {
    console.log('before redirect: url:', url);
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
  beforeNavigateHandler = (details) => {
    console.log('beforeNavigateHandler: ', details.url);
    const { tabId, parentFrameId, frameId, url } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId)) {
      return;
    }

    if (details.url === 'about:blank') {
      chrome.tabs.sendMessage(tabId, {
        message: '__VANDAL__NAV__BUSTED'
      });
      return;
    }

    log('Before navigate');

    if (!validTabs[tabId].parentFrameId) {
      validTabs[tabId].parentFrameId = parentFrameId;
    }

    if (!validTabs[tabId].frames.includes(frameId)) {
      validTabs[tabId].frames.push(frameId);
    }

    hasNavigationCompleted = false;

    chrome.tabs.sendMessage(tabId, {
      message: '__VANDAL__NAV__BEFORENAVIGATE',
      data: { url }
    });
  };

  commitHandler = (details) => {
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
      !isValidFrame(tabId, frameId) ||
      url === 'about:blank'
    ) {
      return;
    }

    log('Commit');

    if (isValidTab(tabId) && frameId > 0) {
      // validTabs[tabId].frames.indexOf(frameId) === 0;
      chrome.tabs.sendMessage(tabId, {
        message: '__VANDAL__NAV__COMMIT',
        data: {
          url,
          type: getTransitionType(transitionQualifiers, transitionType, url)
        }
      });
    }
  };

  domLoadHandler = (details) => {
    const { tabId, frameId } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }

    log('Dom Loaded');

    browser.tabs.executeScript(tabId, {
      file: 'frame.js',
      frameId: frameId,
      matchAboutBlank: true
    });
  };

  completedHandler = (details) => {
    const { tabId, frameId, url } = details;

    //if the user reloaded, then invalidate the tab
    //and remove listeners
    if (frameId === 0) {
      // if (isValidTab(tabId)) {
      //   validTabs[tabId] = null;
      //   delete validTabs[tabId];
      // }
      log('Before Removing Listeners');
      // removeListeners();
      return;
    }

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }
    log('Completed');
    hasNavigationCompleted = true;
    chrome.tabs.sendMessage(tabId, {
      message: '__VANDAL__NAV__COMPLETE',
      data: { url }
    });
  };

  historyHandler = (details) => {
    const { tabId, frameId } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }
    const { url, transitionQualifiers, transitionType } = details;
    chrome.tabs.sendMessage(tabId, {
      message: '__VANDAL__NAV__HISTORYCHANGE',
      data: {
        url,
        type: getTransitionType(transitionQualifiers, transitionType, url)
      }
    });
    hasNavigationCompleted = true;
  };

  errorHandler = (details) => {
    const { tabId, frameId, url } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }
    hasNavigationCompleted = true;
    chrome.tabs.sendMessage(tabId, {
      message: '__VANDAL__NAV__ERROR',
      data: {
        error: details.error,
        url
      }
    });
  };

  beforeRequestHandler = (details) => {
    console.log('beforeRequestHandler: ', details.url);
    if (
      details.url &&
      details.url.indexOf('web.archive.org/web') >= 0 &&
      // details.url.indexOf('im_') < 0 &&
      isValidTab(details.tabId) &&
      isValidFrame(details.tabId, details.frameId)
    ) {
      log('Before request');
      // const redirectUrl = details.url.replace(/(\d+)(i[a-z]_)?/, '$1im_');
      // chrome.tabs.sendMessage(details.tabId, {
      //   message: '__VANDAL__NAV__BEFORENAVIGATE',
      //   data: { url: details.url} //type: 'archiveLink' }
      // });
      // return {
      // redirectUrl

      // };
      return null;
    }
  };

  beforeSendHandler = (details) => {
    const { tabId, frameId, parentFrameId } = details;
    if (
      details.url !==
        'https://web.archive.org/__wb/calendarcaptures?url=https%3A%2F%2Fwww.google.com%2F&selected_year=2019' &&
      (details.url.indexOf('web.archive.org') < 0 ||
        !isValidTab(tabId) ||
        !isValidFrame(tabId, frameId, parentFrameId))
    ) {
      return;
    }

    let requestHeaders = details.requestHeaders.map(function(header) {
      const isEncodingHeader = /accept-encoding/i.test(header.name);
      if (isEncodingHeader) {
        header.value = 'Identity';
      } else if (header.name === 'Sec-Fetch-Mode') {
        header.value = 'no-cors';
      } else if (header.name === 'Sec-Fetch-Site') {
        header.value = 'same-origin';
      }
      return header;
    });
    return { requestHeaders };
  };

  // https://github.com/segmentio/chrome-sidebar/blob/ae9f07e97bb08927631d1f2eb5fb31e965959bde/examples/github-trending/src/background.js
  headerReceivedHandler = (details) => {
    log('Header Received', details.responseHeaders, details.url);
    const { tabId, frameId } = details;
    if (
      details.url.indexOf('web.archive.org') < 0 &&
      (!isValidTab(tabId) || !isValidFrame(tabId, frameId))
    ) {
      return;
    }
    let responseHeaders = details.responseHeaders.map((header) => {
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

    const headerCount = Object.keys(responseHeaders).length;
    const extraHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods':
        'GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH',
      'Access-Control-Allow-Credentials': 'false'
    };

    let extraIndex = headerCount > 0 ? headerCount : 0;
    for (let i in extraHeaders) {
      responseHeaders[extraIndex] = {
        name: i,
        value: extraHeaders[i]
      };
      extraIndex++;
    }

    return { responseHeaders };
  };

  beforeRedirectHandler = (details) => {
    const { initiator, redirectUrl, tabId } = details;
    if (initiator.indexOf('chrome-extension://') === 0) {
      return;
    }
    try {
      const redirectHost = new URL(redirectUrl).host;
      const initiatorHost = new URL(initiator).host;
      if (redirectHost !== initiatorHost) {
        chrome.tabs.sendMessage(tabId, {
          message: '__VANDAL__NAV__REDIRECTMISMATCH',
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
    handler: 'beforeNavigateHandler'
  },
  onCommitted: {
    type: 'webNavigation',
    handler: 'commitHandler'
  },
  onDOMContentLoaded: {
    type: 'webNavigation',
    handler: 'domLoadHandler'
  },
  onCompleted: {
    type: 'webNavigation',
    handler: 'completedHandler'
  },
  onErrorOccurred: {
    type: 'webNavigation',
    handler: 'errorHandler'
  },
  onHistoryStateUpdated: {
    type: 'webNavigation',
    handler: 'historyHandler'
  },
  // Note: Not using im_ anymore due to issues with CSS and CSR
  onBeforeRequest: {
    type: 'webRequest',
    handler: 'beforeRequestHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    },
    extras: ['blocking']
  },
  onHeadersReceived: {
    type: 'webRequest',
    handler: 'headerReceivedHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    },
    extras: ['blocking', 'responseHeaders', 'extraHeaders']
  },
  onBeforeRedirect: {
    type: 'webRequest',
    handler: 'beforeRedirectHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    },
    extras: ['responseHeaders']
  },
  onBeforeSendHeaders: {
    type: 'webRequest',
    handler: 'beforeSendHandler',
    options: {
      urls: requestFilters
      // types: ['sub_frame']
    },
    extras: ['blocking', 'requestHeaders', 'extraHeaders']
  }
};

let navigationHandler, currentWindowId;

function removeListeners() {
  if (!navigationHandler) return;
  log('Remove Listeners');
  for (let [event, value] of Object.entries(eventMap)) {
    chrome[value.type][event].removeListener(navigationHandler[value.handler]);
  }
  navigationHandler = null;
}

function addListeners() {
  if (navigationHandler) return;
  navigationHandler = new NavigationHandler();
  log('Add Listeners');
  for (let [event, value] of Object.entries(eventMap)) {
    if (value.type !== 'webRequest') {
      if (
        !chrome.webNavigation[event].hasListener(
          navigationHandler[value.handler]
        )
      ) {
        chrome.webNavigation[event].addListener(
          navigationHandler[value.handler]
        );
      }
    } else {
      if (
        !chrome.webRequest[event].hasListener(navigationHandler[value.handler])
      ) {
        chrome.webRequest[event].addListener(
          navigationHandler[value.handler],
          value.options,
          value.extras
        );
      }
    }
  }
}

function init() {
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    log('Tab activated');
    const { tabId } = activeInfo;
    if (
      hasValidTabs() &&
      !isValidTab(tabId) &&
      getWindowCount() === 1 &&
      hasNavigationCompleted
    ) {
      log('Tab activated: invalid');
      removeListeners();
    } else if (isValidTab(tabId)) {
      log('Tab activated: valid', tabId);
      addListeners();
    }
  });

  chrome.tabs.onRemoved.addListener(function(tabId) {
    log('Tabs removed: ', tabId);
    if (!isValidTab(tabId)) return;
    if (isValidTab(tabId)) {
      validTabs[tabId] = null;
      delete validTabs[tabId];
    }
    chrome.tabs.query(
      {
        active: true
      },
      (tabs) => {
        if (!isValidTab(tabs[0].id)) {
          log('onRemoved handler');
          removeListeners();
        }
      }
    );
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const { message } = request;
  const currTab = sender.tab;
  const tabId = currTab.id;
  if (message === '__VANDAL__CLIENT__LOADED') {
    const matchTab = validTabs[tabId];
    const { host } = new URL(currTab.url);
    if (matchTab && matchTab.host === host) {
      matchTab.frames = [];
      matchTab.parentFrameId = null;
      removeListeners();
      addListeners();
      sendResponse({ message: '___VANDAL__BG__SETUPDONE' });
      log('Setup done 2');
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
    log('Setup done 1');
    sendResponse({ message: '___VANDAL__BG__SETUPDONE' });
  } else if (message === '___VANDAL__CLIENT__EXIT') {
    if (getWindowCount() === 1) {
      removeListeners();
    }
    validTabs[tabId] = null;
    delete validTabs[tabId];
  } else if (message === '___VANDAL__CLIENT__CHECKVALID') {
    sendResponse({ isValid: Boolean(validTabs[tabId]) });
  }
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query(
    {
      active: true
    },
    (tabs) => {
      if (!isBrowserActionClicked) {
        isBrowserActionClicked = true;
        init();
      }
    }
  );
});
