import React, { memo } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import _ from "lodash";
import {
  getDateTimeFromTS,
  toTwelveHourTime,
  compareProps
} from "../../../utils";
import { withDialog, Icon } from "../../common";

import styles from "./urlinfo.module.css";
import boxStyle from "../box/urlbox.module.css";

const URLInfo = memo(
  ({
    dialogRef, url, redirectTSCollection, redirectedTS, selectedTS
  }) => {
    const archiveURL = selectedTS ?
      `https://web.archive.org/web/${selectedTS}/${url}` :
      null;
    const renderedURL = redirectedTS ?
      `https://web.archive.org/web/${redirectedTS}/${url}` :
      null;
    let infoDateObj;
    let redirectTSList = [];

    if (_.get(redirectTSCollection, redirectedTS)) {
      infoDateObj = getDateTimeFromTS(redirectedTS);
      redirectTSList = [redirectTSCollection[redirectedTS], redirectedTS];
    } else {
      infoDateObj = getDateTimeFromTS(selectedTS);
    }

    return (
      <div className={styles.info} ref={dialogRef}>
        <ul className={styles.list}>
          {archiveURL && (
            <li className={styles.item}>
              <div className={styles.label}>Archive URL :</div>
              <a rel="noreferrer" className={styles.link} href={archiveURL} target="_blank">
                {archiveURL}
              </a>
            </li>
          )}
          {(!!_.get(redirectTSCollection, redirectedTS) || renderedURL) && (
            <li className={styles.item}>
              <div
                className={cx({
                  [styles.label]: true,
                  [styles.label__rendered]: true
                })}
              >
                Rendered URL :
              </div>
              <a rel="noreferrer" className={styles.link} href={renderedURL} target="_blank">
                {renderedURL}
              </a>
            </li>
          )}
        </ul>
        {!!_.get(redirectTSCollection, redirectedTS) && (
          <div className={styles.redirect__container}>
            <div className={styles.redirect__header}>
              <Icon
                name="redirect"
                className={styles.redirect__icon}
                width={10}
              />
              <div className={styles.redirect__title}>Redirect Path</div>
            </div>
            <div className={styles.redirect__ts__list}>
              {_.map(redirectTSList, (ts, index) => {
                const dateObj = getDateTimeFromTS(ts);
                return (
                  <React.Fragment key={ts}>
                    <div className={styles.redirect__ts__list__item}>
                      {`${dateObj.humanizedDate} ${toTwelveHourTime(
                        dateObj.ts
                      )}`}
                    </div>
                    {index !== _.size(redirectTSList) - 1 ? (
                      <Icon
                        name="pathArrow"
                        width={20}
                        className={styles.redirect__path__icon}
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        <div className={styles.note}>
          Note: The time
          {" "}
          <span className={styles.date}>
            {`${_.get(
              infoDateObj,
              "humanizedDate"
            )} ${toTwelveHourTime(_.get(infoDateObj, "ts"))}`}
          </span>
          {" "}
          reflects the time on which Wayback Machine archived the page and not
          the actual page update time by the website owner.
        </div>
      </div>
    );
  },
  compareProps(["redirectedTS", "selectedTS", "redirectTSCollection", "url"])
);

URLInfo.propTypes = {
  dialogRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  url: PropTypes.string.isRequired,
  redirectTSCollection: PropTypes.object,
  redirectedTS: PropTypes.number,
  selectedTS: PropTypes.number,
};

URLInfo.defaultProps = {
  redirectTSCollection: null,
  redirectedTS: null,
  selectedTS: null
};

export default withDialog(URLInfo, {
  ignoreClickOnClass: `.${boxStyle.date}`
});
