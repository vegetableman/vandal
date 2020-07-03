import { api, abort } from './api';

export default class Screenshooter {
  constructor() {
    this.loadURL();
  }

  loadURL = () => {
    this.captureURL = VANDAL_SCREENSHOT_API;
    this.path = VANDAL_SCREENSHOT_CDN;
  };

  loadPre = () => {
    this.captureURL = 'https://service.prerender.cloud/screenshot';
  };

  abort = ({ type = 'screenshot' }) => {
    abort({ meta: { type } });
  };

  fetchScreenshot = async (
    url,
    { fetchFromCache, cacheResponse, latest = false, type = 'screenshot' }
  ) => {
    const urlObj = new URL(`${this.captureURL}?url=${url}`);
    if (latest) {
      urlObj.searchParams.append('latest', true);
    }
    try {
      let [snapshotPath, pathErr] = await api(urlObj.href, {
        fetchFromCache,
        cacheResponse,
        meta: { type }
      });
      return [snapshotPath, pathErr];
    } catch (ex) {
      return [null, ex.message];
    }
  };
}
