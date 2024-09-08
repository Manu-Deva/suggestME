// "use client";

// import { useState, useEffect } from "react";
// import { searchArtist, getRelatedArtists, getNextShows } from "../../lib/api";

// export default function ArtistShows() {
//   const [artistName, setArtistName] = useState("");
//   const [relatedArtists, setRelatedArtists] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [shows, setShows] = useState([]);

//   useEffect(() => {
//     const fetchShows = async () => {
//       try {
//         const token = localStorage.getItem("spotify_access_token");
//         const aid = await searchArtist(artistName, token);
//         console.log("artistID", aid);
//         const relatedArtistsData = await getRelatedArtists(aid, token);
//         console.log("related data", relatedArtistsData);

//         const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//         const showsPromises = relatedArtistsData.map(async (artist, index) => {
//           await delay(index * 1000); // Wait 1 second * index before each request
//           try {
//             const showData = await getNextShows(artist.name);
//             return {
//               name: artist.name,
//               shows: showData._embedded?.events || [],
//             };
//           } catch (error) {
//             console.error(`Error fetching shows for ${artist.name}:`, error);
//             return {
//               name: artist.name,
//               shows: [],
//             };
//           }
//         });

//         const relatedArtistsShows = await Promise.all(showsPromises);
//         console.log("promise resolved successfully");
//         setRelatedArtists(relatedArtistsData.artists);
//         setShows(relatedArtistsShows);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShows();
//   }, [artistName]);

//   const handleSearchChange = (e) => {
//     setArtistName(e.target.value);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">
//         Upcoming Shows for Related Artists
//       </h1>

//       <div className="mb-4">
//         <label className="mr-4">Search for an artist:</label>
//         <input
//           type="text"
//           className="border rounded-md p-2"
//           value={artistName}
//           onChange={handleSearchChange}
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {shows.map((artistShow) => (
//           <div
//             key={artistShow.name}
//             className="border p-4 rounded-md shadow-md"
//           >
//             <h2 className="text-xl font-semibold mb-2">{artistShow.name}</h2>
//             {artistShow.shows.length > 0 ? (
//               artistShow.shows.map((show) => (
//                 <div key={show.id} className="mb-4">
//                   <h3 className="text-lg font-medium">{show.name}</h3>
//                   <p>Date: {show.dates?.start?.localDate}</p>
//                   <a
//                     href={show.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                   >
//                     Buy Tickets
//                   </a>
//                   {show.images.length > 0 && (
//                     <img
//                       src={show.images[0].url}
//                       alt={show.name}
//                       className="mt-2 rounded-md"
//                     />
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p>No upcoming shows</p>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

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

      const limitedArtists = relatedArtistsData.slice(0, 5); // Limit to 5 artists to reduce API calls

      const showsPromises = relatedArtistsData.map(async (artist, index) => {
        await delay(index * 250); // Wait 1 second * index before each request
        try {
          const showData = await getNextShows(artist.name);
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
        .then((relatedArtistsShows) => {
          console.log("All promises resolved successfully");
          console.log("Related Artists Shows:", relatedArtistsShows);
          setRelatedArtists(relatedArtistsData.artists);
          setShows(relatedArtistsShows);
          return relatedArtistsShows;
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
    } finally {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center font-sans">
        Upcoming Shows for Related Artists
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
          className="ml-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors font-sans"
          disabled={loading}
        >
          Search
        </button>
      </form>

      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">Error: {error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shows.map((artistShow) => (
          <div
            key={artistShow.name}
            className="border border-gray-200 rounded-lg shadow-lg transition-all hover:shadow-2xl hover:scale-105 transform hover:bg-gray-800 p-3 bg-black duration-300 ease-in-out"
          >
            <h2 className="text-2xl font-bold mb-2 font-sans text-white-900 hover:text-blue-600 transition-colors duration-300">
              {artistShow.name}
            </h2>
            {artistShow.eventData.length > 0 ? (
              artistShow.eventData.map((show) => (
                <div key={show.id} className="mb-4">
                  <h3 className="text-md font-semibold text-white-800 font-sans">
                    {show.name}
                  </h3>
                  <p className="text-sm text-white-600 font-sans">
                    {convertTo12Hour(show.dates?.start?.localTime)},{" "}
                    {formatDate(show.dates?.start?.localDate)}
                  </p>
                  {show._embedded && show._embedded.venues.length > 0 && (
                    <p className="text-sm text-white-600 font-sans">
                      {show._embedded.venues[0].name} -{" "}
                      {show._embedded.venues[0].city
                        ? show._embedded.venues[0].city.name
                        : " "}
                      ,{" "}
                      {show._embedded.venues[0].state
                        ? show._embedded.venues[0].state.name
                        : ""}
                    </p>
                  )}
                  <a
                    href={show.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-500 font-medium text-xs hover:underline"
                  >
                    Buy Tickets
                  </a>
                  {show.images.length > 0 && (
                    <img
                      src={show.images[0].url}
                      alt={show.name}
                      className="mt-2 w-full h-32 object-cover rounded-md"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No upcoming shows</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
