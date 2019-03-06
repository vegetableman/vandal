'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const setup = require('./starter-kit/setup');
const shortid = require('shortid');
const jimp = require('jimp');
const CDN_PREFIX = 'https://d1smdru0lrhqpr.cloudfront.net/';

exports.handler = (() => {
  var _ref = _asyncToGenerator(function* (event, context, callback) {
    console.log('handler start---');
    // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    try {
      const result = yield exports.run(event.url, event.resize);
      callback(null, result);
    } catch (e) {
      callback(e);
    }
  });

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.run = (() => {
  var _ref2 = _asyncToGenerator(function* (url, resize) {
    console.log('handler run---');
    let name = '';
    if (url.match(/\d+/)) {
      name = url.match(/\d+/)[0] + '_' + encodeURIComponent(url.split('im_/')[1]);
    } else {
      name = shortid.generate();
    }
    const key = `screenshots/${name}.png`;

    const aws = require('aws-sdk');
    const s3 = new aws.S3({ apiVersion: '2006-03-01' });

    try {
      yield s3.headObject({
        Bucket: process.env.CHROME_BUCKET,
        Key: key
      }).promise();
      return CDN_PREFIX + encodeURIComponent(key);
    } catch (headErr) {
      console.log('handler run---ex');
    }

    console.log('handler run---1');
    const browser = yield setup.getBrowser();
    console.log('handler run---1x');
    const page = yield browser.newPage();
    console.log('handler run---2x');
    yield page.goto(url, {
      waitUntil: ['domcontentloaded', 'networkidle0']
    });
    console.log('handler run---2');
    yield page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });
    const fs = require('fs');
    const screenshot = yield new Promise(function (resolve, reject) {
      fs.readFile('/tmp/screenshot.png', function (err, data) {
        if (err) return reject(err);
        resolve(data);
      });
    });
    let buffer = null;
    if (resize) {
      const image = yield jimp.read(screenshot);
      image.resize(800, 600);
      buffer = yield image.getBufferAsync(jimp.AUTO);
    }
    yield s3.putObject({
      Bucket: process.env.CHROME_BUCKET,
      Key: key,
      Body: buffer || screenshot
    }).promise();

    yield page.close();
    yield browser.close();
    return CDN_PREFIX + encodeURIComponent(key);
  });

  return function (_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();