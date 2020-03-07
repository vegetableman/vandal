import React, { useEffect, useState, useCallback } from 'react';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import tinycolor from 'tinycolor2';
import memoizeOne from 'memoize-one';

import { Card, withDialog, Icon } from '../common';
import {
  getDateTimeFromTS,
  countVersions,
  monthNames,
  useEventCallback
} from '../../utils';
import CalendarFilter from '../filter/calendar';
import GraphFilter from '../filter/graph';

import './style.css';
import styles from './timetravel.module.css';
import boxStyle from '../url/box/urlbox.module.css';
import cardStyle from '../common/card/card.module.css';
import calendarStyle from '../filter/calendar/calendar.module.css';
import graphCalendarStyle from '../filter/graph/calendar.module.css';

import {
  getTSFromCurrentMonth,
  getTSFromCurrentYear,
  findCalendarFromTS,
  findDayFromTs
} from './timetravel.machine';
import { useTimeTravel, useTheme } from '../../hooks';
import { colors } from '../../constants';

const memoizedDateTimeFromTS = memoizeOne(getDateTimeFromTS);
const memoizedCountVersions = memoizeOne(countVersions);

let cardX;
let cardY;
const TimeTravel = props => {
  const { state, send } = useTimeTravel();
  const { context: ctx } = state;
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { theme } = useTheme();

  const getColor = day => {
    const {
      months,
      selectedTS,
      currentMonth,
      currentYear,
      highlightedDay
    } = ctx;
    const count = _.get(months, `${currentMonth - 1}.${day - 1}.cnt`);
    if (!count) {
      return null;
    }

    let match = false;
    if (selectedTS) {
      const {
        day: selectedDay,
        month: selectedMonth,
        year: selectedYear
      } = memoizedDateTimeFromTS(selectedTS);
      match =
        selectedDay === day &&
        selectedMonth === currentMonth &&
        selectedYear === currentYear;
    }

    const matchColor = colors[_.toUpper(theme)]['MATCH'];
    const bgColor =
      !match &&
      tinycolor(colors.TS)
        .darken(Math.min(count, 30))
        .toString();

    return {
      backgroundColor: match ? matchColor : bgColor,
      opacity: highlightedDay && highlightedDay !== day ? 0.5 : 1,
      textDecoration:
        highlightedDay && highlightedDay === day && !match
          ? 'underline'
          : 'none',
      color: match ? colors.BL_33 : 'inherit'
    };
  };

  const onCalendarChange = date => {
    const dateArr = _.split(date, '-');
    const year = _.parseInt(_.nth(dateArr, 0));
    const month = _.parseInt(_.nth(dateArr, 1));
    send('GOTO__MONTHYEAR', { payload: { year, month } });
  };

  const onYearChange = year => () => {
    return send('GOTO__TS_YEAR', {
      payload: {
        month: ctx.currentMonth,
        year
      }
    });
  };

  const onDateMove = useCallback(day => e => {
    if (ctx.highlightedDay) return;
    const date = _.get(ctx.months, `[${ctx.currentMonth - 1}][${day - 1}]`);
    if (!_.get(date, 'cnt')) {
      return;
    }

    const { offsetLeft, offsetTop } = e.target;
    const x = (cardX = e.nativeEvent.offsetX);
    const y = (cardY = e.nativeEvent.offsetY);
    const status = _.get(date, 'st', []);

    if (!ctx.showCard) {
      send({ type: 'TOGGLE_CARD', value: true });
    }
    send({
      type: 'SET_CARD',
      value: {
        x: offsetLeft + x,
        y: offsetTop + y + 10,
        ts: _.map(_.get(date, 'ts'), (value, i) => {
          return { value, status: status[i] };
        }),
        day,
        monthName: monthNames[Math.max(ctx.currentMonth - 1, 0)],
        year: ctx.currentYear
      }
    });
  });

  const onMonthChange = selectedMonth => () => {
    return send('GOTO__MONTHYEAR', {
      payload: { year: ctx.selectedYear, month: selectedMonth }
    });
  };

  const onDateClick = day => e => {
    const date = _.get(ctx.months, `${ctx.currentMonth - 1}.${day - 1}`);
    if (!_.get(date, 'cnt')) {
      return;
    }

    const { offsetLeft, offsetTop } = e.target;
    const status = _.get(date, 'st', []);
    send({ type: 'SET_DATE_HIGHLIGHTED', value: day });
    send({
      type: 'SET_CARD',
      value: {
        x: offsetLeft + cardX,
        y: offsetTop + cardY + 10,
        ts: _.map(_.get(date, 'ts'), (value, i) => {
          return { value, status: status[i] };
        }),
        day,
        monthName: monthNames[Math.max(ctx.currentMonth - 1, 0)],
        year: ctx.currentYear
      }
    });
  };

  const onDateLeave = useEventCallback(() => {
    if (ctx.highlightedDay || !ctx.showCard) return;
    send({ type: 'TOGGLE_CARD', value: false });
    send({ type: 'SET_CARD', value: null });
  }, [ctx.showCard]);

  const onCardLeave = () => {
    send({ type: 'TOGGLE_CARD', value: false });
    send({ type: 'SET_CARD', value: null });
    send({ type: 'SET_DATE_HIGHLIGHTED', value: null });
  };

  const [isManualReload, setManualReload] = useState(false);

  const onReload = () => {
    setManualReload(true);
    if (!ctx.sparkline) {
      send('RELOAD_SPARKLINE');
      return;
    }
    send({ type: 'RELOAD_CALENDAR', payload: { force: true } });
  };

  const onRetry = () => {
    if (!ctx.sparkline) {
      send('RELOAD_SPARKLINE_ON_ERROR');
      return;
    }
    send({ type: 'RELOAD_CALENDAR_ON_ERROR', payload: { force: true } });
  };

  useEffect(() => {
    if (
      isManualReload &&
      (state.matches('sparklineLoaded.calendarLoaded') ||
        state.matches('sparklineLoaded.noCalendarFound') ||
        state.matches('sparklineLoaded.calendarError'))
    ) {
      setTimeout(() => {
        setManualReload(false);
      }, 100);
    }
  });

  const goToTS = dir => {
    let ts = getTSFromCurrentMonth(
      dir,
      ctx.months,
      ctx.selectedTS,
      ctx.currentDay,
      ctx.currentMonth
    );
    if (!ts) {
      ts = getTSFromCurrentYear(dir, ctx.months, ctx.selectedTS);
    }
    if (!ts) {
      const { year, month } = findCalendarFromTS(
        ctx.sparkline,
        ctx.currentYear,
        dir
      );

      return send('GOTO__TS_YEAR', {
        payload: {
          month: month + 1,
          year,
          meta: { dir }
        }
      });
    }
    return send('NAVIGATETO__TS', { value: ts });
  };

  const debouncedPrev = _.debounce(() => goToTS('prev'), 250);
  const debouncedNext = _.debounce(() => goToTS('next'), 250);

  const onCalNext = useEventCallback(() => {
    const { currentMonth, currentYear } = ctx;
    if (currentMonth === 12) {
      send('GOTO__MONTHYEAR', {
        payload: {
          year: Math.min(new Date().getFullYear(), currentYear + 1),
          month: 1
        }
      });
    } else {
      send('GOTO__MONTHYEAR', {
        payload: {
          year: currentYear,
          month: currentMonth + 1
        }
      });
    }
  }, [ctx.currentMonth, ctx.currentYear]);

  const onCalPrevious = useEventCallback(() => {
    const { currentMonth, currentYear } = ctx;
    if (currentMonth === 1) {
      send('GOTO__MONTHYEAR', {
        payload: {
          year: Math.max(1996, currentYear - 1),
          month: 12
        }
      });
    } else {
      send('GOTO__MONTHYEAR', {
        payload: {
          year: currentYear,
          month: currentMonth - 1
        }
      });
    }
  }, [ctx.currentMonth, ctx.currentYear]);

  const onDateNavigation = dir => {
    const result = findDayFromTs(
      ctx.currentDay,
      ctx.currentMonth,
      ctx.months,
      ctx.selectedTS,
      dir
    );
    if (result) {
      const { ts, day, month } = result;
      return send('GOTO__DATE', {
        payload: {
          ts,
          day,
          month
        }
      });
    }

    const { year, month } = findCalendarFromTS(
      ctx.sparkline,
      ctx.currentYear,
      dir
    );

    return send('GOTO__TS_YEAR', {
      payload: {
        month: month + 1,
        year,
        meta: { dir }
      }
    });
  };

  const isTSSelected = ts => {
    return (
      ts === ctx.selectedTS
      //  ||
      // (ctx.redirectTSCollection &&
      //   ts === ctx.redirectTSCollection[ctx.redirectedTS])
    );
  };

  const isTSRedirected = ts => {
    return (
      // ts === ctx.selectedTS ||
      // (
      ctx.redirectTSCollection &&
      ts === ctx.redirectTSCollection[ctx.redirectedTS]
      // )
    );
  };

  const isTSVisible = () => {
    const { months, currentMonth, currentDay } = ctx;
    const date = _.get(months, `[${currentMonth - 1}][${currentDay - 1}]`);
    return _.some(_.get(date, 'ts'), ts => isTSSelected(ts));
  };

  const versionCount = memoizedCountVersions(ctx.sparkline);

  const setOnline = () => {
    setIsOffline(false);
  };

  const setOffline = () => {
    setIsOffline(true);
  };

  const onEscape = useEventCallback(
    e => {
      if (e.keyCode === 27 && ctx.showCard) {
        send({ type: 'TOGGLE_CARD', value: false });
        send({ type: 'SET_CARD', value: null });
        send({ type: 'SET_DATE_HIGHLIGHTED', value: null });
      }
    },
    [ctx.showCard]
  );

  const onClickOutside = useEventCallback(
    e => {
      if (!ctx.showCard) return;
      const path = _.toArray(e.composedPath());
      if (
        _.some(path, node => {
          return (
            _.isElement(node) &&
            node.matches &&
            (node.matches(`.${_.get(cardStyle, 'card')}`) ||
              node.matches(`.${_.get(calendarStyle, 'day')}`) ||
              node.matches(`.${_.get(graphCalendarStyle, 'day')}`))
          );
        })
      ) {
        return;
      }
      send({ type: 'TOGGLE_CARD', value: false });
      send({ type: 'SET_CARD', value: null });
      send({ type: 'SET_DATE_HIGHLIGHTED', value: null });
    },
    [ctx.showCard]
  );

  useEffect(() => {
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    document.addEventListener('click', onClickOutside, true);
    document.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
      document.removeEventListener('click', onClickOutside, true);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  useEffect(() => {
    if (
      state.matches('sparklineLoaded') &&
      !state.matches('sparklineLoaded.calendarLoaded') &&
      _.get(state, 'historyValue.current') === 'processingSparkline'
    ) {
      console.log('LOAD_CALENDAR');
      send({ type: 'LOAD_CALENDAR', url: props.url });
    }
  }, [state.value]);

  useEffect(() => {
    return () => {
      send('CLEANUP');
    };
  }, []);

  let { month: selectedMonth, year: selectedYear } =
    memoizedDateTimeFromTS(ctx.selectedTS) || {};

  console.log(
    'tt state:',
    state,
    'ctx.selectedTS:',
    ctx.selectedTS,
    'ctx.redirectedTS',
    ctx.redirectedTS
  );

  return (
    <div
      className={cx({
        [styles.timetravel]: true,
        [styles.timetravelGraph]: props.selectedTabIndex == 1
      })}
      ref={props.dialogRef}>
      {state.matches('loadingSparkline') &&
        _.get(state, 'event.type') !== 'RELOAD_SPARKLINE_ON_ERROR' && (
          <div className={styles.timetravelLoader}>Loading...</div>
        )}
      {/* {!isOffline &&
        !state.matches('sparklineLoaded.calendarError') &&
        !state.matches('sparklineError.timeout') && (
          <React.Fragment>
            <div
              className={styles.count}
              data-for="vandal-timetravel-count"
              data-tip={versionCount}>
              {versionCount}
            </div>
            <ReactTooltip
              className="vandal-timetravel-info-tooltip"
              id="vandal-timetravel-count"
              effect="solid"
              place="left"
              type={theme}
              delayHide={100}
              delayShow={100}
              getContent={count => (
                <span>
                  <span>This URL was saved </span>
                  <b>{count}</b>
                  <span>
                    {_.parseInt(count) > 1 || _.parseInt(count) === 0
                      ? ' times'
                      : ' time on '}
                  </span>
                  {_.parseInt(count) === 1 && (
                    <div>
                      <b>
                        {_.get(
                          memoizedDateTimeFromTS(ctx.lastTS),
                          'humanizedDate'
                        )}
                      </b>
                    </div>
                  )}
                  {_.parseInt(count) > 1 && ctx.firstTS && ctx.lastTS ? (
                    <div>
                      {' '}
                      between{' '}
                      <b>
                        {_.get(
                          memoizedDateTimeFromTS(ctx.firstTS),
                          'humanizedDate'
                        )}
                      </b>{' '}
                      and{' '}
                      <b>
                        {_.get(
                          memoizedDateTimeFromTS(ctx.lastTS),
                          'humanizedDate'
                        )}
                      </b>
                    </div>
                  ) : null}
                </span>
              )}
            />
          </React.Fragment>
        )} */}
      <Tabs
        defaultIndex={props.selectedTabIndex}
        className={styles.tabs}
        selectedTabClassName={styles.tab___active}
        onSelect={props.selectTabIndex}>
        <TabList className={styles.tabList}>
          <Tab className={`${styles.tab} ${styles.tab___calendar}`}>
            Calendar
          </Tab>
          <Tab className={`${styles.tab} ${styles.tab___graph}`}>Graph</Tab>
        </TabList>

        <TabPanel className={styles.tabPanel}>
          <CalendarFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            currentMonth={ctx.currentMonth}
            currentYear={ctx.currentYear}
            currentDay={ctx.currentDay}
            selectedTS={ctx.selectedTS}
            highlightedDay={ctx.highlightedDay}
            sparkline={ctx.sparkline}
            showCard={ctx.showCard}
            error={ctx.error}
            retry={onRetry}
            calendarLoaded={state.matches('sparklineLoaded.calendarLoaded')}
            showCalendarLoader={state.matches(
              'sparklineLoaded.loadingCalendar'
            )}
            showSparkLoader={state.matches('loadingSparkline')}
            showSparkError={
              _.get(state, 'event.type') === 'RELOAD_SPARKLINE_ON_ERROR' ||
              state.matches('sparklineError')
            }
            showCalendarError={state.matches('sparklineLoaded.calendarError')}
            months={ctx.months}
            getColor={getColor}
            goToPrevious={onCalPrevious}
            goToNext={onCalNext}
            onClick={onDateClick}
            onChange={onCalendarChange}
            onMouseMove={onDateMove}
            onMouseLeave={onDateLeave}
          />
        </TabPanel>
        <TabPanel>
          <GraphFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            currentMonth={ctx.currentMonth}
            currentYear={ctx.currentYear}
            currentDay={ctx.currentDay}
            highlightedDay={ctx.highlightedDay}
            showCard={ctx.showCard}
            sparkline={ctx.sparkline}
            error={ctx.error}
            retry={onRetry}
            showCalendarLoader={state.matches(
              'sparklineLoaded.loadingCalendar'
            )}
            showSparkLoader={state.matches('loadingSparkline')}
            showSparkError={
              _.get(state, 'event.type') === 'RELOAD_SPARKLINE_ON_ERROR' ||
              state.matches('sparklineError')
            }
            showCalendarError={state.matches('sparklineLoaded.calendarError')}
            months={ctx.months}
            getColor={getColor}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
            onMouseMove={onDateMove}
            onMouseLeave={onDateLeave}
            onClick={onDateClick}
          />
          <div />
        </TabPanel>
      </Tabs>
      {ctx.showCard && (
        <Card
          {...ctx.card}
          onCardLeave={onCardLeave}
          onTsClick={ts => () => {
            send({ type: 'NAVIGATETO__TS', value: ts });
          }}
          isSelected={isTSSelected}
          isRedirected={isTSRedirected}
        />
      )}
      {((!!(ctx.firstTS || ctx.lastTS || !ctx.sparkline) &&
        !state.matches('sparklineError') &&
        !state.matches('loadingSparkline') &&
        !state.matches('sparklineLoaded.loadingCalendar')) ||
        isManualReload) && (
        <Icon
          name="reloadCalendar"
          width={15}
          className={cx({
            [styles.reloadIcon]: true,
            [styles.reloadIcon___loading]: isManualReload
          })}
          onClick={onReload}
          title="reload"
        />
      )}
      {!!ctx.selectedTS &&
        !!versionCount &&
        state.matches('sparklineLoaded.calendarLoaded') &&
        (selectedMonth !== ctx.currentMonth ||
          selectedYear !== ctx.currentYear) && (
          <Icon
            name="selection"
            className={styles.selectionIcon}
            width={27.2}
            title="Current Selection"
            onClick={() => {
              send('GOTO__CURRENT_TS', { value: ctx.selectedTS });
            }}
          />
        )}
      <div className={styles.footer}>
        {isOffline && (
          <Icon name="error" width={18} className={styles.errorIcon} />
        )}
        <div className={styles.controls}>
          <button
            className={styles.navigateBtn}
            disabled={
              !versionCount ||
              !ctx.firstTS ||
              ctx.selectedTS === ctx.firstTS ||
              state.matches('sparklineError') ||
              state.matches('sparklineLoaded.calendarError') ||
              state.matches('sparklineLoaded.loadingCalendar')
            }
            onClick={() => send('GOTO__FIRST_TS')}
            title="First Snapshot">
            <Icon
              name="firstTS"
              className={`${styles.navigateIcon} ${styles.navigateFirstIcon}`}
            />
          </button>
          <button
            className={styles.navigateBtn}
            title="Jump to previous date"
            onClick={() => {
              onDateNavigation('prev');
            }}
            disabled={
              !versionCount ||
              !isTSVisible() ||
              !ctx.firstTS ||
              !ctx.selectedTS ||
              ctx.selectedTS === ctx.firstTS ||
              state.matches('sparklineError') ||
              state.matches('sparklineLoaded.calendarError')
            }>
            <Icon
              name="backwardTS"
              className={`${styles.navigateIcon} ${styles.navigateBackwardIcon}`}
            />
          </button>
          <button
            className={styles.navigateBtn}
            disabled={
              !versionCount ||
              !ctx.selectedTS ||
              ctx.selectedTS === ctx.firstTS ||
              !isTSVisible() ||
              state.matches('sparklineError') ||
              state.matches('sparklineLoaded.calendarError')
            }
            onClick={debouncedPrev}
            title="Previous Snapshot">
            <Icon
              name="prevTS"
              className={`${styles.navigateIcon} ${styles.navigatePrevIcon}`}
            />
          </button>
          <button
            className={styles.navigateBtn}
            disabled={
              !versionCount ||
              !ctx.selectedTS ||
              ctx.selectedTS === ctx.lastTS ||
              !isTSVisible() ||
              state.matches('sparklineError') ||
              state.matches('sparklineLoaded.calendarError')
            }
            onClick={debouncedNext}
            title="Next Snapshot">
            <Icon
              name="nextTS"
              className={`${styles.navigateIcon} ${styles.navigateNextIcon}`}
            />
          </button>
          <button
            className={styles.navigateBtn}
            title="Jump to next date"
            disabled={
              !versionCount ||
              !ctx.lastTS ||
              !ctx.selectedTS ||
              ctx.selectedTS === ctx.lastTS ||
              !isTSVisible() ||
              state.matches('sparklineError') ||
              state.matches('sparklineLoaded.calendarError')
            }
            onClick={() => {
              onDateNavigation('next');
            }}>
            <Icon
              name="forwardTS"
              className={`${styles.navigateIcon} ${styles.navigateForwardIcon}`}
            />
          </button>
          <button
            className={styles.navigateBtn}
            disabled={
              !versionCount ||
              !ctx.lastTS ||
              ctx.selectedTS === ctx.lastTS ||
              state.matches('sparklineError') ||
              state.matches('sparklineLoaded.calendarError') ||
              state.matches('sparklineLoaded.loadingCalendar')
            }
            onClick={() => send('GOTO__LAST_TS')}
            title="Last Snapshot">
            <Icon
              name="lastTS"
              className={`${styles.navigateIcon} ${styles.navigateLastIcon}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default withDialog(TimeTravel, {
  ignoreClickOnClass: `.${boxStyle.timetravelBtn}`
});
