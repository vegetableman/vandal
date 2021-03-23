import React, {
  useEffect, useState, memo, useCallback
} from "react";
import PropTypes from "prop-types";
import { useMachine } from "@xstate/react";
import {
  compareProps,
  getDateTimeFromTS,
  toTwelveHourTime
} from "../../utils";
import { Toast, Icon } from "../common";

import URLBox from "./box";
import URLHistory from "./history";
import URLInfo from "./info";
import { useTimeTravel } from "../../hooks";

import urlMachine from "./url.machine";

import styles from "./url.module.css";

const URL = memo(({ toggleTimeTravel, showTimeTravel, ...props }) => {
  const [state, send, service] = useMachine(urlMachine);
  const [isNoSnapError, setSnapError] = useState(false);
  const redirectedDateTime = props.redirectedTS && getDateTimeFromTS(props.redirectedTS);

  const onMouseDown = useCallback(() => {
    if (service.state.matches("menus.history.open")) {
      service.send("TOGGLE_HISTORY");
    } else if (service.state.matches("menus.info.open")) {
      service.send("TOGGLE_INFO");
    }
  }, [service]);

  const onToggleURLHistory = useCallback(() => {
    send("TOGGLE_HISTORY");
    if (showTimeTravel) {
      toggleTimeTravel();
    }
    if (service.state.matches("menus.info.open")) {
      send("TOGGLE_INFO");
    }
  }, [send, service, showTimeTravel, toggleTimeTravel]);

  const onToggleTimeTravel = useCallback(() => {
    toggleTimeTravel();
    if (service.state.matches("menus.history.open")) {
      send("TOGGLE_HISTORY");
    }
    if (service.state.matches("menus.info.open")) {
      send("TOGGLE_INFO");
    }
  }, [send, service, toggleTimeTravel]);

  const onToggleURLInfo = useCallback(() => {
    send("TOGGLE_INFO");
    if (service.state.matches("menus.history.open")) {
      send("TOGGLE_HISTORY");
    }
    if (showTimeTravel) {
      toggleTimeTravel();
    }
  }, [service, send, showTimeTravel, toggleTimeTravel]);

  const onInfoClose = useCallback(() => {
    send("TOGGLE_INFO");
  }, [send]);

  useEffect(() => {
    const onMessage = (request) => {
      if (request.message === "__VANDAL__FRAME__MOUSEDOWN") {
        onMouseDown();
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  useEffect(
    () => {
      if (isNoSnapError && !props.noSparklineFound) {
        setSnapError(false);
      } else if (props.noSparklineFound) {
        setSnapError(true);
      }
    },
    [props.noSparklineFound]
  );

  return (
    <>
      <URLBox
        url={props.url}
        redirectedTS={props.redirectedTS}
        sparklineLoaded={props.sparklineLoaded}
        selectedTS={props.selectedTS}
        showURLHistory={state.matches("menus.history.open")}
        showURLInfo={state.matches("menus.info.open")}
        showTimeTravel={showTimeTravel}
        toggleURLHistory={onToggleURLHistory}
        toggleTimeTravel={onToggleTimeTravel}
        toggleURLInfo={onToggleURLInfo}
      />
      {state.matches("menus.info.open") &&
        props.selectedTS && (
          <URLInfo
            url={props.url}
            selectedTS={props.selectedTS}
            redirectedTS={props.redirectedTS}
            redirectTSCollection={props.redirectTSCollection}
            onClose={onInfoClose}
          />
      )}
      {state.matches("menus.history.open") && (
        <URLHistory
          history={props.history}
          clearHistory={props.clearHistory}
          onSelect={onToggleURLHistory}
        />
      )}
      <Toast className={styles.toast__notfound} show={isNoSnapError} exit={0}>
        <div>
          <span>
            No snapshots found for this URL.
            <a
              rel="noreferrer"
              target="_blank"
              href="https://web.archive.org/save"
              className={styles.save__link}
            >
              <span>Save it to Archive</span>
              <Icon name="openURL" width={9} className={styles.save__icon} />
            </a>
          </span>
          <Icon
            name="close"
            className={styles.toast__close}
            onClick={() => {
              setSnapError(false);
            }}
          />
        </div>
      </Toast>
      <Toast
        className={styles.toast__redirect}
        closeTimeout={5000}
        show={redirectedDateTime && props.isRedirecting}
      >
        <div style={{ textAlign: "center", width: "100%" }}>
          <Icon className={styles.redirect__icon} name="redirect" width={11} />
          Redirected to
          {" "}
          <u>
            {toTwelveHourTime(
              _.get(redirectedDateTime, "time")
            )}
          </u>
          {" "}
          at
          {" "}
          <b>{_.get(redirectedDateTime, "humanizedDate")}</b>
        </div>
      </Toast>
    </>
  );
}, compareProps(["isRedirecting", "noSparklineFound", "isOverCapacity", "sparklineLoaded", "redirectedTS", "selectedTS", "redirectTSCollection", "url", "showTimeTravel", "history"]));

URL.propTypes = {
  isRedirecting: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
  toggleTimeTravel: PropTypes.func.isRequired,
  clearHistory: PropTypes.func.isRequired,
  showTimeTravel: PropTypes.bool,
  sparklineLoaded: PropTypes.bool,
  noSparklineFound: PropTypes.bool,
  selectedTS: PropTypes.number,
  redirectedTS: PropTypes.number,
  history: PropTypes.array,
  redirectTSCollection: PropTypes.object
};

URL.defaultProps = {
  showTimeTravel: false,
  sparklineLoaded: false,
  noSparklineFound: false,
  selectedTS: null,
  redirectedTS: null,
  history: [],
  redirectTSCollection: null
};

const URLContainer = memo((props) => {
  const {
    state: ttstate,
    state: { context: ctx }
  } = useTimeTravel();
  return (
    <URL
      {...props}
      noSparklineFound={ttstate.matches("noSparklineFound")}
      sparklineLoaded={ttstate.matches("sparklineLoaded")}
      isRedirecting={_.get(ttstate, "event.type") === "SET_REDIRECT_INFO"}
      redirectedTS={ctx.redirectedTS}
      isOverCapacity={ctx.isOverCapacity}
      redirectTSCollection={ctx.redirectTSCollection}
      selectedTS={ctx.selectedTS}
    />
  );
}, compareProps(["showTimeTravel", "url", "history"]));

export default URLContainer;
