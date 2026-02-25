import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";

// Get your Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// For development, you can use a fallback message if the env var is missing
if (!GOOGLE_CLIENT_ID) {
  console.warn(
    "⚠️ VITE_GOOGLE_CLIENT_ID is not set. Google login will not work. " +
      "Add it to your .env file: VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com",
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
