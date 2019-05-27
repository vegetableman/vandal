import React from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import cx from 'classnames';
import { api, getDateTimeFromTS, toTwelveHourTime } from '../../utils';
import { Card } from '../Common';
import ImageLoader from './ImageLoader';
import tinycolor from 'tinycolor2';
import Calendar from './Calendar';
import CalendarLoader from './CalendarLoader';
import EditIcon from './edit.svg';
import DeleteIcon from './delete.svg';
import CloseIcon from './close.svg';

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

export default class DiffItem extends React.Component {
  state = {
    editMode: this.props.editMode,
    selectedTS: null,
    selectedDay: null,
    date: '',
    showCard: false,
    card: null
  };

  currentDate = new Date();

  handleCalendarChange = e => {
    const { value: date } = e.target;
    const dateArr = _.split(date, '-');
    const selectedYear = _.parseInt(_.nth(dateArr, 0));
    const selectedMonth = _.parseInt(_.nth(dateArr, 1));
    this.setState({
      date: `${selectedYear}-${_.padStart(selectedMonth, 2, '0')}`,
      selectedMonth,
      selectedYear,
      selectedDay: null
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      !_.isNil(this.state.selectedYear) &&
      prevState.selectedYear !== this.state.selectedYear
    ) {
      this.getCalendar(this.props.url, this.state.selectedYear);
    }
  }

  getCalendar = async (url, year) => {
    this.setState({ showLoader: true, selectedYear: year });
    const calendarData = await api(
      `https://web.archive.org/__wb/calendarcaptures?url=${url}&selected_year=${year}`,
      {
        noCacheReq: true,
        noCacheRes: true
      }
    );
    const months = _.map(calendarData, month =>
      _.flatten(month).filter(Boolean)
    ).map((m, i) =>
      _.map(m, mx => ({ cnt: mx.cnt ? mx.cnt : 0, ts: mx.ts, st: mx.st }))
    );

    this.setState({ months, showLoader: false, error: null });
  };

  getColor = day => {
    const { months, selectedMonth } = this.state;
    const count = _.get(months, `${selectedMonth - 1}.${day - 1}.cnt`);
    if (count) {
      return {
        backgroundColor: tinycolor('#36D3AE')
          .darken(Math.min(count, 30))
          .toString()
      };
    }
    return null;
  };

  handleCalendarDayClick = day => e => {
    const { months, selectedMonth, selectedYear, card } = this.state;
    const count = _.get(months, `${selectedMonth - 1}.${day - 1}.cnt`);
    if (!count) return;
    const date = _.get(months, `[${selectedMonth - 1}][${day - 1}]`);
    const status = _.get(date, 'st');
    const { offsetLeft, offsetTop } = e.target;
    this.setState({
      selectedDay: day,
      showCard: true,
      card: {
        x: _.get(card, 'day') === day ? _.get(card, 'x') : offsetLeft + this.x,
        y:
          _.get(card, 'day') === day
            ? _.get(card, 'y')
            : offsetTop + this.y + 10,
        ts: _.filter(_.get(date, 'ts'), (__, index) => {
          return status[index] === 200;
        }),
        day,
        monthName: monthNames[Math.max(selectedMonth - 1, 0)],
        year: selectedYear
      }
    });
  };

  handleCardLeave = () => {
    this.setState({
      showCard: false,
      selectedMonthIndex: null,
      selectedPoint: null,
      selectedDay: null
    });
  };

  handleCalendarLeave = () => {
    if (this.state.selectedDay) return;
    this.setState({
      showCard: false
    });
  };

  handleTSClick = (ts, noCache) => async () => {
    this.setState({
      error: null,
      snapshot: null,
      selectedTS: ts,
      selectedDay: null,
      showCard: false,
      editMode: false
    });
    this.snapshotController = new AbortController();
    await api(
      !ts
        ? `https://zzgi3cdqi7.execute-api.us-east-2.amazonaws.com/dev/screenshot?url=${
            this.props.url
          }`
        : `https://zzgi3cdqi7.execute-api.us-east-2.amazonaws.com/dev/screenshot?url=http://web.archive.org/web/${ts}im_/${
            this.props.url
          }`,
      {
        controller: this.snapshotController,
        noCacheReq: noCache,
        noCacheRes: noCache
      }
    )
      .then(async snapshotPath => {
        const encodedSnapShot = encodeURIComponent(snapshotPath);
        const snapshot = await api(
          `https://d1smdru0lrhqpr.cloudfront.net/${encodedSnapShot}`
        );
        this.setState({ snapshot }, () => {
          this.props.onSnapshot(this.props.index, this.state.snapshot, ts);
        });
      })
      .catch(() => {
        this.setState({ error: true });
      });
  };

  toggleEdit = () => {
    // this.snapshotController.abort();
    this.setState(prevState => {
      return { editMode: !prevState.editMode, showCard: false };
    });
  };

  handleCalendarMove = day => e => {
    const x = (this.x = e.nativeEvent.offsetX);
    const y = (this.y = e.nativeEvent.offsetY);
    if (this.state.selectedDay) return;
    const { offsetLeft, offsetTop } = e.target;
    const { selectedMonth, months, selectedYear } = this.state;
    const date = _.get(months, `[${selectedMonth - 1}][${day - 1}]`);
    const status = _.get(date, 'st');
    if (_.get(date, 'cnt')) {
      this.setState({
        showCard: true,
        card: {
          x: offsetLeft + x,
          y: offsetTop + y + 10,
          ts: _.filter(_.get(date, 'ts'), (__, index) => {
            return status[index] === 200;
          }),
          day,
          monthName: monthNames[Math.max(selectedMonth - 1, 0)],
          year: selectedYear
        }
      });
    }
  };

  debouncedCalendarChange = _.debounce(this.handleCalendarChange, 250);

  async componentDidMount() {
    // this.snapshotController = new AbortController();
    // const { index } = this.props;
    // if (!index) {
    //   await api(
    //     `https://zzgi3cdqi7.execute-api.us-east-2.amazonaws.com/dev/screenshot?url=${
    //       this.props.url
    //     }`,
    //     {
    //       controller: this.snapshotController,
    //       noCacheReq: true,
    //       noCacheRes: true
    //     }
    //   )
    //     .then(async snapshotPath => {
    //       const encodedSnapShot = encodeURIComponent(snapshotPath);
    //       const snapshot = await api(
    //         `https://d1smdru0lrhqpr.cloudfront.net/${encodedSnapShot}`,
    //         {
    //           controller: this.snapshotController,
    //           noCacheReq: true,
    //           noCacheRes: true
    //         }
    //       );
    //       this.setState({
    //         error: null,
    //         snapshot
    //       });
    //       this.props.onSnapshot(index, snapshot, 'current');
    //     })
    //     .catch(() => {
    //       this.setState({ error: true });
    //     });
    // }
  }

  componentWillUnmount() {
    // this.snapshotController.abort();
  }

  render() {
    const { index, id } = this.props;
    const {
      date,
      selectedDay,
      showCard,
      card,
      editMode,
      snapshot,
      selectedTS,
      showLoader,
      error
    } = this.state;
    const dateObj = selectedTS ? getDateTimeFromTS(selectedTS) : {};

    return (
      <div className="vandal-diff-item" onMouseLeave={this.handleDiffLeave}>
        <div className="vandal-diff-item__body">
          {!editMode && (
            <div className="vandal-diff-item__snapshot-container">
              <React.Fragment>
                {snapshot ? (
                  <img className="vandal-diff-item__snapshot" src={snapshot} />
                ) : (
                  (error && (
                    <div className="vandal-diff-item__empty">
                      <span>Error fetching screenshot</span>
                    </div>
                  )) ||
                  ((selectedDay || selectedTS || index === 0) && (
                    <ImageLoader style={{ marginTop: '-25px' }} />
                  )) || (
                    <div className="vandal-diff-item__empty">
                      No Screenshot Selected
                    </div>
                  )
                )}
                <div
                  className={cx({
                    'vandal-diff-item__highlight': true,
                    'vandal-diff-item__highlight--ts': selectedTS || index === 0
                  })}>
                  <div className="vandal-diff-item__highlight-controls">
                    <EditIcon
                      className="vandal-diff__edit-icon"
                      data-for={`vandal-diff__edit-${index}`}
                      data-tip="Edit"
                      data-offset="{'top': 2, 'left': 0}"
                      onClick={this.toggleEdit}
                    />
                    <DeleteIcon
                      className="vandal-diff__delete-icon"
                      data-for={`vandal-diff__delete-${index}`}
                      data-tip="Delete"
                      onClick={this.props.onDelete(id)}
                    />
                  </div>
                  {error && (
                    <button
                      className="vandal-diff-item__retry-btn"
                      onClick={this.handleTSClick(selectedTS, true)}>
                      Retry
                    </button>
                  )}
                </div>
                <ReactTooltip
                  className="vandal-diff-tooltip"
                  id={`vandal-diff__edit-${index}`}
                  effect="solid"
                  place="bottom"
                  insecure={false}
                />
                <ReactTooltip
                  className="vandal-diff-tooltip"
                  id={`vandal-diff__delete-${index}`}
                  effect="solid"
                  place="bottom"
                  insecure={false}
                />
              </React.Fragment>
              {/* {index === 0 && (
                <div className={'vandal-diff-item__footer'}>Current</div>
              )} */}
              {selectedTS && (
                <div className={'vandal-diff-item__footer'}>{`${
                  dateObj.date
                }, ${toTwelveHourTime(dateObj.ts)}`}</div>
              )}
            </div>
          )}
          {editMode && (
            <div className="vandal-diff-item__edit">
              <div className="vandal-diff-minput-container">
                <input
                  className="vandal-diff__minput"
                  defaultValue={date}
                  type="month"
                  min="1996-01"
                  max={`${this.currentDate.getFullYear()}-12`}
                  onChange={e => {
                    e.persist();
                    this.debouncedCalendarChange(e);
                  }}
                />
                <CloseIcon
                  className="vandal-diff-item__close"
                  onClick={this.toggleEdit}
                />
              </div>
              {showLoader && <CalendarLoader className="vandal-cl-loader" />}
              {!showLoader && (
                <Calendar
                  date={date}
                  selectedDay={selectedDay}
                  getColor={this.getColor}
                  onMouseMove={this.handleCalendarMove}
                  onMouseLeave={this.handleCalendarLeave}
                  onClick={this.handleCalendarDayClick}
                />
              )}
              {showCard && (
                <Card
                  {...card}
                  onCardLeave={this.handleCardLeave}
                  onTsClick={this.handleTSClick}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
