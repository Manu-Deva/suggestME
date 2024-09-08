"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { exchangeAuthorizationCode } from "../../lib/api";

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing your Spotify login...");
  const searchParams = useSearchParams();

  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const code = urlParams.get("code");
    const code = searchParams.get("code");
    console.log(code);

    if (code) {
      exchangeAuthorizationCodeFromSpotify(code);
    } else {
      setStatus("Error: No authorization code found");
    }
  }, [searchParams]);

  const exchangeAuthorizationCodeFromSpotify = async (authCode) => {
    try {
      const { access_token, refresh_token, expires_in } =
        await exchangeAuthorizationCode(authCode);

      // Store tokens in localStorage or cookies
      localStorage.setItem("spotify_access_token", access_token);
      localStorage.setItem("spotify_refresh_token", refresh_token);
      localStorage.setItem("spotify_expires_in", expires_in);

      setStatus("Login successful! Redirecting...");
      console.log("access token", access_token);

      // Redirect to the homepage after successful authentication
      //   setTimeout(() => router.push("/favorites"), 1000);
      router.push("/");
    } catch (error) {
      console.error("Error exchanging authorization code:", error);
      setStatus("Error occurred during login. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        {status.includes("Error") && (
          <button
            onClick={() => router.push("/login")}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
