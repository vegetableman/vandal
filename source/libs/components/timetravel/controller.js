import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import memoizeOne from "memoize-one";
import { Icon } from "../common";
import {
  getTSFromCurrentMonth,
  getTSFromCurrentYear,
  findCalendarFromTS,
  findDayFromTs
} from "./timetravel.machine";

import { useTimeTravel } from "../../hooks";
import { countVersions, compareProps } from "../../utils";
import styles from "./controller.module.css";
import { colors } from "../../constants";

const memoizedCountVersions = memoizeOne(countVersions);

const Controller = memo((props) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const isTSSelected = (ts) => ts === props.selectedTS;

  const setOnline = () => {
    setIsOffline(false);
  };
  const setOffline = () => {
    setIsOffline(true);
  };

  useEffect(() => {
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  const goToTS = (dir) => {
    let ts = getTSFromCurrentMonth(
      dir,
      props.months,
      props.selectedTS,
      props.currentDay,
      props.currentMonth
    );
    if (!ts) {
      ts = getTSFromCurrentYear(dir, props.months, props.selectedTS);
    }
    if (!ts) {
      const { year, month } = findCalendarFromTS(
        props.sparkline,
        props.currentYear,
        dir
      );

      return props.send("GOTO__TS_YEAR", {
        payload: {
          month: month + 1,
          year,
          meta: { dir }
        }
      });
    }
    return props.send("NAVIGATETO__TS", { value: ts });
  };

  const debouncedPrev = _.debounce(() => goToTS("prev"), 250);
  const debouncedNext = _.debounce(() => goToTS("next"), 250);

  const isTSVisible = () => {
    const { months, currentMonth, currentDay } = props;
    const date = _.get(months, `[${currentMonth - 1}][${currentDay - 1}]`);
    return _.some(_.get(date, "ts"), (ts) => isTSSelected(ts));
  };

  const onDateNavigation = (dir) => {
    const result = findDayFromTs(
      props.currentDay,
      props.currentMonth,
      props.months,
      props.selectedTS,
      dir
    );
    if (result) {
      const { ts, day, month } = result;
      return props.send("GOTO__TS_DATE", {
        payload: {
          ts,
          day,
          month
        }
      });
    }

    const { year, month } = findCalendarFromTS(
      props.sparkline,
      props.currentYear,
      dir
    );

    return props.send("GOTO__TS_YEAR", {
      payload: {
        month: month + 1,
        year,
        meta: { dir }
      }
    });
  };

  return (
    <div className={styles.container}>
      {isOffline && (
        <Icon name="error" width={18} className={styles.error__icon} />
      )}
      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.control} ${styles.first__btn}`}
          disabled={
            !props.versionCount ||
            !props.firstTS ||
            props.selectedTS === props.firstTS ||
            props.sparklineError ||
            props.calendarError ||
            props.loadingCalendar
          }
          onClick={() => props.send("GOTO__FIRST_TS")}
        >
          <Icon
            data-for="vandal-first-ts"
            data-tip="First Snapshot"
            name="firstTS"
            className={styles.control__icon}
          />
          <ReactTooltip
            id="vandal-first-ts"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 12, left: -5 }}
          />
        </button>
        <button
          type="button"
          className={`${styles.control} ${styles.backward__btn}`}
          onClick={() => {
            onDateNavigation("prev");
          }}
          disabled={
            !props.versionCount ||
            !isTSVisible() ||
            !props.firstTS ||
            !props.selectedTS ||
            props.selectedTS === props.firstTS ||
            props.sparklineError ||
            props.isOverCapacity ||
            props.calendarError
          }
        >
          <Icon
            data-for="vandal-backward-ts"
            data-tip="Previous Date Snapshot"
            name="backwardTS"
            className={`${styles.control__icon} ${styles.backward__icon}`}
          />
          <ReactTooltip
            id="vandal-backward-ts"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 10, left: -5 }}
          />
        </button>
        <button
          type="button"
          className={`${styles.control} ${styles.prev__btn}`}
          disabled={
            !props.versionCount ||
            !props.selectedTS ||
            props.selectedTS === props.firstTS ||
            !isTSVisible() ||
            props.isOverCapacity ||
            props.sparklineError ||
            props.calendarError
          }
          onClick={debouncedPrev}
        >
          <Icon
            name="prevTS"
            data-for="vandal-prev-ts"
            data-tip="Previous Snapshot"
            className={`${styles.control__icon} ${styles.prev__icon}`}
          />
          <ReactTooltip
            id="vandal-prev-ts"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 11, left: 0 }}
          />
        </button>
        <button
          type="button"
          className={`${styles.control} ${styles.next__btn}`}
          disabled={
            !props.versionCount ||
            !props.selectedTS ||
            props.selectedTS === props.lastTS ||
            !isTSVisible() ||
            props.isOverCapacity ||
            props.sparklineError ||
            props.calendarError
          }
          onClick={debouncedNext}
        >
          <Icon
            data-for="vandal-next-ts"
            data-tip="Next Snapshot"
            name="nextTS"
            className={`${styles.control__icon} ${styles.next__icon}`}
          />
          <ReactTooltip
            id="vandal-next-ts"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 11, left: 0 }}
          />
        </button>
        <button
          type="button"
          className={`${styles.control} ${styles.forward__btn}`}
          disabled={
            !props.versionCount ||
            !props.lastTS ||
            !props.selectedTS ||
            props.selectedTS === props.lastTS ||
            !isTSVisible() ||
            props.sparklineError ||
            props.isOverCapacity ||
            props.calendarError ||
            props.loadingCalendar
          }
          onClick={() => {
            onDateNavigation("next");
          }}
        >
          <Icon
            data-for="vandal-forward-ts"
            data-tip="Next Date Snapshot"
            name="forwardTS"
            className={`${styles.control__icon} ${styles.forward__icon}`}
          />
          <ReactTooltip
            id="vandal-forward-ts"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 10, left: 0 }}
          />
        </button>
        <button
          type="button"
          className={`${styles.control} ${styles.last__btn}`}
          disabled={
            !props.versionCount ||
            !props.lastTS ||
            props.selectedTS === props.lastTS ||
            props.sparklineError ||
            props.calendarError ||
            props.loadingCalendar
          }
          onClick={() => props.send("GOTO__LAST_TS")}
        >
          <Icon
            name="lastTS"
            data-for="vandal-last-ts"
            data-tip="Last Snapshot"
            className={styles.control__icon}
          />
          <ReactTooltip
            id="vandal-last-ts"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 12, left: 0 }}
          />
        </button>
      </div>
    </div>
  );
}, compareProps(["sparkline", "isOverCapacity", "versionCount", "firstTS", "lastTS", "selectedTS", "months", "currentDay", "currentMonth", "currentYear", "loadingCalendar", "sparklineError", "calendarError"]));

Controller.propTypes = {
  send: PropTypes.func.isRequired,
  sparklineError: PropTypes.bool,
  calendarError: PropTypes.bool,
  loadingCalendar: PropTypes.bool,
  isOverCapacity: PropTypes.bool,
  versionCount: PropTypes.number,
  selectedTS: PropTypes.number,
  lastTS: PropTypes.number,
  firstTS: PropTypes.number,
  months: PropTypes.array,
  currentMonth: PropTypes.number,
  currentDay: PropTypes.number,
  sparkline: PropTypes.object,
  currentYear: PropTypes.number
};

Controller.defaultProps = {
  sparklineError: false,
  calendarError: false,
  loadingCalendar: false,
  isOverCapacity: false,
  versionCount: null,
  selectedTS: null,
  lastTS: null,
  firstTS: null,
  months: null,
  currentMonth: null,
  currentDay: null,
  sparkline: null,
  currentYear: null
};

const ControllerContainer = () => {
  const { state, send } = useTimeTravel();
  const { context: ctx } = state;
  const versionCount = memoizedCountVersions(ctx.sparkline);
  return (
    <Controller
      {...ctx}
      send={send}
      versionCount={versionCount}
      loadingCalendar={state.matches("loadingCalendar")}
      sparklineError={state.matches("sparklineError")}
      calendarError={state.matches("sparklineLoaded.calendarError")}
      months={_.get(ctx.calendar, ctx.currentYear)}
    />
  );
};

export default ControllerContainer;
