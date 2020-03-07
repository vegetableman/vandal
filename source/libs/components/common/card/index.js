import React, { memo } from 'react';
import cx from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { toTwelveHourTime, compareProps } from '../../../utils';
import { Icon } from '..';

import styles from './card.module.css';
import './scrollbar.css';

const Card = memo(props => {
  const {
    day,
    isSelected,
    isRedirected,
    monthName,
    showTitle,
    ts,
    x,
    y,
    year,
    onCardLeave,
    onCardEnter,
    onCardMove,
    onTsClick
  } = props;

  return (
    <div
      className={cx({
        [styles.card]: true,
        [styles.card___empty]: _.isEmpty(ts)
      })}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onMouseLeave={onCardLeave}
      onMouseEnter={onCardEnter}
      onMouseMove={onCardMove}>
      {showTitle && (
        <div className={styles.title}>
          {day} {monthName} {year}
        </div>
      )}
      {!_.isEmpty(ts) && (
        <div style={{ height: '100%' }}>
          <PerfectScrollbar
            className={cx({
              [styles.body]: true,
              [styles.body___noTitle]: !showTitle,
              [styles.body___title]: showTitle
            })}>
            {ts.map((t, i) => {
              const status = _.get(t, 'status');
              const value = _.get(t, 'value');
              return (
                <div
                  className={cx({
                    [styles.value]: true,
                    [styles.value___selected]: isSelected(value)
                  })}
                  key={`ts-${i}`}
                  onClick={onTsClick(value)}>
                  <span title={status}>
                    {toTwelveHourTime(_.toString(value).substr(-6))}
                  </span>
                  {(status === 301 || status === 302) && (
                    <Icon
                      className={cx({
                        [styles.redirectIcon]: true,
                        [styles.redirectIcon___active]: isRedirected(value)
                      })}
                      name="redirect"
                      width={10}
                    />
                  )}
                  {status > 400 && (
                    <Icon
                      className={styles.errorIcon}
                      name="error"
                      title="Error"
                      width={10}
                    />
                  )}
                </div>
              );
            })}
          </PerfectScrollbar>
        </div>
      )}
    </div>
  );
}, compareProps(['day', 'isSelected', 'monthName', 'showTitle', 'x', 'y', 'ts', 'year']));

Card.defaultProps = {
  ts: [],
  onCardEnter: () => {},
  onCardLeave: () => {},
  onCardMove: () => {}
};

export default Card;
