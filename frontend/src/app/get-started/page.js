"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import {
  setProfile,
  setTrackData,
  clearProfile,
} from "../../store/profileSlice";
import { getProfile, getTopData } from "../../lib/api"; // Your function to fetch Spotify profile
import { useRouter } from "next/navigation";

// Spotify credentials
const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID; // Spotify Client ID
const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI; // Redirect URI registered in Spotify
const scopes =
  "user-read-email user-top-read playlist-modify-public playlist-modify-private"; // Scopes your app needs

// Login logic for Spotify
const loginWithSpotify = () => {
  const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  window.location.href = authURL; // Redirect user to Spotify for authorization
};

export default function GetStartedPage() {
  const dispatch = useDispatch(); // Initialize the Redux dispatch function
  const isAuthenticated = useSelector((state) => state.profile.isAuthenticated); // Access the auth status
  const profileData = useSelector((state) => state.profile.profile); // Access the profile data
  const trackData = useSelector((state) => state.profile.trackData); // Access the profile data
  const token = useSelector((state) => state.profile.accessToken);
  const router = useRouter();
  console.log("Authenticated", isAuthenticated);
  console.log("Profile data", profileData);
  console.log("tracks", trackData);

  // Check for Spotify auth code in URL and fetch profile data
  useEffect(() => {
    // const token = localStorage.getItem("spotify_access_token");
    if (token) {
      fetchProfileData(token);
    } else {
    }
  }, []);

  // Fetch user's profile data from Spotify API
  const fetchProfileData = async (token) => {
    try {
      const userData = await getProfile(token);
      console.log("Fetched userData:", userData); // Log userData to verify
      dispatch(setProfile(userData)); // Dispatch profile data
      const tracks = await getTopData(token);
      console.log("Fetched tracks:", tracks.items); // Log tracks to verify
      dispatch(setTrackData(tracks.items)); // Dispatch track data
    } catch (error) {
      console.error("Error fetching profile data:", error); // Log any errors
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!token || !profileData) {
      dispatch(clearProfile());
      localStorage.clear();
      router.push("/login");
    }
  }, [token, profileData, dispatch, router]);

  if (!token || !profileData || !profileData.display_name) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link className="flex items-center justify-center" href="/">
          <Music className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">SuggestMe</span>
        </Link>
        <div className="flex items-center gap-4">
          {
            profileData ? (
              <span className="flex flex-row items-center space-x-4 text-sm font-medium">
                {/* <p>Welcome back, {profileData.display_name}!</p> */}
                <img
                  src={profileData.images?.[0]?.url || "/default-profile.png"} // Fallback for missing image
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              </span>
            ) : (
              <></>
            )
            //   (
            //     <Button onClick={loginWithSpotify} className="w-full">
            //       Login with Spotify
            //     </Button>
            //   )
          }
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {profileData
                    ? `Welcome back, ${profileData.display_name}!`
                    : "Get Started with SuggestMe"}
                </h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  {profileData
                    ? "We are glad to see you again. Access your dashboard to explore new music."
                    : "Let's set up your account and start discovering amazing music tailored just for you."}
                </p>
              </div>
              {profileData ? (
                <Link href="/dashboard">
                  <Button className="w-full">Go to Your Dashboard</Button>
                </Link>
              ) : (
                <Button
                  onClick={loginWithSpotify}
                  className="w-auto bg-white text-black"
                >
                  Login with Spotify
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2023 MusicMatcher. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
