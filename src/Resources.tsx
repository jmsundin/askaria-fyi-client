import { Link } from "react-router-dom";

type ResourceArticle = {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  category: string;
};

const resourceArticles: ResourceArticle[] = [
  {
    id: "call-forwarding",
    title: "What Is Call Forwarding? How To Use It To Grow Your Business",
    description:
      "Understand the fundamentals of call forwarding, how it supports busy teams, and the steps to configure flexible routing for every caller.",
    publishDate: "Oct 7, 2025",
    category: "Call Management",
  },
  {
    id: "dialpad-alternatives",
    title: "Dialpad Alternatives For Small Businesses",
    description:
      "Explore modern replacements for traditional phone systems, complete with pricing snapshots and feature breakdowns tailored to growing teams.",
    publishDate: "Oct 1, 2025",
    category: "Comparisons",
  },
  {
    id: "business-phone-etiquette",
    title:
      "Business Phone Etiquette Made Simple: 11 Tips To Handle Calls Professionally",
    description:
      "Give every caller a polished experience with greeting scripts, tone guidelines, and follow-up playbooks used by high-performing support teams.",
    publishDate: "Sep 29, 2025",
    category: "Best Practices",
  },
  {
    id: "automate-your-business",
    title: "17 Ways To Automate Your Small Business",
    description:
      "Unlock the automations that save hours each week across scheduling, lead intake, and customer follow-ups without sacrificing personalization.",
    publishDate: "Sep 26, 2025",
    category: "Automation",
  },
  {
    id: "intelligent-call-routing",
    title:
      "Intelligent Call Routing: What It Is and How It Improves Customer Experience",
    description:
      "Route calls to the right person every time. Learn how intent-based routing, voicemail intelligence, and SMS follow-ups work together.",
    publishDate: "Sep 24, 2025",
    category: "Customer Experience",
  },
  {
    id: "high-call-volume",
    title: "What Is High Call Volume? 11 Ways To Manage It Effectively",
    description:
      "Get a ready-to-ship action plan for surges in demand, from staffing models and self-service flows to AI co-pilots that scale with you.",
    publishDate: "Sep 7, 2025",
    category: "Operations",
  },
  {
    id: "call-center-automation",
    title: "Call Center Automation: Types, Benefits & Best Practices",
    description:
      "Discover where automation adds the most value across intake, triage, and follow-up while preserving the human touch every caller expects.",
    publishDate: "Aug 22, 2025",
    category: "Automation",
  },
  {
    id: "ruby-receptionist-alternatives",
    title: "Ruby Receptionist Alternatives You Need To Try",
    description:
      "Compare top virtual receptionist services on response times, integrations, and pricing so you can confidently choose the best-fit partner.",
    publishDate: "Aug 18, 2025",
    category: "Comparisons",
  },
  {
    id: "ai-answering-services-2025",
    title: "10 Best AI Answering Services For SMBs in 2025",
    description:
      "See how leading services stack up across accuracy, customization, and analytics—and where Ask Aria delivers a measurable advantage.",
    publishDate: "Aug 11, 2025",
    category: "Comparisons",
  },
  {
    id: "chatbot-vs-virtual-assistant",
    title: "Chatbot vs Virtual Assistant: What's the Difference?",
    description:
      "Learn how each technology handles conversational nuance, when to deploy them, and how hybrid strategies can reduce missed opportunities.",
    publishDate: "Jul 24, 2025",
    category: "Guides",
  },
];

export default function Resources() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#faf7ff",
        color: "#34145a",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "26px 64px",
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(236, 72, 153, 0.08))",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#34145a",
            fontWeight: 700,
            fontSize: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span>AskAria</span>
        </Link>
        <nav style={{ display: "flex", gap: "20px", fontWeight: 600 }}>
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
          padding: "72px 64px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "flex-start",
          background:
            "radial-gradient(circle at top left, rgba(124, 58, 237, 0.14), rgba(255, 255, 255, 0.9))",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#5a189a",
          }}
        >
          Resource Library
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: "48px",
            lineHeight: 1.05,
            color: "#220a3d",
          }}
        >
          Insights and playbooks for modern answering teams.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "18px",
            maxWidth: "620px",
            lineHeight: 1.6,
            color: "#5e4a85",
          }}
        >
          Level up every customer interaction with tested scripts, automation
          guides, and deep dives on delivering premium service at scale.
        </p>
      </section>

      <section
        style={{
          padding: "48px 64px 96px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "32px",
        }}
      >
        {resourceArticles.map((article) => (
          <article
            key={article.id}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 24px 44px rgba(52, 20, 90, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#7a3dc9",
                fontWeight: 700,
              }}
            >
              {article.category}
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                lineHeight: 1.25,
                color: "#220a3d",
              }}
            >
              {article.title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                lineHeight: 1.55,
                color: "#5e4a85",
              }}
            >
              {article.description}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "auto",
              }}
            >
              <span style={{ fontSize: "14px", color: "#7f6aa8" }}>
                {article.publishDate}
              </span>
              <Link
                to={`/#resources/${article.id}`}
                style={{
                  color: "#5a189a",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Read summary
              </Link>
            </div>
          </article>
        ))}
      </section>

      <footer
        style={{
          marginTop: "auto",
          padding: "32px 64px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderTop: "1px solid rgba(90, 24, 154, 0.08)",
          fontSize: "13px",
          color: "#6b5c90",
        }}
      >
        <span>© {new Date().getFullYear()} Ask Aria. All rights reserved.</span>
        <div style={{ display: "flex", gap: "18px" }}>
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
