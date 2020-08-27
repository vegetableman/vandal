const puppeteer = require('puppeteer');
const captureWebsite = require('capture-website');

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
    console.log('browser:1');
    browser = await puppeteer.launch({
      headless: true,
      args: launchOptionForLambda,
      ignoreHTTPSErrors: true
    });
  }
  console.log('browser:2');
  return browser;
};

exports.handler = async (event, context) => {
  const url = event.queryStringParameters.url;
  try {
    // const browserInstance = await getBrowser();
    const browserInstance = await puppeteer.launch();
    const page = await browserInstance.newPage();
    await page.setRequestInterception(true);
    // await page.setViewport({ width: 1366, height: 768 });
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 2
    });

    page.on('request', (request) => {
      // if (request.resourceType() === "script") {
      //   request.abort()
      // } else {
      //   request.continue()
      // }
      // console.log('request:', request.resourceType(), request.url());
      if (
        // request.url().includes('analytics.archive.org/0.gif') ||
        // request.url().includes('wombat.js') ||
        request.url().includes('_static/js/playback.bundle.js')
        // ||
        // request.url().includes('connect.facebook.net') ||
        // request.url().includes('ga.js') ||
        // request.url().includes('gtm.js') ||
        // request.url().includes('www.googletagservices.com/tag/js/gpt.js') ||
        // request.url().includes('analytics.js') ||
        // request.url().includes('rum-staging.js') ||
        // request.url().includes('loading.gif') ||
        // request.url().includes('record.css') ||
        // request
        //   .url()
        //   .includes('http://web.archive.org/_static/images/toolbar/') ||
        // request.resourceType() === 'media' ||
        // (request.url().includes('https://archive.org') &&
        //   request.resourceType() === 'image') ||
        // request.url().includes('https://archive.org/includes/donate.php') ||
        // request.url().includes('platform.twitter.com/widgets.js') ||
        // request.url().includes('atrk.js') ||
        // request.url().includes('securepubads.g.doubleclick.net') ||
        // request.url().includes('adservice.google.com') ||
        // request.url().includes('web.archive.org/save/_embed') ||
        // request.url().includes('web.archive.org/_static') ||
        // request.url().includes('gstatic')
      ) {
        console.log('aborted---------');
        request.abort();
      } else {
        request.continue();
      }
    });

    // console.time('screenshot');
    await page
      .goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
      .catch((e) => {
        console.log('error:', e);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
              'Origin, X-Requested-With, Content-Type, Accept'
          },
          body: null
        };
      });
    // const perf = await page.metrics();
    // console.timeEnd('screenshot');
    // console.log('before eval');
    // console.log(JSON.stringify(perf, null, '  '));
    // console.time('eval');
    // await page.evaluate((_) => {
    //   //   // console.log('hello world');
    //   //   // console.log('wp-1', document.getElementById('wm-ipp-base'));
    //   //   // document.body.onload = () => {
    //   //   //   console.log('wp-2', document.getElementById('wm-ipp-base'));
    //   //   // };
    //   //   // document.body.style.background = '#000';
    //   if (!!document.getElementById('wm-ipp-base')) {
    //     document.getElementById('wm-ipp-base').remove();
    //   }
    // });
    // console.timeEnd('eval');

    const screenshot = await page.screenshot({ encoding: 'binary' });
    await page.close();
    await browserInstance.close();

    // const screenshot = await captureWebsite.buffer(url);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: JSON.stringify({
        buffer: screenshot
      })
    };
  } catch (ex) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept'
      }
    };
  }
};
