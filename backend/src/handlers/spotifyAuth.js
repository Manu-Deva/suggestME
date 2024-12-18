// // src/handlers/spotifyAuth.js
const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const handler = async (event) => {
  const { code } = JSON.parse(event.body);

  // Ensure you have the redirect_uri defined in the environment variables and it matches exactly with Spotify Developer Dashboard
  const redirect_uri = process.env.REDIRECT_URI;

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    data: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri,
    }),
  };

  try {
    const response = await axios(authOptions);
    const { access_token, refresh_token, expires_in } = response.data;

    // Return the access token and refresh token for frontend usage
    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token,
        refresh_token, // Include refresh token in response
        expires_in, // How long the access token is valid in seconds
      }),
    };
  } catch (error) {
    console.error("Error exchanging code for access token:", error.message);
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
      body: JSON.stringify({
        error: "Authentication failed",
        message: error.response?.data || error.message,
      }),
    };
  }
};

exports.handler = middy(handler).use(cors());
