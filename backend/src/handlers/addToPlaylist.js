const axios = require("axios");
const qs = require("querystring");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

// Helper function to create Playlist based on genre
async function createNewPlaylist(token, user_id, genre) {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${user_id}/playlists`,
      {
        name: `suggestMe's ${genre} playlist`,
        description: "Created by SuggestMe",
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const playlist_id = response.data.id;
    return playlist_id;
  } catch (error) {
    console.error("Error creating playlist", error.message);
    throw error;
  }
}
// Helper function to add songs to playlist
async function addToPlaylist(token, playlist_id, urls) {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      {
        uris: urls, // Ensure urls is an array of track URIs
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // Should return snapshot_id or relevant response data
  } catch (error) {
    console.error("Error adding to playlist", error.message);
    throw error;
  }
}

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token

  try {
    // const clientId = process.env.SPOTIFY_CLIENT_ID;
    // const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const body = JSON.parse(event.body);
    const id = body.id; // User ID
    const genre = body.genre || "pop"; // Default to 'pop' if genre is not provided
    const urls = body.urls; // URLs to add to the playlist
    console.log("Genre:", genre);

    // Get recommendations based on genre
    const playlist = await createNewPlaylist(token, id, genre);
    console.log("Playlist created with ID:", playlist);
    const added = await addToPlaylist(token, playlist, urls);
    console.log("Tracks added to playlist:", added);

    return {
      statusCode: 200,
      body: JSON.stringify({ playlist, added }),
    };
  } catch (error) {
    console.error("Error with playlist:", error.message);
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
      body: JSON.stringify({ error: "Failed to add to playlist" }),
      message: error.message,
      status: error.response ? error.response.status : "No status code",
      details: error.response ? error.response.data : "No response data",
    };
  }
};

exports.handler = middy(handler).use(cors());
