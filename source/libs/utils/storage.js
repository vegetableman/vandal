import _ from 'lodash';

const historyPrefix = '__VANDAL__HIST__STORAGE';
export const historyDB = {
  addRecord(suffix, value) {
    if (!value) return;
    const key = `${historyPrefix}__${suffix}`;
    chrome.storage.local.get([key], (svalue) => {
      let collection = [value];
      const match = _.includes(svalue[key], value);
      if (match) return;
      if (_.isArray(svalue[key])) {
        collection = [...svalue[key], ...collection];
      }
      chrome.storage.local.set({ [key]: collection }, function () {
        // Notify that we saved.
        console.log('Settings saved');
      });
    });
  },

  setRecords(suffix, collection) {
    if (!collection || _.isEmpty(collection)) return;
    const key = `${historyPrefix}__${suffix}`;
    chrome.storage.local.set({ [key]: collection }, function () {
      // Notify that we saved.
      console.log('Settings saved');
    });
  },

  async getRecords(suffix) {
    const promisifiedGet = (key) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (value) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          return resolve(value[key]);
        });
      });
    };

    try {
      const res = await promisifiedGet(`${historyPrefix}__${suffix}`);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },

  async clearRecords(suffix) {
    const promisifiedClear = (key) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove(key, function () {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          return resolve();
        });
      });
    };

    try {
      const res = await promisifiedClear(`${historyPrefix}__${suffix}`);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },

  isEnabled() {
    return new Promise((resolve) => {
      const key = '__VANDAL__HIST__LOGGING__ENABLED';
      chrome.storage.local.get(key, (value) => {
        return _.isUndefined(value[key]) ? resolve(true) : resolve(value[key]);
      });
    });
  }
};

const drawerKey = '__VANDAL__DRAWER__STORAGE';

export const drawerDB = {
  setHeight(value) {
    chrome.storage.local.set({ [drawerKey]: value }, () => {
      // Notify that we saved.
      console.log('Settings saved');
    });
  },

  getHeight() {
    return new Promise((resolve) => {
      chrome.storage.local.get([drawerKey], (value) => {
        return resolve(value[drawerKey]);
      });
    });
  }
};

const themeKey = '__VANDAL__THEME__STORAGE';
export const themeDB = {
  setTheme(value) {
    chrome.storage.local.set({ [themeKey]: value }, () => {
      // Notify that we saved.
      console.info('ThemeDB: Settings saved');
    });
  },

  getTheme() {
    return new Promise((resolve) => {
      chrome.storage.local.get(themeKey, (value) => {
        return resolve(value[themeKey]);
      });
    });
  }
};


const introKey = '__VANDAL__INTRO__STORAGE';
export const introDB = {
  setIntro(value) {
    chrome.storage.local.set({ [introKey]: value }, () => {
      // Notify that we saved.
      console.info('IntroDB: Settings saved');
    });
  },

  getIntro() {
    return new Promise((resolve) => {
      chrome.storage.local.get(introKey, (value) => {
        return resolve(value[introKey]);
      });
    });
  }
};
