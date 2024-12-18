import axios from "axios";
import { useDispatch } from "react-redux";
import { refreshAccessToken } from "../../store/profileSlice";

// Helper function to refresh token
export const refreshToken = async (dispatch, refreshToken) => {
  try {
    const response = await axios.post("/api/spotify/refresh-token", {
      refreshToken,
    });

    const { accessToken, expiresIn } = response.data;
    const newExpirationTime = Date.now() + expiresIn * 1000;

    // Dispatch the new token and expiration time to Redux
    dispatch(
      refreshAccessToken({
        accessToken: accessToken,
        tokenExpirationTime: newExpirationTime,
      })
    );

    return accessToken;
  } catch (error) {
    console.error("Error refreshing token", error);
    throw error;
  }
};

// Function to start the proactive refresh timer
export const startProactiveTokenRefresh = (
  dispatch,
  tokenExpirationTime,
  refreshToken
) => {
  const timeUntilExpiration = tokenExpirationTime - Date.now();

  if (timeUntilExpiration > 5 * 60 * 1000) {
    // Set a timeout to refresh the token 5 minutes before expiration
    setTimeout(async () => {
      await refreshToken(dispatch, refreshToken);
    }, timeUntilExpiration - 5 * 60 * 1000); // Subtract 5 minutes
  }
};
