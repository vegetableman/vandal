import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import './style.css';
import { toTwelveHourTime } from '../../utils';

export default class Card extends React.Component {
  static defaultProps = {
    ts: [],
    onCardEnter: () => {},
    onCardLeave: () => {},
    onCardMove : () => {},
  }
  
  render() {
    const { x, y, ts, onCardLeave, onCardEnter, onCardMove, onTsClick, day, monthName, year, showTitle, point, monthIndex } = this.props;
    return (
      <div 
        className="vandal-card"
        className={cx({
          "vandal-card": true,
          "vandal-card--empty": _.isEmpty(ts)
        })}
        style={{transform: `translate(${x}px, ${y}px)`}} 
        onMouseLeave={onCardLeave}
        onMouseEnter={onCardEnter(point, monthIndex)}
        onMouseMove={onCardMove}
      >
        {
          showTitle && (
            <div className="vandal-card__title">
              <div>{day}</div>
              <div>{monthName}</div>
              <div>{year}</div>
            </div>
          )
        }
        { !_.isEmpty(ts) && (
          <div className={cx({
            "vandal-card__body": true,
            "vandal-card__body--padded": !showTitle
          })}>
            {
              ts.map((ts, i) => {
                return (
                  <div className="vandal-card__value" key={`ts-${i}`} onClick={onTsClick(ts)}>
                    {toTwelveHourTime(ts.toString().substr(-6))}
                  </div>
                )
              })
            }
          </div>
        )}
      </div>
    )
  }
}