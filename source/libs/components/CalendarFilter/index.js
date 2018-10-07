// https://github.com/substack/calendar-month-string

import _ from 'lodash';
import React from 'react';
import CalendarLoader from './loader';
import cx from 'classnames' ;
import './style.css';

class Calendar extends React.Component {
  render() {
    let { date, getColor, onMouseMove, onMouseLeave, onClick, selectedDay } = this.props
    if (!date) return <div className="vandal-cl"></div>

    date = new Date(date)

    let first = new Date(date)
    first.setHours(0)
    first.setMinutes(0)
    first.setSeconds(0)
    first.setDate(1)

    let last = new Date(date)
    last.setHours(0)
    last.setMinutes(0)
    last.setSeconds(0)
    last.setMonth(last.getMonth()+1)
    last.setDate(0)

    let weeks = Math.ceil((last.getDate() + first.getDay()) / 7)
    let day = 1 - first.getDay()
    let lines = []
    
    for (let w = 0; w < weeks; w++) {
      let row = []
      for (let d = 0; d < 7; d++) {
        let x = d + day
        row.push(d + day)
      }
      day += 7

      lines.push(
        <div className={`vandal-cl-week${w === weeks - 1 ? " vandal-cl-last-week": ""}`} key={`week-${w}`}>
          {
            row.map((day) => {
              if (day <= 0) {
                return null
              }
              else if (day > last.getDate()) {
                return null
              }
              else {
                return (
                  <div
                    className={cx({
                      "vandal-cl-day": true,
                      "vandal-cl-day--selected": selectedDay === day
                    })}
                    key={`day-${day}-${this.props.date}`}
                    onMouseMove={onMouseMove(day)}
                    onMouseLeave={onMouseLeave}
                    onClick={onClick(day)}
                  >
                    <div style={getColor(day)} className="vandal-cl-day__date">{day}</div>
                  </div>
                )
              }
            })
          }
        </div>
      )
    }

    return (
      <div className="vandal-cl">
        <div className="vandal-cl-month">
          {lines}
        </div>
      </div>
    )
  }
}

export default class CalendarFilter extends React.Component {

  static defaultProps = {
    showLoader: false
  }

  constructor(props) {
    super(props);
    this.state = {
      date: props.selectedYear && props.selectedMonth ? `${props.selectedYear}-${props.selectedMonth}` : ''
    }
    this.currentDate = new Date()
    this.handleMonthChange = this.handleMonthChange.bind(this)
    this.debouncedMonthChange = _.debounce(this.handleMonthChange, 250)
  }

  handleMonthChange(e) {
    const { value: date } = e.target;
    this.setState({ date });
    this.props.onChange(date);
  }

  render() {
    const { date } = this.state;
    const { showLoader } = this.props;

    return (
      <div className="vandal-cl-container">
        <div className="vandal-cl__minput-container">
          <div className="vandal-cl__mlabel">
            <span>Select Date:</span>
          </div>
          <input
            className="vandal-cl__minput"
            defaultValue={date}
            type="month" min="1996-01" max={`${this.currentDate.getFullYear()}-12`}
            onChange={(e) => { e.persist(); this.debouncedMonthChange(e); }}
          />
        </div>
        { showLoader && <CalendarLoader className="vandal-cl-loader"/> }
        { !showLoader && <Calendar date={date} {...this.props}/> }
      </div>
    );
  }
}