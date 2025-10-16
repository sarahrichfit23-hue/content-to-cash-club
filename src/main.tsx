console.log("🧪 ENV CHECK:", import.meta.env.VITE_API_URL);
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "react-hot-toast";

const rootElement = document.getElementById("root");
if (!rootElement) {
  const el = document.createElement("div");
  el.id = "root";
  document.body.appendChild(el);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <App />
      <Toaster position="top-center" />
    </UserProvider>
  </React.StrictMode>
);
