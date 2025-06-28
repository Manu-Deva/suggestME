const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;
  if (!ticketmasterApiKey) {
    throw new Error("Invalid ticketmaster API KEY");
  }
  //   const ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;
  const artistName = event.queryStringParameters.keyword;
  const encodedArtistName = encodeURIComponent(artistName);
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodedArtistName}&apikey=${ticketmasterApiKey}&size=1&sort=date,asc`;
  console.log("url: ", url);

  try {
    const response = await axios.get(url);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data ? response.data : []),
    };
  } catch (error) {
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request data:", error.request);
    } else {
      console.error("Error details:", error.message);
    }

    // Return more detailed error information
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to get next shows",
        message: error.message,
        status: error.response ? error.response.status : "No status code",
        details: error.response ? error.response.data : "No response data",
      }),
    };
  }
};

exports.handler = middy(handler).use(
  cors({
    origin: "*", // or 'http://localhost:3000' for development
    credentials: true,
    headers:
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,Accept,X-Requested-With,Origin",
  })
);
