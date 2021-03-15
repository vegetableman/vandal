import test from "ava";

import {
  dateDiffInDays, getDateTimeFromTS, getDateTsFromURL, getLastDateOfMonth, toTwelveHourTime,
  dateTimeDiff,
  timestamp2datetime,
  isArchiveURL,
  stripArchiveURL
} from "../source/libs/utils";

test("difference between dates in days", (t) => {
  t.is(dateDiffInDays(new Date(), new Date()), 0);
  const prevDate = new Date();
  prevDate.setDate(prevDate.getDate() - 1);
  t.is(dateDiffInDays(prevDate, new Date()), 1);
  t.is(dateDiffInDays(new Date(), prevDate), -1);
  t.is(dateDiffInDays(1, 2), null);
  t.is(dateDiffInDays(null, 2), null);
});

test("datetime from snapshot timestamp", (t) => {
  t.deepEqual(getDateTimeFromTS(20210309214518), {
    date: "09/03/2021",
    day: 9,
    humanizedDate: "09 Mar, 2021",
    month: 3,
    time: "214518",
    year: 2021,
  });
  t.is(getDateTimeFromTS("aaa"), null);
  t.is(getDateTimeFromTS(1901), null);
});

test("last date of month", (t) => {
  t.deepEqual(getLastDateOfMonth(new Date("2/20/2021")), new Date("2/28/2021"));
  t.deepEqual(getLastDateOfMonth(new Date("1/20/2021")), new Date("1/31/2021"));
});

test("date details from url", (t) => {
  const result = getDateTsFromURL("https://web.archive.org/web/20210204141923/https://scroll.in/");
  t.is(result.ts, "20210204141923");
  t.is(result.date, "04/02/2021");
  t.is(result.time, "141923");
  const result2 = getDateTsFromURL("https://www.google.com");
  t.is(result2, null);
  const result3 = getDateTsFromURL("https://web.archive.org/202002/https://scroll.in/");
  t.is(result3, null);
  t.is(getDateTsFromURL(null), null);
});

test("formatting to twelve hour time", (t) => {
  t.is(toTwelveHourTime("141923"), "02:19:23 pm");
  t.is(toTwelveHourTime("054409"), "05:44:09 am");
  t.is(toTwelveHourTime(141923), "02:19:23 pm");
  t.is(toTwelveHourTime(54409), null);
  t.is(toTwelveHourTime("0544091001"), null);
  t.is(toTwelveHourTime(null), null);
});

test("diff between timestamps", (t) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const diff = dateTimeDiff(d, new Date());
  t.is(diff.delta, 1);
  t.is(diff.text, "+1 day");

  const d1 = new Date();
  d1.setMinutes(d1.getMinutes() + 1);
  const diff2 = dateTimeDiff(d1, new Date());
  t.is(diff2.delta, 1);
  t.is(diff2.text, "+1 minute");

  t.is(dateTimeDiff(new Date(), new Date()).delta, null);
});

test("convert timestamp to datetime", (t) => {
  t.is(timestamp2datetime(20210218083937).getTime(), 1613637577000);
  t.is(timestamp2datetime(1190101), null);
  t.is(timestamp2datetime(""), null);
  t.is(timestamp2datetime(), null);
});

test("Check whether URL is an archive URL", (t) => {
  t.is(isArchiveURL("https://web.archive.org/web/20171231183454/https://aeon.co/"), true);
  t.is(isArchiveURL("https://web.archive.org/"), false);
  t.is(isArchiveURL("https://web.archive.org/web/"), false);
  t.is(isArchiveURL("https://web.archive.org/web/292929/https://www.google.com"), true);
});

test("Strip archive details from a URL", (t) => {
  t.is(stripArchiveURL("https://web.archive.org/web/20171231183454/https://aeon.co/"), "https://aeon.co/");
  t.is(stripArchiveURL("https://web.archive.org/"), "https://web.archive.org/");
  t.is(stripArchiveURL("https://web.archive.org/web/20050113054409/https://parliamentofindia.nic.in/ls/1901010/debates/vol11p11.htm"),
    "https://parliamentofindia.nic.in/ls/1901010/debates/vol11p11.htm");
  t.is(stripArchiveURL("https://www.google.com"), "https://www.google.com");
  t.is(stripArchiveURL("https://www.google.com/"), "https://www.google.com/");
});
