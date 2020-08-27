import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import ReactTooltip from 'react-tooltip';
import cx from 'classnames';
import { useMachine } from '@xstate/react';

import { VerticalMenu, Switch, Icon, Toast } from '../common';
import URL from '../url';
import TimeTravel from '../timetravel';
import Historical from '../historical';

import frameMachine from './frame.machine';
import saveMachine from './save.machine';
import navigatorMachine from './navigator.machine';

import { browser } from '../../utils';
import { TimetravelProvider, useTheme } from '../../hooks';
import { colors } from '../../constants';

import styles from './frame.module.css';

const options = [
  {
    value: 'histView',
    text: 'Historical View'
  },
  {
    value: 'wayback',
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
  },
  {
    value: 'changeView',
    text: (
      <div className={styles.vertical__wayback__item}>
        <span>Changes</span>
        <Icon
          name="openURL"
          width={11}
          className={styles.vertical__wayback__icon}
        />
      </div>
    )
  }
];

const Frame = (props) => {
  const { frameu, tempUrl, history, ...others } = props;
  const [state, send, frameService] = useMachine(frameMachine);
  const { theme, setTheme } = useTheme();
  const verticalMenuRef = useRef(null);

  const onOptionSelect = (option) => {
    if (option === 'wayback') {
      window.open(`https://web.archive.org/web/*/${props.url}`, '_blank');
    } else if (option === 'exit') {
      props.onExit();
    } else if (option === 'diffView') {
      send('TOGGLE_DIFF_MODE');
    } else if (option === 'histView') {
      send('TOGGLE_HISTORICAL_MODE');
    }
  };

  const [saveState, sendtoSaveMachine] = useMachine(
    saveMachine.withConfig({
      actions: {
        setBrowserURL: (ctx) => {
          browser.navigate(ctx.savedArchiveURL);
        },
        reloadSparkline: () => {
          send('LOAD_SPARKLINE', { payload: { url: props.url, force: true } });
        }
      }
    })
  );

  // const onSave = () => {
  //   sendtoSaveMachine({ type: 'SAVE', payload: { url: props.url } });
  // };
  // const debouncedSave = _.debounce(onSave, 250);

  const [navState, sendToNav] = useMachine(
    navigatorMachine.withConfig(
      {
        actions: {
          updateVandalURL: (ctx) => {
            browser.navigate(ctx.currentURL);
          }
        }
      },
      {
        ...navigatorMachine.context,
        url: props.url
      }
    )
  );

  const onReload = () => {
    browser.reload();
  };

  useEffect(
    () => {
      if (props.loaded) {
        console.log('load_sparkline:', props.url);
        send('LOAD_SPARKLINE', { payload: { url: props.url } });
      }
    },
    [props.loaded]
  );

  const onMessage = (request) => {
    const frameURL = _.get(request.data, 'url');

    switch (request.message) {
      case '__VANDAL__NAV__COMMIT':
      case '__VANDAL__NAV__HISTORYCHANGE':
        sendToNav('UPDATE_HISTORY', {
          payload: {
            url: frameURL
          }
        });
        break;

      case '__VANDAL__FRAME__MOUSEDOWN':
        if (frameService.state.matches('idle.timetravel.open')) {
          send('TOGGLE_TIMETRAVEL');
        }
        if (verticalMenuRef.current) {
          verticalMenuRef.current.hideMenu();
        }
        break;
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
  }, []);

  const allRecords = useMemo(
    () => _.get(navState, 'context.allRecords'),
    [_.join(_.get(navState, 'context.allRecords', []), ',')],
    [_.get(navState, 'context.allRecords')]
  );

  const selectTabIndex = useCallback((idx) => {
    send({
      type: 'SET_SELECTED_TABINDEX',
      payload: { value: idx }
    });
  });

  const menuItems = useMemo(
    () => {
      return [
        ...options,
        {
          value: 'switchTheme',
          text: (
            <div>
              <Switch
                width={30}
                height={15}
                label="Dark Theme"
                defaultValue={theme === 'dark'}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor="#f7780b"
                className={styles.theme__switch}
                onChange={(checked) => {
                  setTheme(checked ? 'dark' : 'light');
                }}
              />
            </div>
          ),
          hideOnSelect: false
        },
        {
          value: 'exit',
          text: 'Exit'
        }
      ];
    },
    [options, theme]
  );

  console.log('frame state:', state, allRecords);

  const disableBack =
    _.indexOf(navState.context.currentRecords, navState.context.currentURL) <=
    0;

  const disableForward =
    _.indexOf(navState.context.currentRecords, navState.context.currentURL) ===
      -1 ||
    _.lastIndexOf(
      navState.context.currentRecords,
      navState.context.currentURL
    ) ===
      _.size(navState.context.currentRecords) - 1;

  console.log('frame:render');

  return (
    <TimetravelProvider machine={state.context.timetravelRef}>
      <div className={styles.root}>
        <div className={styles.left}>
          <div className={styles.navigation}>
            <button
              data-for="vandal-back"
              data-tip="Go back"
              className={styles.backward__nav__btn}
              disabled={disableBack}
              onClick={() => sendToNav('GO_BACK')}>
              <Icon name="leftNav" className={styles.backward__nav__icon} />
            </button>
            <button
              className={styles.forward__nav__btn}
              data-for="vandal-forward"
              data-tip="Go forward"
              disabled={disableForward}
              onClick={() => sendToNav('GO_FORWARD')}>
              <Icon name="rightNav" className={styles.forward__nav__icon} />
            </button>
          </div>
          <button
            className={styles.reload__btn}
            data-for="vandal-reload"
            data-tip="Reload">
            <Icon
              name="reload"
              width={25}
              height={25}
              onClick={onReload}
              className={styles.reload__icon}
            />
          </button>
        </div>
        <div className={styles.mid}>
          <URL
            history={allRecords}
            showTimeTravel={state.matches('idle.timetravel.open')}
            url={props.url}
            clearHistory={() => {
              sendToNav('CLEAR_HISTORY');
            }}
            isSaving={saveState.matches('open.loading')}
            toggleTimeTravel={() => send('TOGGLE_TIMETRAVEL')}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.right__action__container}>
            {/* <button
              data-for="vandal-save"
              data-tip="Save Page to Archive"
              className={cx({
                [styles.save__btn]: true,
                [styles.save__btn__disabled]: saveState.matches('open.loading')
              })}
              onClick={() => {
                window.open('https://web.archive.org/save', '_blank');
              }}>
              <Icon name="save" className={styles.save__btn__icon} />
            </button> */}
            <button
              data-for="vandal-drawer"
              data-tip="Show Timestamps"
              className={cx({
                [styles.resource__btn]: true
              })}
              onClick={() => {
                chrome.runtime.sendMessage({
                  message: '__VANDAL__CLIENT__TOGGLEDRAWER'
                });
              }}>
              <Icon name="resource" className={styles.resource__icon} />
            </button>
            <ReactTooltip
              id="vandal-save"
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
          <div className={styles.vertical__menu__container}>
            <VerticalMenu
              ref={verticalMenuRef}
              className={styles.vertical__menu}
              iconContainerClass={styles.vertical__menu__icon__container}
              iconClass={styles.vertical__menu__icon}
              listClass={styles.vertical__menu__list}
              listItemClass={styles.vertical__menu__list__item}
              options={menuItems}
              onSelect={onOptionSelect}
            />
            <div
              className={styles.donate__btn}
              data-for="vandal-donate"
              data-tip="Donate to Archive">
              <a
                href="https://archive.org/donate/?referrer=vandal"
                target="_blank">
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
        {state.matches('idle.timetravel.open') && (
          <TimeTravel
            {...others}
            selectTabIndex={selectTabIndex}
            selectedTabIndex={_.get(state, 'context.selectedTabIndex')}
          />
        )}
        {state.matches('idle.historical.open') && (
          <Historical
            url={props.url}
            years={_.keys(
              _.get(state, 'context.timetravelRef.state.context.sparkline')
            )}
            onClose={() => {
              send('TOGGLE_HISTORICAL_MODE');
            }}
            openURL={(url) => {
              browser.navigate(url);
            }}
          />
        )}
        <Toast
          className={styles.toast__save}
          show={saveState.matches('open.loading')}>
          <div>Saving Page to Archive...</div>
        </Toast>
        <Toast
          err
          className={`${styles.toast__save} ${styles.toast__save___error}`}
          show={saveState.matches('open.failure.rejection')}>
          <div>
            <span>Error saving to Archive. Please try again.</span>
            <Icon
              name="close"
              className={styles.toast__close__icon}
              onClick={() => {
                sendtoSaveMachine('CLOSE');
              }}
            />
          </div>
        </Toast>
        <Toast
          err
          className={`${styles.toast__save} ${styles.toast__save___error}`}
          show={saveState.matches('open.failure.timeout')}>
          <div>
            <span>Error saving to Archive. The request timed out.</span>
            <Icon
              name="close"
              className={styles.toast__close__icon}
              onClick={() => {
                sendtoSaveMachine('CLOSE');
              }}
            />
          </div>
        </Toast>
        <Toast
          className={styles.toast__url}
          show={saveState.matches('open.success')}>
          <div className={styles.toast__link}>
            <a
              href={_.get(saveState, 'context.savedArchiveURL')}
              target="_blank">
              {_.get(saveState, 'context.savedArchiveURL')}
            </a>
          </div>
          <div className={styles.toast__actions}>
            <button
              className={styles.toast__open__btn}
              onClick={() => {
                sendtoSaveMachine('OPEN_URL_IN_VANDAL');
              }}>
              open
            </button>
            <button
              className={styles.toast__close__btn}
              onClick={() => sendtoSaveMachine('CLOSE')}>
              close
            </button>
          </div>
        </Toast>
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
          delayShow={1000}
          offset={{ bottom: 0, left: 0 }}
        />
      </div>
    </TimetravelProvider>
  );
};

export default Frame;
