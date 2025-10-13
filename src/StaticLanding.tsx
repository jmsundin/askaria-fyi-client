import { Link } from "react-router-dom";


export default function StaticLanding() {
  return (
    <main
      style={{
        width: "80%",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top left, #f6ecff 0%, #ffffff 45%, #f3f4ff 100%)",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#301254",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 56px",
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#3c0f73",
            }}
          >
            AskAria
          </span>
        </Link>
        <nav style={{ display: "flex", gap: "18px", fontWeight: 600 }}>
          <Link to="/resources" style={{ color: "#5a189a" }}>
            Resources
          </Link>
          <Link to="/login" style={{ color: "#5a189a" }}>
            Login
          </Link>
          <Link to="/register" style={{ color: "#5a189a" }}>
            Register
          </Link>
        </nav>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "48px",
          padding: "0 56px 72px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{
              alignSelf: "flex-start",
              borderRadius: "999px",
              padding: "8px 18px",
              backgroundColor: "rgba(124, 58, 237, 0.12)",
              color: "#5a189a",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            AI Receptionists for Local Businesses
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: "52px",
              lineHeight: 1.05,
              color: "#220a3d",
            }}
          >
            Answer every call with a friendly AI trained on your business.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#6b5c90",
              maxWidth: "520px",
              lineHeight: 1.6,
            }}
          >
            AskAria greets callers instantly, collects the details you need, and
            syncs notes back to your systems. Smarter than voicemail, more
            affordable than an outsourced receptionist.
          </p>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link
              to="/register"
              style={{
                borderRadius: "999px",
                padding: "16px 32px",
                background: "linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)",
                boxShadow: "0 28px 48px rgba(124, 58, 237, 0.34)",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              style={{
                color: "#5a189a",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Already a customer?
            </Link>
          </div>
        </div>

        <div
          style={{
            borderRadius: "28px",
            padding: "36px",
            background:
              "linear-gradient(180deg, rgba(124, 58, 237, 0.12) 0%, rgba(236, 72, 153, 0.18) 100%)",
            boxShadow: "0 40px 60px rgba(60, 15, 115, 0.18)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            color: "#2d1f47",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <h2 style={{ margin: 0, fontSize: "20px", color: "#220a3d" }}>
              Why teams choose AskAria
            </h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                "Trained on your services, pricing, and brand voice",
                "Transfers urgent calls to the right person instantly",
                "Blocks spam and captures rich caller insights",
                "Works alongside your team 24/7 without breaks",
              ].map((benefit) => (
                <div
                  key={benefit}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "15px",
                    color: "#463667",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "#5a189a",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              borderRadius: "18px",
              backgroundColor: "rgba(255, 255, 255, 0.65)",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "14px",
              color: "#4c3b72",
              boxShadow: "0 16px 40px rgba(124, 58, 237, 0.18)",
            }}
          >
            <strong style={{ fontSize: "15px", color: "#3c0f73" }}>
              "AskAria made us sound polished and responsive from day one."
            </strong>
            <span>Sunday's Off Pools · Minneapolis, MN</span>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "72px 56px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
          background:
            "linear-gradient(180deg, rgba(246, 236, 255, 0.6) 0%, rgba(255, 255, 255, 0.95) 100%)",
          color: "#2d0f4a",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "780px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7a3bd3",
            }}
          >
            The Problem Today
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: "42px",
              lineHeight: 1.1,
              color: "#20073b",
            }}
          >
            Currently, you have three bad options for tackling incoming calls:
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "32px",
            width: "100%",
            maxWidth: "1080px",
          }}
        >
          {[
            {
              title: "Answer every call yourself",
              bullets: [
                "Constant interruptions during the day",
                "Wasted time on spam calls",
                "Always chasing people down",
              ],
            },
            {
              title: "Send calls you can't answer to voicemail",
              bullets: [
                "Most people don’t leave a message",
                "Hard to find time to call back",
                "Impossible to reach them again",
              ],
            },
            {
              title: "Pay too much for an outsourced service",
              bullets: [
                "Every call costs $2/minute",
                "Long hold times for callers",
                "Inconsistent service from untrained receptionists",
              ],
            },
          ].map((option) => (
            <article
              key={option.title}
              style={{
                borderRadius: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                boxShadow: "0 28px 60px rgba(60, 15, 115, 0.08)",
                border: "1px solid rgba(124, 58, 237, 0.12)",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(124, 58, 237, 0.24))",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  color: "#7a3bd3",
                  fontWeight: 700,
                }}
              >
                ×
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  color: "#1f0c34",
                  fontWeight: 700,
                }}
              >
                {option.title}
              </h3>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  color: "#4a356c",
                  fontSize: "15px",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                {option.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(236, 72, 153, 0.16)",
                        color: "#e11d48",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      ×
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <footer
        style={{
          marginTop: "auto",
          padding: "32px 56px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderTop: "1px solid rgba(90, 24, 154, 0.08)",
          fontSize: "13px",
          color: "#6b5c90",
        }}
      >
        <span>© {new Date().getFullYear()} AskAria. All rights reserved.</span>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link to="/login" style={{ color: "#5a189a" }}>
            Log in
          </Link>
          <Link to="/register" style={{ color: "#5a189a" }}>
            Create account
          </Link>
        </div>
      </footer>
    </main>
  );
}
