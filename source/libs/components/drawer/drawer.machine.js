import { Machine, assign } from 'xstate';
import _ from 'lodash';
import { drawerDB } from '../../utils/storage';

const drawerMachine = Machine(
  {
    id: 'drawer',
    initial: 'idle',
    context: {
      height: 300,
      scrollOnHighlight: true
    },
    states: {
      idle: {
        type: 'atomic',
        invoke: {
          id: 'loadHeight',
          src: 'loadHeight',
          onDone: {
            actions: [
              assign({
                height: (_ctx, e) => e.data
              }),
              'notifyHeightChanged'
            ]
          }
        },
        on: {
          SET_HEIGHT: {
            actions: [
              assign({
                height: (_ctx, e) => _.get(e, 'payload.value')
              }),
              'notifyHeightChanged',
              'storeHeight'
            ]
          },
          TOGGLE_SCROLL_HIGHLIGHT: {
            actions: [
              assign({
                scrollOnHighlight: (ctx, e) => _.get(e, 'payload.checked')
              })
            ]
          }
        }
      }
    }
  },
  {
    actions: {
      storeHeight: (ctx) => {
        drawerDB.setHeight(ctx.height);
      }
    },
    services: {
      loadHeight: async (ctx) => {
        try {
          const height = await drawerDB.getHeight();
          return height;
        } catch (e) {
          console.info('DrawerMachine: Failed to load height');
          return ctx.height;
        }
      }
    }
  }
);

export default drawerMachine;
