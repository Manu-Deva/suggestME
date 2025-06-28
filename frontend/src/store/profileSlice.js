// src/store/profileSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null, // This will store the user's Spotify profile data
  isAuthenticated: false, // Track whether the user is authenticated
  trackData: [],
  playlists: [], // New field to store playlists
  accessToken: null, // Access token from Spotify
  refreshToken: null, // Refresh token to get new access token
  tokenExpirationTime: null, // Token expiration time
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload; // Set the user's profile data
      state.isAuthenticated = true; // Set authenticated to true
    },

    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.tokenExpirationTime = action.payload.tokenExpirationTime; // Store expiration time
    },
    clearProfile: (state) => {
      state.profile = null; // Clear profile data
      state.isAuthenticated = false; // Set authenticated to false
      state.trackData = []; //
      state.playlists = []; // Clear playlists when profile is cleared
    },
    refreshAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.tokenExpirationTime = action.payload.tokenExpirationTime; // Update expiration
    },
    setTrackData: (state, action) => {
      state.trackData = action.payload; // Add a new action for trackData
    },
    addPlaylist: (state, action) => {
      const { id, image, genre, tracks } = action.payload; // Destructure payload
      state.playlists.push({ id, image, genre, tracks }); // Add a new playlist object
    },
    clearPlaylists: (state) => {
      state.playlists = []; // Clear all playlists
    },
  },
});

export const {
  setProfile,
  clearProfile,
  setTrackData,
  addPlaylist,
  setTokens,
  refreshAccessToken,
} = profileSlice.actions;

export default profileSlice.reducer;
