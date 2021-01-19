const chromium = require('chrome-aws-lambda');
const sharp = require('sharp');

const getBrowser = async () => {
  return await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
    ignoreHTTPSErrors: true
  });
};

let page;
exports.handler = async (event, context) => {
  const url = event.url;
  context.callbackWaitsForEmptyEventLoop = false;
  const browserInstance = await getBrowser();

  try {
    page = await browserInstance.newPage();
    await page.setRequestInterception(true);
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 2
    });

    page.on('error', (err) => {
      console.log('page error', err.message);
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

    await page
      .goto(url, { waitUntil: 'networkidle0', timeout: 30 * 1000 })
      .catch(async (e) => {
        console.error('goto error');
      });

    await page.waitFor(5 * 1000);

    let screenshot;
    screenshot = await page
      .screenshot({ encoding: 'binary', type: 'jpeg' })
      .catch((error) => {
        console.error('screenshot error', error.message);
      });

    if (screenshot) {
      screenshot = await sharp(screenshot)
        .jpeg({ quality: 10 })
        .toBuffer();
    }

    try {
      await page.close();
      await browserInstance.close();
    } catch (ex) {
      console.log(ex.message);
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
    try {
      await page.close();
      await browserInstance.close();
    } catch (_ex) {
      console.log(_ex.message);
    }

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
