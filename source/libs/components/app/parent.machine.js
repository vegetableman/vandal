import { Machine, assign } from 'xstate';
import _ from 'lodash';
import { stripArchiveURL } from '../../utils';

const parentMachine = Machine({
  id: 'parent',
  initial: 'idle',
  context: {
    isInvalidContext: false,
    isFrameBusted: false
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
        TOGGLE_BUSTED_ERROR: {
          actions: assign({
            isFrameBusted: (_ctx, e) => _.get(e, 'payload.value')
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
