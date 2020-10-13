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
import { IntroProvider, useIntro } from '../../hooks/use-intro';

const App = (props) => {
  const sendExit = () => {
    chrome.runtime.sendMessage({ message: '___VANDAL__CLIENT__EXIT' });
  };

  const { showIntro, toggleIntro } = useIntro();

  const [state, sendToParentMachine] = useMachine(
    parentMachine.withConfig(
      {
        actions: {
          updateVandalURL: () => {
            browser.navigate(props.url);
          },
          notifyExit: () => {
            sendExit();
            window.location.reload();
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
        sendToParentMachine({ type: 'SET_URL', payload: { url } });
        break;
      case '__VANDAL__NAV__COMMIT':
        sendToParentMachine({ type: 'SET_URL', payload: { url } });
        browser.setURL(url);
        break;
      case '__VANDAL__NAV__BUSTED':
        if (ctx.url) {
          // sendToParentMachine('TOGGLE_BUSTED_ERROR', {
          //   payload: { value: true }
          // });
        }
        break;
      case '__VANDAL__NAV__NOTFOUND':
        console.log('not found', url);
        sendToParentMachine('CHECK_AVAILABILITY');
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
      <Toast
        className={styles.toast__notfound}
        show={state.matches('checkAvailability')}>
        <span>
          You have landed on a defunct page!. Checking availability...
              </span>
      </Toast>
      <Toast
        className={styles.toast__notfound}
        show={state.matches('snapshotFound')}>
        <div>
          <span>Found snapshot recorded on {ctx.availableDate}</span>
          <button
            className={styles.toast__open__btn}
            onClick={() => {
              browser.navigate(ctx.availableURL);
              sendToParentMachine('CLOSE');
            }}>
            View Snapshot
                </button>
          <Icon
            name="close"
            className={styles.toast__close__icon}
            onClick={() => {
              sendToParentMachine('CLOSE');
            }}
          />
        </div>
      </Toast>
      <Toast
        err
        className={styles.toast__notfound}
        show={state.matches('availabilityError')}>
        <div>
          <span>Error finding snapshot. Please try again later.</span>
          <Icon
            name="close"
            className={styles.toast__close__icon}
            onClick={() => {
              sendToParentMachine('CLOSE');
            }}
          />
        </div>
      </Toast>
      {showIntro && <div className={styles.modal__container} onClick={() => {
        toggleIntro(false);
      }}>
        <img className={styles.cover} src={chrome.runtime.getURL("images/cover-art.png")} />
      </div>}
    </div>

  );
};


const AppContainer = (props) => {
  const notifyThemeChanged = (ctx) => {
    props.root.setAttribute('data-theme', ctx.theme);
  };

  return (<ShadowDOM
    include={[
      'chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/vandal.css'
    ]}>
    <div className="vandal__root vandal-root">
      <ThemeProvider notifyThemeChanged={notifyThemeChanged}>
        <IntroProvider>
          <App {...props} />
        </IntroProvider>
      </ThemeProvider>
    </div>
  </ShadowDOM>)
}

export default AppContainer;
