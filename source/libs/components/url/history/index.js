/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React from "react";
import memoizeOne from "memoize-one";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import {
  getDateTsFromURL,
  getDateTimeFromTS,
  toTwelveHourTime,
  isArchiveURL,
  navigator,
  longMonthNames
} from "../../../utils";
import { withDialog, Icon } from "../../common";
import { colors } from "../../../constants";

import styles from "./urlhistory.module.css";
import boxStyles from "../box/urlbox.module.css";

/**
 * Get current date in format DD MMMM, YYYY
 * @returns {String} - Formatted current date
 */
const getCurrentDate = () => {
  const currentDate = new Date();
  return `${currentDate.getDate()} ${
    longMonthNames[currentDate.getMonth()]
  }, ${currentDate.getFullYear()}`;
};

export const isCurrentDate = (d) => d === getCurrentDate();

const formatHistoryByDate = (history) => _.reduce(
  history,
  (acc, h) => {
    if (!acc[h.date]) {
      acc[h.date] = [];
    }
    acc[h.date].push(h.url);
    return acc;
  },
  {}
);

const memoizedFormatHistoryByDate = memoizeOne(formatHistoryByDate);

const URLHistory = ({
  dialogRef, history, clearHistory, onSelect
}) => {
  const dhistory = memoizedFormatHistoryByDate(history);
  return (
    <div className={styles.root} ref={dialogRef}>
      <ul className={styles.list}>
        {_.map(
          _.keys(dhistory).sort((a, b) => new Date(b) - new Date(a)),
          (date) => (
            <div key={date}>
              <div className={styles.date__title}>
                <span>{isCurrentDate(date) ? "Recently Visited" : date}</span>
              </div>
              <div>
                {_.map(_.reverse(_.slice(dhistory[date])), (url, index) => {
                  const dateTimeObj = isArchiveURL(url) ?
                    getDateTimeFromTS(_.get(getDateTsFromURL(url), "ts")) :
                    null;
                  return (
                    <li
                      className={styles.item}
                      key={index}
                      onClick={() => {
                        navigator.navigate(url);
                        onSelect();
                      }}
                    >
                      <div className={styles.url}>{url}</div>
                      {dateTimeObj && (
                      <div className={styles.date}>
                        {`${_.get(
                          dateTimeObj,
                          "humanizedDate"
                        )} ${toTwelveHourTime(
                          _.get(dateTimeObj, "time")
                        )}`}
                      </div>
                      )}
                    </li>
                  );
                })}
              </div>
            </div>
          )
        )}
        {_.isEmpty(history) && (
          <div className={styles.empty__msg}>
            No logs found. To enable or disable storage of navigation history across
            sessions, go to
            {" "}
            <button
              type="button"
              className={styles.options__btn}
              onClick={() => {
                browser.runtime.sendMessage({
                  message: "___VANDAL__CLIENT__SETTINGS"
                });
              }}
            >
              Extension options
            </button>
            .
          </div>
        )}
      </ul>
      <div className={styles.footer}>
        <Icon
          name="clear"
          data-for="vandal-clear-hist"
          data-tip="Clear History"
          className={styles.clear__icon}
          onClick={clearHistory}
        />
        <ReactTooltip
          id="vandal-clear-hist"
          className={styles.tooltip}
          arrowColor={colors.BL}
          textColor={colors.WHITE}
          backgroundColor={colors.BL}
          effect="solid"
          place="bottom"
          type="dark"
          offset={{ bottom: 6, left: 0 }}
        />
      </div>
    </div>
  );
};

URLHistory.propTypes = {
  dialogRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  clearHistory: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  history: PropTypes.array
};

URLHistory.defaultProps = {
  history: []
};

export default withDialog(URLHistory, {
  ignoreClickOnClass: `.${boxStyles.historyBtn}`
});
