import _ from 'lodash';
import React, { useEffect, useState, memo, useCallback } from 'react';
import CalendarLoader from './loader';
import cx from 'classnames';

import { Icon } from '../../common';
import InputCalendar from './inputcalendar';
import { compareProps } from '../../../utils';
import { useTimeTravel } from '../../../hooks';

import styles from './calendar.module.css';

const Day = (props) => {
  const style = props.getColor(props.day);
  return (
    <div
      className={cx({
        [styles.day]: true,
        [styles.day___active]: Boolean(style)
      })}
      onMouseMove={props.onMouseMove(props.day)}
      onMouseLeave={props.onMouseLeave}
      onClick={props.onClick(props.day)}>
      <div style={style} className={styles.date}>
        {props.day}
      </div>
    </div>
  );
};

const Calendar = memo((props) => {
  if (!props.date) return <div className={styles.calendar} />;

  console.log('Calendar:date:', date);

  let date = new Date(props.date);

  let first = new Date(date);
  first.setHours(0);
  first.setMinutes(0);
  first.setSeconds(0);
  first.setDate(1);

  let last = new Date(date);
  last.setHours(0);
  last.setMinutes(0);
  last.setSeconds(0);
  last.setMonth(last.getMonth() + 1);
  last.setDate(0);

  let weeks = Math.ceil((last.getDate() + first.getDay()) / 7);
  let day = 1 - first.getDay();
  let rows = [];

  for (let w = 0; w < weeks; w++) {
    let row = [];
    for (let d = 0; d < 7; d++) {
      row.push(d + day);
    }
    day += 7;

    rows.push(
      <div
        className={`${styles.week} ${w === weeks - 1 ? styles.last__week : ''}`}
        key={`week-${w}`}>
        {row.map((day) => {
          if (day <= 0) {
            return null;
          } else if (day > last.getDate()) {
            return null;
          } else {
            return (
              <Day
                key={`day-${day}-${props.date}`}
                day={day}
                getColor={props.getColor}
                onMouseMove={props.onMouseMove}
                onClick={props.onClick}
                onMouseLeave={props.onMouseLeave}
              />
            );
          }
        })}
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.month}>{rows}</div>
    </div>
  );
}, compareProps(['date', 'highlightedDay', 'selectedTS']));

Calendar.defaultProps = {
  getColor: () => {},
  onClick: () => {},
  onMouseLeave: () => {},
  onMouseMove: () => {}
};

const CalendarFilter = memo((props) => {
  const currentDateInstance = new Date();

  const [date, setDate] = useState(
    props.currentYear && props.currentMonth
      ? `${props.currentYear}-${_.padStart(props.currentMonth, 2, '0')}`
      : ''
  );

  // const handleCalendarChange = (e) => {
  //   const { value: dateValue } = e.target;
  //   setDate(dateValue);
  //   props.onChange(dateValue);
  // };
  // const debouncedCalendarChange = _.debounce(handleCalendarChange, 500);

  useEffect(
    () => {
      setDate(
        props.currentYear && props.currentMonth
          ? `${props.currentYear}-${_.padStart(props.currentMonth, 2, '0')}`
          : ''
      );
    },
    [props.currentMonth, props.currentYear]
  );

  const onCalendarSelect = (month, year) => {
    const selectedDate = `${year}-${_.padStart(month, 2, '0')}`;
    setDate(selectedDate);
    props.onChange(selectedDate);
  };

  const onChange = useCallback((e) => {
    e.persist();
    const { value: dateValue } = e.target;
    setDate(dateValue);
    props.onChange(dateValue);
  });

  console.log('calendar:', props);

  return (
    <div className={styles.container}>
      <div className={styles.calendar__container}>
        {!props.showSparkError &&
          !_.isEmpty(_.keys(props.sparkline)) &&
          !props.showErrLoader && (
            <div className={styles.label}>Select Date :</div>
          )}
        <div className={styles.nav__container}>
          <div className={styles.input__container}>
            <InputCalendar
              selectedMonth={props.selectedMonth}
              selectedYear={props.selectedYear}
              disabled={props.showSparkError || props.showCalendarError}
              disableNext={
                `${currentDateInstance.getFullYear()}-${_.padStart(
                  currentDateInstance.getMonth() + 1,
                  2,
                  '0'
                )}` === date
              }
              currentMonth={props.currentMonth}
              currentYear={props.currentYear}
              sparkline={props.sparkline}
              goToNext={props.goToNext}
              goToPrevious={props.goToPrevious}
              onSelect={onCalendarSelect}
              date={date}
              onChange={onChange}
            />
          </div>
        </div>
        {(props.showSparkError || props.showCalendarError) && (
          <div className={styles.error__container}>
            <div
              className={cx({
                [styles.error]: true,
                [styles.calendar__error]: props.showCalendarError
              })}>
              <Icon
                name="networkErr"
                width={35}
                height={35}
                className={styles.error__icon}
              />
            </div>
            {(props.showSparkError &&
              props.showSparkLoader && (
                <div className={styles.error__msg}>Retrying...</div>
              )) || (
              <div className={styles.error__msg}>
                ERR: {props.error || 'Request Failed'}
              </div>
            )}
            <button className={styles.retry__btn} onClick={props.retry}>
              Retry
            </button>
          </div>
        )}
      </div>
      {props.showCalendarLoader &&
        !props.showSparkError &&
        !props.showCalendarError && (
          <CalendarLoader className={styles.loader} />
        )}
      {props.calendarLoaded && (
        <Calendar
          date={date}
          selectedTS={props.selectedTS}
          highlightedDay={props.highlightedDay}
          getColor={props.getColor}
          onClick={props.onClick}
          onMouseLeave={props.onMouseLeave}
          onMouseMove={props.onMouseMove}
        />
      )}
    </div>
  );
}, compareProps(['selectedTS', 'selectedYear', 'selectedMonth', 'currentMonth', 'currentYear', 'currentDay', 'showError', 'showCalendarLoader', 'showSparkError', 'showSparkLoader', 'showCalendarError', 'sparkline', 'calendar', 'highlightedDay', 'calendarLoaded']));

const CalendarFilterContainer = memo((props) => {
  const { state } = useTimeTravel();
  const { context: ctx } = state;

  return (
    <CalendarFilter
      selectedYear={ctx.selectedYear}
      selectedMonth={ctx.selectedMonth}
      currentMonth={ctx.currentMonth}
      currentYear={ctx.currentYear}
      currentDay={ctx.currentDay}
      selectedTS={ctx.selectedTS}
      highlightedDay={ctx.highlightedDay}
      sparkline={ctx.sparkline}
      error={ctx.error}
      calendarLoaded={state.matches('sparklineLoaded.calendarLoaded')}
      showCalendarLoader={state.matches('sparklineLoaded.loadingCalendar')}
      showSparkLoader={state.matches('loadingSparkline')}
      showSparkError={
        _.get(state, 'event.type') === 'RELOAD_SPARKLINE_ON_ERROR' ||
        state.matches('sparklineError')
      }
      showCalendarError={state.matches('sparklineLoaded.calendarError')}
      calendar={ctx.calendar}
      {...props}
    />
  );
});

CalendarFilter.defaultProps = {
  getColor: () => {},
  goToPrevious: () => {},
  goToNext: () => {},
  onClick: () => {},
  onChange: () => {},
  onMouseMove: () => {},
  onMouseLeave: () => {}
};

export default CalendarFilterContainer;
