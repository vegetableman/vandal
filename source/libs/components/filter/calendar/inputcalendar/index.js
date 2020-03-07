import React, { useState, useEffect, memo } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import VirtualList from 'react-tiny-virtual-list';
import tinycolor from 'tinycolor2';
import { Icon, withDialog } from '../../../common';
import { monthNames, compareProps } from '../../../../utils';
import { colors } from '../../../../constants';
import styles from './inputcalendar.module.css';
import { useTheme } from '../../../../hooks';

const getStyle = (count, isSelected, isCurrent, theme) => {
  const isHighlighted = isSelected || isCurrent || count;
  return {
    backgroundColor: isSelected
      ? colors[_.toUpper(theme)]['MATCH']
      : isCurrent
      ? colors.CURRENT
      : count
      ? tinycolor(colors.TS)
          .darken(Math.min(count, 30))
          .toString()
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

  useEffect(() => {
    if (isDialogClosed) {
      onClose();
    }
  }, [isDialogClosed]);

  const yearCount = _.size(years);

  return (
    <div ref={dialogRef}>
      <VirtualList
        width="100%"
        height={yearCount < 4 ? yearCount * ROW_HEIGHT + 10 : 190}
        itemCount={yearCount}
        itemSize={ROW_HEIGHT}
        style={{ overflowX: 'hidden' }}
        scrollToIndex={_.indexOf(years, currentYear)}
        renderItem={({ index, style }) => (
          <div
            className={cx({
              [styles.calendarYear]: true
            })}
            key={index}
            style={style}>
            <div
              className={styles.calendarYear___left}
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
                      theme
                    )}>
                    <span className={styles.monthLabel}>{m}</span>
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
  ignoreClickOnClass: `.${styles.filterIcon}`
});

const currentDateInstance = new Date();

const InputCalendar = memo(props => {
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
  const years = _.map(sparklineYears, y => {
    return _.parseInt(y);
  });

  return (
    <div className={styles.inputCalendar}>
      {!disabled && (
        <Icon
          name="dropdown"
          className={styles.filterIcon}
          onClick={() =>
            toggleCalendar(isVisible => {
              return !isVisible;
            })
          }
        />
      )}
      <div className={styles.nav}>
        <Icon
          name="prevMonth"
          className={styles.prevIcon}
          onClick={goToPrevious}
        />
        <Icon
          name="nextMonth"
          className={cx({
            [styles.nextIcon]: true,
            [styles.nextIcon__disabled]: disableNext
          })}
          onClick={disableNext ? () => {} : goToNext}
        />
      </div>
      <input
        autoFocus
        className={styles.input}
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
            onClose={() => {
              toggleCalendar(false);
            }}
          />
        </div>
      )}
    </div>
  );
}, compareProps(['sparkline', 'currentMonth', 'selectedMonth', 'selectedYear', 'currentYear', 'disabled', 'date']));

export default InputCalendar;
