const setup = require('./starter-kit/setup');
const shortid = require('shortid');
const jimp = require('jimp');
const CDN_PREFIX = 'https://d1smdru0lrhqpr.cloudfront.net/';

exports.handler = async (event, context, callback) => {
  // For keeping the browser launch
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const result = await exports.run(event.url, event.latest);
    callback(null, result);
  } catch (e) {
    callback(e);
  }
};

exports.run = async (url, latest) => {
  let name = '';
  if (url.match(/\d+/)) {
    name = url.match(/\d+/)[0] + '_' + encodeURIComponent(url.split('im_/')[1]);
  } else {
    name = shortid.generate();
  }
  const key = `screenshots/${name}.png`;

  const aws = require('aws-sdk');
  const s3 = new aws.S3({ apiVersion: '2006-03-01' });

  if (!latest) {
    try {
      await s3
        .headObject({
          Bucket: process.env.CHROME_BUCKET,
          Key: key
        })
        .promise();
      return CDN_PREFIX + encodeURIComponent(key);
    } catch (headErr) {}
  }

  const browser = await setup.getBrowser();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 25000
  });
  await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });
  const fs = require('fs');
  const screenshot = await new Promise((resolve, reject) => {
    fs.readFile('/tmp/screenshot.png', (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
  // let buffer = null;
  // if (resize) {
  //   const image = await jimp.read(screenshot);
  //   image.resize(800, 600);
  //   buffer = await image.getBufferAsync(jimp.AUTO);
  // }
  await s3
    .putObject({
      Bucket: process.env.CHROME_BUCKET,
      Key: key,
      Body: screenshot
    })
    .promise();

  await page.close();
  return CDN_PREFIX + encodeURIComponent(key);
};
