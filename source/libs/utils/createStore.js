import _ from 'lodash';

let uid = 1;
const createStore = (state, actions, id = uid++) => {
  const store = {
    id,
    initialState: { ...state },
    state,
    subscriptions: new Set(),
    destroy: () => {
      store.subscriptions.clear();
    },
    subscribe: callback => {
      store.subscriptions.add(callback);
      return () => store.subscriptions.delete(callback);
    },
    getState: () => store.state,
    ..._.reduce(
      actions,
      (acc, __, name) => ({
        ...acc,
        ...{
          [name]: async (...args) => {
            let result = await actions[name](...args);
            if (_.isFunction(result)) {
              result = await actions[name](...args)(store.state);
            }
            store.state = { ...store.state, ...result };
            store.subscriptions.forEach(callback => callback(store.state));
            return result;
          }
        }
      }),
      {}
    )
  };
  return store;
};

export default createStore;
