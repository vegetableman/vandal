import React from 'react';
import _ from 'lodash';
import { getDateTimeFromTS, toTwelveHourTime } from '../../../utils';
import { withDialog, Icon } from '../../common';
import './style.css';

class URLInfo extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isDialogClosed &&
      nextProps.isDialogClosed !== this.props.isDialogClosed
    ) {
      nextProps.onClose();
    }
  }

  render() {
    const {
      url,
      redirectTSCollection,
      selectedTS,
      redirectedTS,
      dialogRef
    } = this.props;

    const archiveURL = _.replace(url, 'im_', '');
    let infoDateObj;
    let redirectTSList = [];
    if (redirectTSCollection[redirectedTS]) {
      infoDateObj = getDateTimeFromTS(redirectedTS);
      redirectTSList = [redirectTSCollection[redirectedTS], redirectedTS];
    } else {
      infoDateObj = getDateTimeFromTS(selectedTS);
    }

    return (
      <div className="vandal__url-info" ref={dialogRef}>
        <ul className="vandal__url-info__list">
          {!!redirectTSCollection[redirectedTS] && (
            <li className="vandal__url-info__item">
              <div className="vandal__url-info__label">Original URL :</div>
              <a
                className="vandal__url-info__link"
                href={_.replace(url, /\d+/, redirectTSCollection[redirectedTS])}
                target="_blank">
                {_.replace(url, /\d+/, redirectTSCollection[redirectedTS])}
              </a>
            </li>
          )}
          <li className="vandal__url-info__item">
            <div className="vandal__url-info__label">Rendered URL :</div>
            <a className="vandal__url-info__link" href={url} target="_blank">
              {url}
            </a>
          </li>
          <li className="vandal__url-info__item">
            <div className="vandal__url-info__label">Archive URL :</div>
            <a
              className="vandal__url-info__link"
              href={archiveURL}
              target="_blank">
              {archiveURL}
            </a>
          </li>
        </ul>
        {!!redirectTSCollection[redirectedTS] && (
          <div className="vandal__url-info__redirect-container">
            <div className="vandal__url-info__redirect-header">
              <Icon
                name="redirect"
                className="vandal__url-info__redirect-icon"
                width={10}
              />
              <div className="vandal__url-info__redirect-title">
                Redirect Path
              </div>
            </div>
            <div className="vandal__url-info__redirect-list">
              {_.map(redirectTSList, (ts, index) => {
                const dateObj = getDateTimeFromTS(ts);
                return (
                  <React.Fragment key={ts}>
                    <div className="vandal__url-info__redirect-list-item">
                      {`${dateObj.humanizedDate} ${toTwelveHourTime(
                        dateObj.ts
                      )}`}
                    </div>
                    {index !== _.size(redirectTSList) - 1 ? (
                      <Icon
                        name="pathArrow"
                        width={20}
                        className="vandal__url-info__redirect-path-icon"
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        <div className="vandal__url-info__note">
          Note: The time{' '}
          <span className="vandal__url-info__date">{`${_.get(
            infoDateObj,
            'humanizedDate'
          )} ${toTwelveHourTime(_.get(infoDateObj, 'ts'))}`}</span>{' '}
          reflects the time on which Wayback Machine archived the page and not
          the actual page update time by the website owner.
        </div>
      </div>
    );
  }
}

export default withDialog(URLInfo, {
  ignoreClickOnClass: '.vandal-url__date'
});
