import { Machine, actions } from 'xstate';
import _ from 'lodash';
import { historyDB } from '../../utils/storage';
const { assign } = actions;
const navigatorMachine = Machine(
  {
    id: 'navigator',
    initial: 'idle',
    context: {
      allRecords: [],
      currentRecords: [],
      url: null,
      currentURL: null,
      isBackEnabled: false,
      isForwardEnabled: false
    },
    states: {
      idle: {
        invoke: {
          id: 'loadHistory',
          src: 'loadHistory',
          onDone: {
            target: 'historyLoaded',
            actions: assign({
              allRecords: (_ctx, e) => _.get(e, 'data.records', [])
            })
          }
        }
      },
      historyLoaded: {
        initial: 'unknown',
        states: {
          unknown: {
            on: {
              UPDATE_HISTORY: {
                actions: [
                  assign((ctx, e) => {
                    const { allRecords = [] } = ctx;
                    const currentURL = _.get(e, 'payload.url');
                    const redirect = _.get(e, 'payload.redirect');

                    let currentRecords = [];

                    if (redirect) {
                      currentRecords = [
                        ..._.slice(
                          ctx.currentRecords,
                          0,
                          _.indexOf(ctx.currentRecords, ctx.currentURL)
                        ),
                        currentURL
                      ];
                    } else if (_.includes(ctx.currentRecords, currentURL)) {
                      currentRecords = [...ctx.currentRecords];
                    } else if (
                      _.indexOf(ctx.currentRecords, ctx.currentURL) !==
                      _.size(ctx.currentRecords) - 1
                    ) {
                      currentRecords = [
                        ..._.slice(
                          ctx.currentRecords,
                          0,
                          _.indexOf(ctx.currentRecords, ctx.currentURL) + 1
                        ),
                        currentURL
                      ];
                    } else {
                      currentRecords = [...ctx.currentRecords, currentURL];
                    }

                    console.log(
                      'UPDATE_HISTORY:browserHistory:',
                      currentRecords
                    );

                    return {
                      currentURL,
                      allRecords: !_.includes(allRecords, currentURL)
                        ? [...allRecords, currentURL]
                        : allRecords,
                      currentRecords
                    };
                  }),
                  'persistHistory'
                ]
              },
              CLEAR_HISTORY: {
                actions: [
                  assign({
                    allRecords: () => {
                      return [];
                    }
                  }),
                  'clearHistory'
                ]
              },
              GO_BACK: {
                actions: [
                  assign((ctx, e) => {
                    const { currentRecords, currentURL } = ctx;
                    return {
                      currentURL: _.nth(
                        currentRecords,
                        Math.max(_.indexOf(currentRecords, currentURL) - 1, 0)
                      )
                    };
                  }),
                  'updateVandalURL'
                ]
              },
              GO_FORWARD: {
                actions: [
                  assign((ctx, e) => {
                    const { currentRecords, currentURL } = ctx;
                    return {
                      currentURL: _.nth(
                        currentRecords,
                        Math.min(
                          _.lastIndexOf(currentRecords, currentURL) + 1,
                          _.size(currentRecords) - 1
                        )
                      )
                    };
                  }),
                  'updateVandalURL'
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
      persistHistory: async ctx => {
        console.log('persistHistory:', ctx.currentURL);
        try {
          const isEnabled = await historyDB.isEnabled();
          if (!isEnabled) return;
          historyDB.addRecord(ctx.url, ctx.currentURL);
        } catch (e) {}
      },
      clearHistory: async ctx => {
        await historyDB.clearRecords(ctx.url);
      }
    },
    services: {
      loadHistory: async ctx => {
        console.log('loadHistory----', ctx.url);
        const [records, err] = await historyDB.getRecords(ctx.url);
        console.log('db: ', records);
        return { records: !err ? records : [] };
      }
    }
  }
);

export default navigatorMachine;
