import type { ReactNode } from "react";

type AgentSettingsPageHeaderProps = {
  title: string;
  description: string;
  cta?: ReactNode;
  aside?: ReactNode;
};

export default function AgentSettingsPageHeader({
  title,
  description,
  cta,
  aside,
}: AgentSettingsPageHeaderProps) {
  return (
    <header className="agent-settings-page-header">
      <div className="agent-settings-page-header__content">
        <h1 className="agent-settings-page-header__title">{title}</h1>
        <p className="agent-settings-page-header__description">{description}</p>
      </div>
      <div className="agent-settings-page-header__actions">
        {cta ? (
          <div className="agent-settings-page-header__cta">{cta}</div>
        ) : null}
        {aside ? (
          <div className="agent-settings-page-header__aside">{aside}</div>
        ) : null}
      </div>
    </header>
  );
}

export type { AgentSettingsPageHeaderProps };
