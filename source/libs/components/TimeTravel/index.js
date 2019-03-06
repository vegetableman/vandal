import React from 'react';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import tinycolor from 'tinycolor2';
import memoizeOne from 'memoize-one';

import PrevIcon from './prev.svg';
import NextIcon from './next.svg';
import LastIcon from './last.svg';
import FirstIcon from './first.svg';
import ForwardIcon from './forward.svg';
import BackwardIcon from './backward.svg';
import ErrorIcon from './error.svg';
import ReloadIcon from './reload.svg';
import SelectionIcon from './selection.svg';
import CalendarFilter from '../CalendarFilter';
import GraphFilter from '../GraphFilter';
import { Card, withDialog } from '../Common';
import { api, getDateTimeFromTS } from '../../utils';

import './style.css';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
];

const countVersions = sparkline => {
  if (!sparkline) return 0;
  let count = 0;
  for (let n in sparkline)
    count += _.reduce(sparkline[n], (t, e) => {
      return t + e;
    });
  return count;
};

const fetchCalendar = async (url, year) => {
  const [calendarData, err] = await api(
    `https://web.archive.org/__wb/calendarcaptures?url=${encodeURIComponent(
      url
    )}&selected_year=${year}`,
    {
      noCacheReq: true,
      noCacheRes: true
    }
  );

  return [
    err
      ? []
      : _.chain(calendarData)
          .map(month => _.compact(_.flatten(month)))
          .map(m =>
            _.map(m, mx => ({ cnt: mx.cnt ? mx.cnt : 0, ts: mx.ts, st: mx.st }))
          )
          .value(),
    err
  ];
};

const memoizedfetchCalendar = memoizeOne(fetchCalendar, (arg1, arg2) => {
  return (
    arg1 === arg2 ||
    _.replace(arg1, 'https://', 'http://') ===
      _.replace(arg2, 'https://', 'http://')
  );
});
const memoizedDateTimeFromTS = memoizeOne(getDateTimeFromTS);
const memoizedCountVersions = memoizeOne(countVersions);

const getInitialState = props => {
  if (props.selectedTS) {
    return memoizedDateTimeFromTS(props.selectedTS) || {};
  } else if (props.selectedMonth && props.selectedYear) {
    return {
      month: props.selectedMonth,
      year: props.selectedYear
    };
  } else if (props.lastTS) {
    return memoizedDateTimeFromTS(props.lastTS) || {};
  } else {
    return {};
  }
};

class TimeTravel extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay
    } = getInitialState(props);
    this.state = {
      months: null,
      showCard: false,
      card: null,
      showLoader: false,
      selectedYear,
      selectedMonth,
      selectedDay,
      selectedPoint: null,
      selectedMonthIndex: null,
      isOffline: !navigator.onLine
    };
    this.calendarController = new AbortController();
  }

  componentWillReceiveProps(nextProps) {
    if (
      !nextProps.selectedTS &&
      nextProps.lastTS &&
      nextProps.lastTS !== this.props.lastTS
    ) {
      const { year: selectedYear, month: selectedMonth } =
        memoizedDateTimeFromTS(nextProps.lastTS) || {};
      this.setState({
        selectedYear,
        selectedMonth
      });
    } else if (nextProps.selectedTS !== this.props.selectedTS) {
      const { year: selectedYear, month: selectedMonth, day: selectedDay } =
        memoizedDateTimeFromTS(nextProps.selectedTS) || {};
      this.setState({
        selectedYear,
        selectedDay,
        selectedMonth
      });
    }
    if (
      nextProps.isDialogClosed &&
      nextProps.isDialogClosed !== this.props.isDialogClosed
    ) {
      nextProps.onClose();
    }
  }

  getColor = (tsDay, tsMonth, tsYear) => day => {
    const { months, selectedMonth, selectedYear, highlightDay } = this.state;
    const { theme } = this.props;
    const count = _.get(months, `${selectedMonth - 1}.${day - 1}.cnt`);
    if (count) {
      const match =
        tsDay === day && tsMonth === selectedMonth && tsYear === selectedYear;
      const matchColor = theme === 'dark' ? '#ff700b' : '#ff8383';
      const bgColor =
        !match &&
        (theme === 'dark'
          ? tinycolor('#996600')
              .lighten(Math.min(count, 20))
              .toString()
          : tinycolor('#d8f9d4')
              .darken(Math.min(count, 30))
              .toString());
      return {
        backgroundColor: match ? matchColor : bgColor,
        opacity: highlightDay && highlightDay !== day ? 0.5 : 1,
        textDecoration:
          highlightDay && highlightDay === day && !match ? 'underline' : 'none'
      };
    }
    return null;
  };

  handleCalendarChange = date => {
    const dateArr = _.split(date, '-');
    const selectedYear = _.parseInt(_.nth(dateArr, 0));
    const selectedMonth = _.parseInt(_.nth(dateArr, 1));
    this.setState({ selectedYear, selectedMonth });
    this.props.onCalendarChange(selectedMonth, selectedYear);
  };

  async loadCalendar(url, year) {
    const [months, err] = await memoizedfetchCalendar(url, year);
    if (this._isMounted) {
      this.setState({ months, showLoader: false, showCalendarConnErr: err });
    }
    return [months, err];
  }

  handleGraphChange = year => () => {
    this.setState({ showLoader: true, selectedYear: year, months: [] });
    this.loadCalendar(this.props.url, year);
    this.props.onCalendarChange(year, this.state.selectedMonth);
  };

  handleCalendarMove = day => e => {
    if (this.state.highlightDay) return;
    const x = (this.x = e.nativeEvent.offsetX);
    const y = (this.y = e.nativeEvent.offsetY);
    const { offsetLeft, offsetTop } = e.target;
    const { selectedMonth, months, selectedYear } = this.state;
    const date = _.get(months, `[${selectedMonth - 1}][${day - 1}]`);
    const status = _.get(date, 'st', []);
    if (_.get(date, 'cnt')) {
      this.setState({
        showCard: true,
        card: {
          x: offsetLeft + x,
          y: offsetTop + y + 10,
          ts: _.map(_.get(date, 'ts'), (value, i) => {
            return { value, status: status[i] };
          }),
          day,
          monthName: monthNames[Math.max(selectedMonth - 1, 0)],
          year: selectedYear
        }
      });
    }
  };

  handleCalendarDayClick = day => e => {
    const { months, selectedMonth, selectedYear, card } = this.state;
    const count = _.get(months, `${selectedMonth - 1}.${day - 1}.cnt`);
    if (!count) return;
    const date = _.get(months, `[${selectedMonth - 1}][${day - 1}]`);
    const { offsetLeft, offsetTop } = e.target;
    const status = _.get(date, 'st', []);
    this.setState({
      selectedDay: day,
      highlightDay: day,
      card: {
        x: _.get(card, 'day') === day ? _.get(card, 'x') : offsetLeft + this.x,
        y:
          _.get(card, 'day') === day
            ? _.get(card, 'y')
            : offsetTop + this.y + 10,
        ts: _.map(_.get(date, 'ts'), (value, i) => {
          return { value, status: status[i] };
        }),
        day,
        monthName: monthNames[Math.max(selectedMonth - 1, 0)],
        year: selectedYear
      }
    });
  };

  handleGraphDayClick = day => e => {
    const { months, selectedMonth, selectedYear, card } = this.state;
    const count = _.get(months, `${selectedMonth - 1}.${day - 1}.cnt`);
    if (!count) return;
    const date = _.get(months, `[${selectedMonth - 1}][${day - 1}]`);
    const { offsetLeft, offsetTop } = e.target;
    const status = _.get(date, 'st', []);
    this.setState({
      selectedDay: day,
      highlightDay: day,
      card: {
        x: _.get(card, 'day') === day ? _.get(card, 'x') : offsetLeft + this.x,
        y:
          _.get(card, 'day') === day
            ? _.get(card, 'y')
            : offsetTop + this.y + 10,
        ts: _.map(_.get(date, 'ts'), (value, i) => {
          return { value, status: status[i] };
        }),
        day,
        monthName: monthNames[Math.max(selectedMonth - 1, 0)],
        year: selectedYear,
        showTitle: true
      }
    });
  };

  handleCalendarLeave = () => {
    if (this.state.highlightDay) return;
    this.setState({
      showCard: false
    });
  };

  handleCardEnter = (selectedPoint, selectedMonthIndex) => () => {
    this.debouncedGraphLeave.cancel();
    this.setState({ selectedPoint, selectedMonthIndex });
  };

  handleCardLeave = () => {
    this.setState({
      showCard: false,
      selectedMonthIndex: null,
      selectedPoint: null,
      highlightDay: null
    });
  };

  handleGraphLeave = () => {
    this.setState({
      showCard: false
    });
  };

  debouncedGraphLeave = _.debounce(this.handleGraphLeave, 500);

  handleGraphMove = day => e => {
    if (this.state.highlightDay) return;
    const x = (this.x = e.nativeEvent.offsetX);
    const y = (this.y = e.nativeEvent.offsetY);
    const { offsetLeft, offsetTop } = e.target;
    const { selectedMonth, months, selectedYear } = this.state;
    const date = _.get(months, `[${selectedMonth - 1}][${day - 1}]`);
    const status = _.get(date, 'st', []);
    if (_.get(date, 'cnt')) {
      this.setState({
        showCard: true,
        card: {
          x: offsetLeft + x,
          y: offsetTop + y + 10,
          ts: _.map(_.get(date, 'ts'), (value, i) => {
            return { value, status: status[i] };
          }),
          day,
          monthName: monthNames[Math.max(selectedMonth - 1, 0)],
          year: selectedYear,
          showTitle: true
        }
      });
    }
  };

  handleTSClick = (ts, day) => () => {
    this.setState({
      selectedDay: day
    });
    this.props.onSelect(ts);
  };

  handleReload = async () => {
    const { sparkline } = this.props;
    if (!sparkline) {
      this.setState({ manualReload: true });
      await this.props.onRetry(this.props.url, true);
      if (this.reloadTimeout) {
        clearTimeout(this.reloadTimeout);
      }
      this.reloadTimeout = setTimeout(() => {
        this.setState({ manualReload: false });
      }, 250);
      return;
    }
    this.setState({ showLoader: true, manualReload: true });
    await this.loadCalendar(this.props.url, this.state.selectedYear);
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout);
    }
    this.reloadTimeout = setTimeout(() => {
      this.setState({ manualReload: false });
    }, 250);
  };

  componentDidUpdate(prevProps, prevState) {
    const { selectedYear } = this.state;
    if (
      !_.isNil(selectedYear) &&
      (prevState.selectedYear !== selectedYear ||
        prevProps.sparkline !== this.props.sparkline)
    ) {
      this.setState({ showLoader: true, selectedYear });
      this.loadCalendar(this.props.url, selectedYear);
    }
    if (
      this.state.selectedMonthIndex &&
      prevState.selectedMonthIndex !== this.state.selectedMonthIndex
    ) {
      this.debouncedGraphLeave.cancel();
    }
  }

  componentDidMount() {
    const { selectedYear } = this.state;
    if (!_.isNil(selectedYear)) {
      this.setState({ showLoader: true, selectedYear });
      this.loadCalendar(this.props.url, selectedYear);
    }
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    this._isMounted = true;
  }

  componentWillUnmount() {
    this.calendarController.abort();
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
    this._isMounted = false;
  }

  updateOnlineStatus = () => {
    this.setState({
      isOffline: !navigator.onLine
    });
  };

  gotoFirst = () => {
    this.calendarController.abort();
    const { firstTS } = this.props;
    const { year: selectedYear, month: selectedMonth } =
      memoizedDateTimeFromTS(firstTS) || {};
    this.setState({
      selectedMonth,
      selectedYear
    });
    this.props.onSelect(firstTS);
  };

  gotoLast = () => {
    this.calendarController.abort();
    const { lastTS } = this.props;
    const { year: selectedYear, month: selectedMonth, day: selectedDay } =
      memoizedDateTimeFromTS(lastTS) || {};
    this.setState({
      selectedDay,
      selectedMonth,
      selectedYear
    });
    this.props.onSelect(lastTS);
  };

  goToPrev = () => {
    this.calendarController.abort();
    const { sparkline, selectedTS } = this.props;
    const { months, selectedYear, selectedDay, selectedMonth } = this.state;
    const date = _.get(months, `[${selectedMonth - 1}][${selectedDay - 1}]`);
    const tsDtArray = _.get(date, 'ts');
    const tsIndex = _.indexOf(tsDtArray, selectedTS);
    if (tsIndex > 0) {
      return this.props.onSelect(tsDtArray[tsIndex - 1]);
    }
    const tsArray = _.compact(_.flatten(_.map(_.flatten(months), 'ts')));
    const tsPrev = tsArray[_.indexOf(tsArray, selectedTS) - 1];
    if (tsPrev) {
      const { year: nselectedYear, month: nselectedMonth, day: nselectedDay } =
        memoizedDateTimeFromTS(tsPrev) || {};
      this.setState({
        selectedMonth: nselectedMonth,
        selectedYear: nselectedYear,
        selectedDay: nselectedDay
      });
      return this.props.onSelect(tsPrev);
    }

    const findPrevTs = async year => {
      const prevMonthIndex = _.findLastIndex(sparkline[year], m => m > 0);
      if (prevMonthIndex > -1) {
        this.setState({
          showLoader: true,
          selectedYear: year,
          selectedMonth: 12
        });
        const [months, err] = await loadCalendar(this.props.url, year);
        if (err) {
          return;
        }
        const tsArray = _.compact(
          _.flatten(_.map(_.flatten(months[prevMonthIndex]), 'ts'))
        );
        const tsPrev = tsArray[_.size(tsArray) - 1];
        if (tsPrev) {
          const {
            year: nselectedYear,
            month: nselectedMonth,
            day: nselectedDay
          } = memoizedDateTimeFromTS(tsPrev) || {};
          this.setState({
            selectedMonth: nselectedMonth,
            selectedYear: nselectedYear,
            selectedDay: nselectedDay
          });
          return this.props.onSelect(tsPrev);
        }
      }

      findPrevTs(year - 1);
    };

    findPrevTs(selectedYear - 1);
  };

  debouncedPrev = _.debounce(this.goToPrev, 250);

  goToNext = () => {
    this.calendarController.abort();
    const { sparkline, selectedTS } = this.props;
    const { months, selectedYear, selectedDay, selectedMonth } = this.state;
    const date = _.get(months, `[${selectedMonth - 1}][${selectedDay - 1}]`);
    const tsDtArray = _.get(date, 'ts');
    const tsIndex = _.indexOf(tsDtArray, selectedTS);
    if (tsIndex !== _.size(tsDtArray) - 1) {
      return this.props.onSelect(tsDtArray[tsIndex + 1]);
    }

    const tsArray = _.compact(_.flatten(_.map(_.flatten(months), 'ts')));
    const tsNext = tsArray[_.indexOf(tsArray, selectedTS) + 1];
    if (tsNext) {
      const { year: nselectedYear, month: nselectedMonth, day: nselectedDay } =
        memoizedDateTimeFromTS(tsNext) || {};
      this.setState({
        selectedMonth: nselectedMonth,
        selectedYear: nselectedYear,
        selectedDay: nselectedDay
      });
      return this.props.onSelect(tsNext);
    }

    const findNextTs = async year => {
      const nextMonthIndex = _.findIndex(sparkline[year], m => m > 0);
      if (nextMonthIndex > -1) {
        this.setState({
          showLoader: true,
          selectedYear: year,
          selectedMonth: 1
        });
        const [months, err] = await loadCalendar(this.props.url, year);
        if (err) {
          return;
        }
        const tsArray = _.compact(
          _.flatten(_.map(_.flatten(months[nextMonthIndex]), 'ts'))
        );
        const tsNext = tsArray[0];
        if (tsNext) {
          const {
            year: nselectedYear,
            month: nselectedMonth,
            day: nselectedDay
          } = memoizedDateTimeFromTS(tsNext) || {};
          this.setState({
            selectedMonth: nselectedMonth,
            selectedYear: nselectedYear,
            selectedDay: nselectedDay
          });
          return this.props.onSelect(tsNext);
        }
      }

      findNextTs(year + 1);
    };

    findNextTs(selectedYear + 1);
  };

  debouncedNext = _.debounce(this.goToNext, 250);

  handleOptions = () => {};

  handleCalNext = () => {
    const { selectedMonth } = this.state;
    if (selectedMonth === 12) {
      this.setState(prevState => {
        return {
          selectedYear: Math.min(
            new Date().getFullYear(),
            prevState.selectedYear + 1
          ),
          selectedMonth: 1
        };
      });
    } else {
      this.setState(prevState => {
        return { selectedMonth: prevState.selectedMonth + 1 };
      });
    }
  };

  handleCalPrevious = () => {
    const { selectedMonth } = this.state;
    if (selectedMonth === 1) {
      this.setState(prevState => {
        return {
          selectedYear: Math.max(1996, prevState.selectedYear - 1),
          selectedMonth: 12
        };
      });
    } else {
      this.setState(prevState => {
        return { selectedMonth: prevState.selectedMonth - 1 };
      });
    }
  };

  handleDateBackWard = () => {
    this.calendarController.abort();
    const { sparkline, selectedTS } = this.props;
    const { months, selectedDay, selectedMonth, selectedYear } = this.state;

    if (selectedDay === 1 && selectedMonth === 1) {
      // do nothing
    } else {
      const tsArray = _.compact(_.flatten(_.map(_.flatten(months), 'ts')));
      const tsMatch = tsArray[_.indexOf(tsArray, selectedTS) - 1];
      if (tsMatch) {
        const findDay = (d, month) => {
          let tsDayArr;
          if (d) {
            tsDayArr = _.get(months[month - 1][d - 1], 'ts');
          } else {
            month = month - 1;
            d = _.size(months[month - 1]);
            tsDayArr = _.get(months[month - 1][d - 1], 'ts');
          }
          if (!_.isEmpty(tsDayArr)) {
            this.setState({
              selectedDay: d
            });
            this.props.onSelect(_.last(tsDayArr));
            return d;
          } else if (d > 0) {
            findDay(d - 1, month);
          }
        };

        if (selectedDay > 0 && findDay(selectedDay - 1, selectedMonth)) {
          return;
        }

        const { month: nselectedMonth, day: nselectedDay } =
          memoizedDateTimeFromTS(tsMatch) || {};

        this.setState({
          selectedMonth: nselectedMonth,
          selectedDay: nselectedDay
        });

        return this.props.onSelect(tsMatch);
      }
    }

    const findPrevTs = async year => {
      const prevMonthIndex = _.findLastIndex(sparkline[year], m => m > 0);
      if (prevMonthIndex > -1) {
        this.setState({
          showLoader: true,
          selectedYear: year,
          selectedMonth: 12
        });
        const [months, err] = await loadCalendar(this.props.url, year);
        if (err) {
          return;
        }
        const tsArray = _.compact(
          _.flatten(_.map(_.flatten(months[prevMonthIndex]), 'ts'))
        );
        const tsPrev = tsArray[_.size(tsArray) - 1];
        if (tsPrev) {
          const {
            year: nselectedYear,
            month: nselectedMonth,
            day: nselectedDay
          } = memoizedDateTimeFromTS(tsPrev) || {};
          this.setState({
            selectedMonth: nselectedMonth,
            selectedYear: nselectedYear,
            selectedDay: nselectedDay
          });
          return this.props.onSelect(tsPrev);
        }
      }

      findPrevTs(year - 1);
    };

    findPrevTs(selectedYear - 1);
  };

  handleDateForward = () => {
    this.calendarController.abort();
    const { sparkline, selectedTS } = this.props;
    const { months, selectedDay, selectedMonth, selectedYear } = this.state;
    const dayCount = _.size(months[selectedMonth - 1]);

    if (dayCount === selectedDay && selectedMonth === 12) {
      // do nothing
    } else {
      const tsArray = _.compact(_.flatten(_.map(_.flatten(months), 'ts')));
      const tsMatch = tsArray[_.indexOf(tsArray, selectedTS) + 1];
      if (tsMatch) {
        const findDay = (d, month) => {
          let tsDayArr;
          if (d < _.size(months[month - 1])) {
            tsDayArr = _.get(months[month - 1][d - 1], 'ts');
          } else {
            d = 1;
            tsDayArr = _.get(months[month][d - 1], 'ts');
          }
          if (!_.isEmpty(tsDayArr)) {
            this.setState({
              selectedDay: d
            });
            this.props.onSelect(_.last(tsDayArr));
            return d;
          } else if (d <= dayCount) {
            findDay(d + 1, month);
          }
        };

        if (
          selectedDay <= dayCount &&
          findDay(selectedDay + 1, selectedMonth)
        ) {
          return;
        }

        const { month: nselectedMonth, day: nselectedDay } =
          memoizedDateTimeFromTS(tsMatch) || {};

        this.setState({
          selectedMonth: nselectedMonth,
          selectedDay: nselectedDay
        });

        return this.props.onSelect(tsMatch);
      }
    }

    const findNextTs = async year => {
      const nextMonthIndex = _.findIndex(sparkline[year], m => m > 0);
      if (nextMonthIndex > -1) {
        this.setState({
          showLoader: true,
          selectedYear: year,
          selectedMonth: 1
        });
        const [months, err] = await loadCalendar(this.props.url, year);
        if (err) {
          return;
        }
        const tsArray = _.compact(
          _.flatten(_.map(_.flatten(months[nextMonthIndex]), 'ts'))
        );
        const tsNext = tsArray[0];
        if (tsNext) {
          const {
            year: nselectedYear,
            month: nselectedMonth,
            day: nselectedDay
          } = memoizedDateTimeFromTS(tsNext) || {};
          this.setState({
            selectedMonth: nselectedMonth,
            selectedYear: nselectedYear,
            selectedDay: nselectedDay
          });
          return this.props.onSelect(tsNext);
        }
      }

      findNextTs(year + 1);
    };

    findNextTs(selectedYear + 1);
  };

  handleMonthChange = selectedMonth => () => {
    this.setState({
      selectedMonth
    });
    this.props.onCalendarChange(this.state.selectedYear, selectedMonth);
  };

  handleCurrentSelection = () => {
    this.calendarController.abort();
    const { year: selectedYear, month: selectedMonth } =
      memoizedDateTimeFromTS(this.props.selectedTS) || {};
    this.setState({
      selectedMonth,
      selectedYear
    });
  };

  isTSSelected = ts => {
    return (
      ts === this.props.selectedTS ||
      (this.props.redirectTSCollection &&
        ts === this.props.redirectTSCollection[this.props.redirectedTS])
    );
  };

  isTSVisible = () => {
    const { months, selectedMonth, selectedDay } = this.state;
    const date = _.get(months, `[${selectedMonth - 1}][${selectedDay - 1}]`);
    return _.some(_.get(date, 'ts'), ts => this.isTSSelected(ts));
  };

  render() {
    const {
      card,
      showCard,
      showLoader,
      manualReload,
      months,
      selectedYear,
      selectedPoint,
      selectedMonthIndex,
      selectedDay,
      selectedMonth,
      isOffline
    } = this.state;
    const {
      sparkline,
      selectedTS,
      firstTS,
      lastTS,
      selectedTabIndex,
      showSparklineConnErr,
      showCalendarConnErr,
      theme,
      dialogRef
    } = this.props;
    const { day: tsDay, month: tsMonth, year: tsYear } =
      memoizedDateTimeFromTS(selectedTS) || {};
    const versionCount = memoizedCountVersions(sparkline);
    return (
      <div
        className={`vandal-timetravel ${
          selectedTabIndex == 1 ? 'vandal-timetravel--graph' : ''
        }`}
        ref={dialogRef}>
        {!isOffline && (
          <React.Fragment>
            <div
              className="vandal-timetravel-count"
              data-for="vandal-timetravel-count"
              data-tip={versionCount}>
              {versionCount}
            </div>
            <ReactTooltip
              className="vandal-timetravel-info-tooltip"
              id="vandal-timetravel-count"
              effect="solid"
              place="left"
              type={theme}
              delayHide={100}
              delayShow={100}
              getContent={count => (
                <span>
                  <span>This URL was saved </span>
                  <b>{count}</b>
                  <span>
                    {_.parseInt(count) > 1 || _.parseInt(count) === 0
                      ? ' times'
                      : ' time on '}
                  </span>
                  {_.parseInt(count) === 1 && (
                    <div>
                      <b>
                        {_.get(memoizedDateTimeFromTS(lastTS), 'humanizedDate')}
                      </b>
                    </div>
                  )}
                  {_.parseInt(count) > 1 && firstTS && lastTS ? (
                    <div>
                      {' '}
                      between{' '}
                      <b>
                        {_.get(
                          memoizedDateTimeFromTS(firstTS),
                          'humanizedDate'
                        )}
                      </b>{' '}
                      and{' '}
                      <b>
                        {_.get(memoizedDateTimeFromTS(lastTS), 'humanizedDate')}
                      </b>
                    </div>
                  ) : null}
                </span>
              )}
            />
          </React.Fragment>
        )}
        <Tabs
          defaultIndex={selectedTabIndex}
          className="vandal-timetravel__tabs"
          selectedTabClassName="vandal-timetravel__tab--active"
          onSelect={this.props.onTabChange}>
          <TabList className="vandal-timetravel__tab-list">
            <Tab className="vandal-timetravel__tab vandal-timetravel__tab-calendar">
              Calendar
            </Tab>
            <Tab className="vandal-timetravel__tab vandal-timetravel__tab-graph">
              Graph
            </Tab>
          </TabList>

          <TabPanel className="vandal-timetravel__tab-panel">
            <CalendarFilter
              theme={theme}
              selectedDay={selectedDay}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              showConnectionError={showCalendarConnErr || showSparklineConnErr}
              getColor={this.getColor(tsDay, tsMonth, tsYear)}
              onChange={this.handleCalendarChange}
              onMouseMove={this.handleCalendarMove}
              onMouseLeave={this.handleCalendarLeave}
              onClick={this.handleCalendarDayClick}
              showLoader={showLoader}
              goToPrevious={this.handleCalPrevious}
              goToNext={this.handleCalNext}
            />
            {showCard && (
              <Card
                {...card}
                onCardLeave={this.handleCardLeave}
                onTsClick={this.handleTSClick}
                isSelected={this.isTSSelected}
              />
            )}
          </TabPanel>
          <TabPanel>
            <GraphFilter
              theme={theme}
              months={months}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              showConnectionError={showCalendarConnErr || showSparklineConnErr}
              sparkline={sparkline}
              showLoader={showLoader}
              selectedPoint={selectedPoint}
              selectedMonthIndex={selectedMonthIndex}
              onChange={this.handleGraphChange}
              onMouseMove={this.handleGraphMove}
              onMonthChange={this.handleMonthChange}
              onClick={this.handleGraphDayClick}
              onMouseLeave={this.handleCalendarLeave}
              getColor={this.getColor(tsDay, tsMonth, tsYear)}
            />
            {showCard && (
              <Card
                {...card}
                onCardEnter={this.handleCardEnter}
                onCardMove={this.handleCardEnter}
                onCardLeave={this.handleCardLeave}
                onTsClick={this.handleTSClick}
                isSelected={this.isTSSelected}
              />
            )}
          </TabPanel>
        </Tabs>
        {!!(firstTS || lastTS || !sparkline) && (
          <ReloadIcon
            width={15}
            className={cx({
              'vandal-timetravel__reload-icon': true,
              'vandal-timetravel__reload-icon--loading': manualReload
            })}
            onClick={this.handleReload}
            title="reload"
          />
        )}
        {!!selectedTS &&
          !!versionCount &&
          !showLoader &&
          (tsMonth !== selectedMonth || tsYear !== selectedYear) && (
            <SelectionIcon
              width={27.2}
              title="Current Selection"
              onClick={this.handleCurrentSelection}
              className="vandal-timetravel__selection-icon"
            />
          )}
        <div className="vandal-timetravel__footer">
          {isOffline && (
            <ErrorIcon width={18} className="vandal-connection__error-icon" />
          )}
          <div className="vandal-navigate__controls">
            <button
              className="vandal-navigate__btn"
              disabled={!versionCount || !firstTS || selectedTS === firstTS}
              onClick={this.gotoFirst}
              title="First Snapshot">
              <FirstIcon className="vandal-navigate__icon vandal-navigate__first-icon" />
            </button>
            <button
              className="vandal-navigate__btn"
              title="Jump to previous date"
              onClick={this.handleDateBackWard}
              disabled={
                !versionCount ||
                !this.isTSVisible() ||
                !firstTS ||
                !selectedTS ||
                selectedTS === firstTS
              }>
              <BackwardIcon className="vandal-navigate__icon vandal-backward__icon" />
            </button>
            <button
              className="vandal-navigate__btn"
              disabled={
                !versionCount ||
                !selectedTS ||
                selectedTS === firstTS ||
                !this.isTSVisible()
              }
              onClick={this.debouncedPrev}
              title="Previous Snapshot">
              <PrevIcon className="vandal-navigate__icon vandal-prev__icon" />
            </button>
            <button
              className="vandal-navigate__btn"
              disabled={
                !versionCount ||
                !selectedTS ||
                selectedTS === lastTS ||
                !this.isTSVisible()
              }
              onClick={this.debouncedNext}
              title="Next Snapshot">
              <NextIcon className="vandal-navigate__icon vandal-next__icon" />
            </button>
            <button
              className="vandal-navigate__btn"
              title="Jump to next date"
              disabled={
                !versionCount ||
                !lastTS ||
                !selectedTS ||
                selectedTS === lastTS ||
                !this.isTSVisible()
              }
              onClick={this.handleDateForward}>
              <ForwardIcon className="vandal-navigate__icon vandal-forward__icon" />
            </button>
            <button
              className="vandal-navigate__btn"
              disabled={!versionCount || !lastTS || selectedTS === lastTS}
              onClick={this.gotoLast}
              title="Last Snapshot">
              <LastIcon className="vandal-navigate__icon vandal-navigate__last-icon" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  componentDidCatch() {
    console.log('timetravel -- catch error');
  }
}

export default withDialog(TimeTravel, {
  ignoreClickOnClass: '.vandal-url__timetravel-btn'
});
