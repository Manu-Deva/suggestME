const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token
  const url = "https://api.spotify.com/v1/me/top/tracks?limit=5";

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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get top tracks" }),
    };
  }
};

exports.handler = middy(handler).use(cors());
