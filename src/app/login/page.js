"use client";

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID; // Spotify Client ID
const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI; // Redirect URI registered in Spotify
const scopes =
  "user-read-email user-top-read playlist-modify-public playlist-modify-private"; // Scopes your app needs

const loginWithSpotify = () => {
  const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  window.location.href = authURL; // Redirect user to Spotify for authorization
};

export default function Login() {
  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold my-6">Login with Spotify</h1>
      <button
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        onClick={loginWithSpotify}
      >
        Login with Spotify
      </button>
    </div>
  );
}
