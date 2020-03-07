import React, { useEffect } from 'react';
import _ from 'lodash';
import ShadowDOM from 'react-shadow';
import { useMachine } from '@xstate/react';

import Frame from '../frame';
import { Toast } from '../common';
import parentMachine from './parent.machine';
import { browser } from '../../utils';

// TODO: put this somewhere else?
import './normalize.css';
import './tooltip.css';

import styles from './app.module.css';
import { ThemeProvider } from '../../hooks';

const App = props => {
  const sendExit = () => {
    chrome.runtime.sendMessage({ message: '___VANDAL__CLIENT__EXIT' });
  };

  const notifyThemeChanged = ctx => {
    props.root.setAttribute('data-theme', ctx.theme);
  };

  const [state, send] = useMachine(
    parentMachine.withConfig(
      {
        actions: {
          updateVandalURL: () => {
            browser.navigate(props.url);
          },
          notifyExit: () => {
            sendExit();
            window.location.href = props.url;
          }
        }
      },
      {
        url: props.url,
        loaded: false
      }
    )
  );

  const onMessage = async request => {
    const url = _.get(request.data, 'url');
    switch (request.message) {
      case '__VANDAL__NAV__BEFORENAVIGATE':
        send({ type: 'SET_URL', value: url });
        break;
      case '__VANDAL__NAV__HISTORYCHANGE':
        send({ type: 'SET_URL', value: url });
        break;
      case '__VANDAL__NAV__COMMIT':
        send({ type: 'SET_URL', value: url });
        browser.setURL(url);
        break;
    }
  };

  const checkValidity = () => {
    try {
      chrome.runtime.sendMessage({ message: '___VANDAL__CLIENT__CHECKVALID' });
    } catch (ex) {
      if (ex.message && ex.message.indexOf('invalidated') > -1) {
        send('TOGGLE_INVALID_CONTEXT', { payload: { value: true } });
      }
    }
  };

  useEffect(() => {
    browser.setBrowser(props.browser);
    browser.setBaseURL(props.baseURL);
    chrome.runtime.sendMessage({ message: '__VANDAL__CLIENT__LOADED' }, () => {
      send('LOADED');
    });
    chrome.runtime.onMessage.addListener(onMessage);
    document.addEventListener('visibilitychange', checkValidity);
    document.addEventListener('beforeunload', sendExit);
    return () => {
      document.removeEventListener('beforeunload', sendExit);
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  const { context: ctx } = state;

  return (
    <ShadowDOM
      include={[
        'chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/vandal.css'
      ]}>
      <div className="vandal__root">
        <ThemeProvider notifyThemeChanged={notifyThemeChanged}>
          <div className={styles.container}>
            <Frame
              loaded={ctx.loaded}
              onExit={() => send('EXIT')}
              url={ctx.url}
            />
            <Toast
              err
              className={styles.context__err}
              show={ctx.isInvalidContext}
              exit={0}>
              <span>
                Found an invalid session. Please reload this extension.
              </span>
            </Toast>
          </div>
        </ThemeProvider>
      </div>
    </ShadowDOM>
  );
};

export default App;
