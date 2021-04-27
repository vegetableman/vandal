const { fetch } = require("./libs/utils");

const requests = {};

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.insertCSS({ file: "build/content.css" });
  browser.tabs.executeScript({ file: "build/browser-polyfill.js" });
  browser.tabs.executeScript({ file: "build/content.js" });
});

browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((event) => {
    if (event.message === "__VANDAL__CLIENT__FETCH") {
      const { uniqueId, meta, ...rest } = event.data;
      requests[uniqueId] = { controller: new AbortController(), meta };
      fetch({
        controller: requests[uniqueId].controller,
        ...rest
      }).then((...args) => {
        delete requests[uniqueId];
        port.postMessage({
          message: "__VANDAL__CLIENT__FETCH__RESPONSE",
          payload: args,
          uniqueId
        });
      });
    } else if (event.message === "__VANDAL__CLIENT__FETCH__ABORT") {
      _.forEach(requests, (request, id) => {
        if (
          _.get(event, "data.meta.type") === _.get(request, "meta.type") &&
          request.controller
        ) {
          if (request) {
            request.controller.abort();
          }
          delete requests[id];
        }
      });
    }
  });
});

browser.runtime.onMessage.addListener((request, sender) => {
  const { message, data } = request;
  browser.tabs.sendMessage(sender.tab.id, { message, data });
});
