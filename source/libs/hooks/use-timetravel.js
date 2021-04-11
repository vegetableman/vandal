import React, {
  useState, useEffect, createContext, useContext, useRef
} from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import {
  getDateTsFromURL,
  isArchiveURL,
  stripArchiveURL
} from "../utils";

const defaultValue = { state: { context: {} } };
const TimetravelContext = createContext(defaultValue);

const TimetravelProvider = ({ children, machine: timetravelMachine, onNavigate }) => {
  const [ttState, setTTState] = useState(timetravelMachine.state);
  const linkTS = useRef(undefined);
  const isReset = useRef(false);

  useEffect(() => {
    timetravelMachine.onTransition((state) => {
      // Send all archive navigations
      if (_.findIndex(_.get(state, "actions"), ["type", "navigateToURL"]) > -1) {
        const ctx = _.get(state, "context");
        onNavigate(`https://web.archive.org/web/${_.get(ctx, "selectedTS")}/${_.get(ctx, "url")}`);
      }
      if (state.changed) {
        setTTState(state);
      }
    });
    const onMessage = (request) => {
      const { context: ctx } = timetravelMachine.state;
      const frameURL = _.get(request.data, "url");
      const strippedOffURL = stripArchiveURL(frameURL);

      switch (request.message) {
        case "__VANDAL__NAV__BEFORENAVIGATE":
        case "__VANDAL__NAV__HISTORYCHANGE":
          if (!ctx.url) {
            return;
          }

          if (isArchiveURL(frameURL)) {
            linkTS.current = _.parseInt(_.get(getDateTsFromURL(frameURL), "ts"), 10);

            // Reset sparkline if url differs
            if (strippedOffURL !== ctx.url) {
              isReset.current = true;
              timetravelMachine.send("RESET_SPARKLINE", {
                payload: { url: strippedOffURL, ts: linkTS.current }
              });
            } else {
              timetravelMachine.send("GOTO__URL_TS", {
                payload: {
                  ts: linkTS.current
                }
              });
            }
          } else if (strippedOffURL !== ctx.url) {
            // Reset sparkline if url differs
            timetravelMachine.send("RESET_SPARKLINE", {
              payload: { url: strippedOffURL, ts: undefined }
            });
          } else if (timetravelMachine.state.matches("sparklineLoaded") && !_.isNull(_.get(ctx, "calendar"))) {
            // Go to latest month/year
            timetravelMachine.send("RESET_CALENDAR", {
              payload: { reset: strippedOffURL !== ctx.url }
            });
          } else {
            timetravelMachine.send("RESET_TS", {
              payload: { ts: undefined }
            });
          }
          break;
        case "__VANDAL__NAV__COMMIT":
          if (_.get(request, "data.type") === "redirect") {
            const redirectedTS = _.parseInt(
              _.get(getDateTsFromURL(frameURL), "ts")
            );

            if (
              redirectedTS !== linkTS.current &&
              strippedOffURL === ctx.url &&
              _.indexOf(_.keys(ctx.redirectTSCollection), redirectedTS) < 0
            ) {
              timetravelMachine.send({
                type: "SET_REDIRECT_INFO",
                payload: {
                  redirectedTS,
                  isReset: isReset.current
                }
              });
            }
          }
          break;
        default:
          break;
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  const value = { state: ttState, send: timetravelMachine.send };
  return (
    <TimetravelContext.Provider value={value}>
      {children}
    </TimetravelContext.Provider>
  );
};

TimetravelProvider.propTypes = {
  children: PropTypes.element.isRequired,
  machine: PropTypes.any.isRequired
};

function useTimeTravel() {
  const context = useContext(TimetravelContext);
  if (context === defaultValue) {
    throw new Error("useTimeTravel must be used within TimetravelProvider");
  }
  return context;
}
export { useTimeTravel, TimetravelProvider };
