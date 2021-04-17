import React, {
  useState, useEffect, memo, useMemo, useCallback
} from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import cx from "classnames";
import _ from "lodash";

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

const URLBox = memo(({ toggleTimeTravel, ...props }) => {
  const { showIntro, toggleIntro } = useIntro();
  const { theme } = useTheme();
  const getTS = useCallback(() => (props.redirectedTS ?
    props.redirectedTS : props.selectedTS), [props.redirectedTS, props.selectedTS]);
  const [currentTS, setCurrentTs] = useState(getTS());
  const dateObj = useMemo(() => getDateTimeFromTS(currentTS) || {}, [currentTS]);
  const [isSWRendered, toggleSWRender] = useState(false);
  const [showURLLoader, toggleURLLoader] = useState(false);
  const [showFrameLoader, toggleFrameLoader] = useState(false);
  const [showReadOnly, toggleReadOnly] = useState(false);

  const onTimeTravelClick = useCallback(() => {
    toggleIntro(false);
    toggleTimeTravel();
  }, [toggleIntro, toggleTimeTravel]);

  useEffect(
    () => {
      setCurrentTs(getTS());
    },
    [props.redirectedTS, props.selectedTS]
  );

  useEffect(() => {
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
    chrome.runtime.onMessage.addListener(onMessage);

    const checkServiceWorker = async () => {
      if (!_.get(navigator, "serviceWorker.controller")) return;
      const keys = await window.caches.keys();
      const cacheResult = await Promise.all(_.map(keys, (key) => new Promise(async (resolve) => {
        const result = await caches.open(key);
        const requests = await result.keys();
        resolve(_.some(requests, (request) => request.url === props.url));
      })));
      // If the URL itself is cached, show message.
      if (_.some(cacheResult)) {
        toggleSWRender(true);
      }
    };

    try {
      checkServiceWorker();
    } catch (ex) {
      console.error("Failed to check service workers");
    }

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.favicon}>
          {showURLLoader && !isSWRendered && <URLLoader className={styles.url__loader}/>}
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
          <div>
            <span style={{ marginRight: "3px" }}>{dateObj.humanizedDate}</span>
            {" "}
            <span>{toTwelveHourTime(dateObj.time)}</span>
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
          onClick={onTimeTravelClick}
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
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
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
            </div>
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
        <span>
          Vandal may experience issues navigating this website. Open the URL on
          <a
            href={`https://web.archive.org/web/*/${props.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.wayback__link}
          >
            Wayback Machine
          </a>
          <Icon name="openURL" width={11} className={styles.wayback__link_icon} />
        </span>
      </Toast>
    </div>
  );
}, compareProps(["redirectedTS", "selectedTS", "url", "showURLHistory", "showURLInfo", "showTimeTravel", "sparklineLoaded"]));

URLBox.propTypes = {
  toggleURLHistory: PropTypes.func.isRequired,
  toggleTimeTravel: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  toggleURLInfo: PropTypes.func,
  redirectedTS: PropTypes.number,
  selectedTS: PropTypes.number,
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
  toggleURLInfo: () => {},
  showURLInfo: false
};

export default URLBox;
