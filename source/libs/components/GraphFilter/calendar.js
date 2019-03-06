import React from 'react';
import _ from 'lodash';
import cx from 'classnames';

export default class Calendar extends React.Component {
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

    let days = [];

    for (let d = first.getDate(); d <= last.getDate(); d++) {
      const style = getColor(d);
      days.push(
        <div
          className={cx({
            'vandal-cl-gf-day': true,
            'vandal-cl-gf-day--active': Boolean(style)
          })}
          key={`day-${d}-${this.props.date}`}
          onMouseMove={onMouseMove(d)}
          onMouseLeave={onMouseLeave}
          onClick={onClick(d)}>
          <div style={style} className="vandal-cl-gf-day__date">
            {d}
          </div>
        </div>
      );
    }

    return (
      <div className="vandal-cl-gf">
        <div className="vandal-cl-gf-month">{days}</div>
      </div>
    );
  }
}
