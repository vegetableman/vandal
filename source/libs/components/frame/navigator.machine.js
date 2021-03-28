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
                    // In case of server redirect, replace the last entry with new one.
                    if (transitionType === "redirect") {
                      const currentRecords = [
                        ..._.slice(
                          ctx.currentRecords,
                          0,
                          Math.max(ctx.currentIndex, 0)
                        ),
                        url
                      ];
                      return {
                        currentURL: _.get(e, "payload.url"),
                        currentRecords,
                        currentIndex: _.size(ctx.currentRecords) - 1
                      };
                    }

                    if (
                      (transitionType !== "auto" && _.indexOf(ctx.currentRecords, url) === ctx.currentIndex) ||
                      _.isEmpty(ctx.currentRecords) ||
                      _.size(ctx.currentRecords) === 1
                    ) {
                      return ctx;
                    }

                    let { currentIndex, currentRecords } = ctx;
                    // Handle <- | -> transitions
                    if (transitionType === "auto") {
                      if (_.nth(ctx.currentRecords, Math.max(ctx.currentIndex - 1, 0)) === url) {
                        currentIndex = Math.max(ctx.currentIndex - 1, 0);
                      } else if (_.nth(ctx.currentRecords, ctx.currentIndex + 1) === url) {
                        currentIndex += 1;
                      }
                    } else if (transitionType === "manual") {
                      // handles click on document with url already present in the record.
                      // A -> B -> click logo/home -> A
                      if (url === _.last(ctx.currentRecords)) {
                        currentIndex += 1;
                      } else {
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
                    }

                    return {
                      currentIndex,
                      currentRecords
                    };
                  })
                ]
              },
              UPDATE_HISTORY: {
                actions: [
                  assign((ctx, e) => {
                    const { allRecords = [], isReload } = ctx;

                    // Reload button
                    if (isReload) {
                      return { isReload: false };
                    }

                    const url = _.get(e, "payload.url");

                    // Right click -> Reload frame scenario
                    if (_.nth(ctx.currentRecords, ctx.currentIndex) === url) {
                      return ctx;
                    }

                    let { currentIndex, currentRecords } = ctx;

                    // Handles <- | -> transitions for history changes
                    if (_.get(e, "payload.type") === "auto" && !_.isEmpty(ctx.currentRecords)) {
                      // Handles Medium.com URL navigation
                      // Add URL to currentRecords if not present
                      if (_.indexOf(ctx.currentRecords, url) < 0) {
                        currentRecords = [
                          ..._.slice(
                            ctx.currentRecords,
                            0,
                            Math.max(currentIndex, 0)
                          ),
                          url
                        ];
                      }
                      if (_.nth(ctx.currentRecords, Math.max(ctx.currentIndex - 1, 0)) === url) {
                        currentIndex = Math.max(ctx.currentIndex - 1, 0);
                      } else if (_.nth(ctx.currentRecords, ctx.currentIndex + 1) === url) {
                        currentIndex += 1;
                      }
                    } else if (ctx.isBack || ctx.isForward) {
                      if (ctx.isBack) {
                        currentIndex = Math.max(currentIndex - 1, 0);
                      } else if (ctx.isForward) {
                        currentIndex += 1;
                      }
                    } else if (_.last(ctx.currentRecords) !== url &&
                    // to avoid entry in auto cases
                    _.indexOf(ctx.currentRecords, url) < 0) {
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
                  "navigateBack"
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
                  "navigateToURL"
                ]
              },
              RELOAD: {
                actions: [
                  assign(() => ({
                    isReload: true
                  })),
                  "reload"
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
