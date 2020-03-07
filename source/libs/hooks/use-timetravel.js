import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  memo
} from 'react';
import {
  getDateTsFromURL,
  isArchiveURL,
  stripArchiveURL,
  useRefCallback,
  compareProps
} from '../utils';

let transitionType;
const defaultValue = { state: { context: {} } };
const TimetravelContext = createContext(defaultValue);

const TimetravelProvider = ({ children, machine }) => {
  const [ttState, setTTState] = useState(machine.state);
  const [timetravelMachineRef, setTimeTravelMachineRef] = useRefCallback();

  useEffect(() => {
    // const isIdle = machine.state.matches('idle');
    // if (!isIdle) {
    machine.onTransition(state => {
      if (state.changed) {
        console.log('state changed:', state);
        setTTState(state);
      }
    });
    setTimeTravelMachineRef(machine);
    // }
  }, [machine]);

  let linkTS;
  const onMessage = request => {
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

        transitionType = _.get(request.data, 'type');

        if (isArchiveURL(frameURL)) {
          // const
          linkTS = _.parseInt(_.get(getDateTsFromURL(frameURL), 'ts'));

          // Reset calendar if url differs
          if (strippedOffURL !== ctx.url) {
            timetravelMachine.send('RESET__CALENDAR', {
              payload: { url: strippedOffURL, ts: linkTS }
            });
          } else {
            timetravelMachine.send('GOTO__LINK_TS', {
              payload: {
                value: linkTS
              }
            });
          }
        } else {
          // Reset calendar if url differs
          if (strippedOffURL !== ctx.url) {
            timetravelMachine.send('RESET__CALENDAR', {
              payload: { url: strippedOffURL }
            });
          } else if (timetravelMachine.state.matches('sparklineLoaded')) {
            timetravelMachine.send('RESET__TS');
          }
        }
        break;
      case '__VANDAL__NAV__REDIRECTMISMATCH':
        break;
      case '__VANDAL__NAV__COMMIT':
        if (_.get(request, 'data.type') === 'redirect') {
          const redirectedTS = _.parseInt(
            _.get(getDateTsFromURL(frameURL), 'ts')
          );

          console.log('redirectedTS:', redirectedTS, 'linkTS:', linkTS);

          console.log(
            'strippedOffURL:',
            strippedOffURL,
            'historyURL:',
            _.get(timetravelMachine, 'state.history.context.url')
          );

          if (
            !transitionType &&
            redirectedTS !== linkTS &&
            strippedOffURL === ctx.url &&
            _.indexOf(_.keys(ctx.redirectTSCollection), redirectedTS) < 0
          ) {
            const redirectTSCollection = ctx.redirectTSCollection || {};
            redirectTSCollection[redirectedTS] = ctx.selectedTS;
            timetravelMachine.send({
              type: 'SET_REDIRECT_INFO',
              payload: {
                redirectedTS: redirectedTS,
                redirectTSCollection: redirectTSCollection
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

  console.log('root state:', ttState.value, ttState);
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
