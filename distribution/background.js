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
/******/ 	return __webpack_require__(__webpack_require__.s = "./source/background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webext-content-script-ping/webext-content-script-ping.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/webext-content-script-ping/webext-content-script-ping.js ***!
  \*******************************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/bfred-it/webext-content-script-ping

/**
 * Ping responder
 */
document.__webextContentScriptLoaded = true;

/**
 * Pinger
 */
function pingContentScript(tab) {
	return new Promise((resolve, reject) => {
		chrome.tabs.executeScript(tab.id || tab, {
			code: 'document.__webextContentScriptLoaded',
			runAt: 'document_start'
		}, hasScriptAlready => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(Boolean(hasScriptAlready[0]));
			}
		});
	});
}

if (true) {
	module.exports = pingContentScript;
}


/***/ }),

/***/ "./node_modules/webext-domain-permission-toggle/webext-domain-permission-toggle.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/webext-domain-permission-toggle/webext-domain-permission-toggle.js ***!
  \*****************************************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/bfred-it/webext-domain-permission-toggle

const DCE = {
	addContextMenu(options) {
		const contextMenuId = 'webext-domain-permission-toggle:add-permission';

		const {name: extensionName} = chrome.runtime.getManifest();

		options = Object.assign({
			title: `Enable ${extensionName} on this domain`,
			reloadOnSuccess: `Do you want to reload this page to apply ${extensionName}?`
		}, options);

		// This has to happen onInstalled in Event Pages
		chrome.runtime.onInstalled.addListener(() => {
			chrome.contextMenus.create({
				id: contextMenuId,
				title: options.title,
				contexts: ['page_action', 'browser_action'],
				documentUrlPatterns: [
					'http://*/*',
					'https://*/*'
				]
			});
		});

		chrome.contextMenus.onClicked.addListener(async ({menuItemId}, {tabId, url}) => {
			if (menuItemId !== contextMenuId) {
				return;
			}
			chrome.permissions.request({
				origins: [
					`${new URL(url).origin}/*`
				]
			}, granted => {
				if (chrome.runtime.lastError) {
					console.error(`Error: ${chrome.runtime.lastError.message}`);
					alert(`Error: ${chrome.runtime.lastError.message}`);
				} else if (granted && options.reloadOnSuccess && confirm(options.reloadOnSuccess)) {
					chrome.tabs.reload(tabId);
				}
			});
		});
	}
};

if (true) {
	module.exports = DCE;
}


/***/ }),

/***/ "./node_modules/webext-dynamic-content-scripts/src/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/webext-dynamic-content-scripts/src/index.js ***!
  \******************************************************************/
/*! exports provided: addToTab, addToFutureTabs, default */
/*! ModuleConcatenation bailout: Module is referenced from these modules with unsupported syntax: ./source/background.js (referenced with cjs require), ./source/content.js (referenced with cjs require) */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addToTab", function() { return addToTab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addToFutureTabs", function() { return addToFutureTabs; });
/* harmony import */ var webext_content_script_ping__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webext-content-script-ping */ "./node_modules/webext-content-script-ping/webext-content-script-ping.js");
/* harmony import */ var webext_content_script_ping__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webext_content_script_ping__WEBPACK_IMPORTED_MODULE_0__);


async function p(fn, ...args) {
	return new Promise((resolve, reject) => fn(...args, r => {
		if (chrome.runtime.lastError) {
			reject(chrome.runtime.lastError);
		} else {
			resolve(r);
		}
	}));
}

async function addToTab(tab, contentScripts) {
	if (typeof tab !== 'object' && typeof tab !== 'number') {
		throw new TypeError('Specify a Tab or tabId');
	}

	if (!contentScripts) {
		// Get all scripts from manifest.json
		contentScripts = chrome.runtime.getManifest().content_scripts;
	} else if (!Array.isArray(contentScripts)) {
		// Single script object, make it an array
		contentScripts = [contentScripts];
	}

	try {
		const tabId = tab.id || tab;
		if (!await webext_content_script_ping__WEBPACK_IMPORTED_MODULE_0___default()(tabId)) {
			const injections = [];
			for (const group of contentScripts) {
				const allFrames = group.all_frames;
				const runAt = group.run_at;
				for (const file of group.css) {
					injections.push(p(chrome.tabs.insertCSS, tabId, {file, allFrames, runAt}));
				}
				for (const file of group.js) {
					injections.push(p(chrome.tabs.executeScript, tabId, {file, allFrames, runAt}));
				}
			}
			return Promise.all(injections);
		}
	} catch (err) {
		// Probably the domain isn't permitted.
		// It's easier to catch this than do 2 queries
	}
}

function addToFutureTabs(scripts) {
	chrome.tabs.onUpdated.addListener((tabId, {status}) => {
		if (status === 'loading') {
			addToTab(tabId, scripts);
		}
	});
}

/* harmony default export */ __webpack_exports__["default"] = ({
	addToTab,
	addToFutureTabs
});


/***/ }),

/***/ "./node_modules/webext-options-sync/webext-options-sync.js":
/*!*****************************************************************!*\
  !*** ./node_modules/webext-options-sync/webext-options-sync.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/bfred-it/webext-options-sync

class OptionsSync {
	constructor(storageName = 'options') {
		this.storageName = storageName;
	}

	define(defs) {
		defs = Object.assign({
			defaults: {},
			migrations: [],
		}, defs);

		if (chrome.runtime.onInstalled) { // In background script
			chrome.runtime.onInstalled.addListener(() => this._applyDefinition(defs));
		} else { // In content script, discouraged
			this._applyDefinition(defs);
		}
	}

	async _applyDefinition(defs) {
		const options = Object.assign({}, defs.defaults, await this.getAll());

		console.group('Appling definitions');
		console.info('Current options:', options);
		if (defs.migrations.length > 0) {
			console.info('Running', defs.migrations.length, 'migrations');
			defs.migrations.forEach(migrate => migrate(options, defs.defaults));
		}
		console.groupEnd();

		this.setAll(options);
	}

	_parseNumbers(options) {
		for (const name of Object.keys(options)) {
			if (options[name] === String(Number(options[name]))) {
				options[name] = Number(options[name]);
			}
		}
		return options;
	}

	getAll() {
		return new Promise(resolve => {
			chrome.storage.sync.get(this.storageName,
				keys => resolve(keys[this.storageName] || {})
			);
		}).then(this._parseNumbers);
	}

	setAll(newOptions) {
		return new Promise(resolve => {
			chrome.storage.sync.set({
				[this.storageName]: newOptions,
			}, resolve);
		});
	}

	async set(newOptions) {
		const options = await this.getAll();
		this.setAll(Object.assign(options, newOptions));
	}

	syncForm(form) {
		if (typeof form === 'string') {
			form = document.querySelector(form);
		}
		this.getAll().then(options => OptionsSync._applyToForm(options, form));
		form.addEventListener('input', e => this._handleFormUpdates(e));
		form.addEventListener('change', e => this._handleFormUpdates(e));
		chrome.storage.onChanged.addListener((changes, namespace) => {
			if (namespace === 'sync') {
				for (const key of Object.keys(changes)) {
					const {newValue} = changes[key];
					if (key === this.storageName) {
						OptionsSync._applyToForm(newValue, form);
						return;
					}
				}
			}
		});
	}

	static _applyToForm(options, form) {
		console.group('Updating form');
		for (const name of Object.keys(options)) {
			const els = form.querySelectorAll(`[name="${name}"]`);
			const [field] = els;
			if (field) {
				console.info(name, ':', options[name]);
				switch (field.type) {
					case 'checkbox':
						field.checked = options[name];
						break;
					case 'radio': {
						const [selected] = [...els].filter(el => el.value === options[name]);
						if (selected) {
							selected.checked = true;
						}
						break;
					}
					default:
						field.value = options[name];
						break;
				}
			} else {
				console.warn('Stored option {', name, ':', options[name], '} was not found on the page');
			}
		}
		console.groupEnd();
	}

	_handleFormUpdates({target: el}) {
		const {name} = el;
		let {value} = el;
		if (!name || !el.validity.valid) {
			return;
		}
		switch (el.type) {
			case 'select-one':
				value = el.options[el.selectedIndex].value; // eslint-disable-line prefer-destructuring
				break;
			case 'checkbox':
				value = el.checked;
				break;
			default: break;
		}
		console.info('Saving option', el.name, 'to', value);
		this.set({
			[name]: value,
		});
	}
}

OptionsSync.migrations = {
	removeUnused(options, defaults) {
		for (const key of Object.keys(options)) {
			if (!(key in defaults)) {
				delete options[key];
			}
		}
	}
};

if (typeof HTMLElement !== 'undefined') {
	class OptionsSyncElement extends HTMLElement {
		constructor() {
			super();
			new OptionsSync(this.getAttribute('storageName') || undefined).syncForm(this);
		}
	}
	try {
		customElements.define('options-sync', OptionsSyncElement);
	} catch (err) {/* */}
}

if (true) {
	module.exports = OptionsSync;
}


/***/ }),

/***/ "./source/background.js":
/*!******************************!*\
  !*** ./source/background.js ***!
  \******************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _webextOptionsSync = __webpack_require__(/*! webext-options-sync */ "./node_modules/webext-options-sync/webext-options-sync.js");

var _webextOptionsSync2 = _interopRequireDefault(_webextOptionsSync);

var _webextDomainPermissionToggle = __webpack_require__(/*! webext-domain-permission-toggle */ "./node_modules/webext-domain-permission-toggle/webext-domain-permission-toggle.js");

var _webextDomainPermissionToggle2 = _interopRequireDefault(_webextDomainPermissionToggle);

var _webextDynamicContentScripts = __webpack_require__(/*! webext-dynamic-content-scripts */ "./node_modules/webext-dynamic-content-scripts/src/index.js");

var _webextDynamicContentScripts2 = _interopRequireDefault(_webextDynamicContentScripts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// // Define defaults
// new OptionsSync().define({
// 	defaults: {
// 		disabledFeatures: '',
// 		customCSS: '',
// 		personalToken: '',
// 		logging: false
// 	},
// 	migrations: [
// 		// Migration example:
// 		options => {
// 			// #1330
// 			options.disabledFeatures = options.disabledFeatures.replace('move-account-switcher-to-sidebar', '');
// 		},
// 		OptionsSync.migrations.removeUnused
// 	]
// });

// browser.runtime.onMessage.addListener(async message => {
// 	if (!message || message.action !== 'openAllInTabs') {
// 		return;
// 	}
// 	const [currentTab] = await browser.tabs.query({currentWindow: true, active: true});
// 	for (const [i, url] of message.urls.entries()) {
// 		browser.tabs.create({
// 			url,
// 			index: currentTab.index + i + 1,
// 			active: false
// 		});
// 	}
// });

// browser.runtime.onInstalled.addListener(async ({reason}) => {
// 	// Cleanup old key
// 	// TODO: remove in the future
// 	browser.storage.local.remove('userWasNotified');

// 	// Only notify on install
// 	if (reason === 'install') {
// 		const {installType} = await browser.management.getSelf();
// 		if (installType === 'development') {
// 			return;
// 		}
// 		browser.tabs.create({
// 			url: 'https://github.com/sindresorhus/refined-github/issues/1137',
// 			active: false
// 		});
// 	}
// });

// GitHub Enterprise support
// dynamicContentScripts.addToFutureTabs();
// domainPermissionToggle.addContextMenu();

browser.browserAction.onClicked.addListener(function () {
	browser.tabs.executeScript({ file: "browser-polyfill.min.js" });
	browser.tabs.insertCSS({ file: "content.css" });
	browser.tabs.executeScript({ file: "content.js" });
});

/***/ })

/******/ });
//# sourceMappingURL=background.js.map