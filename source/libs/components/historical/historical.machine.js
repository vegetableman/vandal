import { Machine, actions } from "xstate";
import {
  Screenshooter, api, abort, getDateTimeFromTS
} from "../../utils";

const { assign } = actions;
const screenshooter = new Screenshooter();

let isSTOPPED = false;
export const cleanUp = () => {
  isSTOPPED = true;
  abort({ meta: { type: "available" } });
  screenshooter.abort();
};

export const fetchSnapshot = async ({ url, year, archiveURL }) => {
  let snapshotURL = archiveURL;

  const [result, archiveErr] = await api(
    `https://archive.org/wayback/available?url=${url}&timestamp=${year}12`, {
      meta: { type: "available" }
    }
  );
  if (archiveErr) {
    return [{ data: null, err: archiveErr }];
  }

  const closestURL = _.get(result, "archived_snapshots.closest.url");
  if (closestURL) {
    snapshotURL = _.replace(closestURL, /https?/, "https");
  }

  return [
    await screenshooter.fetchScreenshot(snapshotURL, { retry: true }),
    closestURL ? snapshotURL : null
  ];
};

const historicalMachine = Machine(
  {
    id: "historical",
    initial: "unknown",
    context: {
      url: null,
      years: null,
      selectedYear: null,
      selectedIndex: 0,

      isViewResized: false,
      showMonthPanel: false,
      showCarousel: null,
      isHistoricalEnabled: true,
      snapshots: [],
      archiveURLs: []
    },
    states: {
      unknown: {},
      initHistorical: {
        id: "initHistorical",
        invoke: {
          src: "checkHistoricalAvailable",
          onDone: {
            target: "processingHistorical",
            actions: [
              assign({
                isHistoricalEnabled: (_ctx, e) => _.get(e, "data.isAvailable")
              })
            ]
          },
          onError: {
            target: "historicalUnAvailable"
          }
        }
      },
      processingHistorical: {
        always: [
          {
            target: "loadingHistorical",
            cond: "isHistoricalAvailable"
          },
          {
            target: "historicalUnAvailable"
          }
        ]
      },
      historicalUnAvailable: {},
      loadingHistorical: {
        invoke: {
          id: "fetchArchiveLinks",
          src: "fetchArchiveLinks",
          onDone: "historicalLoaded"
        }
      },
      historicalLoaded: {}
    },
    on: {
      INIT_HISTORICAL: {
        target: "initHistorical",
        actions: assign((_ctx, e) => ({
          years: _.get(e, "payload.years"),
          url: _.get(e, "payload.url"),
          snapshots: [],
          archiveURLs: []
        }))
      },
      TOGGLE_CAROUSEL_OPEN: {
        actions: assign((_ctx, e) => ({
          showCarousel: _.get(e, "payload.show"),
          carouselMode: _.get(e, "payload.mode"),
          selectedIndex: _.get(e, "payload.index", 0),
          images: _.get(e, "payload.images", [])
        }))
      },
      TOGGLE_CAROUSEL_CLOSE: {
        actions: [
          assign(() => ({
            showCarousel: false,
            carouselMode: null,
            selectedIndex: 0,
            images: []
          })),
          "notifyCarouselClose"
        ]
      },
      TOGGLE_MONTH_VIEW_OPEN: {
        actions: assign((_ctx, e) => ({
          showMonthPanel: _.get(e, "payload.show"),
          selectedYear: _.get(e, "payload.year", null)
        }))
      },
      TOGGLE_MONTH_VIEW_CLOSE: {
        actions: [
          assign(() => ({
            showMonthPanel: false,
            selectedYear: null
          })),
          "notifyCarouselClose"
        ]
      },
      TOGGLE_RESIZE_VIEW: {
        actions: assign((_ctx, e) => ({
          isViewResized: _.get(e, "payload.resize")
        }))
      },
      ADD_SNAPSHOT: {
        actions: [
          assign((ctx, e) => ({
            archiveURLs: [...ctx.archiveURLs, _.get(e, "payload.archiveURL")],
            snapshots: [...ctx.snapshots, _.get(e, "payload.snapshot")]
          })),
          assign((ctx) => ({
            images: _.map(ctx.snapshots, "data")
          }))
        ]
      },
      SET_SNAPSHOT: {
        actions: assign((ctx, e) => {
          ctx.snapshots[_.get(e, "payload.index")] = _.get(e, "payload.value");
          return {
            snapshots: [...ctx.snapshots]
          };
        })
      },
      SET_ARCHIVE_URL: {
        actions: assign((ctx, e) => {
          ctx.archiveURLs[_.get(e, "payload.index")] = _.get(
            e,
            "payload.value"
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
      fetchArchiveLinks: (ctx) => async (callback) => {
        isSTOPPED = false;
        const timestampURLs = _.map(
          ctx.years,
          (y) => `https://archive.org/wayback/available?url=${
            ctx.url
          }&timestamp=${y}12`
        );

        const timestampURLCount = _.size(timestampURLs);
        const snapshotMapper = async (item, index) => {
          const [result] = await api(item, {
            fetchFromCache: timestampURLCount - 1 !== index,
            meta: { type: "available" }
          });

          const archiveURL = _.replace(
            _.get(result, "archived_snapshots.closest.url"),
            /https?/,
            "https"
          );

          const dateTime = getDateTimeFromTS(
            _.get(result, "archived_snapshots.closest.timestamp")
          );

          if (_.get(dateTime, "year") > _.parseInt(ctx.years[index]) + 1) {
            return callback({
              type: "ADD_SNAPSHOT",
              payload: {
                snapshot: { data: null, err: "mismatch" },
                archiveURL
              }
            });
          }

          if (!archiveURL) {
            return callback({
              type: "ADD_SNAPSHOT",
              payload: {
                snapshot: { data: null, err: "Archive URL not found" },
                archiveURL
              }
            });
          }

          const [data, err] = await screenshooter.fetchScreenshot(archiveURL, {
            latest: timestampURLCount - 1 === index
          });
          callback({
            type: "ADD_SNAPSHOT",
            payload: { snapshot: { data, err }, archiveURL }
          });

          return null;
        };

        try {
          return timestampURLs.reduce((prev, curr, i) => prev.then(() => {
            if (isSTOPPED) {
              throw new Error("Service has Stopped");
            }
            return snapshotMapper(curr, i);
          }), Promise.resolve());
        } catch (ex) {
          console.log("Snapshot service failed:", ex.message);
        }

        return null;
      },
      checkHistoricalAvailable: () => new Promise(async (resolve, reject) => {
        const [result, err] = await api(
          process.env.LAMBDA_HISTORICAL_IS_AVAILABLE
        );
        if (err) {
          return reject(err);
        }
        return resolve({
          isAvailable: _.get(result, "isAvailable")
        });
      })
    },
    guards: {
      isHistoricalAvailable: (ctx) => ctx.isHistoricalEnabled
    }
  }
);

export default historicalMachine;
