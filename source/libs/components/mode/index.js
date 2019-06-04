import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Historical from '../historical';
import Terms from './terms';
import './style.css';

export default class Mode extends React.Component {
  state = {
    selectedTabIndex: 0,
    showTermView: false
  };

  handleTabChange = selectedTabIndex => {
    this.setState({ selectedTabIndex });
    if (this.historicalRef) {
      this.historicalRef.abort();
    }
  };

  handleKeydown = e => {
    if (e.keyCode === 27) {
      this.props.onClose();
    }
  };

  handleTermClose = () => {
    this.setState({ showTermView: false });
  };

  handleOpenSettings = () => {
    chrome.runtime.sendMessage({ message: 'openOptionsPage' });
  };

  componentDidMount() {
    document.body.style.overflow = 'hidden';
    if (this.modeRef) {
      this.modeRef.focus();
    }
  }

  render() {
    const { sparkline, url, mode, theme, openURL } = this.props;
    const { showTermView } = this.state;

    return (
      <div
        className="vandal-mode-view"
        onKeyDown={this.handleKeydown}
        ref={_ref => (this.modeRef = _ref)}
        tabIndex="0">
        {showTermView && <Terms onClose={this.handleTermClose} />}
        <Tabs
          className="vandal-mode__tabs"
          selectedTabClassName="vandal-mode__tab--active"
          onSelect={this.handleTabChange}
          defaultIndex={mode === 'histView' ? 0 : 1}>
          <TabList className="vandal-mode__tab-list">
            <Tab className="vandal-mode__tab vandal-mode__tab-historical">
              Historical
            </Tab>
            <Tab className="vandal-mode__tab vandal-mode__tab-diff">Diff</Tab>
          </TabList>

          <TabPanel className="vandal-mode__tab-panel">
            <Historical
              theme={theme}
              ref={_ref => (this.historicalRef = _ref)}
              sparkline={sparkline}
              url={url}
              openURL={openURL}
              onClose={this.props.onClose}
            />
          </TabPanel>
          {/* <TabPanel className="vandal-mode__tab-panel">
            <DiffView
              ref={_ref => (this.diffViewRef = _ref)}
              sparkline={sparkline}
              url={url}
              openURL={openURL}
              onClose={this.props.onClose}
            />
          </TabPanel> */}
        </Tabs>
        <div className="vandal-mode__misc-container">
          <Icon
            name="settings"
            className="vandal-mode__settings"
            onClick={this.handleOpenSettings}
          />
          <Icon
            name="close"
            className="vandal-mode__close"
            onClick={this.props.onClose}
          />
        </div>
      </div>
    );
  }
}
