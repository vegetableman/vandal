/* eslint-disable no-console */
import _ from "lodash";

// unlimitedStorage is set to avoid any storage errors

// TODO: consider removing this, since runtime.lastError is merely a warning
const promisifiedGet = (key) => new Promise((resolve, reject) => {
  browser.storage.local.get([key], (value) => {
    if (browser.runtime.lastError) {
      return reject(browser.runtime.lastError);
    }
    return resolve(value[key]);
  });
});

const historyPrefix = "__VANDAL__HIST__STORAGE";
export const historyDB = {
  setRecords(suffix, collection) {
    if (!collection || _.isEmpty(collection)) return;
    const key = `${historyPrefix}__${suffix}`;
    browser.storage.local.set({ [key]: collection }, () => {
      // Notify that we saved.
      console.log("HistoryDB: Settings saved");
    });
  },

  async getRecords(suffix) {
    try {
      const res = await promisifiedGet(`${historyPrefix}__${suffix}`);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },

  async clearRecords(suffix) {
    const promisifiedClear = (key) => new Promise((resolve, reject) => {
      browser.storage.local.remove(key, () => {
        if (browser.runtime.lastError) {
          return reject(browser.runtime.lastError);
        }
        return resolve();
      });
    });

    try {
      const res = await promisifiedClear(`${historyPrefix}__${suffix}`);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  }
};

const drawerKey = "__VANDAL__DRAWER__STORAGE";

export const drawerDB = {
  setHeight(value) {
    browser.storage.local.set({ [drawerKey]: value }, () => {
      // Notify that we saved.
      console.log("DrawerDB: Settings saved");
    });
  },

  getHeight() {
    return new Promise((resolve) => {
      browser.storage.local.get([drawerKey], (value) => resolve(value[drawerKey]));
    });
  }
};

const themeKey = "__VANDAL__THEME__STORAGE";
export const themeDB = {
  setTheme(value) {
    browser.storage.local.set({ [themeKey]: value }, () => {
      // Notify that we saved.
      console.info("ThemeDB: Settings saved");
    });
  },

  getTheme() {
    return new Promise((resolve) => {
      browser.storage.local.get(themeKey, (value) => resolve(value[themeKey]));
    });
  }
};

const introKey = "__VANDAL__INTRO__STORAGE";
export const introDB = {
  setIntro(value) {
    browser.storage.local.set({ [introKey]: value }, () => {
      // Notify that we saved.
      console.info("IntroDB: Settings saved");
    });
  },

  getIntro() {
    return new Promise((resolve) => {
      browser.storage.local.get(introKey, (value) => resolve(value[introKey]));
    });
  }
};

const historicalKey = "__VANDAL__HIST_INFO__STORAGE";
export const historicalDB = {
  setInfo(value) {
    browser.storage.local.set({ [historicalKey]: value }, () => {
      // Notify that we saved.
      console.info("HistoricalDB: Settings saved");
    });
  },

  getInfo() {
    return new Promise((resolve) => {
      browser.storage.local.get(historicalKey, (value) => resolve(value[historicalKey]));
    });
  }
};

const appKey = "__VANDAL__APP__STORAGE";
export const appDB = {
  setDonateState(value) {
    browser.storage.local.set({ [`${appKey}__DONATE`]: value }, () => {
      // Notify that we saved.
      console.info("donateDB: Settings saved");
    });
  },

  getDonateState() {
    return new Promise((resolve) => {
      browser.storage.local.get(`${appKey}__DONATE`, (value) => resolve(value[`${appKey}__DONATE`]));
    });
  }
};
