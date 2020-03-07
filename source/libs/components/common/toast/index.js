import React, { memo, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './toast.module.css';
import { compareProps } from '../../../utils';

const Toast = memo(
  ({ children, className = '', err, exit = 1000, show, closeTimeout }) => {
    const [isVisible, toggleVisible] = useState(false);

    useEffect(() => {
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
        appear={true}
        mountOnEnter={true}
        unmountOnExit={true}
        classNames={{
          appear: styles.fade__appear,
          appearActive: styles.fade__appear__active,
          enter: styles.fade__enter,
          enterActive: styles.fade__enter__active,
          exit: styles.fade__exit,
          exitActive: styles.fade__exit__active
        }}
        timeout={{ enter: 1000, exit }}>
        <div className={`${styles.root} ${className}`}>
          <div className={`${styles.wrapper} ${err ? styles.err : ''}`}>
            {children}
          </div>
        </div>
      </CSSTransition>
    );
  },
  compareProps(['show'])
);

export default Toast;
