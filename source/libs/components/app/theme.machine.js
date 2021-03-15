import { Machine, assign } from "xstate";
import _ from "lodash";

import { themeDB } from "../../utils/storage";

const themeMachine = Machine(
  {
    id: "theme",
    initial: "idle",
    context: {
      theme: "dark"
    },
    states: {
      idle: {
        invoke: {
          id: "loadTheme",
          src: "loadTheme",
          onDone: {
            target: "themeLoaded",
            actions: [
              assign({
                theme: (_ctx, e) => e.data
              }),
              "notifyThemeChanged"
            ]
          }
        }
      },
      themeLoaded: {
        on: {
          SET_THEME: {
            actions: [
              assign({
                theme: (_ctx, e) => _.get(e, "payload.theme")
              }),
              "notifyThemeChanged",
              "storeTheme"
            ]
          }
        }
      }
    }
  },
  {
    actions: {
      storeTheme: (ctx) => {
        themeDB.setTheme(ctx.theme);
      }
    },
    services: {
      loadTheme: async (ctx) => {
        try {
          const theme = await themeDB.getTheme();
          return theme || ctx.theme;
        } catch (e) {
          console.info("ParentMachine: Failed to load theme");
          return ctx.theme;
        }
      }
    }
  }
);

export default themeMachine;
