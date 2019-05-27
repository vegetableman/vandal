import React, { Component } from 'react';
import Switch from 'react-switch';

export default class DefaultSwitch extends Component {
  state = { checked: this.props.defaultValue };

  handleChange = checked => {
    this.setState({ checked });
    this.props.onChange(checked);
  };

  render() {
    const { label, ...others } = this.props;
    return (
      <label>
        <span>{label}</span>
        <Switch
          {...others}
          onChange={this.handleChange}
          checked={this.state.checked}
        />
      </label>
    );
  }
}
