import type { ReactNode } from "react";

type AgentSettingsCardProps = {
  title: string;
  description?: string;
  iconLabel?: string;
  iconAriaLabel?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "premium" | "warning" | "info";
};

export default function AgentSettingsCard({
  title,
  description,
  iconLabel,
  iconAriaLabel,
  actions,
  footer,
  children,
  tone = "default",
}: AgentSettingsCardProps) {
  const toneClassName = `agent-settings-card__icon--${tone}`;

  return (
    <article className="agent-settings-card">
      <header className="agent-settings-card__header">
        {iconLabel ? (
          <span
            className={`agent-settings-card__icon ${toneClassName}`}
            aria-label={iconAriaLabel}
          >
            {iconLabel}
          </span>
        ) : null}
        <div className="agent-settings-card__heading">
          <h3 className="agent-settings-card__title">{title}</h3>
          {description ? (
            <p className="agent-settings-card__description">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="agent-settings-card__actions">{actions}</div>
        ) : null}
      </header>
      {children ? (
        <div className="agent-settings-card__body">{children}</div>
      ) : null}
      {footer ? (
        <footer className="agent-settings-card__footer">{footer}</footer>
      ) : null}
    </article>
  );
}

export type { AgentSettingsCardProps };
