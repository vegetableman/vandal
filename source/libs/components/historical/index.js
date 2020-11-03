import React, { useRef, useEffect, useState } from 'react';
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
  longMonthNames,
  useEventCallback
} from '../../utils';
import { historicalDB } from '../../utils/storage';
import { VerticalMenu, Icon } from '../common';
import historicalMachine, {
  fetchSnapshot,
  cleanUp
} from './historical.machine';
import styles from './historical.module.css';
import { useTheme, useTimeTravel } from '../../hooks';
import { CSSTransition } from 'react-transition-group';

const options = [
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
  const { state: ttstate } = useTimeTravel();
  const [showInfoModal, toggleInfoModal] = useState(false);

  const [state, send, service] = useMachine(
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
        years: _.keys(_.get(ttstate, 'context.sparkline')),
        snapshots: [],
        archiveURLs: [],
        isHistoricalEnabled: true
      }
    )
  );

  const { context: ctx } = state;

  const onOptionSelect = useEventCallback(
    (index, year) => async (option) => {
      const archiveURL = ctx.archiveURLs[index];
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
    },
    [ctx.archiveURLs]
  );

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
    e.stopPropagation();
    if (e.keyCode === 27) {
      cleanUp();
      service.stop();
      props.onClose();
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (containerRef) {
      containerRef.current.focus();
    }
    service.onStop(() => {
      cleanUp();
    });
    const loadInfo = async () => {
      const infoCount = await historicalDB.getInfo();
      if (!infoCount || _.parseInt(infoCount) > 10) {
        setTimeout(() => {
          toggleInfoModal(true);
        }, 250);
      } else {
        historicalDB.setInfo(_.parseInt(infoCount) + 1);
      }
    };
    loadInfo();
  }, []);

  useEffect(
    () => {
      const years = _.keys(_.get(ttstate, 'context.sparkline'));
      if (!_.isEmpty(years)) {
        send('INIT_HISTORICAL', {
          payload: { years, url: props.url }
        });
      }
    },
    [_.get(ttstate, 'context.sparkline'), props.url]
  );

  return !!ttstate.matches('loadingSparkline') ? (
    <div
      className={styles.modal__container}
      onKeyDown={onKeyDown}
      ref={containerRef}
      tabIndex="0">
      Loading...
    </div>
  ) : (
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
      {state.matches('historicalUnAvailable') && (
        <div className={styles.disabled__overlay}>
          <div className={styles.disabled__modal}>
            <div className={styles.disabled__cover__container}>
              <img src={chrome.runtime.getURL('images/warning.png')} />
            </div>
            <div style={{ padding: '0 10px 10px 10px' }}>
              <h2 style={{ fontSize: '14px' }}>
                Historical View is no longer operational!
              </h2>
              <p style={{ fontSize: '14px' }}>
                <i>
                  "No! I am out of Power! Wish I hadn't destroyed this planet
                  and disrupted the gravitational balance in the solar
                  system.... Well, time for lunch !"
                </i>{' '}
                - Vandal
              </p>
              <span style={{ fontSize: '14px' }}>
                To know more, click{' '}
                <a
                  target="_blank"
                  href="https://github.com/vegetableman/vandal/issues/1">
                  here
                </a>
              </span>
            </div>
          </div>
        </div>
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
                        <div className={styles.err_container}>
                          <Icon
                            name="error"
                            className={styles.err}
                            title={_.get(snapshot, 'err')}
                          />
                          <button
                            className={styles.retry__btn}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOptionSelect(index, year)('retry');
                            }}>
                            Retry
                          </button>
                        </div>
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
                        type={'dark'}
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
                    onSelect={(option) => onOptionSelect(index, year)(option)}
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
      <div className={styles.action__container}>
        <Icon name="close" className={styles.close} onClick={props.onClose} />
      </div>
      {showInfoModal && state.matches('loadingHistorical') ? (
        <div className={styles.info__modal__container}>
          <CSSTransition
            in={true}
            appear={true}
            mountOnEnter={true}
            unmountOnExit={true}
            classNames={{
              appear: styles.modal__appear,
              appearActive: styles.modal__appear__active,
              enter: styles.modal__enter,
              enterActive: styles.modal__enter__active,
              exit: styles.modal__exit,
              exitActive: styles.modal__exit__active
            }}
            timeout={{ enter: 1000, exit: 1000 }}>
            <div className={styles.info__modal}>
              <img
                className={styles.info__cover}
                src={chrome.runtime.getURL('images/historical-cover-art.png')}
              />
              <div
                style={{
                  padding: '0 20px'
                }}>
                <p style={{ fontSize: 14 }}>
                  It's 3000 PA (Post Apocalypse), the cockroaches have taken
                  over. And the Zero point energy generator that could power the
                  timetravel machine has been stolen by a colony of giant
                  roaches.
                </p>
                <p style={{ fontSize: 14 }}>
                  Resources are low.{' '}
                  <a
                    href="https://archive.org/donate/?ref=vandal"
                    target="blank"
                    style={{ color: '#a50025' }}>
                    Fund the Internet Archive to keep Vandal running.
                  </a>
                </p>
              </div>
              <button
                className={styles.info__button}
                onClick={() => {
                  toggleInfoModal(false);
                  historicalDB.setInfo(1);
                }}>
                <span className={styles.info__button__text}>Got it</span>{' '}
                <Icon name="thumbsUp" fill="#D2B13D" width="18" />
              </button>
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#777',
                  padding: '0px 20px'
                }}>
                Note: The Historical View is experimental and might be disabled
                in the possible future.
              </h3>
            </div>
          </CSSTransition>
        </div>
      ) : null}
    </div>
  );
};

export default Historical;
