import React, {
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useState,
  memo
} from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import cx from "classnames";
import { useMachine } from "@xstate/react";

import { VerticalMenu, Switch, Icon } from "../common";
import { browser } from "../../utils";
import { TimetravelProvider, useTheme } from "../../hooks";
import { colors } from "../../constants";
import URL from "../url";
import TimeTravel from "../timetravel";
import Historical from "../historical";
import About from "./about";

import frameMachine from "./frame.machine";
import navigatorMachine from "./navigator.machine";

import styles from "./frame.module.css";

const options = [
  {
    value: "histView",
    text: "Historical View"
  },
  {
    value: "wayback",
    text: (
      <div className={styles.vertical__wayback__item}>
        <span>Wayback Machine</span>
        <Icon
          name="openURL"
          width={11}
          className={styles.vertical__wayback__icon}
        />
      </div>
    )
  }
];

const Frame = memo(({ onExit, ...props }) => {
  const [state, send, frameService] = useMachine(frameMachine);
  const { theme, setTheme } = useTheme();
  const [showAbout, toggleAbout] = useState(false);
  const verticalMenuRef = useRef(null);
  const [navState, sendToNav] = useMachine(
    navigatorMachine.withConfig(
      {
        actions: {
          reload: () => {
            browser.reload();
          },
          navigateToURL: (ctx) => {
            browser.navigate(ctx.currentURL);
          },
          navigateBack: () => {
            window.history.back();
          },
          navigateForward: () => {
            window.history.forward();
          }
        }
      },
      {
        ...navigatorMachine.context,
        url: props.url
      }
    )
  );

  const onHistoricalClose = useCallback(() => {
    send("TOGGLE_HISTORICAL_MODE");
  }, [send]);

  const navigateToURL = useCallback((url) => {
    browser.navigate(url);
  }, []);

  const clearHistory = useCallback(() => {
    sendToNav("CLEAR_HISTORY");
  }, [sendToNav]);

  const toggleTimeTravel = useCallback(() => {
    send("TOGGLE_TIMETRAVEL");
  }, [send]);

  const onThemeChange = useCallback((checked) => {
    setTheme(checked ? "dark" : "light");
  }, [setTheme]);

  const toggleDrawer = useCallback(() => {
    send("TOGGLE_RESOURCEL_DRAWER");
    chrome.runtime.sendMessage({
      message: "__VANDAL__CLIENT__TOGGLEDRAWER"
    });
  }, [send]);

  const onOptionSelect = useCallback((option) => {
    if (option === "wayback") {
      window.open(`https://web.archive.org/web/*/${props.url}`, "_blank");
    } else if (option === "exit") {
      onExit();
    } else if (option === "diffView") {
      send("TOGGLE_DIFF_MODE");
    } else if (option === "histView") {
      send("TOGGLE_HISTORICAL_MODE");
    } else if (option === "about") {
      toggleAbout(true);
    }
  }, [onExit, props.url, send]);

  useEffect(() => {
    const onMessage = (request) => {
      const frameURL = _.get(request.data, "url");

      switch (request.message) {
        case "__VANDAL__NAV__COMMIT":
          sendToNav("UPDATE_HISTORY_ONCOMMIT", {
            payload: {
              url: frameURL,
              type: _.get(request.data, "type")
            }
          });
          break;

        case "__VANDAL__NAV__BEFORENAVIGATE":
        case "__VANDAL__NAV__HISTORYCHANGE":
          sendToNav("UPDATE_HISTORY", {
            payload: {
              url: frameURL,
              type: _.get(request.data, "type")
            }
          });
          break;

        case "__VANDAL__FRAME__MOUSEDOWN":
          if (frameService.state.matches("idle.timetravel.open")) {
            frameService.send("TOGGLE_TIMETRAVEL");
          }
          if (verticalMenuRef.current) {
            verticalMenuRef.current.hideMenu();
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

  useEffect(
    () => {
      if (props.loaded) {
        send("LOAD_SPARKLINE", { payload: { url: props.url } });
      }
    },
    [props.loaded]
  );

  const selectTabIndex = useCallback((idx) => {
    send({
      type: "SET_SELECTED_TABINDEX",
      payload: { value: idx }
    });
  }, [send]);

  const menuItems = useMemo(
    () => [
      ...options,
      {
        value: "switchTheme",
        text: (
          <div>
            <Switch
              width={30}
              height={15}
              label="Dark Mode"
              defaultValue={theme === "dark"}
              checkedIcon={false}
              uncheckedIcon={false}
              onColor="#f7780b"
              className={styles.theme__switch}
              onChange={onThemeChange}
            />
          </div>
        ),
        hideOnSelect: false
      },
      {
        value: "about",
        text: "About"
      },
      {
        value: "exit",
        text: "Exit"
      }
    ],
    [theme, onThemeChange]
  );

  const disableBack = !navState.context.currentIndex;
  const disableForward = _.isEmpty(navState.context.currentRecords) ||
        navState.context.currentIndex === _.size(navState.context.currentRecords) - 1;

  return (
    <TimetravelProvider machine={state.context.timetravelRef}>
      <div className={styles.root}>
        <div className={styles.left}>
          <div className={styles.logo__container}>
            <img
              alt="logo"
              className={styles.logo}
              src={chrome.runtime.getURL("build/images/icon.png")}
            />
          </div>
          <div className={styles.navigation}>
            <button
              type="button"
              data-for="vandal-back"
              data-tip="Go back"
              className={styles.backward__nav__btn}
              disabled={disableBack && !navState.context.isForward}
              onClick={() => sendToNav("GO_BACK")}
            >
              <Icon name="leftNav" className={styles.backward__nav__icon} />
            </button>
            <button
              type="button"
              className={styles.forward__nav__btn}
              data-for="vandal-forward"
              data-tip="Go forward"
              disabled={disableForward && !navState.context.isBack}
              onClick={() => sendToNav("GO_FORWARD")}
            >
              <Icon name="rightNav" className={styles.forward__nav__icon} />
            </button>
          </div>
          <button
            type="button"
            className={styles.reload__btn}
            data-for="vandal-reload"
            data-tip="Reload"
          >
            <Icon
              name="reload"
              width={25}
              height={20}
              onClick={() => {
                sendToNav("RELOAD");
              }}
              className={styles.reload__icon}
            />
          </button>
        </div>
        <div className={styles.mid}>
          <URL
            history={_.get(navState, "context.allRecords")}
            showTimeTravel={state.matches("idle.timetravel.open")}
            url={props.url}
            clearHistory={clearHistory}
            toggleTimeTravel={toggleTimeTravel}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.right__action__container}>
            <button
              type="button"
              data-for="vandal-drawer"
              data-tip="Show Timestamps"
              className={cx({
                [styles.resource__btn]: true,
                [styles.resource__btn__active]: state.matches(
                  "idle.resourcedrawer.open"
                )
              })}
              onClick={toggleDrawer}
            >
              <Icon name="resource" className={styles.resource__icon} />
            </button>
            <ReactTooltip
              id="vandal-drawer"
              className={styles.tooltip}
              arrowColor={colors.BL}
              textColor={colors.WHITE}
              backgroundColor={colors.BL}
              effect="solid"
              place="bottom"
              type="dark"
              delayShow={1000}
              offset={{ bottom: 8, left: 0 }}
            />
          </div>
          <div className={styles.vertical_menu__container}>
            <VerticalMenu
              ref={verticalMenuRef}
              className={styles.vertical_menu}
              iconContainerClass={styles.vertical_menu__icon__container}
              iconClass={styles.vertical_menu__icon}
              listClass={styles.vertical_menu__list}
              listItemClass={styles.vertical_menu__list__item}
              options={menuItems}
              onSelect={onOptionSelect}
            />
            <div
              className={styles.donate__btn}
              data-for="vandal-donate"
              data-tip="Donate to Internet Archive"
            >
              <a href="https://archive.org/donate/?referrer=vandal" target="_blank" rel="noopener noreferrer">
                <Icon
                  name="heart"
                  className={styles.donate__icon}
                  width={20}
                  height={20}
                />
              </a>
            </div>
          </div>
        </div>
        {state.matches("idle.timetravel.open") && (
          <TimeTravel
            {...props}
            selectTabIndex={selectTabIndex}
            selectedTabIndex={_.get(state, "context.selectedTabIndex")}
          />
        )}
        {state.matches("idle.historical.open") && (
          <Historical
            url={props.url}
            onClose={onHistoricalClose}
            openURL={navigateToURL}
          />
        )}
        <ReactTooltip
          id="vandal-reload"
          className={styles.tooltip}
          arrowColor={colors.BL}
          textColor={colors.WHITE}
          backgroundColor={colors.BL}
          effect="solid"
          place="bottom"
          type="dark"
          delayShow={1000}
          offset={{ bottom: 6, left: 0 }}
        />
        {!disableForward && (
          <ReactTooltip
            id="vandal-forward"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 6, left: 0 }}
          />
        )}
        {!disableBack && (
          <ReactTooltip
            id="vandal-back"
            className={styles.tooltip}
            arrowColor={colors.BL}
            textColor={colors.WHITE}
            backgroundColor={colors.BL}
            effect="solid"
            place="bottom"
            type="dark"
            delayShow={1000}
            offset={{ bottom: 6, left: 0 }}
          />
        )}
        <ReactTooltip
          id="vandal-donate"
          className={styles.tooltip}
          arrowColor={colors.BL}
          textColor={colors.WHITE}
          backgroundColor={colors.BL}
          effect="solid"
          place="bottom"
          type="dark"
          delayShow={500}
          offset={{ bottom: 0, left: 0 }}
        />
        {showAbout && <About toggleAbout={toggleAbout} />}
      </div>
    </TimetravelProvider>
  );
});

Frame.propTypes = {
  url: PropTypes.string.isRequired,
  onExit: PropTypes.func.isRequired,
  loaded: PropTypes.bool
};

Frame.defaultProps = {
  loaded: false
};

export default Frame;
