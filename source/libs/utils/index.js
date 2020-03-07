import { useRef, useEffect, useCallback } from 'react';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import OptionsSync from 'webext-options-sync';
import ghInjection from 'github-injection';
import _ from 'lodash';

export { api, controller, xhr, abort } from './api';
export { default as Screenshooter } from './screenshooter';
export { default as useRefCallback } from './use-ref-callback';
export { default as compareProps } from './compare-props';

const options = new OptionsSync().getAll();

class Browser {
  setBrowser(browser) {
    this.browser = browser;
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
    } else {
      this.browser.src = this.browser.src;
    }
  }
}

export const browser = new Browser();

export const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
];

export const longMonthNames = [
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

/**
 *`github-injection` happens even when the user navigates in history
 * This causes listeners to run on content that has already been updated.
 * If a feature needs to be disabled when navigating away,
 * use the regular `github-injection`
 */
export function safeOnAjaxedPages(callback) {
  ghInjection(() => {
    if (!select.exists('has-rgh')) {
      callback();
    }
  });
}

/**
 * Enable toggling each feature via options.
 * Prevent fn's errors from blocking the remaining tasks.
 * https://github.com/sindresorhus/refined-github/issues/678
 */
export const enableFeature = async fn => {
  const { disabledFeatures = '', logging = false } = await options;
  const log = logging ? console.log : () => {};

  const filename = fn.name.replace(/_/g, '-');
  if (/^$|^anonymous$/.test(filename)) {
    console.warn('This feature is nameless', fn);
  } else if (disabledFeatures.includes(filename)) {
    log('↩️', 'Skipping', filename);
    return;
  }
  try {
    await fn();
    log('✅', filename);
  } catch (err) {
    console.log('❌', filename);
    console.error(err);
  }
};

export const isFeatureEnabled = async featureName => {
  const { disabledFeatures = '' } = await options;
  return disabledFeatures.includes(featureName);
};

// export const getUsername = onetime(() => select('meta[name="user-login"]').getAttribute('content'));

export const groupBy = (iterable, grouper) => {
  const map = {};
  for (const item of iterable) {
    const key = grouper(item);
    map[key] = map[key] || [];
    map[key].push(item);
  }
  return map;
};

/**
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = selector => {
  const waiting = elementReady(selector);

  // Don't check ad-infinitum
  domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));

  // If cancelled, return null like a regular select() would
  return waiting.catch(() => null);
};

/**
 * Append to an element, but before a element that might not exist.
 * @param  {Element|string} parent  Element (or its selector) to which append the `child`
 * @param  {string}         before  Selector of the element that `child` should be inserted before
 * @param  {Element}        child   Element to append
 * @example
 *
 * <parent>
 *   <yes/>
 *   <oui/>
 *   <nope/>
 * </parent>
 *
 * appendBefore('parent', 'nope', <sì/>);
 *
 * <parent>
 *   <yes/>
 *   <oui/>
 *   <sì/>
 *   <nope/>
 * </parent>
 */
export const appendBefore = (parent, before, child) => {
  if (typeof parent === 'string') {
    parent = select(parent);
  }

  // Select direct children only
  before = select(`:scope > ${before}`, parent);
  if (before) {
    before.before(child);
  } else {
    parent.append(child);
  }
};

export const wrap = (target, wrapper) => {
  target.before(wrapper);
  wrapper.append(target);
};

export const wrapAll = (targets, wrapper) => {
  targets[0].before(wrapper);
  wrapper.append(...targets);
};

// Concats arrays but does so like a zipper instead of appending them
// [[0, 1, 2], [0, 1]] => [0, 0, 1, 1, 2]
// Like lodash.zip
export const flatZip = (table, limit = Infinity) => {
  const maxColumns = Math.max(...table.map(row => row.length));
  const zipped = [];
  for (let col = 0; col < maxColumns; col++) {
    for (const row of table) {
      if (row[col]) {
        zipped.push(row[col]);
        if (zipped.length === limit) {
          return zipped;
        }
      }
    }
  }
  return zipped;
};

export const isMac = /Mac/.test(window.navigator.platform);

export const metaKey = isMac ? 'metaKey' : 'ctrlKey';

export const anySelector = selector => {
  const prefix = document.head.style.MozOrient === '' ? 'moz' : 'webkit';
  return selector.replace(/:any\(/g, `:-${prefix}-any(`);
};

const getWindow = () => {
  var win;
  if (typeof window !== 'undefined') {
    win = window;
  } else if (typeof global !== 'undefined') {
    win = global;
  } else if (typeof self !== 'undefined') {
    win = self;
  } else {
    win = {};
  }
  return win;
};

export const getLocation = () => {
  const w = getWindow();
  if (w && w.location) return w.location.href;
};

function getPeriod(hour) {
  if (parseInt(hour) >= 12) {
    return 'pm';
  } else {
    return 'am';
  }
}

const timeRegexp = new RegExp(/(\d{1,2})[\s|:]*(\d{1,2})[\s|:]*(\d{1,2})/i);

export const toTwelveHourTime = (time, format) => {
  var match = timeRegexp.exec(time);
  if (!match) return;

  var hour = match[1];
  var minute = match[2];
  var seconds = match[3];

  // Default argument for format
  if (!format) {
    format = 'hh:MM:ss a';
  }

  if (parseInt(hour) > 12) {
    return format
      .replace('hh', _.padStart(parseInt(hour) - 12 || 12, 2, '0'))
      .replace('HH', _.padStart((parseInt(hour) && hour) || 12, 12, '0'))
      .replace('mm', minute)
      .replace('MM', minute)
      .replace('ss', seconds)
      .replace('a', 'pm')
      .replace('A', 'PM');
  } else {
    return format
      .replace('hh', _.padStart((parseInt(hour) && hour) || 12, 2, '0'))
      .replace('HH', _.padStart((parseInt(hour) && hour) || 12, 2, '0'))
      .replace('mm', minute)
      .replace('MM', minute)
      .replace('ss', seconds)
      .replace('a', getPeriod(hour))
      .replace('A', getPeriod(hour).toUpperCase());
  }
};

const tsRegexp = new RegExp(/(\d+)i?m?\_?/);
const tsDRegexp = new RegExp(/(\d+)/);
const dateRegexp = new RegExp(/(\d{0,4})(\d{0,2})(\d{0,2})/);

const getDate = d => {
  const dateArr = dateRegexp.exec(d);
  if (!dateArr) return d;
  return {
    date: [dateArr[1], dateArr[2], dateArr[3]].reverse().join('/'),
    month: _.parseInt(dateArr[2]),
    day: _.parseInt(dateArr[3]),
    year: _.parseInt(dateArr[1]),
    humanizedDate: `${dateArr[3]} ${monthNames[dateArr[2] - 1]}, ${dateArr[1]}`
  };
};

export const getDateTsFromURL = url => {
  let match = tsRegexp.exec(url);
  if (!match) return;
  return {
    ts: match[1],
    time: match[1].substr(-6),
    date: getDate(match[1].substr(0, 8)).date
  };
};

export const getDateTimeFromTS = ts => {
  if (!ts) return;
  let match = tsDRegexp.exec(ts);
  if (!match) return ts;
  const { date, humanizedDate, month, day, year } = getDate(
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

export const countVersions = sparkline => {
  if (_.isEmpty(sparkline)) return 0;
  let count = 0;
  for (let n in sparkline)
    count += _.reduce(sparkline[n], (t, e) => {
      return t + e;
    });
  return count;
};

const requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

export const clearRequestInterval = function(handle) {
  window.cancelAnimationFrame
    ? window.cancelAnimationFrame(handle.value)
    : window.webkitCancelAnimationFrame
    ? window.webkitCancelAnimationFrame(handle.value)
    : window.webkitCancelRequestAnimationFrame
    ? window.webkitCancelRequestAnimationFrame(
        handle.value
      ) /* Support for legacy API */
    : window.mozCancelRequestAnimationFrame
    ? window.mozCancelRequestAnimationFrame(handle.value)
    : window.oCancelRequestAnimationFrame
    ? window.oCancelRequestAnimationFrame(handle.value)
    : window.msCancelRequestAnimationFrame
    ? window.msCancelRequestAnimationFrame(handle.value)
    : clearInterval(handle);
};

export const requestInterval = function(fn, delay) {
  if (
    !window.requestAnimationFrame &&
    !window.webkitRequestAnimationFrame &&
    !(
      window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame
    ) && // Firefox 5 ships without cancel support
    !window.oRequestAnimationFrame &&
    !window.msRequestAnimationFrame
  )
    return window.setInterval(fn, delay);

  var start = new Date().getTime(),
    handle = new Object();

  function loop() {
    var current = new Date().getTime(),
      delta = current - start;

    if (delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }

    handle.value = requestAnimFrame(loop);
  }

  handle.value = requestAnimFrame(loop);
  return handle;
};

const splitTimestamp = timestamp => {
  if (typeof timestamp == 'number') {
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

const timestamp2datetime = timestamp => {
  var tsArray = splitTimestamp(timestamp);
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

export const dateTimeDiff = function(dtmsec, captureTS) {
  if (!dtmsec || !captureTS) return;
  let diff = Date.parse(dtmsec) - Date.parse(timestamp2datetime(captureTS));
  let prefix = '';
  let delta;
  if (diff < 0) {
    prefix += '-';
    delta = -1;
    diff = Math.abs(diff);
  } else {
    delta = 1;
    prefix += '+';
  }
  let highlight = false;

  // equal to the page datetime
  if (diff < 1000) {
    return { diff: diff, text: '', highlight: highlight };
  }
  let totalDiff = diff;
  let yearsDiff = Math.floor(diff / 1000 / 60 / 60 / 24 / 30 / 12);
  diff -= yearsDiff * 1000 * 60 * 60 * 24 * 30 * 12;
  let monthsDiff = Math.floor(diff / 1000 / 60 / 60 / 24 / 30);
  diff -= monthsDiff * 1000 * 60 * 60 * 24 * 30;
  let daysDiff = Math.floor(diff / 1000 / 60 / 60 / 24);
  diff -= daysDiff * 1000 * 60 * 60 * 24;
  let hoursDiff = Math.floor(diff / 1000 / 60 / 60);
  diff -= hoursDiff * 1000 * 60 * 60;
  let minutesDiff = Math.floor(diff / 1000 / 60);
  diff -= minutesDiff * 1000 * 60;
  let secondsDiff = Math.floor(diff / 1000);

  let parts = [];
  if (yearsDiff > 1) {
    parts.push(yearsDiff + ' years');
    highlight = true;
  } else if (yearsDiff == 1) {
    parts.push(yearsDiff + ' year');
    highlight = true;
  }
  if (monthsDiff > 1) {
    parts.push(monthsDiff + ' months');
    highlight = true;
  } else if (monthsDiff == 1) {
    parts.push(monthsDiff + ' month');
    highlight = true;
  }
  if (daysDiff > 1) {
    parts.push(daysDiff + ' days');
  } else if (daysDiff == 1) {
    parts.push(daysDiff + ' day');
  }
  if (hoursDiff > 1) {
    parts.push(hoursDiff + ' hours');
  } else if (hoursDiff == 1) {
    parts.push(hoursDiff + ' hour');
  }
  if (minutesDiff > 1) {
    parts.push(minutesDiff + ' minutes');
  } else if (minutesDiff == 1) {
    parts.push(minutesDiff + ' minute');
  }
  if (secondsDiff > 1) {
    parts.push(secondsDiff + ' seconds');
  } else if (secondsDiff == 1) {
    parts.push(secondsDiff + ' second');
  }
  if (parts.length > 2) {
    parts = parts.slice(0, 2);
  }
  return {
    diff: totalDiff,
    delta,
    text: prefix + parts.join(' '),
    highlight: highlight
  };
};

export const isArchiveURL = url => {
  if (!url) return false;
  const ua = new URL(url);
  return url && ua.host === 'web.archive.org' && ua.pathname !== '/';
};

export const getUrlHost = url => {
  return url && _.replace(new URL(url).host, 'www.', '');
};

const stripRegExp = new RegExp(/https\:\/\/web\.archive\.org\/web\/\d+.*_?\/*/);
export const stripArchiveURL = url => {
  return url && isArchiveURL(url) && stripRegExp.test(url)
    ? _.nth(_.split(url, /web\/\d+(?:.*?)_?\//), 1)
    : url;
};

export const isURLEqual = (a, b) => {
  if (!a || !b) return false;
  const urlA = new URL(a);
  const urlB = new URL(b);
  return urlA.host === urlB.host && urlA.pathname === urlB.pathname;
};

export const stripIm = url => {
  return _.replace(url, 'im_', '');
};

export const archiveAllLink = url => {
  return `https://web.archive.org/web/*/${url}`;
};

export const formatDateTimeTS = dt => {
  return _.isString(dt)
    ? _.replace(
        _.replace(dt, dt.slice(-12, -4), toTwelveHourTime(dt.slice(-12, -4))),
        'GMT',
        ''
      )
    : dt;
};

function ease(k) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}

function step(context) {
  let time = Date.now();
  let value;
  let currentX;
  let elapsed = (time - context.startTime) / 300;

  // avoid elapsed times higher than one
  elapsed = elapsed > 1 ? 1 : elapsed;

  // apply easing to elapsed time
  value = ease(elapsed);

  currentX = context.startX + (context.x - context.startX) * value;

  context.method.call(context.scrollable, currentX);

  // scroll more if we have not reached our destination
  if (currentX !== context.x) {
    window.requestAnimationFrame(step.bind(window, context));
  }
}

export const smoothScrollX = (el, x) => {
  let scrollable;
  let startX;
  let method;
  let startTime = Date.now();

  // define scroll context
  scrollable = el;
  startX = el.scrollLeft;
  method = function(val) {
    this.scrollLeft = val;
  };

  // scroll looping over a frame
  step({
    scrollable: scrollable,
    method: method,
    startTime: startTime,
    startX: startX,
    x: x
  });
};

export const useEventCallback = (fn, dependencies) => {
  const ref = useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  useEffect(() => {
    ref.current = fn;
  }, [fn, ...dependencies]);

  return useCallback(
    (...args) => {
      const fn = ref.current;
      return fn(...args);
    },
    [ref]
  );
};
