const chromium = require('chrome-aws-lambda');
const sharp = require('sharp');

let browser;
let PAGE_LOADED = false;

const isBrowserAvailable = async (mbrowser) => {
  try {
    await mbrowser.version();
  } catch (e) {
    return false;
  }
  return true;
};

const getBrowser = async () => {
  if (typeof browser === 'undefined' || !(await isBrowserAvailable(browser))) {
    browser = await chromium.puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });
  }
  return browser;
};

exports.handler = async (event, context) => {
  const url = event.url;
  context.callbackWaitsForEmptyEventLoop = false;
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
      PAGE_LOADED = true;
    });

    await page.waitFor(2 * 1000);

    await page
      .goto(url, { waitUntil: 'networkidle2', timeout: 30 * 1000 })
      .catch(async (e) => {
        console.error('goto error');
      });

    await page._client.send('Page.stopLoading');
    await page.waitFor(5 * 1000);
    let screenshot;
    if (PAGE_LOADED) {
      PAGE_LOADED = false;
      screenshot = await page
        .screenshot({ encoding: 'binary' })
        .catch((error) => {
          console.error('screenshot error');
        });
    }

    await page.close();

    if (screenshot) {
      screenshot = await sharp(screenshot)
        .resize(961, 600)
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    return {
      statusCode: screenshot ? 200 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
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
          'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: JSON.stringify({ buffer: null })
    };
  }
};
