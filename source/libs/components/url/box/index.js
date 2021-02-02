import React, { useState, useEffect, memo } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import cx from "classnames";

import ArchiveLoader from "./loader";
import { URLLoader, Icon, Toast } from "../../common";
import {
  getDateTimeFromTS,
  toTwelveHourTime,
  isArchiveURL,
  compareProps
} from "../../../utils";
import { useIntro } from "../../../hooks/use-intro";
import { colors } from "../../../constants";
import { useTheme } from "../../../hooks";

import styles from "./urlbox.module.css";

const URLBox = memo((props) => {
  const { showIntro, toggleIntro } = useIntro();
  const getTS = () => {
    if (props.redirectedTS) {
      return props.redirectedTS;
    }
    return props.selectedTS;
  };

  const [currentTS, setCurrentTs] = useState(getTS());
  const [isSWRendered, toggleSWRender] = useState(false);
  const dateObj = currentTS ? getDateTimeFromTS(currentTS) : {};
  const [showURLLoader, toggleURLLoader] = useState(false);
  const [showFrameLoader, toggleFrameLoader] = useState(false);
  const [showReadOnly, toggleReadOnly] = useState(false);
  const { theme } = useTheme();

  useEffect(
    () => {
      setCurrentTs(getTS());
    },
    [props.redirectedTS, props.selectedTS]
  );

  let frameLoaderTimeout;
  const onMessage = async (request) => {
    switch (request.message) {
      case "__VANDAL__NAV__BEFORENAVIGATE":
        toggleURLLoader(true);
        if (isArchiveURL(_.get(request.data, "url"))) {
          toggleFrameLoader(true);
          if (frameLoaderTimeout) {
            clearTimeout(frameLoaderTimeout);
          }
          frameLoaderTimeout = setTimeout(() => {
            toggleFrameLoader(false);
          }, 2500);
        }
        break;
      case "__VANDAL__NAV__ERROR":
        toggleURLLoader(false);
        break;
      case "__VANDAL__NAV__COMPLETE":
        toggleSWRender(false);
        toggleURLLoader(false);
        toggleFrameLoader(false);
        break;
      default:
        break;
    }
  };

  const checkServiceWorker = async () => {
    if (!navigator.serviceWorker.controller) return;
    const keys = await window.caches.keys();
    const isPageCached = await Promise.all(keys).then(async (key) => {
      const result = await caches.open(key);
      const requests = await result.keys();
      return _.some(requests, (request) => request.url === props.url);
    });
    if (isPageCached) {
      toggleSWRender(true);
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
    checkServiceWorker();
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.favicon}>
          {showURLLoader && !isSWRendered && <URLLoader />}
          {!currentTS &&
            (!showURLLoader || isSWRendered) && (
              <Icon name="globe" className={styles.url__icon} />
          )}
          {!!currentTS &&
            !showURLLoader && (
              <Icon name="archive" className={styles.archive__icon} />
          )}
        </div>
        <input
          type="text"
          className={styles.input}
          value={props.url}
          readOnly
          onMouseEnter={() => {
            toggleReadOnly(true);
          }}
          onMouseOut={(e) => {
            if (e.relatedTarget && e.relatedTarget.hasAttribute("data-for")) {
              return;
            }
            toggleReadOnly(false);
          }}
          onBlur={() => undefined}
        />
        <Icon
          style={{ visibility: showReadOnly ? "visible" : "hidden" }}
          data-for="vandal-readonly"
          data-tip="URL is non-editable"
          name="readOnly"
          className={styles.readonly__icon}
          onMouseLeave={() => {
            toggleReadOnly(false);
          }}
        />
        <button
          type="button"
          className={cx(styles.history__btn, {
            [styles.history__btn___active]: props.showURLHistory
          })}
          onClick={props.toggleURLHistory}
        >
          <Icon name="bottomCaret" className={styles.caret} />
        </button>
      </div>
      {!!currentTS && (
        <button
          type="button"
          className={cx({
            [styles.date]: true,
            [styles.date__loader]: showFrameLoader,
            [styles.date__info]: props.showURLInfo && !showFrameLoader
          })}
          onClick={props.toggleURLInfo}
        >
          {showFrameLoader && (
            <ArchiveLoader title="Loading..." theme={theme} />
          )}
          {!showFrameLoader && (
            <Icon
              name="info"
              className={cx({
                [styles.info__icon]: true,
                [styles.info__icon___dark]: theme === "dark"
              })}
            />
          )}
          <div className={styles.date__text}>
            <span style={{ marginRight: "3px" }}>{dateObj.humanizedDate}</span>
            {" "}
            <span>{toTwelveHourTime(dateObj.ts)}</span>
          </div>
        </button>
      )}
      <div className={styles.timetravel__container}>
        <button
          type="button"
          className={cx({
            [styles.timetravel__btn]: true,
            [styles.timetravel__btn___selected]: props.showTimeTravel,
            [styles.timetravel__btn___updated]: props.sparklineLoaded,
            [styles.timetravel__btn__intro]: showIntro
          })}
          onClick={() => {
            toggleIntro(false);
            props.toggleTimeTravel();
          }}
        >
          <Icon
            className={cx({
              [styles.timetravel__icon]: true,
              [styles.timetravel__icon__intro]: showIntro
            })}
            name="history"
            width={22}
          />
          {showIntro && (
            <button
              type="button"
              className={styles.intro}
              onClick={() => {
                toggleIntro(false);
              }}
            >
              <Icon
                name="introArrow"
                width={92}
                height={177}
                className={styles.intro_arrow__icon}
              />
              <span className={styles.intro__text}>Get started!</span>
            </button>
          )}
        </button>
      </div>
      <ReactTooltip
        border
        className={styles.tooltip}
        id="vandal-readonly"
        effect="solid"
        place="right"
        type={theme}
        textColor={colors.WHITE}
        backgroundColor={colors.BL}
        borderColor={colors.BL}
        arrowColor={colors.BL}
        delayHide={100}
        delayShow={100}
        offset={{ left: -5 }}
      />
      <Toast
        err
        closeTimeout={8000}
        className={styles.frame_render_err__toast}
        show={isSWRendered && showURLLoader}
      >
        <span>Vandal is experiencing issues rendering this page.</span>
      </Toast>
    </div>
  );
}, compareProps(["redirectedTS", "selectedTS", "url", "redirectTSCollection", "showURLHistory", "showURLInfo", "showTimeTravel", "sparklineLoaded"]));

URLBox.propTypes = {
  toggleURLInfo: PropTypes.func.isRequired,
  toggleURLHistory: PropTypes.func.isRequired,
  toggleTimeTravel: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  redirectedTS: PropTypes.string,
  selectedTS: PropTypes.string,
  showURLHistory: PropTypes.bool,
  showTimeTravel: PropTypes.bool,
  sparklineLoaded: PropTypes.bool,
  showURLInfo: PropTypes.bool
};

URLBox.defaultProps = {
  redirectedTS: null,
  selectedTS: null,
  showURLHistory: false,
  showTimeTravel: false,
  sparklineLoaded: false,
  showURLInfo: false
};

export default URLBox;
