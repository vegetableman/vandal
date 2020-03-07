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
      imURL: null
    },
    states: {
      open: {
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
                  savedArchiveURL: (_ctx, e) => `${ROOT_URL}${e.data}`,
                  imURL: (_ctx, e) =>
                    _.replace(
                      _.replace(`${ROOT_URL}${e.data}`, /\d+/, '$&im_'),
                      /https?/,
                      'https'
                    )
                })
              },
              onError: 'failure'
            },
            on: {
              REJECT: 'failure'
            }
          },
          success: {},
          failure: {
            initial: 'rejection',
            states: {
              rejection: {},
              timeout: {}
            }
          }
        }
      },
      close: {
        on: {
          OPEN: 'open'
        }
      }
    },
    on: {
      OPEN_URL_IN_VANDAL: {
        target: 'close',
        actions: 'updateVandalURL'
      }
    }
  },
  {
    services: {
      saveToArchive: (_ctx, e) =>
        new Promise(async (resolve, reject) => {
          const [contentLocation, err] = await xhr(
            `${ROOT_URL}/save/${e.value}`,
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
