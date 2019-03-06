const Chromeless = require('chromeless').default

module.exports.getScreenshot = async (event, context) => {
  const chromeless = new Chromeless({
    remote: {
      endpointUrl: 'https://6qya0ced63.execute-api.us-east-2.amazonaws.com/dev/',
      apiKey: 'reZSnSiXPc1gUz4X6fOd24lHAwGB9rC87M9HmJuB'
    },
  })

  const screenshot = await chromeless
    .goto('https://www.google.com')
    .type('chromeless', 'input[name="q"]')
    .press(13)
    .wait('#resultStats')
    .screenshot()

  console.log(screenshot) // prints local file path or S3 url

  await chromeless.end()
}

