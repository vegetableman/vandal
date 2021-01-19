import React, { useState } from 'react';
import Switch from 'react-switch';

const DefaultSwitch = ({ label, defaultValue, onChange, ...others }) => {
  const [checked, setChecked] = useState(defaultValue);

  const toggleChange = (mchecked) => {
    setChecked(mchecked);
    onChange(mchecked);
  };

  return (
    <label>
      <span>{label}</span>
      <Switch {...others} onChange={toggleChange} checked={checked} />
    </label>
  );
};

export default DefaultSwitch;
