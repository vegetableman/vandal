const promisifiedXHR = (
  url,
  { method = 'GET', fetchResHeader, abortFn = () => {} }
) => {
  return new Promise(function(resolve, reject) {
    let xhrRequest = new XMLHttpRequest();
    xhrRequest.open(method, url);
    xhrRequest.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        if (_.isArray(fetchResHeader)) {
          const index = _.findIndex(fetchResHeader, (header) => {
            return !!xhrRequest.getResponseHeader(header);
          });
          if (index > -1) {
            return resolve([
              fetchResHeader[index],
              xhrRequest.getResponseHeader(fetchResHeader[index])
            ]);
          }
        } else if (fetchResHeader) {
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

export default xhr;
