/* eslint-disable no-console */

const { log } = require("./libs/utils");

const validTabs = {};
let isBeforeNavigate = false;
let hasNavigationCompleted = true;

const isValidTab = (tabId) => !!validTabs[tabId];

const hasValidTabs = () => Object.keys(validTabs).length;

const getWindowCount = () => {
  const windowIds = [];
  if (!validTabs) return null;
  Object.values(validTabs).forEach((details) => {
    if (!windowIds.includes(details.windowId)) {
      windowIds.push(details.windowId);
    }
  });
  return windowIds.length;
};

const isValidFrame = (tabId, frameId, parentFrameId) => (
  validTabs[tabId] &&
    frameId > 0 &&
    !validTabs[tabId].frames.includes(parentFrameId) &&
    (!validTabs[tabId].parentFrameId ||
      validTabs[tabId].parentFrameId === parentFrameId ||
      validTabs[tabId].frames.includes(frameId))
);

const getTransitionType = (transitionQualifiers = [], transitionType) => {
  if (transitionQualifiers.indexOf("server_redirect") > -1) {
    return "redirect";
  } if (
    transitionQualifiers.indexOf("forward_back") > -1 ||
    transitionType === "auto_subframe"
  ) {
    return "auto";
  } if (transitionType === "manual_subframe") {
    return "manual";
  }
  return null;
};

const isMozExtension = (url) => url.indexOf("moz-extension://") === 0;

let isManualTransition = false;
let commitURL;

class NavigationHandler {
  beforeNavigateHandler = (details) => {
    const {
      tabId, parentFrameId, frameId, url
    } = details;

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId) || isMozExtension(url)) {
      return;
    }

    if (details.url === "about:blank" && !!parentFrameId) {
      browser.tabs.sendMessage(tabId, {
        message: "__VANDAL__NAV__BUSTED"
      });
      return;
    }

    if (process.env.NODE_ENV === "development") {
      log("Before Navigate");
    }

    if (!validTabs[tabId].parentFrameId) {
      validTabs[tabId].parentFrameId = parentFrameId;
    }

    if (!validTabs[tabId].frames.includes(frameId)) {
      validTabs[tabId].frames.push(frameId);
    }

    hasNavigationCompleted = false;

    isBeforeNavigate = true;

    browser.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__BEFORENAVIGATE",
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

    if (
      url.indexOf("chrome-extension://") === 0 ||
      !isValidTab(tabId) ||
      !isValidFrame(tabId, frameId, parentFrameId) ||
      url === "about:blank" ||
      isMozExtension(url)
    ) {
      return;
    }

    // Manual_subframe / auto_subframe detect navigation for back/forward
    if (
      url.indexOf("chrome-extension://") === 0 &&
      transitionType === "manual_subframe"
    ) {
      isManualTransition = true;
    }

    if (transitionType === "manual_subframe") {
      isManualTransition = true;
    }

    if (process.env.NODE_ENV === "development") {
      log("Commit");
    }

    const transitionTypeQualifier = getTransitionType(
      transitionQualifiers,
      transitionType,
      url
    );

    commitURL = url;

    browser.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__COMMIT",
      data: {
        url,
        type:
          isManualTransition && transitionTypeQualifier !== "redirect" ?
            "manual" :
            transitionTypeQualifier
      }
    });

    if (isManualTransition) {
      isManualTransition = false;
    }
  };

  domLoadHandler = (details) => {
    const { tabId, frameId } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId) || isMozExtension(details.url)) {
      return;
    }

    if (process.env.NODE_ENV === "development") {
      log("Dom Loaded");
    }

    browser.tabs.executeScript(tabId, {
      file: "build/browser-polyfill.js",
      frameId,
      matchAboutBlank: true
    });
    browser.tabs.executeScript(tabId, {
      file: "build/frame.js",
      frameId,
      matchAboutBlank: true
    });
  };

  completedHandler = (details) => {
    const { tabId, frameId, url } = details;

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId) || isMozExtension(url)) {
      return;
    }

    if (process.env.NODE_ENV === "development") {
      log("Completed");
    }

    commitURL = null;
    hasNavigationCompleted = true;
    browser.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__COMPLETE",
      data: { url }
    });
  };

  historyHandler = (details) => {
    const { tabId, frameId, parentFrameId } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId)) {
      return;
    }

    const { url, transitionQualifiers, transitionType } = details;

    // if already commited, then return
    if (commitURL === url.replace(/if_|&feature=youtu.be/g, "")) {
      return;
    }

    if (process.env.NODE_ENV === "development") {
      log("History Change");
    }

    hasNavigationCompleted = true;
    browser.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__HISTORYCHANGE",
      data: {
        url,
        type: getTransitionType(transitionQualifiers, transitionType, url),
        isForwardBack: transitionQualifiers.indexOf("forward_back") > -1
      }
    });
  };

  errorHandler = (details) => {
    const { tabId, frameId, url } = details;
    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }

    log("Navigation Error");

    hasNavigationCompleted = true;
    browser.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__ERROR",
      data: {
        error: details.error,
        url
      }
    });
  };

  // https://github.com/segmentio/chrome-sidebar/blob/ae9f07e97bb08927631d1f2eb5fb31e965959bde/examples/github-trending/src/background.js
  headerReceivedHandler = (details) => {
    log("Header Received");

    // Return on invalid frames
    if (!(isValidTab(details.tabId) && isValidFrame(details.tabId, details.frameId)) ||
    isMozExtension(details.url)) {
      return null;
    }

    const responseHeaders = details.responseHeaders.map((mheader) => {
      const header = mheader;
      const isCSPHeader = /content-security-policy/i.test(header.name);
      const isFrameHeader = /^x-frame-options/i.test(header.name);
      if (isCSPHeader) {
        if (header.value.indexOf("frame-ancestors") > -1) {
          header.value = header.value.replace(/frame-ancestors [^;]*;?/ig, "");
        }
      } else if (isFrameHeader) {
        header.value = "ALLOWALL";
      }

      return header;
    });

    return { responseHeaders };
  };

  onRequestCompletedHandler = (details) => {
    if (process.env.NODE_ENV === "development") {
      log("Request Completed");
    }

    if (
      isValidTab(details.tabId) &&
      isValidFrame(details.tabId, details.frameId) &&
      details.statusCode >= 400 &&
      details.url.indexOf("web.archive.org/web") < 0
    ) {
      browser.tabs.sendMessage(details.tabId, {
        message: "__VANDAL__NAV__NOTFOUND",
        data: { url: details.url }
      });
    }
  };
}

const requestFilters = ["http://*/*", "https://*/*"];

const eventMap = {
  onHeadersReceived: {
    type: "webRequest",
    handler: "headerReceivedHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    },
    extras: ["blocking", "responseHeaders", chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS]
  },
  onRequestCompleted: {
    name: "onCompleted",
    type: "webRequest",
    handler: "onRequestCompletedHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    }
  },
  onErrorOccurred: {
    type: "webRequest",
    handler: "errorHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    }
  },
  onBeforeNavigate: {
    type: "webNavigation",
    handler: "beforeNavigateHandler"
  },
  onCommitted: {
    type: "webNavigation",
    handler: "commitHandler"
  },
  onDOMContentLoaded: {
    type: "webNavigation",
    handler: "domLoadHandler"
  },
  onCompleted: {
    type: "webNavigation",
    handler: "completedHandler"
  },
  onHistoryStateUpdated: {
    type: "webNavigation",
    handler: "historyHandler"
  }
};

let navigationHandler;

function removeListeners() {
  if (!navigationHandler) return;
  log("Remove Listeners");
  // eslint-disable-next-line no-restricted-syntax
  for (const [event, value] of Object.entries(eventMap)) {
    chrome[value.type][value.name || event].removeListener(
      navigationHandler[value.handler]
    );
  }
  navigationHandler = null;
}

function addListeners() {
  if (navigationHandler) return;
  navigationHandler = new NavigationHandler();
  log("Add Listeners");
  // eslint-disable-next-line no-restricted-syntax
  for (const [event, value] of Object.entries(eventMap)) {
    if (value.type !== "webRequest") {
      if (
        !browser.webNavigation[value.name || event].hasListener(
          navigationHandler[value.handler]
        )
      ) {
        browser.webNavigation[value.name || event].addListener(
          navigationHandler[value.handler]
        );
      }
    } else if (
      !browser.webRequest[value.name || event].hasListener(
        navigationHandler[value.handler]
      )
    ) {
      if (value.extras) {
        browser.webRequest[value.name || event].addListener(
          navigationHandler[value.handler],
          value.options,
          value.extras.filter((e) => !!e)
        );
      } else {
        browser.webRequest[value.name || event].addListener(
          navigationHandler[value.handler],
          value.options
        );
      }
    }
  }
}

function init() {
  browser.tabs.onActivated.addListener((activeInfo) => {
    const { tabId } = activeInfo;
    // Remove listeners if the tab is not active
    // to avoid intercepting requests from other url's
    if (
      hasValidTabs() &&
      !isValidTab(tabId) &&
      getWindowCount() === 1 &&
      hasNavigationCompleted
    ) {
      removeListeners();
    } else if (isValidTab(tabId)) {
      addListeners();
    }
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    log("Tabs removed: ", tabId);
    if (!isValidTab(tabId)) return;
    if (isValidTab(tabId)) {
      validTabs[tabId] = null;
      delete validTabs[tabId];
    }
    browser.tabs.query(
      {
        active: true
      },
      (tabs) => {
        if (!isValidTab(tabs[0].id)) {
          log("onRemoved handler");
          removeListeners();
        }
      }
    );
  });
}

browser.runtime.onMessage.addListener((request, sender) => {
  const { message } = request;
  const currTab = sender.tab;
  const tabId = currTab.id;
  if (message === "__VANDAL__CLIENT__LOADED") {
    const matchTab = validTabs[tabId];
    const { host } = new URL(currTab.url);
    if (matchTab && matchTab.host === host) {
      matchTab.frames = [];
      matchTab.parentFrameId = null;
      removeListeners();
      addListeners();
      return Promise.resolve({ message: "___VANDAL__BG__SETUPDONE" });
    }
    validTabs[tabId] = {
      url: currTab.url,
      frames: [],
      host,
      windowId: currTab.windowId
    };
    removeListeners();
    addListeners();
  } else if (message === "___VANDAL__CLIENT__EXIT") {
    if (getWindowCount() === 1) {
      removeListeners();
    }
    validTabs[tabId] = null;
    delete validTabs[tabId];
  } else if (message === "___VANDAL__CLIENT__CHECKVALID") {
    // If page not navigated yet, then return
    if (!isBeforeNavigate) return null;
  }
  return Promise.resolve({ isValid: Boolean(validTabs[tabId]) });
});

let isBrowserActionClicked = false;
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.query(
    {
      active: true
    }
  ).then(() => {
    if (!isBrowserActionClicked) {
      isBrowserActionClicked = true;
      init();
    }
  });
});
