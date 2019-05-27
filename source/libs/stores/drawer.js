import { drawerDB } from '../utils/storage';
import createStore from './createStore.js';
import _ from 'lodash';

const drawerStore = createStore(
  {
    height: 300
  },
  {
    setHeight: height => ({ height }),
    load: async () => {
      const height = await drawerDB.getHeight();
      return { height };
    }
  }
);

drawerStore.subscribe(async state => {
  drawerDB.setHeight(state.height);
});

export default drawerStore;
