import React, { useEffect, useState, useCallback } from 'react';
import cx from 'classnames';
import clickDrag from 'react-clickdrag';
import ShadowDOM from 'react-shadow';

import { dateTimeDiff, formatDateTimeTS, stripArchiveURL } from '../../utils';
import { URLLoader, Icon } from '../common';
import drawerMachine from './drawer.machine';

import styles from './drawer.module.css';
import { useMachine } from '@xstate/react';

const DrawerHeader = ({
  dataDrag,
  isMoving,
  scrollOnHighlight,
  onScrollHighlight,
  onClose
}) => {
  useEffect(
    () => {
      isMoving && onDrag(dataDrag.moveDeltaY);
    },
    [dataDrag.moveDeltaY]
  );

  return (
    <div className={styles.titleBar}>
      <div className={styles.titleBarLeft}>
        <Icon name="timestamp" className={styles.timestampIcon} />
        <div className={styles.scrollContainer}>
          <input
            type="checkbox"
            id="vandal-scroll-highlight"
            checked={scrollOnHighlight}
            className={styles.scrollCheckbox}
            onChange={onScrollHighlight}
          />
          <label
            className={styles.scrollLabel}
            htmlFor="vandal-scroll-highlight">
            Scroll On Highlight
          </label>
        </div>
      </div>
      <Icon name="close" className={styles.closeIcon} onClick={onClose} />
    </div>
  );
};

const DrawerHeaderDraggable = clickDrag(DrawerHeader, {
  touch: false,
  onDragStart: (__, props) => {
    props.onDragStart && props.onDragStart();
    props.frame.style.pointerEvents = 'none';
  },
  onDragStop: (__, props) => {
    props.onDragStop && props.onDragStop();
    props.frame.style.pointerEvents = 'auto';
  }
});

let startHeight;

const getIcon = (url) => {
  if (url.match(/\.(jpeg|jpg|gif|png|svg)$/)) {
    return <Icon name="image" className={styles.imageIcon} />;
  } else if (_.endsWith(url, 'js')) {
    return (
      <span className={`${styles.resourceIcon} ${styles.resourceIcon___js}`}>
        JS
      </span>
    );
  } else if (_.endsWith(url, 'css')) {
    return <span className={styles.resourceIcon}>CSS</span>;
  } else {
    return <Icon name="document" className={styles.docIcon} />;
  }
};

const Drawer = (props) => {
  const [showLoader, toggleLoader] = useState(false);
  // const [timestamps, setTimestamps] = useState([]);
  const [state, send] = useMachine(
    drawerMachine.withContext({
      height: 300
    })
  );
  const { context: ctx } = state;

  console.log('drawer', ctx);
  // const [height, setHeight] = useState(drawerStore.getState().height);
  // const [scrollOnHighlight, send('TOGGLE_SCROLL_HIGHLIGHT', {payload: {checked: e.target.checked}});

  const handleMouseEnter = (source, ts) => (e) => {
    chrome.runtime.sendMessage({
      message: '__VANDAL__CLIENT__HIGHLIGHT__NODE',
      data: { source, ts, scrollOnHighlight: ctx.scrollOnHighlight }
    });
  };

  // const () => {
  //   chrome.runtime.sendMessage({
  //     message: '__VANDAL__CLIENT__REMOVE__HIGHLIGHT'
  //   });
  // } = () => {
  //   chrome.runtime.sendMessage({
  //     message: '__VANDAL__CLIENT__REMOVE__HIGHLIGHT'
  //   });
  // };

  const fetchTimestamps = async (sources) => {
    if (_.isEmpty(sources)) return;

    _.every(sources, (source, index) => {
      chrome.runtime.sendMessage(
        { message: '__VANDAL__CLIENT__RESOURCE__TIMESTAMP', data: source },
        (result) => {
          const [ts, err] = result;
          timestamps[index] = { ts, err, isValid: !ts && !err };
          setTimestamps(timestamps);
        }
      );
    });
  };

  useEffect(
    () => {
      // setTimestamps([]);
      // toggleLoader(false);
      // fetchTimestamps(props.sources);
    },
    [props.sources]
  );

  const updateState = (urlLoaded) => {
    if (!urlLoaded) {
      // setSources([]);
      // toggleLoader(true);
    } else if (urlLoaded) {
      chrome.runtime.sendMessage({
        message: '__VANDAL__CLIENT__FETCH__SOURCES'
      });
    }
  };

  const cancelRequest = () => {
    // setTimestamps([]);
  };

  const onResize = (delta) => {
    console.log('SET_HEIGHT');
    // setHeight(Math.min(Math.max(startHeight - delta, 100), 500));
    send('SET_HEIGHT', {
      payload: { value: Math.min(Math.max(startHeight - delta, 100), 500) }
    });
  };

  const onDragStart = () => {
    startHeight = ctx.height;
  };

  const onDragStop = useCallback(
    () => {
      console.log('onDragStop:');
      // drawerStore.setHeight(height);
      send('SET_HEIGHT', {
        payload: { value: ctx.height }
      });
    },
    [ctx.height]
  );

  useEffect(
    () => {
      if (!props.urlLoaded) {
        cancelRequest();
      }
      // else {
      //   resetAbort();
      // }

      if (props.selectedTS) {
        updateState(props.urlLoaded);
      }
    },
    [props.urlLoaded]
  );

  useEffect(() => {
    if (!props.selectedTS) {
      return;
    }
    updateState(props.urlLoaded);

    return () => {
      chrome.runtime.sendMessage({
        message: '__VANDAL__CLIENT__REMOVE__HIGHLIGHT'
      });
      cancelRequest();
    };
  });

  return (
    <div
      className={styles.drawer}
      style={{ height: `${ctx.height}px` }}
      ref={props.dialogRef}>
      <DrawerHeaderDraggable
        frame={props.frame}
        onScrollHighlight={(e) =>
          send('TOGGLE_SCROLL_HIGHLIGHT', {
            payload: { checked: e.target.checked }
          })
        }
        scrollOnHighlight={ctx.scrollOnHighlight}
        onClose={props.onClose}
        onDrag={onResize}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
      />
      <div className={styles.body}>
        <div className={styles.info}>
          <div>
            Some page elements may vary significantly in capture timestamp from
            the base URL of the page, depending on the web crawling process. Use
            this panel to verify the difference. To know more, click{' '}
            <a
              target="_blank"
              className={styles.infoLink}
              href="https://blog.archive.org/2017/10/05/wayback-machine-playback-now-with-timestamps/">
              here
            </a>
            .
          </div>
          <div />
        </div>
        {!props.selectedTS && (
          <div className={styles.timestamps___empty}>
            No Timestamps found. Please select an Archive URL to view
            timestamps.
          </div>
        )}
        {showLoader &&
          props.selectedTS && (
            <div className={styles.timestamps___loading}>
              Waiting for the page to finish loading ...
            </div>
          )}
        {!showLoader &&
          props.selectedTS &&
          _.isEmpty(props.sources) && (
            <div className={styles.timestamps___loading}>
              Fetching page elements ...
            </div>
          )}
        {!showLoader &&
          !_.isEmpty(props.sources) &&
          props.selectedTS && (
            <ul className={styles.list}>
              {_.map(props.sources, (source, index) => {
                const ts = _.get(timestamps[index], 'ts');
                const err = _.get(timestamps[index], 'err');
                const isValid = _.get(timestamps[index], 'isValid');
                const dt = dateTimeDiff(ts, props.selectedTS);
                return (
                  <li
                    key={index}
                    className={styles.item}
                    onMouseEnter={handleMouseEnter(source, _.get(dt, 'text'))}
                    onMouseLeave={() => {
                      chrome.runtime.sendMessage({
                        message: '__VANDAL__CLIENT__REMOVE__HIGHLIGHT'
                      });
                    }}>
                    <div className={styles.itemLeft}>
                      {ts || err || isValid ? (
                        getIcon(source)
                      ) : (
                        <URLLoader className={styles.URLLoader} />
                      )}
                      <a
                        href={source}
                        target="_blank"
                        title={source}
                        className={styles.itemLink}>
                        {stripArchiveURL(source)}
                      </a>
                    </div>
                    <div className={styles.itemTimestamp}>
                      {err && (
                        <span className={styles.item___err}>
                          Err: file not found
                        </span>
                      )}
                      {!err &&
                        ts && (
                          <span
                            className={cx({
                              [styles.itemTimestamp___plus]:
                                _.get(dt, 'delta') >= 0,
                              [styles.itemTimestamp___minus]:
                                _.get(dt, 'delta') < 0
                            })}>
                            {_.get(dt, 'text')}
                          </span>
                        )}
                      <div className={styles.timestampValue}>
                        {!err && ts && formatDateTimeTS(ts)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
      </div>
    </div>
  );
};

const DrawerContainer = (props) => {
  const [show, setVisible] = useState(false);
  const [isNavComplete, setNavComplete] = useState(false);
  const [sources, setSources] = useState([]);
  const [isArchiveURL, setIsArchiveURL] = useState(false);

  const messageListener = (request) => {
    if (request.message === '__VANDAL__CLIENT__TOGGLEDRAWER') {
      setVisible(!show);
    } else if (
      show &&
      (request.message === '__VANDAL__NAV__BEFORENAVIGATE' ||
        request.message === '__VANDAL__NAV__HISTORYCHANGE')
    ) {
      const frameURL = _.get(request.data, 'url');
      setIsArchiveURL(isArchiveURL(frameURL));
      setSources([]);
      setNavComplete(false);
    } else if (show && request.message === '__VANDAL__NAV__COMPLETE') {
      setSources([]);
      setNavComplete(true);
    } else if (show && request.message === '__VANDAL__FRAME__SOURCES') {
      setSources(request.data);
    }
  };

  useEffect(() => {
    console.log('add drawer listener');
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      console.log('remove drawer listener');
      //   chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <ShadowDOM
      include={[
        'chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/vandal.css'
      ]}>
      <div>
        {show && (
          <Drawer
            frame={props.frame}
            sources={sources}
            urlLoaded={isNavComplete}
            selectedTS={isArchiveURL}
            onClose={() => setVisible(false)}
          />
        )}
      </div>
    </ShadowDOM>
  );
};

export default DrawerContainer;
