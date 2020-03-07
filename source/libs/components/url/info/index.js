import React, { useEffect, memo } from 'react';
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
  ({
    dialogRef,
    // isDialogClosed,
    url,
    redirectTSCollection,
    redirectedTS,
    selectedTS,
    onClose
  }) => {
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

    // useEffect(() => {
    //   isDialogClosed && onClose();
    // }, [isDialogClosed]);

    console.log('selectedTS', selectedTS, 'redirectedTS', redirectedTS);

    return (
      <div className={styles.urlInfo} ref={dialogRef}>
        <ul className={styles.infoList}>
          <li className={styles.infoItem}>
            <div className={styles.infoLabel}>Archive URL :</div>
            <a className={styles.infoLink} href={archiveURL} target="_blank">
              {archiveURL}
            </a>
          </li>
          <li className={styles.infoItem}>
            <div className={styles.infoLabel}>Rendered URL :</div>
            <a className={styles.infoLink} href={renderedURL} target="_blank">
              {renderedURL}
            </a>
          </li>
        </ul>
        {!!_.get(redirectTSCollection, redirectedTS) && (
          <div className={styles.redirectContainer}>
            <div className={styles.redirectHeader}>
              <Icon
                name="redirect"
                className={styles.redirectIcon}
                width={10}
              />
              <div className={styles.redirectTitle}>Redirect Path</div>
            </div>
            <div className={styles.redirectTSList}>
              {_.map(redirectTSList, (ts, index) => {
                const dateObj = getDateTimeFromTS(ts);
                return (
                  <React.Fragment key={ts}>
                    <div className={styles.redirectListItem}>
                      {`${dateObj.humanizedDate} ${toTwelveHourTime(
                        dateObj.ts
                      )}`}
                    </div>
                    {index !== _.size(redirectTSList) - 1 ? (
                      <Icon
                        name="pathArrow"
                        width={20}
                        className={styles.redirectPathIcon}
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        <div className={styles.infoNote}>
          Note: The time{' '}
          <span className={styles.infoDate}>{`${_.get(
            infoDateObj,
            'humanizedDate'
          )} ${toTwelveHourTime(_.get(infoDateObj, 'ts'))}`}</span>{' '}
          reflects the time on which Wayback Machine archived the page and not
          the actual page update time by the website owner.
        </div>
      </div>
    );
  },
  compareProps([
    'redirectedTS',
    'selectedTS',
    'redirectTSCollection'
    // 'isDialogClosed'
  ])
);

export default withDialog(URLInfo, {
  ignoreClickOnClass: `.${boxStyle.date}`
});
