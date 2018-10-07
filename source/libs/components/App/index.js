import React from 'react';
import Frame from '../Frame';
import TimeTravel from '../TimeTravel';
import { getLocation, api } from '../../utils';
import './style.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      years: {},
      url: encodeURIComponent(getLocation())
    }
  }

  render() {
    const { sparkline, url } = this.state;
    return (
      <div className="vandal-container">
        <Frame/>
        <TimeTravel sparkline={sparkline} url={url}/>
      </div>
    );
  }

  async componentDidMount() {
    const { url } = this.state;
    const sparklineData = await api(`https://web.archive.org/__wb/sparkline?url=${url}&collection=web&output=json`);
    const { years } = sparklineData;
    this.setState({ sparkline: years })
  }
}