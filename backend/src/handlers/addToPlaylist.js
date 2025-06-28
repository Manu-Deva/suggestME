const axios = require("axios");
const qs = require("querystring");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

// Helper function to create Playlist based on genre
async function createNewPlaylist(token, user_id, genre) {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${encodeURIComponent(
        user_id
      )}/playlists`,
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
    console.log("Full response:", JSON.stringify(response.data, null, 2));

    const playlist_id = response.data.id;
    const cover =
      response.data.images && response.data.images[0]
        ? response.data.images[0].url
        : null;

    console.log(
      `Playlist created successfully. ID: ${playlist_id}, Cover: ${cover}`
    );

    return { playlist_id, cover, genre };
  } catch (error) {
    console.error(
      "Error creating playlist",
      error.response ? error.response.data : error.message
    );
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
    const body = JSON.parse(event.body);
    const id = body.id; // User ID
    const genre = body.genre || "pop"; // Default to 'pop' if genre is not provided
    const urls = body.urls; // URLs to add to the playlist

    console.log("User ID:", id);
    console.log("Track URLs:", urls);
    console.log("Genre:", genre);

    // Get recommendations based on genre
    const playlistData = await createNewPlaylist(token, id, genre);
    console.log(
      "Playlist creation result:",
      JSON.stringify(playlistData, null, 2)
    );

    if (!playlistData.playlist_id) {
      throw new Error("Playlist ID is undefined after creation");
    }

    const added = await addToPlaylist(token, playlistData.playlist_id, urls);
    console.log("Tracks added to playlist:", added);

    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(
        playlistData.playlist_id
      )}/images`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(
      "Full image request-response:",
      JSON.stringify(response.data, null, 2)
    );

    coverImage = response.data[1].url;
    console.log("image url:", coverImage);

    return {
      statusCode: 200,
      body: JSON.stringify({
        playlist_id: playlistData.playlist_id,
        playlist_image: coverImage,
        playlist_genre: genre,
        playlist_urls: urls,
        confirmation: added,
      }),
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
