import React from "react";
import PropTypes from "prop-types";
import Transition from "react-transition-group/Transition";
import styles from "./historical.module.css";

const ENTER_DURATION = 300;

const transitionStates = {
  entering: {
    transform: "translateX(350px)"
  },
  entered: {
    transform: "translateX(0)"
  },
  exiting: {
    transform: "translateX(0)"
  },
  exited: {
    transform: "translateX(350px)"
  }
};

const transitionStyle = {
  transition: `all ${ENTER_DURATION}ms ease-in-out`,
  transitionProperty: "transform",
  willChange: "transform",
  transform: "translateX(350px)"
};

const Progress = ({ current, total, show }) => (
  <Transition
    enter
    appear
    in={show}
    timeout={{ enter: ENTER_DURATION, exit: 0 }}
  >
    {(state) => (
      <div
        className={styles.info__count}
        style={{
          ...transitionStyle,
          ...transitionStates[state]
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          Loading
          {" "}
          {current}
          {" "}
          of
          {" "}
          {total}
          {" "}
          snapshots...
        </div>
        <div style={{ fontSize: 12, fontWeight: "bold" }}>
          Meanwhile, you can grab some Casserole 🥘
        </div>
        <div style={{ fontSize: 12, paddingTop: 5, fontStyle: "italic" }}>
          Note: This process will take a while to reduce load on Archive
          servers.
        </div>
      </div>
    )}
  </Transition>
);

Progress.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  show: PropTypes.bool.isRequired
};

export default Progress;
