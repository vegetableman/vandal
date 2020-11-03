const IS_UNAVAILABLE = false;

exports.handler = async () => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ isAvailable: !IS_UNAVAILABLE })
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
