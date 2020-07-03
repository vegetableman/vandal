import React, { useRef, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import cx from 'classnames';
import MonthView from './month/month.view';
import ImageLoader from './loader';
import CarouselView from './carousel.view';
import Terms from './terms';
import {
  toTwelveHourTime,
  getDateTsFromURL,
  longMonthNames
} from '../../utils';
import { VerticalMenu, Icon } from '../common';
import historicalMachine, {
  fetchSnapshot,
  cleanUp
} from './historical.machine';
import styles from './historical.module.css';
import { useTheme } from '../../hooks';

const options = [
  {
    value: 'showMonths',
    text: 'Show Months'
  },
  {
    value: 'openInVandal',
    text: 'Open in Vandal'
  },
  {
    value: 'openInNewTab',
    text: 'Open in New Tab'
  },
  {
    value: 'retry',
    text: 'Retry'
  }
];

const Historical = (props) => {
  const containerRef = useRef(null);
  const { theme } = useTheme();

  const [state, send] = useMachine(
    historicalMachine.withConfig(
      {
        actions: {
          notifyCarouselClose() {
            if (containerRef) {
              containerRef.current.focus();
            }
          }
        }
      },
      {
        url: props.url,
        years: props.years,
        snapshots: [],
        archiveURLs: []
      }
    )
  );

  const { context: ctx } = state;

  const onOptionSelect = (index, year, archiveURL) => async (option) => {
    if (option === 'retry') {
      send('SET_SNAPSHOT', { payload: { index, value: null } });
      const [snapshot, newArchiveURL] = await fetchSnapshot({
        url: props.url,
        year,
        archiveURL
      });

      if (newArchiveURL) {
        send('SET_ARCHIVE_URL', { payload: { index, value: newArchiveURL } });
      }
      const [data, err] = snapshot;
      send('SET_SNAPSHOT', { payload: { index, value: { data, err } } });
    } else if (option === 'showMonths') {
      send('TOGGLE_MONTH_VIEW_OPEN', {
        payload: { show: true, year }
      });
    } else if (option === 'openInNewTab') {
      window.open(archiveURL, '_blank');
    } else if (option === 'openInVandal') {
      props.openURL(archiveURL);
    }
  };

  const onEntered = () => {
    // delay the resize
    setTimeout(() => {
      send('TOGGLE_RESIZE_VIEW', { payload: { resize: true } });
    }, 10);
  };
  const onExited = () => {
    send('TOGGLE_RESIZE_VIEW', { payload: { resize: false } });
  };

  const getCaption = (index) => {
    if (ctx.carouselMode === 'month') {
      return { title: ctx.selectedYear, date: longMonthNames[index] };
    }
    return { title: 'YEAR', date: ctx.years[index] };
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 27) {
      props.onClose();
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (containerRef) {
      containerRef.current.focus();
    }
    send('LOAD_HISTORICAL');
    return () => {
      cleanUp();
    };
  }, []);

  return (
    <div
      className={styles.modal__container}
      onKeyDown={onKeyDown}
      ref={containerRef}
      tabIndex="0">
      {ctx.showTermModal && (
        <Terms
          onClose={() => {
            send('CLOSE_TERM_MODAL');
          }}
        />
      )}
      <div className={styles.container} onKeyDown={onKeyDown} tabIndex="0">
        <div
          className={cx({
            [styles.year__container]: true,
            [styles.year__container__month]: ctx.isViewResized
          })}>
          {_.map(ctx.years, (year, index) => {
            const archiveURL = ctx.archiveURLs[index];
            const dateObj = getDateTsFromURL(archiveURL);
            const snapshot = ctx.snapshots[index];
            return (
              <div
                className={cx({
                  [styles.year]: true,
                  [styles.year__selected]: ctx.selectedYear === year
                })}
                key={year}>
                <div
                  className={styles.body}
                  onClick={() => {
                    send('TOGGLE_CAROUSEL_OPEN', {
                      payload: {
                        index,
                        mode: 'year',
                        show: true,
                        images: _.map(ctx.snapshots, 'data')
                      }
                    });
                  }}>
                  {snapshot ? (
                    <React.Fragment>
                      {(_.get(snapshot, 'err') && (
                        <Icon
                          name="error"
                          className={styles.err}
                          title={_.get(snapshot, 'err')}
                        />
                      )) || (
                        <img
                          className={styles.snapshot}
                          src={_.get(snapshot, 'data')}
                        />
                      )}
                      <div className={styles.highlight} />
                      {dateObj && (
                        <div
                          className={styles.info}
                          data-for={`vandal-historical-year--info-${year}`}
                          data-tip={`${dateObj.date}, ${toTwelveHourTime(
                            dateObj.time
                          )}`}>
                          i
                        </div>
                      )}
                      <ReactTooltip
                        className={styles.info__tooltip}
                        id={`vandal-historical-year--info-${year}`}
                        effect="solid"
                        place="right"
                        insecure={false}
                        type={theme}
                      />
                    </React.Fragment>
                  ) : (
                    <ImageLoader theme={theme} />
                  )}
                </div>
                <div className={styles.footer}>
                  <div className={styles.value}>{year}</div>
                  <VerticalMenu
                    iconClass={styles.menu__icon}
                    className={styles.menu}
                    listClass={styles.list}
                    options={options}
                    onSelect={onOptionSelect(index, year, archiveURL)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {ctx.showMonthPanel && (
          <MonthView
            url={ctx.url}
            year={ctx.selectedYear}
            show={ctx.showMonthPanel}
            onEntered={onEntered}
            onExited={onExited}
            onClose={() => {
              send('TOGGLE_MONTH_VIEW_CLOSE');
            }}
            openMonth={(index, snapshots) => () => {
              send('TOGGLE_CAROUSEL_OPEN', {
                payload: {
                  show: true,
                  mode: 'month',
                  index,
                  images: _.map(snapshots, 'data')
                }
              });
            }}
            theme={theme}
            openURL={props.openURL}
          />
        )}
        {ctx.showCarousel && (
          <CarouselView
            images={ctx.images}
            selectedIndex={ctx.selectedIndex}
            getCaption={getCaption}
            onClose={() => {
              send('TOGGLE_CAROUSEL_CLOSE');
            }}
          />
        )}
      </div>
      <div className={styles.misc__container}>
        <Icon
          name="settings"
          className={styles.settings}
          onClick={() => {
            chrome.runtime.sendMessage({
              message: '__VANDAL__CLIENT__OPTTONS'
            });
          }}
        />
        <Icon name="close" className={styles.close} onClick={props.onClose} />
      </div>
    </div>
  );
};

export default Historical;
