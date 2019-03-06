import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import {
  Sparklines,
  SparklinesBars,
  SparklinesCurve,
  dataToPoints
} from 'react-sparklines';
import GraphLoader from './loader.js';
import Calendar from './calendar';
import ErrorIcon from './error.svg';
import './style.css';
import { themeStore } from '../../stores';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
];

const captureGraphScale = (years, maxcount) => {
  const scaled = [];
  for (let year in years) {
    if (!years[year]) {
      continue;
    }
    scaled[year] = years[year].map(Math.log1p);
  }
  return [scaled, Math.log1p(maxcount)];
};

const captureGraphScaleIsRequired = years => {
  let max = 0;
  let min = 1000;
  for (let year in years) {
    if (years[year] == undefined) {
      continue;
    }
    max = Math.max(max, Math.max.apply(null, years[year]));
    min = Math.min(min, Math.min.apply(null, years[year].filter(Boolean)));
  }
  return Math.log1p(max) - Math.log1p(min) > 3;
};

export default class GraphFilter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.currentDate = new Date();
    this.state = {
      years: {},
      months: []
    };
  }

  onMouseMove(month, monthIndex) {
    return (point, index, x, y, offsetLeft) => {
      this.props.onMouseMove({
        x: x + offsetLeft - 150,
        y: 200,
        ts: month[index].ts,
        day: index + 1,
        monthName: monthNames[monthIndex],
        monthIndex,
        point
      });
    };
  }

  getPosition(index) {
    if (
      !_.isNil(this.props.selectedMonthIndex) &&
      index === this.props.selectedMonthIndex
    ) {
      return {
        cx: _.get(this.props, 'selectedPoint.x'),
        cy: _.get(this.props, 'selectedPoint.y')
      };
    } else if (index === this.state.monthIndex) {
      return { cx: this.state.cx, cy: this.state.cy };
    }
  }

  render() {
    let {
      sparkline,
      months,
      selectedYear,
      selectedMonth,
      onChange,
      onMouseLeave,
      onMonthChange,
      showLoader,
      showConnectionError,
      theme
    } = this.props;

    if (showConnectionError) {
      return (
        <div className="vandal-graph__archive-error">
          <ErrorIcon width={18} className="vandal-graph__conn-error-icon" />
          <div>Error connecting to the Archive Server</div>
        </div>
      );
    } else if (_.isEmpty(_.keys(sparkline))) return null;

    let date;
    if (selectedYear && selectedMonth) {
      date = `${selectedYear}-${_.padStart(selectedMonth, 2, '0')}`;
    }

    let maxcount = 0;
    for (let year in sparkline) {
      if (sparkline[year] == undefined) {
        continue;
      }
      maxcount = Math.max(maxcount, Math.max.apply(null, sparkline[year]));
    }

    if (captureGraphScaleIsRequired(sparkline)) {
      let scaled = captureGraphScale(sparkline, maxcount);
      sparkline = scaled[0];
      maxcount = scaled[1];
    }

    const startYear = 1996;
    const endYear = this.currentDate.getUTCFullYear();
    const yearWidth = 600 / (endYear - startYear + 1);
    const height = 75;
    const yscale = height / maxcount;

    let sparklineYears = Object.keys(sparkline);
    const years = _.map(sparklineYears, y => {
      return _.parseInt(y);
    });

    return (
      <div className="vandal-graph">
        <div className="vandal-graph__year-container">
          {_.map(years, (y, i) => {
            return (
              <div
                className={cx({
                  'vandal-graph__year': true,
                  'vandal-graph__year--selected':
                    theme !== 'dark' && selectedYear === y,
                  'vandal-graph__year--selected--dark':
                    theme === 'dark' && selectedYear === y
                })}
                key={`year-${y}`}
                onClick={onChange(y)}>
                <label className="vandal-graph__year__value">{y}</label>
                <Sparklines
                  className="vandal-graph__year__sparkline"
                  data={sparkline[y]}
                  margin={0}
                  width={48}
                  height={height}
                  min={0}
                  max={maxcount}>
                  <SparklinesBars
                    style={{
                      stroke: theme === 'dark' ? '#5B85AC' : '#708090',
                      fill: theme === 'dark' ? '#5B85AC' : '#708090'
                    }}
                  />
                </Sparklines>
              </div>
            );
          })}
        </div>
        {showLoader && (
          <div className="vandal-gh-loader-container">
            {_.map(monthNames, (m, index) => {
              return (
                <div className="vandal-gh-loader-month" key={index}>
                  <GraphLoader
                    key={index}
                    className="vandal-gh-loader"
                    theme={theme}
                  />
                </div>
              );
            })}
          </div>
        )}
        {!showLoader && selectedYear && (
          <div className="vandal-graph__month-container">
            {!_.isEmpty(months) &&
              _.map(months, (m, index) => {
                const countList = _.map(m, mc => mc.cnt);
                const max = Math.max.apply(null, countList);
                const points = dataToPoints({
                  data: countList,
                  limit: 0,
                  width: 100,
                  height: 20,
                  margin: 0,
                  min: 0,
                  max: !max ? max + 1 : max
                });

                return (
                  <div
                    className={cx({
                      'vandal-graph__month': true,
                      'vandal-graph__month--selected':
                        theme !== 'dark' && index === selectedMonth - 1,
                      'vandal-graph__month--selected--dark':
                        theme === 'dark' && index === selectedMonth - 1
                    })}
                    key={`month-${index}-${selectedYear}`}
                    onClick={onMonthChange(index + 1)}>
                    <span className="vandal-graph__month__value">
                      {monthNames[index]}
                    </span>
                    {!!max && (
                      <Sparklines
                        className="vandal-graph__month__sparkline"
                        points={points}
                        margin={0}
                        min={0}
                        max={!max ? max + 1 : max}
                        width={100}
                        height={20}>
                        <SparklinesCurve
                          style={{
                            stroke: theme === 'dark' ? '#5B85AC' : '#708090',
                            fill: theme === 'dark' ? '#5B85AC' : '#708090'
                          }}
                        />
                      </Sparklines>
                    )}
                  </div>
                );
              })}
            {_.isEmpty(months) &&
              _.map(monthNames, (m, index) => {
                return (
                  <div
                    className={cx({
                      'vandal-graph__month': true,
                      'vandal-graph__month--selected':
                        index === selectedMonth - 1
                    })}
                    key={`month-${index}-${selectedYear}`}
                    onClick={onMonthChange(index + 1)}>
                    <span className="vandal-graph__month__value">
                      {monthNames[index]}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
        {!showLoader && date && <Calendar date={date} {...this.props} />}
      </div>
    );
  }
}
