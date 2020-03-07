import { Machine, assign } from 'xstate';
import _ from 'lodash';
import { stripArchiveURL, browser } from '../../utils';
import { themeDB } from '../../utils/storage';

const parentMachine = Machine({
  id: 'parent',
  initial: 'idle',
  context: {
    isInvalidContext: false
  },
  states: {
    idle: {
      type: 'atomic',
      on: {
        LOADED: {
          actions: [
            assign({
              loaded: true
            }),
            'updateVandalURL'
          ]
        },
        SET_URL: {
          actions: assign({
            url: (_ctx, e) => stripArchiveURL(e.value)
          })
        },
        TOGGLE_INVALID_CONTEXT: {
          actions: assign({
            isInvalidContext: (_ctx, e) => _.get(e, 'payload.value')
          })
        },
        EXIT: {
          actions: 'notifyExit'
        }
      }
    }
  }
});

export default parentMachine;
