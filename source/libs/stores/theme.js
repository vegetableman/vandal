import { themeDB } from '../utils/storage';
import createStore from './createStore.js';
import _ from 'lodash';

const themeStore = createStore(
  {
    theme: 'light'
  },
  {
    setTheme: theme => ({ theme }),
    loadTheme: async () => {
      try {
        const theme = await themeDB.getTheme();
        console.log('theme: ', theme);
        return { theme };
      } catch (e) {
        console.info('ThemeStore: Failed to load theme');
        return _.get(themeStore, 'initialState.theme');
      }
    }
  }
);

themeStore.subscribe(state => {
  themeDB.setTheme(state.theme);
});

console.log('themeStore: ', themeStore);

export default themeStore;
