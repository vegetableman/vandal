import { Machine } from "xstate";

const urlMachine = Machine({
  id: "url",
  initial: "unknown",
  states: {
    unknown: {
      always: [{ target: "menus" }]
    },
    menus: {
      type: "parallel",
      states: {
        history: {
          initial: "close",
          states: {
            open: { on: { TOGGLE_HISTORY: "close" } },
            close: { on: { TOGGLE_HISTORY: "open" } }
          }
        },
        info: {
          initial: "close",
          states: {
            open: { on: { TOGGLE_INFO: "close" } },
            close: { on: { TOGGLE_INFO: "open" } }
          }
        }
      }
    }
  }
});

export default urlMachine;
