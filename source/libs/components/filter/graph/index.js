import React, { memo } from "react";
import cx from "classnames";
import _ from "lodash";
import {
  Sparklines,
  SparklinesBars,
  SparklinesCurve,
  dataToPoints
} from "react-sparklines";

import GraphLoader from "./loader.js";
import Calendar from "./calendar";
import { monthNames, compareProps, getLastDate } from "../../../utils";
import { Icon } from "../../common";
import { useTheme, useTimeTravel } from "../../../hooks/index.js";

import styles from "./graph.module.css";

const captureGraphScale = (years, maxcount) => {
  const scaled = [];
  for (const year in years) {
    if (!years[year]) {
      continue;
    }
    scaled[year] = years[year].map(Math.log1p);
  }
  return [scaled, Math.log1p(maxcount)];
};

const captureGraphScaleIsRequired = (years) => {
  let max = 0;
  let min = 1000;
  for (const year in years) {
    if (years[year] == undefined) {
      continue;
    }
    max = Math.max(max, Math.max.apply(null, years[year]));
    min = Math.min(min, Math.min.apply(null, years[year].filter(Boolean)));
  }
  return Math.log1p(max) - Math.log1p(min) > 3;
};

const Bars = memo(({ theme, ...rest }) => (
  <SparklinesBars
    {...rest}
    style={{
      stroke: theme === "dark" ? "#5B85AC" : "#708090",
      fill: theme === "dark" ? "#5B85AC" : "#708090"
    }}
  />
), (prevProps, newProps) => prevProps.width === newProps.width && prevProps.height === newProps.height && prevProps.margin === newProps.margin);

const Curve = memo(({ theme, ...rest }) => (
  <SparklinesCurve
    {...rest}
    style={{
      stroke: theme === "dark" ? "#5B85AC" : "#708090",
      fill: theme === "dark" ? "#5B85AC" : "#708090"
    }}
  />
), (prevProps, newProps) => prevProps.width === newProps.width && prevProps.height === newProps.height && prevProps.margin === newProps.margin);

const Spark = memo((props) => <Sparklines {...props} />, (prevProps, newProps) => prevProps.width === newProps.width && prevProps.height === newProps.height && prevProps.margin === newProps.margin && prevProps.min === newProps.min && prevProps.max === newProps.max);

const GraphFilter = memo((props) => {
  let {
    sparkline,
    months,
    currentMonth,
    currentYear,
    onYearChange,
    onMonthChange,
    showCalendarLoader,
    showSparkError,
    showCalendarError,
    showSparkLoader,
    isOverCapacity
  } = props;

  const { theme } = useTheme();

  if (showSparkError || showCalendarError) {
    return (
      <div className={styles.error__container}>
        <div
          className={cx({
            [styles.error]: true,
            [styles.calendar__error]: props.showCalendarError
          })}
        >
          <Icon
            name="networkErr"
            width={35}
            height={35}
            className={styles.error__icon}
          />
        </div>
        {(props.showSparkError
          && showSparkLoader && (
            <div className={styles.error__msg}>Retrying...</div>
        )) || (
          <div className={styles.error__msg}>
            ERR:
            {" "}
            {props.error || "Request Failed"}
          </div>
        )}
        <button className={styles.retry__btn} onClick={props.retry}>
          Retry
        </button>
      </div>
    );
  } if (_.isEmpty(_.keys(sparkline))) return null;

  let date;
  if (currentYear && currentMonth) {
    date = `${currentYear}-${_.padStart(currentMonth, 2, "0")}`;
  }

  let maxcount = 0;
  for (const year in sparkline) {
    if (sparkline[year] == undefined) {
      continue;
    }
    maxcount = Math.max(maxcount, Math.max.apply(null, sparkline[year]));
  }

  if (captureGraphScaleIsRequired(sparkline)) {
    const scaled = captureGraphScale(sparkline, maxcount);
    sparkline = scaled[0];
    maxcount = scaled[1];
  }

  const years = _.map(Object.keys(sparkline), (y) => _.parseInt(y));

  return (
    <div className={styles.root}>
      <div className={styles.year__container}>
        {_.map(years, (y) => (
          <div
            className={cx({
              [styles.year]: true,
              [styles.year___selected]: theme !== "dark" && currentYear === y,
              [styles.year___selected___dark]:
                  theme === "dark" && currentYear === y
            })}
            key={`year-${y}`}
            onClick={onYearChange(y)}
          >
            <label className={styles.year__value}>{y}</label>
            <Spark
              data={sparkline[y]}
              margin={0}
              width={48}
              height={75}
              min={0}
              max={maxcount}
            >
              <Bars theme={theme} />
            </Spark>
          </div>
        ))}
      </div>
      {showCalendarLoader && (
        <div className={styles.loader__container}>
          {_.map(monthNames, (_m, index) => (
            <div className={styles.loader__month} key={index}>
              <GraphLoader
                key={index}
                className={styles.loader}
                theme={theme}
              />
            </div>
          ))}
        </div>
      )}
      {!showCalendarLoader
        && currentYear && (
          <div className={styles.month__container}>
            {!_.isEmpty(months)
              && _.map(months, (m, index) => {
                const lastDate = getLastDate(
                  `${index + 1}/1/${currentYear}`
                ).getDate();
                const month = _.merge(
                  Array.from(new Array(lastDate).keys()),
                  m
                );
                const countList = _.map(month, (mc) => _.get(mc, "cnt", 0));
                const max = _.max(countList);
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
                      [styles.month]: true,
                      [styles.month___selected]:
                        theme !== "dark" && index === currentMonth - 1,
                      [styles.month___selected___dark]:
                        theme === "dark" && index === currentMonth - 1
                    })}
                    key={`month-${index}-${currentYear}`}
                    onClick={onMonthChange(index + 1)}
                  >
                    <span className={styles.month__value}>
                      {monthNames[index]}
                    </span>
                    {!!max && !_.isEmpty(points) ? (
                      <Spark
                        points={points}
                        margin={0}
                        min={0}
                        max={!max ? max + 1 : max}
                        width={100}
                        height={20}
                      >
                        <Curve theme={theme} />
                      </Spark>
                    ) : null}
                    {!!max && _.isEmpty(points) && isOverCapacity ? (
                      <GraphLoader
                        key={index}
                        className={styles.month__placeholder}
                        theme={theme}
                      />
                    ) : null}
                  </div>
                );
              })}
            {_.isEmpty(months)
              && _.map(monthNames, (m, index) => (
                <div
                  className={cx({
                    [styles.month]: true,
                    [styles.month___selected]: index === currentMonth - 1
                  })}
                  key={`month-${index}-${currentYear}`}
                  onClick={onMonthChange(index + 1)}
                >
                  <span className={styles.month__value}>{m}</span>
                </div>
              ))}
          </div>
      )}
      {!showCalendarLoader
        && date && (
          <Calendar
            date={date}
            getColor={props.getColor}
            onMouseMove={props.onMouseMove}
            onMouseLeave={props.onMouseLeave}
            onClick={props.onClick}
          />
      )}
    </div>
  );
}, compareProps(["selectedYear", "selectedMonth", "currentYear", "currentMonth", "currentDay", "showError", "showCalendarLoader", "showSparkError", "showSparkLoader", "showCalendarError", "sparkline", "months", "highlightedDay", "calendarLoaded", "mountCount", "isOverCapacity"]));

const GraphFilterContainer = (props) => {
  const { state } = useTimeTravel();
  const { context: ctx } = state;

  const months = _.get(ctx.calendar, ctx.currentYear);
  return (
    <GraphFilter
      {...props}
      months={months}
      isOverCapacity={ctx.isOverCapacity}
      mountCount={_.size(_.compact(months))}
      selectedYear={ctx.selectedYear}
      selectedMonth={ctx.selectedMonth}
      currentMonth={ctx.currentMonth}
      currentYear={ctx.currentYear}
      currentDay={ctx.currentDay}
      highlightedDay={ctx.highlightedDay}
      sparkline={ctx.sparkline}
      error={ctx.error}
      showCalendarLoader={state.matches("sparklineLoaded.loadingCalendar")}
      showSparkLoader={state.matches("loadingSparkline")}
      showSparkError={
        _.get(state, "event.type") === "RELOAD_SPARKLINE_ON_ERROR"
        || state.matches("sparklineError")
      }
      showCalendarError={state.matches("sparklineLoaded.calendarError")}
    />
  );
};

export default GraphFilterContainer;
