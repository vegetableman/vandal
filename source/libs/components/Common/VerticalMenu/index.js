import React from 'react';
import _ from 'lodash';
import cx from 'classnames';
import withDialog from '../withDialog';
import Icon from '../icon';
import './style.css';

class List extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isDialogClosed &&
      nextProps.isDialogClosed !== this.props.isDialogClosed
    ) {
      nextProps.onClose();
    }
  }

  render() {
    const { options, handleOption, dialogRef } = this.props;
    return (
      <ul className="vandal-vertical-menu__list" ref={dialogRef}>
        {_.map(options, (option, index) => {
          return option.title ? (
            <li className="vandal-vertical-menu__list__item" key={index}>
              {option.text}
            </li>
          ) : (
            <li
              className="vandal-vertical-menu__list__item"
              key={index}
              onMouseDown={handleOption(option.value, option.hideOnSelect)}>
              {option.text}
            </li>
          );
        })}
      </ul>
    );
  }
}

const WithDialogList = withDialog(List);

class VerticalMenu extends React.PureComponent {
  static defaultProps = {
    onSelect: () => {},
    show: null
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
    console.log('constructor: visible: ', this.state.visible);
  }

  handleOption = (value, hideOnSelect = true) => event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(value, event);
    if (hideOnSelect) {
      this.setState({ visible: false });
    }
  };

  toggleMenu = e => {
    this.setState(prevState => {
      return { visible: !prevState.visible };
    });
  };

  hideMenu = () => {
    if (this.state.visible) this.setState({ visible: false });
  };

  render() {
    const { options } = this.props;
    const { visible } = this.state;

    return (
      <div
        className={cx({
          'vandal-vertical-menu': true,
          'vandal-vertical-menu--selected': visible
        })}
        ref={_ref => (this.wrapperRef = _ref)}>
        <div
          className="vandal-vertical-menu-icon-container"
          onClick={this.toggleMenu}>
          <Icon name="verticalMenu" className="vandal-vertical-menu-icon" />
        </div>
        {visible && (
          <WithDialogList
            options={options}
            handleOption={this.handleOption}
            onClose={this.toggleMenu}
          />
        )}
      </div>
    );
  }
}

export default VerticalMenu;
