require('aws-sdk/clients/lambda');
const AWS = require('aws-sdk/lib/core');
AWS.config.region = 'us-east-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-2:bd44c5f3-c377-496b-aa2c-4df07f4895aa'
});
const lambda = new AWS.Lambda({ region: 'us-east-2' });

let requests = [];

module.exports = {
  abort: function() {
    _.each(requests, (r) => {
      const a = r.abort.bind(r);
      a();
    });
  },
  clear: function() {
    requests = [];
  },
  invoke: function(url) {
    console.log('invoke', url);
    return new Promise(function(resolve, reject) {
      const request = lambda.invoke(
        {
          FunctionName: 'screenshot-as-a-service-dev-screenshot',
          Payload: JSON.stringify({ url })
        },
        function(err, data) {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        }
      );
      requests.push(request);
    });
  }
};
