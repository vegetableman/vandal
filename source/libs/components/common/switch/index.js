import React, { useState } from "react";
import PropTypes from "prop-types";
import Switch from "react-switch";

const DefaultSwitch = ({
  label, defaultValue, onChange, ...others
}) => {
  const [checked, setChecked] = useState(defaultValue);

  const toggleChange = (mchecked) => {
    setChecked(mchecked);
    onChange(mchecked);
  };

  return (
    <div>
      <span>{label}</span>
      <Switch {...others} onChange={toggleChange} checked={checked} />
    </div>
  );
};

DefaultSwitch.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.bool
};

DefaultSwitch.defaultProps = {
  defaultValue: false
};

export default DefaultSwitch;
