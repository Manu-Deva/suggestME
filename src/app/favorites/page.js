"use client";

import { useState, useEffect } from "react";
import {
  getUserFavorites,
  getRelatedArtists,
  getNextShows,
} from "../../lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ArtistModal({ artist, relatedArtists, shows, loading, error }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex flex-col space-y-3 justify-center items-center py-8">
        <Skeleton className="h-[125px] w-[250px] rounded-xl bg-gray-800" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-black">
      <h2 className="text-2xl font-bold mb-4">
        Related Artists for {artist.name}
      </h2>
      {relatedArtists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {relatedArtists.map((relatedArtist) => (
            <div
              key={relatedArtist.id}
              className="border border-gray-200 bg-black p-4 rounded-lg shadow-lg transition-all hover:shadow-2xl hover:scale-105 transform hover:bg-gray-800 duration-300 ease-in-out"
            >
              <h3 className="text-lg font-semibold text-white">
                {relatedArtist.name}
              </h3>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-6">No related artists found.</p>
      )}

      <h2 className="text-2xl font-bold mb-4">
        Upcoming Shows for {artist.name}
      </h2>
      {shows.length > 0 ? (
        <div className="space-y-4">
          {shows.map((show) => (
            <div
              key={show.id}
              className="border border-gray-200 bg-black p-4 rounded-lg shadow-lg transition-all hover:shadow-2xl hover:scale-105 transform hover:bg-gray-800 duration-300 ease-in-out flex items-center"
            >
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white">
                  {show.name}
                </h3>
                <p>{formatDate(show.dates?.start?.localDate)}</p>
                {show._embedded && show._embedded.venues[0] && (
                  <p>
                    {show._embedded.venues[0].name},{" "}
                    {show._embedded.venues[0].city.name}
                  </p>
                )}
                <a
                  href={show.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Buy Tickets
                </a>
              </div>
              {show.images.length > 0 && (
                <img
                  src={show.images[0].url}
                  alt={show.name}
                  className="w-1/3 h-1/3 object-cover rounded-md ml-4"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No upcoming shows found.</p>
      )}
    </div>
  );
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [shows, setShows] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("spotify_access_token");
        if (!token) {
          throw new Error("No access token found");
        }
        const data = await getUserFavorites(token);
        setFavorites(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleArtistSelect = async (artist) => {
    setSelectedArtist(artist);
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("spotify_access_token");
      const relatedData = await getRelatedArtists(artist.id, token);

      if (Array.isArray(relatedData)) {
        setRelatedArtists(relatedData.slice(0, 5));
      } else {
        console.error(
          "Unexpected data structure for related artists:",
          relatedData
        );
        setRelatedArtists([]);
      }

      const showsData = await getNextShows(artist.name);
      setShows(showsData ? showsData.events : []);
    } catch (err) {
      console.error("Error fetching artist data:", err);
      setModalError(`Failed to fetch data: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col space-y-3 justify-center items-center py-8">
        <Skeleton className="h-[125px] w-[250px] rounded-xl bg-gray-500" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Top Artists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((artist) => (
          <div
            key={artist.id}
            className="bg-black border border-gray-300 shadow-md rounded-lg overflow-hidden"
          >
            <img
              src={artist.images[0]?.url}
              alt={artist.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl text-green-700 font-semibold mb-2">
                {artist.name}
              </h2>
              <p className="text-md text-white mb-4">
                {artist.genres.join(", ")}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    onClick={() => handleArtistSelect(artist)}
                    className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Show Related & Upcoming
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-black">
                  <DialogHeader>
                    <DialogTitle>{artist.name}</DialogTitle>
                  </DialogHeader>
                  <ArtistModal
                    artist={artist}
                    relatedArtists={relatedArtists}
                    shows={shows}
                    loading={modalLoading}
                    error={modalError}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
