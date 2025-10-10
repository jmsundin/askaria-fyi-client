import Sidebar from "./components/Sidebar";
import { useMemo } from "react";

const LAUNCH_STEPS = [
  { id: 1, label: "Customize", status: "complete" as const },
  { id: 2, label: "Test", status: "complete" as const },
  { id: 3, label: "Launch", status: "active" as const },
];

const plans = [
  {
    name: "Professional",
    price: "$49",
    cadence: "/month",
    description:
      "Perfect for small business and solo owners who need Aria to answer calls when they can't.",
    features: [
      "Unlimited minutes",
      "Message taking with custom questions",
      "Smart Spam Detection",
      "Bilingual agent – English & Spanish",
    ],
    cta: "Select Professional plan",
  },
  {
    name: "Scale",
    price: "$149",
    cadence: "/month",
    description:
      "Perfect for growing businesses that want Aria to answer calls and take action on their behalf.",
    features: [
      "Everything in Professional plus:",
      "Appointment Links",
      "Call Transfers",
      "Send texts during calls",
      "Warm Transfers",
    ],
    cta: "Select Scale plan",
    badge: "Most Popular",
  },
  {
    name: "Growth",
    price: "$299",
    cadence: "/month",
    description:
      "Perfect for more complex businesses that require additional agent training to handle their calls.",
    features: ["Everything in Scale plus:", "Training Files"],
    cta: "Select Growth plan",
  },
];

const nextSteps = [
  {
    title: "Invite your team",
    description:
      "Add teammates so they can listen to test calls and help fine-tune Aria before you launch.",
  },
  {
    title: "Connect integrations",
    description:
      "Sync Aria with your tools to track leads, appointments, and follow-ups automatically.",
  },
  {
    title: "Publish your new number",
    description:
      "Share Aria's number on your website, Google profile, and marketing channels.",
  },
];

export default function QuickStartLaunch() {
  const onboardingSteps = useMemo(() => LAUNCH_STEPS, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8f6ff",
        color: "#301447",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar activeItem="quick-start" businessLabel="Your Business" />
      <main
        style={{
          flex: 1,
          padding: "48px 64px 80px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        <nav
          aria-label="Onboarding progress"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            alignItems: "center",
          }}
        >
          {onboardingSteps.map((step) => {
            const isStepComplete = step.status === "complete";
            const isStepActive = step.status === "active";
            return (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: isStepActive ? "#6c2bd9" : "#6f5b91",
                  fontWeight: isStepActive ? 700 : 600,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isStepComplete
                      ? "#d8c3ff"
                      : isStepActive
                      ? "#ede6ff"
                      : "#f1eef8",
                    color: isStepComplete ? "#5a189a" : "#7d6ba8",
                    fontWeight: 700,
                  }}
                >
                  {isStepComplete ? "✓" : step.id}
                </span>
                {step.label}
              </div>
            );
          })}
        </nav>

        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#311b63",
              fontWeight: 700,
            }}
          >
            Start accepting real customer calls.
          </h1>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#6f5b91",
            }}
          >
            ✓ Secure checkout powered by Stripe
          </span>
        </header>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#311b63",
              fontWeight: 700,
            }}
          >
            Select a plan:
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(280px, 1fr))",
              gap: "28px",
            }}
          >
            {plans.map((plan) => (
              <article
                key={plan.name}
                style={{
                  borderRadius: "24px",
                  border: plan.badge
                    ? "2px solid #d7c9ff"
                    : "1px solid #ede3ff",
                  backgroundColor: "#ffffff",
                  padding: "24px",
                  boxShadow: plan.badge
                    ? "0 30px 80px rgba(124, 58, 237, 0.15)"
                    : "0 24px 60px rgba(48, 18, 84, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {plan.badge ? (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      borderRadius: "999px",
                      backgroundColor: "#f1e8ff",
                      color: "#5a2bc7",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "6px 14px",
                    }}
                  >
                    {plan.badge}
                  </span>
                ) : null}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>
                    {plan.name}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "4px",
                      color: "#301254",
                    }}
                  >
                    <span style={{ fontSize: "32px", fontWeight: 700 }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      {plan.cadence}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: "#7f6e9b",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    color: "#311b63",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span aria-hidden="true" style={{ marginRight: "8px" }}>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid #d7c9f4",
                    background: plan.badge
                      ? "linear-gradient(90deg, #7c3aed, #ec4899)"
                      : "#ffffff",
                    color: plan.badge ? "#ffffff" : "#5a2bc7",
                    fontWeight: 700,
                    padding: "12px 20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            borderRadius: "28px",
            border: "1px solid #ede3ff",
            backgroundColor: "#ffffff",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(48, 18, 84, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#311b63",
              fontWeight: 700,
            }}
          >
            What happens next?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {nextSteps.map((step) => (
              <article
                key={step.title}
                style={{
                  borderRadius: "18px",
                  border: "1px solid #f1e8ff",
                  backgroundColor: "#fbf8ff",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700 }}>
                  {step.title}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#6f5b91",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
