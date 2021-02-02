import { Machine, assign } from "xstate";
import _ from "lodash";
import { api, getDateTsFromURL, stripArchiveURL } from "../../utils";

const parentMachine = Machine(
  {
    id: "parent",
    initial: "idle",
    context: {
      isFrameBusted: false,
      notFound: false,
      availableURL: null,
      availableDate: null
    },
    on: {
      SET_URL: {
        actions: assign({
          url: (_ctx, e) => stripArchiveURL(_.get(e, "payload.url"))
        })
      },
      TOGGLE_BUSTED_ERROR: {
        actions: assign({
          isFrameBusted: (_ctx, e) => _.get(e, "payload.value")
        })
      },
      TOGGLE_SW_ERROR: {
        actions: assign({
          isPageCached: (_ctx, e) => _.get(e, "payload.value")
        })
      },
      EXIT: {
        actions: "notifyExit"
      },
      CHECK_AVAILABILITY: "checkAvailability",
      CLOSE: "idle"
    },
    states: {
      idle: {
        on: {
          LOADED: {
            actions: [
              assign({
                loaded: true
              }),
              "updateVandalURL"
            ]
          }
        }
      },
      checkAvailability: {
        invoke: {
          src: "checkAvailability",
          onDone: {
            target: "processingAvailability",
            actions: assign({
              notFound: true,
              availableURL: (_ctx, e) => _.replace(_.get(e, "data.url"), /^http:\/\//, "https://"),
              availableDate: (_ctx, e) => _.get(getDateTsFromURL(_.get(e, "data.url")), "date")
            })
          },
          onError: "availabilityError"
        }
      },
      processingAvailability: {
        always: [
          {
            target: "snapshotFound",
            cond: "isSnapshotAvailable"
          },
          {
            target: "snapshotNotFound"
          }
        ]
      },
      snapshotFound: {},
      snapshotNotFound: {},
      availabilityError: {}
    }
  },
  {
    services: {
      checkAvailability: (ctx) => new Promise(async (resolve, reject) => {
        const [result, err] = await api(
          `https://chrome-api.archive.org/wayback/available?url=${ctx.url}`
        );

        if (err) {
          return reject(err);
        }

        return resolve({
          url: _.get(result, "archived_snapshots.closest.url")
        });
      })
    },
    guards: {
      isSnapshotAvailable: (ctx) => !!ctx.availableURL
    }
  }
);

export default parentMachine;
