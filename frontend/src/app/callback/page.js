"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  refreshAccessToken,
  setTokens,
  clearProfile,
} from "../../store/profileSlice";
import { exchangeAuthorizationCode, getProfile } from "../../lib/api";

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

      // Fetch and set user profile
      try {
        const userProfile = await getProfile(access_token);
        if (!userProfile || !userProfile.display_name) {
          throw new Error("Invalid profile data");
        }
        dispatch({ type: "profile/setProfile", payload: userProfile });
        setStatus("Login successful! Redirecting...");
        router.push("/get-started");
      } catch (profileError) {
        console.error("Error fetching profile after login:", profileError);
        dispatch(clearProfile());
        localStorage.clear();
        setStatus("Error occurred during login. Please try again.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error exchanging authorization code:", error);
      dispatch(clearProfile());
      localStorage.clear();
      setStatus("Error occurred during login. Please try again.");
      router.push("/login");
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
