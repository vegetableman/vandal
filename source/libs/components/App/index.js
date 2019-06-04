import React from 'react';
import _ from 'lodash';
import cx from 'classnames';
import DiffPanel from '../DiffPanel';
import Frame from '../Frame';
import TimeTravel from '../TimeTravel';
import URLInfo from '../URLInfo';
import URLHistory from '../URLHistory';
import ShadowDOM from 'react-shadow';
import memoizeOne from 'memoize-one';
import Mode from '../Mode';
import {
  api,
  getDateTsFromUrl,
  stripArchiveUrl,
  isArchiveUrl,
  isUrlEqual,
  stripOffTag,
  stripIm,
  xhr
} from '../../utils';
import { Toast, Icon } from '../Common';
import { historyStore, drawerStore, ThemeProvider } from '../../stores';
import './style.css';
import './tooltip.css';

const fetchSparkline = async url => {
  return await api(
    `${ROOT_URL}/__wb/sparkline?url=${encodeURIComponent(
      url
    )}&collection=web&output=json`,
    {
      noCacheReq: true,
      noCacheRes: true
    }
  );
};

const ROOT_URL = 'https://web.archive.org';
const memoizedFetchSparkline = memoizeOne(fetchSparkline, (arg1, arg2) => {
  return (
    arg1 === arg2 ||
    _.replace(arg1, 'https://', 'http://') ===
      _.replace(arg2, 'https://', 'http://')
  );
});

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      years: {},
      history: [props.url],
      frameUrl: props.url,
      url: stripOffTag(props.url),
      showTimeTravel: false,
      showEmptyError: false,
      showURLInfo: false,
      showFrameMenu: null,
      selectedMonth: null,
      selectedYear: null,
      showMode: null,
      showInvalidContextError: false,
      showSaveProgress: false,
      showURLLoader: false,
      showSaveToast: false,
      hideToast: false,
      showFrameLoader: false,
      selectedTabIndex: 0,
      showSparklineConnErr: false,
      redirectTSCollection: {},
      isDiffMode: false
    };
  }

  loadSparkline = async (url, noCache) => {
    console.log('url: ', url);
    let sparklineData, err;
    if (noCache) {
      [sparklineData, err] = await fetchSparkline(url);
    } else {
      [sparklineData, err] = await memoizedFetchSparkline(url);
    }
    if (err) {
      this.setState({
        sparkline: null,
        showSparklineConnErr: true
      });
      return;
    }
    if (!sparklineData) return;
    console.log('sparklineData: ', sparklineData);
    const { years, first_ts: firstTS, last_ts: lastTS } = sparklineData;
    if (years === this.state.sparkline) return;
    this.setState({
      showSparklineConnErr: false,
      sparkline: years,
      firstTS: +firstTS,
      lastTS: +lastTS,
      showEmptyError: _.isEmpty(_.keys(years))
    });
  };

  resetSparkline = () => {
    this.setState({
      sparkline: {},
      firstTS: null,
      lastTS: null
    });
  };

  openTimeTravel = () => {
    this.setState({
      showBlockError: false,
      showTimeTravel: true
    });
    this.loadSparkline(this.state.url);
  };

  closeTimeTravel = () => {
    this.setState({ showTimeTravel: false });
  };

  closeURLInfo = () => {
    this.setState({
      showURLInfo: false
    });
  };

  handleToggleTimeTravel = () => {
    this.setState(prevState => ({
      showTimeTravel: !prevState.showTimeTravel
    }));
    this.loadSparkline(this.state.url);
  };

  handleToggleURLInfo = () => {
    this.setState(prevState => ({
      showURLInfo: !prevState.showURLInfo
    }));
  };

  handleToggleURLHistory = e => {
    this.setState(prevState => ({
      showURLHistory: !prevState.showURLHistory
    }));
  };

  closeAllMenus() {
    this.frameRef.hideMenu();
    if (this.state.showTimeTravel) {
      this.setState({
        showTimeTravel: false
      });
    }
    if (this.state.showURLInfo) {
      this.setState({
        showURLInfo: false
      });
    }
    if (this.state.showURLHistory) {
      this.setState({
        showURLHistory: false
      });
    }
  }

  handleToggleModeView = mode => {
    this.setState({ showMode: mode });
  };

  handleToggleClose = () => {
    this.setState({ showMode: null });
  };

  handleSave = async () => {
    this.setState({
      showSaveProgress: true
    });
    const [contentLocation, err] = await xhr(
      `${ROOT_URL}/save/${this.state.url}`,
      {
        fetchResHeader: 'content-location'
      }
    );

    if (err) {
      this.setState(
        {
          showSaveProgress: false,
          showSaveError: true
        },
        () => {
          setTimeout(() => {
            this.setState({
              showSaveError: false
            });
          }, 5000);
        }
      );
      return;
    }

    this.setState(
      {
        showSaveProgress: false
      },
      () => {
        setTimeout(() => {
          this.setState({
            showSaveToast: true,
            contentLocation: `${ROOT_URL}${contentLocation}`
          });
        }, 500);
      }
    );
  };

  handleTabChange = selectedTabIndex => {
    this.setState({ selectedTabIndex });
  };

  debouncedHandleSave = _.debounce(this.handleSave, 250);

  handleCloseSaveToast = () => {
    this.setState({
      showSaveToast: false
    });
  };

  handleCloseToast = () => {
    this.setState({
      showBlockError: false,
      showEmptyError: false,
      showInvalidContextError: false
    });
  };

  setBrowserSrc = url => {
    console.log('source: ', url);
    this.props.browser.src = `${this.props.baseUrl}?url=${encodeURIComponent(
      url
    )}`;
  };

  updateHistory = (url, currURL = this.props.url) => {
    let { history } = this.state;
    if (!_.includes(history, currURL)) {
      this.setState({
        history: [...history, url]
      });
      return;
    }
    this.setState({
      history: [..._.slice(history, 0, _.indexOf(history, currURL) + 1), url]
    });
  };

  handleTSSelect = selectedTS => {
    const baseUrl = chrome.runtime.getURL('hidden-iframe.html');
    const frameUrl = `${ROOT_URL}/web/${selectedTS}im_/${this.state.url}`;
    const { isDiffMode } = this.state;
    if (isDiffMode) {
      chrome.runtime.sendMessage({
        message: 'diffModeTS',
        data: { selectedTS }
      });
    }
    this.setState(
      {
        selectedTS,
        showFrameLoader: true,
        hiddenFrameSrc: `${baseUrl}?url=${encodeURIComponent(frameUrl)}`
      },
      () => {
        if (!isDiffMode) {
          this.setBrowserSrc(frameUrl);
          this.tsUrl = frameUrl;
        }
      }
    );
  };

  handleOpenLink = snapshotUrl => () => {
    const frameUrl = _.replace(
      _.replace(snapshotUrl, /\d+/, '$&im_'),
      /https?/,
      'https'
    );
    this.setState(
      {
        showSaveToast: false
      },
      () => {
        this.setBrowserSrc(frameUrl);
        this.updateHistory(frameUrl, this.state.frameUrl);
      }
    );
  };

  getSelectedTS = () => {
    return this.state.selectedTS;
  };

  handleOverlayClick = () => {
    this.setState({
      showTimeTravel: false
    });
  };

  handleHistoryLogClick = url => () => {
    this.setBrowserSrc(url);
    this.updateHistory(url, this.state.frameUrl);
    this.setState({
      showURLHistory: false
    });
  };

  handleModeURL = url => {
    this.setBrowserSrc(url);
    this.updateHistory(url, this.state.frameUrl);
    this.setState({
      showMode: false
    });
  };

  storeHistory = frameUrl => {
    historyStore.addRecord(frameUrl);
  };

  sendExitMessage = () => {
    chrome.runtime.sendMessage({ message: 'VandalExit' });
  };

  handleExit = () => {
    this.sendExitMessage();
    window.location.href = this.props.url;
  };

  handleToggleTheme = setTheme => theme => {
    setTheme(theme);
    this.props.root.setAttribute('data-theme', theme);
  };

  handleThemeLoad = theme => {
    this.props.root.setAttribute('data-theme', theme);
  };

  handleCalendarChange = (selectedMonth, selectedYear) => {
    this.setState({
      selectedMonth,
      selectedYear
    });
  };

  handleDiffMode = url => {
    const baseUrl = chrome.runtime.getURL('hidden-iframe.html');
    this.setState({
      isDiffMode: true,
      hiddenFrameSrc: url ? `${baseUrl}?url=${encodeURIComponent(url)}` : null
    });
  };

  handleStartDiff = () => {};

  render() {
    const {
      sparkline,
      firstTS,
      lastTS,
      url,
      selectedTS,
      selectedMonth,
      selectedYear,
      redirectedTS,
      showTimeTravel,
      showFrameLoader,
      showURLLoader,
      showMode,
      showURLInfo,
      showURLHistory,
      showSaveProgress,
      showSaveToast,
      contentLocation,
      redirectTSCollection,
      selectedTabIndex,
      frameUrl,
      tempUrl,
      history,
      showBlockError,
      showEmptyError,
      showSaveError,
      showSparklineConnErr,
      showInvalidContextError,
      isDiffMode,
      hiddenFrameSrc
    } = this.state;
    console.log('App:render=>url ', url);
    console.log('history: ', history);

    return (
      <ShadowDOM
        include={[
          'chrome-extension://hjmnlkneihjloicfbdghgpkppoeiehbf/vandal.css'
        ]}>
        <div className="vandal-root">
          <ThemeProvider onLoad={this.handleThemeLoad}>
            {({ theme, setTheme }) => (
              <div
                className="vandal-container"
                ref={_ref => (this.containerRef = _ref)}>
                <Frame
                  ref={_ref => (this.frameRef = _ref)}
                  theme={theme}
                  url={url}
                  frameUrl={frameUrl}
                  tempUrl={tempUrl}
                  history={history}
                  isDiffMode={isDiffMode}
                  showTimeTravel={showTimeTravel}
                  showURLInfo={showURLInfo}
                  showFrameLoader={showFrameLoader}
                  showURLLoader={showURLLoader}
                  showURLHistory={showURLHistory}
                  toggleTimeTravel={this.handleToggleTimeTravel}
                  toggleURLInfo={this.handleToggleURLInfo}
                  toggleURLHistory={this.handleToggleURLHistory}
                  toggleModeView={this.handleToggleModeView}
                  onSave={this.debouncedHandleSave}
                  saveInProgress={showSaveProgress}
                  redirectedTS={redirectedTS}
                  selectedTS={selectedTS}
                  setBrowserSrc={this.setBrowserSrc}
                  onExit={this.handleExit}
                  onDiffMode={this.handleDiffMode}
                  onToggleTheme={this.handleToggleTheme(setTheme)}
                />
                {showTimeTravel && (
                  <TimeTravel
                    theme={theme}
                    showSparklineConnErr={showSparklineConnErr}
                    sparkline={sparkline}
                    firstTS={firstTS}
                    lastTS={lastTS}
                    selectedTS={selectedTS}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    redirectedTS={redirectedTS}
                    selectedTabIndex={selectedTabIndex}
                    url={url}
                    onSelect={this.handleTSSelect}
                    onTabChange={this.handleTabChange}
                    onCalendarChange={this.handleCalendarChange}
                    redirectTSCollection={redirectTSCollection}
                    onRetry={this.loadSparkline}
                    onClose={this.closeTimeTravel}
                  />
                )}
                {showURLInfo && (
                  <URLInfo
                    url={frameUrl}
                    selectedTS={selectedTS}
                    redirectedTS={redirectedTS}
                    redirectTSCollection={redirectTSCollection}
                    onClose={this.closeURLInfo}
                  />
                )}
                {showURLHistory && (
                  <URLHistory
                    containerRef={this.containerRef}
                    url={this.props.url}
                    frameUrl={frameUrl}
                    onLogClick={this.handleHistoryLogClick}
                    onClose={this.handleToggleURLHistory}
                  />
                )}
                {showMode && (
                  <Mode
                    mode={showMode}
                    sparkline={sparkline}
                    theme={theme}
                    url={this.props.url}
                    openURL={this.handleModeURL}
                    onClose={this.handleToggleClose}
                  />
                )}
                {isDiffMode && hiddenFrameSrc && (
                  <iframe
                    src={hiddenFrameSrc}
                    className="vandal-hidden-frame"
                  />
                )}
                <DiffPanel
                  show={isDiffMode}
                  selectedTS={selectedTS}
                  takeDiff={this.handleStartDiff}
                />
                <Toast className="vandal__toast-save" show={showSaveProgress}>
                  <div>Saving Page to Archive...</div>
                </Toast>
                <Toast
                  className="vandal__toast-save vandal__toast-save-error"
                  show={showSaveError}>
                  <div>Error saving to Archive. Please try again.</div>
                </Toast>
                <Toast className="vandal__toast-url" show={showSaveToast}>
                  <div className="vandal__toast-link">
                    <a href={contentLocation} target="_blank">
                      {contentLocation}
                    </a>
                  </div>
                  <div className="vandal__toast-actions">
                    <button
                      className="vandal__toast-link-open"
                      onClick={this.handleOpenLink(contentLocation)}>
                      open
                    </button>
                    <button
                      className="vandal__toast-link-close"
                      onClick={this.handleCloseSaveToast}>
                      close
                    </button>
                  </div>
                </Toast>
                <Toast
                  className={cx({
                    'vandal__toast-block-error': true,
                    'vandal__toast-block-error--default': !isArchiveUrl(
                      frameUrl
                    )
                  })}
                  show={showBlockError}
                  exit={0}>
                  <div>
                    The page cannot be rendered.
                    {isArchiveUrl(frameUrl) && (
                      <span>
                        {' '}
                        Please try the web archive link
                        <a
                          target="_blank"
                          className="vandal__toast-block-link"
                          href={stripIm(frameUrl)}>
                          here
                        </a>
                        <Icon
                          name="close"
                          className="vandal__toast-block__close"
                          onClick={this.handleCloseToast}
                        />
                      </span>
                    )}
                    {!isArchiveUrl(frameUrl) && (
                      <span>
                        {' '}
                        Please choose an{' '}
                        <a
                          className="vandal__toast-block-tt-link"
                          onClick={this.openTimeTravel}>
                          archive snapshot
                        </a>
                        .
                      </span>
                    )}
                  </div>
                </Toast>
                <Toast
                  className="vandal__toast-empty-error"
                  show={showEmptyError}
                  exit={0}>
                  <div>
                    <span>
                      No snapshots found for this url. Click on Save to create
                      one.
                    </span>
                    <Icon
                      name="close"
                      className="vandal__toast-block__close"
                      onClick={this.handleCloseToast}
                    />
                  </div>
                </Toast>
                <Toast
                  className="vandal__toast-empty-error"
                  show={showInvalidContextError}
                  exit={0}>
                  <div>
                    <span>
                      Found an invalid session. Please reload this extension by
                      clicking on it's icon.
                    </span>
                    <Icon
                      name="close"
                      className="vandal__toast-block__close"
                      onClick={this.handleCloseToast}
                    />
                  </div>
                </Toast>
              </div>
            )}
          </ThemeProvider>
        </div>
      </ShadowDOM>
    );
  }

  onMessage = async request => {
    if (request.message === 'frameHTML') {
    } else if (request.message === 'URLLoaded') {
      this.complete = true;
      this.setState({ showURLLoader: false, showBlockError: false });
    } else if (request.message === 'errorOnLocationChange') {
      this.setState({ showURLLoader: false, showBlockError: false });
      if (
        _.get(request.data, 'error') === 'net::ERR_BLOCKED_BY_CLIENT' ||
        _.get(request.data, 'error') === 'net::ERR_BLOCKED_BY_RESPONSE' ||
        _.get(request.data, 'error') === 'net::ERR_CERT_AUTHORITY_INVALID'
      ) {
        let { history, frameUrl: previousFrameUrl } = this.state;
        const url = _.get(request, 'data.url');
        this.setState(
          {
            showBlockError: true,
            frameUrl: url,
            url: stripOffTag(stripArchiveUrl(url))
          },
          () => {
            if (this.blockErrTimeout) {
              clearTimeout(this.blockErrTimeout);
            }
            this.blockErrTimeout = setTimeout(() => {
              this.setState({
                showBlockError: false
              });
            }, 5000);
          }
        );
        if (_.first(history) !== url) {
          this.updateHistory(url, previousFrameUrl);
          this.storeHistory(url);
        }
      } else if (
        _.get(request.data, 'error') === 'net::ERR_ABORTED' &&
        this.props.url.indexOf('https://') === 0
      ) {
        const urlObj = new URL(_.get(request, 'data.url'));
        if (urlObj.protocol === 'http:') {
          urlObj.protocol = 'https:';
          this.setBrowserSrc(urlObj.href);
          this.updateHistory(urlObj.href, this.state.frameUrl);
          this.storeHistory(urlObj.href);
        }
      }
    } else if (request.message === 'frameMouseDown') {
      this.closeAllMenus();
    } else if (request.message === 'historyChange') {
      chrome.runtime.sendMessage({ message: 'URLLoading' });

      let {
        history,
        url: previousUrl,
        frameUrl: previousFrameUrl
      } = this.state;
      const frameUrl = _.get(request.data, 'url');
      const url = stripOffTag(stripArchiveUrl(frameUrl));
      this.setState({
        frameUrl,
        url,
        tempUrl: frameUrl
      });

      // Add url to history collection and ignore if user is navigating through back/forward buttons
      if (_.get(request, 'data.type') !== 'auto') {
        this.updateHistory(frameUrl, previousFrameUrl);
        this.storeHistory(frameUrl);
      } else if (!this.complete && previousUrl !== url) {
        this.setState({
          history: _.map(history, item => {
            return item === previousUrl ? url : item;
          })
        });
      }
    } else if (request.message === 'locationChange') {
      chrome.runtime.sendMessage({ message: 'URLLoading' });

      const frameUrl = _.get(request.data, 'url');
      this.transitionType = _.get(request.data, 'type');

      this.complete = false;

      this.setState({
        showURLLoader: true,
        showBlockError: false,
        showEmptyError: false,
        tempUrl: frameUrl
      });

      if (isArchiveUrl(frameUrl)) {
        //toggle frame loader
        if (this.frameLoaderTimeout) {
          clearTimeout(this.frameLoaderTimeout);
        }
        setTimeout(() => {
          this.frameLoaderTimeout = this.setState({ showFrameLoader: false });
        }, 2500);

        const linkTS = _.parseInt(_.get(getDateTsFromUrl(frameUrl), 'ts'));

        //set url on address bar
        //if TS already present on redirect collection, then set it early.
        const { redirectTSCollection } = this.state;
        const linkUrl = stripOffTag(stripArchiveUrl(frameUrl));
        this.setState({
          url: linkUrl,
          selectedTS: redirectTSCollection[linkTS] || linkTS,
          redirectedTS: redirectTSCollection[linkTS] ? linkTS : null
        });
      } else {
        this.setState({
          selectedTS: null,
          redirectedTS: null,
          url: stripOffTag(frameUrl)
        });
      }
    } else if (request.message === 'redirectMismatch') {
      this.authRedirect = _.get(request, 'data.redirectHost');
    } else if (request.message === 'onCommit') {
      let {
        redirectTSCollection,
        selectedTS,
        url: previousUrl,
        frameUrl: previousFrameUrl,
        showTimeTravel
      } = this.state;

      const frameUrl = _.get(request, 'data.url');
      const linkUrl = stripOffTag(stripArchiveUrl(frameUrl));

      console.log('linkurl: ', linkUrl);

      if (showTimeTravel) {
        this.loadSparkline(linkUrl);
      }

      if (this.tsUrl === frameUrl && _.get(request, 'data.type') === 'auto') {
        this.tsUrl = null;
        this.updateHistory(frameUrl, previousFrameUrl);
        this.storeHistory(frameUrl);
      }

      //On click of link in archive page
      const linkTS =
        this.transitionType === 'archiveLink'
          ? _.parseInt(_.get(getDateTsFromUrl(frameUrl), 'ts'))
          : null;
      if (linkTS) {
        this.setState({ selectedTS: linkTS });
      }

      this.setState({
        frameUrl,
        url: linkUrl,
        tempUrl: frameUrl
      });

      if (_.get(request, 'data.type') === 'redirect') {
        const redirectedTS = _.parseInt(
          _.get(getDateTsFromUrl(frameUrl), 'ts')
        );

        if (this.authRedirect) {
          this.authRedirect = null;
          return;
        }
        this.updateHistory(frameUrl, previousFrameUrl);
        this.storeHistory(frameUrl);

        if (!this.transitionType) {
          if (_.indexOf(_.keys(redirectTSCollection), redirectedTS) < 0) {
            redirectTSCollection[redirectedTS] = selectedTS;
            this.setState({
              redirectedTS,
              redirectTSCollection
            });
          }
        }

        //Url was redirected. Reset TS.
        if (!isUrlEqual(linkUrl, previousUrl)) {
          console.log(
            'linkUrl: ',
            linkUrl,
            'previousUrl: ',
            previousUrl,
            'redirectedTS: ',
            redirectedTS
          );
          delete redirectTSCollection[redirectedTS];
          this.setState({
            selectedTS: redirectedTS,
            redirectTSCollection
          });
        }
      }

      // Add url to history collection and ignore if user is navigating through back/forward buttons
      else if (_.get(request, 'data.type') !== 'auto') {
        this.updateHistory(frameUrl, previousFrameUrl);
        this.storeHistory(frameUrl);
      }
    }
  };

  checkValidity = () => {
    try {
      chrome.runtime.sendMessage({ message: 'checkValidity' });
    } catch (ex) {
      if (ex.message && ex.message.indexOf('invalidated') > -1) {
        this.setState({ showInvalidContextError: true });
      }
    }
  };

  async componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
    chrome.runtime.sendMessage({ message: 'VandalLoaded' }, () => {
      this.setBrowserSrc(this.props.url);
    });
    document.addEventListener('beforeunload', this.sendExitMessage, false);
    document.addEventListener('visibilitychange', this.checkValidity);
    await historyStore.loadRecords(this.props.url);
    this.storeHistory(this.props.url);
    await drawerStore.load();
    // this.loadSparkline(this.state.url);
    // this.loadOffscreenFrame();
  }

  loadOffscreenFrame = () => {
    let iframe = document.createElement('iframe');
    iframe.src =
      'https://web.archive.org/web/20190301064336im_/https://www.google.com/';

    iframe.id = 'vandal-inner-frame';
    iframe.style.visibility = 'hidden';
    iframe.style.border = '0px';
    iframe.setAttribute('frameborder', '0');
    document.body.appendChild(iframe);
  };

  componentWillUnmount() {
    document.removeEventListener('beforeunload', this.sendExitMessage);
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }
}
