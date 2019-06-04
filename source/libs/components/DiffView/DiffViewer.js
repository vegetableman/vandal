import React from 'react';
import _ from 'lodash';
import ImageDiff from 'react-image-diff';
import { Icon } from '../common';
import { getDateTimeFromTS, toTwelveHourTime } from '../../utils';
import './style.css';

export default class DiffViewer extends React.Component {
  static defaultProps = {
    snapshots: ['', '']
  };

  state = {
    // showDiff: false,
    type: 'swipe',
    beforeSnapshot: this.props.snapshots[0],
    afterSnapshot: this.props.snapshots[1],
    value: 0.5,
    loadIndex: 0
  };

  diffViewerRef = React.createRef();

  handleKeydown = e => {
    if (e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      this.props.onClose();
    }
  };

  handleBeforeChange = e => {
    const { snapshots } = this.props;
    const { value } = e.target;

    this.setState({
      beforeSnapshot: _.find(snapshots, {
        ts: value !== 'current' ? +value : value
      })
    });
  };

  handleAfterChange = e => {
    const { snapshots } = this.props;
    const { value } = e.target;

    this.setState({
      afterSnapshot: _.find(snapshots, {
        ts: value !== 'current' ? +value : value
      })
    });
  };

  handleModeChange = e => {
    const { value: type } = e.target;
    this.setState({
      loadIndex: 0,
      type
    });
  };

  handleRangeChange = e => {
    this.setState({
      value: _.parseFloat(e.target.value)
    });
  };

  handleImgLoad = () => {
    setTimeout(() => {
      this.setState(prevState => ({
        loadIndex: prevState.loadIndex + 1
      }));
    }, 250);
  };

  render() {
    const {
      // showDiff,
      afterSnapshot,
      beforeSnapshot,
      type,
      value,
      loadIndex
    } = this.state;
    const { snapshots } = this.props;
    console.log('loadIndex: ', loadIndex);
    return (
      <div
        className="vandal-diff-viewer"
        onKeyDown={this.handleKeydown}
        ref={this.diffViewerRef}
        tabIndex="0">
        <div className="vandal-diff-viewer__settings">
          <div className="vandal-diff-viewer__mode">
            <div className="vandal-diff-viewer__mode-title"> Diff Mode: </div>
            <select
              className="vandal-diff-viewer__mode__select"
              onChange={this.handleModeChange}
              value={type}>
              <option value="difference">Difference</option>
              <option value="swipe">Swipe</option>
              <option value="fade">Onion Skin</option>
            </select>
            <div className="vandal-diff-viewer__mode__controls">
              {type !== 'difference' && (
                <input
                  className="vandal-diff-viewer__mode__range"
                  type="range"
                  defaultValue={value}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={this.handleRangeChange}
                />
              )}
            </div>
          </div>
          <div className="vandal-diff-viewer__timestamps">
            <div className="vandal-diff-viewer__timestamps__title">
              Selected Timestamps:
            </div>
            <div className="vandal-diff-viewer__timestamp__list">
              <select
                className="vandal-diff-viewer__timestamp__select"
                value={beforeSnapshot.ts}
                onChange={this.handleBeforeChange}>
                {_.map(snapshots, (s, index) => {
                  const dateObj =
                    typeof s.ts === 'number' ? getDateTimeFromTS(s.ts) : null;
                  return (
                    <option
                      className="vandal-diff-viewer__timestamp__item"
                      key={index}
                      value={s.ts}>
                      {dateObj
                        ? `${dateObj.date}, ${toTwelveHourTime(dateObj.ts)}`
                        : s.ts}
                    </option>
                  );
                })}
              </select>
              <select
                className="vandal-diff-viewer__timestamp__select"
                value={afterSnapshot.ts}
                onChange={this.handleAfterChange}>
                {_.map(snapshots, (s, index) => {
                  const dateObj =
                    typeof s.ts === 'number' ? getDateTimeFromTS(s.ts) : null;
                  return (
                    <option
                      className="vandal-diff-viewer__timestamp__item"
                      key={index}
                      value={s.ts}>
                      {dateObj
                        ? `${dateObj.date}, ${toTwelveHourTime(dateObj.ts)}`
                        : s.ts}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        <div className="ImageDiff-container">
          <ImageDiff
            before={_.get(beforeSnapshot, 'snapshot')}
            after={_.get(afterSnapshot, 'snapshot')}
            type={type}
            value={value}
            onLoad={this.handleImgLoad}
          />
        </div>
        <Icon
          data-for="vandal-diff-viewer--close"
          data-tip="Close [Esc]"
          className="vandal-diff-viewer__close"
          onClick={this.props.onClose}
        />
      </div>
    );
  }

  componentDidMount() {
    if (this.diffViewerRef) {
      this.diffViewerRef.current.focus();
    }
  }
}
