import React, {
  useState, useEffect, createContext, useContext, useCallback, useRef
} from "react";
import PropTypes from "prop-types";
import { Machine } from "xstate";

import {
  getDateTsFromURL,
  isArchiveURL,
  stripArchiveURL,
  useRefCallback
} from "../utils";

const defaultValue = { state: { context: {} } };
const TimetravelContext = createContext(defaultValue);

const TimetravelProvider = ({ children, machine }) => {
  const [ttState, setTTState] = useState(machine.state);
  const [timetravelMachineRef, setTimeTravelMachineRef] = useRefCallback();

  useEffect(
    () => {
      machine.onTransition((state) => {
        if (state.changed) {
          setTTState(state);
        }
      });
      setTimeTravelMachineRef(machine);
    },
    [machine, setTimeTravelMachineRef]
  );

  const linkTS = useRef(undefined);
  const isReset = useRef(false);
  const onMessage = useCallback((request) => {
    if (!timetravelMachineRef.current) return;
    const timetravelMachine = timetravelMachineRef.current;
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
        } else if (timetravelMachine.state.matches("sparklineLoaded")) {
          // Go to latest month/year
          timetravelMachine.send("RESET_CALENDAR", {
            payload: { reset: strippedOffURL !== ctx.url }
          });
        }
        break;
      case "__VANDAL__NAV__REDIRECTMISMATCH":
        break;
      case "__VANDAL__NAV__REDIRECT":
        break;
      case "__VANDAL__NAV__COMMIT":
        if (_.get(request, "data.type") === "redirect") {
          const redirectedTS = _.parseInt(
            _.get(getDateTsFromURL(frameURL), "ts")
          );

          if (
            redirectedTS !== linkTS.current
            && strippedOffURL === ctx.url
            && _.indexOf(_.keys(ctx.redirectTSCollection), redirectedTS) < 0
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
      case "__VANDAL__NAV__COMPLETE":
        break;
      default:
        break;
    }
  }, [timetravelMachineRef]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
  }, [onMessage]);

  const value = { state: ttState, send: machine.send };
  return (
    <TimetravelContext.Provider value={value}>
      {children}
    </TimetravelContext.Provider>
  );
};

TimetravelProvider.propTypes = {
  children: PropTypes.element.isRequired,
  machine: PropTypes.instanceOf(Machine).isRequired
};

function useTimeTravel() {
  const context = useContext(TimetravelContext);
  if (context === defaultValue) {
    throw new Error("useTimeTravel must be used within TimetravelProvider");
  }
  return context;
}
export { useTimeTravel, TimetravelProvider };
