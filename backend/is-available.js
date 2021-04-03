exports.handler = async () => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ isAvailable: process.env.IS_AVAILABLE })
    };
  } catch (ex) {
    return { statusCode: 500 };
  }
};
