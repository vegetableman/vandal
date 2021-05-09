const getResponse = async (res) => {
  const contentType = _.get(res, "headers").get("content-type");
  if (
    _.endsWith(_.get(res, "url"), ".png") ||
    (contentType && contentType.indexOf("image") > -1)
  ) {
    const responseBlob = await res.blob();
    return URL.createObjectURL(responseBlob);
  }
  if (contentType && contentType.indexOf("text/") > -1) {
    const result = await res.text();
    return result;
  }
  try {
    return await res.json();
  } catch (ex) {
    throw new Error("Response JSON parse failure");
  }
};

const fetchRequest = async ({
  endpoint,
  controller,
  method = "GET",
  body,
  headers,
  fetchFromCache,
  fetchResHeader,
  cacheResponse,
  enableThrow = false
}) => {
  let request;
  if (controller) {
    const { signal } = controller;
    request = new Request(endpoint, { signal });
  } else {
    request = new Request(endpoint);
  }

  if (fetchFromCache && typeof caches !== "undefined") {
    try {
      const resFromCache = await caches.match(request);
      if (_.get(resFromCache, "status") === 200) {
        return [await getResponse(resFromCache), null];
      }
    } catch (ex) {
      console.error("cache failure:", ex.message);
    }
  }

  try {
    const headersObj = new Headers();
    headersObj.append("x-user-agent", "Vandal/1.0");
    if (!_.isEmpty(_.keys(headers))) {
      _.each(_.keys(headers), (key) => {
        headersObj.append(key, headers[key]);
      });
    }
    const resFromFetch = await fetch(request.clone(), { method, body, headers: headersObj });
    if (fetchResHeader) {
      const responseHeader = resFromFetch.headers.get(fetchResHeader);
      return [responseHeader, null];
    }
    if (
      (fetchFromCache || cacheResponse) &&
      _.get(resFromFetch, "status") === 200
    ) {
      try {
        const responseCache = await caches.open("__VANDAL__");
        responseCache.put(request, resFromFetch.clone());
      } catch (ex) {
        console.error("cache failure:", ex.message);
      }
    }

    if (_.get(resFromFetch, "status") === 200) {
      return [await getResponse(resFromFetch), null];
    }

    throw new Error(resFromFetch.statusText || "Request failed");
  } catch (err) {
    if (enableThrow) {
      throw new Error(err.message);
    }
    return [null, err.message];
  }
};

export default fetchRequest;
