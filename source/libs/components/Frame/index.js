import React from 'react';
import URLBox from '../URLBox';
import './style.css';

export default class Frame extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="vandal-frame">
        <div className="vandal-frame__left">
        </div>
        <div className="vandal-frame__mid">
          <URLBox/>
        </div>
        <div className="vandal-frame__right">
        </div>
      </div>
    );
  }
}