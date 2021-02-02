import React from "react";
import PropTypes from "prop-types";

import "./style.css";

const ArchiveLoader = ({ theme }) => (
  <div
    className={`la-timer ${theme === "dark" ? "la-dark" : "la-light"} la-sm`}
  >
    <div />
  </div>
);

ArchiveLoader.propTypes = {
  theme: PropTypes.string.isRequired
};

export default ArchiveLoader;
