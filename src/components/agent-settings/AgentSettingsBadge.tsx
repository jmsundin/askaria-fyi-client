import type { ReactNode } from "react";

type AgentSettingsBadgeProps = {
  tone?: "default" | "success" | "warning" | "info";
  variant?: "pill" | "outlined" | "subtle";
  icon?: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
};

const toneClassMap: Record<
  NonNullable<AgentSettingsBadgeProps["tone"]>,
  string
> = {
  default: "agent-settings-badge--default",
  success: "agent-settings-badge--success",
  warning: "agent-settings-badge--warning",
  info: "agent-settings-badge--info",
};

const variantClassMap: Record<
  NonNullable<AgentSettingsBadgeProps["variant"]>,
  string
> = {
  pill: "agent-settings-badge--pill",
  outlined: "agent-settings-badge--outlined",
  subtle: "agent-settings-badge--subtle",
};

export default function AgentSettingsBadge({
  tone = "default",
  variant = "pill",
  icon,
  ariaLabel,
  children,
}: AgentSettingsBadgeProps) {
  const classes = [
    "agent-settings-badge",
    toneClassMap[tone],
    variantClassMap[variant],
  ].join(" ");

  return (
    <span
      className={classes}
      aria-label={ariaLabel}
      role={ariaLabel ? "status" : undefined}
    >
      {icon ? <span className="agent-settings-badge__icon">{icon}</span> : null}
      <span className="agent-settings-badge__label">{children}</span>
    </span>
  );
}

export type { AgentSettingsBadgeProps };
