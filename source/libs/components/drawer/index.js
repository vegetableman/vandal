import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import clickDrag from "react-clickdrag";
import ShadowDOM from "react-shadow";
import { useMachine } from "@xstate/react";

import {
  dateTimeDiff,
  formatDateTimeTS,
  stripArchiveURL,
  useEventCallback,
  isArchiveURL,
  getDateTsFromURL
} from "../../utils";
import { URLLoader, Icon } from "../common";
import drawerMachine from "./drawer.machine";
import styles from "./drawer.module.css";
import resourceTSController from "./resource-ts-controller";

const DrawerHeader = ({
  dataDrag,
  scrollOnHighlight,
  onDrag,
  onScrollHighlight,
  onClose
}) => {
  useEffect(
    () => {
      if (dataDrag.isMoving) {
        onDrag(dataDrag.moveDeltaY);
      }
    },
    [dataDrag.isMoving, dataDrag.moveDeltaY, onDrag]
  );

  return (
    <div className={styles.title__bar}>
      <div className={styles.title__bar__left}>
        <Icon name="timestamp" className={styles.timestamp__icon} />
        <div className={styles.scroll__container}>
          <label
            className={styles.scroll__label}
            htmlFor="vandal-scroll-highlight"
          >
            <input
              type="checkbox"
              id="vandal-scroll-highlight"
              checked={scrollOnHighlight}
              className={styles.scroll__checkbox}
              onChange={onScrollHighlight}
            />
            Scroll On Highlight
          </label>
        </div>
      </div>
      <Icon name="close" className={styles.close__icon} onClick={onClose} />
    </div>
  );
};

DrawerHeader.propTypes = {
  onDrag: PropTypes.func.isRequired,
  onScrollHighlight: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  dataDrag: PropTypes.shape({
    isMoving: PropTypes.bool,
    moveDeltaY: PropTypes.number
  }),
  scrollOnHighlight: PropTypes.bool
};

DrawerHeader.defaultProps = {
  dataDrag: { isMoving: false, moveDeltaY: null },
  scrollOnHighlight: false
};

const DrawerHeaderDraggable = clickDrag(DrawerHeader, {
  touch: false,
  onDragStart: (__, props) => {
    if (props.onDragStart) {
      props.onDragStart();
    }
    // eslint-disable-next-line no-param-reassign
    props.frame.style.pointerEvents = "none";
  },
  onDragStop: (__, props) => {
    if (props.onDragStop) {
      props.onDragStop();
    }
    // eslint-disable-next-line no-param-reassign
    props.frame.style.pointerEvents = "auto";
  }
});

let startHeight;

const getIcon = (url) => {
  if (url.match(/\.(jpeg|jpg|gif|png|svg)$/)) {
    return <Icon name="image" className={styles.image__icon} />;
  } if (_.endsWith(url, "js")) {
    return (
      <span
        className={`${styles.resource__icon} ${styles.resource__icon___js}`}
      >
        JS
      </span>
    );
  } if (_.endsWith(url, "css")) {
    return <span className={styles.resource__icon}>CSS</span>;
  }
  return <Icon name="document" className={styles.doc__icon} />;
};

const Drawer = (props) => {
  const [state, send] = useMachine(drawerMachine);
  const { context: ctx } = state;

  const handleMouseEnter = (source, ts) => () => {
    chrome.runtime.sendMessage({
      message: "__VANDAL__CLIENT__HIGHLIGHT__NODE",
      data: { source, ts, scrollOnHighlight: ctx.scrollOnHighlight }
    });
  };
  useEffect(
    () => {
      send("LOAD_TIMESTAMPS", {
        payload: {
          sources: props.sources
        }
      });
    },
    [props.sources, send]
  );

  useEffect(() => () => {
    chrome.runtime.sendMessage({
      message: "__VANDAL__CLIENT__REMOVE__HIGHLIGHT"
    });
    resourceTSController.abort();
  }, []);

  useEffect(
    () => {
      if (props.isNavComplete && props.selectedTS) {
        chrome.runtime.sendMessage({
          message: "__VANDAL__CLIENT__FETCH__SOURCES"
        });
      }
    },
    [props.isNavComplete, props.selectedTS]
  );

  const onDrag = useCallback((delta) => {
    send("SET_HEIGHT", {
      payload: { value: Math.min(Math.max(startHeight - delta, 100), 500) }
    });
  });

  const onDragStart = useCallback(
    () => {
      startHeight = ctx.height;
    },
    [ctx.height]
  );

  const onDragStop = useCallback(
    () => {
      send("SET_HEIGHT", {
        payload: { value: ctx.height }
      });
    },
    [ctx.height, send]
  );

  const getDelta = (isValid) => (isValid ? (
    <span className={styles.timestamp__delta___notfound}>
      Not Archived
    </span>
  ) : null);

  return (
    <div
      className={styles.drawer}
      style={{ height: `${ctx.height}px` }}
      ref={props.dialogRef}
    >
      <DrawerHeaderDraggable
        frame={props.frame}
        onScrollHighlight={(e) => send("TOGGLE_SCROLL_HIGHLIGHT", {
          payload: { checked: e.target.checked }
        })}
        scrollOnHighlight={ctx.scrollOnHighlight}
        onClose={props.onClose}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
      />
      <div className={styles.body}>
        <div className={styles.info}>
          <div>
            This panel displays
            {" "}
            <span className={styles.info__highlight}>time difference</span>
            {" "}
            and
            {" "}
            <span className={styles.info__highlight}>timestamps</span>
            {" "}
            for all
            the page elements compared to the page. Some elements may vary
            significantly in capture timestamp from the base URL of the page,
            depending on the web crawling process. To know more, click
            {" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={styles.info__link}
              href="https://blog.archive.org/2017/10/05/wayback-machine-playback-now-with-timestamps/"
            >
              here
            </a>
            .
          </div>
          <div />
        </div>
        {!props.selectedTS && (
          <div className={styles.timestamps___empty}>
            No Timestamps found. Please navigate to an Archive URL to view
            timestamps.
          </div>
        )}
        {!props.isNavComplete &&
          props.selectedTS && (
            <div className={styles.timestamps___loading}>
              Waiting for the page to finish loading ...
            </div>
        )}
        {props.isNavComplete &&
          props.selectedTS &&
          _.isEmpty(props.sources) && (
            <div className={styles.timestamps___loading}>
              Fetching page elements ...
            </div>
        )}
        {!_.isEmpty(props.sources) &&
          props.selectedTS && (
            <ul className={styles.list}>
              {_.map(props.sources, (source, index) => {
                const ts = _.get(ctx.timestamps[index], "ts");
                const err = _.get(ctx.timestamps[index], "err");
                const isValid = _.get(ctx.timestamps[index], "isValid");
                const dt = dateTimeDiff(ts, props.selectedTS);
                return (
                  <li
                    key={index}
                    className={styles.item}
                    onMouseEnter={handleMouseEnter(source, _.get(dt, "text"))}
                    onMouseLeave={() => {
                      chrome.runtime.sendMessage({
                        message: "__VANDAL__CLIENT__REMOVE__HIGHLIGHT"
                      });
                    }}
                  >
                    <div className={styles.item__left}>
                      {ts || err || isValid ? (
                        getIcon(source)
                      ) : (
                        <URLLoader className={styles.ts__loader} />
                      )}
                      <a
                        href={source}
                        rel="noopener noreferrer"
                        target="_blank"
                        title={source}
                        className={styles.item__link}
                      >
                        {stripArchiveURL(source)}
                      </a>
                    </div>
                    <div className={styles.item__timestamp}>
                      {err &&
                        !ts &&
                        (_.get(err, "status") === 404 ? (
                          <span className={styles.timestamp__delta___notfound}>
                            Not Archived
                          </span>
                        ) : (
                          <span className={styles.timestamp__delta___err}>
                            Failed to fetch Resource
                          </span>
                        ))}
                      {!err &&
                        (ts ? (
                          <span
                            className={cx({
                              [styles.timestamp__delta]: true,
                              [styles.timestamp__delta___plus]:
                                _.get(dt, "delta") >= 0,
                              [styles.timestamp__delta___minus]:
                                _.get(dt, "delta") < 0
                            })}
                          >
                            {_.get(dt, "text")}
                          </span>
                        ) : getDelta(isValid))}
                      <div className={styles.timestamp__value}>
                        {!err && ts && formatDateTimeTS(ts)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
        )}
      </div>
    </div>
  );
};

Drawer.propTypes = {
  dialogRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  onClose: PropTypes.func.isRequired,
  frame: PropTypes.any.isRequired,
  sources: PropTypes.array,
  isNavComplete: PropTypes.bool,
  selectedTS: PropTypes.number
};

Drawer.defaultProps = {
  sources: [],
  isNavComplete: false,
  selectedTS: null
};

const DrawerContainer = (props) => {
  const [visible, setVisible] = useState(false);
  const [isNavComplete, setNavComplete] = useState(false);
  const [sources, setSources] = useState([]);
  const [selectedTS, setSelectedTS] = useState(null);

  const messageListener = useEventCallback(
    (request) => {
      if (request.message === "__VANDAL__CLIENT__TOGGLEDRAWER") {
        setVisible(!visible);
      } else if (
        request.message === "__VANDAL__NAV__BEFORENAVIGATE" ||
        request.message === "__VANDAL__NAV__HISTORYCHANGE"
      ) {
        const frameURL = _.get(request.data, "url");
        if (isArchiveURL(frameURL)) {
          setSelectedTS(_.parseInt(_.get(getDateTsFromURL(frameURL), "ts")));
        } else {
          setSelectedTS(null);
        }
        setSources([]);
        setNavComplete(false);
      } else if (request.message === "__VANDAL__NAV__COMPLETE") {
        setSources([]);
        setNavComplete(true);
      } else if (request.message === "__VANDAL__FRAME__SOURCES") {
        setSources(request.data);
      } else if (request.message === "__VANDAL__CLIENT__NOSPARKLINEFOUND") {
        setNavComplete(true);
        setSelectedTS(null);
      }
    },
    [visible]
  );

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageListener);
  }, [messageListener]);

  return (
    <ShadowDOM
      include={[
        "chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/vandal.css"
      ]}
    >
      <div>
        {visible && (
          <Drawer
            frame={props.frame}
            sources={sources}
            isNavComplete={isNavComplete}
            selectedTS={selectedTS}
            onClose={() => setVisible(false)}
          />
        )}
      </div>
    </ShadowDOM>
  );
};

DrawerContainer.propTypes = {
  frame: PropTypes.any.isRequired
};

export default DrawerContainer;
