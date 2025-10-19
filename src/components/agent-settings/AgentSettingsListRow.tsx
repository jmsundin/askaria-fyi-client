import type { ReactNode } from "react";

type AgentSettingsListRowProps = {
  label: string;
  value: ReactNode;
  isEmphasized?: boolean;
  isMuted?: boolean;
};

export default function AgentSettingsListRow({
  label,
  value,
  isEmphasized = false,
  isMuted = false,
}: AgentSettingsListRowProps) {
  const rowClassName = [
    "agent-settings-list-row",
    isEmphasized ? "agent-settings-list-row--emphasized" : "",
    isMuted ? "agent-settings-list-row--muted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClassName}>
      <span className="agent-settings-list-row__label">{label}</span>
      <div className="agent-settings-list-row__value">{value}</div>
    </div>
  );
}

export type { AgentSettingsListRowProps };
