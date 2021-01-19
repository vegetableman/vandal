import React, { useState, forwardRef, useImperativeHandle, memo } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import withDialog from '../withdialog';
import Icon from '../icon';

import styles from './verticalmenu.module.css';
import { compareProps } from '../../../utils';

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
      <ul
        className={cx({
          [styles.list]: true,
          [this.props.listClass]: !!this.props.listClass
        })}
        ref={dialogRef}>
        {_.map(options, (option, index) => {
          return option.title ? (
            <li
              className={cx({
                [styles.listItem]: true,
                [this.props.listItemClass]: !!this.props.listItemClass
              })}
              key={index}>
              {option.text}
            </li>
          ) : (
            <li
              className={styles.listItem}
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

const WithDialogList = withDialog(List, {
  ignoreClickOnClass: `.${styles.menu}`
});

const VerticalMenu = memo(
  forwardRef(({ onSelect = () => {}, ...props }, ref) => {
    const [isVisible, toggleMenu] = useState(false);

    const onOptionSelect = (value, hideOnSelect = true) => (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(value, event);
      if (hideOnSelect) {
        toggleMenu(false);
      }
    };

    useImperativeHandle(ref, () => ({
      hideMenu() {
        if (isVisible) toggleMenu(false);
      }
    }));

    return (
      <div
        className={cx({
          [styles.menu]: true,
          [props.className]: !!props.className
        })}>
        <div
          className={cx({
            [styles.iconContainer]: true,
            [props.iconContainerClass]: !!props.iconContainerClass
          })}
          onClick={() => {
            toggleMenu((prevState) => {
              return !prevState;
            });
          }}>
          <Icon
            name="verticalMenu"
            className={cx({
              [styles.icon]: true,
              [props.iconClass]: !!props.iconClass
            })}
          />
        </div>
        {isVisible && (
          <WithDialogList
            options={props.options}
            handleOption={onOptionSelect}
            onClose={() => {
              toggleMenu(false);
            }}
            listClass={props.listClass}
            listItemClass={props.listItemClass}
          />
        )}
      </div>
    );
  }),
  compareProps(['options'])
);

export default VerticalMenu;
