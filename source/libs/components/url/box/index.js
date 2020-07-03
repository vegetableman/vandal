import React, { useState, useEffect, memo } from 'react';
import cx from 'classnames';
import ArchiveLoader from './loader';
import { URLLoader, Icon } from '../../common';
import {
  getDateTimeFromTS,
  toTwelveHourTime,
  isArchiveURL,
  compareProps
} from '../../../utils';
import { useTheme } from '../../../hooks';

import styles from './urlbox.module.css';

const URLBox = memo((props) => {
  const getTS = (props) => {
    if (props.redirectedTS) {
      return props.redirectedTS;
    }
    // else if (
    //   _.includes(_.values(props.redirectTSCollection), props.selectedTS)
    // ) {
    //   return _.findKey(
    //     props.redirectTSCollection,
    //     value => value === props.selectedTS
    //   );
    // }
    else {
      return props.selectedTS;
    }
  };

  const [currentTS, setCurrentTs] = useState(getTS(props));
  const dateObj = currentTS ? getDateTimeFromTS(currentTS) : {};
  const [showURLLoader, toggleURLLoader] = useState(false);
  const [showFrameLoader, toggleFrameLoader] = useState(false);
  const { theme } = useTheme();

  useEffect(
    () => {
      setCurrentTs(getTS(props));
    },
    [props.redirectedTS, props.selectedTS]
  );

  let frameLoaderTimeout;
  const onMessage = async (request) => {
    console.log('urlbox:', request.message);
    switch (request.message) {
      case '__VANDAL__NAV__BEFORENAVIGATE':
        toggleURLLoader(true);
        console.log('urlbox:beforenavigate');
        const URL = _.get(request.data, 'url');
        if (isArchiveURL(URL)) {
          toggleFrameLoader(true);
          if (frameLoaderTimeout) {
            clearTimeout(frameLoaderTimeout);
          }
          frameLoaderTimeout = setTimeout(() => {
            toggleFrameLoader(false);
          }, 2500);
        }
        break;
      case '__VANDAL__NAV__ERROR':
        console.log('urlbox:error');
        toggleURLLoader(false);
        break;
      case '__VANDAL__NAV__COMPLETE':
        console.log('urlbox:complete');
        toggleURLLoader(false);
        toggleFrameLoader(false);
        break;
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  console.log('URLBOX:currentTS:', currentTS);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.favicon}>
          {showURLLoader && <URLLoader />}
          {!currentTS &&
            !showURLLoader && (
              <Icon name="globe" className={styles.url__icon} />
            )}
          {!!currentTS &&
            !showURLLoader && (
              <Icon name="archive" className={styles.archiveIcon} />
            )}
        </div>
        <input
          type="text"
          className={styles.input}
          value={props.url}
          readOnly
        />
        <button
          className={cx(styles.history__btn, {
            [styles.history__btn___active]: props.showURLHistory
          })}
          onClick={props.toggleURLHistory}>
          <Icon name="bottomCaret" className={styles.caret} />
        </button>
      </div>
      {!!currentTS && (
        <div
          className={cx({
            [styles.date]: true,
            [styles.date__loader]: showFrameLoader,
            [styles.date__info]: props.showURLInfo && !showFrameLoader
          })}
          onClick={props.toggleURLInfo}>
          {showFrameLoader && (
            <ArchiveLoader title="Loading..." theme={theme} />
          )}
          {!showFrameLoader && (
            <Icon
              name="info"
              className={cx({
                [styles.info__icon]: true,
                [styles.info__icon___dark]: theme === 'dark'
              })}
            />
          )}
          <div className={styles.date__text}>
            <span style={{ marginRight: '3px' }}>{dateObj.humanizedDate}</span>{' '}
            <span>{toTwelveHourTime(dateObj.ts)}</span>
          </div>
        </div>
      )}
      <div className={styles.timetravel__container}>
        <div
          className={cx({
            [styles.timetravel__btn]: true,
            [styles.timetravel__btn___selected]: props.showTimeTravel,
            [styles.timetravel__btn___updated]: props.sparklineLoaded
          })}
          onClick={props.toggleTimeTravel}>
          <Icon className={styles.timetravelIcon} name="history" width={22} />
        </div>
      </div>
    </div>
  );
}, compareProps(['redirectedTS', 'selectedTS', 'url', 'redirectTSCollection', 'showURLHistory', 'showURLInfo', 'showTimeTravel', 'sparklineLoaded']));

export default URLBox;
