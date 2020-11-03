module.exports = {
  // VANDAL_SCREENSHOT_API: JSON.stringify(
  //   'http://localhost:8888/.netlify/functions/take-screenshot-dev'
  // ),
  // VANDAL_HISTORICAL_API: JSON.stringify(
  //   'http://localhost:8888/.netlify/functions/is-screenshots-available'
  // ),
  VANDAL_SCREENSHOT_API: JSON.stringify(
    'https://vandal-puppeteer.netlify.app/.netlify/functions/take-screenshot-prod'
  ),
  // VANDAL_SCREENSHOT_IS_AVAILABLE: JSON.stringify(
  //   'https://vandal-puppeteer.netlify.app/.netlify/functions/is-screenshots-available'
  // )
  VANDAL_SCREENSHOT_IS_AVAILABLE: JSON.stringify(
    'https://hug7g8oxyb.execute-api.us-east-2.amazonaws.com/dev/is-historical-available'
  )
};
