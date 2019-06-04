import _ from 'lodash';

export const api = async (
  endpoint,
  { controller, noCacheReq, noCacheRes, headers = {}, method = 'GET' } = {}
) => {
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

    throw new Error('Request failed');
  } catch (err) {
    console.log('API Error: ', err);
    return [null, err.message];
  }
};

const getResponse = async res => {
  const contentType = _.get(res, 'headers').get('content-type');
  if (_.endsWith(_.get(res, 'url'), '.png') || ~contentType.indexOf('image')) {
    const responseBlob = await res.blob();
    return URL.createObjectURL(responseBlob);
  } else {
    return await res.json();
  }
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
