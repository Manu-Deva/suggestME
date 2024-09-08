"use client";

import { useState, useEffect } from "react";
import { searchArtist, getRelatedArtists, getNextShows } from "../../lib/api";

export default function ArtistShows() {
  const [artistName, setArtistName] = useState("");
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shows, setShows] = useState([]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("spotify_access_token");
      if (!token) {
        throw new Error("Spotify access token not found");
      }

      const aid = await searchArtist(artistName, token);
      console.log("artistID", aid);
      const relatedArtistsData = await getRelatedArtists(aid, token);
      console.log("related data", relatedArtistsData);

      //   const ticketmasterApiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY;
      //   if (!ticketmasterApiKey) {
      //     throw new Error("Ticketmaster API key not found");
      //   }

      const limitedArtists = relatedArtistsData.slice(0, 5); // Limit to 5 artists to reduce API calls

      const showsPromises = relatedArtistsData.map(async (artist, index) => {
        await delay(index * 1000); // Wait 1 second * index before each request
        try {
          const showData = await getNextShows(artist.name);
          console;
          return {
            name: artist.name,
            shows: showData._embedded?.events || [],
          };
        } catch (error) {
          console.error(`Error fetching shows for ${artist.name}:`, error);
          return {
            name: artist.name,
            shows: [],
          };
        }
      });

      const relatedArtistsShows = await Promise.all(showsPromises);
      setRelatedArtists(relatedArtistsData);
      setShows(relatedArtistsShows);
    } catch (err) {
      console.error("Error in fetchShows:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (artistName.trim()) {
      fetchShows(artistName);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Upcoming Shows for Related Artists
      </h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <label className="mr-4">Search for an artist:</label>
        <input
          type="text"
          className="border rounded-md p-2"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          placeholder="Enter artist name"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md"
          disabled={loading}
        >
          Search
        </button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((artistShow) => (
          <div
            key={artistShow.name}
            className="border p-4 rounded-md shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">{artistShow.name}</h2>
            {artistShow.shows.length > 0 ? (
              artistShow.shows.map((show) => (
                <div key={show.id} className="mb-4">
                  <h3 className="text-lg font-medium">{show.name}</h3>
                  <p>Date: {show.dates?.start?.localDate}</p>
                  <a
                    href={show.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    Buy Tickets
                  </a>
                  {show.images.length > 0 && (
                    <img
                      src={show.images[0].url}
                      alt={show.name}
                      className="mt-2 rounded-md"
                    />
                  )}
                </div>
              ))
            ) : (
              <p>No upcoming shows</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
