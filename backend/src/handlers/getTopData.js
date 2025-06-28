// const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token
  const url =
    "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5";

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(await response.json()),
    };
  } catch (error) {
    console.error("Failed to get top tracks:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request data:", error.request);
    } else {
      console.error("Error details:", error.message);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get top tracks" }),
      message: error.message,
      status: error.response ? error.response.status : "No status code",
      details: error.response ? error.response.data : "No response data",
    };
  }
};

exports.handler = middy(handler).use(cors());
