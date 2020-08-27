// const promisifiedXHR = (
//   url,
//   {
//     method = 'GET',
//     responseType,
//     fetchResHeader,
//     abortFn = () => {},
//     timeout = 5000
//   }
// ) => {
//   return new Promise(function(resolve, reject) {
//     let xhrRequest = new XMLHttpRequest();
//     xhrRequest.open(method, url);
//     if (timeout) {
//       xhrRequest.timeout = timeout;
//     }
//     xhrRequest.onload = function() {
//       if (this.status >= 200 && this.status < 300) {
//         if (fetchResHeader) {
//           return resolve(xhrRequest.getResponseHeader(fetchResHeader));
//         }
//         resolve(
//           responseType === 'json'
//             ? JSON.parse(xhrRequest.response)
//             : xhrRequest.response
//         );
//       } else {
//         reject({
//           status: this.status,
//           statusText: xhrRequest.statusText
//         });
//       }
//     };
//     xhrRequest.onerror = function() {
//       reject({
//         status: this.status,
//         statusText: xhrRequest.statusText
//       });
//     };
//     xhrRequest.send();
//     abortFn(xhrRequest);
//   });
// };

const { fetch } = require('./libs/utils');

let requests = {};

// var blobToDataURL = function(blob) {
//   return new Promise((resolve, reject) => {
//     var reader = new FileReader();
//     reader.onload = function() {
//       var dataUrl = reader.result;
//       var base64 = dataUrl.split(',')[1];
//       resolve(base64);
//     };
//     reader.readAsDataURL(blob);
//   });
// };

// const getResponse = async (res, meta) => {
//   const contentType = _.get(res, 'headers').get('content-type');
//   const metaType = _.get(meta, 'type');
//   if (metaType === 'screenshot') {
//     let response = await res.json();
//     let arrayBufferView = new Uint8Array(_.get(response, 'buffer.data'));
//     let blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
//     let urlCreator = window.URL || window.webkitURL;
//     return urlCreator.createObjectURL(blob);
//     // return blob; //await blobToDataURL(blob);
//   } else if (
//     _.endsWith(_.get(res, 'url'), '.png') ||
//     (contentType && ~contentType.indexOf('image'))
//   ) {
//     const responseBlob = await res.blob();
//     return URL.createObjectURL(responseBlob);
//   } else if (contentType && ~contentType.indexOf('text/')) {
//     return await res.text();
//   } else {
//     try {
//       return await res.json();
//     } catch (ex) {
//       throw new Error('Response JSON parse failure');
//     }
//   }
// };

// const fetchRequest = async ({
//   endpoint,
//   controller,
//   method = 'GET',
//   meta,
//   body,
//   headers = {},
//   fetchFromCache,
//   cacheResponse,
//   enableThrow = false
// }) => {
//   let request;
//   if (controller) {
//     const signal = controller.signal;
//     request = new Request(endpoint, { signal, headers });
//   } else {
//     request = new Request(endpoint, { headers });
//   }

//   if (fetchFromCache) {
//     const resFromCache = await caches.match(request);
//     if (_.get(resFromCache, 'status') === 200) {
//       return [await getResponse(resFromCache, meta), null];
//     }
//   }

//   try {
//     const resFromFetch = await fetch(request.clone(), { method, body });
//     if (
//       (fetchFromCache || cacheResponse) &&
//       _.get(resFromFetch, 'status') === 200
//     ) {
//       const responseCache = await caches.open('__VANDAL__');
//       responseCache.put(request, resFromFetch.clone());
//     }

//     if (_.get(resFromFetch, 'status') === 200) {
//       return [await getResponse(resFromFetch, meta), null];
//     }

//     throw new Error(resFromFetch.statusText || 'Request failed');
//   } catch (err) {
//     if (enableThrow) {
//       throw new Error(err.message);
//     }
//     return [null, err.message];
//   }
// };

// const xhr = async (...args) => {
//   try {
//     const res = await promisifiedXHR(...args);
//     console.log('xhr res:', res);
//     return [res, null];
//   } catch (err) {
//     return [null, err];
//   }
// };

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.executeScript({
    file: 'browser-polyfill.min.js',
    matchAboutBlank: true
  });
  browser.tabs.insertCSS({ file: 'content.css' });
  browser.tabs.executeScript({ file: 'content.js' });
});

// const urlMap = {};

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(event) {
    if (event.message === '__VANDAL__CLIENT__FETCH') {
      const { uniqueId, meta, ...rest } = event.data;
      requests[uniqueId] = { controller: new AbortController(), meta };
      fetch({
        controller: requests[uniqueId].controller,
        meta,
        ...rest
      }).then(function(...args) {
        delete requests[uniqueId];
        port.postMessage({
          message: '__VANDAL__CLIENT__FETCH__RESPONSE',
          payload: args,
          uniqueId
        });
      });
    } else if (event.message === '__VANDAL__CLIENT__FETCH__ABORT') {
      _.forEach(requests, (request, id) => {
        if (
          _.get(event, 'data.meta.type') === _.get(request, 'meta.type') &&
          request.controller
        ) {
          request && request.controller.abort();
          delete requests[id];
        }
      });
    }
  });
});

chrome.runtime.onMessage.addListener(async function(
  request
  // _sender
  // sendResponse
) {
  const { message, data } = request;
  // if (message === '__VANDAL__CLIENT__OPTTONS') {
  //   chrome.runtime.openOptionsPage();
  // } else
  if (message) {
    chrome.tabs.query({ active: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message, data });
    });
  }
});
