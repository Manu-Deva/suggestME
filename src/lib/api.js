import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Your Lambda function's API Gateway URL

export const exchangeAuthorizationCode = async (authCode) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/spotify/auth`, // API Gateway URL from Serverless deploy
      { code: authCode },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Returns access_token, refresh_token, and expires_in
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    console.log(authCode);
    throw new Error("Failed to exchange authorization code");
  }
};

// src/lib/api.js
// Add this function to your existing api.js file
export const getUserFavorites = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user favorites");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
};

export const getGenreRecs = async (token, genre = "pop") => {
  try {
    const response = await fetch(`${API_BASE_URL}/recs/genres?genre=${genre}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch genre recommendations");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching genre recommendations:", error);
    throw error;
  }
};

export const searchArtist = async (artistName, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/spotify/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        artist_name: artistName,
      },
    });
    return response.data.artistId;
  } catch (error) {
    console.error("Error searching for artist:", error);
    throw new Error("Failed to search for artist");
  }
};

export const getRelatedArtists = async (artistId, token) => {
  try {
    console.log("API recieving artist ID of", artistId);
    const response = await axios.get(
      `${API_BASE_URL}/spotify/related-artists`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          artistId: artistId, // Pass artistId as a query parameter
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting related artists:", error);
    throw new Error("Failed to get related artists");
  }
};

export const getNextShows = async (artistName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ticketmaster/shows`, {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        keyword: artistName,
      },
    });
    return response.data._embedded;
  } catch (error) {
    console.error(
      "Error getting next shows: \n",
      "error: \n",
      error,
      "\n",
      "specific error: \n",
      error.response.data
    );
    throw new Error("Failed to get next shows");
  }
};

export const getProfile = async (token) => {
  try {
    const result = await fetch(`${API_BASE_URL}/spotify/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("api side user profile:", result);

    return await result.json();
  } catch (error) {
    console.error(
      "Error getting data: \n",
      "error: \n",
      error,
      "\n",
      "specific error: \n",
      error.response.data
    );
    throw new Error("Failed to get profile data");
  }
};

export const getTopData = async (token) => {
  try {
    const result = await fetch(`${API_BASE_URL}/spotify/data`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("api side user data:", result);

    return await result.json();
  } catch (error) {
    console.error(
      "Error getting data: \n",
      "error: \n",
      error,
      "\n",
      "specific error: \n",
      error.response.data
    );
    throw new Error("Failed to get profile tracks");
  }
};

export const addToPlaylist = async (token, genre, user_id, urls) => {
  try {
    console.log("API Received token:", token);
    const response = await axios.post(
      `${API_BASE_URL}/spotify/playlist`,
      {
        id: user_id,
        genre: genre,
        urls: urls,
      }, // This is the request body, not params
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data; // Returns snapshot_id
  } catch (error) {
    console.error("Error adding to playlist", error);
    // console.log(authCode);
    throw new Error("Failed to make playlist");
  }
};
