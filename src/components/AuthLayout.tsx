import { Link, type LinkProps } from "react-router-dom";
import type { ReactNode } from "react";
import ThemeToggle from "./ThemeToggle";
import "./AuthLayout.css";

type HelperLink = {
  label: string;
  to: LinkProps["to"];
};

type AuthLayoutProps = {
  helperText: string;
  helperLink: HelperLink;
  children: ReactNode;
};

export default function AuthLayout({
  helperText,
  helperLink,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <header className="auth-header">
          <Link to="/" className="auth-brand">
            AskAria
          </Link>
          <ThemeToggle />
        </header>

        <div>{children}</div>

        <footer className="auth-footer">
          <span>
            {helperText} <Link to={helperLink.to}>{helperLink.label}</Link>
          </span>
          <span>© {new Date().getFullYear()} AskAria</span>
        </footer>
      </div>
    </div>
  );
}
