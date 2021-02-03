import React from "react";
import PropTypes from "prop-types";

export default class Terms extends React.Component {
  constructor(props) {
    super(props);
    this.disableClose = true;
  }

  handleChange = () => {
    this.setState((prevState) => ({ disableClose: !prevState.disableClose }));
  };

  render() {
    return (
      <div className="vandal-terms-overlay">
        <div className="vandal-terms-content">
          <div className="vandal-terms-hero" />
          <div className="vandal-terms__desc">
            <p style={{ margin: "0 0 10px 0", padding: 0 }}>
              The story so far...
            </p>
            <b>Vandal Savage</b>
            : This is an outrage !
            <p>
              A colony of giant cockroaches have stolen compute resources from
              Vandal needed to sustain the Historical View. As a result, the
              screenshot service required to capture archive snapshots is being
              run on meagre resources.
            </p>
            {" "}
            <p style={{ margin: 0, padding: 0 }}>
              As for now, it&apos;s only a matter of time until this service runs out
              of operational juice, until, Vandal figures out another way.
            </p>
          </div>
          <div className="vandal-terms__input-container">
            <label className="vandal-terms__input-label" htmlFor="vandal-terms-checkbox">
              <input
                id="vandal-terms-checkbox"
                type="checkbox"
                className="vandal-terms__input-checkbox"
                onChange={this.handleChange}
              />
              I do understand this post-apocalyptic situation.
            </label>
            <button
              type="button"
              className="vandal-terms__close-btn"
              disabled={this.state.disableClose}
              onClick={this.props.onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Terms.propTypes = {
  onClose: PropTypes.string.isRequired
};
