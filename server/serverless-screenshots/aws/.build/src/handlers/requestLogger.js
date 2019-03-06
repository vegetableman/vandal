const launch = require('@serverless-chrome/lambda')

const handler = require('./f4ribig8xhs___requestLogger.js')
const options = {"flags":["--window-size=1280,1696","--hide-scrollbars"],"chromePath":"/var/task/headless-chromium"}

module.exports.default = function ensureHeadlessChrome (
  event,
  context,
  callback
) {
  return (typeof launch === 'function' ? launch : launch.default)(options)
    .then(instance =>
      handler.default(event, context, callback, instance))
    .catch((error) => {
      console.error(
        'Error occured in serverless-plugin-chrome wrapper when trying to ' +
          'ensure Chrome for default() handler.',
        options,
        error
      )

      callback(error)
    })
}