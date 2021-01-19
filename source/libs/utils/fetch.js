const getResponse = async (res, meta) => {
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
  meta,
  body,
  headers = {},
  fetchFromCache,
  fetchResHeader,
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
      return [await getResponse(resFromCache, meta), null];
    }
  }

  try {
    const resFromFetch = await fetch(request.clone(), { method, body });
    if (fetchResHeader) {
      console.log('fetchResHeader', resFromFetch.headers.get(fetchResHeader));
      const responseHeader = resFromFetch.headers.get(fetchResHeader);
      return [responseHeader, null];
    }
    if (
      (fetchFromCache || cacheResponse) &&
      _.get(resFromFetch, 'status') === 200
    ) {
      const responseCache = await caches.open('__VANDAL__');
      responseCache.put(request, resFromFetch.clone());
    }

    if (_.get(resFromFetch, 'status') === 200) {
      return [await getResponse(resFromFetch, meta), null];
    }

    throw new Error(resFromFetch.statusText || 'Request failed');
  } catch (err) {
    if (enableThrow) {
      throw new Error(err.message);
    }
    return [null, err.message];
  }
};

export default fetchRequest;
