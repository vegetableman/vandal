import { Machine, assign } from 'xstate';
import _ from 'lodash';
import { xhr } from '../../utils';

const ROOT_URL = 'https://web.archive.org';

const excluded_urls = [
  'localhost',
  '0.0.0.0',
  '127.0.0.1',
  'chrome:',
  'chrome-extension:',
  'about:',
  'moz-extension:',
  '192.168.',
  '10.',
  'file:',
  'edge:',
  'extension:'
];

function isNotExcludedUrl(url) {
  const len = excluded_urls.length;
  for (let i = 0; i < len; i++) {
    if (
      url.startsWith('http://' + excluded_urls[i]) ||
      url.startsWith('https://' + excluded_urls[i]) ||
      url.startsWith(excluded_urls[i])
    ) {
      return false;
    }
  }
  return true;
}

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
                  savedArchiveURL: (_ctx, e) => _.get(e, 'data')
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
          const headers = ['content-location', 'x-cache-key'];
          const [result, err] = await xhr(
            `${ROOT_URL}/save/${_.get(e, 'payload.url')}`,
            {
              method: 'HEAD',
              fetchResHeader: headers
            }
          );
          if (err || _.indexOf(headers, _.nth(result, 0)) === -1) {
            return reject(err);
          }
          if (_.nth(result, 0) === headers[0]) {
            return resolve(_.nth(result, 1));
          }

          const ts = _.nth(_.nth(result, 1).match(/\/web\/(\d+)/), 1);
          return resolve(`${ROOT_URL}/web/${ts}/${_.get(e, 'payload.url')}`);
        })
    }
  }
);

export default saveMachine;
