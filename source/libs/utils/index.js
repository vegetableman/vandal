import domLoaded from "dom-loaded";
import elementReady from "element-ready";
import _ from "lodash";

export { api, abort } from "./api";
export { default as fetch } from "./fetch";
export { default as Screenshooter } from "./screenshooter";
export { default as useDidUpdateEffect } from "./use-didupdate-effect";
export { default as compareProps } from "./compare-props";
export { default as Lambda } from "./lambda";
export * from "./track";

export const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec"
];

export const longMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

class Navigator {
  setNavigator(mnavigator) {
    this.navigator = mnavigator;
  }

  setBaseURL(url) {
    this.baseURL = url;
  }

  setURL(url) {
    this.url = url;
  }

  navigate(url) {
    this.navigator.src = `${this.baseURL}?url=${encodeURIComponent(url)}`;
  }

  reload() {
    if (this.url) {
      this.navigator.src = `${this.baseURL}?url=${encodeURIComponent(this.url)}`;
    }
  }
}

export const navigator = new Navigator();

/**
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = (selector) => {
  const waiting = elementReady(selector);

  // Don't check ad-infinitum
  domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));

  // If cancelled, return null like a regular select() would
  return waiting.catch(() => null);
};

const archiveRegExp = new RegExp(
  /https?:\/\/web\.archive\.org\/web\/\d+.*_?\/*/
);

const archivePrefixRegExp = new RegExp(
  /https?:\/\/web\.archive\.org\/web\/\d+if_\/.*/
);

/**
 * Check if archived URL has if_
 * @param {String} - Archive URL
 * @returns {Boolean} - whether URL is prefixed with if_
 */
export const isPrefixedArchiveURL = (url) => {
  if (!url) return false;
  return archivePrefixRegExp.test(url);
};

/**
 * Removed if_ from Archive URL
 * @param {String} - Archive URL
 * @returns {String} - Archive URL without if_
 */
export const removePrefixArchiveURL = (url) => url.replace(/(https?:\/\/web\.archive\.org\/web\/\d+)if_(\/.*)/, "$1$2");

/**
 * Check if URL is an archive URL
 * @param {String} url - URL to validate
 * @returns {Boolean} Whether input is a valid archive URL
 */
export const isArchiveURL = (url) => {
  if (!url) return false;
  const ua = new URL(url);
  return url && ua.host === "web.archive.org" && ua.pathname !== "/" && archiveRegExp.test(ua.href);
};

export const stripArchiveURL = (url) => (url && isArchiveURL(url) && archiveRegExp.test(url) ?
  _.nth(_.split(url, /web\/\d+(?:.*?)_?\//), 1) :
  url);

const timeRegexp = new RegExp(/^(\d{2})[\s|:]*(\d{2})[\s|:]*(\d{2})$/i);
function getPeriod(hour) {
  if (parseInt(hour, 10) >= 12) {
    return "pm";
  }
  return "am";
}

/**
 * Convert time to twelve hour clock format
 * @param {time} time - time format in string, ex: 12:01:11
 * @returns {String} - twelve hour clock format
 */
export const toTwelveHourTime = (time, format = "hh:MM:ss a") => {
  const match = timeRegexp.exec(time);
  if (!match) return null;
  const hour = match[1];
  const minute = match[2];
  const seconds = match[3];
  return format
    .replace("hh", _.padStart(parseInt(hour, 10) > 12 ? (parseInt(hour, 10) - 12) :
      (parseInt(hour, 10) && hour) || 12, 2, "0"))
    .replace("HH", _.padStart((parseInt(hour, 10) && hour) || 12, 2, "0"))
    .replace("mm", minute)
    .replace("MM", minute)
    .replace("ss", seconds)
    .replace("a", getPeriod(hour))
    .replace("A", getPeriod(hour).toUpperCase());
};

const tsRegexp = new RegExp(/(\d{14})i?m?_?/);
const tsDRegexp = new RegExp(/^\d{14}$/);
const dateRegexp = new RegExp(/^(\d{0,4})(\d{0,2})(\d{0,2})$/);

/**
 * Parse date to individual components
 * @param {String} d - The date string in format yyyyMMdd
 * @returns {Object}
 */
export const parseDate = (d) => {
  if (!dateRegexp.test(d)) return null;
  const dateArr = dateRegexp.exec(d);
  return {
    date: [dateArr[1], dateArr[2], dateArr[3]].reverse().join("/"),
    month: _.parseInt(dateArr[2]),
    day: _.parseInt(dateArr[3]),
    year: _.parseInt(dateArr[1]),
    humanizedDate: `${dateArr[3]} ${monthNames[_.parseInt(dateArr[2]) - 1]}, ${dateArr[1]}`
  };
};

/**
 * Get date details from Archive URL
 * @param {String} url - Archive URL
 * @returns {Object} - timestamp, time and date
 */
export const getDateTsFromURL = (url) => {
  const match = tsRegexp.exec(url);
  if (!match) return null;
  return {
    ts: match[1],
    time: match[1].substr(-6),
    date: parseDate(match[1].substr(0, 8)).date
  };
};

/**
 * Parse date from timestamp
 * @param {Number} ts - snapshot timestamp
 * @returns {Object} - Time, humanized date, all related calendar details
 */
export const getDateTimeFromTS = (ts) => {
  if (!ts || !tsDRegexp.test(ts)) return null;
  const match = tsDRegexp.exec(ts);
  const {
    date, humanizedDate, month, day, year
  } = parseDate(
    match[0].substr(0, 8)
  );
  return {
    time: match[0].substr(-6),
    humanizedDate,
    date,
    month,
    day,
    year
  };
};

/**
 * Count the number of snapshots for a URL
 * @param {Object} sparkline - object containing snapshot count details
 * @returns {Number} - number of snapshots
 */
export const countVersions = (sparkline) => {
  if (_.isEmpty(sparkline)) return 0;
  return _.reduce(_.keys(sparkline), (count, n) => {
    // eslint-disable-next-line no-param-reassign
    count += _.reduce(sparkline[n], (t, e) => t + e);
    return count;
  }, 0);
};

/**
 * Get last date of month
 * @param {Date} d - date
 * @returns {Date} - last date of month
 */
export const getLastDateOfMonth = (d) => {
  if (!_.isDate(d)) return null;
  const last = d;
  last.setHours(0);
  last.setMinutes(0);
  last.setSeconds(0);
  last.setMonth(last.getMonth() + 1);
  last.setDate(0);
  return last;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * find the difference between dates in days
 * @param {Date} a - older date to compare against
 * @param {Date} b - newer or current date
 * @returns {Number} - number of days
 */
export const dateDiffInDays = (a, b) => {
  if (!_.isDate(a) || !_.isDate(b)) return null;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
};

const splitTimestamp = (mtimestamp) => {
  let timestamp = mtimestamp;
  if (typeof timestamp === "number") {
    timestamp = timestamp.toString();
  }
  return [
    timestamp.slice(-14, -10),
    timestamp.slice(-10, -8),
    timestamp.slice(-8, -6),
    timestamp.slice(-6, -4),
    timestamp.slice(-4, -2),
    timestamp.slice(-2)
  ];
};

/**
 * Convert snapshot timestamp to date
 * @param {timestamp} timestamp
 * @returns {Date} return date
 */
export const timestamp2datetime = (ts) => {
  if (_.isNull(ts) || !tsDRegexp.test(ts)) return null;
  const tsArray = splitTimestamp(ts);
  return new Date(
    Date.UTC(
      tsArray[0],
      tsArray[1] - 1,
      tsArray[2],
      tsArray[3],
      tsArray[4],
      tsArray[5]
    )
  );
};

/**
 * Find the diff of dates
 * @param {Date} datetime1 - date
 * @param {Date} datetime2 - date
 * @returns {Object} diff and the delta
 */
export function dateTimeDiff(datetime1, datetime2) {
  if (!_.isDate(datetime1) || !_.isDate(datetime2)) return null;
  let diff = Date.parse(datetime1) - Date.parse(datetime2);
  let prefix = "";
  let delta;
  if (diff < 0) {
    prefix += "-";
    delta = -1;
    diff = Math.abs(diff);
  } else {
    delta = 1;
    prefix += "+";
  }
  // equal to the page datetime
  if (diff < 1000) {
    return { delta: null, text: "" };
  }
  const yearsDiff = Math.floor(diff / 1000 / 60 / 60 / 24 / 30 / 12);
  diff -= yearsDiff * 1000 * 60 * 60 * 24 * 30 * 12;
  const monthsDiff = Math.floor(diff / 1000 / 60 / 60 / 24 / 30);
  diff -= monthsDiff * 1000 * 60 * 60 * 24 * 30;
  const daysDiff = Math.floor(diff / 1000 / 60 / 60 / 24);
  diff -= daysDiff * 1000 * 60 * 60 * 24;
  const hoursDiff = Math.floor(diff / 1000 / 60 / 60);
  diff -= hoursDiff * 1000 * 60 * 60;
  const minutesDiff = Math.floor(diff / 1000 / 60);
  diff -= minutesDiff * 1000 * 60;
  const secondsDiff = Math.floor(diff / 1000);

  let parts = [];
  if (yearsDiff > 1) {
    parts.push(`${yearsDiff} years`);
  } else if (yearsDiff === 1) {
    parts.push(`${yearsDiff} year`);
  }
  if (monthsDiff > 1) {
    parts.push(`${monthsDiff} months`);
  } else if (monthsDiff === 1) {
    parts.push(`${monthsDiff} month`);
  }
  if (daysDiff > 1) {
    parts.push(`${daysDiff} days`);
  } else if (daysDiff === 1) {
    parts.push(`${daysDiff} day`);
  }
  if (hoursDiff > 1) {
    parts.push(`${hoursDiff} hours`);
  } else if (hoursDiff === 1) {
    parts.push(`${hoursDiff} hour`);
  }
  if (minutesDiff > 1) {
    parts.push(`${minutesDiff} minutes`);
  } else if (minutesDiff === 1) {
    parts.push(`${minutesDiff} minute`);
  }
  if (secondsDiff > 1) {
    parts.push(`${secondsDiff} seconds`);
  } else if (secondsDiff === 1) {
    parts.push(`${secondsDiff} second`);
  }
  if (parts.length > 2) {
    parts = parts.slice(0, 2);
  }
  return {
    delta,
    text: prefix + parts.join(" ")
  };
}

export const log = (message, ...args) => {
  console.info(`Vandal: ${message}`, ...args);
};
