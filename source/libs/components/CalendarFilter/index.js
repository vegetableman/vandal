// https://github.com/substack/calendar-month-string

import _ from 'lodash';
import React from 'react';
import CalendarLoader from './loader';
import cx from 'classnames';
import './style.css';
import ErrorIcon from './error.svg';
import InputCalendar from '../InputCalendar';

class Calendar extends React.PureComponent {
  render() {
    let { date, getColor, onMouseMove, onMouseLeave, onClick } = this.props;
    if (!date) return <div className="vandal-cl" />;

    date = new Date(date);

    let first = new Date(date);
    first.setHours(0);
    first.setMinutes(0);
    first.setSeconds(0);
    first.setDate(1);

    let last = new Date(date);
    last.setHours(0);
    last.setMinutes(0);
    last.setSeconds(0);
    last.setMonth(last.getMonth() + 1);
    last.setDate(0);

    let weeks = Math.ceil((last.getDate() + first.getDay()) / 7);
    let day = 1 - first.getDay();
    let lines = [];

    for (let w = 0; w < weeks; w++) {
      let row = [];
      for (let d = 0; d < 7; d++) {
        let x = d + day;
        row.push(d + day);
      }
      day += 7;

      lines.push(
        <div
          className={`vandal-cl-week${
            w === weeks - 1 ? ' vandal-cl-last-week' : ''
          }`}
          key={`week-${w}`}>
          {row.map(day => {
            if (day <= 0) {
              return null;
            } else if (day > last.getDate()) {
              return null;
            } else {
              const style = getColor(day);
              return (
                <div
                  className={cx({
                    'vandal-cl-day': true,
                    'vandal-cl-day--active': Boolean(style)
                  })}
                  key={`day-${day}-${this.props.date}`}
                  onMouseMove={onMouseMove(day)}
                  onMouseLeave={onMouseLeave}
                  onClick={onClick(day)}>
                  <div style={style} className="vandal-cl-day__date">
                    {day}
                  </div>
                </div>
              );
            }
          })}
        </div>
      );
    }

    return (
      <div className="vandal-cl">
        <div className="vandal-cl-month">{lines}</div>
      </div>
    );
  }
}

export default class CalendarFilter extends React.PureComponent {
  static defaultProps = {
    showLoader: false
  };

  constructor(props) {
    super(props);
    this.state = {
      date:
        props.selectedYear && props.selectedMonth
          ? `${props.selectedYear}-${_.padStart(props.selectedMonth, 2, '0')}`
          : ''
    };
    this.currentDate = new Date();
  }

  handleCalendarChange = e => {
    const { value: date } = e.target;
    this.setState({ date });
    this.props.onChange(date);
  };

  debouncedCalendarChange = _.debounce(this.handleCalendarChange, 500);

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.selectedMonth !== this.props.selectedMonth ||
      nextProps.selectedYear !== this.props.selectedYear
    ) {
      this.setState({
        date:
          nextProps.selectedYear && nextProps.selectedMonth
            ? `${nextProps.selectedYear}-${_.padStart(
                nextProps.selectedMonth,
                2,
                '0'
              )}`
            : ''
      });
    }
  }

  handleCalendarSelect = (month, year) => {
    const date = `${year}-${_.padStart(month, 2, '0')}`;
    this.setState({ date });
    this.props.onChange(date);
  };

  render() {
    const { date } = this.state;
    const {
      showLoader,
      sparkline,
      goToPrevious,
      selectedMonth,
      selectedYear,
      goToNext,
      showConnectionError,
      theme
    } = this.props;

    return (
      <div className="vandal-cl-container">
        <div className="vandal-cl__mdate-container">
          <div className="vandal-cl__mlabel">Select Date :</div>
          <div className="vandal-cl__nav-container">
            <div className="vandal-cl__minput-container">
              <InputCalendar
                sparkline={sparkline}
                goToNext={goToNext}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                goToPrevious={goToPrevious}
                onSelect={this.handleCalendarSelect}>
                <input
                  key={date}
                  autoFocus
                  ref={input => {
                    this.dateInput = input;
                  }}
                  className="vandal-cl__minput"
                  defaultValue={date}
                  type="month"
                  min="1996-01"
                  max={`${this.currentDate.getFullYear()}-12`}
                  onChange={e => {
                    e.persist();
                    this.debouncedCalendarChange(e);
                  }}
                />
              </InputCalendar>
            </div>
          </div>
          {showConnectionError && (
            <div className="vandal-cl__archive-error">
              <ErrorIcon width={18} className="vandal-cl__conn-error-icon" />
              <div>Error connecting to the Archive Server</div>
            </div>
          )}
        </div>
        {showLoader && !showConnectionError && (
          <CalendarLoader className="vandal-cl-loader" theme={theme} />
        )}
        {!showLoader && !showConnectionError && (
          <Calendar date={date} {...this.props} />
        )}
      </div>
    );
  }
}
