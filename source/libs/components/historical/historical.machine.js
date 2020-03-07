import { Machine, actions } from 'xstate';
import { Screenshooter, api, abort } from '../../utils';
import each from 'promise-each';

const { assign } = actions;
const screenshooter = new Screenshooter();

export const fetchSnapshot = async ({ url, year, archiveURL }) => {
  let [result, archiveErr] = await api(
    `https://archive.org/wayback/available?url=${url}&timestamp=${year}12`,
    {
      noCacheReq: true
    }
  );
  if (archiveErr) {
    return [{ data: null, err: archiveErr }];
  }

  const closestURL = _.get(result, 'archived_snapshots.closest.url');
  if (closestURL) {
    archiveURL = _.replace(
      _.replace(closestURL, /\d+/, '$&im_'),
      /https?/,
      'https'
    );
  }

  return [
    await screenshooter.fetchScreenshot(archiveURL, {
      noCacheReq: true,
      latest: true
    }),
    closestURL ? archiveURL : null
  ];
};

const historicalMachine = Machine(
  {
    id: 'historical',
    initial: 'init',
    context: {
      url: null,
      years: null,
      selectedYear: null,
      selectedIndex: 0,

      isViewResized: false,
      showMonthPanel: false,
      showCarousel: null,
      showTermModal: false,
      snapshots: [],
      archiveURLs: []
    },
    states: {
      init: {
        on: {
          LOAD_HISTORICAL: {
            target: 'loadingHistorical'
          }
        }
      },
      loadingHistorical: {
        id: 'loadingHistorical',
        invoke: {
          id: 'fetchArchiveLinks',
          src: 'fetchArchiveLinks'
        }
      }
    },
    on: {
      TOGGLE_CAROUSEL_OPEN: {
        actions: assign((_ctx, e) => {
          return {
            showCarousel: _.get(e, 'payload.show'),
            carouselMode: _.get(e, 'payload.mode'),
            selectedIndex: _.get(e, 'payload.index', 0),
            images: _.get(e, 'payload.images', [])
          };
        })
      },
      TOGGLE_CAROUSEL_CLOSE: {
        actions: [
          assign((_ctx, e) => {
            return {
              showCarousel: false,
              carouselMode: null,
              selectedIndex: 0,
              images: []
            };
          }),
          'notifyCarouselClose'
        ]
      },
      TOGGLE_MONTH_VIEW_OPEN: {
        actions: assign((_ctx, e) => {
          return {
            showMonthPanel: _.get(e, 'payload.show'),
            selectedYear: _.get(e, 'payload.year', null)
          };
        })
      },
      TOGGLE_MONTH_VIEW_CLOSE: {
        actions: [
          assign((_ctx, e) => {
            return {
              showMonthPanel: false,
              selectedYear: null
            };
          }),
          'notifyCarouselClose'
        ]
      },
      TOGGLE_RESIZE_VIEW: {
        actions: assign((_ctx, e) => {
          return {
            isViewResized: _.get(e, 'payload.resize')
          };
        })
      },
      CLOSE_TERM_MODAL: {
        actions: assign({
          showTermModal: false
        })
      },
      CLEANUP: {
        actions: assign((_ctx, e) => {
          abort();
          return {};
        })
      },
      ADD_SNAPSHOT: {
        actions: assign((ctx, e) => {
          return {
            archiveURLs: [...ctx.archiveURLs, _.get(e, 'payload.archiveURL')],
            snapshots: [...ctx.snapshots, _.get(e, 'payload.snapshot')]
          };
        })
      },
      SET_SNAPSHOT: {
        actions: assign((ctx, e) => {
          ctx.snapshots[_.get(e, 'payload.index')] = _.get(e, 'payload.value');
          return {
            snapshots: [...ctx.snapshots]
          };
        })
      },
      SET_ARCHIVE_URL: {
        actions: assign((ctx, e) => {
          ctx.archiveURLs[_.get(e, 'payload.index')] = _.get(
            e,
            'payload.value'
          );
          return {
            archiveURLs: [...ctx.archiveURLs]
          };
        })
      }
    }
  },
  {
    services: {
      fetchArchiveLinks: ctx => async callback => {
        const timestampURLs = _.map(
          ctx.years,
          y =>
            `https://archive.org/wayback/available?url=${ctx.url}&timestamp=${y}12`
        );

        const timestampURLCount = _.size(timestampURLs);
        const snapshotMapper = async (item, index) => {
          let [result] = await api(item, {
            noCacheReq: timestampURLCount - 1 === index,
            noCacheRes: timestampURLCount - 1 === index,
            disableReject: true
          });
          let archiveURL = _.replace(
            _.replace(
              _.get(result, 'archived_snapshots.closest.url'),
              /\d+/,
              '$&im_'
            ),
            /https?/,
            'https'
          );

          const [data, err] = await screenshooter.fetchScreenshot(archiveURL, {
            noCacheReq: timestampURLCount - 1 === index,
            noCacheRes: timestampURLCount - 1 === index,
            latest: timestampURLCount - 1 === index
          });
          callback({
            type: 'ADD_SNAPSHOT',
            payload: { snapshot: { data, err }, archiveURL }
          });
        };

        return Promise.resolve(timestampURLs).then(each(snapshotMapper));
      }
    }
  }
);

export default historicalMachine;
