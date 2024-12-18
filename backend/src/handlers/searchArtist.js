const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token;
  const artistName = event.queryStringParameters.artist_name;
  const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`;
  console.log("execution URL: ", url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const artist = response.data.artists.items[0];
    if (artist) {
      return {
        statusCode: 200,
        body: JSON.stringify({ artistId: artist.id }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Artist not found" }),
      };
    }
  } catch (error) {
    console.error("Failed to search artist:", error.message);
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
      body: JSON.stringify({ error: "Failed to search artist" }),
      message: error.message,
      status: error.response ? error.response.status : "No status code",
      details: error.response ? error.response.data : "No response data",
    };
  }
};

exports.handler = middy(handler).use(cors());
