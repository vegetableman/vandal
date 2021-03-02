/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./source/intercept.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/arrayLikeToArray.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/arrayWithHoles.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/arrayWithHoles.js ***!
  \***************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/classCallCheck.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/classCallCheck.js ***!
  \***************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/defineProperty.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \***************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/iterableToArrayLimit.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/iterableToArrayLimit.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/nonIterableRest.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/nonIterableRest.js ***!
  \****************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/slicedToArray.js":
/*!**************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/slicedToArray.js ***!
  \**************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

var arrayWithHoles = __webpack_require__(/*! ./arrayWithHoles */ "./node_modules/@babel/runtime/helpers/arrayWithHoles.js");

var iterableToArrayLimit = __webpack_require__(/*! ./iterableToArrayLimit */ "./node_modules/@babel/runtime/helpers/iterableToArrayLimit.js");

var unsupportedIterableToArray = __webpack_require__(/*! ./unsupportedIterableToArray */ "./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js");

var nonIterableRest = __webpack_require__(/*! ./nonIterableRest */ "./node_modules/@babel/runtime/helpers/nonIterableRest.js");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js ***!
  \***************************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(/*! ./arrayLikeToArray */ "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;

/***/ }),

/***/ "./source/intercept.js":
/*!*****************************!*\
  !*** ./source/intercept.js ***!
  \*****************************/
/*! no exports provided */
/*! ModuleConcatenation bailout: Module is an entry point */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__);




/* eslint-disable no-console */
var validTabs = {};
var isBeforeNavigate = false;
var hasNavigationCompleted = true;

var log = function log(message) {
  var _console;

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  (_console = console).info.apply(_console, ["Vandal: ".concat(message)].concat(args));
};

var isValidTab = function isValidTab(tabId) {
  return !!validTabs[tabId];
};

var hasValidTabs = function hasValidTabs() {
  return Object.keys(validTabs).length;
};

var getWindowCount = function getWindowCount() {
  var windowIds = [];
  if (!validTabs) return null;
  Object.values(validTabs).forEach(function (details) {
    if (!windowIds.includes(details.windowId)) {
      windowIds.push(details.windowId);
    }
  });
  return windowIds.length;
};

var isValidFrame = function isValidFrame(tabId, frameId, parentFrameId) {
  return validTabs[tabId] && frameId > 0 && !validTabs[tabId].frames.includes(parentFrameId) && (!validTabs[tabId].parentFrameId || validTabs[tabId].parentFrameId === parentFrameId || validTabs[tabId].frames.includes(frameId));
};

var getTransitionType = function getTransitionType() {
  var transitionQualifiers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var transitionType = arguments.length > 1 ? arguments[1] : undefined;

  if (transitionQualifiers.indexOf("server_redirect") > -1) {
    return "redirect";
  }

  if (transitionQualifiers.indexOf("forward_back") > -1 || transitionType === "auto_subframe") {
    return "auto";
  }

  if (transitionType === "manual_subframe") {
    return "manual";
  }

  return null;
};

var isManualTransition = false;
var commitURL;

var NavigationHandler = function NavigationHandler() {
  _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, NavigationHandler);

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "beforeNavigateHandler", function (details) {
    var tabId = details.tabId,
        parentFrameId = details.parentFrameId,
        frameId = details.frameId,
        url = details.url;

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId)) {
      return;
    }

    if (details.url === "about:blank") {
      chrome.tabs.sendMessage(tabId, {
        message: "__VANDAL__NAV__BUSTED"
      });
      return;
    }

    log("Before Navigate", validTabs, tabId);

    if (!validTabs[tabId].parentFrameId) {
      validTabs[tabId].parentFrameId = parentFrameId;
    }

    if (!validTabs[tabId].frames.includes(frameId)) {
      validTabs[tabId].frames.push(frameId);
    }

    hasNavigationCompleted = false;
    isBeforeNavigate = true;
    chrome.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__BEFORENAVIGATE",
      data: {
        url: url
      }
    });
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "commitHandler", function (details) {
    var tabId = details.tabId,
        frameId = details.frameId,
        parentFrameId = details.parentFrameId,
        url = details.url,
        transitionQualifiers = details.transitionQualifiers,
        transitionType = details.transitionType; // Manual_subframe / auto_subframe detect navigation for back/forward

    if (url.indexOf("chrome-extension://") === 0 && transitionType === "manual_subframe") {
      isManualTransition = true;
    }

    if (url.indexOf("chrome-extension://") === 0 || !isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId) || url === "about:blank") {
      return;
    }

    if (transitionType === "manual_subframe") {
      isManualTransition = true;
    }

    log("Commit");
    var transitionTypeQualifier = getTransitionType(transitionQualifiers, transitionType, url);
    commitURL = url;
    chrome.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__COMMIT",
      data: {
        url: url,
        type: isManualTransition && transitionTypeQualifier !== "redirect" ? "manual" : transitionTypeQualifier
      }
    });

    if (isManualTransition) {
      isManualTransition = false;
    }
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "domLoadHandler", function (details) {
    var tabId = details.tabId,
        frameId = details.frameId;

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }

    log("Dom Loaded");
    chrome.tabs.executeScript(tabId, {
      file: "frame.js",
      frameId: frameId,
      matchAboutBlank: true
    });
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "completedHandler", function (details) {
    var tabId = details.tabId,
        frameId = details.frameId,
        url = details.url;

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }

    log("Completed");
    commitURL = null;
    hasNavigationCompleted = true;
    chrome.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__COMPLETE",
      data: {
        url: url
      }
    });
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "historyHandler", function (details) {
    var tabId = details.tabId,
        frameId = details.frameId,
        parentFrameId = details.parentFrameId;

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId, parentFrameId)) {
      return;
    }

    var url = details.url,
        transitionQualifiers = details.transitionQualifiers,
        transitionType = details.transitionType; // if already commited, then return

    if (commitURL === url.replace(/if_|&feature=youtu.be/g, "")) {
      return;
    }

    log("History Change");
    hasNavigationCompleted = true;
    chrome.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__HISTORYCHANGE",
      data: {
        url: url,
        type: getTransitionType(transitionQualifiers, transitionType, url)
      }
    });
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "errorHandler", function (details) {
    var tabId = details.tabId,
        frameId = details.frameId,
        url = details.url;

    if (!isValidTab(tabId) || !isValidFrame(tabId, frameId)) {
      return;
    }

    log("Navigation Error");
    hasNavigationCompleted = true;
    chrome.tabs.sendMessage(tabId, {
      message: "__VANDAL__NAV__ERROR",
      data: {
        error: details.error,
        url: url
      }
    });
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "headerReceivedHandler", function (details) {
    log("Header Received"); // Return on youtube video or invalid sub-frames

    if (details.url.indexOf(".googlevideo.com/videoplayback") > -1 || !(isValidTab(details.tabId) && isValidFrame(details.tabId, details.frameId))) {
      return null;
    }

    if (details.statusCode === 302 && details.type === "sub_frame" && Array.isArray(details.responseHeaders) && details.responseHeaders.some(function (header) {
      return header.name === "x-ts" && header.value === "302";
    })) {
      chrome.tabs.sendMessage(details.tabId, {
        message: "__VANDAL__NAV__REDIRECT",
        data: {
          url: details.url
        }
      });
    }

    var responseHeaders = details.responseHeaders.map(function (mheader) {
      var header = mheader;
      var isCSPHeader = /content-security-policy/i.test(header.name);
      var isFrameHeader = /^x-frame-options/i.test(header.name);
      var isXSSHeader = /^x-xss-protection/i.test(header.name);
      var isOriginHeader = /^access-control-allow-origin/i.test(header.name);

      if (isCSPHeader) {
        var csp = header.value;
        csp = csp.replace(/frame-ancestors ((.*?);|'none'|'self')/gi, "");

        if (csp.indexOf("web.archive.org") === -1) {
          csp = csp.replace(/default-src (.*?);/gi, "default-src $1 web.archive.org;");
          csp = csp.replace(/connect-src (.*?);/gi, "connect-src $1 https://web.archive.org;");
          csp = csp.replace(/script-src (.*?);/gi, "script-src $1 https://web.archive.org;");
          csp = csp.replace(/style-src (.*?);/gi, "style-src $1 https://web.archive.org;");
          csp = csp.replace(/frame-src (.*?);/gi, "frame-src $1 https://web.archive.org;");
          csp = csp.replace(/frame-ancestors (.*?)$/gi, "frame-ancestors *");
        }

        header.value = csp;
      } else if (isFrameHeader) {
        header.value = "ALLOWALL";
      } else if (isXSSHeader) {
        header.value = "0";
      } else if (isOriginHeader) {
        header.value = details.initiator || "*";
      }

      return header;
    });
    return {
      responseHeaders: responseHeaders
    };
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "beforeRedirectHandler", function (details) {
    var initiator = details.initiator,
        redirectUrl = details.redirectUrl,
        tabId = details.tabId;

    if (initiator.indexOf("chrome-extension://") === 0) {
      return;
    }

    try {
      var redirectHost = new URL(redirectUrl).host;
      var initiatorHost = new URL(initiator).host;

      if (redirectHost !== initiatorHost) {
        log("Before Redirect", details.url, details);
        chrome.tabs.sendMessage(tabId, {
          message: "__VANDAL__NAV__REDIRECTMISMATCH",
          data: {
            redirectHost: redirectHost,
            initiatorHost: initiatorHost
          }
        });
      }
    } catch (ex) {
      console.error("beforeRedirectHandler: Error parsing url");
    }
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "onRequestCompletedHandler", function (details) {
    log("Request Completed", details.url, details);

    if (isValidTab(details.tabId) && isValidFrame(details.tabId, details.frameId) && details.statusCode >= 400 && details.url.indexOf("web.archive.org/web") < 0) {
      chrome.tabs.sendMessage(details.tabId, {
        message: "__VANDAL__NAV__NOTFOUND",
        data: {
          url: details.url
        }
      });
    }
  });

  _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(this, "tabReplacedHandler", function (details) {
    log("Tab Replaced", details);
  });
};

var requestFilters = ["http://*/*", "https://*/*"];
var eventMap = {
  onHeadersReceived: {
    type: "webRequest",
    handler: "headerReceivedHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    },
    extras: ["blocking", "responseHeaders", "extraHeaders"]
  },
  onBeforeRedirect: {
    type: "webRequest",
    handler: "beforeRedirectHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    },
    extras: ["responseHeaders"]
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
  onBeforeNavigate: {
    type: "webNavigation",
    handler: "beforeNavigateHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    }
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
  onErrorOccurred: {
    type: "webRequest",
    handler: "errorHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    }
  },
  onHistoryStateUpdated: {
    type: "webNavigation",
    handler: "historyHandler",
    options: {
      urls: requestFilters,
      types: ["sub_frame"]
    }
  },
  onTabReplaced: {
    type: "webNavigation",
    handler: "tabReplacedHandler"
  }
};
var navigationHandler;

function removeListeners() {
  if (!navigationHandler) return;
  log("Remove Listeners"); // eslint-disable-next-line no-restricted-syntax

  for (var _i = 0, _Object$entries = Object.entries(eventMap); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0___default()(_Object$entries[_i], 2),
        event = _Object$entries$_i[0],
        value = _Object$entries$_i[1];

    chrome[value.type][value.name || event].removeListener(navigationHandler[value.handler]);
  }

  navigationHandler = null;
}

function addListeners() {
  if (navigationHandler) return;
  navigationHandler = new NavigationHandler();
  log("Add Listeners"); // eslint-disable-next-line no-restricted-syntax

  for (var _i2 = 0, _Object$entries2 = Object.entries(eventMap); _i2 < _Object$entries2.length; _i2++) {
    var _Object$entries2$_i = _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0___default()(_Object$entries2[_i2], 2),
        event = _Object$entries2$_i[0],
        value = _Object$entries2$_i[1];

    if (value.type !== "webRequest") {
      if (!chrome.webNavigation[value.name || event].hasListener(navigationHandler[value.handler])) {
        chrome.webNavigation[value.name || event].addListener(navigationHandler[value.handler]);
      }
    } else if (!chrome.webRequest[value.name || event].hasListener(navigationHandler[value.handler])) {
      chrome.webRequest[value.name || event].addListener(navigationHandler[value.handler], value.options, value.extras);
    }
  }
}

function init() {
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    log("Tab activated");
    var tabId = activeInfo.tabId;

    if (hasValidTabs() && !isValidTab(tabId) && getWindowCount() === 1 && hasNavigationCompleted) {
      log("Tab activated: invalid");
      removeListeners();
    } else if (isValidTab(tabId)) {
      log("Tab activated: valid", tabId);
      addListeners();
    }
  });
  chrome.tabs.onRemoved.addListener(function (tabId) {
    log("Tabs removed: ", tabId);
    if (!isValidTab(tabId)) return;

    if (isValidTab(tabId)) {
      validTabs[tabId] = null;
      delete validTabs[tabId];
    }

    chrome.tabs.query({
      active: true
    }, function (tabs) {
      if (!isValidTab(tabs[0].id)) {
        log("onRemoved handler");
        removeListeners();
      }
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var message = request.message;
  var currTab = sender.tab;
  var tabId = currTab.id;

  if (message === "__VANDAL__CLIENT__LOADED") {
    var matchTab = validTabs[tabId];

    var _URL = new URL(currTab.url),
        host = _URL.host;

    if (matchTab && matchTab.host === host) {
      matchTab.frames = [];
      matchTab.parentFrameId = null;
      removeListeners();
      addListeners();
      sendResponse({
        message: "___VANDAL__BG__SETUPDONE"
      });
      return true;
    }

    validTabs[tabId] = {
      url: currTab.url,
      frames: [],
      host: host,
      windowId: currTab.windowId
    };
    removeListeners();
    addListeners();
    sendResponse({
      message: "___VANDAL__BG__SETUPDONE"
    });
  } else if (message === "___VANDAL__CLIENT__EXIT") {
    if (getWindowCount() === 1) {
      removeListeners();
    }

    validTabs[tabId] = null;
    delete validTabs[tabId];
  } else if (message === "___VANDAL__CLIENT__CHECKVALID") {
    // If page not navigated yet, then return
    if (!isBeforeNavigate) return null;
    sendResponse({
      isValid: Boolean(validTabs[tabId])
    });
  }

  return true;
});
var isBrowserActionClicked = false;
chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.query({
    active: true
  }, function () {
    if (!isBrowserActionClicked) {
      isBrowserActionClicked = true;
      init();
    }
  });
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXJyYXlMaWtlVG9BcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXlMaW1pdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9ub25JdGVyYWJsZVJlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9zb3VyY2UvaW50ZXJjZXB0LmpzIl0sIm5hbWVzIjpbInZhbGlkVGFicyIsImlzQmVmb3JlTmF2aWdhdGUiLCJoYXNOYXZpZ2F0aW9uQ29tcGxldGVkIiwibG9nIiwibWVzc2FnZSIsImFyZ3MiLCJjb25zb2xlIiwiaW5mbyIsImlzVmFsaWRUYWIiLCJ0YWJJZCIsImhhc1ZhbGlkVGFicyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJnZXRXaW5kb3dDb3VudCIsIndpbmRvd0lkcyIsInZhbHVlcyIsImZvckVhY2giLCJkZXRhaWxzIiwiaW5jbHVkZXMiLCJ3aW5kb3dJZCIsInB1c2giLCJpc1ZhbGlkRnJhbWUiLCJmcmFtZUlkIiwicGFyZW50RnJhbWVJZCIsImZyYW1lcyIsImdldFRyYW5zaXRpb25UeXBlIiwidHJhbnNpdGlvblF1YWxpZmllcnMiLCJ0cmFuc2l0aW9uVHlwZSIsImluZGV4T2YiLCJpc01hbnVhbFRyYW5zaXRpb24iLCJjb21taXRVUkwiLCJOYXZpZ2F0aW9uSGFuZGxlciIsInVybCIsImNocm9tZSIsInRhYnMiLCJzZW5kTWVzc2FnZSIsImRhdGEiLCJ0cmFuc2l0aW9uVHlwZVF1YWxpZmllciIsInR5cGUiLCJleGVjdXRlU2NyaXB0IiwiZmlsZSIsIm1hdGNoQWJvdXRCbGFuayIsInJlcGxhY2UiLCJlcnJvciIsInN0YXR1c0NvZGUiLCJBcnJheSIsImlzQXJyYXkiLCJyZXNwb25zZUhlYWRlcnMiLCJzb21lIiwiaGVhZGVyIiwibmFtZSIsInZhbHVlIiwibWFwIiwibWhlYWRlciIsImlzQ1NQSGVhZGVyIiwidGVzdCIsImlzRnJhbWVIZWFkZXIiLCJpc1hTU0hlYWRlciIsImlzT3JpZ2luSGVhZGVyIiwiY3NwIiwiaW5pdGlhdG9yIiwicmVkaXJlY3RVcmwiLCJyZWRpcmVjdEhvc3QiLCJVUkwiLCJob3N0IiwiaW5pdGlhdG9ySG9zdCIsImV4IiwicmVxdWVzdEZpbHRlcnMiLCJldmVudE1hcCIsIm9uSGVhZGVyc1JlY2VpdmVkIiwiaGFuZGxlciIsIm9wdGlvbnMiLCJ1cmxzIiwidHlwZXMiLCJleHRyYXMiLCJvbkJlZm9yZVJlZGlyZWN0Iiwib25SZXF1ZXN0Q29tcGxldGVkIiwib25CZWZvcmVOYXZpZ2F0ZSIsIm9uQ29tbWl0dGVkIiwib25ET01Db250ZW50TG9hZGVkIiwib25Db21wbGV0ZWQiLCJvbkVycm9yT2NjdXJyZWQiLCJvbkhpc3RvcnlTdGF0ZVVwZGF0ZWQiLCJvblRhYlJlcGxhY2VkIiwibmF2aWdhdGlvbkhhbmRsZXIiLCJyZW1vdmVMaXN0ZW5lcnMiLCJlbnRyaWVzIiwiZXZlbnQiLCJyZW1vdmVMaXN0ZW5lciIsImFkZExpc3RlbmVycyIsIndlYk5hdmlnYXRpb24iLCJoYXNMaXN0ZW5lciIsImFkZExpc3RlbmVyIiwid2ViUmVxdWVzdCIsImluaXQiLCJvbkFjdGl2YXRlZCIsImFjdGl2ZUluZm8iLCJvblJlbW92ZWQiLCJxdWVyeSIsImFjdGl2ZSIsImlkIiwicnVudGltZSIsIm9uTWVzc2FnZSIsInJlcXVlc3QiLCJzZW5kZXIiLCJzZW5kUmVzcG9uc2UiLCJjdXJyVGFiIiwidGFiIiwibWF0Y2hUYWIiLCJpc1ZhbGlkIiwiQm9vbGVhbiIsImlzQnJvd3NlckFjdGlvbkNsaWNrZWQiLCJicm93c2VyQWN0aW9uIiwib25DbGlja2VkIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7O0FBRUEsd0NBQXdDLFNBQVM7QUFDakQ7QUFDQTs7QUFFQTtBQUNBOztBQUVBLG1DOzs7Ozs7Ozs7Ozs7QUNWQTtBQUNBO0FBQ0E7O0FBRUEsaUM7Ozs7Ozs7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QUFHLElBQXpCO0FBQ0FqQixVQUFJO0FBQ0w7QUFDRixHQVRIO0FBV0QsQ0FaRCxFIiwiZmlsZSI6ImludGVyY2VwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc291cmNlL2ludGVyY2VwdC5qc1wiKTtcbiIsImZ1bmN0aW9uIF9hcnJheUxpa2VUb0FycmF5KGFyciwgbGVuKSB7XG4gIGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykge1xuICAgIGFycjJbaV0gPSBhcnJbaV07XG4gIH1cblxuICByZXR1cm4gYXJyMjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlMaWtlVG9BcnJheTsiLCJmdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5V2l0aEhvbGVzOyIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9kZWZpbmVQcm9wZXJ0eTsiLCJmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7XG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcInVuZGVmaW5lZFwiIHx8ICEoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSkgcmV0dXJuO1xuICB2YXIgX2FyciA9IFtdO1xuICB2YXIgX24gPSB0cnVlO1xuICB2YXIgX2QgPSBmYWxzZTtcbiAgdmFyIF9lID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2QgPSB0cnVlO1xuICAgIF9lID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIF9hcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2l0ZXJhYmxlVG9BcnJheUxpbWl0OyIsImZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX25vbkl0ZXJhYmxlUmVzdDsiLCJ2YXIgYXJyYXlXaXRoSG9sZXMgPSByZXF1aXJlKFwiLi9hcnJheVdpdGhIb2xlc1wiKTtcblxudmFyIGl0ZXJhYmxlVG9BcnJheUxpbWl0ID0gcmVxdWlyZShcIi4vaXRlcmFibGVUb0FycmF5TGltaXRcIik7XG5cbnZhciB1bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheSA9IHJlcXVpcmUoXCIuL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5XCIpO1xuXG52YXIgbm9uSXRlcmFibGVSZXN0ID0gcmVxdWlyZShcIi4vbm9uSXRlcmFibGVSZXN0XCIpO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHtcbiAgcmV0dXJuIGFycmF5V2l0aEhvbGVzKGFycikgfHwgaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCB1bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IG5vbkl0ZXJhYmxlUmVzdCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9zbGljZWRUb0FycmF5OyIsInZhciBhcnJheUxpa2VUb0FycmF5ID0gcmVxdWlyZShcIi4vYXJyYXlMaWtlVG9BcnJheVwiKTtcblxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikge1xuICBpZiAoIW8pIHJldHVybjtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xuICB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7XG4gIGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7XG4gIGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pO1xuICBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIGFycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXk7IiwiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5jb25zdCB2YWxpZFRhYnMgPSB7fTtcbmxldCBpc0JlZm9yZU5hdmlnYXRlID0gZmFsc2U7XG5sZXQgaGFzTmF2aWdhdGlvbkNvbXBsZXRlZCA9IHRydWU7XG5cbmNvbnN0IGxvZyA9IChtZXNzYWdlLCAuLi5hcmdzKSA9PiB7XG4gIGNvbnNvbGUuaW5mbyhgVmFuZGFsOiAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG59O1xuXG5jb25zdCBpc1ZhbGlkVGFiID0gKHRhYklkKSA9PiAhIXZhbGlkVGFic1t0YWJJZF07XG5cbmNvbnN0IGhhc1ZhbGlkVGFicyA9ICgpID0+IE9iamVjdC5rZXlzKHZhbGlkVGFicykubGVuZ3RoO1xuXG5jb25zdCBnZXRXaW5kb3dDb3VudCA9ICgpID0+IHtcbiAgY29uc3Qgd2luZG93SWRzID0gW107XG4gIGlmICghdmFsaWRUYWJzKSByZXR1cm4gbnVsbDtcbiAgT2JqZWN0LnZhbHVlcyh2YWxpZFRhYnMpLmZvckVhY2goKGRldGFpbHMpID0+IHtcbiAgICBpZiAoIXdpbmRvd0lkcy5pbmNsdWRlcyhkZXRhaWxzLndpbmRvd0lkKSkge1xuICAgICAgd2luZG93SWRzLnB1c2goZGV0YWlscy53aW5kb3dJZCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHdpbmRvd0lkcy5sZW5ndGg7XG59O1xuXG5jb25zdCBpc1ZhbGlkRnJhbWUgPSAodGFiSWQsIGZyYW1lSWQsIHBhcmVudEZyYW1lSWQpID0+IChcbiAgdmFsaWRUYWJzW3RhYklkXSAmJlxuICAgIGZyYW1lSWQgPiAwICYmXG4gICAgIXZhbGlkVGFic1t0YWJJZF0uZnJhbWVzLmluY2x1ZGVzKHBhcmVudEZyYW1lSWQpICYmXG4gICAgKCF2YWxpZFRhYnNbdGFiSWRdLnBhcmVudEZyYW1lSWQgfHxcbiAgICAgIHZhbGlkVGFic1t0YWJJZF0ucGFyZW50RnJhbWVJZCA9PT0gcGFyZW50RnJhbWVJZCB8fFxuICAgICAgdmFsaWRUYWJzW3RhYklkXS5mcmFtZXMuaW5jbHVkZXMoZnJhbWVJZCkpXG4pO1xuXG5jb25zdCBnZXRUcmFuc2l0aW9uVHlwZSA9ICh0cmFuc2l0aW9uUXVhbGlmaWVycyA9IFtdLCB0cmFuc2l0aW9uVHlwZSkgPT4ge1xuICBpZiAodHJhbnNpdGlvblF1YWxpZmllcnMuaW5kZXhPZihcInNlcnZlcl9yZWRpcmVjdFwiKSA+IC0xKSB7XG4gICAgcmV0dXJuIFwicmVkaXJlY3RcIjtcbiAgfSBpZiAoXG4gICAgdHJhbnNpdGlvblF1YWxpZmllcnMuaW5kZXhPZihcImZvcndhcmRfYmFja1wiKSA+IC0xIHx8XG4gICAgdHJhbnNpdGlvblR5cGUgPT09IFwiYXV0b19zdWJmcmFtZVwiXG4gICkge1xuICAgIHJldHVybiBcImF1dG9cIjtcbiAgfSBpZiAodHJhbnNpdGlvblR5cGUgPT09IFwibWFudWFsX3N1YmZyYW1lXCIpIHtcbiAgICByZXR1cm4gXCJtYW51YWxcIjtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbmxldCBpc01hbnVhbFRyYW5zaXRpb24gPSBmYWxzZTtcbmxldCBjb21taXRVUkw7XG5cbmNsYXNzIE5hdmlnYXRpb25IYW5kbGVyIHtcbiAgYmVmb3JlTmF2aWdhdGVIYW5kbGVyID0gKGRldGFpbHMpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJJZCwgcGFyZW50RnJhbWVJZCwgZnJhbWVJZCwgdXJsXG4gICAgfSA9IGRldGFpbHM7XG4gICAgaWYgKCFpc1ZhbGlkVGFiKHRhYklkKSB8fCAhaXNWYWxpZEZyYW1lKHRhYklkLCBmcmFtZUlkLCBwYXJlbnRGcmFtZUlkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChkZXRhaWxzLnVybCA9PT0gXCJhYm91dDpibGFua1wiKSB7XG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICBtZXNzYWdlOiBcIl9fVkFOREFMX19OQVZfX0JVU1RFRFwiXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2coXCJCZWZvcmUgTmF2aWdhdGVcIiwgdmFsaWRUYWJzLCB0YWJJZCk7XG5cbiAgICBpZiAoIXZhbGlkVGFic1t0YWJJZF0ucGFyZW50RnJhbWVJZCkge1xuICAgICAgdmFsaWRUYWJzW3RhYklkXS5wYXJlbnRGcmFtZUlkID0gcGFyZW50RnJhbWVJZDtcbiAgICB9XG5cbiAgICBpZiAoIXZhbGlkVGFic1t0YWJJZF0uZnJhbWVzLmluY2x1ZGVzKGZyYW1lSWQpKSB7XG4gICAgICB2YWxpZFRhYnNbdGFiSWRdLmZyYW1lcy5wdXNoKGZyYW1lSWQpO1xuICAgIH1cblxuICAgIGhhc05hdmlnYXRpb25Db21wbGV0ZWQgPSBmYWxzZTtcblxuICAgIGlzQmVmb3JlTmF2aWdhdGUgPSB0cnVlO1xuXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHtcbiAgICAgIG1lc3NhZ2U6IFwiX19WQU5EQUxfX05BVl9fQkVGT1JFTkFWSUdBVEVcIixcbiAgICAgIGRhdGE6IHsgdXJsIH1cbiAgICB9KTtcbiAgfTtcblxuICBjb21taXRIYW5kbGVyID0gKGRldGFpbHMpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJJZCxcbiAgICAgIGZyYW1lSWQsXG4gICAgICBwYXJlbnRGcmFtZUlkLFxuICAgICAgdXJsLFxuICAgICAgdHJhbnNpdGlvblF1YWxpZmllcnMsXG4gICAgICB0cmFuc2l0aW9uVHlwZVxuICAgIH0gPSBkZXRhaWxzO1xuXG4gICAgLy8gTWFudWFsX3N1YmZyYW1lIC8gYXV0b19zdWJmcmFtZSBkZXRlY3QgbmF2aWdhdGlvbiBmb3IgYmFjay9mb3J3YXJkXG4gICAgaWYgKFxuICAgICAgdXJsLmluZGV4T2YoXCJjaHJvbWUtZXh0ZW5zaW9uOi8vXCIpID09PSAwICYmXG4gICAgICB0cmFuc2l0aW9uVHlwZSA9PT0gXCJtYW51YWxfc3ViZnJhbWVcIlxuICAgICkge1xuICAgICAgaXNNYW51YWxUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB1cmwuaW5kZXhPZihcImNocm9tZS1leHRlbnNpb246Ly9cIikgPT09IDAgfHxcbiAgICAgICFpc1ZhbGlkVGFiKHRhYklkKSB8fFxuICAgICAgIWlzVmFsaWRGcmFtZSh0YWJJZCwgZnJhbWVJZCwgcGFyZW50RnJhbWVJZCkgfHxcbiAgICAgIHVybCA9PT0gXCJhYm91dDpibGFua1wiXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRyYW5zaXRpb25UeXBlID09PSBcIm1hbnVhbF9zdWJmcmFtZVwiKSB7XG4gICAgICBpc01hbnVhbFRyYW5zaXRpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIGxvZyhcIkNvbW1pdFwiKTtcblxuICAgIGNvbnN0IHRyYW5zaXRpb25UeXBlUXVhbGlmaWVyID0gZ2V0VHJhbnNpdGlvblR5cGUoXG4gICAgICB0cmFuc2l0aW9uUXVhbGlmaWVycyxcbiAgICAgIHRyYW5zaXRpb25UeXBlLFxuICAgICAgdXJsXG4gICAgKTtcblxuICAgIGNvbW1pdFVSTCA9IHVybDtcblxuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICBtZXNzYWdlOiBcIl9fVkFOREFMX19OQVZfX0NPTU1JVFwiLFxuICAgICAgZGF0YToge1xuICAgICAgICB1cmwsXG4gICAgICAgIHR5cGU6XG4gICAgICAgICAgaXNNYW51YWxUcmFuc2l0aW9uICYmIHRyYW5zaXRpb25UeXBlUXVhbGlmaWVyICE9PSBcInJlZGlyZWN0XCIgP1xuICAgICAgICAgICAgXCJtYW51YWxcIiA6XG4gICAgICAgICAgICB0cmFuc2l0aW9uVHlwZVF1YWxpZmllclxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGlzTWFudWFsVHJhbnNpdGlvbikge1xuICAgICAgaXNNYW51YWxUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIGRvbUxvYWRIYW5kbGVyID0gKGRldGFpbHMpID0+IHtcbiAgICBjb25zdCB7IHRhYklkLCBmcmFtZUlkIH0gPSBkZXRhaWxzO1xuICAgIGlmICghaXNWYWxpZFRhYih0YWJJZCkgfHwgIWlzVmFsaWRGcmFtZSh0YWJJZCwgZnJhbWVJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2coXCJEb20gTG9hZGVkXCIpO1xuXG4gICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCh0YWJJZCwge1xuICAgICAgZmlsZTogXCJmcmFtZS5qc1wiLFxuICAgICAgZnJhbWVJZCxcbiAgICAgIG1hdGNoQWJvdXRCbGFuazogdHJ1ZVxuICAgIH0pO1xuICB9O1xuXG4gIGNvbXBsZXRlZEhhbmRsZXIgPSAoZGV0YWlscykgPT4ge1xuICAgIGNvbnN0IHsgdGFiSWQsIGZyYW1lSWQsIHVybCB9ID0gZGV0YWlscztcblxuICAgIGlmICghaXNWYWxpZFRhYih0YWJJZCkgfHwgIWlzVmFsaWRGcmFtZSh0YWJJZCwgZnJhbWVJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2coXCJDb21wbGV0ZWRcIik7XG5cbiAgICBjb21taXRVUkwgPSBudWxsO1xuICAgIGhhc05hdmlnYXRpb25Db21wbGV0ZWQgPSB0cnVlO1xuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICBtZXNzYWdlOiBcIl9fVkFOREFMX19OQVZfX0NPTVBMRVRFXCIsXG4gICAgICBkYXRhOiB7IHVybCB9XG4gICAgfSk7XG4gIH07XG5cbiAgaGlzdG9yeUhhbmRsZXIgPSAoZGV0YWlscykgPT4ge1xuICAgIGNvbnN0IHsgdGFiSWQsIGZyYW1lSWQsIHBhcmVudEZyYW1lSWQgfSA9IGRldGFpbHM7XG4gICAgaWYgKCFpc1ZhbGlkVGFiKHRhYklkKSB8fCAhaXNWYWxpZEZyYW1lKHRhYklkLCBmcmFtZUlkLCBwYXJlbnRGcmFtZUlkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgdXJsLCB0cmFuc2l0aW9uUXVhbGlmaWVycywgdHJhbnNpdGlvblR5cGUgfSA9IGRldGFpbHM7XG5cbiAgICAvLyBpZiBhbHJlYWR5IGNvbW1pdGVkLCB0aGVuIHJldHVyblxuICAgIGlmIChjb21taXRVUkwgPT09IHVybC5yZXBsYWNlKC9pZl98JmZlYXR1cmU9eW91dHUuYmUvZywgXCJcIikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2coXCJIaXN0b3J5IENoYW5nZVwiKTtcblxuICAgIGhhc05hdmlnYXRpb25Db21wbGV0ZWQgPSB0cnVlO1xuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICBtZXNzYWdlOiBcIl9fVkFOREFMX19OQVZfX0hJU1RPUllDSEFOR0VcIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdXJsLFxuICAgICAgICB0eXBlOiBnZXRUcmFuc2l0aW9uVHlwZSh0cmFuc2l0aW9uUXVhbGlmaWVycywgdHJhbnNpdGlvblR5cGUsIHVybClcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBlcnJvckhhbmRsZXIgPSAoZGV0YWlscykgPT4ge1xuICAgIGNvbnN0IHsgdGFiSWQsIGZyYW1lSWQsIHVybCB9ID0gZGV0YWlscztcbiAgICBpZiAoIWlzVmFsaWRUYWIodGFiSWQpIHx8ICFpc1ZhbGlkRnJhbWUodGFiSWQsIGZyYW1lSWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbG9nKFwiTmF2aWdhdGlvbiBFcnJvclwiKTtcblxuICAgIGhhc05hdmlnYXRpb25Db21wbGV0ZWQgPSB0cnVlO1xuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICBtZXNzYWdlOiBcIl9fVkFOREFMX19OQVZfX0VSUk9SXCIsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGVycm9yOiBkZXRhaWxzLmVycm9yLFxuICAgICAgICB1cmxcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vc2VnbWVudGlvL2Nocm9tZS1zaWRlYmFyL2Jsb2IvYWU5ZjA3ZTk3YmIwODkyNzYzMWQxZjJlYjVmYjMxZTk2NTk1OWJkZS9leGFtcGxlcy9naXRodWItdHJlbmRpbmcvc3JjL2JhY2tncm91bmQuanNcbiAgaGVhZGVyUmVjZWl2ZWRIYW5kbGVyID0gKGRldGFpbHMpID0+IHtcbiAgICBsb2coXCJIZWFkZXIgUmVjZWl2ZWRcIik7XG5cbiAgICAvLyBSZXR1cm4gb24geW91dHViZSB2aWRlbyBvciBpbnZhbGlkIHN1Yi1mcmFtZXNcbiAgICBpZiAoZGV0YWlscy51cmwuaW5kZXhPZihcIi5nb29nbGV2aWRlby5jb20vdmlkZW9wbGF5YmFja1wiKSA+IC0xIHx8XG4gICAgIShpc1ZhbGlkVGFiKGRldGFpbHMudGFiSWQpICYmIGlzVmFsaWRGcmFtZShkZXRhaWxzLnRhYklkLCBkZXRhaWxzLmZyYW1lSWQpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgZGV0YWlscy5zdGF0dXNDb2RlID09PSAzMDIgJiZcbiAgICAgIGRldGFpbHMudHlwZSA9PT0gXCJzdWJfZnJhbWVcIiAmJlxuICAgICAgQXJyYXkuaXNBcnJheShkZXRhaWxzLnJlc3BvbnNlSGVhZGVycykgJiZcbiAgICAgIGRldGFpbHMucmVzcG9uc2VIZWFkZXJzLnNvbWUoKGhlYWRlcikgPT4gaGVhZGVyLm5hbWUgPT09IFwieC10c1wiICYmIGhlYWRlci52YWx1ZSA9PT0gXCIzMDJcIilcbiAgICApIHtcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGRldGFpbHMudGFiSWQsIHtcbiAgICAgICAgbWVzc2FnZTogXCJfX1ZBTkRBTF9fTkFWX19SRURJUkVDVFwiLFxuICAgICAgICBkYXRhOiB7IHVybDogZGV0YWlscy51cmwgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2VIZWFkZXJzID0gZGV0YWlscy5yZXNwb25zZUhlYWRlcnMubWFwKChtaGVhZGVyKSA9PiB7XG4gICAgICBjb25zdCBoZWFkZXIgPSBtaGVhZGVyO1xuICAgICAgY29uc3QgaXNDU1BIZWFkZXIgPSAvY29udGVudC1zZWN1cml0eS1wb2xpY3kvaS50ZXN0KGhlYWRlci5uYW1lKTtcbiAgICAgIGNvbnN0IGlzRnJhbWVIZWFkZXIgPSAvXngtZnJhbWUtb3B0aW9ucy9pLnRlc3QoaGVhZGVyLm5hbWUpO1xuICAgICAgY29uc3QgaXNYU1NIZWFkZXIgPSAvXngteHNzLXByb3RlY3Rpb24vaS50ZXN0KGhlYWRlci5uYW1lKTtcbiAgICAgIGNvbnN0IGlzT3JpZ2luSGVhZGVyID0gL15hY2Nlc3MtY29udHJvbC1hbGxvdy1vcmlnaW4vaS50ZXN0KGhlYWRlci5uYW1lKTtcbiAgICAgIGlmIChpc0NTUEhlYWRlcikge1xuICAgICAgICBsZXQgY3NwID0gaGVhZGVyLnZhbHVlO1xuICAgICAgICBjc3AgPSBjc3AucmVwbGFjZSgvZnJhbWUtYW5jZXN0b3JzICgoLio/KTt8J25vbmUnfCdzZWxmJykvZ2ksIFwiXCIpO1xuICAgICAgICBpZiAoY3NwLmluZGV4T2YoXCJ3ZWIuYXJjaGl2ZS5vcmdcIikgPT09IC0xKSB7XG4gICAgICAgICAgY3NwID0gY3NwLnJlcGxhY2UoXG4gICAgICAgICAgICAvZGVmYXVsdC1zcmMgKC4qPyk7L2dpLFxuICAgICAgICAgICAgXCJkZWZhdWx0LXNyYyAkMSB3ZWIuYXJjaGl2ZS5vcmc7XCJcbiAgICAgICAgICApO1xuICAgICAgICAgIGNzcCA9IGNzcC5yZXBsYWNlKFxuICAgICAgICAgICAgL2Nvbm5lY3Qtc3JjICguKj8pOy9naSxcbiAgICAgICAgICAgIFwiY29ubmVjdC1zcmMgJDEgaHR0cHM6Ly93ZWIuYXJjaGl2ZS5vcmc7XCJcbiAgICAgICAgICApO1xuICAgICAgICAgIGNzcCA9IGNzcC5yZXBsYWNlKFxuICAgICAgICAgICAgL3NjcmlwdC1zcmMgKC4qPyk7L2dpLFxuICAgICAgICAgICAgXCJzY3JpcHQtc3JjICQxIGh0dHBzOi8vd2ViLmFyY2hpdmUub3JnO1wiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjc3AgPSBjc3AucmVwbGFjZShcbiAgICAgICAgICAgIC9zdHlsZS1zcmMgKC4qPyk7L2dpLFxuICAgICAgICAgICAgXCJzdHlsZS1zcmMgJDEgaHR0cHM6Ly93ZWIuYXJjaGl2ZS5vcmc7XCJcbiAgICAgICAgICApO1xuICAgICAgICAgIGNzcCA9IGNzcC5yZXBsYWNlKFxuICAgICAgICAgICAgL2ZyYW1lLXNyYyAoLio/KTsvZ2ksXG4gICAgICAgICAgICBcImZyYW1lLXNyYyAkMSBodHRwczovL3dlYi5hcmNoaXZlLm9yZztcIlxuICAgICAgICAgICk7XG4gICAgICAgICAgY3NwID0gY3NwLnJlcGxhY2UoL2ZyYW1lLWFuY2VzdG9ycyAoLio/KSQvZ2ksIFwiZnJhbWUtYW5jZXN0b3JzICpcIik7XG4gICAgICAgIH1cbiAgICAgICAgaGVhZGVyLnZhbHVlID0gY3NwO1xuICAgICAgfSBlbHNlIGlmIChpc0ZyYW1lSGVhZGVyKSB7XG4gICAgICAgIGhlYWRlci52YWx1ZSA9IFwiQUxMT1dBTExcIjtcbiAgICAgIH0gZWxzZSBpZiAoaXNYU1NIZWFkZXIpIHtcbiAgICAgICAgaGVhZGVyLnZhbHVlID0gXCIwXCI7XG4gICAgICB9IGVsc2UgaWYgKGlzT3JpZ2luSGVhZGVyKSB7XG4gICAgICAgIGhlYWRlci52YWx1ZSA9IGRldGFpbHMuaW5pdGlhdG9yIHx8IFwiKlwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaGVhZGVyO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHsgcmVzcG9uc2VIZWFkZXJzIH07XG4gIH07XG5cbiAgYmVmb3JlUmVkaXJlY3RIYW5kbGVyID0gKGRldGFpbHMpID0+IHtcbiAgICBjb25zdCB7IGluaXRpYXRvciwgcmVkaXJlY3RVcmwsIHRhYklkIH0gPSBkZXRhaWxzO1xuICAgIGlmIChpbml0aWF0b3IuaW5kZXhPZihcImNocm9tZS1leHRlbnNpb246Ly9cIikgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVkaXJlY3RIb3N0ID0gbmV3IFVSTChyZWRpcmVjdFVybCkuaG9zdDtcbiAgICAgIGNvbnN0IGluaXRpYXRvckhvc3QgPSBuZXcgVVJMKGluaXRpYXRvcikuaG9zdDtcbiAgICAgIGlmIChyZWRpcmVjdEhvc3QgIT09IGluaXRpYXRvckhvc3QpIHtcbiAgICAgICAgbG9nKFwiQmVmb3JlIFJlZGlyZWN0XCIsIGRldGFpbHMudXJsLCBkZXRhaWxzKTtcblxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICAgIG1lc3NhZ2U6IFwiX19WQU5EQUxfX05BVl9fUkVESVJFQ1RNSVNNQVRDSFwiLFxuICAgICAgICAgIGRhdGE6IHsgcmVkaXJlY3RIb3N0LCBpbml0aWF0b3JIb3N0IH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJiZWZvcmVSZWRpcmVjdEhhbmRsZXI6IEVycm9yIHBhcnNpbmcgdXJsXCIpO1xuICAgIH1cbiAgfTtcblxuICBvblJlcXVlc3RDb21wbGV0ZWRIYW5kbGVyID0gKGRldGFpbHMpID0+IHtcbiAgICBsb2coXCJSZXF1ZXN0IENvbXBsZXRlZFwiLCBkZXRhaWxzLnVybCwgZGV0YWlscyk7XG5cbiAgICBpZiAoXG4gICAgICBpc1ZhbGlkVGFiKGRldGFpbHMudGFiSWQpICYmXG4gICAgICBpc1ZhbGlkRnJhbWUoZGV0YWlscy50YWJJZCwgZGV0YWlscy5mcmFtZUlkKSAmJlxuICAgICAgZGV0YWlscy5zdGF0dXNDb2RlID49IDQwMCAmJlxuICAgICAgZGV0YWlscy51cmwuaW5kZXhPZihcIndlYi5hcmNoaXZlLm9yZy93ZWJcIikgPCAwXG4gICAgKSB7XG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShkZXRhaWxzLnRhYklkLCB7XG4gICAgICAgIG1lc3NhZ2U6IFwiX19WQU5EQUxfX05BVl9fTk9URk9VTkRcIixcbiAgICAgICAgZGF0YTogeyB1cmw6IGRldGFpbHMudXJsIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICB0YWJSZXBsYWNlZEhhbmRsZXIgPSAoZGV0YWlscykgPT4ge1xuICAgIGxvZyhcIlRhYiBSZXBsYWNlZFwiLCBkZXRhaWxzKTtcbiAgfTtcbn1cblxuY29uc3QgcmVxdWVzdEZpbHRlcnMgPSBbXCJodHRwOi8vKi8qXCIsIFwiaHR0cHM6Ly8qLypcIl07XG5cbmNvbnN0IGV2ZW50TWFwID0ge1xuICBvbkhlYWRlcnNSZWNlaXZlZDoge1xuICAgIHR5cGU6IFwid2ViUmVxdWVzdFwiLFxuICAgIGhhbmRsZXI6IFwiaGVhZGVyUmVjZWl2ZWRIYW5kbGVyXCIsXG4gICAgb3B0aW9uczoge1xuICAgICAgdXJsczogcmVxdWVzdEZpbHRlcnMsXG4gICAgICB0eXBlczogW1wic3ViX2ZyYW1lXCJdXG4gICAgfSxcbiAgICBleHRyYXM6IFtcImJsb2NraW5nXCIsIFwicmVzcG9uc2VIZWFkZXJzXCIsIFwiZXh0cmFIZWFkZXJzXCJdXG4gIH0sXG4gIG9uQmVmb3JlUmVkaXJlY3Q6IHtcbiAgICB0eXBlOiBcIndlYlJlcXVlc3RcIixcbiAgICBoYW5kbGVyOiBcImJlZm9yZVJlZGlyZWN0SGFuZGxlclwiLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHVybHM6IHJlcXVlc3RGaWx0ZXJzLFxuICAgICAgdHlwZXM6IFtcInN1Yl9mcmFtZVwiXVxuICAgIH0sXG4gICAgZXh0cmFzOiBbXCJyZXNwb25zZUhlYWRlcnNcIl1cbiAgfSxcbiAgb25SZXF1ZXN0Q29tcGxldGVkOiB7XG4gICAgbmFtZTogXCJvbkNvbXBsZXRlZFwiLFxuICAgIHR5cGU6IFwid2ViUmVxdWVzdFwiLFxuICAgIGhhbmRsZXI6IFwib25SZXF1ZXN0Q29tcGxldGVkSGFuZGxlclwiLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHVybHM6IHJlcXVlc3RGaWx0ZXJzLFxuICAgICAgdHlwZXM6IFtcInN1Yl9mcmFtZVwiXVxuICAgIH1cbiAgfSxcbiAgb25CZWZvcmVOYXZpZ2F0ZToge1xuICAgIHR5cGU6IFwid2ViTmF2aWdhdGlvblwiLFxuICAgIGhhbmRsZXI6IFwiYmVmb3JlTmF2aWdhdGVIYW5kbGVyXCIsXG4gICAgb3B0aW9uczoge1xuICAgICAgdXJsczogcmVxdWVzdEZpbHRlcnMsXG4gICAgICB0eXBlczogW1wic3ViX2ZyYW1lXCJdXG4gICAgfVxuICB9LFxuICBvbkNvbW1pdHRlZDoge1xuICAgIHR5cGU6IFwid2ViTmF2aWdhdGlvblwiLFxuICAgIGhhbmRsZXI6IFwiY29tbWl0SGFuZGxlclwiXG4gIH0sXG4gIG9uRE9NQ29udGVudExvYWRlZDoge1xuICAgIHR5cGU6IFwid2ViTmF2aWdhdGlvblwiLFxuICAgIGhhbmRsZXI6IFwiZG9tTG9hZEhhbmRsZXJcIlxuICB9LFxuICBvbkNvbXBsZXRlZDoge1xuICAgIHR5cGU6IFwid2ViTmF2aWdhdGlvblwiLFxuICAgIGhhbmRsZXI6IFwiY29tcGxldGVkSGFuZGxlclwiXG4gIH0sXG4gIG9uRXJyb3JPY2N1cnJlZDoge1xuICAgIHR5cGU6IFwid2ViUmVxdWVzdFwiLFxuICAgIGhhbmRsZXI6IFwiZXJyb3JIYW5kbGVyXCIsXG4gICAgb3B0aW9uczoge1xuICAgICAgdXJsczogcmVxdWVzdEZpbHRlcnMsXG4gICAgICB0eXBlczogW1wic3ViX2ZyYW1lXCJdXG4gICAgfVxuICB9LFxuICBvbkhpc3RvcnlTdGF0ZVVwZGF0ZWQ6IHtcbiAgICB0eXBlOiBcIndlYk5hdmlnYXRpb25cIixcbiAgICBoYW5kbGVyOiBcImhpc3RvcnlIYW5kbGVyXCIsXG4gICAgb3B0aW9uczoge1xuICAgICAgdXJsczogcmVxdWVzdEZpbHRlcnMsXG4gICAgICB0eXBlczogW1wic3ViX2ZyYW1lXCJdXG4gICAgfVxuICB9LFxuICBvblRhYlJlcGxhY2VkOiB7XG4gICAgdHlwZTogXCJ3ZWJOYXZpZ2F0aW9uXCIsXG4gICAgaGFuZGxlcjogXCJ0YWJSZXBsYWNlZEhhbmRsZXJcIlxuICB9XG59O1xuXG5sZXQgbmF2aWdhdGlvbkhhbmRsZXI7XG5cbmZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycygpIHtcbiAgaWYgKCFuYXZpZ2F0aW9uSGFuZGxlcikgcmV0dXJuO1xuICBsb2coXCJSZW1vdmUgTGlzdGVuZXJzXCIpO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgZm9yIChjb25zdCBbZXZlbnQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhldmVudE1hcCkpIHtcbiAgICBjaHJvbWVbdmFsdWUudHlwZV1bdmFsdWUubmFtZSB8fCBldmVudF0ucmVtb3ZlTGlzdGVuZXIoXG4gICAgICBuYXZpZ2F0aW9uSGFuZGxlclt2YWx1ZS5oYW5kbGVyXVxuICAgICk7XG4gIH1cbiAgbmF2aWdhdGlvbkhhbmRsZXIgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoKSB7XG4gIGlmIChuYXZpZ2F0aW9uSGFuZGxlcikgcmV0dXJuO1xuICBuYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcigpO1xuICBsb2coXCJBZGQgTGlzdGVuZXJzXCIpO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgZm9yIChjb25zdCBbZXZlbnQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhldmVudE1hcCkpIHtcbiAgICBpZiAodmFsdWUudHlwZSAhPT0gXCJ3ZWJSZXF1ZXN0XCIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWNocm9tZS53ZWJOYXZpZ2F0aW9uW3ZhbHVlLm5hbWUgfHwgZXZlbnRdLmhhc0xpc3RlbmVyKFxuICAgICAgICAgIG5hdmlnYXRpb25IYW5kbGVyW3ZhbHVlLmhhbmRsZXJdXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICBjaHJvbWUud2ViTmF2aWdhdGlvblt2YWx1ZS5uYW1lIHx8IGV2ZW50XS5hZGRMaXN0ZW5lcihcbiAgICAgICAgICBuYXZpZ2F0aW9uSGFuZGxlclt2YWx1ZS5oYW5kbGVyXVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICAhY2hyb21lLndlYlJlcXVlc3RbdmFsdWUubmFtZSB8fCBldmVudF0uaGFzTGlzdGVuZXIoXG4gICAgICAgIG5hdmlnYXRpb25IYW5kbGVyW3ZhbHVlLmhhbmRsZXJdXG4gICAgICApXG4gICAgKSB7XG4gICAgICBjaHJvbWUud2ViUmVxdWVzdFt2YWx1ZS5uYW1lIHx8IGV2ZW50XS5hZGRMaXN0ZW5lcihcbiAgICAgICAgbmF2aWdhdGlvbkhhbmRsZXJbdmFsdWUuaGFuZGxlcl0sXG4gICAgICAgIHZhbHVlLm9wdGlvbnMsXG4gICAgICAgIHZhbHVlLmV4dHJhc1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgY2hyb21lLnRhYnMub25BY3RpdmF0ZWQuYWRkTGlzdGVuZXIoKGFjdGl2ZUluZm8pID0+IHtcbiAgICBsb2coXCJUYWIgYWN0aXZhdGVkXCIpO1xuICAgIGNvbnN0IHsgdGFiSWQgfSA9IGFjdGl2ZUluZm87XG4gICAgaWYgKFxuICAgICAgaGFzVmFsaWRUYWJzKCkgJiZcbiAgICAgICFpc1ZhbGlkVGFiKHRhYklkKSAmJlxuICAgICAgZ2V0V2luZG93Q291bnQoKSA9PT0gMSAmJlxuICAgICAgaGFzTmF2aWdhdGlvbkNvbXBsZXRlZFxuICAgICkge1xuICAgICAgbG9nKFwiVGFiIGFjdGl2YXRlZDogaW52YWxpZFwiKTtcbiAgICAgIHJlbW92ZUxpc3RlbmVycygpO1xuICAgIH0gZWxzZSBpZiAoaXNWYWxpZFRhYih0YWJJZCkpIHtcbiAgICAgIGxvZyhcIlRhYiBhY3RpdmF0ZWQ6IHZhbGlkXCIsIHRhYklkKTtcbiAgICAgIGFkZExpc3RlbmVycygpO1xuICAgIH1cbiAgfSk7XG5cbiAgY2hyb21lLnRhYnMub25SZW1vdmVkLmFkZExpc3RlbmVyKCh0YWJJZCkgPT4ge1xuICAgIGxvZyhcIlRhYnMgcmVtb3ZlZDogXCIsIHRhYklkKTtcbiAgICBpZiAoIWlzVmFsaWRUYWIodGFiSWQpKSByZXR1cm47XG4gICAgaWYgKGlzVmFsaWRUYWIodGFiSWQpKSB7XG4gICAgICB2YWxpZFRhYnNbdGFiSWRdID0gbnVsbDtcbiAgICAgIGRlbGV0ZSB2YWxpZFRhYnNbdGFiSWRdO1xuICAgIH1cbiAgICBjaHJvbWUudGFicy5xdWVyeShcbiAgICAgIHtcbiAgICAgICAgYWN0aXZlOiB0cnVlXG4gICAgICB9LFxuICAgICAgKHRhYnMpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkVGFiKHRhYnNbMF0uaWQpKSB7XG4gICAgICAgICAgbG9nKFwib25SZW1vdmVkIGhhbmRsZXJcIik7XG4gICAgICAgICAgcmVtb3ZlTGlzdGVuZXJzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9KTtcbn1cblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBjb25zdCB7IG1lc3NhZ2UgfSA9IHJlcXVlc3Q7XG4gIGNvbnN0IGN1cnJUYWIgPSBzZW5kZXIudGFiO1xuICBjb25zdCB0YWJJZCA9IGN1cnJUYWIuaWQ7XG4gIGlmIChtZXNzYWdlID09PSBcIl9fVkFOREFMX19DTElFTlRfX0xPQURFRFwiKSB7XG4gICAgY29uc3QgbWF0Y2hUYWIgPSB2YWxpZFRhYnNbdGFiSWRdO1xuICAgIGNvbnN0IHsgaG9zdCB9ID0gbmV3IFVSTChjdXJyVGFiLnVybCk7XG4gICAgaWYgKG1hdGNoVGFiICYmIG1hdGNoVGFiLmhvc3QgPT09IGhvc3QpIHtcbiAgICAgIG1hdGNoVGFiLmZyYW1lcyA9IFtdO1xuICAgICAgbWF0Y2hUYWIucGFyZW50RnJhbWVJZCA9IG51bGw7XG4gICAgICByZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICAgIGFkZExpc3RlbmVycygpO1xuICAgICAgc2VuZFJlc3BvbnNlKHsgbWVzc2FnZTogXCJfX19WQU5EQUxfX0JHX19TRVRVUERPTkVcIiB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YWxpZFRhYnNbdGFiSWRdID0ge1xuICAgICAgdXJsOiBjdXJyVGFiLnVybCxcbiAgICAgIGZyYW1lczogW10sXG4gICAgICBob3N0LFxuICAgICAgd2luZG93SWQ6IGN1cnJUYWIud2luZG93SWRcbiAgICB9O1xuICAgIHJlbW92ZUxpc3RlbmVycygpO1xuICAgIGFkZExpc3RlbmVycygpO1xuICAgIHNlbmRSZXNwb25zZSh7IG1lc3NhZ2U6IFwiX19fVkFOREFMX19CR19fU0VUVVBET05FXCIgfSk7XG4gIH0gZWxzZSBpZiAobWVzc2FnZSA9PT0gXCJfX19WQU5EQUxfX0NMSUVOVF9fRVhJVFwiKSB7XG4gICAgaWYgKGdldFdpbmRvd0NvdW50KCkgPT09IDEpIHtcbiAgICAgIHJlbW92ZUxpc3RlbmVycygpO1xuICAgIH1cbiAgICB2YWxpZFRhYnNbdGFiSWRdID0gbnVsbDtcbiAgICBkZWxldGUgdmFsaWRUYWJzW3RhYklkXTtcbiAgfSBlbHNlIGlmIChtZXNzYWdlID09PSBcIl9fX1ZBTkRBTF9fQ0xJRU5UX19DSEVDS1ZBTElEXCIpIHtcbiAgICAvLyBJZiBwYWdlIG5vdCBuYXZpZ2F0ZWQgeWV0LCB0aGVuIHJldHVyblxuICAgIGlmICghaXNCZWZvcmVOYXZpZ2F0ZSkgcmV0dXJuIG51bGw7XG4gICAgc2VuZFJlc3BvbnNlKHsgaXNWYWxpZDogQm9vbGVhbih2YWxpZFRhYnNbdGFiSWRdKSB9KTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5sZXQgaXNCcm93c2VyQWN0aW9uQ2xpY2tlZCA9IGZhbHNlO1xuY2hyb21lLmJyb3dzZXJBY3Rpb24ub25DbGlja2VkLmFkZExpc3RlbmVyKCgpID0+IHtcbiAgY2hyb21lLnRhYnMucXVlcnkoXG4gICAge1xuICAgICAgYWN0aXZlOiB0cnVlXG4gICAgfSxcbiAgICAoKSA9PiB7XG4gICAgICBpZiAoIWlzQnJvd3NlckFjdGlvbkNsaWNrZWQpIHtcbiAgICAgICAgaXNCcm93c2VyQWN0aW9uQ2xpY2tlZCA9IHRydWU7XG4gICAgICAgIGluaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiIn0=