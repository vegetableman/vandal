/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React, {
  useState, forwardRef, useImperativeHandle, memo, useCallback
} from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import cx from "classnames";
import withDialog from "../withdialog";
import Icon from "../icon";

import styles from "./verticalmenu.module.css";
import { compareProps } from "../../../utils";

class List extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.isDialogClosed && prevProps.isDialogClosed !== this.props.isDialogClosed) {
      this.props.onClose();
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
        ref={dialogRef}
      >
        {_.map(options, (option, index) => (option.title ? (
          <li
            className={cx({
              [styles.list__item]: true,
              [this.props.listItemClass]: !!this.props.listItemClass
            })}
            key={index}
          >
            {option.text}
          </li>
        ) : (
          <li
            className={styles.list__item}
            key={index}
            onMouseDown={handleOption(option.value, option.hideOnSelect)}
          >
            {option.text}
          </li>
        )))}
      </ul>
    );
  }
}

List.propTypes = {
  dialogRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  onClose: PropTypes.func.isRequired,
  listClass: PropTypes.string.isRequired,
  handleOption: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  listItemClass: PropTypes.string,
  isDialogClosed: PropTypes.bool
};

List.defaultProps = {
  isDialogClosed: true,
  listItemClass: null
};

const WithDialogList = withDialog(List, {
  ignoreClickOnClass: `.${styles.menu}`
});

const VerticalMenu = memo(
  forwardRef(({
    onSelect = () => {}, className, iconClass, iconContainerClass, ...props
  }, ref) => {
    const [isVisible, toggleMenu] = useState(false);

    const onClick = useCallback(() => {
      toggleMenu((prevState) => !prevState);
    }, [toggleMenu]);

    const onOptionSelect = useCallback((value, hideOnSelect = true) => (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(value, event);
      if (hideOnSelect) {
        toggleMenu(false);
      }
    }, [onSelect]);

    const onClose = useCallback(() => {
      toggleMenu(false);
    }, [toggleMenu]);

    useImperativeHandle(ref, () => ({
      hideMenu() {
        if (isVisible) toggleMenu(false);
      }
    }));

    return (
      <div
        className={cx({
          [styles.menu]: true,
          [className]: !!className
        })}
      >
        <div
          role="menu"
          tabIndex={0}
          className={cx({
            [styles.icon__container]: true,
            [iconContainerClass]: !!iconContainerClass
          })}
          onClick={onClick}
        >
          <Icon
            name="verticalMenu"
            className={cx({
              [styles.icon]: true,
              [iconClass]: !!iconClass
            })}
          />
        </div>
        {isVisible && (
          <WithDialogList
            options={props.options}
            handleOption={onOptionSelect}
            onClose={onClose}
            listClass={props.listClass}
            listItemClass={props.listItemClass}
          />
        )}
      </div>
    );
  }),
  compareProps(["options"])
);

VerticalMenu.propTypes = {
  className: PropTypes.string.isRequired,
  iconClass: PropTypes.string.isRequired,
  listClass: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  iconContainerClass: PropTypes.string,
  listItemClass: PropTypes.string,
  onSelect: PropTypes.func
};

VerticalMenu.defaultProps = {
  onSelect: () => {},
  iconContainerClass: null,
  listItemClass: null
};

export default VerticalMenu;
