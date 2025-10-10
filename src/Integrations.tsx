import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Sidebar from "./components/Sidebar";
import { authFetch, clearToken, type AuthUser } from "./auth";

type IntegrationCategory = "telephony" | "crm" | "calendar" | "automation";

type IntegrationCard = {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  actionLabel: string;
  accentLabel: string;
};

type ConnectedIntegration = {
  id: string;
  name: string;
  statusLabel: string;
  lastSyncedLabel: string;
  usageSummary: string;
};

const availableIntegrations: IntegrationCard[] = [
  {
    id: "twilio",
    name: "Twilio Voice",
    description:
      "Bring your existing numbers and route calls through AskAria instantly.",
    category: "telephony",
    actionLabel: "Connect",
    accentLabel: "TV",
  },
  {
    id: "ringcentral",
    name: "RingCentral",
    description:
      "Forward RingCentral calls into AskAria without changing workflows.",
    category: "telephony",
    actionLabel: "Connect",
    accentLabel: "RC",
  },
  {
    id: "zapier",
    name: "Zapier",
    description:
      "Trigger automations when new calls, leads, or follow-ups are captured.",
    category: "automation",
    actionLabel: "Create Zap",
    accentLabel: "ZA",
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description:
      "Auto-enrich contacts, log calls, and sync caller notes to your CRM.",
    category: "crm",
    actionLabel: "Connect",
    accentLabel: "HS",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description:
      "Offer callers live availability and book appointments in real time.",
    category: "calendar",
    actionLabel: "Authorize",
    accentLabel: "GC",
  },
  {
    id: "outlook-calendar",
    name: "Outlook Calendar",
    description:
      "Surface service windows and prevent double-booking across your team.",
    category: "calendar",
    actionLabel: "Authorize",
    accentLabel: "OC",
  },
];

const connectedIntegrations: ConnectedIntegration[] = [
  {
    id: "aircall",
    name: "Aircall",
    statusLabel: "Active",
    lastSyncedLabel: "Synced 5 minutes ago",
    usageSummary: "Forwarding 92% of inbound calls to AskAria",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    statusLabel: "Active",
    lastSyncedLabel: "Synced 14 minutes ago",
    usageSummary: "178 call notes logged this week",
  },
];

export default function Integrations() {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const response = await authFetch("/me");
      if (!response.ok) {
        clearToken();
        window.location.href = "/login";
        return;
      }
      const authenticatedProfile: AuthUser = await response.json();
      if (isMounted) setAuthenticatedUser(authenticatedProfile);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    clearToken();
    window.location.href = "/login";
  }

  const sidebarBusinessLabel = authenticatedUser?.name ?? "AskAria Customer";

  const integrationsByCategory = useMemo(() => {
    return availableIntegrations.reduce<
      Record<IntegrationCategory, IntegrationCard[]>
    >(
      (grouped, integration) => {
        grouped[integration.category] = [
          ...(grouped[integration.category] ?? []),
          integration,
        ];
        return grouped;
      },
      { telephony: [], crm: [], calendar: [], automation: [] }
    );
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f6f7fb 0%, #ffffff 55%, #f4efff 100%)",
        color: "#291c47",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar activeItem="integrations" businessLabel={sidebarBusinessLabel} />
      <main
        style={{
          flex: 1,
          padding: "48px 56px 80px",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                alignSelf: "flex-start",
                borderRadius: "999px",
                padding: "6px 16px",
                backgroundColor: "rgba(124, 58, 237, 0.12)",
                color: "#5a189a",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Integrations
            </span>
            <h1 style={{ margin: 0, fontSize: "34px", color: "#32135c" }}>
              Connect your tools
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                color: "#7b6f91",
                maxWidth: "540px",
              }}
            >
              Link AskAria with phone systems, CRMs, and automations so callers
              instantly sync with the systems your team already uses.
            </p>
          </div>
          <a
            href="#logout"
            onClick={handleLogout}
            style={{
              fontWeight: 600,
              color: "#5a189a",
              textDecoration: "none",
              marginTop: "6px",
            }}
          >
            Log out
          </a>
        </header>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <header
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            <h2 style={{ margin: 0, fontSize: "20px", color: "#32135c" }}>
              Available integrations
            </h2>
            <p style={{ margin: 0, color: "#75659a" }}>
              Choose a category to connect new services.
            </p>
          </header>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {Object.entries(integrationsByCategory).map(
              ([category, integrations]) => (
                <div
                  key={category}
                  style={{
                    borderRadius: "26px",
                    border: "1px solid #efe5ff",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 26px 60px rgba(48, 18, 84, 0.12)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <header
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#7c6f92",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        {formatCategoryLabel(category as IntegrationCategory)}
                      </span>
                      <strong style={{ color: "#311b63", fontSize: "16px" }}>
                        {integrations.length} options
                      </strong>
                    </div>
                    <span
                      aria-hidden="true"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "14px",
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(236,72,153,0.18))",
                        color: "#3c0f73",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {category.substring(0, 2).toUpperCase()}
                    </span>
                  </header>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {integrations.map((integration) => (
                      <div
                        key={integration.id}
                        style={{
                          borderRadius: "20px",
                          border: "1px solid #f2eafd",
                          backgroundColor: "#faf8ff",
                          padding: "18px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "10px",
                              backgroundColor: "rgba(60, 15, 115, 0.12)",
                              color: "#3c0f73",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "12px",
                            }}
                          >
                            {integration.accentLabel}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            <strong style={{ color: "#311b63" }}>
                              {integration.name}
                            </strong>
                            <span
                              style={{ fontSize: "13px", color: "#6a5a8d" }}
                            >
                              {integration.description}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          style={{
                            alignSelf: "flex-start",
                            borderRadius: "10px",
                            border: "1px solid #d6c4ff",
                            backgroundColor: "#ffffff",
                            color: "#5a189a",
                            fontWeight: 600,
                            padding: "8px 18px",
                            cursor: "pointer",
                          }}
                        >
                          {integration.actionLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <h2 style={{ margin: 0, fontSize: "20px", color: "#32135c" }}>
                Connected services
              </h2>
              <p style={{ margin: 0, color: "#75659a" }}>
                Manage sync health and usage for active integrations.
              </p>
            </div>
            <button
              type="button"
              style={{
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                color: "#ffffff",
                fontWeight: 600,
                padding: "12px 26px",
                boxShadow: "0 18px 40px rgba(124, 58, 237, 0.32)",
                cursor: "pointer",
              }}
            >
              Add connection
            </button>
          </header>
          <div
            style={{
              borderRadius: "26px",
              border: "1px solid #efe5ff",
              backgroundColor: "#ffffff",
              boxShadow: "0 28px 60px rgba(48, 18, 84, 0.12)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                padding: "18px 28px",
                backgroundColor: "#f5efff",
                color: "#3a2562",
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <span>Integration</span>
              <span>Status</span>
              <span>Usage</span>
            </div>
            {connectedIntegrations.map((integration, index) => (
              <div
                key={integration.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "20px 28px",
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#faf7ff",
                  alignItems: "center",
                  color: "#3d2a66",
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <strong>{integration.name}</strong>
                  <span style={{ fontSize: "13px", color: "#7c6f92" }}>
                    {integration.lastSyncedLabel}
                  </span>
                </div>
                <span style={{ color: "#16a34a" }}>
                  {integration.statusLabel}
                </span>
                <span style={{ fontSize: "13px", color: "#5f4e82" }}>
                  {integration.usageSummary}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function formatCategoryLabel(category: IntegrationCategory) {
  switch (category) {
    case "telephony":
      return "Telephony";
    case "crm":
      return "CRM";
    case "calendar":
      return "Calendar";
    case "automation":
      return "Automation";
    default:
      return category;
  }
}
