import { Machine, assign } from 'xstate';
import _ from 'lodash';
import { xhr } from '../../utils';

const ROOT_URL = 'https://web.archive.org';

const saveMachine = Machine(
  {
    id: 'save',
    initial: 'close',
    context: {
      savedArchiveURL: null,
      progress: 0
    },
    states: {
      open: {
        id: 'open',
        initial: 'loading',
        on: {
          CLOSE: 'close'
        },
        states: {
          loading: {
            after: {
              30000: 'failure.timeout'
            },
            invoke: {
              id: 'saveToArchive',
              src: 'saveToArchive',
              onDone: {
                target: 'success',
                actions: assign({
                  savedArchiveURL: (_ctx, e) => `${ROOT_URL}${e.data}`
                })
              },
              onError: 'failure.rejection'
            }
          },
          failure: {
            states: {
              rejection: {
                on: {
                  SAVE: '#open'
                }
              },
              timeout: {
                on: {
                  SAVE: '#open'
                }
              }
            }
          },
          success: {
            entry: 'reloadSparkline'
          }
        }
      },
      close: {
        on: {
          SAVE: 'open'
        }
      }
    },
    on: {
      OPEN_URL_IN_VANDAL: {
        target: 'close',
        actions: 'setBrowserURL'
      }
    }
  },
  {
    services: {
      saveToArchive: (_ctx, e) =>
        new Promise(async (resolve, reject) => {
          const [contentLocation, err] = await xhr(
            `${ROOT_URL}/save/${_.get(e, 'payload.url')}`,
            {
              method: 'HEAD',
              fetchResHeader: 'content-location'
            }
          );
          if (err) {
            return reject(err);
          }
          return resolve(contentLocation);
        })
    }
  }
);

export default saveMachine;
