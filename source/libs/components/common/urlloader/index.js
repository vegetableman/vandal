import React from "react";
import PropTypes from "prop-types";
import styles from "./urlloader.module.css";

const URLLoader = ({ className }) => (
  <div className={styles.loader}>
    <div className={className} />
  </div>
);

URLLoader.propTypes = {
  className: PropTypes.string
};

URLLoader.defaultProps = {
  className: null
};

export default URLLoader;
