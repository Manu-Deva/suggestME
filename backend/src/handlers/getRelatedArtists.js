const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token
  const artistId = event.queryStringParameters.artistId;
  const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;

  if (!artistId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Artist ID is required" }),
    };
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data.artists),
    };
  } catch (error) {
    console.error("Failed to get related artists:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get related artists" }),
    };
  }
};

exports.handler = middy(handler).use(cors());
