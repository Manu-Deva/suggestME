"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  refreshAccessToken,
  setTokens,
  clearProfile,
} from "../../store/profileSlice";
import { exchangeAuthorizationCode } from "../../lib/api";

export default function Callback() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("Processing your Spotify login...");
  const searchParams = useSearchParams();

  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const code = urlParams.get("code");
    dispatch(clearProfile());
    const code = searchParams.get("code");
    console.log("authorization code: ", code);

    if (code) {
      exchangeAuthorizationCodeFromSpotify(code);
    } else {
      setStatus("Error: No authorization code found");
      console.log("Error: No authorization code found");
    }
  }, [searchParams]);

  const exchangeAuthorizationCodeFromSpotify = async (authCode) => {
    try {
      const { access_token, refresh_token, expires_in } =
        await exchangeAuthorizationCode(authCode);

      dispatch(
        refreshAccessToken({
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpirationTime: expires_in,
        })
      );

      setStatus("Login successful! Redirecting...");
      console.log("access token", access_token);

      // Redirect to the homepage after successful authentication
      //   setTimeout(() => router.push("/favorites"), 1000);
      router.push("/get-started");
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
