import _ from 'lodash';

let promiseResolve, promiseReject;

const port = chrome.runtime.connect({ name: 'vandal' });
port.onMessage.addListener(function(result) {
  if (result.message === '__VANDAL__CLIENT__FETCH__RESPONSE') {
    const [res, err] = _.nth(_.get(result, 'payload'), 0);
    if (err && !disableReject) {
      return promiseReject(err);
    }
    return promiseResolve([res, err]);
  }
});

export const api = async (
  endpoint,
  {
    noCacheReq,
    noCacheRes,
    headers = {},
    method = 'GET',
    enableThrow = false,
    xhr = false
  } = {}
) => {
  return new Promise(function(resolve, reject) {
    port.postMessage({
      message: xhr ? '__VANDAL__CLIENT__XHR' : '__VANDAL__CLIENT__FETCH',
      data: {
        endpoint,
        noCacheReq,
        noCacheRes,
        enableThrow,
        headers,
        method
      }
    });
    promiseResolve = resolve;
    promiseReject = reject;
  });
};

export const abort = () => {
  port.postMessage({
    message: '__VANDAL__CLIENT__FETCH__ABORT'
  });
};

const promisifiedXHR = (
  url,
  { method = 'GET', fetchResHeader, abortFn = () => {} }
) => {
  return new Promise(function(resolve, reject) {
    let xhrRequest = new XMLHttpRequest();
    xhrRequest.open(method, url);
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

export const xhr = async (...args) => {
  try {
    const res = await promisifiedXHR(...args);
    return [res, null];
  } catch (err) {
    return [null, err];
  }
};
