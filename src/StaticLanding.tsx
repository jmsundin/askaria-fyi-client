import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import "./StaticLanding.css";

function LandingThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const current = document.documentElement.dataset.theme;
    return current === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  return <ThemeToggle />;
}

export default function StaticLanding() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <span>AskAria</span>
        </Link>
        <div className="landing-header-actions">
          <nav className="landing-nav" aria-label="Main navigation">
            <Link to="/resources">Resources</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
          <LandingThemeToggle />
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">
            AI Receptionists for Local Businesses
          </span>
          <h1 className="landing-title">
            Answer every call with a friendly AI trained on your business.
          </h1>
          <p className="landing-subtitle">
            AskAria greets callers instantly, collects the details you need, and
            syncs notes back to your systems. Smarter than voicemail, more
            affordable than an outsourced receptionist.
          </p>
          <div className="landing-cta-row">
            <Link to="/register" className="landing-cta-primary">
              Start Free Trial
            </Link>
            <Link to="/login" className="landing-cta-secondary">
              Already a customer?
            </Link>
          </div>
        </div>

        <div className="landing-why-card">
          <div className="landing-why-content">
            <h2>Why teams choose AskAria</h2>
            <div className="landing-benefits">
              {[
                "Trained on your services, pricing, and brand voice",
                "Transfers urgent calls to the right person instantly",
                "Blocks spam and captures rich caller insights",
                "Works alongside your team 24/7 without breaks",
              ].map((benefit) => (
                <div key={benefit} className="landing-benefit-item">
                  <span aria-hidden="true" className="landing-benefit-check">
                    ✓
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="landing-testimonial">
            <strong>
              "AskAria made us sound polished and responsive from day one."
            </strong>
            <span>Sunday's Off Pools · Minneapolis, MN</span>
          </div>
        </div>
      </section>

      <section className="landing-problem">
        <div className="landing-problem-heading">
          <span>The Problem Today</span>
          <h2>
            Currently, you have three bad options for tackling incoming calls:
          </h2>
        </div>

        <div className="landing-problem-grid">
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
            <article key={option.title} className="landing-problem-card">
              <span aria-hidden="true" className="landing-problem-icon">
                ×
              </span>
              <h3>{option.title}</h3>
              <ul>
                {option.bullets.map((bullet) => (
                  <li key={bullet}>
                    <span aria-hidden="true" className="landing-problem-bullet">
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

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} AskAria. All rights reserved.</span>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
        </div>
      </footer>
    </main>
  );
}
