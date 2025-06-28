// src/app/ReduxProvider.js
"use client"; // This file is now a Client Component

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/store"; // Adjust the path as needed

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}{" "}
      </PersistGate>
    </Provider>
  );
}
