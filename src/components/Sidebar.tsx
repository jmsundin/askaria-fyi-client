import { Link } from "react-router-dom";

type SidebarItemKey =
  | "quick-start"
  | "calls"
  | "settings"
  | "integrations"
  | "account";

type SidebarNavigationItem = {
  key: SidebarItemKey;
  label: string;
  abbreviation: string;
  path?: string;
};

type SidebarProps = {
  activeItem: SidebarItemKey;
  businessLabel: string;
};

const sidebarNavigationItems: SidebarNavigationItem[] = [
  {
    key: "quick-start",
    label: "Quick Start Guide",
    abbreviation: "QS",
    path: "/app/quick-start",
  },
  { key: "calls", label: "Calls", abbreviation: "CA", path: "/app/calls" },
  {
    key: "settings",
    label: "Agent Settings",
    abbreviation: "AS",
    path: "/app",
  },
  { key: "integrations", label: "Integrations", abbreviation: "IN" },
  { key: "account", label: "Account", abbreviation: "AC" },
];

export default function Sidebar({ activeItem, businessLabel }: SidebarProps) {
  return (
    <aside
      style={{
        width: "280px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #ece3ff",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            A
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "22px", fontWeight: 700 }}>Aria</span>
            <span style={{ fontSize: "14px", color: "#7c6f92" }}>
              {businessLabel}
            </span>
          </div>
        </div>
        <nav aria-label="Sidebar navigation">
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {sidebarNavigationItems.map((navigationItem) => {
              const isActive = navigationItem.key === activeItem;
              const commonStyles = {
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "12px",
                textDecoration: "none",
                color: isActive ? "#ffffff" : "#4a3d64",
                fontWeight: 600,
                backgroundColor: isActive ? "#3c0f73" : "transparent",
                boxShadow: isActive
                  ? "0 10px 20px rgba(60, 15, 115, 0.25)"
                  : "none",
                transition: "background-color 0.2s ease, color 0.2s ease",
              } as const;

              const abbreviationBadge = (
                <span
                  aria-hidden="true"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.15)"
                      : "#f3e8ff",
                    color: isActive ? "#ffffff" : "#5a189a",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {navigationItem.abbreviation}
                </span>
              );

              if (navigationItem.path) {
                return (
                  <li key={navigationItem.key}>
                    <Link
                      to={navigationItem.path}
                      aria-current={isActive ? "page" : undefined}
                      style={commonStyles}
                    >
                      {abbreviationBadge}
                      {navigationItem.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={navigationItem.key}>
                  <span
                    style={{
                      ...commonStyles,
                      cursor: "not-allowed",
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {abbreviationBadge}
                    {navigationItem.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export type { SidebarItemKey };
