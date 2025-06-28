const axios = require("axios");

async function getSpotifyToken(clientId, clientSecret) {
  const url = "https://accounts.spotify.com/api/token";
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  const data = new URLSearchParams({ grant_type: "client_credentials" });

  const response = await axios.post(url, data.toString(), {
    headers,
    auth: { username: clientId, password: clientSecret },
  });

  return response.data.access_token;
}

module.exports = { getSpotifyToken }; 