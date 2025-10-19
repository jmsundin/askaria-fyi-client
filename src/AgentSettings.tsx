import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import AgentSettingsTabs from "./components/agent-settings/AgentSettingsTabs";
import AgentSettingsPageHeader from "./components/agent-settings/AgentSettingsPageHeader";
import AgentSettingsSection from "./components/agent-settings/AgentSettingsSection";
import AgentSettingsCard from "./components/agent-settings/AgentSettingsCard";
import AgentSettingsListRow from "./components/agent-settings/AgentSettingsListRow";
import AgentSettingsBadge from "./components/agent-settings/AgentSettingsBadge";
import { authFetch, clearToken, type AuthUser } from "./auth";
import type { AgentSettingsTab } from "./components/agent-settings/AgentSettingsTabs";
import "./AgentSettings.css";

type TrainingSource = {
  label: string;
  value: string;
  href?: string;
};

type BusinessDetail = {
  label: string;
  value: string | string[];
};

type PremiumCallout = {
  headline: string;
  description: string;
  actionLabel: string;
};

const tabs: AgentSettingsTab[] = [
  { id: "business-info", label: "Business Information", iconLabel: "BI" },
  { id: "agent-profile", label: "Agent Profile", iconLabel: "AP" },
  { id: "greeting", label: "Greeting", iconLabel: "GR" },
  { id: "faqs", label: "FAQs", iconLabel: "FAQ" },
  { id: "take-message", label: "Take a Message", iconLabel: "TM" },
  { id: "spam-filters", label: "Spam Filters", iconLabel: "SF" },
  {
    id: "appointments",
    label: "Appointments",
    status: "premium",
    iconLabel: "APPT",
  },
  {
    id: "text-link",
    label: "Text a Link",
    status: "premium",
    iconLabel: "SMS",
  },
  {
    id: "transfer-calls",
    label: "Transfer Calls",
    status: "premium",
    iconLabel: "TC",
  },
  {
    id: "training-files",
    label: "Training Files",
    status: "premium",
    iconLabel: "TF",
  },
  {
    id: "launch-instructions",
    label: "Launch Instructions",
    iconLabel: "LI",
  },
];

const trainingSources: TrainingSource[] = [
  { label: "Google Business Profile", value: "Not Set" },
  {
    label: "Business Website",
    value: "https://infoverse.ai",
    href: "https://infoverse.ai",
  },
];

const businessDetails: BusinessDetail[] = [
  { label: "Name", value: "Infoverse AI" },
  { label: "Address", value: "Not Set" },
  { label: "Business Primary Phone Number", value: "(310) 741-0244" },
  { label: "Business Email", value: "Not Set" },
  {
    label: "Business Overview",
    value:
      "Infoverse AI builds a knowledge graph of the world's information, drawing from sources like Wikidata and Wikipedia, and provides tools to make better decisions in life.",
  },
];

const coreServices: string[] = [
  "AI Receptionists",
  "24/7 Answering",
  "Knowledge Graph Insights",
];

const premiumCallouts: Record<string, PremiumCallout> = {
  appointments: {
    headline: "Premium Feature",
    description:
      "Available with Scale, Growth and Custom plans. Your agent can share scheduling links via SMS when callers inquire about booking.",
    actionLabel: "Upgrade to unlock",
  },
  "text-link": {
    headline: "Premium Feature",
    description:
      "Teach Rosie when to send helpful texts. Configure scenarios like directions, pricing, or follow-up forms and she'll send the right link automatically.",
    actionLabel: "Upgrade to unlock",
  },
  "transfer-calls": {
    headline: "Premium Feature",
    description:
      "Let Rosie transfer warm leads to your team instantly. Assign unique numbers per transfer scenario and never miss an urgent call.",
    actionLabel: "Upgrade to unlock",
  },
  "training-files": {
    headline: "Premium Feature",
    description:
      "Upload PDFs, DOCs, or spreadsheets so Rosie can answer deeper questions. Files process automatically and are added to her knowledge base in minutes.",
    actionLabel: "Give it a try!",
  },
};

export default function AgentSettings() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>("business-info");

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      try {
        const response = await authFetch("/me");
        if (!response.ok) {
          clearToken();
          window.location.href = "/login";
          return;
        }
        const authenticatedUser: AuthUser = await response.json();
        if (isSubscribed) {
          setUser(authenticatedUser);
        }
      } catch {
        // Intentionally silent; errors fall back to default labels.
      }
    })();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const sidebarBusinessLabel = user?.name ?? "Infoverse AI";

  const publishCta = (
    <button
      type="button"
      className="agent-settings-button agent-settings-button--primary"
    >
      Publish
      <span className="agent-settings-button__icon" aria-hidden="true">
        ➜
      </span>
    </button>
  );

  const trialBadge = (
    <AgentSettingsBadge tone="warning" variant="subtle">
      7 days left in trial
    </AgentSettingsBadge>
  );

  const activeTabContent = useMemo(() => {
    switch (activeTabId) {
      case "business-info":
        return (
          <>
            <AgentSettingsSection
              id="training-sources"
              title="Training Sources"
              description="These sources help Rosie understand your business before answering calls."
              actions={
                <button
                  type="button"
                  className="agent-settings-button agent-settings-button--ghost"
                >
                  Edit
                </button>
              }
            >
              <div className="agent-settings-list">
                {trainingSources.map((source) => (
                  <AgentSettingsListRow
                    key={source.label}
                    label={source.label}
                    value={
                      source.href ? (
                        <a href={source.href} target="_blank" rel="noreferrer">
                          {source.value}
                        </a>
                      ) : (
                        source.value
                      )
                    }
                    isMuted={source.value === "Not Set"}
                  />
                ))}
              </div>
            </AgentSettingsSection>

            <AgentSettingsSection
              id="business-details"
              title="Business Details"
              description="Keep this information current so Rosie can represent your company accurately."
              actions={
                <button
                  type="button"
                  className="agent-settings-button agent-settings-button--ghost"
                >
                  Edit
                </button>
              }
            >
              <div className="agent-settings-list">
                {businessDetails.map((detail) => (
                  <AgentSettingsListRow
                    key={detail.label}
                    label={detail.label}
                    value={
                      Array.isArray(detail.value)
                        ? detail.value.map((line) => (
                            <span key={line}>{line}</span>
                          ))
                        : detail.value
                    }
                    isMuted={detail.value === "Not Set"}
                  />
                ))}
              </div>
            </AgentSettingsSection>

            <AgentSettingsSection
              id="core-services"
              title="Core Services"
              description="Rosie highlights these offerings when she speaks with callers."
              actions={
                <button
                  type="button"
                  className="agent-settings-button agent-settings-button--ghost"
                >
                  Add Service
                </button>
              }
            >
              <div className="agent-settings-pill-list" role="list">
                {coreServices.map((service) => (
                  <span
                    key={service}
                    className="agent-settings-pill"
                    role="listitem"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </AgentSettingsSection>
          </>
        );

      case "agent-profile":
        return (
          <>
            <AgentSettingsSection
              id="agent-profile-overview"
              title="Personalize your Agent"
              description="Tailor the way Rosie sounds and behaves so every caller gets an on-brand experience."
              actions={
                <button
                  type="button"
                  className="agent-settings-button agent-settings-button--ghost"
                >
                  Edit
                </button>
              }
            >
              <div className="agent-settings-grid agent-settings-grid--two">
                <AgentSettingsCard
                  title="Name"
                  description="Rosie"
                  iconLabel="N"
                />
                <AgentSettingsCard
                  title="Tone"
                  description="Casual"
                  iconLabel="T"
                />
                <AgentSettingsCard
                  title="Background noise"
                  description="Office"
                  iconLabel="BN"
                />
              </div>
            </AgentSettingsSection>

            <AgentSettingsSection
              id="agent-languages"
              title="Languages"
              description="Configure the languages Rosie can speak and understand."
              actions={
                <button
                  type="button"
                  className="agent-settings-button agent-settings-button--ghost"
                >
                  Edit
                </button>
              }
            >
              <div className="agent-settings-card-inline">
                <span className="agent-settings-chip">English</span>
              </div>
            </AgentSettingsSection>
          </>
        );

      case "greeting":
        return (
          <AgentSettingsSection
            id="phone-greeting"
            title="Phone Greeting"
            description="Customize the way Rosie answers calls and include legal disclaimers if needed."
            actions={
              <button
                type="button"
                className="agent-settings-button agent-settings-button--ghost"
              >
                Edit
              </button>
            }
          >
            <div className="agent-settings-list">
              <AgentSettingsListRow
                label="Type"
                value="Rosie's Default Greeting"
              />
              <AgentSettingsListRow
                label="Greeting"
                value={
                  "Hello, thank you for calling Infoverse AI. Our call may be recorded today for quality control purposes. My name is Rosie, how can I help you."
                }
              />
              <AgentSettingsListRow
                label="Legal Disclaimer Included"
                value="Yes"
              />
            </div>
          </AgentSettingsSection>
        );

      case "faqs":
        return (
          <AgentSettingsSection
            id="faqs"
            title="Frequently Asked Questions"
            description="Add answers so Rosie can handle common caller questions."
            actions={
              <button
                type="button"
                className="agent-settings-button agent-settings-button--ghost"
              >
                Add
              </button>
            }
          >
            <div className="agent-settings-empty-state">
              <span
                className="agent-settings-empty-state__icon"
                aria-hidden="true"
              >
                ?
              </span>
              <div className="agent-settings-empty-state__content">
                <strong>No Questions</strong>
                <span>
                  Add some FAQs to help Rosie handle common caller questions.
                </span>
              </div>
            </div>
          </AgentSettingsSection>
        );

      case "take-message":
        return (
          <AgentSettingsSection
            id="take-a-message"
            title="Take a Message"
            description="Choose the information Rosie captures when she takes a message."
            actions={
              <button
                type="button"
                className="agent-settings-button agent-settings-button--ghost"
              >
                Add Question
              </button>
            }
          >
            <div className="agent-settings-grid agent-settings-grid--two">
              <AgentSettingsCard
                title="Automatic Fields"
                description="Rosie always records caller name and phone number."
                iconLabel="AF"
              >
                <ul className="agent-settings-bullet-list">
                  <li>
                    <strong>Caller Name</strong> — Always requested
                  </li>
                  <li>
                    <strong>Caller Phone Number</strong> — Automatically
                    captured
                  </li>
                </ul>
              </AgentSettingsCard>
              <AgentSettingsCard
                title="Additional Questions"
                description="Specify extra prompts to collect more context."
                iconLabel="AQ"
                footer={
                  <button
                    type="button"
                    className="agent-settings-button agent-settings-button--ghost"
                  >
                    Add
                  </button>
                }
              >
                <div className="agent-settings-empty-state agent-settings-empty-state--compact">
                  <div className="agent-settings-empty-state__content">
                    <strong>No Additional Questions</strong>
                    <span>
                      You have not specified any additional questions to ask
                      when taking a message.
                    </span>
                  </div>
                </div>
              </AgentSettingsCard>
            </div>
          </AgentSettingsSection>
        );

      case "spam-filters":
        return (
          <AgentSettingsSection
            id="spam-filters"
            title="Spam Filters"
            description="Allow your agent to detect and block unwanted calls."
            actions={
              <button
                type="button"
                className="agent-settings-button agent-settings-button--ghost"
              >
                Edit
              </button>
            }
          >
            <div className="agent-settings-grid agent-settings-grid--two">
              <AgentSettingsCard
                title="Detect and Block Spam"
                description="Filter out unwanted calls."
                iconLabel="S"
              >
                <div className="agent-settings-list agent-settings-list--compact">
                  <AgentSettingsListRow
                    label="Block 1-800 Numbers"
                    value="No"
                  />
                  <AgentSettingsListRow
                    label="Detect sales conversations and hang up"
                    value="Yes"
                  />
                </div>
              </AgentSettingsCard>
              <AgentSettingsCard
                title="Blocked Number List"
                description="Manually add numbers to block."
                iconLabel="BN"
              >
                <div className="agent-settings-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type number to block..."
                    className="agent-settings-input"
                    aria-label="Blocked number"
                  />
                </div>
              </AgentSettingsCard>
            </div>
          </AgentSettingsSection>
        );

      case "appointments":
      case "text-link":
      case "transfer-calls":
      case "training-files": {
        const callout = premiumCallouts[activeTabId];
        return (
          <AgentSettingsSection
            id={`${activeTabId}-premium`}
            title={
              activeTabId === "appointments"
                ? "Appointments"
                : activeTabId === "text-link"
                ? "Text a Link"
                : activeTabId === "transfer-calls"
                ? "Transfer Calls"
                : "Training Files"
            }
            description={callout?.description ?? ""}
            badge={<AgentSettingsBadge tone="info">Premium</AgentSettingsBadge>}
            actions={
              callout ? (
                <button
                  type="button"
                  className="agent-settings-button agent-settings-button--primary"
                >
                  {callout.actionLabel}
                </button>
              ) : null
            }
          >
            <div className="agent-settings-premium-banner">
              <div className="agent-settings-premium-banner__content">
                <h3>{callout?.headline}</h3>
                <p>{callout?.description}</p>
              </div>
            </div>
            {activeTabId === "appointments" ? (
              <div className="agent-settings-list agent-settings-list--compact">
                <AgentSettingsListRow
                  label="Send Appointment Link"
                  value="No"
                />
              </div>
            ) : null}
            {activeTabId === "training-files" ? (
              <div className="agent-settings-empty-state">
                <div
                  className="agent-settings-empty-state__illustration"
                  aria-hidden="true"
                />
                <div className="agent-settings-empty-state__content">
                  <strong>Add Multiple Training Files</strong>
                  <span>
                    Upload files to give your Rosie agent more context about
                    your business.
                  </span>
                </div>
              </div>
            ) : null}
          </AgentSettingsSection>
        );
      }

      case "launch-instructions":
        return (
          <AgentSettingsSection
            id="launch-instructions"
            title="Launch Instructions"
            description="Forward your existing business number to Rosie or share her number directly with your customers."
            actions={
              <button
                type="button"
                className="agent-settings-button agent-settings-button--ghost"
              >
                Need help?
              </button>
            }
          >
            <div className="agent-settings-launch-banner">
              <AgentSettingsBadge tone="warning" variant="outlined">
                Rosie is in test mode and can't answer calls from real
                customers. Add a credit card to launch your agent.
              </AgentSettingsBadge>
            </div>
            <div className="agent-settings-grid agent-settings-grid--two">
              <AgentSettingsCard
                title="Forward Calls"
                description="Send calls from your existing number to Rosie."
                iconLabel="FC"
                tone="info"
              >
                <p className="agent-settings-card__helper">
                  You can forward calls from your existing business number to
                  your agent's number, use your agent's number directly, or a
                  combination of both.
                </p>
              </AgentSettingsCard>
              <AgentSettingsCard
                title="Use Rosie Number"
                description="Share Rosie's number as your new business line."
                iconLabel="RN"
              />
            </div>
            <div className="agent-settings-grid agent-settings-grid--two">
              <AgentSettingsCard
                title="Phone System Type"
                description="Select Type"
                iconLabel="PS"
              >
                <button type="button" className="agent-settings-select">
                  Select Type
                </button>
              </AgentSettingsCard>
              <AgentSettingsCard
                title="Select Your Provider"
                description="Select Provider"
                iconLabel="PR"
              >
                <button type="button" className="agent-settings-select">
                  Select Provider
                </button>
              </AgentSettingsCard>
            </div>
          </AgentSettingsSection>
        );

      default:
        return null;
    }
  }, [activeTabId]);

  return (
    <div className="agent-settings-page">
      <Sidebar
        activeItem="settings"
        businessLabel={sidebarBusinessLabel}
        onLogout={() => {
          clearToken();
          window.location.href = "/login";
        }}
      />
      <main className="agent-settings-main">
        <div className="agent-settings-topbar">
          <AgentSettingsBadge tone="info" variant="subtle">
            Agent Settings
          </AgentSettingsBadge>
          {trialBadge}
        </div>
        <AgentSettingsPageHeader
          title="Business Information"
          description="This business information gives Rosie the context to handle your calls."
          cta={publishCta}
        />
        <AgentSettingsTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
        />
        <div className="agent-settings-content">{activeTabContent}</div>
      </main>
    </div>
  );
}
