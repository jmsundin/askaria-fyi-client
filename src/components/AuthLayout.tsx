import { Link, type LinkProps } from "react-router-dom";
import type { ReactNode } from "react";

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f3f4ff 0%, #ffffff 45%, #fdf8ff 100%)",
        color: "#2d1f47",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1040px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 560px)",
          justifyContent: "center",
          gap: "48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <section
          style={{
            borderRadius: "28px",
            border: "1px solid #efe5ff",
            background: "linear-gradient(180deg, #ffffff 0%, #fbf8ff 100%)",
            boxShadow: "0 32px 64px rgba(48, 18, 84, 0.14)",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <header
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#3c0f73",
              }}
            >
              AskAria
            </span>
          </header>

          <div>{children}</div>

          <footer
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              color: "#7c6f92",
              fontSize: "15px",
            }}
          >
            <span>
              {helperText}{" "}
              <Link
                to={helperLink.to}
                style={{ color: "#5a189a", fontWeight: 600 }}
              >
                {helperLink.label}
              </Link>
            </span>
            <span style={{ fontSize: "13px" }}>
              © {new Date().getFullYear()} AskAria
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}
