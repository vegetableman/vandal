import { caches as cachesPolyfill } from "cache-polyfill";
import { abort } from "./api";
import Lambda from "./lambda";

const caches = typeof window.caches === "undefined" ? cachesPolyfill : window.caches;

export default class Screenshooter {
  abort(type = "screenshot") {
    abort({ meta: { type } });
    Lambda.abort();
  }

  async fetchScreenshot(endpoint, config = {}) {
    try {
      if (!config.latest && !config.retry) {
        const resFromCache = await caches.match(endpoint);
        if (resFromCache) {
          try {
            const blob = await resFromCache.blob();
            const urlCreator = window.URL || window.webkitURL;
            const objectURL = urlCreator.createObjectURL(blob);
            return [objectURL, null];
          } catch (ex) {
            // eslint-disable-next-line no-console
            console.error(ex.message);
          }
        }
      }

      const result = await Lambda.invoke(endpoint);
      const statusCode = _.get(JSON.parse(result.Payload), "statusCode");
      if (statusCode === 200) {
        const arrayBufferView = new Uint8Array(
          _.get(
            JSON.parse(_.get(JSON.parse(result.Payload), "body")),
            "buffer.data"
          )
        );
        const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
        const urlCreator = window.URL || window.webkitURL;
        const objectURL = urlCreator.createObjectURL(blob);
        if (!config.latest) {
          try {
            const responseCache = await caches.open("__VANDAL__");
            responseCache.put(endpoint, new Response(blob));
          } catch (ex) {
            // eslint-disable-next-line no-console
            console.error(ex.message);
          }
        }
        return [objectURL, null];
      }
      return [null, "error"];
    } catch (ex) {
      return [null, ex.message];
    }
  }
}
