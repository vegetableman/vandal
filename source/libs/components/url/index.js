import React, { useEffect, useState, memo } from 'react';
import { useMachine } from '@xstate/react';

import URLBox from './box';
import URLHistory from './history';
import URLInfo from './info';
import urlMachine from './url.machine';
import { useTimeTravel } from '../../hooks';
import { compareProps, useEventCallback } from '../../utils';
import { Toast, Icon } from '../common';
import styles from './url.module.css';

const URL = memo(props => {
  const [state, send, service] = useMachine(urlMachine);
  const showURLInfo = state.matches('menus.info.open');
  const showURLHistory = state.matches('menus.history.open');
  const [isNoSnapErorr, setSnapError] = useState(false);

  const onMessage = useEventCallback(
    request => {
      if (request.message === '__VANDAL__FRAME__MOUSEDOWN') {
        if (service.state.matches('menus.history.open')) {
          send('TOGGLE_HISTORY');
        } else if (service.state.matches('menus.info.open')) {
          send('TOGGLE_INFO');
        }
      }
    },
    [state.value]
  );

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
  }, []);

  useEffect(() => {
    if (props.noSparklineFound) {
      setSnapError(true);
    } else if (isNoSnapErorr && !props.noSparklineFound) {
      setSnapError(false);
    }
  }, [props.noSparklineFound]);

  console.log(
    'rsxxxx---',
    _.get(props.redirectTSCollection, props.redirectedTS) === props.selectedTS,
    'isLoadingCalendar:',
    props.isLoadingCalendar
  );

  return (
    <React.Fragment>
      <URLBox
        url={props.url}
        redirectedTS={props.redirectedTS}
        redirectTSCollection={props.redirectTSCollection}
        selectedTS={props.selectedTS}
        showURLHistory={showURLHistory}
        showURLInfo={showURLInfo}
        showTimeTravel={props.showTimeTravel}
        toggleURLHistory={() => {
          send('TOGGLE_HISTORY');
          if (props.showTimeTravel) {
            props.toggleTimeTravel();
          }
        }}
        toggleURLInfo={() => send('TOGGLE_INFO')}
        toggleTimeTravel={() => {
          props.toggleTimeTravel();
          if (service.state.matches('menus.history.open')) {
            send('TOGGLE_HISTORY');
          }
        }}
      />
      {showURLInfo && (
        <URLInfo
          url={props.url}
          selectedTS={props.selectedTS}
          redirectedTS={props.redirectedTS}
          redirectTSCollection={props.redirectTSCollection}
          onClose={() => send('TOGGLE_INFO')}
        />
      )}
      {showURLHistory && (
        <URLHistory
          currentIndex={props.currentIndex}
          history={props.history}
          clearHistory={props.clearHistory}
        />
      )}
      <Toast className={styles.toast__notfound} show={isNoSnapErorr} exit={0}>
        <div>
          <span>
            No snapshots found for this url. Click on Save to create one.
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
        closeTimeout={2000}
        show={
          _.get(props.redirectTSCollection, props.redirectedTS) ===
            props.selectedTS && props.isLoadingCalendar
        }>
        <div style={{ textAlign: 'center', width: '100%' }}>Redirecting...</div>
      </Toast>
    </React.Fragment>
  );
}, compareProps(['isRedirect', 'isLoadingCalendar', 'noSparklineFound', 'redirectedTS', 'selectedTS', 'redirectTSCollection', 'url', 'showTimeTravel', 'currentIndex', 'history']));

const URLContainer = props => {
  const {
    state: ttstate,
    state: { context: ctx }
  } = useTimeTravel();

  return (
    <URL
      {...props}
      isRedirect={ctx.isRedirect}
      isLoadingCalendar={ttstate.matches('sparklineLoaded.loadingCalendar')}
      noSparklineFound={ttstate.matches('noSparklineFound')}
      redirectedTS={ctx.redirectedTS}
      redirectTSCollection={ctx.redirectTSCollection}
      selectedTS={ctx.selectedTS}
    />
  );
};

export default URLContainer;
