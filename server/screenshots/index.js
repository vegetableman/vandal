const Chromeless = require('chromeless').default

async function run() {
  const chromeless = new Chromeless({
    remote: {
      endpointUrl: 'https://6qya0ced63.execute-api.us-east-2.amazonaws.com/dev/',
      apiKey: 'reZSnSiXPc1gUz4X6fOd24lHAwGB9rC87M9HmJuB'
    },
    debug: true
  })

  // const screenshot = await chromeless
  //   .goto('https://www.graph.cool')
  //   .scrollTo(0, 2000)
  //   .screenshot()
    
  // console.log(screenshot) // prints local file path or S3 url

  // await chromeless.end()
}

run().catch(console.error.bind(console))