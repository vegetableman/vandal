import { Machine, assign } from 'xstate';
import _ from 'lodash';
import { themeDB } from '../../utils/storage';

const themeMachine = Machine(
  {
    id: 'theme',
    initial: 'idle',
    context: {
      theme: 'light'
    },
    states: {
      idle: {
        type: 'atomic',
        invoke: {
          id: 'loadTheme',
          src: 'loadTheme',
          onDone: {
            actions: [
              assign({
                theme: (_ctx, e) => e.data
              }),
              'notifyThemeChanged'
            ]
          }
        },
        on: {
          SET_THEME: {
            actions: [
              assign({
                theme: (_ctx, e) => _.get(e, 'payload.theme')
              }),
              'notifyThemeChanged',
              'storeTheme'
            ]
          }
        }
      }
    }
  },
  {
    actions: {
      storeTheme: ctx => {
        themeDB.setTheme(ctx.theme);
      }
    },
    services: {
      loadTheme: async ctx => {
        try {
          const theme = await themeDB.getTheme();
          return theme;
        } catch (e) {
          console.info('ParentMachine: Failed to load theme');
          return ctx.theme;
        }
      }
    }
  }
);

export default themeMachine;
