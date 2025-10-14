import { useCallback, useEffect, useState } from "react";
import { authFetch, clearToken, type AuthUser } from "./auth";
import Sidebar from "./components/Sidebar";

type SettingsTab = {
  label: string;
  isActive?: boolean;
  status?: "beta";
};

type TrainingSource = {
  label: string;
  value: string;
};

type BusinessDetail = {
  label: string;
  value: string | string[];
};

const settingsTabs: SettingsTab[] = [
  { label: "Business Information", isActive: true },
  { label: "Agent Profile" },
  { label: "Greeting" },
  { label: "Take a Message" },
  { label: "Appointments", status: "beta" },
  { label: "Spam Filters", status: "beta" },
  { label: "FAQs" },
  { label: "Training Files", status: "beta" },
];

const trainingSources: TrainingSource[] = [
  { label: "Google Business Profile", value: "Sunday's Off Pool Company" },
  { label: "Business Website", value: "https://www.sundaysoffpools.com/" },
];

const businessDetails: BusinessDetail[] = [
  { label: "Name", value: "Sunday's Off Pool Company" },
  {
    label: "Address",
    value: [
      "4948 Highway 169 North, New Hope, 55428, Minnesota",
      "10908 S Shore Dr, Plymouth, 55441, Minnesota",
    ],
  },
  {
    label: "Business Overview",
    value:
      "Finest pool service in the Twin Cities, offering consulting, design, and repair of swimming pools.",
  },
];

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isComponentMounted = true;
    (async () => {
      const response = await authFetch("/me");
      if (!response.ok) {
        clearToken();
        window.location.href = "/login";
        return;
      }
      const authenticatedUser: AuthUser = await response.json();
      if (isComponentMounted) setUser(authenticatedUser);
    })();
    return () => {
      isComponentMounted = false;
    };
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    window.location.href = "/login";
  }, []);

  const sidebarBusinessLabel = user?.name ?? "Sunday's Off Pool Company";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--app-background-gradient)",
        color: "var(--text-primary)",
        fontFamily: "inherit",
      }}
    >
      <Sidebar
        activeItem="settings"
        businessLabel={sidebarBusinessLabel}
        onLogout={handleLogout}
      />
      <main
        style={{
          flex: 1,
          padding: "48px 56px 80px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <section
          id="settings"
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  color: "var(--text-heading)",
                }}
              >
                Business Information
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  maxWidth: "520px",
                }}
              >
                This business information gives Aria the context to handle your
                calls.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                type="button"
                style={{
                  borderRadius: "999px",
                  border: "none",
                  background: "var(--brand-gradient)",
                  color: "var(--text-inverse)",
                  fontWeight: 700,
                  padding: "12px 28px",
                  boxShadow: "var(--shadow-elevated-strong)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                Publish
                <span aria-hidden="true">➜</span>
              </button>
            </div>
          </header>

          <nav aria-label="Settings tabs">
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              {settingsTabs.map((tab) => {
                const isActive = Boolean(tab.isActive);
                return (
                  <li key={tab.label} style={{ display: "flex" }}>
                    <a
                      href="#settings"
                      aria-current={isActive ? "page" : undefined}
                      style={{
                        flex: 1,
                        borderRadius: "14px",
                        border: `1px solid ${
                          isActive
                            ? "var(--border-strong)"
                            : "var(--border-subtle)"
                        }`,
                        backgroundColor: isActive
                          ? "var(--surface-highlight)"
                          : "var(--surface-elevated)",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: isActive
                          ? "var(--brand-primary-strong)"
                          : "var(--text-secondary)",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {tab.label}
                      {tab.status === "beta" ? (
                        <span
                          style={{
                            borderRadius: "999px",
                            backgroundColor: "var(--status-negative-surface)",
                            color: "var(--text-inverse)",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "4px 10px",
                            textTransform: "uppercase",
                          }}
                        >
                          Beta
                        </span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <article
            style={{
              borderRadius: "24px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--surface-elevated)",
              boxShadow: "var(--shadow-card-subtle)",
              padding: "32px 36px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <header
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "var(--card-gradient-strong)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-inverse)",
                  fontWeight: 700,
                }}
              >
                TS
              </span>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color: "var(--text-heading)",
                  }}
                >
                  Training Sources
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  These sources help Aria understand your business before
                  answering calls.
                </p>
              </div>
            </header>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "18px",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
              }}
            >
              {trainingSources.map((source, index) => (
                <div
                  key={source.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr",
                    gap: "24px",
                    padding: "20px 24px",
                    backgroundColor:
                      index % 2 === 0
                        ? "var(--surface-elevated)"
                        : "var(--surface-muted)",
                  }}
                >
                  <span
                    style={{ fontWeight: 600, color: "var(--text-secondary)" }}
                  >
                    {source.label}
                  </span>
                  <span
                    style={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    {source.value}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                style={{
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--brand-primary)",
                  fontWeight: 600,
                  padding: "10px 22px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            </div>
          </article>

          <article
            style={{
              borderRadius: "24px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--surface-elevated)",
              boxShadow: "var(--shadow-card-subtle)",
              padding: "32px 36px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <header
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "var(--card-gradient-strong)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-inverse)",
                  fontWeight: 700,
                }}
              >
                BD
              </span>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color: "var(--text-heading)",
                  }}
                >
                  Business Details
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  Keep this information current so Aria can represent your
                  company accurately.
                </p>
              </div>
            </header>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "18px",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
              }}
            >
              {businessDetails.map((detail, index) => (
                <div
                  key={detail.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr",
                    gap: "24px",
                    padding: "20px 24px",
                    backgroundColor:
                      index % 2 === 0
                        ? "var(--surface-elevated)"
                        : "var(--surface-muted)",
                  }}
                >
                  <span
                    style={{ fontWeight: 600, color: "var(--text-secondary)" }}
                  >
                    {detail.label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {Array.isArray(detail.value) ? (
                      detail.value.map((line) => <span key={line}>{line}</span>)
                    ) : (
                      <span>{detail.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                style={{
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--brand-primary)",
                  fontWeight: 600,
                  padding: "10px 22px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
