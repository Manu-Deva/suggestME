const axios = require("axios");
const querystring = require("querystring");
const middy = require("middy");
const { cors } = require("middy/middlewares");
require("dotenv").config();
const { getSpotifyToken } = require("../utils/spotifyToken");

const searchArtist = async (artistName, token) => {
  const url = "https://api.spotify.com/v1/search";
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const params = {
    q: artistName,
    type: "artist",
    limit: 1,
  };

  try {
    const response = await axios.get(url, { headers, params });
    const artists = response.data.artists.items;
    if (artists.length > 0) {
      return artists[0].id;
    } else {
      console.log(`No artist found for: ${artistName}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to search for artist: ${error.response.status}`);
    return null;
  }
};

const getNextShows = async (artistName, ticketmasterApiKey) => {
  const url = "https://app.ticketmaster.com/discovery/v2/events.json";
  const params = {
    keyword: artistName,
    apikey: ticketmasterApiKey,
    size: 1,
    sort: "date,asc",
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(
      `Failed to get events from Ticketmaster: ${error.response.status}`
    );
    return null;
  }
};

const getRelatedArtists = async (artistId, token) => {
  const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data.artists;
  } catch (error) {
    console.error(`Failed to get related artists: ${error.response.status}`);
    return null;
  }
};

const handler = async (event) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        "Spotify Client ID and Secret must be set in environment variables."
      ),
    };
  }

  const artistName =
    event.queryStringParameters?.artist_name || "Bruce Springsteen";

  if (!artistName) {
    return {
      statusCode: 400,
      body: JSON.stringify("Artist name must be provided in the event."),
    };
  }

  const token = await getSpotifyToken(clientId, clientSecret);

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify("Failed to retrieve Spotify access token."),
    };
  }

  const artistId = await searchArtist(artistName, token);

  if (!artistId) {
    return {
      statusCode: 404,
      body: JSON.stringify(`Artist not found: ${artistName}`),
    };
  }

  const relatedArtists = await getRelatedArtists(artistId, token);
  if (!relatedArtists) {
    return {
      statusCode: 500,
      body: JSON.stringify("Failed to retrieve related artists."),
    };
  }

  const relatedArtistsShows = [];
  const maxLoop = Math.min(relatedArtists.length, 6);

  for (let i = 0; i < maxLoop; i++) {
    const showsData = await getNextShows(
      relatedArtists[i].name,
      ticketmasterApiKey
    );
    if (showsData && showsData._embedded && showsData._embedded.events) {
      const event = showsData._embedded.events[0];
      relatedArtistsShows.push({
        name: relatedArtists[i].name,
        event_name: event.name,
        date: event.dates.start.localDate,
        url: event.url,
        thumbnail: event.images[0]?.url,
      });
    } else {
      relatedArtistsShows.push({
        name: relatedArtists[i].name,
        event_name: "None",
        date: "None",
      });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(relatedArtistsShows),
  };
};

exports.handler = middy(handler).use(cors());
