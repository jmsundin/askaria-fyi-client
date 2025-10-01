import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Register from "./Register.tsx";
import Login from "./Login.tsx";
import Home from "./Home.tsx";
import QuickStart from "./QuickStart.tsx";
import ProtectedRoute from "./ProtectedRoute";
import Calls from "./Calls.tsx";
import Account from "./Account";
import Integrations from "./Integrations";
import { getToken } from "./auth";

export function RedirectIfAuthenticated() {
  const token = getToken();
  if (token) {
    return <Navigate to="/app" replace />;
  }
  return null;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element with id 'root' not found. The application cannot mount."
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public landing pages */}
        <Route path="/" element={<App />} />
        <Route
          path="/login"
          element={
            <>
              <RedirectIfAuthenticated />
              <Login />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <RedirectIfAuthenticated />
              <Register />
            </>
          }
        />

        {/* Protected app area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app/quick-start" element={<QuickStart />} />
          <Route path="/app" element={<Home />} />
          <Route path="/app/calls" element={<Calls />} />
          <Route path="/app/account" element={<Account />} />
          <Route path="/app/integrations" element={<Integrations />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
