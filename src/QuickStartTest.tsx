import Sidebar from "./components/Sidebar";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const TEST_STEPS = [
  { id: 1, label: "Customize", status: "complete" as const },
  { id: 2, label: "Test", status: "active" as const },
  { id: 3, label: "Launch", status: "upcoming" as const },
];

export default function QuickStartTest() {
  const onboardingSteps = useMemo(
    () =>
      TEST_STEPS.map((step) =>
        step.status === "active" ? { ...step, status: "active" as const } : step
      ),
    []
  );

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
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
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
            Your agent is ready. Make your first test call.
          </h1>
          <p
            style={{
              margin: 0,
              color: "#7f6e9b",
              fontSize: "16px",
              lineHeight: 1.7,
            }}
          >
            Know what your callers will hear when they call. Only you can call
            Aria until you go live.
          </p>
        </header>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            <article
              style={{
                borderRadius: "24px",
                border: "1px solid #ede3ff",
                backgroundColor: "#ffffff",
                padding: "24px",
                boxShadow: "0 24px 50px rgba(48, 18, 84, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#8b78b0",
                    letterSpacing: "0.08em",
                  }}
                >
                  Your Aria Number
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "18px",
                    border: "1px solid #f1e8ff",
                    padding: "18px 20px",
                    background:
                      "linear-gradient(135deg, rgba(249, 246, 255, 0.9), rgba(253, 248, 255, 0.95))",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                      color: "#ffffff",
                      fontWeight: 700,
                      padding: "12px 20px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <span aria-hidden="true">📞</span>
                    Call
                  </button>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#311b63",
                      }}
                    >
                      (484) 552-9792
                    </span>
                    <Link
                      to="#"
                      style={{
                        color: "#6f5b91",
                        fontSize: "14px",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Request local area code
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            <article
              style={{
                borderRadius: "24px",
                border: "1px solid #ede3ff",
                backgroundColor: "#ffffff",
                padding: "24px",
                boxShadow: "0 24px 50px rgba(48, 18, 84, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#8b78b0",
                  letterSpacing: "0.08em",
                }}
              >
                Try asking Aria…
              </span>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  "Tell me about Infoverse AI?",
                  "What services do you offer?",
                  "Are you open tomorrow?",
                ].map((prompt) => (
                  <li
                    key={prompt}
                    style={{
                      borderRadius: "18px",
                      border: "1px solid #f1e8ff",
                      padding: "16px",
                      backgroundColor: "#fbf7ff",
                      color: "#311b63",
                      fontWeight: 600,
                    }}
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <article
            style={{
              borderRadius: "24px",
              border: "1px solid #ede3ff",
              backgroundColor: "#ffffff",
              padding: "24px",
              boxShadow: "0 24px 50px rgba(48, 18, 84, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#311b63",
                }}
              >
                Choose a live plan to accept customer calls
              </span>
              <span style={{ color: "#7f6e9b", fontSize: "14px" }}>
                Upgrade when you’re ready for callers to reach Aria directly.
              </span>
            </div>
            <button
              type="button"
              style={{
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                color: "#ffffff",
                fontWeight: 700,
                padding: "14px 32px",
                boxShadow: "0 18px 35px rgba(124, 58, 237, 0.28)",
                cursor: "pointer",
              }}
            >
              Explore Live Plans
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
