import domLoaded from "dom-loaded";
import elementReady from "element-ready";
import _ from "lodash";

export { api, abort } from "./api";
export { default as fetch } from "./fetch";
export { default as Screenshooter } from "./screenshooter";
export { default as useDidUpdateEffect } from "./use-didupdate-effect";
export { default as compareProps } from "./compare-props";
export { default as Lambda } from "./lambda";

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

class Browser {
  setBrowser(mbrowser) {
    this.browser = mbrowser;
  }

  setBaseURL(url) {
    this.baseURL = url;
  }

  setURL(url) {
    this.url = url;
  }

  navigate(url) {
    this.browser.src = `${this.baseURL}?url=${encodeURIComponent(url)}`;
  }

  reload() {
    if (this.url) {
      this.browser.src = `${this.baseURL}?url=${encodeURIComponent(this.url)}`;
    }
  }
}

export const browser = new Browser();

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

export const isArchiveURL = (url) => {
  if (!url) return false;
  const ua = new URL(url);
  return url && ua.host === "web.archive.org" && ua.pathname !== "/";
};

const stripRegExp = new RegExp(
  /https?:\/\/web\.archive\.org\/web\/\d+.*_?\/*/
);

export const stripArchiveURL = (url) => (url && isArchiveURL(url) && stripRegExp.test(url) ?
  _.nth(_.split(url, /web\/\d+(?:.*?)_?\//), 1) :
  url);

function getPeriod(hour) {
  if (parseInt(hour, 10) >= 12) {
    return "pm";
  }
  return "am";
}

const timeRegexp = new RegExp(/(\d{1,2})[\s|:]*(\d{1,2})[\s|:]*(\d{1,2})/i);

export const toTwelveHourTime = (time, mformat) => {
  const match = timeRegexp.exec(time);
  if (!match) return null;

  const hour = match[1];
  const minute = match[2];
  const seconds = match[3];

  let format = mformat;
  // Default argument for format
  if (!format) {
    format = "hh:MM:ss a";
  }

  if (parseInt(hour, 10) > 12) {
    return format
      .replace("hh", _.padStart(parseInt(hour, 10) - 12 || 12, 2, "0"))
      .replace("HH", _.padStart((parseInt(hour, 10) && hour) || 12, 12, "0"))
      .replace("mm", minute)
      .replace("MM", minute)
      .replace("ss", seconds)
      .replace("a", "pm")
      .replace("A", "PM");
  }
  return format
    .replace("hh", _.padStart((parseInt(hour, 10) && hour) || 12, 2, "0"))
    .replace("HH", _.padStart((parseInt(hour, 10) && hour) || 12, 2, "0"))
    .replace("mm", minute)
    .replace("MM", minute)
    .replace("ss", seconds)
    .replace("a", getPeriod(hour))
    .replace("A", getPeriod(hour).toUpperCase());
};

export const formatDateTimeTS = (dt) => (_.isString(dt) ?
  _.replace(
    _.replace(dt, dt.slice(-12, -4), toTwelveHourTime(dt.slice(-12, -4))),
    "GMT",
    ""
  ) :
  dt);

const tsRegexp = new RegExp(/(\d+)i?m?_?/);
const tsDRegexp = new RegExp(/(\d+)/);
const dateRegexp = new RegExp(/(\d{0,4})(\d{0,2})(\d{0,2})/);

const getDate = (d) => {
  const dateArr = dateRegexp.exec(d);
  if (!dateArr) return d;
  return {
    date: [dateArr[1], dateArr[2], dateArr[3]].reverse().join("/"),
    month: _.parseInt(dateArr[2]),
    day: _.parseInt(dateArr[3]),
    year: _.parseInt(dateArr[1]),
    humanizedDate: `${dateArr[3]} ${monthNames[dateArr[2] - 1]}, ${dateArr[1]}`
  };
};

export const getDateTsFromURL = (url) => {
  const match = tsRegexp.exec(url);
  if (!match) return null;
  return {
    ts: match[1],
    time: match[1].substr(-6),
    date: getDate(match[1].substr(0, 8)).date
  };
};

export const getDateTimeFromTS = (ts) => {
  if (!ts) return null;
  const match = tsDRegexp.exec(ts);
  if (!match) return ts;
  const {
    date, humanizedDate, month, day, year
  } = getDate(
    match[1].substr(0, 8)
  );
  return {
    ts: match[1].substr(-6),
    humanizedDate,
    date,
    month,
    day,
    year
  };
};

export const countVersions = (sparkline) => {
  if (_.isEmpty(sparkline)) return 0;
  return _.reduce(_.keys(sparkline), (count, n) => {
    // eslint-disable-next-line no-param-reassign
    count += _.reduce(sparkline[n], (t, e) => t + e);
    return count;
  }, 0);
};

export const getLastDate = (d) => {
  const last = new Date(d);
  last.setHours(0);
  last.setMinutes(0);
  last.setSeconds(0);
  last.setMonth(last.getMonth() + 1);
  last.setDate(0);
  return last;
};

export const getCurrentDate = () => {
  const currentDate = new Date();
  return `${currentDate.getDate()} ${
    longMonthNames[currentDate.getMonth()]
  }, ${currentDate.getFullYear()}`;
};

export const isCurrentDate = (d) => {
  const dt = new Date(d);
  return new Date(getCurrentDate()).getTime() === dt.getTime();
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const dateDiffInDays = (a, b) => {
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

const timestamp2datetime = (timestamp) => {
  const tsArray = splitTimestamp(timestamp);
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

export function dateTimeDiff(dtmsec, captureTS) {
  if (!dtmsec || !captureTS) return null;
  let diff = Date.parse(dtmsec) - Date.parse(timestamp2datetime(captureTS));
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
  let highlight = false;

  // equal to the page datetime
  if (diff < 1000) {
    return { diff, text: "", highlight };
  }
  const totalDiff = diff;
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
    highlight = true;
  } else if (yearsDiff === 1) {
    parts.push(`${yearsDiff} year`);
    highlight = true;
  }
  if (monthsDiff > 1) {
    parts.push(`${monthsDiff} months`);
    highlight = true;
  } else if (monthsDiff === 1) {
    parts.push(`${monthsDiff} month`);
    highlight = true;
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
    diff: totalDiff,
    delta,
    text: prefix + parts.join(" "),
    highlight
  };
}
