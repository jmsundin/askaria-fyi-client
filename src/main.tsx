import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Register from "./Register.tsx";
import Login from "./Login.tsx";
import Home from "./Home.tsx";
import { getToken } from "./auth";

const rootElement = document.getElementById("root")!;

function getViewByPathname(pathname: string) {
  const APP_ORIGIN =
    (import.meta.env.VITE_APP_ORIGIN as string | undefined) ||
    window.location.origin;
  const LANDING_ORIGIN =
    (import.meta.env.VITE_LANDING_ORIGIN as string | undefined) ||
    window.location.origin;

  const isOnAppOrigin = window.location.origin === APP_ORIGIN;

  if (isOnAppOrigin) {
    // App subdomain: require auth and show Home
    const token = getToken();
    if (!token) {
      // Redirect unauthenticated users to landing login
      window.location.replace(`${LANDING_ORIGIN}/login`);
      return null;
    }
    return <Home />;
  }

  // Landing domain: show static pages and send authenticated users to app
  if (pathname === "/login") return <Login />;
  if (pathname === "/register") return <Register />;
  const token = getToken();
  if (token && APP_ORIGIN !== window.location.origin) {
    window.location.replace(`${APP_ORIGIN}/`);
    return null;
  }
  return <App />;
}

createRoot(rootElement).render(
  <StrictMode>{getViewByPathname(window.location.pathname)}</StrictMode>
);
