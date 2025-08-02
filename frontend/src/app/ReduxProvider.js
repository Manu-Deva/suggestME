// src/app/ReduxProvider.js
"use client"; // This file is now a Client Component

import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/store"; // Adjust the path as needed
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { startProactiveTokenRefresh, refreshToken } from "../lib/refreshToken";
import { clearProfile } from "../store/profileSlice";

function GlobalAuthHandler({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const accessToken = useSelector((state) => state.profile.accessToken);
  const refreshTok = useSelector((state) => state.profile.refreshToken);
  const tokenExpirationTime = useSelector((state) => state.profile.tokenExpirationTime);

  // Proactive token refresh
  useEffect(() => {
    if (accessToken && refreshTok && tokenExpirationTime) {
      startProactiveTokenRefresh(dispatch, tokenExpirationTime, refreshTok);
    }
  }, [accessToken, refreshTok, tokenExpirationTime, dispatch]);

  // Global API error handler (monkey-patch fetch and axios)
  useEffect(() => {
    // Patch fetch
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await origFetch(...args);
      if (response.status === 401 || response.status === 403) {
        dispatch(clearProfile());
        localStorage.clear();
        router.push("/login");
      }
      return response;
    };
    // Patch axios
    let axios;
    try {
      axios = require("axios");
      if (axios && axios.interceptors && axios.interceptors.response) {
        axios.interceptors.response.use(
          (response) => response,
          (error) => {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              dispatch(clearProfile());
              localStorage.clear();
              router.push("/login");
            }
            return Promise.reject(error);
          }
        );
      }
    } catch (e) {}
    return () => {
      window.fetch = origFetch;
    };
  }, [dispatch, router]);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GlobalAuthHandler>{children} </GlobalAuthHandler>
      </PersistGate>
    </Provider>
  );
}
