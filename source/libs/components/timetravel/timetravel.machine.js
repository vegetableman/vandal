/* eslint-disable consistent-return */
import { Machine, actions, spawn } from "xstate";
import memoizeOne from "memoize-one";
import {
  api, abort, getDateTimeFromTS, browser, parseDate
} from "../../utils";
import cardMachine from "../common/card/card.machine";

const { assign } = actions;

const ROOT_URL = "https://chrome-api.archive.org";
const MAX_COUNT_IN_YEAR = 36000;

const memoizedDateTimeFromTS = memoizeOne(getDateTimeFromTS);

export const getTSFromCurrentMonth = (
  type,
  months,
  selectedTS,
  currentDay,
  currentMonth
) => {
  const date = _.get(months, `[${currentMonth - 1}][${currentDay - 1}]`);
  const tsDtArray = _.get(date, "ts");
  const tsIndex = _.indexOf(tsDtArray, selectedTS);
  switch (type) {
    case "prev":
      return tsIndex > 0 ? tsDtArray[tsIndex - 1] : null;
    case "next":
      return tsIndex !== _.size(tsDtArray) - 1 ? tsDtArray[tsIndex + 1] : null;
    default:
      return null;
  }
};

export const getTSFromCurrentYear = (type, months, selectedTS) => {
  const tsArray = _.compact(_.flatten(_.map(_.flatten(months), "ts")));
  switch (type) {
    case "prev":
      return tsArray[_.indexOf(tsArray, selectedTS) - 1];
    case "next":
      return tsArray[_.indexOf(tsArray, selectedTS) + 1];
    default:
      return null;
  }
};

// Find day with snapshot in current year
export const findDayFromTs = (
  currentDay,
  currentMonth,
  months,
  selectedTS,
  dir
) => {
  const isPrev = dir === "prev";
  if (isPrev && currentDay === 1 && currentMonth === 1) {
    return;
  }

  const dayCount = _.size(months[currentMonth - 1]);
  if (!isPrev && dayCount === currentDay && currentMonth === 12) {
    return;
  }

  const tsArray = _.compact(_.flatten(_.map(_.flatten(months), "ts")));
  const tsMatch = isPrev ?
    tsArray[_.indexOf(tsArray, selectedTS) - 1] :
    tsArray[_.indexOf(tsArray, selectedTS) + 1];

  if (!tsMatch) {
    return;
  }
  const findDay = (pday, pmonth) => {
    let month = pmonth;
    let day = pday;
    let tsDayArr;

    if (isPrev) {
      // In same month
      if (day) {
        tsDayArr = _.get(months[month - 1][day - 1], "ts");
      } else if (month > 1) {
        // Check previous month
        month -= 1;
        day = _.size(months[month - 1]);
        tsDayArr = _.get(months[month - 1][day - 1], "ts");
      }
    } else if (day <= _.size(months[month - 1])) {
      tsDayArr = _.get(months[month - 1][day - 1], "ts");
    } else if (month < 12) {
      // Check next month
      month += 1;
      day = 1;
      tsDayArr = _.get(months[month - 1][day - 1], "ts");
    }

    const cnt = _.get(months[month - 1][day - 1], "cnt");

    if (!_.isEmpty(tsDayArr)) {
      return {
        month,
        day,
        ts: _.last(tsDayArr),
        size: _.size(tsDayArr),
        cnt
      };
    } if (isPrev && day > 0) {
      return findDay(day - 1, month);
    } if (!isPrev && day <= dayCount) {
      return findDay(day + 1, month);
    }
  };

  const result = findDay(
    isPrev ? currentDay - 1 : currentDay + 1,
    currentMonth
  );

  if (result) {
    return result;
  }

  const { month, day } = memoizedDateTimeFromTS(tsMatch) || {};
  return {
    month,
    day,
    ts: tsMatch
  };
};

export const findCalendarFromTS = (sparkline, year, dir) => {
  const isPrev = dir === "prev";
  const findTS = (y) => {
    const month = isPrev ?
      _.findLastIndex(sparkline[y], (m) => m > 0) :
      _.findIndex(sparkline[y], (m) => m > 0);
    if (month > -1) {
      return {
        year,
        month
      };
    }
    findTS(isPrev ? y - 1 : y + 1);
  };
  return findTS(isPrev ? year - 1 : year + 1);
};

const fetchCalendar = async (url, year) => {
  if (!url || !year) {
    return [null, null];
  }

  return api(
    `${ROOT_URL}/cdx/search/cdx?url=${url}&from=${`${year}0101`}&to=${`${year}1231`}`,
    {
      enableThrow: true
    }
  );
};

export const fetchMonth = async (url, month, year) => {
  const [response, err] = await api(
    `${ROOT_URL}/__wb/calendarcaptures/2?url=${url}&date=${
      year
    }${_.padStart(month + 1, 2, "0")}&groupby=day`
  );
  return [
    _.get(response, "items"),
    err
  ];
};

const memoizedFetchCalendar = memoizeOne(fetchCalendar, (arg1, arg2) => (
  arg1 === arg2 ||
    _.replace(arg1, "https://", "http://") ===
      _.replace(arg2, "https://", "http://")
));

const timetravelMachine = Machine(
  {
    id: "timetravel",
    initial: "idle",
    context: {
      url: null,
      sparkline: null,
      calendar: null,
      currentSnapshots: null,

      selectedTS: null,
      redirectedTS: null,
      redirectTSCollection: {},
      firstTS: null,
      lastTS: null,

      highlightedDay: null,

      currentDay: null,
      currentYear: null,
      currentMonth: null,

      showCard: false,
      card: null,
      dir: null,
      error: null,
      monthStates: {}
    },
    on: {
      SET_VIEW: {
        actions: assign({
          view: (_ctx, e) => _.get(e, "value")
        })
      },
      LOAD_SPARKLINE: {
        target: "loadingSparkline",
        actions: assign((_ctx, e) => ({
          url: _.get(e, "payload.url")
        }))
      },
      RESET_SPARKLINE: {
        target: "loadingSparkline",
        actions: assign((ctx, e) => ({
          url: _.get(e, "payload.url", ctx.url),
          selectedTS: _.get(e, "payload.ts"),
          redirectedTS: null,
          calendar: null
        }))
      },
      RESET_TS: {
        actions: assign((_ctx, e) => ({
          selectedTS: _.get(e, "payload.ts")
        }))
      },
      SET_REDIRECT_INFO: {
        target: "sparklineLoaded.loadingCalendar",
        actions: assign((ctx, e) => {
          const ts = _.get(e, "payload.redirectedTS");
          const isReset = _.get(e, "payload.isReset");
          const redirectTSCollection = ctx.redirectTSCollection || {};
          redirectTSCollection[ts] = ctx.selectedTS;

          // fetch all the snapshots for a date and select the appropriate one on redirect
          // handles the redirect in case of RESET_SPARKLINE
          const date = _.get(
            ctx.calendar,
            `[${ctx.currentYear}][[${ctx.currentMonth - 1}][${ctx.currentDay -
              1}]`
          );

          let { selectedTS } = ctx;
          if (
            isReset ||
            (!_.includes(_.get(date, "ts"), ctx.selectedTS) &&
              _.includes(_.get(date, "ts"), ts))
          ) {
            selectedTS = ts;
          }

          return {
            redirectedTS: ts,
            selectedTS,
            redirectTSCollection,
            currentMonth: _.get(memoizedDateTimeFromTS(selectedTS), "month"),
            currentYear: _.get(memoizedDateTimeFromTS(selectedTS), "year")
          };
        })
      },
      RESET_CALENDAR: {
        target: "sparklineLoaded.loadingCalendar",
        actions: assign((ctx, e) => ({
          selectedTS: _.get(e, "payload.ts", null),
          redirectedTS: null,
          currentYear: _.get(
            memoizedDateTimeFromTS(ctx.lastTS),
            "year",
            new Date().getFullYear()
          ),
          currentMonth: _.get(
            memoizedDateTimeFromTS(ctx.lastTS),
            "month",
            new Date().getMonth() + 1
          ),
          calendar: _.get(e, "payload.reset") ? null : ctx.calendar
        }))
      },
      GOTO__URL_TS: {
        target: "sparklineLoaded.loadingCalendar",
        actions: assign((ctx, e) => {
          const ts = _.get(e, "payload.ts");
          const selectedTS = ts !== ctx.selectedTS && ctx.redirectTSCollection[ts] ?
            ctx.redirectTSCollection[ts] :
            ts;
          return {
            selectedTS,
            redirectedTS:
              ctx.selectedTS !== ts && ctx.redirectTSCollection[ts] ? ts : null,
            currentMonth: _.get(memoizedDateTimeFromTS(selectedTS), "month"),
            currentYear: _.get(memoizedDateTimeFromTS(selectedTS), "year"),
            currentDay: _.get(memoizedDateTimeFromTS(selectedTS), "day")
          };
        })
      },
      HIDE_LIMIT_TOOLTIP: {
        actions: assign({
          showLimitTooltip: false
        })
      },
      ON_SNAPSHOTS: {
        actions: assign((ctx, e) => {
          const { month, day, year } = parseDate(
            _.get(e, "payload.date")
          );
          const snapshots = _.get(e, "payload.snapshots");
          const { calendar } = ctx;
          _.set(calendar, `${year}.${month - 1}.${day - 1}.__CACHED__`, true);
          _.set(
            calendar,
            `${year}.${month - 1}.${day - 1}.ts`,
            _.map(_.map(snapshots, "value"), (s) => +s)
          );
          _.set(
            calendar,
            `${year}.${month - 1}.${day - 1}.st`,
            _.map(snapshots, "status")
          );
        })
      },
      UPDATE_CALENDAR_CB: {
        actions: assign({
          calendar: (_ctx, e) => _.get(e, "payload.calendar"),
          monthStates: (_ctx, e) => _.get(e, "payload.monthStates")
        })
      },
      SET_MONTH_STATE: {
        actions: assign({
          monthStates: (ctx, e) => {
            const { monthStates } = ctx;
            const {
              loading, month, year, error
            } = _.get(e, "payload");
            _.set(monthStates, `${year}.${month}`, { loading, error });
            return { ...monthStates };
          }
        })
      },
      SET_CALENDAR: {
        actions: assign({
          calendar: (_ctx, e) => _.get(e, "value")
        })
      }
    },
    states: {
      idle: {
        entry: [
          assign({
            cardRef: () => spawn(cardMachine)
          })
        ]
      },
      loadingSparkline: {
        id: "loadingSparkline",
        after: {
          30000: "sparklineError.timeout"
        },
        invoke: {
          id: "fetchSparkline",
          src: "fetchSparkline",
          onDone: {
            target: "processingSparkline",
            actions: [
              assign({
                sparkline: (_ctx, e) => _.get(e, "data.years"),
                firstTS: (_ctx, e) => +_.get(e, "data.first_ts"),
                lastTS: (_ctx, e) => +_.get(e, "data.last_ts"),
                currentMonth: (_ctx, e) => _.get(
                  memoizedDateTimeFromTS(
                    +_.get(e, "data.ts", _.get(e, "data.last_ts"))
                  ),
                  "month"
                ),
                currentYear: (_ctx, e) => _.get(
                  memoizedDateTimeFromTS(
                    +_.get(e, "data.ts", _.get(e, "data.last_ts"))
                  ),
                  "year"
                )
              }),
              assign({
                isOverCapacity: (ctx) => _.reduce(
                  _.get(ctx.sparkline, ctx.currentYear),
                  (a, b) => a + b,
                  0
                ) > MAX_COUNT_IN_YEAR
              }),
              assign({
                showLimitTooltip: (ctx) => ctx.isOverCapacity
              })
            ]
          },
          onError: {
            target: "sparklineError.rejected",
            actions: assign({
              error: (_context, event) => event.data
            })
          }
        }
      },
      sparklineError: {
        on: {
          RELOAD_SPARKLINE_ON_ERROR: {
            target: "#loadingSparkline"
          }
        },
        states: {
          rejected: {
            on: {
              RETRY: "#loadingSparkline"
            }
          },
          timeout: {
            on: {
              RETRY: "#loadingSparkline"
            }
          }
        }
      },
      processingSparkline: {
        always: [
          {
            target: "noSparklineFound",
            cond: "isSparklineEmpty"
          },
          {
            target: "sparklineLoaded"
          }
        ]
      },
      noSparklineFound: {
        entry: [
          assign({
            selectedTS: null,
            redirectedTS: null
          }),
          "notifyNoSparkline"
        ],
        on: {
          RETRY: {
            target: "#loadingSparkline",
            actions: assign((_ctx, e) => ({
              url: _.get(e, "payload.url")
            }))
          }
        }
      },
      sparklineLoaded: {
        initial: "unknown",
        states: {
          unknown: {
            on: {
              LOAD_CALENDAR: "loadingCalendar"
            }
          },
          loadingCalendar: {
            id: "loadingCalendar",
            after: {
              30000: "calendarError.timeout"
            },
            invoke: {
              id: "fetchCalendar",
              src: "fetchCalendar",
              onDone: {
                target: "processingCalendar",
                actions: [
                  "setCalendar",
                  "setSelectedTS",
                  "setSelectedDay",
                  "updateRedirectCollection",
                  "setLastTS",
                  "updateCard"
                ]
              },
              onError: {
                target: "calendarError.rejected",
                actions: assign({
                  error: (_context, event) => event.data
                })
              }
            }
          },
          calendarError: {
            initial: "unknown",
            on: {
              RELOAD_CALENDAR_ON_ERROR: {
                target: "#loadingCalendar"
              }
            },
            states: {
              unknown: {},
              rejected: {
                on: {
                  RETRY: "#loadingCalendar"
                }
              },
              timeout: {
                on: {
                  RETRY: "#loadingCalendar"
                }
              }
            }
          },
          processingCalendar: {
            always: [
              {
                target: "noCalendarFound",
                cond: "isCalendarEmpty"
              },
              {
                target: "calendarLoaded"
              }
            ]
          },
          noCalendarFound: {
            on: {
              RETRY: "#loadingCalendar"
            }
          },
          calendarLoaded: {
            invoke: {
              src: "loadOtherMonths"
            },
            on: {
              LOAD_OTHER_MONTHS: {
                target: "calendarLoaded"
              },
              RELOAD_SPARKLINE: {
                target: "#loadingSparkline"
              },
              RELOAD_CALENDAR: {
                target: "loadingCalendar"
              },
              GOTO__FIRST_TS: {
                target: "loadingCalendar",
                actions: [
                  assign({
                    selectedTS: (ctx) => ctx.firstTS
                  }),
                  assign({
                    currentDay: (ctx) => _.get(memoizedDateTimeFromTS(ctx.selectedTS), "day"),
                    currentMonth: (ctx) => _.get(memoizedDateTimeFromTS(ctx.selectedTS), "month"),
                    currentYear: (ctx) => _.get(memoizedDateTimeFromTS(ctx.selectedTS), "year")
                  }),
                  "setBrowserURL"
                ]
              },
              GOTO__TS_DATE: {
                actions: [
                  assign({
                    selectedTS: (_ctx, e) => _.get(e, "payload.ts"),
                    currentDay: (_ctx, e) => _.get(e, "payload.day"),
                    currentMonth: (ctx, e) => _.get(e, "payload.month", ctx.currentMonth)
                  }),
                  "setBrowserURL"
                ]
              },
              GOTO__TS_YEAR: {
                target: "loadingCalendar",
                actions: assign({
                  currentMonth: (_ctx, e) => _.get(e, "payload.month"),
                  currentYear: (_ctx, e) => _.get(e, "payload.year")
                })
              },
              GOTO__CURRENT_SEL_TS: {
                target: "loadingCalendar",
                actions: assign((_ctx, e) => {
                  const ts = e.value;
                  return {
                    selectedTS: ts,
                    currentMonth: _.get(memoizedDateTimeFromTS(ts), "month"),
                    currentYear: _.get(memoizedDateTimeFromTS(ts), "year"),
                    currentDay: _.get(memoizedDateTimeFromTS(ts), "day")
                  };
                })
              },
              NAVIGATETO__TS: {
                actions: [
                  assign((_ctx, e) => {
                    const ts = e.value;
                    return {
                      selectedTS: ts,
                      redirectedTS: null,
                      currentMonth: _.get(memoizedDateTimeFromTS(ts), "month"),
                      currentYear: _.get(memoizedDateTimeFromTS(ts), "year"),
                      currentDay: _.get(memoizedDateTimeFromTS(ts), "day")
                    };
                  }),
                  "setBrowserURL"
                ]
              },
              GOTO__MONTHYEAR: {
                target: "loadingCalendar",
                actions: assign({
                  currentYear: (ctx, e) => _.get(e, "payload.year", ctx.currentYear),
                  currentMonth: (ctx, e) => _.get(e, "payload.month", ctx.currentMonth)
                })
              },
              GOTO__LAST_TS: {
                target: "loadingCalendar",
                actions: [
                  assign({
                    selectedTS: (ctx) => ctx.lastTS
                  }),
                  assign({
                    currentDay: (ctx) => _.get(memoizedDateTimeFromTS(ctx.selectedTS), "day"),
                    currentMonth: (ctx) => _.get(memoizedDateTimeFromTS(ctx.selectedTS), "month"),
                    currentYear: (ctx) => _.get(memoizedDateTimeFromTS(ctx.selectedTS), "year")
                  }),
                  "setBrowserURL"
                ]
              },
              SET_DATE_HIGHLIGHTED: {
                actions: assign({
                  highlightedDay: (_ctx, e) => e.value
                })
              },
              CLEANUP: {
                actions: assign(() => {
                  abort();
                  return {};
                })
              }
            }
          }
        }
      }
    }
  },
  {
    actions: {
      setCalendar: assign({
        calendar: (ctx, e) => {
          const { calendar, currentYear } = ctx;
          if (
            _.get(calendar, currentYear) &&
            _.get(ctx, "calendar.url") === ctx.url &&
            !_.get(e, "data.payload.force")
          ) {
            return calendar;
          }
          return _.get(e, "data.calendar");
        }
      }),
      setSelectedTS: assign({
        selectedTS: (ctx, e) => {
          if (
            ctx.selectedTS &&
            ctx.redirectTSCollection[ctx.redirectedTS] === ctx.selectedTS
          ) {
            return ctx.selectedTS;
          }
          const month = _.get(e, "data.payload.month");
          if (!month) return ctx.selectedTS;
          const months = _.get(ctx.calendar, ctx.currentYear);
          const tsArray = _.compact(
            _.flatten(_.map(_.flatten(months[month - 1]), "ts"))
          );
          const dir = _.get(e, "data.payload.meta.dir");
          if (dir === "prev") {
            return _.last(tsArray);
          } if (dir === "next") {
            return tsArray[0];
          }
          return ctx.selectedTS;
        }
      }),
      setSelectedDay: assign({
        currentDay: (ctx) => _.get(
          memoizedDateTimeFromTS(ctx.selectedTS),
          "day",
          ctx.currentDay
        )
      }),
      updateRedirectCollection: assign({
        redirectTSCollection: (ctx) => {
          const { redirectTSCollection } = ctx;
          if (_.get(redirectTSCollection, ctx.selectedTS)) {
            delete redirectTSCollection[ctx.selectedTS];
          }
          return redirectTSCollection;
        }
      }),
      setLastTS: assign({
        lastTS: (ctx, e) => _.get(e, "data.lastTS", ctx.lastTS)
      }),
      setBrowserURL: (ctx) => {
        browser.navigate(
          `https://web.archive.org/web/${ctx.selectedTS}/${ctx.url}`
        );
      },
      updateCard: (ctx) => {
        const cardCtx = _.get(ctx, "cardRef.state.context");
        if (ctx.highlightedDay && cardCtx.showCard) {
          const date = _.get(
            ctx.calendar,
            `[${ctx.currentYear}][${ctx.currentMonth -
              1}][${ctx.highlightedDay - 1}]`
          );
          const status = _.get(date, "st", []);
          ctx.cardRef.send({
            type: "SHOW_CARD",
            payload: {
              ...cardCtx.card,
              ...{
                ts: _.map(_.get(date, "ts"), (value, i) => ({ value, status: status[i] }))
              }
            }
          });
        }
      },
      notifyNoSparkline: () => {
        chrome.runtime.sendMessage({
          message: "__VANDAL__CLIENT__NOSPARKLINEFOUND"
        });
      }
    },
    services: {
      fetchSparkline: (ctx, e) => new Promise(async (resolve, reject) => {
        const [sparklineData, err] = await api(
          `${ROOT_URL}/__wb/sparkline?url=${encodeURIComponent(
            ctx.url
          )}&collection=web&output=json`
        );

        if (err) {
          return reject(err);
        }

        return resolve({
          ...sparklineData,
          ts: _.get(e, "payload.ts"),
          force: _.get(e, "payload.force")
        });
      }),
      fetchCalendar: (ctx, e) => new Promise(async (resolve, reject) => {
        const force = _.get(e, "payload.force");
        if (force) {
          memoizedFetchCalendar.apply({}, []);
        }

        if (
          !force &&
            _.get(ctx.calendar, `${ctx.currentYear}.${ctx.currentMonth - 1}`) &&
            (!_.get(e, "payload.url") ||
              _.get(ctx.calendar, "url") === _.get(e, "payload.url"))
        ) {
          return resolve({
            months: ctx.calendar[ctx.currentYear],
            payload: e.payload
          });
        }

        let response;
        let err;
        let calendar;
        let lastTS;

        if (ctx.isOverCapacity) {
          [response, err] = await api(
            `${ROOT_URL}/__wb/calendarcaptures/2?url=${ctx.url}&date=${
              ctx.currentYear
            }${_.padStart(ctx.currentMonth, 2, "0")}&groupby=day`
          );

          if (err) {
            return reject(err);
          }

          calendar = _.reduce(
            response.items,
            (acc, item) => {
              const date = _.nth(item, 0);
              _.set(
                acc,
                `${ctx.currentYear}.${ctx.currentMonth - 1}.${_.parseInt(
                  date
                ) - 1}.cnt`,
                _.parseInt(_.nth(item, 2))
              );
              return acc;
            },
            ctx.calendar || {}
          );
        } else {
          try {
            [response, err] = await memoizedFetchCalendar(
              ctx.url,
              ctx.currentYear
            );
          } catch (ex) {
            memoizedFetchCalendar.apply({}, []);
            err = ex.message;
          }

          if (err) {
            return reject(err);
          }

          calendar = _.reduce(
            _.compact(_.split(response, "\n")),
            (acc, data) => {
              const ts = _.toNumber(_.nth(data.split(" "), 1));
              const stData = _.toNumber(_.nth(data.split(" "), 4));
              const st = !_.isNaN(stData) ? stData : "";
              const { year, month, day } = getDateTimeFromTS(ts);
              if (
                _.indexOf(
                  _.get(acc, `${year}.${month - 1}.${day - 1}.ts`),
                  ts
                ) > -1
              ) {
                return acc;
              }
              _.set(
                acc,
                `${year}.${month - 1}.${day - 1}.ts`,
                _.concat(
                  _.get(acc, `${year}.${month - 1}.${day - 1}.ts`, []),
                  ts
                )
              );
              _.set(
                acc,
                `${year}.${month - 1}.${day - 1}.st`,
                _.concat(
                  _.get(acc, `${year}.${month - 1}.${day - 1}.st`, []),
                  st
                )
              );
              _.set(
                acc,
                `${year}.${month - 1}.${day - 1}.cnt`,
                _.size(_.get(acc, `${year}.${month - 1}.${day - 1}.ts`))
              );
              return acc;
            },
            {
              ...ctx.calendar,
              [ctx.currentYear]: [
                ...Array.from(new Array(12).keys()).map(() => [])
              ]
            }
          );

          const { year: lastTSYear } = getDateTimeFromTS(ctx.lastTS);
          if (ctx.currentYear === lastTSYear) {
            lastTS = _.last(
              _.get(
                _.last(
                  _.nth(
                    _.get(calendar, ctx.currentYear),
                    ctx.currentMonth - 1
                  )
                ),
                "ts"
              )
            );
          }
        }

        calendar.url = ctx.url;

        return resolve({ calendar, lastTS, payload: e.payload });
      }),
      loadOtherMonths: (ctx) => (callback) => {
        let response;
        let err;
        if (!(ctx.isOverCapacity && ctx.view === "graph")) {
          return;
        }
        const loadMonth = async (month) => {
          [response, err] = await api(
            `${ROOT_URL}/__wb/calendarcaptures/2?url=${ctx.url}&date=${
              ctx.currentYear
            }${_.padStart(month + 1, 2, "0")}&groupby=day`
          );
          const { monthStates } = ctx;

          if (err) {
            _.set(monthStates, `${ctx.currentYear}.${month}`, { loading: false, error: true });
            callback({
              type: "UPDATE_CALENDAR_CB",
              payload: { calendar: ctx.calendar, monthStates: { ...monthStates } }
            });
            return;
          }

          const calendar = _.reduce(
            response.items,
            (acc, item) => {
              const date = _.nth(item, 0);
              _.set(
                acc,
                `${ctx.currentYear}.${month}.${_.parseInt(
                  date
                ) - 1}.cnt`,
                _.parseInt(_.nth(item, 2))
              );
              return acc;
            },
            ctx.calendar || {}
          );

          _.set(monthStates, `${ctx.currentYear}.${month}`, { loading: false, error: false });

          callback({
            type: "UPDATE_CALENDAR_CB",
            payload: { calendar, monthStates: { ...monthStates } }
          });
        };

        for (let i = 0; i < 12; i++) {
          if (_.nth(_.get(ctx.sparkline, ctx.currentYear), i) > 0 &&
          !_.get(ctx.calendar, `${ctx.currentYear}.${i}`)) {
            loadMonth(i);
          }
        }
      }
    },
    guards: {
      isSparklineEmpty: (ctx) => _.isEmpty(ctx.sparkline),
      isCalendarEmpty: (ctx) => _.isEmpty(_.get(ctx.calendar, ctx.currentYear))
    }
  }
);

export default timetravelMachine;
