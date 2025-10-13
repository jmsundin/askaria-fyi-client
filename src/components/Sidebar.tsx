import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./Sidebar.css";

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
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            AskAria
          </Link>
          <ThemeToggle />
        </div>
        <span className="sidebar-business-label">{businessLabel}</span>
        <nav aria-label="Sidebar navigation">
          <ul className="sidebar-list">
            {sidebarNavigationItems.map((navigationItem) => {
              const isActive = navigationItem.key === activeItem;
              const className = isActive
                ? "sidebar-link active"
                : "sidebar-link";

              if (navigationItem.path) {
                return (
                  <li key={navigationItem.key}>
                    <Link
                      to={navigationItem.path}
                      aria-current={isActive ? "page" : undefined}
                      className={className}
                    >
                      {navigationItem.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={navigationItem.key}>
                  <span className={`${className} disabled`}>
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
