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

let fetchController = new AbortController();

const getResponse = async res => {
  const contentType = _.get(res, 'headers').get('content-type');
  if (
    _.endsWith(_.get(res, 'url'), '.png') ||
    (contentType && ~contentType.indexOf('image'))
  ) {
    const responseBlob = await res.blob();
    return URL.createObjectURL(responseBlob);
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
  headers = {},
  noCacheReq,
  noCacheRes,
  enableThrow = false
}) => {
  let request;
  if (controller) {
    const signal = controller.signal;
    request = new Request(endpoint, { signal, headers });
  } else {
    request = new Request(endpoint, { headers });
  }

  if (!noCacheReq) {
    const resFromCache = await caches.match(request);
    if (_.get(resFromCache, 'status') === 200) {
      return [await getResponse(resFromCache), null];
    }
  }

  try {
    const resFromFetch = await fetch(request.clone(), { method });
    if (!noCacheRes && _.get(resFromFetch, 'status') === 200) {
      const cache = await caches.open('__VANDAL__');
      cache.put(request, resFromFetch.clone());
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

const getTimestamp = async url => {
  const [ts, err] = await xhr(url, {
    method: 'HEAD',
    fetchResHeader: 'Memento-Datetime'
  });
  return [ts, err];
};

const getContentLocation = async url => {
  const [ts, err] = await xhr(url, {
    method: 'HEAD',
    fetchResHeader: 'content-location'
  });
  return [ts, err];
};

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.executeScript({ file: 'browser-polyfill.min.js' });
  browser.tabs.insertCSS({ file: 'content.css' });
  browser.tabs.executeScript({ file: 'content.js' });
});

const urlMap = {};

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(event) {
    if (event.message === '__VANDAL__CLIENT__FETCH') {
      fetchRequest({
        controller: fetchController,
        ...event.data
      }).then(function(...args) {
        port.postMessage({
          message: '__VANDAL__CLIENT__FETCH__RESPONSE',
          payload: args
        });
      });
    } else if (event.message === '__VANDAL__CLIENT__XHR') {
      const { endpoint, ...rest } = event.data;
      xhr(endpoint, rest).then(result => {
        console.log('result:', result);
      });
    } else if (event.message === '__VANDAL__CLIENT__FETCH__ABORT') {
      fetchController.abort();
      fetchController = new AbortController();
    }
  });
});

chrome.runtime.onMessage.addListener(async function(
  request,
  _sender,
  sendResponse
) {
  const { message, data } = request;
  if (message === 'getTimestamp') {
    getTimestamp(data).then(sendResponse);
    return true;
  } else if (message === 'getContentLocation') {
    getContentLocation(data).then(sendResponse);
    return true;
  } else if (message === '__VANDAL__CLIENT__OPTTONS') {
    chrome.runtime.openOptionsPage();
  } else if (message) {
    chrome.tabs.query({ active: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message, data });
    });
  }
});
