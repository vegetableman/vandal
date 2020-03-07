import { api } from './api';

export default class Screenshooter {
  constructor() {
    this.loadURL();
    // this.loadPre();
    this.fetchController = new AbortController();
  }

  loadURL = () => {
    this.captureURL = VANDAL_SCREENSHOT_API;
    this.path = VANDAL_SCREENSHOT_CDN;
  };

  loadPre = () => {
    this.captureURL = 'https://service.prerender.cloud/screenshot';
  };

  abort = () => {
    this.fetchController.abort();
  };

  fetchScreenshot = async (
    url,
    { noCacheReq = false, noCacheRes = false, latest = false }
  ) => {
    const urlObj = new URL(`${this.captureURL}?url=${url}`);
    if (latest) {
      urlObj.searchParams.append('latest', true);
    }
    try {
      let [snapshotPath, pathErr] = await api(urlObj.href, {
        controller: this.fetchController,
        noCacheReq,
        noCacheRes
      });
      return [snapshotPath, pathErr];
    } catch (ex) {
      return [null, ex.message];
    }
  };

  fetchPreRender = async (url, noCache = false) => {
    var pHeaders = new Headers();
    pHeaders.append(
      'X-Prerender-Token',
      'dXMtd2VzdC0yOjU3MzhhNGJiLWMzNjItNGJkYS1hYjM5LWNlNWQ0ZTYwZTZiZg.BNuwm8aJE9USPdPZp1PZnVdGQJCzHH_DHpPUKdZTKPY'
    );
    let [snapshot, pathErr] = await api(`${this.captureURL}/${url}`, {
      headers: pHeaders,
      noCacheReq: noCache,
      noCacheRes: noCache,
      controller: this.fetchController
    });
    console.log('snapshot: ', snapshot);
    return snapshot;
  };
}
