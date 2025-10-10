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
  { key: "calls", label: "Calls", abbreviation: "CA", path: "/app/calls" },
  {
    key: "settings",
    label: "Agent Settings",
    abbreviation: "AS",
    path: "/app/settings",
  },
  {
    key: "integrations",
    label: "Integrations",
    abbreviation: "IN",
    path: "/app/integrations",
  },
  {
    key: "account",
    label: "Account",
    abbreviation: "AC",
    path: "/app/account",
  },
  {
    key: "quick-start",
    label: "Quick Start Guide",
    abbreviation: "QS",
    path: "/app/quick-start",
  },
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
            justifyContent: "space-between",
            marginBottom: "8px",
            gap: "16px",
          }}
        >
          <Link to="/" style={{ display: "inline-flex" }}>
            <span>AskAria</span>
          </Link>
          <span style={{ fontSize: "14px", color: "#7c6f92" }}>
            {businessLabel}
          </span>
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

              if (navigationItem.path) {
                return (
                  <li key={navigationItem.key}>
                    <Link
                      to={navigationItem.path}
                      aria-current={isActive ? "page" : undefined}
                      style={commonStyles}
                    >
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
