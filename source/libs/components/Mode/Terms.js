import React from 'react';
import SettingsIcon from './settings.svg';

export default class Terms extends React.Component {
  state = {
    disableClose: true
  };

  handleChange = () => {
    this.setState(prevState => ({ disableClose: !prevState.disableClose }));
  };

  render() {
    return (
      <div className="vandal-terms-overlay">
        <div className="vandal-terms-content">
          <div className="vandal-terms-hero" />
          <div className="vandal-terms__desc">
            <p style={{ margin: '0 0 10px 0', padding: 0 }}>
              The story so far...
            </p>
            <b>Vandal Savage</b>: This is an outrage !
            <p>
              A colony of giant cockroaches have stolen compute resources from
              Vandal, needed to sustain the Historical and Diff View. As a
              result, the screenshot service required to capture archive
              snapshots is being run on meagre resources.
            </p>{' '}
            <p style={{ margin: 0, padding: 0 }}>
              As for now, it's only a matter of time until this service runs out
              of operational juice, until, Vandal figures out another way.
            </p>
            <p style={{ margin: 0, padding: 0 }}>
              Help Vandal manage this view by configuring your own screenshot
              service by clicking on the settings{' '}
              <SettingsIcon className="vandal-terms-settings-icon" /> icon
              above. Example screenshot services:
              <a
                style={{ color: '#fff', marginLeft: 10 }}
                href="https://www.prerender.cloud/docs/api"
                target="_blank">
                https://www.prerender.cloud/docs/api
              </a>
              {', '}
              <a
                style={{ color: '#fff' }}
                href="https://screen.rip/"
                target="_blank">
                https://screen.rip/
              </a>
            </p>
          </div>
          <div className="vandal-terms__input-container">
            <label className="vandal-terms__input-label">
              <input
                type="checkbox"
                className="vandal-terms__input-checkbox"
                onChange={this.handleChange}
              />
              I do understand this post-apocalyptic situation.
            </label>
            <button
              className="vandal-terms__close-btn"
              disabled={this.state.disableClose}
              onClick={this.props.onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}
