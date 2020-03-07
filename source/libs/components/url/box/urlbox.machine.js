import { Machine } from 'xstate';

const urlBoxMachine = Machine({
  id: 'urlbox',
  type: 'parallel',
  states: {
    history: {
      initial: 'close',
      states: {
        open: { on: { TOGGLE_HISTORY: 'close' } },
        close: { on: { TOGGLE_HISTORY: 'open' } }
      }
    },
    info: {
      initial: 'close',
      states: {
        open: { on: { TOGGLE_INFO: 'close' } },
        close: { on: { TOGGLE_INFO: 'open' } }
      }
    },
    timetravel: {
      initial: 'close',
      states: {
        open: { on: { TOGGLE_TIMETRAVEL: 'close' } },
        close: { on: { TOGGLE_TIMETRAVEL: 'open' } }
      }
    }
  }
});

export default urlBoxMachine;
