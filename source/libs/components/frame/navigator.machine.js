import { Machine, actions } from "xstate";
import _ from "lodash";
import { historyDB } from "../../utils/storage";
import { longMonthNames } from "../../utils";

const getCurrentDate = () => {
  const currentDate = new Date();
  return `${currentDate.getDate()} ${
    longMonthNames[currentDate.getMonth()]
  }, ${currentDate.getFullYear()}`;
};

const { assign } = actions;
const navigatorMachine = Machine(
  {
    id: "navigator",
    initial: "idle",
    context: {
      allRecords: [],
      currentRecords: [],
      currentIndex: 0,
      url: null,
      currentURL: null
    },
    states: {
      idle: {
        invoke: {
          id: "loadHistory",
          src: "loadHistory",
          onDone: {
            target: "historyLoaded",
            actions: assign({
              allRecords: (_ctx, e) => _.get(e, "data.records", [])
            })
          }
        }
      },
      historyLoaded: {
        initial: "unknown",
        states: {
          unknown: {
            on: {
              UPDATE_HISTORY_ONCOMMIT: {
                actions: [
                  assign((ctx, e) => {
                    const transitionType = _.get(e, "payload.type");
                    const url = _.get(e, "payload.url");
                    if (transitionType === "redirect") {
                      return {
                        currentURL: _.get(e, "payload.url"),
                        currentRecords: [...ctx.currentRecords, url]
                      };
                    }

                    if (
                      transitionType !== "auto" ||
                      _.isEmpty(ctx.currentRecords) ||
                      _.size(ctx.currentRecords) === 1
                    ) {
                      return ctx;
                    }

                    let currentIndex;

                    if (
                      _.lastIndexOf(ctx.prevRecords, url) < ctx.previousIndex
                    ) {
                      currentIndex = Math.max(ctx.previousIndex - 1, 0);
                    } else {
                      currentIndex = Math.min(
                        ctx.previousIndex + 1,
                        _.size(ctx.prevRecords) - 1
                      );
                    }

                    return {
                      currentURL: _.get(e, "payload.url"),
                      currentRecords: ctx.prevRecords,
                      currentIndex
                    };
                  })
                ]
              },
              UPDATE_HISTORY: {
                actions: [
                  assign((ctx, e) => {
                    const { allRecords = [] } = ctx;
                    const url = _.get(e, "payload.url");
                    const transitionType = _.get(e, "payload.type");

                    let currentRecords = [];
                    let { currentIndex } = ctx;

                    if (
                      (transitionType === "auto" &&
                        !_.isEmpty(ctx.currentRecords) &&
                        _.indexOf(ctx.currentRecords, url) > -1) ||
                      ctx.isBack ||
                      ctx.isForward ||
                      ctx.isReload ||
                      url === _.last(ctx.currentRecords)
                    ) {
                      currentRecords = ctx.currentRecords;
                      if (ctx.isBack) {
                        currentIndex = Math.max(currentIndex - 1, 0);
                      } else if (ctx.isForward) {
                        currentIndex = Math.max(currentIndex + 1, 0);
                      }
                    } else if (
                      _.last(ctx.currentRecords) === url &&
                      currentIndex === _.lastIndexOf(ctx.currentRecords, url)
                    ) {
                      // if reload, do nothing
                    } else if (_.last(ctx.currentRecords) !== url) {
                      currentRecords = [
                        ..._.slice(
                          ctx.currentRecords,
                          0,
                          Math.max(currentIndex + 1, 0)
                        ),
                        url
                      ];
                      currentIndex = Math.max(_.size(currentRecords) - 1, 0);
                    }

                    return {
                      isBack: false,
                      isForward: false,
                      isReload: false,
                      currentURL: url,
                      prevRecords: ctx.currentRecords,
                      previousIndex: ctx.currentIndex,
                      currentIndex,
                      allRecords:
                        _.get(_.last(allRecords), "url") !== url ?
                          [
                            ...allRecords,
                            {
                              url,
                              date: getCurrentDate()
                            }
                          ] :
                          allRecords,
                      currentRecords
                    };
                  }),
                  "persistHistory"
                ]
              },
              CLEAR_HISTORY: {
                actions: [
                  assign({
                    allRecords: () => []
                  }),
                  "clearHistory"
                ]
              },
              GO_BACK: {
                actions: [
                  assign((ctx) => {
                    const { currentRecords, currentIndex } = ctx;
                    return {
                      isBack: true,
                      isForward: false,
                      currentURL: _.nth(
                        currentRecords,
                        Math.max(currentIndex - 1, 0)
                      )
                    };
                  }),
                  "updateVandalURL"
                ]
              },
              GO_FORWARD: {
                actions: [
                  assign((ctx) => {
                    const { currentRecords, currentIndex } = ctx;
                    return {
                      isForward: true,
                      isBack: false,
                      currentURL: _.nth(
                        currentRecords,
                        Math.min(currentIndex + 1, _.size(currentRecords) - 1)
                      )
                    };
                  }),
                  "updateVandalURL"
                ]
              },
              RELOAD: {
                actions: [
                  assign(() => ({
                    isReload: true
                  })),
                  "reloadVandalURL"
                ]
              }
            }
          }
        }
      }
    }
  },
  {
    actions: {
      persistHistory: async (ctx, e) => {
        const test = _.get(e, "payload.meta.test");
        if (!test) {
          historyDB.setRecords(ctx.url, ctx.allRecords);
        }
      },
      clearHistory: async (ctx) => {
        await historyDB.clearRecords(ctx.url);
      }
    },
    services: {
      loadHistory: async (ctx) => {
        const [records, err] = await historyDB.getRecords(ctx.url);
        return { records: !err ? records : [] };
      }
    }
  }
);

export default navigatorMachine;
