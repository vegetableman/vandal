'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const fs = require('fs');
const tar = require('tar');
const puppeteer = require('puppeteer');
const config = require('./config');

exports.getBrowser = (() => {
  let browser;
  return _asyncToGenerator(function* () {
    if (typeof browser === 'undefined' || !(yield isBrowserAvailable(browser))) {
      console.log('setup getBrowser---');
      yield setupChrome();
      browser = yield puppeteer.launch({
        headless: true,
        executablePath: config.executablePath,
        args: config.launchOptionForLambda,
        dumpio: !!exports.DEBUG,
        defaultViewport: {
          width: 1024,
          height: 768
        }
      });
      debugLog((() => {
        var _ref2 = _asyncToGenerator(function* (b) {
          return `launch done: ${yield browser.version()}`;
        });

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      })());
    }
    return browser;
  });
})();

const isBrowserAvailable = (() => {
  var _ref3 = _asyncToGenerator(function* (browser) {
    try {
      const version = yield browser.version();
      console.log('version: ', version);
    } catch (e) {
      debugLog(e); // not opened etc.
      return false;
    }
    return true;
  });

  return function isBrowserAvailable(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

const setupChrome = (() => {
  var _ref4 = _asyncToGenerator(function* () {
    if (!(yield existsExecutableChrome())) {
      if (yield existsLocalChrome()) {
        debugLog('setup local chrome');
        yield setupLocalChrome();
      } else {
        debugLog('setup s3 chrome');
        yield setupS3Chrome();
      }
      debugLog('setup done');
    }
  });

  return function setupChrome() {
    return _ref4.apply(this, arguments);
  };
})();

const existsLocalChrome = () => {
  return new Promise((resolve, reject) => {
    fs.exists(config.localChromePath, exists => {
      resolve(exists);
    });
  });
};

const existsExecutableChrome = () => {
  return new Promise((resolve, reject) => {
    fs.exists(config.executablePath, exists => {
      resolve(exists);
    });
  });
};

const setupLocalChrome = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(config.localChromePath).on('error', err => reject(err)).pipe(tar.x({
      C: config.setupChromePath
    })).on('error', err => reject(err)).on('end', () => resolve());
  });
};

const setupS3Chrome = () => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: config.remoteChromeS3Bucket,
      Key: config.remoteChromeS3Key
    };
    s3.getObject(params).createReadStream().on('error', err => reject(err)).pipe(tar.x({
      C: config.setupChromePath
    })).on('error', err => reject(err)).on('end', () => resolve());
  });
};

const debugLog = log => {
  if (config.DEBUG) {
    let message = log;
    if (typeof log === 'function') message = log();
    Promise.resolve(message).then(message => console.log(message));
  }
};