import { abort } from './api';
// import { fetch } from '.';
import { Lambda } from '../utils';

export default class Screenshooter {
  constructor() {
    // console.log('aws:', aws);
    // this.loadURL();
    // this.controllers = [];
  }

  // loadURL = () => {
  //   this.captureURL = VANDAL_SCREENSHOT_API;
  // };

  abort = (type = 'screenshot') => {
    abort({ meta: { type } });
    // console.log('this.controllers:', this.controllers);
    // this.controller && this.controller.abort();
    // _.forEach(this.controllers, (controller) => {
    //   controller && controller.abort();
    // });
    Lambda.abort();
    // Lambda.clear();
  };

  fetchScreenshot = async (endpoint, config = {}) => {
    try {
      if (!config.latest) {
        const resFromCache = await caches.match(endpoint);
        if (resFromCache) {
          const blob = await resFromCache.blob();
          let urlCreator = window.URL || window.webkitURL;
          const objectURL = urlCreator.createObjectURL(blob);
          return [objectURL, null];
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
          const responseCache = await caches.open('__VANDAL__');
          responseCache.put(endpoint, new Response(blob));
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
