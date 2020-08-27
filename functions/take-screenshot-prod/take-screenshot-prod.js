const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async (event, context) => {
  const url = event.queryStringParameters.url;

  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate((_) => {
    if (!!document.getElementById('wm-ipp-base')) {
      document.getElementById('wm-ipp-base').remove();
    }
  });
  const screenshot = await page.screenshot({ encoding: 'binary' });
  await browser.close();

  return {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    statusCode: 200,
    body: JSON.stringify({
      buffer: screenshot
    })
  };
};
