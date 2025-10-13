import { Link } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import "./Resources.css";

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
    <main className="resources-page">
      <header className="resources-header">
        <Link to="/" className="resources-brand">
          AskAria
        </Link>
        <div className="resources-header-actions">
          <nav className="resources-nav" aria-label="Resources navigation">
            <Link to="/resources" aria-current="page">
              Resources
            </Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <section className="resources-hero">
        <span>Resource Library</span>
        <h1>Insights and playbooks for modern answering teams.</h1>
        <p>
          Level up every customer interaction with tested scripts, automation
          guides, and deep dives on delivering premium service at scale.
        </p>
      </section>

      <section className="resources-grid">
        {resourceArticles.map((article) => (
          <article key={article.id} className="resources-card">
            <span>{article.category}</span>
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div>
              <span>{article.publishDate}</span>
              <Link to={`/#resources/${article.id}`}>Read summary</Link>
            </div>
          </article>
        ))}
      </section>

      <footer className="resources-footer">
        <span>© {new Date().getFullYear()} Ask Aria. All rights reserved.</span>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
        </div>
      </footer>
    </main>
  );
}
