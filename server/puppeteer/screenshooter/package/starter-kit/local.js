'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const index = require('../index');
const config = require('./config');
const puppeteer = require('puppeteer');

_asyncToGenerator(function* () {
  const browser = yield puppeteer.launch({
    headless: false,
    slowMo: process.env.SLOWMO_MS,
    dumpio: !!config.DEBUG,
    defaultViewport: {
      width: 1024,
      height: 768
      // use chrome installed by puppeteer
    } });
  yield index.run(browser).then(function (result) {
    return console.log(result);
  }).catch(function (err) {
    return console.error(err);
  });
  yield browser.close();
})();