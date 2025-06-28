"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { getGenreRecs } from "../../lib/api";
import { addToPlaylist } from "../../lib/api";
import GenreSearch from "../../components/GenreSearch"; // Adjust the path as needed
import { addPlaylist, clearProfile } from "../../store/profileSlice";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

import Link from "next/link";
import Image from "next/image";

export default function Recs() {
  const router = useRouter();
  const dispatch = useDispatch(); // Initialize the Redux dispatch function
  const [recommendations, setRecommendations] = useState([]);
  //   const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genre, setGenre] = useState("pop"); // Default genre to pop
  //   const [inputGenre, setInputGenre] = useState("pop"); // Genre from input field
  const profileData = useSelector((state) => state.profile.profile); // Access the profile data
  const token = useSelector((state) => state.profile.accessToken);

  //   useEffect(() => {
  const fetchRecommendations = async (selectedGenre) => {
    try {
      if (!token) {
        alert("No access token! Ensure you're authenticated.");
        dispatch(clearProfile());
        router.push("/get-started");
      }

      if (!genre) return; // Don't fetch if no genre is selected

      //   setLoading(true);
      const data = await getGenreRecs(token, selectedGenre);
      const simplifiedRecommendations = data.tracks.map((track) => ({
        artist: track.artists[0].name,
        track_title: track.name,
        album_image: track.album.images[0]?.url,
        uri: track.uri,
      }));

      setRecommendations(simplifiedRecommendations);
    } catch (err) {
      setError(err.message);
    }
  };

  //     fetchRecommendations();
  //   }, [genre]); // Re-fetch recommendations when inputGenre changes

  const SPOTIFY_GENRES = [
    "acoustic",
    "afrobeat",
    "alt-rock",
    "alternative",
    "ambient",
    "anime",
    "black-metal",
    "bluegrass",
    "blues",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "cantopop",
    "chicago-house",
    "children",
    "chill",
    "classical",
    "club",
    "comedy",
    "country",
    "dance",
    "dancehall",
    "death-metal",
    "deep-house",
    "detroit-techno",
    "disco",
    "disney",
    "drum-and-bass",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electronic",
    "emo",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "guitar",
    "happy",
    "hard-rock",
    "hardcore",
    "hardstyle",
    "heavy-metal",
    "hip-hop",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "indie-pop",
    "industrial",
    "iranian",
    "j-dance",
    "j-idol",
    "j-pop",
    "j-rock",
    "jazz",
    "k-pop",
    "kids",
    "latin",
    "latino",
    "malay",
    "mandopop",
    "metal",
    "metal-misc",
    "metalcore",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "pop",
    "pop-film",
    "post-dubstep",
    "power-pop",
    "progressive-house",
    "psych-rock",
    "punk",
    "punk-rock",
    "r-n-b",
    "rainy-day",
    "reggae",
    "reggaeton",
    "road-trip",
    "rock",
    "rock-n-roll",
    "rockabilly",
    "romance",
    "sad",
    "salsa",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "synth-pop",
    "tango",
    "techno",
    "trance",
    "trip-hop",
    "turkish",
    "work-out",
    "world-music",
  ];

  //   const handleGenreChange = (e) => {
  //     setInputGenre(e.target.value);
  //   };

  //   const handleSelect = (value) => {
  //     setInputGenre(value);
  //     setGenre(value); // This will trigger the useEffect to fetch recommendations
  //   };

  //   const handleSearch = () => {
  //     if (SPOTIFY_GENRES.includes(inputGenre)) {
  //       setGenre(inputGenre); // This will trigger the useEffect to fetch recommendations
  //     } else {
  //       alert("Please select a valid genre from the list.");
  //     }
  //   };

  // Use the setGenre function to trigger fetchRecommendations
  const handleSetGenre = (selectedGenre) => {
    setGenre(selectedGenre);
    fetchRecommendations(selectedGenre);
  };
  const handleCreatePlaylist = async () => {
    const userId = profileData.id;
    console.log("User Id: " + userId);
    if (!userId) {
      alert("User ID not set! Ensure you're authenticated.");
      return;
    }

    const trackUris = recommendations.map((rec) => rec.uri);

    try {
      const response = await addToPlaylist(token, genre, userId, trackUris);
      console.log("reponse", response);
      dispatch(
        addPlaylist({
          id: response.playlist_id,
          image: response.playlist_image,
          genre: response.playlist_genre,
          tracks: response.playlist_urls,
        })
      );
      alert("Playlist created and tracks added!");
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create playlist.");
    }
  };

  //   if (loading)
  //     return (
  //       <div className="flex flex-col space-y-3 justify-center items-center py-8">
  //         <Skeleton className="h-[125px] w-[250px] rounded-xl bg-gray-500" />
  //         <div className="space-y-2">
  //           <Skeleton className="h-4 w-[250px]" />
  //           <Skeleton className="h-4 w-[200px]" />
  //         </div>
  //       </div>
  //     );
  //   if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="px-4 lg:px-6 h-14 flex">
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
      <div className="items-center justify-center mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-white">
          Genre Recommendations
        </h1>
        {/* Input to type genre */}
        {/* <div className="mb-6 flex items-center">
          <label className="mr-4 text-white">Enter a genre:</label>
          <input
            type="text"
            className="text-black border rounded-md p-2"
            value={inputGenre}
            onChange={handleGenreChange}
          />
          <button
            onClick={handleSearch}
            className="ml-4 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Search
          </button>
        </div> */}
        {/* Carousel for displaying recommendations */}
        {/* <Carousel className="w-full max-w-2xl">
          <CarouselContent>
            {recommendations.map((rec, index) => (
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
        </Carousel> */}
        {/* Button to create playlist */}
        <div>
          <GenreSearch setGenre={handleSetGenre} />{" "}
          {/* Use the GenreSearch component */}
          {recommendations.length > 0 && (
            <div className="w-full max-w-2xl mx-auto mt-8">
              <Carousel className="w-full">
                <CarouselContent>
                  {recommendations.map((rec, index) => (
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
        <button
          onClick={handleCreatePlaylist}
          className="my-6 px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors duration-200"
        >
          Create Playlist from Recommendations
        </button>
      </div>
    </div>
  );
}
