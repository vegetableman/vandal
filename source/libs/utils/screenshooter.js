import { caches as cachesPolyfill } from 'cache-polyfill';
import { abort } from './api';
import { Lambda } from '../utils';

let caches = typeof caches === 'undefined' ? cachesPolyfill : caches;

export default class Screenshooter {
  abort = (type = 'screenshot') => {
    abort({ meta: { type } });
    Lambda.abort();
  };

  fetchScreenshot = async (endpoint, config = {}) => {
    try {
      if (!config.latest && !config.retry) {
        const resFromCache = await caches.match(endpoint);
        if (resFromCache) {
          try {
            const blob = await resFromCache.blob();
            let urlCreator = window.URL || window.webkitURL;
            const objectURL = urlCreator.createObjectURL(blob);
            return [objectURL, null];
          } catch (ex) {
            console.error(ex.message);
          }
        }
      }

      const result = await Lambda.invoke(endpoint);
      if (result.StatusCode === 200) {
        let arrayBufferView = new Uint8Array(
          _.get(
            JSON.parse(_.get(JSON.parse(result.Payload), 'body')),
            'buffer.data'
          )
        );
        let blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
        let urlCreator = window.URL || window.webkitURL;
        const objectURL = urlCreator.createObjectURL(blob);
        if (!config.latest) {
          try {
            const responseCache = await caches.open('__VANDAL__');
            responseCache.put(endpoint, new Response(blob));
          } catch (ex) {
            console.error(ex.message);
          }
        }
        return [objectURL, null];
      } else {
        return [null, 'error'];
      }
    } catch (ex) {
      return [null, ex.message];
    }
  };
}
