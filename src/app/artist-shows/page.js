"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Import framer-motion
import { searchArtist, getRelatedArtists, getNextShows } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export default function ArtistShows() {
  const router = useRouter();
  const dispatch = useDispatch(); // Initialize the Redux dispatch function
  const profileData = useSelector((state) => state.profile.profile); // Access the profile data
  const token = useSelector((state) => state.profile.accessToken);
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
      //   const token = localStorage.getItem("spotify_access_token");
      if (!token) {
        alert("No access token! Ensure you're authenticated.");
        dispatch(clearProfile());
        router.push("/get-started");
      }

      // Fetch input artist ID
      const inputArtistId = await searchArtist(artistName, token);
      console.log("Input artistID", inputArtistId);

      // Fetch shows for input artist
      const inputArtistShows = await getNextShows(artistName);

      // Fetch related artists
      const relatedArtistsData = await getRelatedArtists(inputArtistId, token);
      console.log("related data", relatedArtistsData);

      const limitedArtists = relatedArtistsData.slice(0, 19); // Limit to 4 related artists to keep total at 20 including input artist

      // Prepare array with input artist and related artists
      const allArtists = [{ name: artistName }, ...limitedArtists];

      const showsPromises = allArtists.map(async (artist, index) => {
        await delay(index * 250);
        try {
          // For the input artist, use the already fetched shows
          const showData =
            artist.name === artistName
              ? inputArtistShows
              : await getNextShows(artist.name);
          return {
            name: artist.name,
            eventData: showData ? showData.events : [],
          };
        } catch (error) {
          console.error(`Error fetching shows for ${artist.name}:`, error);
          return {
            name: artist.name,
            eventData: [],
          };
        }
      });

      Promise.all(showsPromises)
        .then((allArtistsShows) => {
          console.log("All promises resolved successfully");
          console.log("All Artists Shows:", allArtistsShows);
          setRelatedArtists([...relatedArtistsData]);
          setShows(allArtistsShows);
          return allArtistsShows;
        })
        .catch((error) => {
          console.error("Error in Promise.all:", error);
          setError("Failed to fetch shows for all artists");
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error("Error in fetchShows:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  console.log("Shows: ", shows);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (artistName.trim()) {
      fetchShows(artistName);
    }
  };

  const convertTo12Hour = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    let hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour12}:${minute} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <div className="flex items-center space-x-10">
          <Link className="flex items-center justify-center" href="/">
            <span className="ml-2 text-2xl font-bold">SuggestMe</span>
          </Link>
          <nav className="hidden md:flex space-x-10">
            <Link
              href="/"
              className="hover:text-gray-300 text-sm font-medium hover:underline underline-offset-4"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-gray-300 text-sm font-medium hover:underline underline-offset-4"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          {profileData && profileData.images ? (
            <span className="flex flex-row items-center space-x-4 text-sm font-medium">
              <img
                src={profileData.images[0].url}
                alt="Profile"
                className="w-10 h-10 rounded-full mt-2"
              />
            </span>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Login
            </Link>
          )}
        </nav>
      </header>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center font-sans">
          Find Upcoming Shows
        </h1>

        <form onSubmit={handleSubmit} className="mb-8 flex justify-center">
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-3 w-1/3 text-black focus:ring-2 focus:ring-blue-500 font-sans"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Search for an artist"
          />
          <button
            type="submit"
            className="ml-4 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors font-sans"
            disabled={loading}
          >
            Search
          </button>
        </form>

        {loading && <div className="text-center text-gray-500">Loading...</div>}
        {error && (
          <div className="text-center text-red-500">Error: {error}</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shows.map((artistShow, index) => (
            <motion.div
              key={artistShow.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card key={artistShow.name} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black">
                    {artistShow.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {artistShow.eventData.length > 0 ? (
                    artistShow.eventData.map((show) => (
                      <div key={show.id} className="mb-4">
                        <h3 className="text-lg font-semibold">{show.name}</h3>
                        {show.images.length > 0 && (
                          <div className="mt-2 relative w-full h-32 mb-2">
                            <Image
                              src={show.images[0].url}
                              alt={show.name}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-md"
                            />
                          </div>
                        )}
                        {show._embedded && show._embedded.venues.length > 0 && (
                          <>
                            <p className="text-sm text-muted-foreground mb-1">
                              {convertTo12Hour(show.dates?.start?.localTime)},{" "}
                              {formatDate(show.dates?.start?.localDate)}
                            </p>
                            <p className="font-medium">
                              {show._embedded.venues[0].name || ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {show._embedded.venues[0].city?.name || ""},{" "}
                              {show._embedded.venues[0].state?.name || ""}
                            </p>
                          </>
                        )}
                        <Link
                          href={show?.url || ""}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Buy Tickets
                        </Link>
                      </div>
                    ))
                  ) : (
                    <Badge variant="secondary">No upcoming shows</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
