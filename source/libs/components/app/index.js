import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import ShadowDOM from 'react-shadow';
import { useMachine } from '@xstate/react';

import Frame from '../frame';
import { Toast, Icon } from '../common';
import parentMachine from './parent.machine';
import { browser, dateDiffInDays } from '../../utils';
import { ThemeProvider } from '../../hooks';
import { appDB } from '../../utils/storage';

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
  const [showDonateModal, toggleDonateModal] = useState(false);
  const [isCommited, toggleCommit] = useState(false);

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
        toggleCommit(false);
        sendToParentMachine({ type: 'SET_URL', payload: { url } });
        browser.setURL(url);
        break;
      case '__VANDAL__NAV__COMMIT':
        console.log('__VANDAL__NAV__COMMIT:', url);
        toggleCommit(true);
        sendToParentMachine({ type: 'SET_URL', payload: { url } });
        browser.setURL(url);
        break;
      case '__VANDAL__NAV__BUSTED':
        if (ctx.url) {
          sendToParentMachine('TOGGLE_BUSTED_ERROR', {
            payload: { value: true }
          });
        }
        break;
      case '__VANDAL__NAV__NOTFOUND':
        console.log('not found', url);
        sendToParentMachine('CHECK_AVAILABILITY');
        break;
    }
  };

  // const checkValidity = () => {
  //   try {
  //     chrome.runtime.sendMessage(
  //       { message: '___VANDAL__CLIENT__CHECKVALID' },
  //       function(response) {
  //         if (!_.get(response, 'isValid')) {
  //           console.log('TOGGLE_INVALID_CONTEXT:1');
  //           sendToParentMachine('TOGGLE_INVALID_CONTEXT', {
  //             payload: { value: true }
  //           });
  //         }
  //       }
  //     );
  //   } catch (ex) {
  //     if (ex.message && ex.message.indexOf('invalidated') > -1) {
  //       console.log('TOGGLE_INVALID_CONTEXT:2');
  //       sendToParentMachine('TOGGLE_INVALID_CONTEXT', {
  //         payload: { value: true }
  //       });
  //     }
  //   }
  // };

  const checkDonate = async () => {
    const donateState = await appDB.getDonateState();
    const setDonateState = (__v) => {
      appDB.setDonateState({
        __v,
        date: new Date().toString()
      });
    };

    if (!_.get(donateState, 'date')) {
      setDonateState(1);
    } else if (
      (dateDiffInDays(new Date(_.get(donateState, 'date')), new Date()) > 5 &&
        _.get(donateState, '__v') === 1) ||
      (dateDiffInDays(new Date(_.get(donateState, 'date')), new Date()) > 30 &&
        _.get(donateState, '__v') === 2) ||
      (_.get(donateState, '__v') === 2 && new Date().getDate() === 1)
    ) {
      toggleDonateModal(true);
      setDonateState(2);
    }
  };

  useEffect(() => {
    browser.setBrowser(props.browser);
    browser.setBaseURL(props.baseURL);
    chrome.runtime.sendMessage({ message: '__VANDAL__CLIENT__LOADED' }, () => {
      sendToParentMachine('LOADED');
    });
    chrome.runtime.onMessage.addListener(onMessage);
    // document.addEventListener('visibilitychange', checkValidity);
    document.addEventListener('beforeunload', sendExit);
    checkDonate();
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
        className={styles.session_err__toast}
        show={ctx.isInvalidContext}
        exit={0}>
        <span>Found an Invalid Session. Please reload Vandal.</span>
      </Toast>
      <Toast
        err
        className={styles.frame_busted__toast}
        show={ctx.isFrameBusted}
        exit={0}>
        <span>
          Vandal does not support this page. Click here to open this URL on
          <a
            href={`https://web.archive.org/web/*/${props.url}`}
            target="_blank"
            className={styles.wayback__link}>
            Wayback Machine
          </a>
          <Icon name="openURL" width={11} className={styles.wayback__icon} />
        </span>
      </Toast>
      {/* <Toast
        err
        closeTimeout={8000}
        className={styles.frame_render_err__toast}
        show={ctx.isPageCached && !isCommited}>
        <span>Vandal is facing issues rendering this page.</span>
      </Toast> */}
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
      {showIntro && (
        <div
          className={styles.modal__container}
          onClick={() => {
            toggleIntro(false);
          }}>
          <img
            className={styles.cover}
            src={chrome.runtime.getURL('images/cover-art.png')}
          />
        </div>
      )}
      {showDonateModal && (
        <div className={styles.modal__container}>
          <div className={styles.donate__modal}>
            <Icon
              name="close"
              className={styles.donate__modal__close}
              onClick={() => {
                toggleDonateModal(false);
              }}
            />
            <img src={chrome.runtime.getURL('images/donate.png')} />
            <div className={styles.donate__text}>
              <div>
                <button
                  className={styles.donate__button}
                  onClick={() => {
                    window.open(
                      'https://archive.org/donate/?ref=vandal',
                      '_blank'
                    );
                  }}>
                  DONATE
                </button>
                <span
                  style={{ color: '#555555', fontSize: 14, fontWeight: 700 }}>
                  to the Internet Archive
                </span>
              </div>
              <p style={{ fontSize: 13, marginTop: 15, color: '#555555' }}>
                A Time Machine is only as good as its Power Source. And Vandal
                relies on the mighty{' '}
                <span style={{ color: '#864D23' }}>Internet Archive</span>. To
                allow it's continued existence, please donate to the Internet
                Archive.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppContainer = (props) => {
  const notifyThemeChanged = (ctx) => {
    props.root.setAttribute('data-theme', ctx.theme);
  };

  return (
    <ShadowDOM
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
    </ShadowDOM>
  );
};

export default AppContainer;