import React from 'react';
import cx from 'classnames';
import {
  getDateTsFromURL,
  getDateTimeFromTS,
  toTwelveHourTime,
  isArchiveURL,
  browser
} from '../../../utils';
import { withDialog, Icon } from '../../common';

import styles from './urlhistory.module.css';
import boxStyle from '../box/urlbox.module.css';

const URLHistory = ({ currentIndex, dialogRef, history, clearHistory }) => {
  const err = false;

  const historyCount = _.size(history);
  const isLast = currentIndex === historyCount - 1;

  return (
    <div className={styles.root} ref={dialogRef}>
      <ul className={styles.list}>
        {!err &&
          _.map(_.reverse(_.slice(history)), (url, index) => {
            const dateTimeObj = isArchiveURL(url)
              ? getDateTimeFromTS(_.get(getDateTsFromURL(url), 'ts'))
              : null;
            return (
              <li
                className={cx({
                  [styles.item]: true,
                  [styles.item___active]:
                    isLast && !index
                      ? true
                      : historyCount - currentIndex - 1 === index
                })}
                key={url}
                onClick={() => {
                  browser.navigate(url);
                }}>
                <div>{url}</div>
                {dateTimeObj && (
                  <div className={styles.date}>{`${_.get(
                    dateTimeObj,
                    'humanizedDate'
                  )} ${toTwelveHourTime(_.get(dateTimeObj, 'ts'))}`}</div>
                )}
              </li>
            );
          })}
        {!err && _.isEmpty(history) && (
          <div className={styles.empty__msg}>
            No logs found. To disable storage of navigation history across
            sessions, go to Extension options.
          </div>
        )}
        {err && (
          <div className={styles.empty__msg}>
            Error fetching records. Please try again.
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
  ignoreClickOnClass: `.${boxStyle.historyBtn}`
});
