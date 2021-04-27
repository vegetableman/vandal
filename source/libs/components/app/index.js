import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import ShadowDOM from "react-shadow";
import { useMachine } from "@xstate/react";

import { Toast, Icon } from "../common";
import {
  navigator, dateDiffInDays, trackDonate, trackUsage
} from "../../utils";
import { ThemeProvider } from "../../hooks";
import { appDB } from "../../utils/storage";

import Frame from "../frame";
import parentMachine from "./parent.machine";

// TODO: put this somewhere else?
import "./normalize.css";
import "./tooltip.css";
import "./scrollbar.css";

import styles from "./app.module.css";
import { IntroProvider, useIntro } from "../../hooks/use-intro";

const sendExit = () => {
  browser.runtime.sendMessage({ message: "___VANDAL__CLIENT__EXIT" });
};

const App = (props) => {
  const { showIntro, toggleIntro } = useIntro();
  const [state, sendToParentMachine] = useMachine(
    parentMachine.withConfig(
      {
        actions: {
          navigateToURL: () => {
            navigator.navigate(props.url);
          },
          notifyExit: () => {
            sendExit();
            window.location.reload();
          },
        },
      },
      {
        url: props.url,
        loaded: false
      }
    )
  );
  const { context: ctx } = state;

  const [showDonateModal, toggleDonateModal] = useState(false);
  const checkDonate = async () => {
    const donateState = await appDB.getDonateState();
    const setDonateState = (__v) => {
      appDB.setDonateState({
        __v,
        date: new Date().toString(),
      });
    };

    if (!_.get(donateState, "date")) {
      setDonateState(1);
    } else if (
      // show donate modal after 5 days of usage, every 30 days and first of month
      (dateDiffInDays(new Date(_.get(donateState, "date")), new Date()) > 5 &&
      _.get(donateState, "__v") === 1) ||
      (dateDiffInDays(new Date(_.get(donateState, "date")), new Date()) > 30 &&
        _.get(donateState, "__v") === 2) ||
      (_.get(donateState, "__v") === 2 && new Date().getDate() === 1 &&
      dateDiffInDays(new Date(_.get(donateState, "date")), new Date()) !== 0)
    ) {
      toggleDonateModal(true);
      setDonateState(2);
    }
  };

  const onExit = useCallback(() => {
    sendToParentMachine("EXIT");
  }, [sendToParentMachine]);

  useEffect(() => {
    navigator.setNavigator(props.navigator);
    navigator.setBaseURL(props.baseURL);
    browser.runtime.sendMessage({ message: "__VANDAL__CLIENT__LOADED" }).then(() => {
      sendToParentMachine("LOADED");
    });
    const onMessage = (request) => {
      const url = _.get(request.data, "url");
      switch (request.message) {
        case "__VANDAL__NAV__BEFORENAVIGATE":
        case "__VANDAL__NAV__HISTORYCHANGE":
        case "__VANDAL__NAV__COMMIT":
          sendToParentMachine({ type: "SET_URL", payload: { url } });
          navigator.setURL(url);
          break;
        case "__VANDAL__NAV__BUSTED":
          if (ctx.url) {
            sendToParentMachine("TOGGLE_BUSTED_ERROR", {
              payload: { value: true },
            });
          }
          break;
        case "__VANDAL__NAV__NOTFOUND":
          sendToParentMachine("CHECK_AVAILABILITY");
          break;
        default:
          break;
      }
    };
    browser.runtime.onMessage.addListener(onMessage);
    document.addEventListener("beforeunload", sendExit);
    checkDonate();
    trackUsage();
    return () => {
      document.removeEventListener("beforeunload", sendExit);
      browser.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Frame
        loaded={ctx.loaded}
        onExit={onExit}
        url={ctx.url}
      />
      <Toast
        err
        className={styles.frame_busted__toast}
        show={ctx.isFrameBusted}
        exit={0}
      >
        <span>
          Vandal does not support this page. Click here to open this URL on
          <a
            href={`https://web.archive.org/web/*/${props.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.wayback__link}
          >
            Wayback Machine
          </a>
          <Icon name="openURL" width={11} className={styles.wayback__link_icon} />
        </span>
      </Toast>
      <Toast
        className={styles.toast__notfound}
        show={state.matches("checkAvailability")}
      >
        <span>
          You have landed on a defunct page!. Checking availability...
        </span>
      </Toast>
      <Toast
        className={styles.toast__notfound}
        show={state.matches("snapshotFound")}
      >
        <div>
          <span>
            Found snapshot recorded on&nbsp;
            {ctx.availableDate}
          </span>
          <button
            type="button"
            className={styles.toast__open__btn}
            onClick={() => {
              navigator.navigate(ctx.availableURL);
              sendToParentMachine("CLOSE");
            }}
          >
            View Snapshot
          </button>
          <Icon
            name="close"
            className={styles.toast__close__icon}
            onClick={() => {
              sendToParentMachine("CLOSE");
            }}
          />
        </div>
      </Toast>
      <Toast
        err
        className={styles.toast__notfound}
        show={state.matches("availabilityError")}
      >
        <div>
          <span>Error finding snapshot. Please try again later.</span>
          <Icon
            name="close"
            className={styles.toast__close__icon}
            onClick={() => {
              sendToParentMachine("CLOSE");
            }}
          />
        </div>
      </Toast>
      <Toast
        err
        className={styles.toast__notfound}
        show={state.matches("snapshotNotFound")}
      >
        <div>
          <span>No snapshots found for this URL.</span>
          <Icon
            name="close"
            className={styles.toast__close__icon}
            onClick={() => {
              sendToParentMachine("CLOSE");
            }}
          />
        </div>
      </Toast>
      {showIntro && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          role="dialog"
          className={styles.modal__container}
          onClick={() => {
            toggleIntro(false);
          }}
        >
          <img
            alt="cover"
            className={styles.cover}
            src={browser.runtime.getURL("build/images/cover-art.png")}
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
            <img
              alt="donate"
              src={browser.runtime.getURL("build/images/donate.png")}
            />
            <div className={styles.donate__text}>
              <div>
                <button
                  type="button"
                  className={styles.donate__button}
                  onClick={() => {
                    window.open(
                      "https://archive.org/donate/?referer=vandal",
                      "_blank"
                    );
                    trackDonate();
                  }}
                >
                  DONATE
                </button>
                <span
                  style={{ color: "#555", fontSize: 14, fontWeight: 600 }}
                >
                  to the Internet Archive
                </span>
              </div>
              <p style={{ fontSize: 13, marginTop: 15, color: "#555" }}>
                <span>
                  A Time Machine is only as good as its Power Source. And Vandal
                  relies on the mighty
                </span>
                {" "}
                <span style={{ color: "#864d23" }}>Internet Archive</span>
                . To
                allow it&apos;s continued existence, please donate to the
                Internet Archive.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

App.propTypes = {
  url: PropTypes.string.isRequired,
  baseURL: PropTypes.string.isRequired,
  navigator: PropTypes.any.isRequired,
};

const AppContainer = (props) => {
  const notifyThemeChanged = useCallback((ctx) => {
    props.root.setAttribute("data-theme", ctx.theme);
  }, [props.root]);

  return (
    <ShadowDOM
      include={[
        `chrome-extension://${browser.runtime.id}/build/vandal.css`,
      ]}
    >
      <div className="vandal__root">
        <ThemeProvider notifyThemeChanged={notifyThemeChanged}>
          <IntroProvider>
            <App {...props} />
          </IntroProvider>
        </ThemeProvider>
      </div>
    </ShadowDOM>
  );
};

AppContainer.propTypes = {
  root: PropTypes.any.isRequired,
};

export default AppContainer;
