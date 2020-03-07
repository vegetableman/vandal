import { Machine, send, actions } from 'xstate';
import memoizeOne from 'memoize-one';
import { api, abort, getDateTimeFromTS, browser } from '../../utils';
const { assign } = actions;

const ROOT_URL = 'https://web.archive.org';

const memoizedDateTimeFromTS = memoizeOne(getDateTimeFromTS);

export const getTSFromCurrentMonth = (
  type,
  months,
  selectedTS,
  currentDay,
  currentMonth
) => {
  const date = _.get(months, `[${currentMonth - 1}][${currentDay - 1}]`);
  const tsDtArray = _.get(date, 'ts');
  const tsIndex = _.indexOf(tsDtArray, selectedTS);
  switch (type) {
    case 'prev':
      return tsIndex > 0 ? tsDtArray[tsIndex - 1] : null;
    case 'next':
      return tsIndex !== _.size(tsDtArray) - 1 ? tsDtArray[tsIndex + 1] : null;
  }
};

export const getTSFromCurrentYear = (type, months, selectedTS) => {
  const tsArray = _.compact(_.flatten(_.map(_.flatten(months), 'ts')));
  switch (type) {
    case 'prev':
      return tsArray[_.indexOf(tsArray, selectedTS) - 1];
    case 'next':
      return tsArray[_.indexOf(tsArray, selectedTS) + 1];
  }
};

export const findDayFromTs = (
  currentDay,
  currentMonth,
  months,
  selectedTS,
  dir
) => {
  const isPrev = dir === 'prev';
  if (isPrev && currentDay === 1 && currentMonth === 1) {
    return;
  }

  const dayCount = _.size(months[currentMonth - 1]);
  if (!isPrev && dayCount === currentDay && currentMonth === 12) {
    return;
  }

  const tsArray = _.compact(_.flatten(_.map(_.flatten(months), 'ts')));
  const tsMatch = isPrev
    ? tsArray[_.indexOf(tsArray, selectedTS) - 1]
    : tsArray[_.indexOf(tsArray, selectedTS) + 1];

  if (!tsMatch) {
    return;
  }

  const findDay = (day, month) => {
    let tsDayArr;

    if (isPrev) {
      if (day) {
        tsDayArr = _.get(months[month - 1][day - 1], 'ts');
      } else {
        month = month - 1;
        day = _.size(months[month - 1]);
        tsDayArr = _.get(months[month - 1][day - 1], 'ts');
      }
    } else {
      if (day < _.size(months[month - 1])) {
        tsDayArr = _.get(months[month - 1][day - 1], 'ts');
      } else {
        month = month + 1;
        day = 1;
        tsDayArr = _.get(months[month][day - 1], 'ts');
      }
    }

    if (!_.isEmpty(tsDayArr)) {
      return {
        month,
        day,
        ts: _.last(tsDayArr)
      };
    } else if (isPrev && day > 0) {
      findDay(day - 1, month);
    } else if (!isPrev && day <= dayCount) {
      findDay(day + 1, month);
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
  const isPrev = dir === 'prev';
  const findTS = year => {
    const month = isPrev
      ? _.findLastIndex(sparkline[year], m => m > 0)
      : _.findIndex(sparkline[year], m => m > 0);
    if (month > -1) {
      return {
        year,
        month
      };
    }
    findTS(isPrev ? year - 1 : year + 1);
  };
  return findTS(isPrev ? year - 1 : year + 1);
};

const fetchCalendar = async (url, year) => {
  if (!url || !year) {
    return [null, null];
  }
  return await api(
    `https://web.archive.org/__wb/calendarcaptures?url=${encodeURIComponent(
      url
    )}&selected_year=${year}`,
    {
      noCacheReq: true,
      noCacheRes: true,
      enableThrow: true
    }
  );
};

const memoizedFetchCalendar = memoizeOne(fetchCalendar, (arg1, arg2) => {
  return (
    arg1 === arg2 ||
    _.replace(arg1, 'https://', 'http://') ===
      _.replace(arg2, 'https://', 'http://')
  );
});

const timetravelMachine = Machine(
  {
    id: 'timetravel',
    initial: 'idle',
    context: {
      url: null,
      months: null,
      sparkline: null,

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
      error: null
    },
    on: {
      LOAD_SPARKLINE: {
        target: 'loadingSparkline',
        actions: assign((_ctx, e) => {
          return {
            url: _.get(e, 'payload.url'),
            redirectedTS: null
          };
        })
      },
      RESET__CALENDAR: {
        target: 'loadingSparkline',
        actions: assign((_ctx, e) => {
          return {
            url: _.get(e, 'payload.url'),
            selectedTS: _.get(e, 'payload.ts', null),
            currentYear: null,
            currentMonth: (_ctx, e) =>
              _.get(memoizedDateTimeFromTS(ctx.lastTS), 'month'),
            currentYear: (_ctx, e) =>
              _.get(memoizedDateTimeFromTS(ctx.lastTS), 'year'),
            redirectedTS: null
          };
        })
      },
      SET_REDIRECT_INFO: {
        target: 'sparklineLoaded.loadingCalendar',
        actions: assign((_ctx, e) => {
          const ts = _.get(e.payload, 'redirectedTS');
          return {
            redirectedTS: ts,
            redirectTSCollection: _.get(e.payload, 'redirectTSCollection'),
            currentMonth: _.get(memoizedDateTimeFromTS(ts), 'month'),
            currentYear: _.get(memoizedDateTimeFromTS(ts), 'year'),
            currentDay: _.get(memoizedDateTimeFromTS(ts), 'day')
          };
        })
      },
      RESET__TS: {
        target: 'sparklineLoaded.loadingCalendar',
        actions: assign((ctx, _e) => {
          return {
            selectedTS: null,
            redirectedTS: null,
            currentYear: _.get(
              memoizedDateTimeFromTS(ctx.lastTS),
              'year',
              new Date().getFullYear()
            ),
            currentMonth: _.get(
              memoizedDateTimeFromTS(ctx.lastTS),
              'month',
              new Date().getMonth() + 1
            )
          };
        })
      },
      GOTO__LINK_TS: {
        target: 'sparklineLoaded.loadingCalendar',
        actions: assign((ctx, e) => {
          const ts = _.get(e, 'payload.value');
          return {
            selectedTS: ctx.redirectTSCollection[ts] || ts,
            redirectedTS: ctx.redirectTSCollection[ts] ? ts : null,
            currentMonth: _.get(memoizedDateTimeFromTS(ts), 'month'),
            currentYear: _.get(memoizedDateTimeFromTS(ts), 'year'),
            currentDay: _.get(memoizedDateTimeFromTS(ts), 'day')
          };
        })
      }
    },
    states: {
      idle: {},
      loadingSparkline: {
        id: 'loadingSparkline',
        after: {
          30000: 'sparklineError.timeout'
        },
        invoke: {
          id: 'fetchSparkline',
          src: 'fetchSparkline',
          onDone: {
            target: 'processingSparkline',
            actions: assign({
              sparkline: (_ctx, e) => _.get(e, 'data.years'),
              firstTS: (_ctx, e) => +_.get(e, 'data.first_ts'),
              lastTS: (_ctx, e) => +_.get(e, 'data.last_ts'),
              currentMonth: (_ctx, e) =>
                _.get(
                  memoizedDateTimeFromTS(+_.get(e, 'data.last_ts')),
                  'month'
                ),
              currentYear: (_ctx, e) =>
                _.get(memoizedDateTimeFromTS(+_.get(e, 'data.last_ts')), 'year')
            })
          },
          onError: {
            target: 'sparklineError.rejected',
            actions: assign({
              error: (_context, event) => {
                console.log('event: ', event.data);
                return event.data;
              }
            })
          }
        }
      },
      sparklineError: {
        on: {
          RELOAD_SPARKLINE_ON_ERROR: {
            target: '#loadingSparkline'
          }
        },
        states: {
          rejected: {
            on: {
              RETRY: '#loadingSparkline'
            }
          },
          timeout: {
            on: {
              RETRY: '#loadingSparkline'
            }
          }
        }
      },
      processingSparkline: {
        on: {
          '': [
            {
              target: 'noSparklineFound',
              cond: 'isSparklineEmpty'
            },
            {
              target: 'sparklineLoaded'
            }
          ]
        }
      },
      noSparklineFound: {
        on: {
          RETRY: {
            target: '#loadingSparkline',
            actions: assign((_ctx, e) => {
              return {
                url: _.get(e, 'payload.url')
              };
            })
          }
        }
      },
      sparklineLoaded: {
        initial: 'unknown',
        states: {
          unknown: {
            on: {
              LOAD_CALENDAR: 'loadingCalendar'
            }
          },
          loadingCalendar: {
            id: 'loadingCalendar',
            after: {
              30000: 'calendarError.timeout'
            },
            invoke: {
              id: 'fetchCalendar',
              src: 'fetchCalendar',
              onDone: {
                target: 'processingCalendar',
                actions: ['setMonths', 'setSelectedTS', 'setCurrentDay']
              },
              onError: {
                target: 'calendarError.rejected',
                actions: assign({
                  error: (_context, event) => {
                    return event.data;
                  }
                })
              }
            }
          },
          calendarError: {
            on: {
              RELOAD_CALENDAR_ON_ERROR: {
                target: '#loadingCalendar'
              }
            },
            states: {
              rejected: {
                on: {
                  RETRY: '#loadingCalendar'
                }
              },
              timeout: {
                on: {
                  RETRY: '#loadingCalendar'
                }
              }
            }
          },
          processingCalendar: {
            on: {
              '': [
                {
                  target: 'noCalendarFound',
                  cond: 'isCalendarEmpty'
                },
                {
                  target: 'calendarLoaded'
                }
              ]
            }
          },
          noCalendarFound: {
            on: {
              RETRY: '#loadingCalendar'
            }
          },
          calendarLoaded: {
            on: {
              RELOAD_SPARKLINE: {
                target: '#loadingSparkline'
              },
              RELOAD_CALENDAR: {
                target: 'loadingCalendar'
              },
              GOTO__FIRST_TS: {
                target: 'loadingCalendar',
                actions: [
                  assign({
                    selectedTS: ctx => ctx.firstTS
                  }),
                  assign({
                    currentDay: ctx =>
                      _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'day'),
                    currentMonth: ctx =>
                      _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'month'),
                    currentYear: ctx =>
                      _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'year')
                  }),
                  'setBrowserURL'
                ]
              },
              GOTO__DATE: {
                actions: [
                  assign({
                    selectedTS: (_ctx, e) => _.get(e, 'payload.ts'),
                    currentDay: (_ctx, e) => _.get(e, 'payload.day'),
                    currentMonth: (ctx, e) =>
                      _.get(e, 'payload.month', ctx.currentMonth)
                  }),
                  'setBrowserURL'
                ]
              },
              GOTO__TS_YEAR: {
                target: 'loadingCalendar',
                actions: assign({
                  selectedTS: null,
                  currentMonth: (_ctx, e) => _.get(e, 'payload.month'),
                  currentYear: (_ctx, e) => _.get(e, 'payload.year')
                })
              },
              GOTO__CURRENT_TS: {
                target: 'loadingCalendar',
                actions: assign((_ctx, e) => {
                  const ts = e.value;
                  return {
                    selectedTS: ts,
                    // redirectedTS: null,
                    // redirectTSCollection: {},
                    currentMonth: _.get(memoizedDateTimeFromTS(ts), 'month'),
                    currentYear: _.get(memoizedDateTimeFromTS(ts), 'year'),
                    currentDay: _.get(memoizedDateTimeFromTS(ts), 'day')
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
                      // redirectTSCollection: {},
                      currentMonth: _.get(memoizedDateTimeFromTS(ts), 'month'),
                      currentYear: _.get(memoizedDateTimeFromTS(ts), 'year'),
                      currentDay: _.get(memoizedDateTimeFromTS(ts), 'day')
                    };
                  }),
                  'setBrowserURL'
                ]
              },
              GOTO__MONTHYEAR: {
                target: 'loadingCalendar',
                actions: assign({
                  currentYear: (ctx, e) =>
                    _.get(e, 'payload.year', ctx.currentYear),
                  currentMonth: (ctx, e) =>
                    _.get(e, 'payload.month', ctx.currentMonth)
                })
              },
              GOTO__LAST_TS: {
                target: 'loadingCalendar',
                actions: [
                  assign({
                    selectedTS: ctx => {
                      return ctx.lastTS;
                    }
                  }),
                  assign({
                    currentDay: ctx =>
                      _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'day'),
                    currentMonth: ctx =>
                      _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'month'),
                    currentYear: ctx =>
                      _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'year')
                  }),
                  'setBrowserURL'
                ]
              },
              TOGGLE_CARD: {
                actions: assign({
                  showCard: (_ctx, e) => e.value
                })
              },
              SET_CARD: {
                actions: assign({
                  card: (_ctx, e) => e.value
                })
              },
              SET_DATE_HIGHLIGHTED: {
                actions: assign({
                  highlightedDay: (_ctx, e) => e.value
                })
              },
              CLEANUP: {
                actions: assign((_ctx, e) => {
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
      enterLoadingCalendar: assign({
        currentMonth: ctx =>
          ctx.selectedTS
            ? _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'month')
            : ctx.currentMonth,
        currentYear: ctx =>
          ctx.selectedTS
            ? _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'year')
            : ctx.currentYear,
        currentDay: ctx =>
          ctx.selectedTS
            ? _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'day')
            : ctx.currentDay
      }),
      setMonths: assign({
        months: (_ctx, e) => {
          return _.chain(_.get(e, 'data.calendarData'))
            .map(month => _.compact(_.flatten(month)))
            .map(m =>
              _.map(m, mx => ({
                cnt: mx.cnt ? mx.cnt : 0,
                ts: mx.ts,
                st: mx.st
              }))
            )
            .value();
        }
      }),
      setSelectedTS: assign({
        selectedTS: (ctx, e) => {
          if (
            ctx.selectedTS &&
            // ctx.isRedirect &&
            ctx.redirectTSCollection[ctx.redirectedTS] === ctx.selectedTS
          ) {
            return ctx.selectedTS;
          }
          const month = _.get(e, 'data.payload.month');
          if (!month) return ctx.selectedTS;
          const tsArray = _.compact(
            _.flatten(_.map(_.flatten(ctx.months[month - 1]), 'ts'))
          );
          const dir = _.get(e, 'data.payload.meta.dir');
          if (dir === 'prev') {
            return _.last(tsArray);
          } else if (dir === 'next') {
            return tsArray[0];
          } else {
            return ctx.selectedTS;
          }
        }
      }),
      setCurrentDay: assign({
        currentDay: (ctx, e) => {
          return _.get(memoizedDateTimeFromTS(ctx.selectedTS), 'day', null);
        }
      }),
      setBrowserURL: ctx => {
        browser.navigate(
          `https://web.archive.org/web/${ctx.selectedTS}/${ctx.url}`
        );
      }
    },
    services: {
      fetchSparkline: ctx => {
        return new Promise(async (resolve, reject) => {
          const [sparklineData, err] = await api(
            `${ROOT_URL}/__wb/sparkline?url=${encodeURIComponent(
              ctx.url
            )}&collection=web&output=json`,
            {
              noCacheReq: true,
              noCacheRes: true
            }
          );

          if (err) {
            return reject(err);
          }
          console.log('fetchSparkline:', sparklineData);
          return resolve(sparklineData);
        });
      },
      fetchCalendar: (ctx, e) => {
        return new Promise(async (resolve, reject) => {
          let calendarData, err;
          if (_.get(e, 'payload.force')) {
            memoizedFetchCalendar.apply({}, []);
          }
          try {
            [calendarData, err] = await memoizedFetchCalendar(
              ctx.url,
              ctx.currentYear
            );
          } catch (ex) {
            console.log('fetchCalendar error:', ex.message);
            memoizedFetchCalendar.apply({}, []);
            err = ex.message;
          }
          console.log('fetchCalendar:', calendarData, err);
          if (err) {
            return reject(err);
          }
          return resolve({ calendarData, payload: e.payload });
        });
      }
    },
    guards: {
      isSparklineEmpty: ctx => {
        return _.isEmpty(ctx.sparkline);
      },
      isCalendarEmpty: ctx => {
        return _.isEmpty(ctx.months);
      }
    }
  }
);

export default timetravelMachine;
