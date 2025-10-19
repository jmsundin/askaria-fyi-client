import type { ReactNode } from "react";

type AgentSettingsTab = {
  id: string;
  label: string;
  status?: "premium" | "beta" | "test";
  icon?: ReactNode;
  iconLabel?: string;
  iconAriaLabel?: string;
};

type AgentSettingsTabsProps = {
  tabs: AgentSettingsTab[];
  activeTabId: string;
  onTabChange?: (tabId: string) => void;
};

const statusLabelCopy: Record<
  NonNullable<AgentSettingsTab["status"]>,
  string
> = {
  premium: "Premium",
  beta: "Beta",
  test: "Test Mode",
};

export default function AgentSettingsTabs({
  tabs,
  activeTabId,
  onTabChange,
}: AgentSettingsTabsProps) {
  return (
    <nav className="agent-settings-tabs" aria-label="Agent settings sections">
      <ul className="agent-settings-tabs__list">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <li key={tab.id} className="agent-settings-tabs__item">
              <button
                type="button"
                className={
                  isActive
                    ? "agent-settings-tabs__button is-active"
                    : "agent-settings-tabs__button"
                }
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (!isActive) {
                    onTabChange?.(tab.id);
                  }
                }}
              >
                <span className="agent-settings-tabs__label">
                  {tab.icon ? (
                    <span
                      className="agent-settings-tabs__icon"
                      aria-hidden="true"
                    >
                      {tab.icon}
                    </span>
                  ) : tab.iconLabel ? (
                    <span
                      className="agent-settings-tabs__icon"
                      aria-label={tab.iconAriaLabel}
                    >
                      {tab.iconLabel}
                    </span>
                  ) : null}
                  {tab.label}
                </span>
                {tab.status ? (
                  <span
                    className={`agent-settings-tabs__status is-${tab.status}`}
                  >
                    {statusLabelCopy[tab.status]}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export type { AgentSettingsTab, AgentSettingsTabsProps };
