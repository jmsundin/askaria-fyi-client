import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App";
import Register from "./Register";
import Login from "./Login";
import QuickStart from "./QuickStart";
import QuickStartTest from "./QuickStartTest";
import QuickStartLaunch from "./QuickStartLaunch";
import ProtectedRoute from "./ProtectedRoute";
import Calls from "./Calls";
import Account from "./Account";
import Integrations from "./Integrations";
import AgentSettings from "./AgentSettings";
import { getToken } from "./auth";
import ThemeProvider from "./components/ThemeProvider";
import Resources from "./Resources";

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
    <ThemeProvider>
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
          <Route path="/resources" element={<Resources />} />

          {/* Protected app area */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app/quick-start" element={<QuickStart />} />
            <Route path="/app/quick-start/test" element={<QuickStartTest />} />
            <Route
              path="/app/quick-start/launch"
              element={<QuickStartLaunch />}
            />
            <Route path="/app" element={<Calls />} />
            <Route path="/app/calls" element={<Calls />} />
            <Route path="/app/settings" element={<AgentSettings />} />
            <Route path="/app/account" element={<Account />} />
            <Route path="/app/integrations" element={<Integrations />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
