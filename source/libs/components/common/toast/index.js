import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import { CSSTransition } from "react-transition-group";
import styles from "./toast.module.css";
import { compareProps, useDidUpdateEffect } from "../../../utils";

const Toast = memo(
  ({
    children, className, err, exit, show, closeTimeout
  }) => {
    const [isVisible, toggleVisible] = useState(false);

    useDidUpdateEffect(() => {
      if (show) {
        toggleVisible(show);
      } else if (!show && closeTimeout) {
        setTimeout(() => {
          toggleVisible(show);
        }, closeTimeout);
      } else {
        toggleVisible(show);
      }
    }, [show]);

    return (
      <CSSTransition
        in={isVisible}
        appear
        mountOnEnter
        unmountOnExit
        classNames={{
          appear: styles.fade__appear,
          appearActive: styles.fade__appear__active,
          enter: styles.fade__enter,
          enterActive: styles.fade__enter__active,
          exit: styles.fade__exit,
          exitActive: styles.fade__exit__active
        }}
        timeout={{ enter: 1000, exit }}
      >
        <div className={`${styles.root} ${className}`}>
          <div className={`${styles.wrapper} ${err ? styles.err : ""}`}>
            {children}
          </div>
        </div>
      </CSSTransition>
    );
  },
  compareProps(["show"])
);

Toast.propTypes = {
  children: PropTypes.element.isRequired,
  className: PropTypes.string.isRequired,
  show: PropTypes.bool,
  err: PropTypes.bool,
  exit: PropTypes.number,
  closeTimeout: PropTypes.number
};

Toast.defaultProps = {
  err: false,
  exit: 1000,
  show: false,
  closeTimeout: 0
};

export default Toast;
