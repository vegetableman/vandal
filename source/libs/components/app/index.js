import React, { useEffect } from 'react';
import _ from 'lodash';
import ShadowDOM from 'react-shadow';
import { useMachine } from '@xstate/react';

import Frame from '../frame';
import { Toast, Icon } from '../common';
import parentMachine from './parent.machine';
import { browser } from '../../utils';
import { ThemeProvider } from '../../hooks';

// TODO: put this somewhere else?
import './normalize.css';
import './tooltip.css';
import './scrollbar.css';

import styles from './app.module.css';

const App = (props) => {
  const sendExit = () => {
    chrome.runtime.sendMessage({ message: '___VANDAL__CLIENT__EXIT' });
  };

  const notifyThemeChanged = (ctx) => {
    props.root.setAttribute('data-theme', ctx.theme);
  };

  const [state, sendToParentMachine] = useMachine(
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
  const { context: ctx } = state;

  const onMessage = async (request) => {
    const url = _.get(request.data, 'url');
    switch (request.message) {
      case '__VANDAL__NAV__BEFORENAVIGATE':
      case '__VANDAL__NAV__HISTORYCHANGE':
        sendToParentMachine({ type: 'SET_URL', value: url });
        break;
      case '__VANDAL__NAV__COMMIT':
        sendToParentMachine({ type: 'SET_URL', value: url });
        browser.setURL(url);
        break;
      case '__VANDAL__NAV__BUSTED':
        if (ctx.url) {
          sendToParentMachine('TOGGLE_BUSTED_ERROR', {
            payload: { value: true }
          });
        }
        break;
    }
  };

  const checkValidity = () => {
    try {
      chrome.runtime.sendMessage({ message: '___VANDAL__CLIENT__CHECKVALID' });
    } catch (ex) {
      if (ex.message && ex.message.indexOf('invalidated') > -1) {
        sendToParentMachine('TOGGLE_INVALID_CONTEXT', {
          payload: { value: true }
        });
      }
    }
  };

  useEffect(() => {
    browser.setBrowser(props.browser);
    browser.setBaseURL(props.baseURL);
    chrome.runtime.sendMessage({ message: '__VANDAL__CLIENT__LOADED' }, () => {
      sendToParentMachine('LOADED');
    });
    chrome.runtime.onMessage.addListener(onMessage);
    document.addEventListener('visibilitychange', checkValidity);
    document.addEventListener('beforeunload', sendExit);
    return () => {
      document.removeEventListener('beforeunload', sendExit);
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  return (
    <ShadowDOM
      include={[
        'chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/vandal.css'
      ]}>
      <div className="vandal__root vandal-root">
        <ThemeProvider notifyThemeChanged={notifyThemeChanged}>
          <div className={styles.container}>
            <Frame
              loaded={ctx.loaded}
              onExit={() => sendToParentMachine('EXIT')}
              url={ctx.url}
            />
            <Toast
              err
              className={styles.context__err}
              show={ctx.isInvalidContext}
              exit={0}>
              <span>Found an Invalid Session. Please reload Vandal.</span>
            </Toast>
            <Toast
              err
              className={styles.context__err}
              show={ctx.isFrameBusted}
              exit={0}>
              <span>
                Houston, we have a problem!. Click here to open this URL on
                <a
                  href={`https://web.archive.org/web/*/${props.url}`}
                  target="_blank"
                  className={styles.wayback__link}>
                  Wayback Machine
                </a>
                <Icon
                  name="openURL"
                  width={11}
                  className={styles.wayback__icon}
                />
              </span>
            </Toast>
          </div>
        </ThemeProvider>
      </div>
    </ShadowDOM>
  );
};

export default App;
