import { Machine, assign } from "xstate";
import _ from "lodash";
import { drawerDB } from "../../utils/storage";
import resourceTSController from "./resource-ts-controller";

const DEFAULT_HEIGHT = 300;

const drawerMachine = Machine(
  {
    id: "drawer",
    initial: "idle",
    context: {
      height: null,
      scrollOnHighlight: true,
      timestamps: [],
      isOpen: true
    },
    states: {
      idle: {
        invoke: {
          id: "loadHeight",
          src: "loadHeight",
          onDone: {
            target: "heightLoaded",
            actions: [
              assign({
                height: (ctx, e) => _.get(e, "data", DEFAULT_HEIGHT)
              })
            ]
          }
        }
      },
      heightLoaded: {
        initial: "unknown",
        on: {
          LOAD_TIMESTAMPS: {
            target: "#loadingTimestamps",
            actions: assign(() => ({ showLoader: false, timestamps: [] }))
          }
        },
        states: {
          unknown: {},
          loadingTimestamps: {
            id: "loadingTimestamps",
            invoke: {
              id: "fetchTimestamps",
              src: "fetchTimestamps"
            }
          }
        }
      }
    },
    on: {
      SET_HEIGHT: {
        actions: [
          assign({
            height: (_ctx, e) => _.get(e, "payload.value")
          }),
          "storeHeight"
        ]
      },
      TOGGLE_SCROLL_HIGHLIGHT: {
        actions: [
          assign({
            scrollOnHighlight: (ctx, e) => _.get(e, "payload.checked")
          })
        ]
      },
      ADD_TIMESTAMP: {
        actions: assign((ctx, e) => {
          const { timestamps } = ctx;
          const { ts, err, index } = _.get(e, "payload");
          timestamps[index] = { ts, err, isValid: !ts && !err };
          return {
            timestamps
          };
        })
      },
      RESET: {
        actions: [
          assign({
            isOpen: false
          })
        ]
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
          console.info("DrawerMachine: Failed to load height");
          return ctx.height;
        }
      },
      fetchTimestamps: (_ctx, e) => async (callback) => {
        if (_.isEmpty(_.get(e, "payload.sources"))) return;
        resourceTSController.reset();
        resourceTSController.loadTimestamps(
          _.get(e, "payload.sources"),
          (ts, err, index) => {
            callback({ type: "ADD_TIMESTAMP", payload: { ts, err, index } });
          }
        );
      }
    }
  }
);

export default drawerMachine;
