// https://web.archive.org/__wb/sparkline?url=https%3A%2F%2Fbuffer.com%2F&collection=web&output=json

import React from 'react';
import flatten from 'array-flatten';
import cx from 'classnames';
import api from './api';
import { getLocation, toTwelveHourTime } from './utils';
import {
  Sparklines,
  SparklinesBars,
  SparklinesCurve,
  SparklinesExternalInteractiveLayer,
  dataToPoints
} from 'react-sparklines';
import debounce from 'debounce';

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

function captureGraphScale(years, maxcount) {
  const scaled = [];
  for (let year in years) {
    if (!years[year]) {
      continue;
    }
    scaled[year] = years[year].map(Math.log1p);
  }
  return [scaled, Math.log1p(maxcount)];
}

function captureGraphScaleIsRequired(years) {
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
}

const median = data => data.sort((a, b) => a - b)[Math.floor(data.length / 2)];

const empty = 'vandal-tooltip__date--empty';

const Tooltip = props => (
  <div
    className="vandal-tooltip"
    style={{ top: props.y + 20, left: props.x - 50 }}
    onMouseEnter={props.onMouseEnter}
    onMouseLeave={props.onMouseLeave}
    onMouseMove={props.onMouseMove}>
    <div
      className={cx({
        'vandal-tooltip__date': true,
        'vandal-tooltip__date--empty':
          !props.tooltip.ts || !props.tooltip.ts.length
      })}>
      <div>{props.tooltip.day}</div>
      <div>{props.tooltip.monthName}</div>
      <div>{props.selectedYear}</div>
    </div>
    <div className="vandal-tooltip__ts">
      {props.tooltip.ts &&
        props.tooltip.ts.map((ts, i) => {
          return (
            <div className="vandal-tooltip__ts__value" key={`ts-${i}`}>
              {toTwelveHourTime(ts.toString().substr(-6))}
            </div>
          );
        })}
    </div>
  </div>
);

const offscreen = -1000;

export default class Vandal extends React.Component {
  constructor(props) {
    super(props);
    this.showYear = this.showYear.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.debouncedMouseLeave = debounce(this.onMouseLeave, 500);
    this.state = {
      years: {},
      selectedYear: null,
      months: [],
      maxCountInYear: 0,
      showTooltip: false,
      tooltip: null,
      showCursor: false
    };
  }

  onMouseMove(month, monthIndex) {
    return (point, index, x, y) => {
      this.debouncedMouseLeave.clear();
      this.setState({
        showTooltip: true,
        cx: x,
        cy: y,
        x: x + monthIndex * 81,
        y: 32,
        monthIndex: monthIndex,
        tooltip: {
          ts: month[index].ts,
          day: index + 1,
          monthName: monthNames[monthIndex]
        }
      });
    };
  }

  onMouseLeave = () => {
    this.setState({ showTooltip: false });
  };

  showYear(year) {
    return async () => {
      const url = `https://web.archive.org/__wb/calendarcaptures?url=${
        this.url
      }&selected_year=${year}`;
      const calendarData = await api(url);
      const filteredMonths = calendarData.map(month =>
        flatten(month).filter(Boolean)
      );
      let maxCountInYear = 0;
      const aggregatedMonths = filteredMonths.map((m, i) => {
        const arr = m.map(mx => ({ cnt: mx.cnt ? mx.cnt : 0, ts: mx.ts }));
        maxCountInYear = Math.max(maxCountInYear, Math.max.apply(null, arr));
        return arr;
      });
      this.setState({
        months: aggregatedMonths,
        selectedYear: year,
        maxCountInYear
      });
    };
  }

  onTooltipEnter = () => {
    console.log('enter tooltip');
    this.debouncedMouseLeave.clear();
    this.setState({ showCursor: true });
  };

  onTooltipLeave = () => {
    this.setState({ showTooltip: false, showCursor: false });
  };

  getPosition(index) {
    if (this.state.showCursor && index === this.state.monthIndex) {
      console.log('getPosition: cx: ', this.state.cx, ' cy: ', this.state.cy);
      return { cx: this.state.cx, cy: this.state.cy };
    }
  }

  render() {
    let {
      years,
      months,
      selectedYear,
      maxCountInYear,
      x,
      y,
      showTooltip,
      tooltip,
      cx,
      cy
    } = this.state;

    if (!Object.keys(years).length) return null;

    //Get the maximum count found for years
    let maxcount = 0;
    for (let year in years) {
      if (years[year] == undefined) {
        continue;
      }
      maxcount = Math.max(maxcount, Math.max.apply(null, years[year]));
    }

    if (captureGraphScaleIsRequired(years)) {
      let scaled = captureGraphScale(years, maxcount);
      years = scaled[0];
      maxcount = scaled[1];
    }

    const startYear = 1996;
    const endYear = new Date().getUTCFullYear();

    //screen width / year values
    const yearWidth = window.innerWidth / (endYear - startYear + 1);
    const height = 75;
    const yscale = height / maxcount;

    const yearsArr = Object.keys(years);
    let yearCounter = yearsArr[0];
    const newYearsArr = [];

    for (let i = 0; i < yearsArr.length; i++) {
      newYearsArr.push(yearCounter);
      yearCounter++;
    }

    return (
      <div className="vandal-container">
        <div className="vandal-year_container">
          {newYearsArr.map((y, i) => {
            return (
              <div
                className="vandal-year"
                key={`year-${y}`}
                onClick={this.showYear(y)}>
                <span className="vandal-year__value">{y}</span>
                <Sparklines
                  className="vandal-year__sparkline"
                  data={years[y]}
                  margin={0}
                  width={48}
                  height={height}
                  min={0}
                  max={maxcount}>
                  <SparklinesBars />
                </Sparklines>
              </div>
            );
          })}
        </div>
        <div className="vandal-month_container">
          {months.map((m, index) => {
            const countArr = m.map(mc => mc.cnt);
            const max = Math.max.apply(null, countArr);
            const points = dataToPoints({
              data: countArr,
              limit: 0,
              width: 80,
              height: 20,
              margin: 0,
              min: 0,
              max: !max ? max + 1 : max
            });

            return (
              <div
                className="vandal-month"
                key={`month-${index}-${selectedYear}`}>
                <span className="vandal-month__value">{monthNames[index]}</span>
                <Sparklines
                  className="vandal-month__sparkline"
                  points={points}
                  margin={0}
                  min={0}
                  max={!max ? max + 1 : max}
                  width={80}
                  height={20}>
                  <SparklinesCurve />
                </Sparklines>
                <SparklinesExternalInteractiveLayer
                  debounceTime={0}
                  points={points}
                  margin={0}
                  min={0}
                  max={!max ? max + 1 : max}
                  width={80}
                  position={this.getPosition(index)}
                  svgHeight={46}
                  style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  spotStyle={{ fill: '#708090' }}
                  spotRadius={3}
                  cyOffset={26}
                  cursorStyle={{ strokeWidth: 2, stroke: '#708090' }}
                  onMouseMove={this.onMouseMove(m, index)}
                  onMouseLeave={this.debouncedMouseLeave}
                />
              </div>
            );
          })}
          {showTooltip && (
            <Tooltip
              x={x}
              y={y}
              tooltip={tooltip}
              selectedYear={selectedYear}
              onMouseEnter={this.onTooltipEnter}
              onMouseMove={this.onTooltipEnter}
              onMouseLeave={this.onTooltipLeave}
            />
          )}
        </div>
      </div>
    );
  }

  async componentDidMount() {
    this.url = encodeURIComponent(getLocation());
    const sparklineData = await api(
      `https://web.archive.org/__wb/sparkline?url=${
        this.url
      }&collection=web&output=json`
    );
    let { years } = sparklineData;
    const averages = Object.keys(years).reduce((acc, y) => {
      const sum = years[y].reduce((a, b) => a + b);
      acc.push(sum / years[y].length);
      return acc;
    }, []);
    this.setState({ years });
  }
}
