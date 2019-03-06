import React from 'react';
import _ from 'lodash';
import PlusIcon from './plus.svg';
import DiffItem from './DiffItem';
import DiffViewer from './DiffViewer';
import './style.css';

export default class DiffView extends React.Component {
  state = {
    items: [{ id: 0, editMode: false }],
    showDiff: false,
    snapshots: []
  };

  handleKeydown = () => {};

  handleAddDiff = () => {
    const { items } = this.state;
    const last = _.get(_.last(items), 'id', 0);
    this.setState({
      items: [...items, ...[{ id: last + 1, editMode: true }]]
    });
  };

  handleDelete = id => () => {
    const { items, snapshots } = this.state;
    delete snapshots[id];
    this.setState({
      items: _.filter(items, item => {
        return item.id !== id;
      }),
      snapshots
    });
  };

  handleDiff = () => {
    this.setState({
      showDiff: true
    });
  };

  handleCloseDiff = () => {
    this.setState({
      showDiff: false
    });
    if (this.diffViewRef) {
      this.diffViewRef.focus();
    }
  };

  handleSnapshot = (index, snapshot, ts) => {
    const { snapshots } = this.state;
    snapshots[index] = { snapshot, ts };
    this.setState({
      snapshots
    });
  };

  render() {
    const { items, showDiff, snapshots } = this.state;
    return (
      <div
        className="vandal-diff-view"
        onKeyDown={this.handleKeydown}
        ref={_ref => (this.diffViewRef = _ref)}
        tabIndex="0">
        <div className="vandal-diff-list">
          {_.map(items, (item, index) => {
            return (
              <DiffItem
                {...item}
                index={index}
                key={item.id}
                url={this.props.url}
                onDelete={this.handleDelete}
                onSnapshot={this.handleSnapshot}
              />
            );
          })}
          <div className="vandal-diff__add">
            <PlusIcon
              className="vandal-diff__add__icon"
              onClick={this.handleAddDiff}
            />
          </div>
        </div>
        <div className="vandal-diff-footer">
          <button
            className="vandal-diff__button"
            onClick={this.handleDiff}
            disabled={_.size(_.compact(snapshots)) < 2}>
            View Diff
          </button>
        </div>
        {showDiff && (
          <DiffViewer snapshots={snapshots} onClose={this.handleCloseDiff} />
        )}
      </div>
    );
  }
}
