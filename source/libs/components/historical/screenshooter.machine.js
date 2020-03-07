import { Machine, actions, send } from 'xstate';
import { Screenshooter } from '../../utils';

const screeshooter = new Screenshooter();

const ScreenshooterMachine = Machine(
  {
    id: 'screenshooter',
    initial: 'unknown',
    context: {
      snapshots: []
    },
    invoke: {
      id: 'fetchSnapshot',
      src: 'fetchSnapshot'
    },
    states: {
      unknown: {
        on: {
          LOAD_SNAPSHOT: {
            target: 'unknown',
            actions: send(
              (_, e) => (
                {
                  payload: e.payload
                },
                { to: 'fetchSnapshot' }
              )
            )
          }
        }
      },
      snapshotLoaded: {
        LOAD_SNAPSHOT: {
          target: 'snapshotLoaded',
          actions: send(
            (_, e) => (
              {
                payload: e.payload
              },
              { to: 'fetchSnapshot' }
            )
          )
        }
      }
      // loadingSnapshot: {
      //   id: 'loadingSnapshot',
      //   after: {
      //     30000: 'snapshotError.timeout'
      //   },
      //   invoke: {
      //     id: 'fetchSnapshot',
      //     src: 'fetchSnapshot'
      //   }
      // },
      // snapshotError: {
      //   on: {
      //     RELOAD_SNAPSHOT_ON_ERROR: {
      //       target: '#loadingSnapshot'
      //     }
      //   },
      //   states: {
      //     rejected: {
      //       on: {
      //         RETRY: '#loadingSnapshot'
      //       }
      //     },
      //     timeout: {
      //       on: {
      //         RETRY: '#loadingSnapshot'
      //       }
      //     }
      //   }
      // }
    }
  },
  {
    services: {
      fetchSnapshot: (ctx, e) => {
        console.log('fetchSnapshot:e:', _.get(e));
        // await screeshooter.fetchScreenshot(url, {});
      }
    }
  }
);

export default ScreenshooterMachine;
