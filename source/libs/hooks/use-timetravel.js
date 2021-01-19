import React, { useState, useEffect, createContext, useContext } from 'react';

import {
  getDateTsFromURL,
  isArchiveURL,
  stripArchiveURL,
  useRefCallback
} from '../utils';

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
    [machine]
  );

  let linkTS, isReset;
  const onMessage = (request) => {
    if (!timetravelMachineRef.current) return;
    const timetravelMachine = timetravelMachineRef.current;
    const { context: ctx } = timetravelMachine.state;
    const frameURL = _.get(request.data, 'url');
    const strippedOffURL = stripArchiveURL(frameURL);

    switch (request.message) {
      case '__VANDAL__NAV__BEFORENAVIGATE':
      case '__VANDAL__NAV__HISTORYCHANGE':
        if (!ctx.url) {
          return;
        }

        if (isArchiveURL(frameURL)) {
          linkTS = _.parseInt(_.get(getDateTsFromURL(frameURL), 'ts'));

          // Reset sparkline if url differs
          if (strippedOffURL !== ctx.url) {
            isReset = true;
            timetravelMachine.send('RESET_SPARKLINE', {
              payload: { url: strippedOffURL, ts: linkTS }
            });
          } else {
            timetravelMachine.send('GOTO__URL_TS', {
              payload: {
                ts: linkTS
              }
            });
          }
        } else {
          // Reset sparkline if url differs
          if (strippedOffURL !== ctx.url) {
            timetravelMachine.send('RESET_SPARKLINE', {
              payload: { url: strippedOffURL, ts: undefined }
            });
          }
          // Go to latest month/year
          else if (timetravelMachine.state.matches('sparklineLoaded')) {
            timetravelMachine.send('RESET_CALENDAR', {
              payload: { reset: strippedOffURL !== ctx.url }
            });
          }
        }
        break;
      case '__VANDAL__NAV__REDIRECTMISMATCH':
        break;
      case '__VANDAL__NAV__REDIRECT':
        break;
      case '__VANDAL__NAV__COMMIT':
        if (_.get(request, 'data.type') === 'redirect') {
          const redirectedTS = _.parseInt(
            _.get(getDateTsFromURL(frameURL), 'ts')
          );

          if (
            redirectedTS !== linkTS &&
            strippedOffURL === ctx.url &&
            _.indexOf(_.keys(ctx.redirectTSCollection), redirectedTS) < 0
          ) {
            timetravelMachine.send({
              type: 'SET_REDIRECT_INFO',
              payload: {
                redirectedTS,
                isReset
              }
            });
          }
        }
        break;
      case '__VANDAL__NAV__COMPLETE':
        break;
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
  }, []);

  const value = { state: ttState, send: machine.send };
  return (
    <TimetravelContext.Provider value={value}>
      {children}
    </TimetravelContext.Provider>
  );
};

function useTimeTravel() {
  const context = useContext(TimetravelContext);
  if (context === defaultValue) {
    throw new Error('useTimeTravel must be used within TimetravelProvider');
  }
  return context;
}
export { useTimeTravel, TimetravelProvider };
