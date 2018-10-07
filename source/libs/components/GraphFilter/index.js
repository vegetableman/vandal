import React from 'react';
import _ from 'lodash';
import { Sparklines, SparklinesBars, SparklinesCurve, SparklinesExternalInteractiveLayer, dataToPoints } from 'react-sparklines';
import GraphLoader from './loader.js';
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
}

const captureGraphScaleIsRequired = (years) => {
  let max = 0;
  let min = 1000;
  for (let year in years) {
    if (years[year] == undefined) {
      continue;
    }
    max = Math.max(max, Math.max.apply(null, years[year]));
    min = Math.min(min, Math.min.apply(null,
      years[year].filter(Boolean)));
  }
  return (Math.log1p(max) - Math.log1p(min) > 3);
}

export default class GraphFilter extends React.Component {
  constructor(props) {
    super(props);
    this.currentDate = new Date();
    this.state = {
      years: {},
      months: [],
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
    }
  }

  getPosition(index) {
    if (!_.isNil(this.props.selectedMonthIndex) && index === this.props.selectedMonthIndex) {
      return { cx: _.get(this.props, "selectedPoint.x"), cy: _.get(this.props, "selectedPoint.y")}
    }
    else if (index === this.state.monthIndex) {
      return { cx: this.state.cx, cy: this.state.cy }
    }
  }

  render() {
    let { sparkline, months, selectedYear, onChange, onMouseLeave, showLoader } = this.props;

    if (_.isEmpty(_.keys(sparkline))) return null;

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
    let yearCounter = sparklineYears[0];
    let years = []

    for (let i = 0; i < _.size(sparklineYears); i++) {
      years.push(yearCounter);
      yearCounter++;
    }

    return (
      <div className="vandal-graph">
        <div className="vandal-graph__year-container">
          {
            _.map(years, (y, i) => {
              return (
                <div className={`vandal-graph__year ${(selectedYear === y ? "vandal-graph__year--selected": "")}`} key={`year-${y}`} onClick={onChange(y)}>
                  <span className="vandal-graph__year__value">{y}</span>
                  <Sparklines className="vandal-graph__year__sparkline" data={sparkline[y]} margin={0} width={48} height={height} min={0} max={maxcount}>
                    <SparklinesBars style={{ stroke: "#708090", fill: "#708090"}}/>
                  </Sparklines>
                </div>
              );
            })
          }
        </div>
        {
          showLoader && (<div className="vandal-gh-loader-container">
            {
              _.map(monthNames, (m, index) => {
                return <GraphLoader key={index} className="vandal-gh-loader"/>
              })
            }
          </div>)
        }
        {
          !showLoader && (<div className="vandal-graph__month-container">
          {
            _.map(months, (m, index) => {
              const countList = _.map(m, (mc) => (mc.cnt))
              const max = Math.max.apply(null, countList)
              const points = dataToPoints({ data: countList, limit: 0, width: 80, height: 20, margin: 0, min: 0, max: !max ? max + 1 : max });

              return (
                <div className="vandal-graph__month" key={`month-${index}-${selectedYear}`}>
                  <span className="vandal-graph__month__value">{monthNames[index]}</span>
                  <Sparklines 
                    className="vandal-graph__month__sparkline"
                    points={points}
                    margin={0}
                    min={0}
                    max={!max ? max + 1 : max}
                    width={80}
                    height={20}
                  >
                    <SparklinesCurve/>
                  </Sparklines>
                  <SparklinesExternalInteractiveLayer
                    debounceTime={0}
                    points={points} 
                    margin={0} 
                    min={0} 
                    max={!max ? max + 1 : max} 
                    width={80}
                    position={this.getPosition(index)}
                    svgHeight={55} 
                    style={{cursor: "pointer", position: "absolute", top: 0, left: 0}}
                    spotStyle={{fill: "#708090"}}
                    spotRadius={3}
                    cyOffset={35}
                    cursorStyle={{strokeWidth: 2, stroke: "#708090"}}
                    onMouseMove={this.onMouseMove(m, index)}
                    onMouseLeave={onMouseLeave}
                  />
                </div>
              )
            })
          }
        </div>) 
      }
      </div>
    );
  }
}

