import { Link, type LinkProps } from "react-router-dom";
import type { ReactNode } from "react";

type HelperLink = {
  label: string;
  to: LinkProps["to"];
};

type AuthLayoutProps = {
  heading: string;
  subheading: string;
  helperText: string;
  helperLink: HelperLink;
  children: ReactNode;
};

export default function AuthLayout({
  heading,
  subheading,
  helperText,
  helperLink,
  children,
}: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f3f4ff 0%, #ffffff 50%, #f8f5ff 100%)",
        color: "#2d1f47",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1040px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "48px",
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
          }}
        >
          <header
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                color: "#5a189a",
                fontWeight: 700,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(236, 72, 153, 0.25))",
                  color: "#3c0f73",
                  fontSize: "16px",
                }}
              >
                AF
              </span>
              <span style={{ fontSize: "16px", letterSpacing: "0.08em" }}>
                Askaria Portal
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                lineHeight: 1.1,
                color: "#301254",
              }}
            >
              {heading}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "17px",
                color: "#7c6f92",
                maxWidth: "520px",
              }}
            >
              {subheading}
            </p>
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
              © {new Date().getFullYear()} Askaria
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}
