const axios = require("axios");
const qs = require("querystring");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

// Helper function to get Spotify token
async function getSpotifyToken(clientId, clientSecret) {
  const authUrl = "https://accounts.spotify.com/api/token";
  const authResponse = await axios.post(
    authUrl,
    qs.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return authResponse.data.access_token;
}

// Helper function to get recommendations based on genre
async function getRecommendationsByGenre(token, genre, limit = 5) {
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

    // Get Spotify token
    // const token = await getSpotifyToken(clientId, clientSecret);
    // const token = localStorage.getItem("spotify_access_token");

    // Get recommendations based on genre
    const recommendations = await getRecommendationsByGenre(token, genre, 5);
    console.log(recommendations);

    return {
      statusCode: 200,
      body: JSON.stringify(recommendations),
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch recommendations" }),
    };
  }
};

exports.handler = middy(handler).use(cors());
