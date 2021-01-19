import React from 'react';
import {
  getDateTsFromURL,
  getDateTimeFromTS,
  toTwelveHourTime,
  isArchiveURL,
  browser,
  isCurrentDate
} from '../../../utils';
import { withDialog, Icon } from '../../common';

import styles from './urlhistory.module.css';
import boxStyles from '../box/urlbox.module.css';

const formatHistoryByDate = (history) => {
  return _.reduce(
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
};

const URLHistory = ({ dialogRef, history, clearHistory, onSelect }) => {
  const dhistory = formatHistoryByDate(history);
  return (
    <div className={styles.root} ref={dialogRef}>
      <ul className={styles.list}>
        {_.map(
          _.keys(dhistory).sort((a, b) => new Date(b) - new Date(a)),
          (date) => {
            return (
              <div key={date}>
                <h3 className={styles.date__title}>
                  <span>{isCurrentDate(date) ? 'Recently Visted' : date}</span>
                </h3>
                <div>
                  {_.map(_.reverse(_.slice(dhistory[date])), (url, index) => {
                    const dateTimeObj = isArchiveURL(url)
                      ? getDateTimeFromTS(_.get(getDateTsFromURL(url), 'ts'))
                      : null;
                    return (
                      <li
                        className={styles.item}
                        key={index}
                        onClick={() => {
                          browser.navigate(url);
                          onSelect();
                        }}>
                        <div>{url}</div>
                        {dateTimeObj && (
                          <div className={styles.date}>{`${_.get(
                            dateTimeObj,
                            'humanizedDate'
                          )} ${toTwelveHourTime(
                            _.get(dateTimeObj, 'ts')
                          )}`}</div>
                        )}
                      </li>
                    );
                  })}
                </div>
              </div>
            );
          }
        )}
        {_.isEmpty(history) && (
          <div className={styles.empty__msg}>
            No logs found. To disable storage of navigation history across
            sessions, go to Extension options.
          </div>
        )}
      </ul>
      <div className={styles.footer}>
        <Icon
          name="clear"
          className={styles.clear__icon}
          onClick={clearHistory}
        />
      </div>
    </div>
  );
};

export default withDialog(URLHistory, {
  ignoreClickOnClass: `.${boxStyles.historyBtn}`
});
