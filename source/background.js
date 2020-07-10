const promisifiedXHR = (
  url,
  {
    method = 'GET',
    responseType,
    fetchResHeader,
    abortFn = () => {},
    timeout = 5000
  }
) => {
  return new Promise(function(resolve, reject) {
    let xhrRequest = new XMLHttpRequest();
    xhrRequest.open(method, url);
    if (timeout) {
      xhrRequest.timeout = timeout;
    }
    xhrRequest.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        if (fetchResHeader) {
          return resolve(xhrRequest.getResponseHeader(fetchResHeader));
        }
        resolve(
          responseType === 'json'
            ? JSON.parse(xhrRequest.response)
            : xhrRequest.response
        );
      } else {
        reject({
          status: this.status,
          statusText: xhrRequest.statusText
        });
      }
    };
    xhrRequest.onerror = function() {
      reject({
        status: this.status,
        statusText: xhrRequest.statusText
      });
    };
    xhrRequest.send();
    abortFn(xhrRequest);
  });
};

let requests = {};

const getResponse = async (res) => {
  const contentType = _.get(res, 'headers').get('content-type');
  if (
    _.endsWith(_.get(res, 'url'), '.png') ||
    (contentType && ~contentType.indexOf('image'))
  ) {
    const responseBlob = await res.blob();
    return URL.createObjectURL(responseBlob);
  } else if (contentType && ~contentType.indexOf('text/')) {
    return await res.text();
  } else {
    try {
      return await res.json();
    } catch (ex) {
      throw new Error('Response JSON parse failure');
    }
  }
};

const fetchRequest = async ({
  endpoint,
  controller,
  method = 'GET',
  body,
  headers = {},
  fetchFromCache,
  cacheResponse,
  enableThrow = false
}) => {
  let request;
  if (controller) {
    const signal = controller.signal;
    request = new Request(endpoint, { signal, headers });
  } else {
    request = new Request(endpoint, { headers });
  }

  if (fetchFromCache) {
    const resFromCache = await caches.match(request);
    if (_.get(resFromCache, 'status') === 200) {
      return [await getResponse(resFromCache), null];
    }
  }

  try {
    const resFromFetch = await fetch(request.clone(), { method, body });
    if (
      (fetchFromCache || cacheResponse) &&
      _.get(resFromFetch, 'status') === 200
    ) {
      const responseCache = await caches.open('__VANDAL__');
      responseCache.put(request, resFromFetch.clone());
    }

    if (_.get(resFromFetch, 'status') === 200) {
      return [await getResponse(resFromFetch), null];
    }

    throw new Error(resFromFetch.statusText || 'Request failed');
  } catch (err) {
    if (enableThrow) {
      throw new Error(err.message);
    }
    return [null, err.message];
  }
};

const xhr = async (...args) => {
  try {
    const res = await promisifiedXHR(...args);
    console.log('xhr res:', res);
    return [res, null];
  } catch (err) {
    return [null, err];
  }
};

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.executeScript({
    file: 'browser-polyfill.min.js',
    matchAboutBlank: true
  });
  browser.tabs.insertCSS({ file: 'content.css' });
  browser.tabs.executeScript({ file: 'content.js' });
});

const urlMap = {};

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(event) {
    if (event.message === '__VANDAL__CLIENT__FETCH') {
      const { uniqueId, meta, ...rest } = event.data;
      requests[uniqueId] = { controller: new AbortController(), meta };
      fetchRequest({
        controller: requests[uniqueId].controller,
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
  request,
  _sender,
  sendResponse
) {
  const { message, data } = request;
  if (message === '__VANDAL__CLIENT__OPTTONS') {
    chrome.runtime.openOptionsPage();
  } else if (message) {
    chrome.tabs.query({ active: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message, data });
    });
  }
});
