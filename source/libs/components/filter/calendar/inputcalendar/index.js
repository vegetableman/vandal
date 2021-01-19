import React, { useState, useEffect, memo, useRef } from 'react';
import memoizeOne from 'memoize-one';
import { scaleLinear } from 'd3-scale';
import PerfectScrollbar from 'perfect-scrollbar';
import _ from 'lodash';
import cx from 'classnames';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import VirtualList from 'react-tiny-virtual-list';
import { Icon, withDialog } from '../../../common';
import { monthNames, compareProps } from '../../../../utils';
import { colors } from '../../../../constants';
import styles from './inputcalendar.module.css';
import { useTheme } from '../../../../hooks';

const getStyle = (count, isSelected, isCurrent, color, year, theme) => {
  const isHighlighted = isSelected || isCurrent || count;
  return {
    backgroundColor: isSelected
      ? colors[_.toUpper(theme)]['MATCH']
      : isCurrent
        ? colors.MATCH
        : count
          ? color(count, year)
          : 'inherit',
    textDecoration: isCurrent ? 'underline' : 'none',
    color: isHighlighted
      ? colors.BL_33
      : theme === 'dark'
        ? colors.GY_DD
        : 'inherit'
  };
};

const ROW_HEIGHT = 55;

const Calendar = ({
  color,
  years,
  selectedMonth,
  selectedYear,
  currentMonth,
  currentYear,
  sparkline,
  onSelect,
  dialogRef,
  onClose,
  isDialogClosed
}) => {
  let maxcount = 0;
  for (let year in sparkline) {
    if (sparkline[year] == undefined) {
      continue;
    }
    maxcount = Math.max(maxcount, Math.max.apply(null, sparkline[year]));
  }

  const { theme } = useTheme();
  const scrollContainerRef = useRef(null);

  useEffect(
    () => {
      if (isDialogClosed) {
        onClose();
      }
    },
    [isDialogClosed]
  );

  useEffect(() => {
    if (scrollContainerRef.current) {
      new PerfectScrollbar(scrollContainerRef.current.rootNode);
    }
  }, []);

  const yearCount = _.size(years);
  const rowHeight = yearCount == 1 ? ROW_HEIGHT + 3 : ROW_HEIGHT;
  return (
    <div ref={dialogRef}>
      <VirtualList
        ref={scrollContainerRef}
        width="100%"
        className={styles.scroll__container}
        height={yearCount < 4 ? yearCount * rowHeight : 190}
        itemCount={yearCount}
        itemSize={rowHeight}
        scrollToIndex={_.indexOf(years, currentYear)}
        renderItem={({ index, style }) => (
          <div
            className={cx({
              [styles.calendar__year]: true
            })}
            key={index}
            style={style}>
            <div
              className={styles.calendar__year___left}
              onClick={onSelect(selectedMonth, years[index])}>
              <div className={styles.label}>{years[index]}</div>
              <div>
                <Sparklines
                  data={sparkline[years[index]]}
                  margin={0}
                  min={0}
                  width={30}
                  height={10}>
                  <SparklinesCurve
                    style={{
                      stroke: colors[_.toUpper(theme)]['CURVE'],
                      fill: colors[_.toUpper(theme)]['CURVE']
                    }}
                  />
                </Sparklines>
              </div>
            </div>
            <div className={styles.months}>
              {_.map(monthNames, (m, mindex) => {
                return (
                  <div
                    className={styles.month}
                    key={mindex}
                    onClick={onSelect(mindex + 1, years[index])}
                    style={getStyle(
                      _.nth(sparkline[years[index]], mindex),
                      mindex + 1 === selectedMonth &&
                        years[index] === selectedYear,
                      mindex + 1 === currentMonth &&
                        years[index] === currentYear,
                      color,
                      years[index],
                      theme
                    )}>
                    <span className={styles.month__label}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      />
    </div>
  );
};

const WithDialogCalendar = withDialog(Calendar, {
  ignoreClickOnClass: `.${styles.filter__icon}`
});

const currentDateInstance = new Date();

const colorFromRange = memoizeOne((min, max) => {
  return scaleLinear()
    .domain([min, max])
    .range(['#d4f8d0', max <= 5 ? '#a6ef9c' : '#5ee64e']);
});

const InputCalendar = memo((props) => {
  const [isVisible, toggleCalendar] = useState(false);

  const {
    sparkline,
    goToPrevious,
    goToNext,
    disableNext,
    currentMonth,
    selectedMonth,
    selectedYear,
    currentYear,
    onSelect,
    onChange,
    disabled,
    date
  } = props;

  if (_.isEmpty(_.keys(sparkline))) return null;

  let sparklineYears = _.keys(sparkline);
  const result = _.map(sparklineYears, (y) => {
    return { year: _.parseInt(y), count: _.max(sparkline[y]) };
  });

  const years = _.map(result, 'year');

  return (
    <div className={styles.input__calendar}>
      {!disabled && (
        <Icon
          name="dropdown"
          className={cx({
            [styles.filter__icon]: true,
            [styles.filter__icon___active]: isVisible
          })}
          onClick={() =>
            toggleCalendar((isVisible) => {
              return !isVisible;
            })
          }
        />
      )}
      <div className={styles.nav}>
        <Icon
          name="prevMonth"
          className={styles.prev__icon}
          onClick={goToPrevious}
        />
        <Icon
          name="nextMonth"
          className={cx({
            [styles.next__icon]: true,
            [styles.next__icon___disabled]: disableNext
          })}
          onClick={disableNext ? () => {} : goToNext}
        />
      </div>
      <input
        autoFocus
        className={cx({
          [styles.input]: true,
          [styles.input___open]: isVisible
        })}
        defaultValue={date}
        key={date}
        disabled={disabled}
        min="1996-01"
        max={`${currentDateInstance.getFullYear()}-12`}
        type="month"
        onChange={onChange}
      />
      {isVisible && (
        <div className={styles.calendar}>
          <WithDialogCalendar
            years={years}
            sparkline={sparkline}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onSelect={(...args) => () => {
              onSelect(...args);
              toggleCalendar(false);
            }}
            color={(count, year) => {
              const color = colorFromRange(
                _.min(sparkline[year]),
                _.max(sparkline[year])
              );
              return color(count);
            }}
            onClose={() => {
              toggleCalendar(false);
            }}
          />
        </div>
      )}
    </div>
  );
}, compareProps(['sparkline', 'currentMonth', 'selectedMonth', 'selectedYear', 'currentYear', 'disabled', 'date', 'disableNext']));

export default InputCalendar;
