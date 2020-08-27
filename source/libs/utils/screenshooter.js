import { abort } from './api';
import { fetch } from '.';

export default class Screenshooter {
  constructor() {
    this.loadURL();
  }

  loadURL = () => {
    this.captureURL = VANDAL_SCREENSHOT_API;
  };

  abort = (type = 'screenshot') => {
    abort({ meta: { type } });
  };

  fetchScreenshot = async (url, { latest }) => {
    const urlObj = new URL(`${this.captureURL}?url=${url}`);
    if (latest) {
      urlObj.searchParams.append('latest', true);
    }
    try {
      const [snapshotURL, err] = await fetch({
        endpoint: urlObj.href,
        fetchFromCache: true,
        cacheResponse: true,
        meta: { type: 'screenshot' }
      });
      return [snapshotURL, err];
    } catch (ex) {
      return [null, ex.message];
    }
  };
}
