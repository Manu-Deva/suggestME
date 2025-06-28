const axios = require("axios");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();
const { getSpotifyToken } = require("../utils/spotifyToken");

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, TICKETMASTER_API_KEY } =
  process.env;

async function searchArtist(artistName, token) {
  const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.artists.items[0];
}

async function getRelatedArtists(artistId, token) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.artists;
}

async function getNextShows(artistName) {
  const ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artistName}&apikey=${ticketmasterApiKey}&size=1&sort=date,asc`;
  const response = await axios.get(url);
  return response.data._embedded ? response.data._embedded.events : [];
}

const handler = async (event) => {
  const token = event.headers.Authorization.replace(/^Bearer\s+/i, ""); // The Spotify access token
  const artistName =
    event.queryStringParameters.artist_name || "Bruce Springsteen";
  //   const token = await getSpotifyToken();
  const artist = await searchArtist(artistName, token);

  if (!artist) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: `Artist not found: ${artistName}` }),
    };
  }

  const relatedArtists = await getRelatedArtists(artist.id, token);
  const relatedArtistsShows = [];

  for (let i = 0; i < Math.min(6, relatedArtists.length); i++) {
    const shows = await getNextShows(relatedArtists[i].name);
    relatedArtistsShows.push({
      name: relatedArtists[i].name,
      event: shows.length
        ? shows[0]
        : {
            name: "No events found",
            dates: { start: { localDate: "N/A" } },
            url: "",
            images: [{ url: "" }],
          },
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(relatedArtistsShows),
  };
};

exports.handler = middy(handler).use(cors());
