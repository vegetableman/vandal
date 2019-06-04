import React from 'react';
import cx from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';
import _ from 'lodash';
import './style.css';
import { toTwelveHourTime } from '../../../utils';
import { Icon } from '..';

export default class Card extends React.Component {
  static defaultProps = {
    ts: [],
    onCardEnter: () => {},
    onCardLeave: () => {},
    onCardMove: () => {}
  };

  render() {
    const {
      x,
      y,
      ts,
      onCardLeave,
      onCardEnter,
      onCardMove,
      onTsClick,
      day,
      monthName,
      year,
      showTitle,
      isSelected,
      point,
      monthIndex
    } = this.props;
    return (
      <div
        className="vandal-card"
        className={cx({
          'vandal-card': true,
          'vandal-card--empty': _.isEmpty(ts)
        })}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        onMouseLeave={onCardLeave}
        onMouseEnter={onCardEnter(point, monthIndex)}
        onMouseMove={onCardMove}>
        {showTitle && (
          <div className="vandal-card__title">
            {day} {monthName} {year}
          </div>
        )}
        {!_.isEmpty(ts) && (
          <div style={{ height: '100%' }}>
            <PerfectScrollbar
              className={cx({
                'vandal-card__body': true,
                'vandal-card__body--no-title': !showTitle,
                'vandal-card__body--title': showTitle
              })}>
              {ts.map((t, i) => {
                const status = _.get(t, 'status');
                const value = _.get(t, 'value');
                return (
                  <div
                    className={cx({
                      'vandal-card__value': true,
                      'vandal-card__value--selected': isSelected(value)
                    })}
                    key={`ts-${i}`}
                    onClick={onTsClick(value, day)}>
                    <span title={status}>
                      {toTwelveHourTime(_.toString(value).substr(-6))}
                    </span>
                    {(status === 301 || status === 302) && (
                      <Icon
                        name="redirect"
                        className="vandal-card__status__redirect-icon"
                        width={10}
                      />
                    )}
                    {status > 400 && (
                      <Icon
                        name="error"
                        className="vandal-card__status__error-icon"
                        width={13}
                        title="Error"
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
  }
}
