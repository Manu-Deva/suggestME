// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// function MusicIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M9 18V5l12-2v13" />
//       <circle cx="6" cy="18" r="3" />
//       <circle cx="18" cy="16" r="3" />
//     </svg>
//   );
// }

// const loginWithSpotify = () => {
//   const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID; // Spotify Client ID
//   const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI; // Redirect URI registered in Spotify
//   const scopes = "user-read-email user-top-read"; // Scopes your app needs

//   const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
//     scopes
//   )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
//   window.location.href = authURL; // Redirect user to Spotify for authorization
// };

// export default function Home() {
//   const router = useRouter();
//   const [accessToken, setAccessToken] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("spotify_access_token");
//     if (!token) {
//       router.push("/login");
//     } else {
//       setAccessToken(token);
//     }
//   }, []);

//   return (
//     <div className="flex flex-col min-h-[100dvh]">
//       <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
//         <Link href="#" className="flex items-center justify-center">
//           <MusicIcon className="h-6 w-6" />
//           <span className="sr-only">Spotify Integration App</span>
//         </Link>
//         <div className="flex items-center gap-4">
//           <button
//             className="inline-flex h-9 items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
//             onClick={loginWithSpotify}
//           >
//             Login
//           </button>
//         </div>
//       </header>
//       <main className="flex-1">
//         <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-green-400 to-blue-500">
//           <div className="container px-4 md:px-6">
//             <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
//               <img
//                 src="/hero.png"
//                 alt="Hero"
//                 className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
//                 width="550"
//                 height="550"
//               />
//               <div className="flex flex-col justify-center space-y-4">
//                 <div className="space-y-2">
//                   <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
//                     Welcome to the Spotify Integration App
//                   </h1>
//                   <p className="max-w-[600px] text-white md:text-xl">
//                     Discover your music taste, get recommendations, and find
//                     concerts all in one place.
//                   </p>
//                 </div>
//                 {accessToken && (
//                   <div className="flex flex-col gap-4 min-[400px]:flex-row">
//                     <Link
//                       href="/favorites"
//                       className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-green-500 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
//                     >
//                       View Your Top Artists
//                     </Link>
//                     <Link
//                       href="/recs"
//                       className="inline-flex h-10 items-center justify-center rounded-md bg-blue-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
//                     >
//                       Get Recommendations
//                     </Link>
//                     <Link
//                       href="/artist-shows"
//                       className="inline-flex h-10 items-center justify-center rounded-md bg-red-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
//                     >
//                       Find Shows
//                     </Link>
//                   </div>
//                 )}
//               </div>
//               {!accessToken && (
//                 <div className="flex items-center justify-center">
//                   <p className="text-white text-xl">Redirecting to login...</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//       </main>
//       <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
//         <p className="text-xs text-gray-500">
//           &copy; 2024 Spotify Integration App. All rights reserved.
//         </p>
//         <nav className="sm:ml-auto flex gap-4 sm:gap-6">
//           <Link href="#" className="text-xs hover:underline underline-offset-4">
//             Terms of Service
//           </Link>
//           <Link href="#" className="text-xs hover:underline underline-offset-4">
//             Privacy
//           </Link>
//         </nav>
//       </footer>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, getTopData } from "../lib/api";
import Link from "next/link";

function MusicIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [trackData, setTrackData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      router.push("/login");
    } else {
      setAccessToken(token);
      fetchProfileData(token);
    }
  }, []);

  const fetchProfileData = async (token) => {
    const userData = await getProfile(token);
    if (userData) {
      setProfileData(userData);
      localStorage.setItem("spotify_user_id", userData.id);
    }
    const tracks = await getTopData(token);
    setProfileData(userData);
    setTrackData(tracks.items);
    console.log("user tracks:", trackData);
  };

  console.log("user profile:", localStorage.getItem("spotify_user_id")); //This prints the id

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link href="#" className="flex items-center justify-center">
          <MusicIcon className="h-6 w-6" />
          <span className="sr-only">Spotify Integration App</span>
        </Link>
        <div className="flex items-center gap-4">
          {profileData ? (
            <span className="flex flex-row items-center space-x-4 text-sm font-medium">
              <p>{profileData.display_name}</p>
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
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-green-400 to-blue-500">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <img
                src="/hero.png"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                width="550"
                height="550"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
                    Welcome to SuggestMe
                  </h1>
                  <p className="max-w-[600px] text-white md:text-xl">
                    Discover your music taste, get recommendations, and find
                    concerts all in one place.
                  </p>
                </div>
                {profileData && (
                  <div className="flex flex-col bg-white p-4 rounded-lg shadow-md items-center">
                    <h2 className="text-xl text-black font-semibold mb-2">
                      Your Top Tracks
                    </h2>
                    <div className="flex flex-row gap-2 justify-center">
                      {trackData.map((trackItem) => (
                        <div
                          key={trackItem.album.name}
                          className="flex flex-col items-center rounded-sm shadow-sm 
						  transition-all hover:shadow-2xl hover:scale-105 transform
						   hover:bg-gray-200 p-3 bg-white duration-300 ease-in-out w-auto"
                        >
                          <img
                            src={trackItem.album.images[0].url}
                            alt="track"
                            className="w-auto h-auto rounded-full mb-2"
                          />
                          <p className="text-black font-medium text-xs text-center w-full break-words">
                            {trackItem.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {accessToken && (
                  <div className="flex flex-col gap-4 min-[400px]:flex-row">
                    <Link
                      href="/favorites"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-green-500 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                      View Your Top Artists
                    </Link>
                    <Link
                      href="/recs"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-blue-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                      Get Recommendations
                    </Link>
                    <Link
                      href="/artist-shows"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-red-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                      Find Shows
                    </Link>
                  </div>
                )}
              </div>
              {!accessToken && (
                <div className="flex items-center justify-center">
                  <p className="text-white text-xl">Redirecting to login...</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          &copy; 2024 Spotify Integration App. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
