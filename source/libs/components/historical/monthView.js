import React from 'react';
import ReactTooltip from 'react-tooltip';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Transition from 'react-transition-group/Transition';
import pMapSeries from 'p-map-series';
import ImageLoader from './imageLoader';
import { VerticalMenu } from '../common';
import {
  api,
  toTwelveHourTime,
  getDateTsFromUrl,
  smoothScrollX,
  Screenshooter
} from '../../utils';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const getMonths = selectedYear => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  let months = monthNames;
  if (currentYear === +selectedYear) {
    months = monthNames.slice(0, currentMonth + 1);
  }
  return months;
};

const memoizedGetMonths = memoizeOne(getMonths);

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

export default class MonthView extends React.Component {
  state = {
    show: this.props.show,
    isEntered: false,
    snapshots: [],
    archiveUrls: [],
    showLeftPaddle: false,
    showRightPaddle: true
  };

  monthScrollRef = React.createRef();

  screeshooter = new Screenshooter();

  archiveController = new AbortController();

  setSafeState = args => {
    if (!this._isMounted) return;
    this.setState(args);
  };

  handleExit = () => {
    this.screeshooter.abort();
    this.archiveController.abort();
    this.retryController && this.retryController.abort();
    this.setState({ snapshots: [], archiveUrls: [] });
    this.props.onExited();
    this.props.onClose();
  };

  onDebouncedEntered = _.debounce(this.props.onEntered, 250);
  onDebouncedExited = _.debounce(this.handleExit, 250);

  handleMouseWheel = e => {
    const { current: monthScrollView } = this.monthScrollRef;
    e.stopPropagation();
    var max = monthScrollView.scrollWidth - monthScrollView.offsetWidth; // this might change if you have dynamic content, perhaps some mutation observer will be useful here
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

  handleOptions = (index, url) => async option => {
    if (option === 'retry') {
      const { snapshots, archiveUrls } = this.state;
      snapshots[index] = null;
      this.setState({
        snapshots: [...snapshots]
      });

      this.retryController = new AbortController();

      let archiveUrl = archiveUrls[index];

      let [result, archiveErr] = await api(
        `https://archive.org/wayback/available?url=${
          this.props.url
        }&timestamp=${this.props.year}${_.padStart(
          _.toString(index + 1),
          2,
          0
        )}`,
        {
          controller: this.retryController,
          noCacheReq: true
        }
      );

      //return if failure
      if (archiveErr) {
        snapshots[index] = { data: null, err: archiveErr };
        this.setState({
          snapshots: [...snapshots],
          archiveUrls: [...archiveUrls]
        });
        return;
      }

      const closestURL = _.get(result, 'archived_snapshots.closest.url');
      if (closestURL) {
        archiveUrl = _.replace(
          _.replace(closestURL, /\d+/, '$&im_'),
          /https?/,
          'https'
        );
      }

      const [data, err] = await this.screeshooter.fetchScreenshot(archiveUrl, {
        noCacheReq: true,
        latest: true
      });

      snapshots[index] = { data, err };
      archiveUrls[index] = archiveUrl;

      this.setState({
        snapshots: [...snapshots],
        archiveUrls
      });
    } else if (option === 'openinNewTab') {
      window.open(url, '_blank');
    } else if (option === 'openInVandal') {
      this.props.openURL(url);
    }
  };

  async componentDidMount() {
    this._isMounted = true;
    if (!this.monthScrollRef) return;
    const { current: monthScrollView } = this.monthScrollRef;
    monthScrollView.addEventListener('mousewheel', this.handleMouseWheel, {
      passive: false,
      capture: true
    });
    if (monthScrollView.scrollWidth === monthScrollView.offsetWidth) {
      this.setState({ showRightPaddle: false });
    }
    setTimeout(() => {
      this.loadSnapshots(this.props);
    }, 2000);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.year &&
      nextProps.show &&
      nextProps.year !== this.props.year
    ) {
      this.setState({ snapshots: [] });
      this.loadSnapshots(nextProps);
    }
  }

  async loadSnapshots(props) {
    const { year, url } = props;
    const selectedYear = +year;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const months = memoizedGetMonths(selectedYear);

    // Map serially, as archive times out if done concurrently
    const timestampUrls = _.map(months, (__, index) => {
      return `https://archive.org/wayback/available?url=${url}&timestamp=${year}${_.padStart(
        _.toString(index + 1),
        2,
        0
      )}`;
    });

    const isCurrentYearSelected = currentYear === selectedYear;
    const monthMapper = async (url, index) => {
      const [result] = await api(url, {
        controller: this.archiveController,
        noCacheReq: isCurrentYearSelected && index === currentMonth,
        noCacheRes: isCurrentYearSelected && index === currentMonth
      });
      return result;
    };
    const timestampResult = await pMapSeries(timestampUrls, monthMapper);

    const archiveUrls = _.map(timestampResult, result =>
      _.replace(
        _.replace(
          _.get(result, 'archived_snapshots.closest.url'),
          /\d+/,
          '$&im_'
        ),
        /https?/,
        'https'
      )
    );

    console.log('archiveUrls: ', archiveUrls);

    this.setSafeState({
      archiveUrls
    });

    const snapshotMapper = async (url, index) => {
      if (!this._isMounted) return;
      if (!url) {
        this.setSafeState({
          snapshots: [
            ...this.state.snapshots,
            { data: null, err: 'Error fetching Archive URL' }
          ]
        });
        return;
      }
      const [data, err] = await this.screeshooter.fetchScreenshot(url, {
        noCacheReq: isCurrentYearSelected && index === currentMonth,
        noCacheRes: isCurrentYearSelected && index === currentMonth,
        latest: isCurrentYearSelected && index === currentMonth
      });

      this.setSafeState({
        snapshots: [...this.state.snapshots, { data, err }]
      });
      return;
    };

    await pMapSeries(archiveUrls, snapshotMapper);
  }

  handleScroll = e => {
    const { showLeftPaddle, showRightPaddle } = this.state;
    const { current: monthScrollView } = this.monthScrollRef;
    const { scrollLeft, scrollWidth, offsetWidth } = monthScrollView;
    if (scrollLeft === 0) {
      this.setState({ showLeftPaddle: false, showRightPaddle: true });
    } else if (scrollLeft === scrollWidth - offsetWidth) {
      this.setState({ showRightPaddle: false, showLeftPaddle: true });
    } else if (!showLeftPaddle || !showRightPaddle) {
      this.setState({ showLeftPaddle: true, showRightPaddle: true });
    }
  };

  handleLeftPaddleClick = () => {
    const { current: monthScrollView } = this.monthScrollRef;
    smoothScrollX(monthScrollView, 0);
  };

  handleRightPaddleClick = () => {
    const { current: monthScrollView } = this.monthScrollRef;
    smoothScrollX(
      monthScrollView,
      monthScrollView.scrollWidth - monthScrollView.offsetWidth
    );
  };

  handleClose = () => {
    this.setState({ show: false });
  };

  handleEntered = () => {
    setTimeout(() => {
      this.setState({
        isEntered: true
      });
    }, 250);
    this.onDebouncedEntered();
  };

  render() {
    const {
      archiveUrls,
      showLeftPaddle,
      showRightPaddle,
      snapshots,
      show,
      isEntered
    } = this.state;

    let months = [];
    if (isEntered) months = memoizedGetMonths(this.props.year);

    return (
      <Transition
        enter
        appear
        in={show}
        timeout={{ enter: ENTER_DURATION, exit: 0 }}
        onEntered={this.handleEntered}
        onExited={this.onDebouncedExited}>
        {state => (
          <div
            className="vandal-historical-month-view"
            style={{
              ...transitionStyle,
              ...transitionStates[state]
            }}>
            <div
              className="vandal-historical-month-close-container"
              onClick={this.handleClose}>
              <div className="vandal-arrow-down" />
            </div>
            <div
              className="vandal-historical-month-scroll-view"
              onScroll={this.handleScroll}
              ref={this.monthScrollRef}>
              {_.map(months, (month, index) => {
                const url = archiveUrls[index];
                const dateObj = getDateTsFromUrl(archiveUrls[index]);
                const snapshot = snapshots[index];
                return (
                  <div
                    className="vandal-historical-month"
                    key={`${this.props.year}-${month}`}>
                    <div
                      className="vandal-historical-month__body"
                      onClick={this.props.openMonth(index, snapshots)}>
                      {snapshot ? (
                        <React.Fragment>
                          {(_.get(snapshot, 'err') && (
                            <Icon
                              name="error"
                              className="vandal-historical-month__err"
                              title={_.get(snapshot, 'err')}
                            />
                          )) || (
                            <img
                              className="vandal-historical-month__snapshot"
                              src={_.get(snapshot, 'data')}
                            />
                          )}
                          {dateObj && (
                            <div
                              className="vandal-historical-month__info"
                              data-for={`vandal-historical-month--info-${month}`}
                              data-tip={`Captured on ${
                                dateObj.date
                              }, ${toTwelveHourTime(dateObj.time)}`}>
                              i
                            </div>
                          )}
                          <ReactTooltip
                            scrollHide
                            className="vandal-historical-month--info-tooltip"
                            id={`vandal-historical-month--info-${month}`}
                            effect="solid"
                            insecure={false}
                            outsidePlace="left"
                            place="right"
                            type={this.props.theme}
                          />
                        </React.Fragment>
                      ) : (
                        <ImageLoader theme={this.props.theme} />
                      )}
                    </div>
                    <div className="vandal-historical-month__footer">
                      <div className="vandal-historical-month__value">
                        {month}
                      </div>
                      <VerticalMenu
                        options={options}
                        onSelect={this.handleOptions(index, url)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="vandal-historical-month-btn-container">
              {showLeftPaddle && (
                <button
                  className="vandal-historical-month__btn vandal-historical-month__left-btn"
                  onClick={this.handleLeftPaddleClick}>
                  <Icon
                    name="leftPaddle"
                    className="vandal-historical-month__nav-icon"
                  />
                </button>
              )}
              {showRightPaddle && (
                <button
                  className="vandal-historical-month__btn vandal-historical-month__right-btn"
                  onClick={this.handleRightPaddleClick}>
                  <Icon
                    name="rightPaddle"
                    className="vandal-historical-month__nav-icon"
                  />
                </button>
              )}
            </div>
          </div>
        )}
      </Transition>
    );
  }
}
