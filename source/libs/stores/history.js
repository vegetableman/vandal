import { historyDB } from '../utils/storage';
import createStore from './createStore.js';
import _ from 'lodash';

const historyStore = createStore(
  {
    url: null,
    records: []
  },
  {
    clearRecords: () => async state => {
      const [__, err] = await historyDB.clearRecords(state.url);
      if (err) {
        return { records: state.records };
      }
      return { records: [] };
    },
    loadRecords: async url => {
      const [records, err] = await historyDB.getRecords(url);
      if (err) {
        return { url, records: [] };
      }
      return { url, records: records || [] };
    },
    addRecord: record => state => {
      const { records } = state;
      if (_.includes(records, record)) return;
      return { records: [...records, record] };
    }
  }
);

historyStore.subscribe(async state => {
  try {
    const isEnabled = await historyDB.isEnabled();
    const record = _.last(state.records);
    if (!isEnabled || !record) return;
    historyDB.addRecord(state.url, record);
  } catch (e) {}
});

export default historyStore;
