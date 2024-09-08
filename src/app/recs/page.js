// "use client";

// import { useState, useEffect } from "react";
// import { getGenreRecs } from "../../lib/api";

// export default function Recs() {
//   const [recommendations, setRecommendations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [genre, setGenre] = useState("pop"); // Default genre to pop
//   const [inputGenre, setInputGenre] = useState("pop"); // Genre from input field

//   useEffect(() => {
//     const fetchRecommendations = async () => {
//       try {
//         const token = localStorage.getItem("spotify_access_token");
//         if (!token) {
//           throw new Error("No access token found");
//         }

//         const data = await getGenreRecs(token, inputGenre);

//         // Simplify recommendations response
//         const simplifiedRecommendations = data.tracks.map((track) => ({
//           artist: track.artists[0].name,
//           track_title: track.name,
//           album_image: track.album.images[0]?.url,
//         }));

//         setRecommendations(simplifiedRecommendations);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRecommendations();
//   }, [inputGenre]); // Re-fetch recommendations when inputGenre changes

//   const handleGenreChange = (e) => {
//     setInputGenre(e.target.value);
//   };

//   const handleSearch = () => {
//     setGenre(inputGenre); // Update genre state to trigger effect
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Spotify Recommendations</h1>

//       {/* Input to type genre */}
//       <div className="mb-4">
//         <label className="mr-4">Enter a genre:</label>
//         <input
//           type="text"
//           className="text-black border rounded-md p-2"
//           value={inputGenre}
//           onChange={handleGenreChange}
//         />
//         <button
//           onClick={handleSearch}
//           className="ml-4 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-200"
//         >
//           Search
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {recommendations.map((rec, index) => (
//           <div
//             key={index}
//             className="bg-gray-600 shadow-md rounded-lg overflow-hidden"
//           >
//             <img
//               src={rec.album_image}
//               alt={rec.track_title}
//               className="w-full h-48 object-cover"
//             />
//             <div className="p-4">
//               <h2 className="text-xl text-white-800 font-semibold mb-2">
//                 {rec.track_title}
//               </h2>
//               <p className="text-white-600">Artist: {rec.artist}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { getGenreRecs } from "../../lib/api";
import { addToPlaylist } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Recs() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genre, setGenre] = useState("pop"); // Default genre to pop
  const [inputGenre, setInputGenre] = useState("pop"); // Genre from input field

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("spotify_access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        const data = await getGenreRecs(token, inputGenre);

        // Simplify recommendations response
        const simplifiedRecommendations = data.tracks.map((track) => ({
          artist: track.artists[0].name,
          track_title: track.name,
          album_image: track.album.images[0]?.url,
          uri: track.uri,
        }));

        setRecommendations(simplifiedRecommendations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [inputGenre]); // Re-fetch recommendations when inputGenre changes

  const handleGenreChange = (e) => {
    setInputGenre(e.target.value);
  };

  const handleSearch = () => {
    setGenre(inputGenre); // Update genre state to trigger effect
  };

  const handleCreatePlaylist = async () => {
    const userId = localStorage.getItem("spotify_user_id");
    if (!userId) {
      alert("User ID not set! Ensure you're authenticated.");
      return;
    }

    const trackUris = recommendations.map((rec) => rec.uri);
    const token = localStorage.getItem("spotify_access_token");

    try {
      const response = await addToPlaylist(token, genre, userId, trackUris);
      alert("Playlist created and tracks added!");
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create playlist.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-4xl font-bold mb-6 text-white">
        Spotify Recommendations
      </h1>
      {/* Input to type genre */}
      <div className="mb-4 flex items-center">
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
      </div>
      {/* Carousel for displaying recommendations */}
      <Carousel className="w-full max-w-2xl">
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
      {/* Button to create playlist */}
      <button
        onClick={handleCreatePlaylist}
        className="mb-6 px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors duration-200"
      >
        Create Playlist from Recommendations
      </button>
    </div>
  );
}
