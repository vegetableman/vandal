import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import clickDrag from 'react-clickdrag';
import ShadowDOM from 'react-shadow';

import { dateTimeDiff, formatDateTimeTS, stripArchiveURL } from '../../utils';
import { URLLoader, Icon } from '../common';
import { drawerStore } from '../../stores';

import styles from './drawer.module.css';

const DrawerHeader = ({
  dataDrag,
  isMoving,
  scrollOnHighlight,
  onChange,
  onClose
}) => {
  useEffect(() => {
    isMoving && onDrag(dataDrag.moveDeltaY);
  }, [dataDrag.moveDeltaY]);

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
            onChange={onChange}
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

const Drawer = props => {
  const [showLoader, toggleLoader] = useState(false);
  const [timestamps, setTimestamps] = useState([]);
  const [height, setHeight] = useState(drawerStore.getState().height);
  const [scrollOnHighlight, setScrollOnHighLight] = useState(true);

  const getIcon = url => {
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

  const handleMouseEnter = (source, ts) => e => {
    chrome.runtime.sendMessage({
      message: 'highlightNode',
      data: { source, ts, scrollOnHighlight }
    });
  };

  const handleMouseLeave = () => {
    chrome.runtime.sendMessage({
      message: 'removeHighlight'
    });
  };

  const fetchTimestamps = async sources => {
    if (_.isEmpty(sources)) return;

    _.every(sources, (source, index) => {
      chrome.runtime.sendMessage(
        { message: 'getTimestamp', data: source },
        result => {
          const [ts, err] = result;
          timestamps[index] = { ts, err, isValid: !ts && !err };
          setTimestamps(timestamps);
        }
      );
    });
  };

  useEffect(() => {
    setTimestamps([]);
    toggleLoader(false);
    fetchTimestamps(props.sources);
  }, [props.sources]);

  const updateState = urlLoaded => {
    if (!urlLoaded) {
      setSources([]);
      toggleLoader(true);
    } else if (urlLoaded) {
      chrome.runtime.sendMessage({ message: 'fetchSources' });
    }
  };

  const cancelRequest = () => {
    setTimestamps([]);
  };

  const handleResize = delta => {
    setHeight(Math.min(Math.max(startHeight - delta, 100), 500));
  };

  const handleDragStart = () => {
    startHeight = height;
  };

  const handleDragStop = () => {
    drawerStore.setHeight(height);
  };

  useEffect(() => {
    const selectedTS = props.getSelectedTS();
    if (!props.urlLoaded) {
      cancelRequest();
    }
    // else {
    //   resetAbort();
    // }

    if (selectedTS) {
      updateState(props.urlLoaded);
    }
  }, [props.urlLoaded]);

  useEffect(() => {
    if (!props.getSelectedTS()) {
      return;
    }
    updateState(props.urlLoaded);

    return () => {
      chrome.runtime.sendMessage({ message: 'drawerClosed' });
      cancelRequest();
    };
  });

  const selectedTS = props.getSelectedTS();
  return (
    <div
      className={styles.drawer}
      style={{ height: `${height}px` }}
      ref={props.dialogRef}>
      <DrawerHeaderDraggable
        frame={props.frame}
        onChange={e => setScrollOnHighLight(e.target.checked)}
        scrollOnHighlight={scrollOnHighlight}
        onClose={props.onClose}
        onDrag={handleResize}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
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
        {!selectedTS && (
          <div className={styles.timestamps___empty}>
            No Timestamps found. Please select an Archive URL to view
            timestamps.
          </div>
        )}
        {showLoader && selectedTS && (
          <div className={styles.timestamps___loading}>
            Waiting for the page to finish loading ...
          </div>
        )}
        {!showLoader && selectedTS && _.isEmpty(props.sources) && (
          <div className={styles.timestamps___loading}>
            Fetching page elements ...
          </div>
        )}
        {!showLoader && !_.isEmpty(props.sources) && selectedTS && (
          <ul className={styles.list}>
            {_.map(props.sources, (source, index) => {
              const ts = _.get(timestamps[index], 'ts');
              const err = _.get(timestamps[index], 'err');
              const isValid = _.get(timestamps[index], 'isValid');
              const dt = dateTimeDiff(ts, selectedTS);
              return (
                <li
                  key={index}
                  className={styles.item}
                  onMouseEnter={handleMouseEnter(source, _.get(dt, 'text'))}
                  onMouseLeave={handleMouseLeave}>
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
                    {!err && ts && (
                      <span
                        className={cx({
                          [styles.itemTimestamp___plus]:
                            _.get(dt, 'delta') >= 0,
                          [styles.itemTimestamp___minus]: _.get(dt, 'delta') < 0
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

const DrawerContainer = props => {
  const [show, setVisible] = useState(false);
  const [urlLoaded, setUrlLoaded] = useState(false);
  const [sources, setSources] = useState([]);

  const messageListener = request => {
    if (request.message === '__VANDAL__CLIENT__TOGGLEDRAWER') {
      setVisible(!show);
    } else if (request.message === '__VANDAL__CLIENT__URLLOADING') {
      setSources([]);
      setUrlLoaded(false);
    } else if (request.message === '__VANDAL__CLIENT__URLLOADED') {
      setSources([]);
      setUrlLoaded(true);
    } else if (request.message === '__VANDAL__FRAME__SOURCES') {
      setSources(request.data);
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  });

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
            urlLoaded={urlLoaded}
            getSelectedTS={props.getSelectedTS}
            onClose={() => setVisible(false)}
          />
        )}
      </div>
    </ShadowDOM>
  );
};

export default DrawerContainer;
