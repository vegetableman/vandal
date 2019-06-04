import React from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import cx from 'classnames';
import pMapSeries from 'p-map-series';
import MonthView from './monthView';
import ImageLoader from './imageLoader';
import CarouselView from './carouselView';
import {
  api,
  toTwelveHourTime,
  getDateTsFromUrl,
  Screenshooter
} from '../../utils';
import { VerticalMenu } from '../common';
import './style.css';

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

export default class Historical extends React.Component {
  state = {
    archiveUrls: [],
    isViewResized: false,
    selectedYear: null,
    showCarousel: null,
    showMonthPanel: false,
    selectedIndex: 0,
    snapshots: [],
    years: _.keys(this.props.sparkline)
  };

  screeshooter = new Screenshooter();
  archiveController = new AbortController();
  containerRef = React.createRef();

  handleOptions = (index, year, url) => async option => {
    if (option === 'retry') {
      const { snapshots, archiveUrls } = this.state;
      snapshots[index] = null;

      //reset
      this.setState({
        snapshots: [...snapshots]
      });

      this.retryController = new AbortController();

      let archiveUrl = archiveUrls[index];
      let [result, archiveErr] = await api(
        `https://archive.org/wayback/available?url=${
          this.props.url
        }&timestamp=${year}12`,
        {
          controller: this.retryController,
          noCacheReq: true
        }
      );

      //return if failure
      if (archiveErr) {
        snapshots[index] = { data: null, err: archiveErr };
        this.setSafeState({
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
      this.setSafeState({
        snapshots: [...snapshots],
        archiveUrls: [...archiveUrls]
      });
    } else if (option === 'showMonths') {
      this.setState({
        selectedYear: this.state.years[index],
        showMonthPanel: true
      });
    } else if (option === 'openInNewTab') {
      window.open(url, '_blank');
    } else if (option === 'openInVandal') {
      this.props.openURL(url);
    }
  };

  handleEntered = () => {
    // delay the resize
    setTimeout(() => {
      this.setState({ isViewResized: true });
    }, 10);
  };

  handleExited = () => {
    this.setState({ isViewResized: false });
  };

  handleClose = () => {
    this.setState({ showMonthPanel: false, selectedYear: null });
  };

  getSnapshot = index => {
    return this.state.snapshots[index];
  };

  handleYearCarousel = selectedIndex => () => {
    this.setState({
      images: _.map(this.state.years, (__, index) => {
        return _.get(this.state.snapshots[index], 'data');
      }),
      selectedIndex,
      showCarousel: 'year'
    });
  };

  handleMonthCarousel = (selectedIndex, snapshots) => () => {
    this.setState({
      images: _.map(snapshots, 'data'),
      selectedIndex,
      showCarousel: 'month'
    });
  };

  handleCarouselClose = () => {
    this.setState({
      showCarousel: null
    });
    if (this.containerRef) {
      this.containerRef.current.focus();
    }
  };

  getCaption = index => {
    if (this.state.showCarousel === 'month') {
      return { title: this.state.selectedYear, date: monthNames[index] };
    }
    return { title: 'YEAR', date: this.state.years[index] };
  };

  abort = () => {
    this.screeshooter.abort();
    this.archiveController.abort();
    this.retryController && this.retryController.abort();
  };

  handleKeydown = e => {
    if (e.keyCode === 27) {
      this.props.onClose();
    }
  };

  render() {
    const {
      images,
      isViewResized,
      selectedYear,
      showMonthPanel,
      showCarousel,
      selectedIndex,
      archiveUrls,
      snapshots,
      years
    } = this.state;

    const { theme } = this.props;

    return (
      <div
        className="vandal-historical-view"
        onKeyDown={this.handleKeydown}
        ref={this.containerRef}
        tabIndex="0">
        <div
          className={cx({
            'vandal-historical-year-container': true,
            'vandal-historical-year-container--month-view': isViewResized
          })}>
          {_.map(years, (year, index) => {
            const url = archiveUrls[index];
            const dateObj = getDateTsFromUrl(archiveUrls[index]);
            const snapshot = snapshots[index];
            return (
              <div
                className={cx({
                  'vandal-historical-year': true,
                  'vandal-historical-year--selected': selectedYear === year
                })}
                key={year}>
                <div
                  className="vandal-historical-year__body"
                  onClick={this.handleYearCarousel(index)}>
                  {snapshot ? (
                    <React.Fragment>
                      {(_.get(snapshot, 'err') && (
                        <Icon
                          name="error"
                          className="vandal-historical-year__err"
                          title={_.get(snapshot, 'err')}
                        />
                      )) || (
                        <img
                          className="vandal-historical-year__snapshot"
                          src={_.get(snapshot, 'data')}
                        />
                      )}
                      <div className="vandal-historical-year__body__highlight" />
                      {dateObj && (
                        <div
                          className="vandal-historical-year__info"
                          data-for={`vandal-historical-year--info-${year}`}
                          data-tip={`Captured on ${
                            dateObj.date
                          }, ${toTwelveHourTime(dateObj.time)}`}>
                          i
                        </div>
                      )}
                      <ReactTooltip
                        className="vandal-historical-year--info-tooltip"
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
                <div className="vandal-historical-year__footer">
                  <div className="vandal-historical-year__value">{year}</div>
                  <VerticalMenu
                    options={options}
                    onSelect={this.handleOptions(index, year, url)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {showMonthPanel && (
          <MonthView
            url={this.props.url}
            year={selectedYear}
            show={showMonthPanel}
            onEntered={this.handleEntered}
            onExited={this.handleExited}
            onClose={this.handleClose}
            openMonth={this.handleMonthCarousel}
            theme={theme}
            openURL={this.props.openURL}
          />
        )}
        {showCarousel && (
          <CarouselView
            images={images}
            selectedIndex={selectedIndex}
            getCaption={this.getCaption}
            onClose={this.handleCarouselClose}
          />
        )}
      </div>
    );
  }

  async componentDidMount() {
    this._isMounted = true;
    document.body.style.overflow = 'hidden';
    if (this.containerRef) {
      this.containerRef.current.focus();
    }
    await this.loadSnapshots(this.props);
  }

  setSafeState = args => {
    if (!this._isMounted) return;
    this.setState(args);
  };

  componentWillUnmount() {
    this._isMounted = false;
    this.abort();
    document.body.style.overflow = '';
  }

  async loadSnapshots(props) {
    const years = _.keys(props.sparkline);
    if (_.isEmpty(years)) return;

    const { url } = this.props;

    // Map serially, as archive times out if done concurrently
    const timestampUrls = _.map(
      years,
      y => `https://archive.org/wayback/available?url=${url}&timestamp=${y}12`
    );

    const timestampUrlCount = _.size(timestampUrls);
    const yearMapper = async (item, index) => {
      let [result] = await api(item, {
        controller: this.archiveController,
        noCacheReq: false, //timestampUrlCount - 1 === index,
        noCacheRes: false //timestampUrlCount - 1 === index
      });
      return result;
    };
    const timestampResult = await pMapSeries(timestampUrls, yearMapper);

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

    this.setSafeState({ archiveUrls });

    const urlCount = _.size(archiveUrls);
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

      const isLast = false; // urlCount - 1 === index;
      const [data, err] = await this.screeshooter.fetchScreenshot(url, {
        noCacheReq: isLast,
        noCacheRes: isLast,
        latest: isLast
      });

      this.setSafeState({
        snapshots: [...this.state.snapshots, { data, err }]
      });

      return;
    };

    await pMapSeries(archiveUrls, snapshotMapper);
  }
}
