import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import VirtualList from 'react-tiny-virtual-list';
import tinycolor from 'tinycolor2';
import { Icon } from '../Common';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import './style.css';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

const getStyle = (count, isSelected) => {
  return {
    backgroundColor: isSelected
      ? '#ff8383'
      : count
      ? tinycolor('#d8f9d4')
          .darken(Math.min(count, 30))
          .toString()
      : 'inherit'
  };
};

const Calendar = ({
  years,
  selectedMonth,
  selectedYear,
  sparkline,
  onSelect
}) => {
  let maxcount = 0;
  for (let year in sparkline) {
    if (sparkline[year] == undefined) {
      continue;
    }
    maxcount = Math.max(maxcount, Math.max.apply(null, sparkline[year]));
  }
  return (
    <VirtualList
      width="100%"
      height={190}
      itemCount={_.size(years)}
      itemSize={60}
      renderItem={({ index, style }) => (
        <div
          className={cx({
            'vandal-cl__calendar-year': true,
            'vandal-cl__calendar-year--last': index === _.size(years) - 1
          })}
          key={index}
          style={style}>
          <div
            className="vandal-cl__calendar-year__left"
            onClick={onSelect(selectedMonth, years[index])}>
            <div className="vandal-cl__calendar-year__label">
              {years[index]}
            </div>
            <div>
              <Sparklines
                className="vandal-cl__calendar__sparkline"
                data={sparkline[years[index]]}
                margin={0}
                min={0}
                width={30}
                height={10}>
                <SparklinesCurve
                  style={{
                    stroke: '#708090',
                    fill: '#708090'
                  }}
                />
              </Sparklines>
            </div>
          </div>
          <div className="vandal-cl__calendar-year__months">
            {_.map(monthNames, (m, mindex) => {
              return (
                <div
                  className="vandal-cl__calendar-year__month"
                  key={mindex}
                  onClick={onSelect(mindex + 1, years[index])}
                  style={getStyle(
                    _.nth(sparkline[years[index]], mindex),
                    mindex + 1 === selectedMonth &&
                      years[index] === selectedYear
                  )}>
                  <span className="vandal-cl__calendar-year__month__label">
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    />
  );
};

let calendarEl;
const onCalendarVisible = el => {
  calendarEl = el;
};

const InputCalendar = props => {
  const [isVisible, showCalendar] = useState(false);
  const toggleCalendar = () => {
    showCalendar(!isVisible);
  };
  const outsideClick = e => {
    const path = _.toArray(e.composedPath());
    if (
      calendarEl &&
      !_.some(
        path,
        node =>
          node === calendarEl ||
          (_.isElement(node) &&
            node.matches('.vandal-cl__input-calendar-filter-icon'))
      )
    ) {
      showCalendar(false);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', outsideClick, false);
    return () => {
      calendarEl = null;
      document.removeEventListener('mousedown', outsideClick, false);
    };
  }, []);

  const {
    sparkline,
    goToPrevious,
    goToNext,
    selectedMonth,
    selectedYear,
    onSelect
  } = props;

  if (_.isEmpty(_.keys(sparkline))) return null;
  let sparklineYears = _.keys(sparkline);
  const years = _.map(sparklineYears, y => {
    return _.parseInt(y);
  });
  return (
    <div className="vandal-cl__input-calendar">
      <Icon
        name="dropdown"
        className="vandal-cl__input-calendar-filter-icon"
        onClick={toggleCalendar}
      />
      <div className="vandal-cl__input-calendar__nav">
        <Icon
          name="prevMonth"
          className="vandal-cl__input-calendar__nav__prev-icon"
          onClick={goToPrevious}
        />
        <Icon
          name="nextMonth"
          className="vandal-cl__input-calendar__nav__next-icon"
          onClick={goToNext}
        />
      </div>
      {props.children}
      {isVisible && (
        <div className="vandal-cl__calendar" ref={onCalendarVisible}>
          <Calendar
            years={years}
            sparkline={sparkline}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelect={(...args) => () => {
              onSelect(...args);
              toggleCalendar();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default InputCalendar;
