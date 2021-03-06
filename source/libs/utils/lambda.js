require("aws-sdk/clients/lambda");
const AWS = require("aws-sdk/lib/core");

AWS.config.region = process.env.LAMBDA_REGION; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.LAMBDA_IDENTITY_POOL_ID
});
const lambda = new AWS.Lambda({ region: process.env.LAMBDA_REGION });

let requests = [];

export default {
  abort() {
    _.each(requests, (r) => {
      const a = r.abort.bind(r);
      a();
    });
  },
  clear() {
    requests = [];
  },
  invoke(url) {
    return new Promise(((resolve, reject) => {
      const request = lambda.invoke(
        {
          FunctionName: process.env.LAMBDA_SCREENSHOT_FUNCTION_NAME,
          Payload: JSON.stringify({ url })
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        }
      );
      requests.push(request);
    }));
  }
};
