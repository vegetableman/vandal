import React from 'react';
import historyStore from './history';

const HistoryContext = React.createContext();

export default class HistoryProvider extends React.Component {
  state = {
    records: historyStore.getState().records
  };

  render() {
    return (
      <HistoryContext.Provider
        value={{
          records: this.state.records,
          clearRecords: historyStore.clearRecords
        }}>
        <HistoryContext.Consumer>{this.props.children}</HistoryContext.Consumer>
      </HistoryContext.Provider>
    );
  }

  async componentDidMount() {
    historyStore.subscribe(({ records }) => {
      this.setState({ records });
    });
  }
}
