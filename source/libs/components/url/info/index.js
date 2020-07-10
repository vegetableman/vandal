import React, { memo } from 'react';
import _ from 'lodash';
import {
  getDateTimeFromTS,
  toTwelveHourTime,
  compareProps
} from '../../../utils';
import { withDialog, Icon } from '../../common';

import styles from './urlinfo.module.css';
import boxStyle from '../box/urlbox.module.css';

const URLInfo = memo(
  ({ dialogRef, url, redirectTSCollection, redirectedTS, selectedTS }) => {
    const archiveURL = `https://web.archive.org/web/${selectedTS}/${url}`;
    const renderedURL = `https://web.archive.org/web/${redirectedTS ||
      selectedTS}/${url}`;
    let infoDateObj;
    let redirectTSList = [];

    if (_.get(redirectTSCollection, redirectedTS)) {
      infoDateObj = getDateTimeFromTS(redirectedTS);
      redirectTSList = [redirectTSCollection[redirectedTS], redirectedTS];
    } else {
      infoDateObj = getDateTimeFromTS(selectedTS);
    }

    return (
      <div className={styles.info} ref={dialogRef}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <div className={styles.label}>Archive URL :</div>
            <a className={styles.link} href={archiveURL} target="_blank">
              {archiveURL}
            </a>
          </li>
          <li className={styles.item}>
            <div className={styles.label}>Rendered URL :</div>
            <a className={styles.link} href={renderedURL} target="_blank">
              {renderedURL}
            </a>
          </li>
        </ul>
        {!!_.get(redirectTSCollection, redirectedTS) && (
          <div className={styles.redirect__container}>
            <div className={styles.redirect__header}>
              <Icon
                name="redirect"
                className={styles.redirect__icon}
                width={10}
              />
              <div className={styles.redirect__title}>Redirect Path</div>
            </div>
            <div className={styles.redirect__ts__list}>
              {_.map(redirectTSList, (ts, index) => {
                const dateObj = getDateTimeFromTS(ts);
                return (
                  <React.Fragment key={ts}>
                    <div className={styles.redirect__ts__list__item}>
                      {`${dateObj.humanizedDate} ${toTwelveHourTime(
                        dateObj.ts
                      )}`}
                    </div>
                    {index !== _.size(redirectTSList) - 1 ? (
                      <Icon
                        name="pathArrow"
                        width={20}
                        className={styles.redirect__path__icon}
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        <div className={styles.note}>
          Note: The time{' '}
          <span className={styles.date}>{`${_.get(
            infoDateObj,
            'humanizedDate'
          )} ${toTwelveHourTime(_.get(infoDateObj, 'ts'))}`}</span>{' '}
          reflects the time on which Wayback Machine archived the page and not
          the actual page update time by the website owner.
        </div>
      </div>
    );
  },
  compareProps(['redirectedTS', 'selectedTS', 'redirectTSCollection'])
);

export default withDialog(URLInfo, {
  ignoreClickOnClass: `.${boxStyle.date}`
});
