import React from 'react';
import './style.css';
import HistoryIcon from './history.svg';
import CloseIcon from './close.svg';

export default class URLBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="vandal-url-container">
        <input className="vandal-url__input"/>
        <div className="vandal-url__filter">
          <div className="vandal-url__date">
            <CloseIcon className="vandal-url__date__close" width={15} fill={"#777"}/>
            <div className="vandal-url__date__value">9th Aug 2018, 09:27:33</div>
          </div>
          <div className="vandal-url__wayback">
            <HistoryIcon width={22} fill={"#777"}/>
          </div>
        </div>
      </div>
    );
  }
}