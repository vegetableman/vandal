import _ from "lodash";

// unlimitedStorage is set to avoid any storage errors

const historyPrefix = "__VANDAL__HIST__STORAGE";
export const historyDB = {
  setRecords(suffix, collection) {
    if (!collection || _.isEmpty(collection)) return;
    const key = `${historyPrefix}__${suffix}`;
    browser.storage.local.set({ [key]: collection });
  },

  async getRecords(suffix) {
    const key = `${historyPrefix}__${suffix}`;
    return browser.storage.local.get(key).then((value) => {
      if (browser.runtime.lastError) {
        return [null, browser.runtime.lastError];
      }
      return [_.get(value, key), null];
    },
    (err) => [null, err]);
  },

  async clearRecords(suffix) {
    const key = `${historyPrefix}__${suffix}`;
    return browser.storage.local.remove(key);
  },

  async isEnabled() {
    const key = `${historyPrefix}__ISENABLED`;
    return browser.storage.sync.get(key).then((value) => (
      _.isUndefined(value[key]) ? false : value[key]), () => (false));
  }
};

const drawerKey = "__VANDAL__DRAWER__STORAGE";

export const drawerDB = {
  setHeight(value) {
    browser.storage.local.set({ [drawerKey]: value });
  },

  getHeight() {
    return browser.storage.local.get([drawerKey]).then((value) => value[drawerKey]);
  }
};

const themeKey = "__VANDAL__THEME__STORAGE";
export const themeDB = {
  setTheme(value) {
    browser.storage.sync.set({ [themeKey]: value });
  },

  getTheme() {
    return browser.storage.sync.get(themeKey).then((value) => value[themeKey]);
  }
};

const introKey = "__VANDAL__INTRO__STORAGE";
export const introDB = {
  setIntro(value) {
    browser.storage.sync.set({ [introKey]: value });
  },

  getIntro() {
    return browser.storage.sync.get(introKey).then((value) => value[introKey]);
  }
};

const historicalKey = "__VANDAL__HIST_INFO__STORAGE";
export const historicalDB = {
  setInfo(value) {
    browser.storage.sync.set({ [historicalKey]: value });
  },

  getInfo() {
    return browser.storage.sync.get(historicalKey).then((value) => value[historicalKey]);
  }
};

const appKey = "__VANDAL__APP__STORAGE";
export const appDB = {
  setDonateState(value) {
    browser.storage.sync.set({ [`${appKey}__DONATE`]: value });
  },

  getDonateState() {
    return browser.storage.sync.get(`${appKey}__DONATE`).then((value) => value[`${appKey}__DONATE`]);
  }
};
