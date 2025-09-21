import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Register from "./Register.tsx";
import Login from "./Login.tsx";
import Home from "./Home.tsx";
import ProtectedRoute from "./ProtectedRoute";
import { getToken } from "./auth";

const rootElement = document.getElementById("root")!;

function RedirectIfAuthenticated() {
  const token = getToken();
  if (token) {
    return <Navigate to="/app" replace />;
  }
  return null;
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
          <Route path="/app" element={<Home />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
