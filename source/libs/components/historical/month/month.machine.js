import { Machine, actions } from 'xstate';
import memoizeOne from 'memoize-one';
import { Screenshooter, api } from '../../../utils';
import each from 'promise-each';

const { assign } = actions;

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const getMonths = selectedYear => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  let months = monthNames;
  if (currentYear === +selectedYear) {
    months = monthNames.slice(0, currentMonth + 1);
  }
  return months;
};
export const memoizedGetMonths = memoizeOne(getMonths);

const screenshooter = new Screenshooter();
export const fetchSnapshot = async ({ url, index, year, archiveURL }) => {
  let [result, archiveErr] = await api(
    `https://archive.org/wayback/available?url=${url}&timestamp=${year}${_.padStart(
      _.toString(index + 1),
      2,
      0
    )}`,
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

const monthMachine = Machine(
  {
    id: 'historical-month',
    initial: 'unknown',
    context: {
      url: null,
      year: null,
      months: null,
      isEnterTransitionDone: false
    },
    states: {
      unknown: {},
      loadingArchives: {
        id: 'loadingArchives',
        invoke: {
          id: 'fetchArchiveLinks',
          src: 'fetchArchiveLinks',
          onDone: {
            target: 'archiveLoaded'
          }
        }
      },
      archiveLoaded: {}
    },
    on: {
      NOTIFY_ENTER_TRANSITION: {
        actions: assign({
          isEnterTransitionDone: (_ctx, e) => true
        })
      },
      LOAD_ARCHIVE_URLS: {
        target: 'loadingArchives',
        actions: assign({
          year: (ctx, e) => _.get(e, 'payload.year', ctx.year),
          months: (ctx, e) =>
            memoizedGetMonths(_.get(e, 'payload.year', ctx.year))
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
      },
      CLEAR_SNAPSHOTS: {
        target: 'unknown',
        actions: assign({
          snapshots: []
        })
      },
      CLEAR_ARCHIVE_URLS: {
        actions: assign({
          archiveURLs: []
        })
      }
    }
  },
  {
    services: {
      fetchArchiveLinks: ctx => async callback => {
        const { year, url, months } = ctx;
        const selectedYear = +year;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Map serially, as archive times out if done concurrently
        const timestampURLs = _.map(months, (__, index) => {
          return `https://archive.org/wayback/available?url=${url}&timestamp=${year}${_.padStart(
            _.toString(index + 1),
            2,
            0
          )}`;
        });

        const isCurrentYearSelected = currentYear === selectedYear;
        const timestampURLCount = _.size(timestampURLs);
        const snapshotMapper = async (url, index) => {
          const [result] = await api(url, {
            noCacheReq: isCurrentYearSelected && index === currentMonth,
            noCacheRes: isCurrentYearSelected && index === currentMonth
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
            noCacheReq:
              isCurrentYearSelected && timestampURLCount - 1 === index,
            noCacheRes:
              isCurrentYearSelected && timestampURLCount - 1 === index,
            latest: isCurrentYearSelected && timestampURLCount - 1 === index
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

export default monthMachine;
