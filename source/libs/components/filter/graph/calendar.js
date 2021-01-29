import React from "react";
import _ from "lodash";
import cx from "classnames";
import styles from "./calendar.module.css";

const Calendar = (props) => {
  const {
    date, getColor, onMouseMove, onMouseLeave, onClick
  } = props;
  if (!date) return <div className={style.calendar} />;

  const dateInstance = new Date(date);

  const first = new Date(dateInstance);
  first.setHours(0);
  first.setMinutes(0);
  first.setSeconds(0);
  first.setDate(1);

  const last = new Date(dateInstance);
  last.setHours(0);
  last.setMinutes(0);
  last.setSeconds(0);
  last.setMonth(last.getMonth() + 1);
  last.setDate(0);

  const days = [];

  for (let d = first.getDate(); d <= last.getDate(); d++) {
    const dayStyle = getColor(d);
    days.push(
      <div
        className={cx({
          [styles.day]: true,
          [styles.day___active]: Boolean(dayStyle)
        })}
        key={`day-${d}-${date}`}
        onMouseMove={onMouseMove(d)}
        onMouseLeave={onMouseLeave}
        onClick={onClick(d)}
      >
        <div style={dayStyle} className={styles.date}>
          {d}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarMonth}>{days}</div>
    </div>
  );
};

export default Calendar;
