/* eslint-disable jsx-a11y/no-autofocus */
import React, {
  useCallback, useLayoutEffect, useRef, useEffect, useState, forwardRef
} from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import styles from "./monthinput.module.css";
import { longMonthNames } from "../../../utils";

const formatDate = (date) => (
  `${_.nth(longMonthNames, _.parseInt(_.nth(_.split(date, "-"), 1)) - 1)} ${_.nth(_.split(date, "-"), 0)}`
);

const MonthInput = forwardRef(({
  date, minYear, disabled, isOpen, onChange = () => {}
}, inputRef) => {
  const inputValueRef = useRef(null);
  const characterRef = useRef(null);
  const [inputValue, setInputValue] = useState(formatDate(date));

  const onClick = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const values = _.split(inputRef.current.value, " ");
    const month = _.nth(values, 0);
    if (inputRef.current.selectionEnd <= _.size(month)) {
      inputRef.current.setSelectionRange(0, _.size(month));
    } else {
      inputRef.current.setSelectionRange(_.size(month) + 1, inputRef.current.value.length);
    }
  }, []);

  const onBlur = useCallback(() => {
    characterRef.current = null;
  }, []);

  const onInputChange = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    let { value: currentValue } = e.target;
    const month = _.nth(_.split(currentValue, " "), 0);
    const year = _.nth(_.split(currentValue, " "), 1);
    if (inputRef.current.selectionEnd <= _.size(month)) {
      let matchIndex;
      const months = _.filter(longMonthNames, (m) => _.startsWith(_.toLower(m),
        characterRef.current));
      if (!_.isEmpty(months)) {
        if (_.size(months) > 1) {
          const prevMonth = _.nth(_.split(inputValue, " "), 0);
          const nextMonth = _.nth(months, _.indexOf(months, prevMonth) + 1) || _.nth(months, 0);
          matchIndex = _.indexOf(longMonthNames, nextMonth);
        } else {
          matchIndex = _.indexOf(longMonthNames, _.nth(months, 0));
        }
      }
      if (matchIndex > -1) {
        const monthName = _.nth(longMonthNames, matchIndex);
        currentValue = `${monthName} ${_.nth(_.split(currentValue, " "), 1)}`;
        setInputValue(currentValue);
      }
    } else if (inputRef.current.selectionEnd > _.size(month)) {
      const prevYear = _.nth(_.split(inputValue, " "), 1);
      if (_.size(`${_.parseInt(prevYear)}`) < 4) {
        currentValue = `${month} ${_.padStart(`${_.parseInt(prevYear)}${year}`, 4, "0")}`;
      } else {
        currentValue = `${month} ${_.padStart(`${year}`, 4, "0")}`;
      }
      setInputValue(currentValue);
    }
  }, [inputValue]);

  useLayoutEffect(() => {
    if (!inputRef.current) return;
    const month = _.nth(_.split(inputValue, " "), 0);
    const prevMonth = _.nth(_.split(inputValueRef.current, " "), 0);
    const year = _.nth(_.split(inputValue, " "), 1);
    const prevYear = _.nth(_.split(inputValueRef.current, " "), 1);
    if (inputRef.current.selectionStart === inputRef.current.selectionEnd) {
      inputRef.current.focus();

      // highlight on mount
      if (!prevMonth || !prevYear) {
        inputRef.current.setSelectionRange(0, _.size(month));
      // highlight month
      } else if (month !== prevMonth) {
        inputRef.current.setSelectionRange(0, _.size(month));
        onChange(`${year}-${_.padStart(_.indexOf(longMonthNames, month) + 1, 2, "0")}`);
      // highlight year
      } else if (year !== prevYear) {
        inputRef.current.setSelectionRange(_.size(month) + 1, _.size(month) + 1 + _.size(year));
        onChange(`${year}-${_.padStart(_.indexOf(longMonthNames, month) + 1, 2, "0")}`);
      }
    }
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const onKeyDown = useCallback((event) => {
    const values = _.split(inputValue, " ");
    const month = _.nth(values, 0);
    const year = _.nth(values, 1);

    if (_.get(event, "keyCode") > 40 && inputRef.current.selectionEnd <= _.size(month)) {
      characterRef.current = characterRef.current && _.last(characterRef.current) !== event.key ?
        characterRef.current + event.key : event.key;
      const months = _.filter(longMonthNames, (m) => _.startsWith(_.toLower(m),
        characterRef.current));
      if (_.isEmpty(months) || (_.size(months) === 1 && _.nth(months, 0) === _.nth(_.split(inputValue, " "), 0))) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    } else if (_.get(event, "keyCode") > 40 && inputRef.current.selectionEnd > _.size(month)) {
      characterRef.current = characterRef.current ? characterRef.current + event.key : event.key;
    }

    // right
    if (_.get(event, "keyCode") === 39) {
      event.preventDefault();
      event.stopPropagation();
      inputRef.current.setSelectionRange(_.size(month) + 1, _.size(month) + 1 + _.size(year));
    // left
    } else if (_.get(event, "keyCode") === 37) {
      event.preventDefault();
      event.stopPropagation();
      inputRef.current.setSelectionRange(0, _.size(month));
    // down
    } else if (_.get(event, "keyCode") === 40) {
      event.preventDefault();
      event.stopPropagation();
      if (inputRef.current.selectionEnd <= _.size(month)) {
        const monthIndex = Math.max(_.indexOf(longMonthNames, month), 0);
        setInputValue(`${_.nth(longMonthNames, !monthIndex ? 11 : monthIndex - 1)} ${year}`);
      } else {
        setInputValue(`${month} ${Math.max(_.parseInt(year) - 1, minYear)}`);
      }
      // up
    } else if (_.get(event, "keyCode") === 38) {
      event.preventDefault();
      event.stopPropagation();
      if (inputRef.current.selectionEnd <= _.size(month)) {
        const monthIndex = _.indexOf(longMonthNames, month);
        setInputValue(`${_.nth(longMonthNames, monthIndex >= 11 ? 0 : monthIndex + 1)} ${year}`);
      } else {
        setInputValue(`${month} ${_.parseInt(year) + 1}`);
      }
    }
  }, [inputValue, minYear]);

  const onKeyUp = useCallback(() => {
    characterRef.current = null;
  }, []);

  const debouncedKeyUp = _.debounce(onKeyUp, 500);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    const newValues = _.split(date, "-");
    const year = _.nth(newValues, 0);
    const month = _.nth(longMonthNames, _.parseInt(_.nth(newValues, 1)) - 1);
    const currentValues = _.split(inputRef.current.value, " ");
    const currentMonth = _.nth(currentValues, 0);
    const currentYear = _.nth(currentValues, 1);

    if (year !== currentYear || month !== currentMonth) {
      setInputValue(`${month} ${year}`);
    }
  }, [date]);

  return (
    <input
      ref={inputRef}
      className={cx({
        [styles.input]: true,
        [styles.input___open]: isOpen
      })}
      value={inputValue}
      disabled={disabled}
      onChange={onInputChange}
      onKeyDown={onKeyDown}
      onKeyUp={debouncedKeyUp}
      onBlur={onBlur}
      onClick={onClick}
      tabIndex={-1}
    />
  );
});

MonthInput.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  date: PropTypes.string.isRequired,
  minYear: PropTypes.number
};

MonthInput.defaultProps = {
  minYear: 1996
};

export default MonthInput;
