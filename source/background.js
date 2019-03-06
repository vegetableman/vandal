const promisifiedXHR = (
  url,
  { method = 'GET', fetchResHeader, abortFn = () => {}, timeout = 5000 }
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
        resolve(xhrRequest.response);
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

const xhr = async (...args) => {
  try {
    const res = await promisifiedXHR(...args);
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

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.executeScript({ file: 'browser-polyfill.min.js' });
  browser.tabs.insertCSS({ file: 'content.css' });
  browser.tabs.executeScript({ file: 'content.js' });
});

const urlMap = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const { message, data } = request;
  if (message === 'getTimestamp') {
    getTimestamp(data).then(sendResponse);
    return true;
  } else if (message === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
  } else if (message) {
    chrome.tabs.query({ active: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message, data });
    });
  }
});
