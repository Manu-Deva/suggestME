// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Default is localStorage
import profileReducer from "./profileSlice"; // Import your profile slice

const persistConfig = {
  key: "root",
  storage,
  // Optionally add more config here if needed (e.g., whitelist, blacklist)
};

const persistedReducer = persistReducer(persistConfig, profileReducer);

export const store = configureStore({
  reducer: {
    profile: persistedReducer,
    // Add other reducers if you have more
  },
  devTools: true,
  middleware: () => [],
});

export const persistor = persistStore(store);
