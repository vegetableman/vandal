const puppeteer = require('puppeteer');
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
// puppeteer.use(AdblockerPlugin());

let browser;

const isBrowserAvailable = async (mbrowser) => {
  try {
    await mbrowser.version();
  } catch (e) {
    debugLog(e); // not opened etvar(--vandal-tooltip-background-color)c.
    return false;
  }
  return true;
};

const launchOptionForLambda = [
  // error when launch(); No usable sandbox! Update your kernel
  // '--no-sandbox',
  // '--disable-setuid-sandbox',
  // // error when launch(); Failed to load libosmesa.so
  // '--disable-gpu',
  // // freeze when newPage()
  // '--single-process'
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-setuid-sandbox',
  '--no-first-run',
  '--no-sandbox',
  '--no-zygote',
  '--single-process',
  '--ignore-certificate-errors'

  //   '--disable-dev-shm-usage'
];

const getBrowser = async () => {
  if (typeof browser === 'undefined' || !(await isBrowserAvailable(browser))) {
    browser = await puppeteer.launch({
      headless: true,
      args: launchOptionForLambda,
      ignoreHTTPSErrors: true
    });
  }
  return browser;
};

let PAGE_LOADED = false;

exports.handler = async (event, context) => {
  const url = event.queryStringParameters.url;
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  try {
    await page.setRequestInterception(true);
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 2
    });

    page.on('request', (request) => {
      if (
        request
          .url()
          .includes('//web.archive.org/_static/js/playback.bundle.js')
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    page.on('domcontentloaded', () => {
      console.log('Loadedx: ' + page.url());
      PAGE_LOADED = true;
    });

    console.time('wait----');
    await page.waitFor(2 * 1000);
    console.timeEnd('wait----');

    await page
      .goto(url, { waitUntil: 'networkidle2', timeout: 30 * 1000 })
      .catch(async (e) => {
        console.error('screenshot error----');
      });

    console.log('before screenshot----');
    await page._client.send('Page.stopLoading');
    console.log('before screenshotx----');
    await page.waitFor(5 * 1000);
    let screenshot;
    if (PAGE_LOADED) {
      console.log('before screenshoty----');
      PAGE_LOADED = false;
      screenshot = await page
        .screenshot({ encoding: 'binary' })
        .catch((error) => {
          console.log('screenshot errorx', error);
        });
      console.log('screenshot:', screenshot);
    }

    console.log('before screenshotz----');
    await page.close();

    return {
      statusCode: screenshot ? 200 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: JSON.stringify({
        buffer: screenshot || null
      })
    };
  } catch (ex) {
    await page.close();
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: JSON.stringify({ buffer: null })
    };
  }
};
