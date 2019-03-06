import React from 'react';
import cx from 'classnames';
import URLBox from '../URLBox';
import { VerticalMenu, Switch } from '../Common';
import SaveIcon from './save.svg';
import OpenIcon from './open.svg';
import HeartIcon from './heart.svg';
import ReloadIcon from './reload.svg';
import TimestampIcon from './timestamp.svg';
import RightNavIcon from './rightnav.svg';
import LeftNavIcon from './leftnav.svg';
import './style.css';

const options = [
  {
    value: 'histView',
    text: 'Historical View'
  },
  {
    value: 'diffView',
    text: 'Diff View'
  },
  {
    value: 'wayback',
    text: (
      <div className="vandal-vertical__wayback__item">
        <span>Wayback Machine</span>
        <OpenIcon className="vandal-vertical__wayback__icon" width={11} />
      </div>
    )
  }
];

export default class Frame extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  handleOptions = (option, e) => {
    if (option === 'wayback') {
      window.open(`https://web.archive.org/web/*/${this.props.url}`, '_blank');
    } else if (option === 'switchTheme') {
      console.log(e);
    } else if (option === 'exit') {
      this.props.onExit();
    } else if (option === 'diffView') {
      this.props.onDiffMode();
    } else {
      this.props.toggleModeView(option);
    }
  };

  componentWillMount() {
    console.log('frame:componentWillMount');
  }

  componentWillReceiveProps() {
    console.log('frame:componentWillReceiveProps');
  }

  hideMenu() {
    this.menu.hideMenu();
  }

  handleTimestampClick = () => {
    chrome.runtime.sendMessage({ message: 'toggleDrawer' });
  };

  handleReload = () => {
    this.props.setBrowserSrc(this.props.tempUrl || this.props.frameUrl);
  };

  handleBack = () => {
    const { history, tempUrl, frameUrl, setBrowserSrc } = this.props;
    setBrowserSrc(
      tempUrl !== frameUrl && !_.includes(history, tempUrl)
        ? frameUrl
        : _.nth(history, Math.max(_.indexOf(history, tempUrl) - 1, 0))
    );
  };

  handleForward = () => {
    const { history, tempUrl, setBrowserSrc } = this.props;
    setBrowserSrc(
      _.nth(
        history,
        Math.min(_.lastIndexOf(history, tempUrl) + 1, _.size(history) - 1)
      )
    );
  };

  render() {
    const {
      showFrameMenu,
      onSave,
      saveInProgress,
      frameUrl,
      tempUrl,
      history,
      theme,
      ...others
    } = this.props;
    console.log(
      'frameurl: ',
      frameUrl,
      tempUrl,
      history,
      _.lastIndexOf(history, tempUrl || frameUrl),
      _.indexOf(history, tempUrl) === -1 ||
        _.lastIndexOf(history, tempUrl || frameUrl) === _.size(history) - 1
    );
    return (
      <div className="vandal-frame">
        <div className="vandal-frame__left">
          <div className="vandal-frame__navigation">
            <button
              className="vandal-frame__backward-nav__btn"
              title="Go back"
              disabled={_.indexOf(history, tempUrl || frameUrl) === 0}
              onClick={this.handleBack}>
              <LeftNavIcon className="vandal-frame__backward-nav__icon" />
            </button>
            <button
              className="vandal-frame__forward-nav__btn"
              title="Go forward"
              disabled={
                _.indexOf(history, tempUrl) === -1 ||
                _.lastIndexOf(history, tempUrl || frameUrl) ===
                  _.size(history) - 1
              }
              onClick={this.handleForward}>
              <RightNavIcon className="vandal-frame__forward-nav__icon" />
            </button>
          </div>
          <button className="vandal-frame__left-reload__btn">
            <ReloadIcon
              width={15}
              className={cx({
                'vandal-frame__reload-icon': true
              })}
              onClick={this.handleReload}
              title="reload"
            />
          </button>
        </div>
        <div className="vandal-frame__mid">
          <URLBox {...others} theme={theme} />
        </div>
        <div className="vandal-frame__right">
          <div className="vandal-frame__right__1">
            <button
              className={cx({
                'vandal-frame__save-btn': true,
                'vandal-frame__save-btn--disabled': saveInProgress
              })}
              onClick={onSave}
              title="Save Page to Archive">
              <SaveIcon className="vandal-frame__save-btn-icon" />
            </button>
            <button
              className="vandal-frame__timestamp-btn"
              onClick={this.handleTimestampClick}>
              <TimestampIcon className="vandal-frame__timestamp-icon" />
            </button>
          </div>
          <div className="vandal-frame__right__2">
            <VerticalMenu
              ref={_ref => (this.menu = _ref)}
              options={[
                ...options,
                {
                  value: 'switchTheme',
                  text: (
                    <div className="vandal-vertical__theme-switch__item">
                      <Switch
                        width={30}
                        height={15}
                        label="Dark Theme"
                        defaultValue={theme === 'dark'}
                        checkedIcon={false}
                        uncheckedIcon={false}
                        onColor="#f7780b"
                        className="vandal-vertical__theme-switch"
                        onChange={checked => {
                          this.props.onToggleTheme(checked ? 'dark' : 'light');
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
              ]}
              onSelect={this.handleOptions}
            />
            <div className="vandal-frame__donate-btn">
              <a
                href="https://archive.org/donate/?referrer=vandal"
                target="_blank">
                <HeartIcon className="vandal-frame__donate-btn-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
