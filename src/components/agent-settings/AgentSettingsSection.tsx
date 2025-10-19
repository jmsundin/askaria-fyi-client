import type { ReactNode } from "react";

type AgentSettingsSectionProps = {
  id: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AgentSettingsSection({
  id,
  title,
  description,
  badge,
  actions,
  children,
}: AgentSettingsSectionProps) {
  return (
    <section
      id={id}
      className="agent-settings-section"
      aria-labelledby={`${id}-title`}
    >
      <header className="agent-settings-section__header">
        <div className="agent-settings-section__heading">
          <div className="agent-settings-section__title-row">
            <h2 id={`${id}-title`} className="agent-settings-section__title">
              {title}
            </h2>
            {badge ? (
              <span
                className="agent-settings-section__badge"
                aria-hidden="true"
              >
                {badge}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="agent-settings-section__description">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="agent-settings-section__actions">{actions}</div>
        ) : null}
      </header>
      <div className="agent-settings-section__content">{children}</div>
    </section>
  );
}

export type { AgentSettingsSectionProps };
