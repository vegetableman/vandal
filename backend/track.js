require('dotenv').config()
const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.API_KEY }).base('appMBE0zOUzzaRLti');;
const recordId = 'rec4RFpFmlKpJWX5q';

exports.handler = async (event) => {
  const params = JSON.parse(event.body);
  const isUsage = params.usage;
  const isDonate = params.donate;
  const update = () => {
    return new Promise((resolve, reject) => {
      base('Tracking').find(recordId, function(err, record) {
        if (err) {
          reject(err);
          return;
        }
        let usage = parseInt(record.get("Usage") || "0");
        let donate = parseInt(record.get("Donate") || "0");
        if(isUsage) {
          usage += 1;
        } else if (isDonate) {
          donate += 1;
        }
        base('Tracking').update([
          {
            "id": recordId,
            "fields": {
                "Usage": `${usage}`,
                "Donate": `${donate}`
              }
          }], (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    })
  }
  try {
    await update();
    return {
      statusCode: 200
    };
  }
  catch(ex) {
    console.error(ex.message);
    return {
      statusCode: 500
    };
  }
};
