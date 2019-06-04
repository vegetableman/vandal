import React from 'react';
import _ from 'lodash';
import cx from 'classnames';
import {
  getDateTsFromUrl,
  getDateTimeFromTS,
  toTwelveHourTime,
  isArchiveUrl
} from '../../../utils';
import { withDialog, Icon } from '../../common';
import { HistoryProvider } from '../../../stores';
import './style.css';

class URLHistory extends React.Component {
  state = { err: null };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isDialogClosed &&
      nextProps.isDialogClosed !== this.props.isDialogClosed
    ) {
      this.props.onClose();
    }
  }

  render() {
    const { err } = this.state;
    return (
      <HistoryProvider>
        {({ records, clearRecords }) => (
          <div className="vandal__url-history" ref={this.props.dialogRef}>
            <ul className="vandal__url-history__list">
              {!err &&
                _.map(_.reverse(_.slice(records)), url => {
                  const dateTimeObj = isArchiveUrl(url)
                    ? getDateTimeFromTS(_.get(getDateTsFromUrl(url), 'ts'))
                    : null;
                  return (
                    <li
                      className={cx({
                        'vandal__url-history__item': true,
                        'vandal__url-history__item--active':
                          this.props.frameUrl === url
                      })}
                      key={url}
                      onClick={this.props.onLogClick(url)}>
                      <div>{url}</div>
                      {dateTimeObj && (
                        <div className="vandal__url-history__date__item">{`${_.get(
                          dateTimeObj,
                          'humanizedDate'
                        )} ${toTwelveHourTime(_.get(dateTimeObj, 'ts'))}`}</div>
                      )}
                    </li>
                  );
                })}
              {!err && _.isEmpty(records) && (
                <div className="vandal__url-history__empty-msg">
                  No logs found. To disable storage of navigation history across
                  sessions, go to Extension options.
                </div>
              )}
              {err && (
                <div className="vandal__url-history__empty-msg">
                  Error fetching records. Please try again.
                </div>
              )}
            </ul>
            <div className="vandal__url-history__footer">
              <Icon
                name="clear"
                className="vandal__url-history__clear-icon"
                onClick={clearRecords}
              />
            </div>
          </div>
        )}
      </HistoryProvider>
    );
  }
}

export default withDialog(URLHistory, {
  ignoreClickOnClass: '.vandal-url__history-down__icon'
});
