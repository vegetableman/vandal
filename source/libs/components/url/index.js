import React, { useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import { useMachine } from "@xstate/react";
import {
  compareProps,
  getDateTimeFromTS,
  toTwelveHourTime,
  useEventCallback
} from "../../utils";
import { Toast, Icon } from "../common";

import URLBox from "./box";
import URLHistory from "./history";
import URLInfo from "./info";
import { useTimeTravel } from "../../hooks";

import urlMachine from "./url.machine";

import styles from "./url.module.css";

const URL = memo((props) => {
  const [state, send, service] = useMachine(urlMachine);
  const showURLInfo = state.matches("menus.info.open");
  const showURLHistory = state.matches("menus.history.open");
  const [isNoSnapError, setSnapError] = useState(false);
  const redirectedDateTime = props.redirectedTS && getDateTimeFromTS(props.redirectedTS);

  const onMessage = useEventCallback(
    (request) => {
      if (request.message === "__VANDAL__FRAME__MOUSEDOWN") {
        if (service.state.matches("menus.history.open")) {
          send("TOGGLE_HISTORY");
        } else if (service.state.matches("menus.info.open")) {
          send("TOGGLE_INFO");
        }
      }
    },
    [state.value]
  );

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
  }, []);

  useEffect(
    () => {
      if (isNoSnapError && (!props.noSparklineFound || props.isSaving)) {
        setSnapError(false);
      } else if (props.noSparklineFound) {
        setSnapError(true);
      }
    },
    [props.noSparklineFound, props.isSaving]
  );

  return (
    <>
      <URLBox
        url={props.url}
        redirectedTS={props.redirectedTS}
        redirectTSCollection={props.redirectTSCollection}
        sparklineLoaded={props.sparklineLoaded}
        selectedTS={props.selectedTS}
        showURLHistory={showURLHistory}
        showURLInfo={showURLInfo}
        showTimeTravel={props.showTimeTravel}
        toggleURLHistory={() => {
          send("TOGGLE_HISTORY");
          if (props.showTimeTravel) {
            props.toggleTimeTravel();
          }
          if (service.state.matches("menus.info.open")) {
            send("TOGGLE_INFO");
          }
        }}
        toggleURLInfo={() => {
          send("TOGGLE_INFO");
          if (service.state.matches("menus.history.open")) {
            send("TOGGLE_HISTORY");
          }
        }}
        toggleTimeTravel={() => {
          props.toggleTimeTravel();
          if (service.state.matches("menus.history.open")) {
            send("TOGGLE_HISTORY");
          }
        }}
      />
      {showURLInfo &&
        props.selectedTS && (
          <URLInfo
            url={props.url}
            selectedTS={props.selectedTS}
            redirectedTS={props.redirectedTS}
            redirectTSCollection={props.redirectTSCollection}
            onClose={() => send("TOGGLE_INFO")}
          />
      )}
      {showURLHistory && (
        <URLHistory
          history={props.history}
          clearHistory={props.clearHistory}
          onSelect={() => {
            send("TOGGLE_HISTORY");
          }}
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
          Redirecting to
          {" "}
          <u>
            {toTwelveHourTime(
              _.toString(_.get(redirectedDateTime, "ts")).substr(-6)
            )}
          </u>
          {" "}
          at
          {" "}
          {_.get(redirectedDateTime, "humanizedDate")}
        </div>
      </Toast>
    </>
  );
}, compareProps(["isRedirecting", "noSparklineFound", "isOverCapacity", "sparklineLoaded", "redirectedTS", "selectedTS", "redirectTSCollection", "url", "showTimeTravel", "history", "isSaving"]));

URL.propTypes = {
  isRedirecting: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
  toggleTimeTravel: PropTypes.func.isRequired,
  clearHistory: PropTypes.func.isRequired,
  showTimeTravel: PropTypes.bool,
  sparklineLoaded: PropTypes.bool,
  noSparklineFound: PropTypes.bool,
  selectedTS: PropTypes.string,
  redirectedTS: PropTypes.string,
  isSaving: PropTypes.bool,
  history: PropTypes.array,
  redirectTSCollection: PropTypes.any
};

URL.defaultProps = {
  showTimeTravel: false,
  sparklineLoaded: false,
  noSparklineFound: false,
  isSaving: false,
  selectedTS: null,
  redirectedTS: null,
  history: [],
  redirectTSCollection: []
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
      isSaving={props.isSaving}
    />
  );
}, compareProps(["showTimeTravel", "url", "history", "isSaving"]));

URLContainer.propTypes = {
  isSaving: PropTypes.bool
};

URLContainer.defaultProps = {
  isSaving: false
};

export default URLContainer;
