import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import clickDrag from 'react-clickdrag';
import ShadowDOM from 'react-shadow';
import TimestampIcon from './timestamp.svg';
import CloseIcon from './close.svg';
import ImageIcon from './image.svg';
import DocumentIcon from './document.svg';
import './style.css';
import { dateTimeDiff, formatDateTimeTS, stripArchiveUrl } from '../../utils';
import { URLLoader } from '../Common';
import { drawerStore } from '../../stores';

class DrawerHeader extends React.Component {
  state = {};

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.dataDrag.isMoving &&
      this.props.dataDrag.moveDeltaY !== nextProps.dataDrag.moveDeltaY
    ) {
      this.props.onDrag(nextProps.dataDrag.moveDeltaY);
    }
  }

  render() {
    const { scrollOnHighlight, onChange, onClose } = this.props;
    return (
      <div className="vandal__drawer__title-bar">
        <div className="vandal__drawer__title-bar__left">
          <TimestampIcon className="vandal-drawer__timestamp-icon" />
          <div className="vandal__drawer__scroll-container">
            <input
              type="checkbox"
              id="vandal-scroll-highlight"
              checked={scrollOnHighlight}
              className="vandal__drawer__scroll-checkbox"
              onChange={onChange}
            />
            <label
              className="vandal__drawer__scroll-label"
              htmlFor="vandal-scroll-highlight">
              Scroll On Highlight
            </label>
          </div>
        </div>
        <CloseIcon className="vandal-drawer__close-icon" onClick={onClose} />
      </div>
    );
  }
}

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

class Drawer extends React.Component {
  state = {
    showLoader: false,
    scrollOnHighlight: true,
    timestamps: [],
    height: drawerStore.getState().height
  };

  abortFetch = false;

  getIcon(url) {
    if (url.match(/\.(jpeg|jpg|gif|png|svg)$/)) {
      return <ImageIcon className="vandal__drawer__item__image-icon" />;
    } else if (_.endsWith(url, 'js')) {
      return (
        <span className="vandal__drawer__item__resource-icon vandal__drawer__item__resource-icon--js">
          JS
        </span>
      );
    } else if (_.endsWith(url, 'css')) {
      return <span className="vandal__drawer__item__resource-icon">CSS</span>;
    } else {
      return <DocumentIcon className="vandal__drawer__item__doc-icon" />;
    }
  }

  handleMouseEnter = (source, ts) => e => {
    const { scrollOnHighlight } = this.state;
    chrome.runtime.sendMessage({
      message: 'highlightNode',
      data: { source, ts, scrollOnHighlight }
    });
  };

  handleMouseLeave = () => {
    chrome.runtime.sendMessage({
      message: 'removeHighlight'
    });
  };

  handleScrollOnHighlight = e => {
    this.setState({
      scrollOnHighlight: e.target.checked
    });
  };

  async fetchTimestamps(sources) {
    if (_.isEmpty(sources)) return;

    _.every(sources, (source, index) => {
      chrome.runtime.sendMessage(
        { message: 'getTimestamp', data: source },
        result => {
          const [ts, err] = result;
          const { timestamps } = this.state;
          timestamps[index] = { ts, err, isValid: !ts && !err };
          this.setState({
            timestamps
          });
        }
      );
      return !this.abortFetch;
    });
  }

  updateState = props => {
    if (!props.urlLoaded) {
      this.setState({ sources: [], showLoader: true });
    } else if (props.urlLoaded) {
      chrome.runtime.sendMessage({ message: 'fetchSources' });
    }
  };

  cancelRequest() {
    this.abortFetch = true;
    this.setState({
      timestamps: []
    });
  }

  resetAbort() {
    this.abortFetch = false;
  }

  componentWillUnmount() {
    chrome.runtime.sendMessage({ message: 'drawerClosed' });
    this.cancelRequest();
  }

  componentWillReceiveProps(nextProps) {
    const selectedTS = nextProps.getSelectedTS();
    if (!nextProps.urlLoaded) {
      this.cancelRequest();
    } else {
      this.resetAbort();
    }

    if (this.props.urlLoaded !== nextProps.urlLoaded && selectedTS) {
      this.updateState(nextProps);
    }

    if (this.props.sources !== nextProps.sources) {
      this.setState({ timestamps: [], showLoader: false });
      this.fetchTimestamps(nextProps.sources);
    }
  }

  handleResize = delta => {
    this.setState({
      height: Math.min(Math.max(this.startHeight - delta, 100), 500)
    });
  };

  handleDragStart = () => {
    this.startHeight = this.state.height;
  };

  handleDragStop = () => {
    drawerStore.setHeight(this.state.height);
  };

  componentDidMount() {
    if (!this.props.getSelectedTS()) {
      return;
    }
    this.updateState(this.props);
  }

  render() {
    const { showLoader, timestamps, scrollOnHighlight, height } = this.state;
    const { getSelectedTS, onClose, sources, frame, dialogRef } = this.props;
    const selectedTS = getSelectedTS();
    return (
      <div
        className="vandal__drawer"
        style={{ height: `${height}px` }}
        ref={dialogRef}>
        <DrawerHeaderDraggable
          frame={frame}
          onChange={this.handleScrollOnHighlight}
          scrollOnHighlight={scrollOnHighlight}
          onClose={onClose}
          onDrag={this.handleResize}
          onDragStart={this.handleDragStart}
          onDragStop={this.handleDragStop}
        />
        <div className="vandal__drawer__body">
          <div className="vandal__drawer__info">
            <div>
              Some page elements may vary significantly in capture timestamp
              from the base URL of the page, depending on the web crawling
              process. Use this panel to verify the difference. To know more,
              click{' '}
              <a
                target="_blank"
                className="vandal__drawer__info__link"
                href="https://blog.archive.org/2017/10/05/wayback-machine-playback-now-with-timestamps/">
                here
              </a>
              .
            </div>
            <div />
          </div>
          {!selectedTS && (
            <div className="vandal__drawer__timestamps--empty">
              No Timestamps found. Please select an Archive URL to view
              timestamps.
            </div>
          )}
          {showLoader && selectedTS && (
            <div className="vandal__drawer__timestamps--loading">
              Waiting for the page to finish loading ...
            </div>
          )}
          {!showLoader && selectedTS && _.isEmpty(sources) && (
            <div className="vandal__drawer__timestamps--loading">
              Fetching page elements ...
            </div>
          )}
          {!showLoader && !_.isEmpty(sources) && selectedTS && (
            <ul className="vandal__drawer__list">
              {_.map(sources, (source, index) => {
                const ts = _.get(timestamps[index], 'ts');
                const err = _.get(timestamps[index], 'err');
                const isValid = _.get(timestamps[index], 'isValid');
                const dt = dateTimeDiff(ts, selectedTS);
                return (
                  <li
                    key={index}
                    className="vandal__drawer__item"
                    onMouseEnter={this.handleMouseEnter(
                      source,
                      _.get(dt, 'text')
                    )}
                    onMouseLeave={this.handleMouseLeave}>
                    <div className="vandal__drawer__item__left">
                      {ts || err || isValid ? (
                        this.getIcon(source)
                      ) : (
                        <URLLoader />
                      )}
                      <a
                        href={source}
                        target="_blank"
                        title={source}
                        className="vandal__drawer__item__link">
                        {stripArchiveUrl(source)}
                      </a>
                    </div>
                    <div className="vandal__drawer__item__timestamp">
                      {err && (
                        <span className="vandal__drawer__item--err">
                          Err: file not found
                        </span>
                      )}
                      {!err && ts && (
                        <span
                          className={cx({
                            'vandal__drawer__item__timestamp--plus':
                              _.get(dt, 'delta') >= 0,
                            'vandal__drawer__item__timestamp--minus':
                              _.get(dt, 'delta') < 0
                          })}>
                          {_.get(dt, 'text')}
                        </span>
                      )}
                      <div className="vandal__drawer__item__timestamp__value">
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
  }
}

class DrawerContainer extends React.Component {
  state = {
    show: false,
    urlLoaded: false
  };

  handleClose = () => {
    this.setState({
      show: false
    });
  };

  render() {
    const { show, sources, urlLoaded } = this.state;
    const { getSelectedTS, frame, baseUrl } = this.props;
    return (
      <ShadowDOM
        include={[
          'chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/vandal.css'
        ]}>
        <div>
          {show && (
            <Drawer
              frame={frame}
              sources={sources}
              urlLoaded={urlLoaded}
              getSelectedTS={getSelectedTS}
              onClose={this.handleClose}
            />
          )}
        </div>
      </ShadowDOM>
    );
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(request => {
      if (request.message === 'toggleDrawer') {
        this.setState(prevState => {
          return { show: !prevState.show };
        });
      } else if (request.message === 'URLLoading') {
        this.setState({ urlLoaded: false, sources: [] });
      } else if (request.message === 'URLLoaded') {
        this.setState({ urlLoaded: true, sources: [] });
      } else if (request.message === 'frameSources') {
        this.setState({ sources: request.data });
      }
    });
  }
}

export default DrawerContainer;
