import React from 'react';
import styles from './urlloader.module.css';
import cx from 'classnames';

const URLLoader = ({ className }) => (
  <div className={cx({ [styles.loader]: true, [className]: true })}>
    <div />
  </div>
);
export default URLLoader;
