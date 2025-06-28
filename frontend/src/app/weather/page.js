"use client";

import { useState, useEffect } from "react";
import { getWeatherBasedRecs, getGenreRecs } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function WeatherBasedRecommendations() {
  const [zipCode, setZipCode] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("spotify_access_token");
      const data = await getWeatherBasedRecs(zipCode);
      setRecommendations(data);
      const inputGenre = data.selected_genre;
      const trackData = await getGenreRecs(token, inputGenre);
      const simplifiedRecommendations = trackData.tracks.map((track) => ({
        artist: track.artists[0].name,
        track_title: track.name,
        album_image: track.album.images[0]?.url,
        uri: track.uri,
      }));
      setTracks(simplifiedRecommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (zipCode.trim()) {
      fetchRecommendations(zipCode);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Weather-Based Music Recommendations
      </h1>

      <form onSubmit={handleSubmit} className="mb-6 flex justify-center">
        <input
          type="text"
          className="border border-gray-300 rounded-lg p-3 w-1/3 text-black focus:ring-2 focus:ring-blue-500"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter your ZIP code"
        />
        <button
          type="submit"
          className="ml-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          Get Recommendations
        </button>
      </form>

      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">Error: {error}</div>}

      {recommendations && (
        <div className="mb-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-1">Your Recommendations</h2>
          <p>
            Weather: {recommendations.temp}°F, Cloudiness:{" "}
            {recommendations.cloudiness}%
          </p>
          <p>Recommended Genre: {recommendations.selected_genre}</p>
          <Carousel className="w-full max-w-2xl">
            <CarouselContent>
              {tracks.map((rec, index) => (
                <CarouselItem key={index}>
                  <div className="p-1 bg-black">
                    <Card className="bg-gray-600 shadow-md rounded-lg overflow-hidden">
                      <CardContent className="flex flex-col items-center justify-center p-0">
                        <img
                          src={rec.album_image}
                          alt={rec.track_title}
                          className="w-full h-72 object-cover"
                        />
                        <div className="p-4 self-start">
                          <h2 className="text-xl text-white font-semibold mb-2">
                            {rec.track_title}
                          </h2>
                          <p className="text-white">Artist: {rec.artist}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}
