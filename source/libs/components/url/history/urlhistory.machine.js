import { Machine, assign, actions } from 'xstate';
import historyStore from '../../../stores';

const urlHistoryMachine = Machine({
  id: 'urlhistory',
  initial: 'idle',
  context: {
    records: historyStore.getState().records
  },
  states: {
    idle: {},
    loading: {
      on: {
        LOAD_HISTORY: {
          invoke: {
            id: 'loadRecords',
            src: context => historyStore.loadRecords(context.url),
            onDone: {
              target: 'loaded',
              actions: assign({ records: (_context, event) => event.data })
            },
            onError: {}
          }
        }
      }
    },
    loaded: {},
    clear: {
      on: {
        CLEAR_HISTORY: {
          invoke: {
            id: 'clearRecords',
            src: context => historyStore.clearRecords(context.url)
          }
        }
      }
    }
  }
});

export default urlHistoryMachine;
