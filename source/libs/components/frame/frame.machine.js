import { Machine, actions, spawn } from "xstate";
import { raise } from "xstate/lib/actions";
import timetravelMachine from "../timetravel/timetravel.machine";

const { assign } = actions;
const frameMachine = Machine(
  {
    id: "url",
    initial: "init",
    context: {
      timetravelRef: undefined,
      selectedTabIndex: 0
    },
    states: {
      init: {
        entry: [
          assign({
            timetravelRef: () => spawn(timetravelMachine)
          }),
          raise("DONE")
        ],
        on: {
          DONE: "idle"
        }
      },
      idle: {
        type: "parallel",
        states: {
          timetravel: {
            initial: "close",
            states: {
              open: {
                on: {
                  TOGGLE_TIMETRAVEL: "close",
                  SET_SELECTED_TABINDEX: {
                    actions: assign((_ctx, e) => ({
                      selectedTabIndex: _.get(e, "payload.value")
                    }))
                  }
                }
              },
              close: { on: { TOGGLE_TIMETRAVEL: "open" } }
            }
          },
          historical: {
            initial: "close",
            states: {
              open: { on: { TOGGLE_HISTORICAL_MODE: "close" } },
              close: { on: { TOGGLE_HISTORICAL_MODE: "open" } }
            }
          },
          resourcedrawer: {
            initial: "close",
            states: {
              open: { on: { TOGGLE_RESOURCEL_DRAWER: "close" } },
              close: { on: { TOGGLE_RESOURCEL_DRAWER: "open" } }
            }
          }
        }
      }
    },
    on: {
      LOAD_SPARKLINE: {
        actions: "loadSparkline"
      }
    }
  },
  {
    actions: {
      loadSparkline: (ctx, e) => {
        if (ctx.timetravelRef.state.value === "noSparklineFound") {
          ctx.timetravelRef.send({
            type: "RETRY",
            payload: _.get(e, "payload")
          });
        } else {
          ctx.timetravelRef.send({
            type: "LOAD_SPARKLINE",
            payload: _.get(e, "payload")
          });
        }
      }
    }
  }
);

export default frameMachine;
