import React, { useState, useEffect, memo } from 'react';
import ReactTooltip from 'react-tooltip';
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
import { useIntro } from '../../../hooks/use-intro';
import { colors } from '../../../constants';

const URLBox = memo((props) => {
  const { showIntro, toggleIntro } = useIntro();
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
  const [showReadOnly, toggleReadOnly] = useState(false);
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
        const URL = _.get(request.data, 'url');
        console.log('urlbox:beforenavigate', URL);
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
              <Icon name="archive" className={styles.archive__icon} />
            )}
        </div>
        <input
          type="text"
          className={styles.input}
          value={props.url}
          readOnly
          onMouseEnter={() => {
            toggleReadOnly(true);
          }}
          onMouseOut={(e) => {
            if (e.relatedTarget && e.relatedTarget.hasAttribute('data-for')) {
              return;
            }
            toggleReadOnly(false);
          }}
        />
        <Icon
          style={{ visibility: showReadOnly ? 'visible' : 'hidden' }}
          data-for="vandal-readonly"
          data-tip="URL is non-editable"
          name="readOnly"
          className={styles.readonly__icon}
          onMouseLeave={() => {
            toggleReadOnly(false);
          }}
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
            [styles.timetravel__btn___updated]: props.sparklineLoaded,
            [styles.timetravel__btn__intro]: showIntro
          })}
          onClick={() => {
            toggleIntro(false);
            props.toggleTimeTravel();
          }}>
          <Icon
            className={cx({
              [styles.timetravel__icon]: true,
              [styles.timetravel__icon__intro]: showIntro
            })}
            name="history"
            width={22}
          />
          {showIntro && (
            <div
              className={styles.intro}
              onClick={() => {
                toggleIntro(false);
              }}>
              <Icon
                name="introArrow"
                width={92}
                height={177}
                className={styles.intro_arrow__icon}
              />
              <span className={styles.intro__text}>Get started!</span>
            </div>
          )}
        </div>
      </div>
      <ReactTooltip
        border
        className={styles.tooltip}
        id="vandal-readonly"
        effect="solid"
        place="right"
        type={theme}
        textColor={colors.WHITE}
        backgroundColor={colors.BL}
        borderColor={colors.BL}
        arrowColor={colors.BL}
        delayHide={100}
        delayShow={100}
        offset={{ left: -5 }}
      />
    </div>
  );
}, compareProps(['redirectedTS', 'selectedTS', 'url', 'redirectTSCollection', 'showURLHistory', 'showURLInfo', 'showTimeTravel', 'sparklineLoaded']));

export default URLBox;
