import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import cx from 'classnames';
import { useMachine } from '@xstate/react';
import frameMachine from './frame.machine';
import saveMachine from './save.machine';
import navigatorMachine from './navigator.machine';
import { VerticalMenu, Switch, Icon, Toast } from '../common';
import URL from '../url';
import TimeTravel from '../timetravel';
import Historical from '../historical';
import Changes from '../changes';

import { browser } from '../../utils';
import { TimetravelProvider, useTheme } from '../../hooks';
import styles from './frame.module.css';

const options = [
  {
    value: 'histView',
    text: 'Historical View'
  },
  {
    value: 'changeView',
    text: 'Changes View'
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
  }
];

const Frame = props => {
  const onOptionSelect = (option, e) => {
    if (option === 'wayback') {
      window.open(`https://web.archive.org/web/*/${props.url}`, '_blank');
    } else if (option === 'exit') {
      props.onExit();
    } else if (option === 'diffView') {
      send('TOGGLE_DIFF_MODE');
    } else if (option === 'histView') {
      send('TOGGLE_HISTORICAL_MODE');
    } else if (option === 'changeView') {
      send('TOGGLE_CHANGES_MODE');
    }
  };

  const [saveState, sendtoSave] = useMachine(
    saveMachine.withConfig({
      actions: {
        updateVandalURL: ctx => {
          browser.navigate(ctx.imURL);
        }
      }
    })
  );
  const onSave = () => {
    sendtoSave({ type: 'OPEN', value: props.url });
  };
  const debouncedSave = _.debounce(onSave, 250);

  const [navState, sendToNav] = useMachine(
    navigatorMachine.withConfig(
      {
        actions: {
          updateVandalURL: ctx => {
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

  const { frameu, tempUrl, history, ...others } = props;
  const [state, send, frameService] = useMachine(frameMachine);
  const verticalMenuRef = useRef(null);

  useEffect(() => {
    if (props.loaded) {
      send('LOAD_SPARKLINE', { payload: { url: props.url } });
    }
  }, [props.loaded]);

  const onMessage = request => {
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

  const selectTabIndex = useCallback(idx => {
    send({
      type: 'SET_SELECTED_TABINDEX',
      payload: { value: idx }
    });
  });

  const { theme, setTheme } = useTheme();

  const menuItems = useMemo(() => {
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
              onChange={checked => {
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
  }, [options, theme]);

  console.log(
    'frame state:',
    _.get(state, 'context.timetravelRef.state'),
    state
  );

  return (
    <TimetravelProvider machine={state.context.timetravelRef}>
      <div className={styles.root}>
        <div className={styles.left}>
          <div className={styles.navigation}>
            <button
              className={styles.backward__nav__btn}
              title="Go back"
              disabled={
                _.indexOf(
                  navState.context.currentRecords,
                  navState.context.currentURL
                ) <= 0
              }
              onClick={() => sendToNav('GO_BACK')}>
              <Icon name="leftNav" className={styles.backward__nav__icon} />
            </button>
            <button
              className={styles.forward__nav__btn}
              title="Go forward"
              disabled={
                _.indexOf(
                  navState.context.currentRecords,
                  navState.context.currentURL
                ) === -1 ||
                _.lastIndexOf(
                  navState.context.currentRecords,
                  navState.context.currentURL
                ) ===
                  _.size(navState.context.currentRecords) - 1
              }
              onClick={() => sendToNav('GO_FORWARD')}>
              <Icon name="rightNav" className={styles.forward__nav__icon} />
            </button>
          </div>
          <button className={styles.reload__btn}>
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
            currentIndex={_.indexOf(
              _.get(navState, 'context.allRecords'),
              navState.context.currentURL || navState.context.url
            )}
            history={allRecords}
            showTimeTravel={state.matches('idle.timetravel.open')}
            url={props.url}
            clearHistory={() => {
              sendToNav('CLEAR_HISTORY');
            }}
            toggleTimeTravel={() => send('TOGGLE_TIMETRAVEL')}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.save__btn__container}>
            <button
              className={cx({
                [styles.save__btn]: true,
                [styles.save__btn__disabled]: saveState.matches('open.loading')
              })}
              onClick={debouncedSave}
              title="Save Page to Archive">
              <Icon name="save" className={styles.save__btn__icon} />
            </button>
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
            <div className={styles.donate__btn}>
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
          />
        )}
        {state.matches('idle.changes.open') && (
          <Changes
            url={props.url}
            years={_.keys(
              _.get(state, 'context.timetravelRef.state.context.sparkline')
            )}
            onClose={() => {
              send('TOGGLE_CHANGES_MODE');
            }}
          />
        )}
        <Toast
          className={styles.toast__save}
          show={saveState.matches('open.loading')}>
          <div>Saving Page to Archive...</div>
        </Toast>
        <Toast
          className={`${styles.toast__save} ${styles.toast__save___error}`}
          show={saveState.matches('open.failure.rejection')}>
          <div>Error saving to Archive. Please try again.</div>
        </Toast>
        <Toast
          className={`${styles.toast__save} ${styles.toast__save___error}`}
          show={saveState.matches('open.failure.timeout')}>
          <div>Error saving to Archive. The request timed out.</div>
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
                sendtoSave('OPEN_URL_IN_VANDAL');
              }}>
              open
            </button>
            <button
              className={styles.toast__close__btn}
              onClick={() => sendtoSave('CLOSE')}>
              close
            </button>
          </div>
        </Toast>
        {/* <Toast className={styles.toastSave} show={showRedirectToast}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            Redirecting...
          </div>
        </Toast> */}
        {/* <Toast
          className={styles.toast__save}
          show={
            _.get(state, 'context.timetravelRef.state.value') ===
            'noSparklineFound'
          }
          exit={0}>
          <div>
            <span>
              No snapshots found for this url. Click on Save to create one.
            </span>
            <Icon
              name="close"
              className="vandal__toast-block__close"
              onClick={() => {}}
            />
          </div>
        </Toast> */}
        {/* <Toast
            className={cx({
              'vandal__toast-block-error': true
              // 'vandal__toast-block-error--default': !isArchiveURL(frameUrl)
            })}
            show={showBlockError}
            exit={0}>
            <div>
              The page cannot be rendered.
              {isArchiveURL('') && (
              <span>
                {' '}
                Please try the web archive link
                <a
                  target="_blank"
                  className="vandal__toast-block-link"
                  href={stripIm('')}>
                  here
                </a>
                <Icon
                  name="close"
                  className="vandal__toast-block__close"
                  onClick={() => {}}
                />
              </span>
              )} 
              {!isArchiveURL('') && (
              <span>
                {' '}
                Please choose an{' '}
                <a className="vandal__toast-block-tt-link">archive snapshot</a>.
              </span>
              )}
            </div>
          </Toast> */}
      </div>
    </TimetravelProvider>
  );
};

export default Frame;
