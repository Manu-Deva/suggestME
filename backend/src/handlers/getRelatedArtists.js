const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token
  const artistId = event.queryStringParameters.artistId;

  if (!artistId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Artist ID is required" }),
    };
  }

  try {
    // Step 1: Get the artist's genres
    const artistRes = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const genres = artistRes.data.genres;
    if (!genres || genres.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    // Step 2: Search for other artists in the same genres
    let relatedArtists = [];
    for (const genre of genres.slice(0, 2)) { // Limit to 2 genres for performance
      const res = await axios.get(
        `https://api.spotify.com/v1/search`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            q: `genre:\"${genre}\"`,
            type: "artist",
            limit: 10,
          },
        }
      );
      relatedArtists.push(...res.data.artists.items);
    }

    // Step 3: Filter out the original artist and deduplicate
    relatedArtists = relatedArtists
      .filter(a => a.id !== artistId)
      .reduce((acc, curr) => {
        if (!acc.find(a => a.id === curr.id)) acc.push(curr);
        return acc;
      }, []);

    return {
      statusCode: 200,
      body: JSON.stringify(relatedArtists),
    };
  } catch (error) {
    console.error("Failed to get related artists (workaround):", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get related artists (workaround)" }),
    };
  }
};

exports.handler = middy(handler).use(cors());
