const axios = require("axios");
const qs = require("querystring");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();
const { getSpotifyToken } = require("../utils/spotifyToken");

// Helper function to get recommendations based on genre
async function getRecommendationsByGenre(token, genre, limit = 10) {
  const recommendationsUrl = `https://api.spotify.com/v1/recommendations?seed_genres=${genre}&limit=${limit}`;
  const response = await axios.get(recommendationsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // Get genre from query parameters, default to 'pop'
    const genre = event.queryStringParameters.genre || "pop";

    console.log("Genre:", genre);

    // Get recommendations based on genre
    const recommendations = await getRecommendationsByGenre(token, genre, 10);
    console.log(recommendations);

    return {
      statusCode: 200,
      body: JSON.stringify(recommendations),
    };
  } catch (error) {
    console.error("Error fetching genre recommendations:", error);
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
      body: JSON.stringify({ error: "Failed to fetch recommendations" }),
    };
  }
};

exports.handler = middy(handler).use(cors());
