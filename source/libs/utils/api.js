import _ from 'lodash';

let promiseMap = {};

const port = chrome.runtime.connect({ name: 'vandal' });
port.onMessage.addListener(function(result) {
  if (result.message === '__VANDAL__CLIENT__FETCH__RESPONSE') {
    const p = { ...promiseMap[result.uniqueId] };
    delete promiseMap[result.uniqueId];
    const [res, err] = _.nth(_.get(result, 'payload'), 0);
    if (err) {
      return p.reject(err);
    }
    return p.resolve([res, err]);
  }
});

export const api = async (
  endpoint,
  {
    fetchFromCache,
    cacheResponse,
    headers = {},
    method = 'GET',
    enableThrow = false,
    meta,
    body
  } = {}
) => {
  return new Promise(function(resolve, reject) {
    const uniqueId = _.uniqueId();
    port.postMessage({
      message: '__VANDAL__CLIENT__FETCH',
      data: {
        endpoint,
        fetchFromCache,
        cacheResponse,
        enableThrow,
        headers,
        method,
        uniqueId,
        meta,
        body
      }
    });
    promiseMap[uniqueId] = {
      resolve,
      reject
    };
  });
};

export const abort = (payload = {}) => {
  port.postMessage({
    message: '__VANDAL__CLIENT__FETCH__ABORT',
    data: { ...payload }
  });
};
