import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Sidebar from "./components/Sidebar";
import { authFetch, clearToken, type AuthUser } from "./auth";

type AccountTabKey = "account-settings" | "notifications" | "users" | "billing";

type AccountTab = {
  id: AccountTabKey;
  label: string;
  description: string;
};

type TabbedCard = {
  title: string;
  description: string;
  accentIconLabel: string;
  primaryActionLabel: string;
  onPrimaryAction?: () => void;
  secondaryContent?: string;
};

const accountTabs: AccountTab[] = [
  {
    id: "account-settings",
    label: "Account Settings",
    description: "Manage profile, recordings, and verification preferences.",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Control how your team receives real-time alerts.",
  },
  {
    id: "users",
    label: "Users",
    description: "Add teammates and manage their permissions.",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Review invoices and update payment methods.",
  },
];

export default function Account() {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(
    null
  );
  const [activeTabId, setActiveTabId] =
    useState<AccountTabKey>("account-settings");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const response = await authFetch("/me");
      if (!response.ok) {
        clearToken();
        window.location.href = "/login";
        return;
      }
      const userProfile: AuthUser = await response.json();
      if (isMounted) setAuthenticatedUser(userProfile);
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

  const sidebarBusinessLabel = authenticatedUser?.name ?? "Askaria Customer";

  const activeTab = useMemo(
    () => accountTabs.find((tab) => tab.id === activeTabId),
    [activeTabId]
  );

  if (!activeTab) {
    throw new Error(`Unable to locate the tab definition for ${activeTabId}.`);
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f7fb 0%, #ffffff 55%, #f5efff 100%)",
        color: "#291a47",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar activeItem="account" businessLabel={sidebarBusinessLabel} />
      <main
        style={{
          flex: 1,
          padding: "48px 56px 80px",
          display: "flex",
          flexDirection: "column",
          gap: "36px",
        }}
      >
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
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
                Account
              </span>
              <h1 style={{ margin: 0, fontSize: "34px", color: "#32125b" }}>
                Account settings
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "#7b6f91",
                  maxWidth: "520px",
                }}
              >
                Manage your user account preferences and settings in one place.
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
          </div>
        </header>

        <nav aria-label="Account tabs">
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            {accountTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTabId(tab.id)}
                    aria-pressed={isActive}
                    style={{
                      width: "100%",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      backgroundColor: isActive ? "#3c0f73" : "#ffffff",
                      color: isActive ? "#ffffff" : "#453762",
                      boxShadow: isActive
                        ? "0 16px 32px rgba(60, 15, 115, 0.32)"
                        : "0 4px 12px rgba(48, 18, 84, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      textAlign: "left",
                      transition: "background-color 0.2s ease, color 0.2s ease",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>
                      {tab.label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: isActive ? "rgba(255,255,255,0.82)" : "#75659c",
                        lineHeight: 1.45,
                      }}
                    >
                      {tab.description}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {renderActiveTabContent({
            activeTabId,
            authenticatedUser,
          })}
        </section>
      </main>
    </div>
  );
}

function renderActiveTabContent({
  activeTabId,
  authenticatedUser,
}: {
  activeTabId: AccountTabKey;
  authenticatedUser: AuthUser | null;
}) {
  switch (activeTabId) {
    case "account-settings":
      return <AccountSettingsTab authenticatedUser={authenticatedUser} />;
    case "notifications":
      return <NotificationsTab />;
    case "users":
      return <UsersTab />;
    case "billing":
      return <BillingTab />;
    default:
      return null;
  }
}

function AccountSettingsTab({
  authenticatedUser,
}: {
  authenticatedUser: AuthUser | null;
}) {
  const tabCards: TabbedCard[] = [
    {
      title: "Account",
      description:
        authenticatedUser?.email ??
        "Your primary login email will be used for authentication.",
      accentIconLabel: "AC",
      primaryActionLabel: "Manage",
    },
    {
      title: "Recordings",
      description: "Control the recordings stored in your account.",
      accentIconLabel: "RE",
      primaryActionLabel: "Review recordings",
      secondaryContent: "Clear recording data",
    },
    {
      title: "Verification Codes",
      description:
        "Receive authentication codes via your Askaria phone number.",
      accentIconLabel: "VC",
      primaryActionLabel: "Configure",
      secondaryContent: "Required for certain carriers.",
    },
  ];

  return (
    <article
      style={{
        borderRadius: "28px",
        border: "1px solid #efe3ff",
        backgroundColor: "#ffffff",
        boxShadow: "0 30px 70px rgba(45, 18, 84, 0.12)",
        padding: "36px 40px",
        display: "grid",
        gap: "20px",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "20px", color: "#311a5f" }}>
        Account controls
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {tabCards.map((card) => (
          <div
            key={card.title}
            style={{
              borderRadius: "22px",
              border: "1px solid #f2eafd",
              background:
                "linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(236, 72, 153, 0.12) 100%)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              color: "#3b2b65",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(60, 15, 115, 0.12)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "#3c0f73",
                }}
              >
                {card.accentIconLabel}
              </span>
              <h3 style={{ margin: 0, fontSize: "17px" }}>{card.title}</h3>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.5,
                color: "#5f4e82",
              }}
            >
              {card.description}
            </p>
            {card.secondaryContent ? (
              <span style={{ fontSize: "13px", color: "#7c6d98" }}>
                {card.secondaryContent}
              </span>
            ) : null}
            <button
              type="button"
              style={{
                alignSelf: "flex-start",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                color: "#ffffff",
                fontWeight: 600,
                padding: "10px 22px",
                boxShadow: "0 18px 32px rgba(124, 58, 237, 0.32)",
                cursor: "pointer",
              }}
              onClick={card.onPrimaryAction}
            >
              {card.primaryActionLabel}
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}

function NotificationsTab() {
  return (
    <article
      style={{
        borderRadius: "28px",
        border: "1px solid #efe3ff",
        backgroundColor: "#ffffff",
        boxShadow: "0 24px 60px rgba(48, 18, 84, 0.1)",
        padding: "36px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#301c58" }}>
          Notification preferences
        </h2>
        <p style={{ margin: 0, color: "#74629b" }}>
          Configure SMS and email alerts to stay informed about new calls.
        </p>
      </header>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        {[
          "Email alerts",
          "SMS alerts",
          "Daily summaries",
          "Missed call escalations",
        ].map((notificationLabel) => (
          <div
            key={notificationLabel}
            style={{
              borderRadius: "18px",
              border: "1px solid #f1e9fd",
              padding: "22px",
              backgroundColor: "#faf7ff",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <span style={{ fontWeight: 700, color: "#3d2a66" }}>
              {notificationLabel}
            </span>
            <button
              type="button"
              style={{
                alignSelf: "flex-start",
                borderRadius: "10px",
                border: "1px solid #d7c5ff",
                backgroundColor: "#ffffff",
                color: "#5a189a",
                fontWeight: 600,
                padding: "8px 18px",
                cursor: "pointer",
              }}
            >
              Configure
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}

function UsersTab() {
  return (
    <article
      style={{
        borderRadius: "28px",
        border: "1px solid #efe3ff",
        backgroundColor: "#ffffff",
        boxShadow: "0 24px 60px rgba(48, 18, 84, 0.1)",
        padding: "36px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#301c58" }}>
            Team members
          </h2>
          <p style={{ margin: 0, color: "#74629b" }}>
            Invite new users and manage their access levels.
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
          Invite user
        </button>
      </header>
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #f1e9fd",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            padding: "16px 24px",
            backgroundColor: "#f5efff",
            color: "#3a2562",
            fontWeight: 600,
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
        </div>
        {["Matt Medeiros", "Pat Johnson", "Taylor Rivers"].map(
          (memberName, index) => (
            <div
              key={memberName}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr",
                padding: "18px 24px",
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#faf7ff",
                alignItems: "center",
                color: "#3d2a66",
                fontWeight: 500,
              }}
            >
              <span>{memberName}</span>
              <span>{index === 0 ? "Owner" : "Member"}</span>
              <span style={{ color: index === 0 ? "#16a34a" : "#6b21a8" }}>
                {index === 1 ? "Pending invite" : "Active"}
              </span>
            </div>
          )
        )}
      </div>
    </article>
  );
}

function BillingTab() {
  return (
    <article
      style={{
        borderRadius: "28px",
        border: "1px solid #efe3ff",
        backgroundColor: "#ffffff",
        boxShadow: "0 24px 60px rgba(48, 18, 84, 0.1)",
        padding: "36px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#301c58" }}>
            Billing overview
          </h2>
          <p style={{ margin: 0, color: "#74629b" }}>
            Keep your payment details current to avoid service interruptions.
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
          Update payment method
        </button>
      </header>
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #f1e9fd",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {["Plan", "Next invoice", "Usage"].map((tileLabel, index) => (
          <div
            key={tileLabel}
            style={{
              padding: "24px",
              backgroundColor: index % 2 === 0 ? "#ffffff" : "#faf7ff",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              color: "#3d2a66",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#7b6f91",
                textTransform: "uppercase",
              }}
            >
              {tileLabel}
            </span>
            <span style={{ fontWeight: 700 }}>
              {index === 0
                ? "Growth"
                : index === 1
                ? "Nov 1, 2025"
                : "546 minutes this cycle"}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #f1e9fd",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            padding: "16px 24px",
            backgroundColor: "#f5efff",
            color: "#3a2562",
            fontWeight: 600,
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <span>Description</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {[
          "October 2025 subscription",
          "September 2025 subscription",
          "Add-on minutes",
        ].map((invoiceLabel, index) => (
          <div
            key={invoiceLabel}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              padding: "18px 24px",
              backgroundColor: index % 2 === 0 ? "#ffffff" : "#faf7ff",
              alignItems: "center",
              color: "#3d2a66",
              fontWeight: 500,
            }}
          >
            <span>{invoiceLabel}</span>
            <span>{index === 2 ? "$38.00" : "$249.00"}</span>
            <span style={{ color: index === 0 ? "#f97316" : "#16a34a" }}>
              {index === 0 ? "Pending" : "Paid"}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
