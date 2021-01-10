const validTabs = {};
let isBrowserActionClicked = false;
let hasNavigationCompleted = true;
let isBeforeNavigate = false;

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
  } else if (transitionType === 'manual_subframe') {
    return 'manual';
  }
  return null;
};

let isManualTransition = false;
let commitURL;
let urlInitiator;

class NavigationHandler {
  beforeNavigateHandler = (details) => {
    console.log('beforeNavigateHandler: ', details, details.url);
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

    log('Before navigate', validTabs, tabId);

    if (!validTabs[tabId].parentFrameId) {
      validTabs[tabId].parentFrameId = parentFrameId;
    }

    if (!validTabs[tabId].frames.includes(frameId)) {
      validTabs[tabId].frames.push(frameId);
    }

    hasNavigationCompleted = false;

    isBeforeNavigate = true;

    chrome.tabs.sendMessage(tabId, {
      message: '__VANDAL__NAV__BEFORENAVIGATE',
      data: { url }
    });
  };

  commitHandler = (details) => {
    const {
      tabId,
      frameId,
      parentFrameId,
      url,
      transitionQualifiers,
      transitionType
    } = details;
    // Manual_subframe / auto_subframe detect navigation for back/forward
    console.log(
      'transitionType:',
      transitionType,
      transitionQualifiers,
      details
    );

    if (
      url.indexOf('chrome-extension://') === 0 &&
      transitionType === 'manual_subframe'
    ) {
      // commitExtensionURL = decodeURIComponent(url.split('iframe.html?url=')[1]);
      isManualTransition = true;
    }

    if (
      url.indexOf('chrome-extension://') === 0 ||
      !isValidTab(tabId) ||
      !isValidFrame(tabId, frameId, parentFrameId) ||
      url === 'about:blank'
    ) {
      return;
    }

    // || commitExtensionURL === url
    if (transitionType === 'manual_subframe') {
      isManualTransition = true;
    }

    log('Commit');

    // if (isValidTab(tabId) && frameId > 0) {
    // validTabs[tabId].frames.indexOf(frameId) === 0;
    const transitionTypeQualifier = getTransitionType(
      transitionQualifiers,
      transitionType,
      url
    );

    commitURL = url;

    chrome.tabs.sendMessage(tabId, {
      message: '__VANDAL__NAV__COMMIT',
      data: {
        url,
        type:
          isManualTransition && transitionTypeQualifier !== 'redirect'
            ? //  ||
              // (urlInitiator &&
              //   urlInitiator.indexOf('chrome-extension://') === 0 &&
              //   transitionTypeQualifier !== 'redirect')
              'manual'
            : transitionTypeQualifier
      }
    });

    urlInitiator = null;

    if (isManualTransition) {
      isManualTransition = false;
    }
    // }
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

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }

    commitURL = null;
    log('Completed');
    hasNavigationCompleted = true;
    chrome.tabs.sendMessage(tabId, {
      message: '__VANDAL__NAV__COMPLETE',
      data: { url }
    });
  };

  historyHandler = (details) => {
    const { tabId, frameId, parentFrameId } = details;
    // if (!isBeforeNavigate) {
    //   if (!validTabs[tabId].parentFrameId) {
    //     validTabs[tabId].parentFrameId = parentFrameId;
    //   }

    //   if (!validTabs[tabId].frames.includes(frameId)) {
    //     validTabs[tabId].frames.push(frameId);
    //   }
    //   isBeforeNavigate = true;
    // } else {
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId)) {
      return;
    }
    // }

    const { url, transitionQualifiers, transitionType } = details;

    // if already commited, then return
    if (
      commitURL === url.replace(/if_|&feature=youtu.be/g, '')
      //.replace('if_', '')
    ) {
      return;
    }

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
      // details.url.indexOf('web.archive.org/web') >= 0 &&
      // details.url.indexOf('im_') < 0 &&
      isValidTab(details.tabId) &&
      isValidFrame(details.tabId, details.frameId)
    ) {
      log('Before request');

      // urlInitiator = details.initiator;
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
    console.log('beforeSendHandler:', details.url, details);
    // if (
    //   details.url !==
    //   'https://web.archive.org/__wb/calendarcaptures?url=https%3A%2F%2Fwww.google.com%2F&selected_year=2019' &&
    //   (details.url.indexOf('web.archive.org') < 0 ||
    //     !isValidTab(tabId) ||
    //     !isValidFrame(tabId, frameId, parentFrameId))
    // ) {
    //   return;
    // }

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
    log('Header Received', details.url, details.statusCode, details);
    // const { tabId, frameId, parentFrameId } = details;

    // handle youtube video
    if (details.url.indexOf('.googlevideo.com/videoplayback') > -1) {
      return;
    }

    if (
      details.statusCode === 302 &&
      details.type === 'sub_frame' &&
      Array.isArray(details.responseHeaders) &&
      details.responseHeaders.some((header) => {
        return header['name'] === 'x-ts' && header['value'] === '302';
      })
    ) {
      chrome.tabs.sendMessage(details.tabId, {
        message: '__VANDAL__NAV__REDIRECT',
        data: { url: details.url }
      });
    }

    // if (
    //   (details.url.indexOf('web.archive.org') < 0 ||
    //     details.initiator.indexOf('chrome-extension://') === 0) &&
    //   !(
    //     details.type === 'xmlhttprequest' &&
    //     details.url.replace(/\/$/, '') === details.initiator
    //   ) &&
    //   (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId))
    // ) {
    //   return;
    // }

    console.log('headerReceivedHandler:2');
    let responseHeaders = details.responseHeaders.map((header) => {
      const isCSPHeader = /content-security-policy/i.test(header.name);
      const isFrameHeader = /^x-frame-options/i.test(header.name);
      const isXSSHeader = /^x-xss-protection/i.test(header.name);
      const isOriginHeader = /^access-control-allow-origin/i.test(header.name);
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
          csp = csp.replace(/frame-ancestors (.*?)$/gi, 'frame-ancestors *');
        }
        header.value = csp;
      } else if (isFrameHeader) {
        header.value = 'ALLOWALL';
      } else if (isXSSHeader) {
        header.value = '0';
      } else if (isOriginHeader) {
        header.value = details.initiator || '*';
      }

      return header;
    });

    const headerCount = Object.keys(responseHeaders).length;
    const extraHeaders = {
      // 'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods':
        'GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH'
      // 'Access-Control-Allow-Credentials': 'false'
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
    log('Before Redirect', details.url, details);
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

  onRequestCompletedHandler = (details) => {
    log('Request Completed', details.url, details);
    if (
      isValidTab(details.tabId) &&
      isValidFrame(details.tabId, details.frameId) &&
      details.statusCode >= 400 &&
      details.url.indexOf('web.archive.org/web') < 0
    ) {
      chrome.tabs.sendMessage(details.tabId, {
        message: '__VANDAL__NAV__NOTFOUND',
        data: { url: details.url }
      });
    }
  };
}

let handlers = [];

const requestFilters = ['http://*/*', 'https://*/*'];

const eventMap = {
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
      types: ['sub_frame'] //'main_frame', ,'xmlhttprequest']
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
      urls: requestFilters,
      types: ['sub_frame', 'xmlhttprequest']
    },
    extras: ['blocking', 'requestHeaders', 'extraHeaders']
  },
  onRequestCompleted: {
    name: 'onCompleted',
    type: 'webRequest',
    handler: 'onRequestCompletedHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    }
  },
  onBeforeNavigate: {
    type: 'webNavigation',
    handler: 'beforeNavigateHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    }
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
    type: 'webRequest',
    handler: 'errorHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    }
  },
  onHistoryStateUpdated: {
    type: 'webNavigation',
    handler: 'historyHandler',
    options: {
      urls: requestFilters,
      types: ['sub_frame']
    }
  }
};

let navigationHandler, currentWindowId;

function removeListeners() {
  if (!navigationHandler) return;
  log('Remove Listeners');
  for (let [event, value] of Object.entries(eventMap)) {
    chrome[value.type][value.name || event].removeListener(
      navigationHandler[value.handler]
    );
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
        !chrome.webNavigation[value.name || event].hasListener(
          navigationHandler[value.handler]
        )
      ) {
        chrome.webNavigation[value.name || event].addListener(
          navigationHandler[value.handler]
        );
      }
    } else {
      if (
        !chrome.webRequest[value.name || event].hasListener(
          navigationHandler[value.handler]
        )
      ) {
        chrome.webRequest[value.name || event].addListener(
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

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log('onUpdated');
    //remove listeners on reload
    // if (isValidTab(tabId) && changeInfo.favIconUrl) {
    //   log('Remove Listeners on onUpdated');
    //   validTabs[tabId] = null;
    //   delete validTabs[tabId];
    //   removeListeners();
    // }
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
      return true;
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
    console.log('validTabs:', validTabs, tabId);
    // If page not navigated yet, then return
    if (!isBeforeNavigate) return;
    sendResponse({ isValid: Boolean(validTabs[tabId]) });
  }
  return true;
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