import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TbMenu2, TbX } from "react-icons/tb";
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
  onLogout?: () => void;
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

export default function Sidebar({
  activeItem,
  businessLabel,
  onLogout,
}: SidebarProps) {
  const defaultDesktop =
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1100px)").matches
      : true;
  const [isDesktop, setIsDesktop] = useState(defaultDesktop);
  const [isMenuOpen, setIsMenuOpen] = useState(defaultDesktop);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const mediaQuery = window.matchMedia("(min-width: 1100px)");
    const updateMatches = (event?: MediaQueryListEvent) => {
      const matches = event ? event.matches : mediaQuery.matches;
      setIsDesktop(matches);
    };
    updateMatches();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatches);
      return () => mediaQuery.removeEventListener("change", updateMatches);
    }
    mediaQuery.addListener(updateMatches);
    return () => mediaQuery.removeListener(updateMatches);
  }, []);

  useEffect(() => {
    setIsMenuOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop || !isMenuOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDesktop, isMenuOpen]);

  const handleNavigation = () => {
    if (!isDesktop) {
      setIsMenuOpen(false);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    if (!isDesktop) {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen((previous) => !previous);

  const sidebarClassName = [
    "sidebar",
    isDesktop ? "is-desktop" : "",
    isMenuOpen ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const shouldShowOverlay = !isDesktop && isMenuOpen;
  const shouldShowMenuButton = !isDesktop;

  return (
    <div className="sidebar-wrapper">
      {shouldShowMenuButton ? (
        <button
          type="button"
          className={`sidebar-menu-button${isMenuOpen ? " is-active" : ""}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-controls="app-sidebar"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <TbX aria-hidden="true" />
          ) : (
            <TbMenu2 aria-hidden="true" />
          )}
          <span>{isMenuOpen ? "Close" : "Menu"}</span>
        </button>
      ) : null}
      <aside
        id="app-sidebar"
        className={sidebarClassName}
        aria-hidden={!isDesktop ? !isMenuOpen : undefined}
      >
        <div>
          <div className="sidebar-header">
            <Link to="/" className="sidebar-brand" onClick={handleNavigation}>
              AskAria
            </Link>
            <div className="sidebar-header-actions">
              <ThemeToggle />
            </div>
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
                        onClick={handleNavigation}
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
        {onLogout ? (
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-logout-button"
              onClick={handleLogoutClick}
            >
              Log out
            </button>
          </div>
        ) : null}
      </aside>
      {shouldShowOverlay ? (
        <div
          role="presentation"
          className="sidebar-overlay is-visible"
          onClick={toggleMenu}
        />
      ) : null}
    </div>
  );
}

export type { SidebarItemKey };
