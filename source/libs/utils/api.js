import _ from "lodash";

const promiseMap = {};
let port;

const getPort = () => {
  port = chrome.runtime.connect({ name: "vandal" });
  port.onDisconnect.addListener((obj) => {
    // eslint-disable-next-line no-console
    console.log("disconnected port", obj);
  });
  port.onMessage.addListener((result) => {
    if (result.message === "__VANDAL__CLIENT__FETCH__RESPONSE") {
      const p = { ...promiseMap[result.uniqueId] };
      delete promiseMap[result.uniqueId];
      const [res, err] = _.nth(_.get(result, "payload"), 0);
      if (err) {
        return p.reject(err);
      }
      return p.resolve([res, err]);
    }
    return null;
  });
  return port;
};

export const api = async (
  endpoint,
  {
    fetchFromCache,
    fetchResHeader,
    cacheResponse,
    headers = {},
    method = "GET",
    enableThrow = false,
    meta,
    body
  } = {}
) => {
  if (!port) {
    port = getPort();
  }

  return new Promise(((resolve) => {
    const uniqueId = _.uniqueId();
    port.postMessage({
      message: "__VANDAL__CLIENT__FETCH",
      data: {
        endpoint,
        fetchResHeader,
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
      reject: (err) => {
        resolve([null, err]);
      }
    };
  }));
};

export const abort = (payload = {}) => {
  port.postMessage({
    message: "__VANDAL__CLIENT__FETCH__ABORT",
    data: { ...payload }
  });
};
