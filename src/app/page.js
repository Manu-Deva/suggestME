"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, getTopData } from "../lib/api";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Music, Headphones, Radio, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

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

// Login logic for Spotify
const loginWithSpotify = () => {
  const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  window.location.href = authURL; // Redirect user to Spotify for authorization
};

export default function Home() {
  const profileData = useSelector((state) => state.profile.profile); // Access the profile data
  const isAuthenticated = useSelector((state) => state.profile.isAuthenticated);
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  //   const [profileData, setProfileData] = useState(null);
  const [trackData, setTrackData] = useState([]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link href="#" className="flex items-center justify-center">
          <MusicIcon className="h-6 w-6" />
          <span className="sr-only">SuggestMe</span>
        </Link>
        <h1 className=" font-semibold tracking-tighter text-white">
          SuggestMe
        </h1>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <span className="flex flex-row items-center space-x-4 text-sm font-medium">
              <img
                src={profileData.images?.[0]?.url || "/default-profile.png"} // Fallback for missing image
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            </span>
          ) : (
            <></>
          )}
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-green-400 to-blue-500">
          <div className="container px-4 md:px-6 max-w-full">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-stretch">
              <div className="flex lg:order-last justify-center basis-1/2">
                <Image
                  src="/hero.png"
                  alt="Hero"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last lg:aspect-auto"
                  width={500}
                  height={500}
                />
              </div>
              <div className="flex flex-col justify-center space-y-4 basis-1/2">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
                    Welcome to SuggestMe
                  </h1>
                  <p className="max-w-[600px] text-white md:text-xl">
                    Discover your music taste, get recommendations, and find
                    concerts all in one place.
                  </p>
                </div>
                <div className="grid grid-flow-col auto-cols-max gap-2 min-[400px]:grid-row">
                  <Link
                    href="/get-started"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-base font-medium text-black shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/learn-more"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-base font-medium text-black shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              {/* {!isAuthenticated && (
                <div className="flex items-center justify-center">
                  <p className="text-white text-xl">Redirecting to login...</p>
                </div>
              )} */}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6 max-w-full">
            <h2 className="text-3xl text-black font-bold tracking-tighter sm:text-5xl text-center mb-12">
              How It Works
            </h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Headphones className="h-12 w-12 text-primary" />
                <h3 className="text-xl text-black font-bold">Listen</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Connect your favorite music streaming services and start
                  listening.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Radio className="h-12 w-12 text-primary" />
                <h3 className="text-xl text-black font-bold">Analyze</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our AI analyzes your listening habits and preferences in
                  real-time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Mic2 className="h-12 w-12 text-primary" />
                <h3 className="text-xl text-black font-bold">Discover</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Receive personalized recommendations tailored to your unique
                  taste.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-full">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Start Your Musical Journey
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join thousands of music lovers who have discovered their new
                  favorite songs with MusicMatcher.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit">Sign Up</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign up to get notified when we launch.{" "}
                  <Link className="underline underline-offset-2" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
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
