import React from 'react';
import cx from 'classnames';
import './style.css';
import { ArchiveLoader, URLLoader, Icon } from '../Common';
import { getDateTimeFromTS, toTwelveHourTime } from '../../utils';

export default class URLBox extends React.Component {
  static defaultProps = {
    toggleTimeTravel: () => {},
    url: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      showInfo: false
    };
  }

  render() {
    const {
      toggleTimeTravel,
      toggleURLInfo,
      toggleURLHistory,
      showTimeTravel,
      showURLInfo,
      selectedTS,
      redirectedTS,
      showFrameLoader,
      showURLLoader,
      showURLHistory,
      theme,
      url
    } = this.props;
    const ts = redirectedTS || selectedTS;
    const dateObj = ts ? getDateTimeFromTS(ts) : {};
    return (
      <div className="vandal-urlbox-container">
        <div className="vandal-url-container">
          <div className="vandal-url__mode">
            {showURLLoader && <URLLoader />}
            {!ts && !showURLLoader && (
              <Icon name="globe" className="vandal-url__icon" />
            )}
            {!!ts && !showURLLoader && (
              <Icon name="archive" className="vandal-archive__icon" />
            )}
          </div>
          <input
            type="text"
            className="vandal-url__input"
            value={url}
            readOnly
          />
          <button
            className={cx({
              'vandal-url__history__btn': true,
              'vandal-url__history__btn--active': showURLHistory
            })}
            onClick={toggleURLHistory}>
            <Icon
              name="bottomCaret"
              className="vandal-url__history-down__icon"
            />
          </button>
        </div>
        {!!ts && (
          <div
            className={cx({
              'vandal-url__date': true,
              'vandal-url__date-loader': showFrameLoader,
              'vandal-url__date-info': showURLInfo
            })}
            onClick={toggleURLInfo}>
            {showFrameLoader && (
              <ArchiveLoader title="Loading..." theme={theme} />
            )}
            {!showFrameLoader && (
              <Icon
                name="info"
                width={22}
                className={cx({
                  'vandal-url__date-info__icon': true,
                  'vandal-url__date-info__icon--dark': theme === 'dark'
                })}
              />
            )}
            <div className="vandal-url__date__value">
              <span style={{ marginRight: '3px' }}>
                {dateObj.humanizedDate}
              </span>{' '}
              <span>{toTwelveHourTime(dateObj.ts)}</span>
            </div>
          </div>
        )}
        <div className="vandal-url__filter">
          <div
            className={cx({
              'vandal-url__timetravel-btn': true,
              'vandal-url__timetravel-btn--selected': showTimeTravel
            })}
            onClick={toggleTimeTravel}>
            <Icon
              className="vandal-url__timetravel-btn__icon"
              name="history"
              width={22}
            />
          </div>
        </div>
      </div>
    );
  }
}
