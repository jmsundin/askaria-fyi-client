import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import { authFetch, getToken, setToken, type AuthResponse } from "./auth";

type LoginFormData = {
  email: string;
  password: string;
};

const formStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  fieldset: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  label: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#4a2387",
  },
  input: {
    borderRadius: "14px",
    border: "1px solid #d8c7ff",
    backgroundColor: "#ffffff",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 500,
    color: "#2d1f47",
    boxShadow: "0 8px 24px rgba(74, 35, 135, 0.08)",
  },
  inputError: {
    border: "1px solid #f97316",
    boxShadow: "0 8px 24px rgba(249, 115, 22, 0.12)",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: 600,
  },
  submitButton: {
    border: "none",
    borderRadius: "999px",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#ffffff",
    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
    boxShadow: "0 24px 48px rgba(124, 58, 237, 0.35)",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  submitButtonDisabled: {
    cursor: "not-allowed",
    opacity: 0.7,
    boxShadow: "0 12px 24px rgba(124, 58, 237, 0.18)",
  },
  formFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    color: "#8275a7",
  },
  supportLink: {
    color: "#5a189a",
    fontWeight: 600,
    textDecoration: "none",
  },
  serverMessage: {
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 600,
    backgroundColor: "rgba(185, 28, 28, 0.08)",
    color: "#7f1d1d",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const isEmailValid = useMemo(
    () => /.+@.+\..+/.test(formData.email),
    [formData.email]
  );

  useEffect(() => {
    if (getToken()) {
      navigate("/app", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setServerMessage(null);
  }, [formData]);

  function updateField<K extends keyof LoginFormData>(
    key: K,
    value: LoginFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!isEmailValid) nextErrors.email = "Valid email is required";
    if (!formData.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await authFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Login failed");
      }
      const data: AuthResponse = await response.json();
      setToken(data.token);
      navigate("/app", { replace: true });
    } catch (err) {
      setServerMessage((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to configure your agent, review conversations, and keep Askaria working for your business."
      helperText="Need an account?"
      helperLink={{ label: "Register", to: "/register" }}
    >
      <form onSubmit={onSubmit} noValidate style={formStyles.container}>
        <fieldset style={formStyles.fieldset}>
          <legend style={{ display: "none" }}>Login form</legend>
          <div style={formStyles.field}>
            <label htmlFor="email" style={formStyles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
              autoFocus
              style={{
                ...formStyles.input,
                ...(errors.email ? formStyles.inputError : {}),
              }}
            />
            {errors.email ? (
              <div id="email-error" style={formStyles.errorText} role="alert">
                {errors.email}
              </div>
            ) : null}
          </div>

          <div style={formStyles.field}>
            <label htmlFor="password" style={formStyles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              autoComplete="current-password"
              style={{
                ...formStyles.input,
                ...(errors.password ? formStyles.inputError : {}),
              }}
            />
            {errors.password ? (
              <div
                id="password-error"
                style={formStyles.errorText}
                role="alert"
              >
                {errors.password}
              </div>
            ) : null}
          </div>
        </fieldset>

        <div style={formStyles.formFooter}>
          <span>Forgot your password? Reach out to your administrator.</span>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...formStyles.submitButton,
              ...(submitting ? formStyles.submitButtonDisabled : {}),
            }}
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </div>
      </form>

      {serverMessage ? (
        <div style={formStyles.serverMessage} role="alert">
          {serverMessage}
        </div>
      ) : null}
    </AuthLayout>
  );
}
