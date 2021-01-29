import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import styles from "./urlloader.module.css";

const URLLoader = ({ className }) => (
  <div className={cx({ [styles.loader]: true, [className]: true })}>
    <div />
  </div>
);

URLLoader.propTypes = {
  className: PropTypes.string.isRequired
};

export default URLLoader;
