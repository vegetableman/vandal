import { Machine } from 'xstate';
import pQueue from 'p-queue';
import pMap from 'p-map';
import delay from 'delay';
import _ from 'lodash';

const ROOT_URL = 'https://gext-api.archive.org';

function decompress(source) {
  if (!source) {
    return null;
  }

  const { captures, hashes, ...rest } = source;
  if (!captures || captures.length === 0) {
    return source;
  }

  const [year, ...capturesOfMonths] = captures[0];
  const flatCaptures = capturesOfMonths.reduce(
    (acc, [monthId, ...daysOfMonth]) => {
      return acc.concat(
        daysOfMonth.reduce((acc, [dayId, ...capturesOfDay]) => {
          return acc.concat(
            capturesOfDay.map(([tailOfTimestamp, hashIndex]) => {
              const hash = hashes[hashIndex];
              const timestamp = [
                year,
                monthId.toString().padStart(2, '0'),
                dayId.toString().padStart(2, '0'),
                tailOfTimestamp
              ].join('');

              return [timestamp, hash];
            })
          );
        }, [])
      );
    },
    []
  );

  return {
    captures: flatCaptures,
    ...rest
  };
}

const isValidSimhash = simhash => {
  return !_.isEmpty(simhash) && simhash.simhash !== 'None';
};

const fetchQueue = new pQueue({ concurrency: 4 });

const fetchSimHash = async (url, year) => {
  return fetchQueue.add(async () => {
    const res = await api(
      `${ROOT_URL}/services/simhash/simhash?year=${year}&url=${url}&compress=1`,
      {
        noCacheReq: true,
        noCacheRes: true
      }
    );
    let json = await res.json();
    if (json.status === 'error' && json.message === 'NO_CAPTURES') {
      throw new Error(json.message);
    }
    json = decompress(json);
    return json;
  });
};

const calculateSimhash = async (year, url) => {
  return fetchQueue.add(async () => {
    const res = await api(
      `${ROOT_URL}/services/simhash/calculate-simhash?year=${year}&url=${url}&compress=1`,
      {
        noCacheReq: true,
        noCacheRes: true
      }
    );
    let json = await res.json();
    return json;
  });
};

const fetchJobStatus = async jobId => {
  return fetchQueue.add(async () => {
    const res = await api(
      `${ROOT_URL}/services/simhash/job?job_id=${jobId}&compress=1`,
      {
        noCacheReq: true,
        noCacheRes: true
      }
    );
    let json = await res.json();
    return json;
  });
};

const jobs = {};

const changesMachine = Machine(
  {
    id: 'changes',
    initial: 'init',
    context: {
      url: null,
      years: null
    },
    states: {
      init: {
        on: {
          LOAD_CHANGES: {
            target: 'loadingChanges'
          }
        },
        loadingChanges: {
          id: 'loadingChanges',
          invoke: {
            id: 'fetchChanges',
            src: 'fetchChanges'
          }
        }
      }
    },
    on: {
      // ADD_SIMHASH: {
      //   actions: assign({})
      // }
    }
  },
  {
    services: {
      fetchChanges: async ctx => {
        return new Promise(async (resolve, reject) => {
          const mapper = async year => {
            let simhash = await fetchSimHash(ctx.url, year);
            if (isValidSimhash(simhash)) {
              return simhash.captures;
            }

            if (!jobs[year]) {
              let res = await calculateSimhash(ctx.url, year);
              jobId = res.job_id;
              jobs[year] = jobId;
            }

            let status = 'PENDING';
            const retryCountInitial = 3;
            let retryCount = retryCountInitial;

            while (status === 'PENDING' || status === 'error') {
              try {
                const res = await fetchJobStatus();
                status = res.status;

                if (status === 'error') {
                }

                //res.info

                retryCount = retryCountInitial;
              } catch (err) {}

              await delay(2000);
            }

            simhash = await fetchSimHash(ctx.url, year);
            if (isValidSimhash(simhash)) {
              return simhash.captures;
            }
          };

          await pMap(years, mapper, { concurrency: 4 });

          await fetchQueue.onIdle(jobs[year]);
        });
      }
    }
  }
);

export default changesMachine;
