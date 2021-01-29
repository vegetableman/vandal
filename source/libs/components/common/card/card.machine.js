import { Machine, assign, sendParent } from "xstate";
import { api, abort } from "../../../utils";

const ROOT_URL = "http://web.archive.org";

const cardMachine = Machine(
  {
    id: "card",
    initial: "idle",
    context: {
      url: null,
      date: null,
      showCard: null,
      card: null
    },
    on: {
      LOAD_SNAPSHOTS: {
        target: "loadingSnapshots",
        actions: assign((ctx, e) => ({
          url: _.get(e, "payload.url", ctx.url),
          date: _.get(e, "payload.date", ctx.date)
        }))
      },
      TOGGLE_CARD: {
        actions: assign({
          showCard: (_ctx, e) => e.value
        })
      },
      SHOW_CARD: {
        actions: assign({
          showCard: true,
          card: (_ctx, e) => _.get(e, "payload")
        })
      },
      HIDE_CARD: {
        actions: assign({
          showCard: false,
          card: null
        })
      },
      CLEANUP: {
        target: "idle",
        actions: assign(() => {
          abort({ meta: { type: "card" } });
          return {};
        })
      }
    },
    states: {
      idle: {},
      loadingSnapshots: {
        id: "loadingSnapshots",
        invoke: {
          src: "fetchSnapshots",
          after: {
            10000: "snapshotsError.timeout"
          },
          onDone: {
            target: "processingSnapshot",
            actions: [
              assign({
                card: (ctx, e) => {
                  const snapshots = _.map(
                    _.get(e, "data.snapshots"),
                    (item) => ({
                      value: +`${_.get(e, "data.date")}${_.padStart(
                        item[0],
                        6,
                        "0"
                      )}`,
                      status: item[1]
                    })
                  );
                  return {
                    ...ctx.card,
                    ts: snapshots
                  };
                }
              })
            ]
          },
          onError: {
            target: "snapshotsError.rejected"
          }
        }
      },
      processingSnapshot: {
        on: {
          "": [
            {
              target: "snapshotsLoaded",
              actions: sendParent((ctx) => ({
                type: "ON_SNAPSHOTS",
                payload: {
                  snapshots: _.get(ctx, "card.ts"),
                  date: _.get(ctx, "date")
                }
              }))
            }
          ]
        }
      },
      snapshotsLoaded: {},
      snapshotsError: {
        initial: "unknown",
        states: {
          unknown: {},
          rejected: {
            on: {
              RETRY: "#loadingSnapshots"
            }
          },
          timeout: {
            on: {
              RETRY: "#loadingSnapshots"
            }
          }
        }
      }
    }
  },
  {
    services: {
      // eslint-disable-next-line no-async-promise-executor
      fetchSnapshots: (ctx, e) => new Promise(async (resolve, reject) => {
        const date = _.get(e, "payload.date", ctx.date);
        const [data, err] = await api(
          `${ROOT_URL}/__wb/calendarcaptures/2?url=${encodeURIComponent(
            ctx.url
          )}&date=${date}`,
          {
            meta: { type: "card" }
          }
        );

        if (err) {
          return reject(err);
        }

        _.set(date, "__CACHED__", true);

        return resolve({
          snapshots: _.get(data, "items"),
          date
        });
      })
    }
  }
);

export default cardMachine;
