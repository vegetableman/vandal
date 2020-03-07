import React, { useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
// import ReactTooltip from 'react-tooltip';
import cx from 'classnames';
import _ from 'lodash';
import Transition from 'react-transition-group/Transition';
import ImageLoader from '../loader';
import { VerticalMenu, Icon } from '../../common';
import {
  toTwelveHourTime,
  getDateTsFromURL,
  smoothScrollX
} from '../../../utils';
import monthMachine, {
  memoizedGetMonths,
  fetchSnapshot
} from './month.machine.js';
import { useTheme } from '../../../hooks';
import styles from './month.module.css';

const ENTER_DURATION = 200;
const PANEL_HEIGHT = 210;
const options = [
  {
    value: 'openInVandal',
    text: 'Open in Vandal'
  },
  {
    value: 'openinNewTab',
    text: 'Open in New Tab'
  },
  {
    value: 'retry',
    text: 'Retry'
  }
];

const transitionStates = {
  entering: {
    transform: `translateY(${PANEL_HEIGHT}px)`
  },
  entered: {
    transform: 'translateY(0)'
  },
  exiting: {
    transform: 'translateY(0)'
  },
  exited: {
    transform: `translateY(${PANEL_HEIGHT}px)`
  }
};

const transitionStyle = {
  transition: `all ${ENTER_DURATION}ms ease-in-out`,
  transitionProperty: 'transform',
  willChange: 'transform',
  height: `${PANEL_HEIGHT}px`,
  transform: 'translateY(0)'
};

let isMounted = false;

const MonthView = props => {
  const [showRightPaddle, toggleRightPaddle] = useState(true);
  const [showLeftPaddle, toggleLeftPaddle] = useState(false);
  const [showPanel, toggleShowPanel] = useState(props.show);
  const { theme } = useTheme();

  const [state, send] = useMachine(
    monthMachine.withConfig(
      {},
      {
        url: props.url,
        year: props.year,
        months: memoizedGetMonths(props.year),
        snapshots: [],
        archiveURLs: []
      }
    )
  );
  const { context: ctx } = state;
  const monthScrollRef = React.useRef(null);

  const onEntered = () => {
    setTimeout(() => {}, 250);
    onDebouncedEntered();
  };
  const onExited = () => {
    send('CLEAR_ARCHIVE_URLS');
    send('CLEAR_SNAPSHOTS');
    props.onExited();
    props.onClose();
  };
  const onDebouncedEntered = _.debounce(props.onEntered, 250);
  const onDebouncedExited = _.debounce(onExited, 250);

  const onOptionSelect = (index, archiveURL) => async option => {
    if (option === 'retry') {
      send('SET_SNAPSHOT', { payload: { index, value: null } });
      const [snapshot, newArchiveURL] = await fetchSnapshot({
        url: props.url,
        index,
        year: props.year,
        archiveURL
      });

      if (newArchiveURL) {
        send('SET_ARCHIVE_URL', { payload: { index, value: newArchiveURL } });
      }
      const [data, err] = snapshot;
      send('SET_SNAPSHOT', { payload: { index, value: { data, err } } });
    } else if (option === 'openinNewTab') {
      window.open(url, '_blank');
    } else if (option === 'openInVandal') {
      props.openURL(url);
    }
  };

  useEffect(() => {
    if (props.show) {
      send('CLEAR_SNAPSHOTS');
      send('LOAD_ARCHIVE_URLS', { payload: { year: props.year } });
    }
  }, [props.year]);

  useEffect(() => {
    if (!monthScrollRef) return;

    const { current: monthScrollView } = monthScrollRef;
    monthScrollView.addEventListener('mousewheel', onMouseWheel, {
      passive: false,
      capture: true
    });

    if (monthScrollView.scrollWidth === monthScrollView.offsetWidth) {
      toggleRightPaddle(false);
    }
  }, []);

  const onScroll = () => {
    const { current: monthScrollView } = monthScrollRef;
    const { scrollLeft, scrollWidth, offsetWidth } = monthScrollView;
    // Leftmost scroll
    if (scrollLeft === 0) {
      toggleRightPaddle(true);
      toggleLeftPaddle(false);
    }
    // Rightmost scroll
    else if (scrollLeft === scrollWidth - offsetWidth) {
      toggleRightPaddle(false);
      toggleLeftPaddle(true);
    }
    // Show all
    else if (!showLeftPaddle || !showRightPaddle) {
      toggleLeftPaddle(true);
      toggleRightPaddle(true);
    }
  };

  const onMouseWheel = e => {
    const { current: monthScrollView } = monthScrollRef;
    e.stopPropagation();
    const max = monthScrollView.scrollWidth - monthScrollView.offsetWidth; // this might change if you have dynamic content, perhaps some mutation observer will be useful here
    if (
      monthScrollView.scrollLeft + e.deltaX < 0 ||
      monthScrollView.scrollLeft + e.deltaX > max
    ) {
      e.preventDefault();
      monthScrollView.scrollLeft = Math.max(
        0,
        Math.min(max, monthScrollView.scrollLeft + e.deltaX)
      );
    }
    return false;
  };

  // Smooth scroll to left
  const onLeftPaddleClick = () => {
    const { current: monthScrollView } = monthScrollRef;
    smoothScrollX(monthScrollView, 0);
  };

  // Smooth scroll to right
  const onRightPaddleClick = () => {
    const { current: monthScrollView } = monthScrollRef;
    smoothScrollX(
      monthScrollView,
      monthScrollView.scrollWidth - monthScrollView.offsetWidth
    );
  };

  console.log('month snapshots:', ctx.snapshots);

  return (
    <Transition
      enter
      appear
      in={showPanel}
      timeout={{ enter: ENTER_DURATION, exit: 0 }}
      onEntered={onEntered}
      onExited={onDebouncedExited}>
      {state => (
        <div
          className={styles.container}
          style={{
            ...transitionStyle,
            ...transitionStates[state]
          }}>
          <div
            className={styles.close__container}
            onClick={() => {
              toggleShowPanel(false);
            }}>
            <div className={styles.arrow__down} />
          </div>
          <div
            className={styles.scroll__view}
            onScroll={onScroll}
            ref={monthScrollRef}>
            {_.map(ctx.months, (month, index) => {
              const archiveURL = ctx.archiveURLs[index];
              const dateObj = getDateTsFromURL(archiveURL);
              const snapshot = ctx.snapshots[index];
              return (
                <div className={styles.month} key={`${props.year}-${month}`}>
                  <div
                    className={styles.body}
                    onClick={props.openMonth(index, ctx.snapshots)}>
                    {snapshot ? (
                      <React.Fragment>
                        {(_.get(snapshot, 'err') && (
                          <Icon
                            name="error"
                            className={styles.month__err}
                            title={_.get(snapshot, 'err')}
                          />
                        )) || (
                          <img
                            className={styles.month__snapshot}
                            src={_.get(snapshot, 'data')}
                          />
                        )}
                        {dateObj && (
                          <div
                            className={styles.month__info}
                            data-for={`vandal-historical-month--info-${month}`}
                            data-tip={`${dateObj.date}, ${toTwelveHourTime(
                              dateObj.time
                            )}`}>
                            i
                          </div>
                        )}
                        {/* <ReactTooltip
                          scrollHide
                          className={styles.month__info__tooltip}
                          id={`vandal-historical-month--info-${month}`}
                          effect="solid"
                          insecure={false}
                          outsidePlace="left"
                          place="right"
                          type={theme}
                        /> */}
                      </React.Fragment>
                    ) : (
                      <ImageLoader theme={theme} />
                    )}
                  </div>
                  <div className={styles.month__footer}>
                    <div className={styles.month__value}>{month}</div>
                    <VerticalMenu
                      iconClass={styles.menu__icon}
                      listClass={styles.list}
                      options={options}
                      onSelect={onOptionSelect(index, archiveURL)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.month__btn__container}>
            {showLeftPaddle && (
              <button
                className={cx({
                  [styles.month__btn]: true,
                  [styles.month__left__btn]: true
                })}
                onClick={onLeftPaddleClick}>
                <Icon name="leftPaddle" className={styles.month__nav__icon} />
              </button>
            )}
            {showRightPaddle && (
              <button
                className={cx({
                  [styles.month__btn]: true,
                  [styles.month__right__btn]: true
                })}
                onClick={onRightPaddleClick}>
                <Icon name="rightPaddle" className={styles.month__nav__icon} />
              </button>
            )}
          </div>
        </div>
      )}
    </Transition>
  );
};

export default MonthView;
