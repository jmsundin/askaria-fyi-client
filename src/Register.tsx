import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import { authFetch, setToken, type AuthResponse } from "./auth";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const registerFormStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  fieldGrid: {
    border: "none",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
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
  helperText: {
    color: "#8275a7",
    fontSize: "13px",
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
    alignSelf: "flex-end" as const,
  },
  submitButtonDisabled: {
    cursor: "not-allowed",
    opacity: 0.7,
    boxShadow: "0 12px 24px rgba(124, 58, 237, 0.18)",
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

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const isEmailValid = useMemo(
    () => /.+@.+\..+/.test(formData.email),
    [formData.email]
  );
  const doPasswordsMatch = useMemo(
    () =>
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword,
    [formData.password, formData.confirmPassword]
  );

  useEffect(() => {
    setServerMessage(null);
  }, [formData]);

  function updateField<K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!isEmailValid) nextErrors.email = "Valid email is required";
    if (formData.password.length < 8)
      nextErrors.password = "Password must be at least 8 characters";
    if (!doPasswordsMatch) nextErrors.confirmPassword = "Passwords must match";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await authFetch("/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Registration failed");
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
      helperText="Already have an account?"
      helperLink={{ label: "Log in", to: "/login" }}
    >
      <form onSubmit={onSubmit} noValidate style={registerFormStyles.container}>
        <fieldset style={registerFormStyles.fieldGrid}>
          <legend style={{ display: "none" }}>Registration form</legend>
          <div style={registerFormStyles.field}>
            <label htmlFor="name" style={registerFormStyles.label}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              autoComplete="name"
              style={{
                ...registerFormStyles.input,
                ...(errors.name ? registerFormStyles.inputError : {}),
              }}
            />
            {errors.name ? (
              <div
                id="name-error"
                style={registerFormStyles.errorText}
                role="alert"
              >
                {errors.name}
              </div>
            ) : null}
          </div>

          <div style={registerFormStyles.field}>
            <label htmlFor="email" style={registerFormStyles.label}>
              Work email
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
              style={{
                ...registerFormStyles.input,
                ...(errors.email ? registerFormStyles.inputError : {}),
              }}
            />
            {errors.email ? (
              <div
                id="email-error"
                style={registerFormStyles.errorText}
                role="alert"
              >
                {errors.email}
              </div>
            ) : null}
          </div>

          <div style={registerFormStyles.field}>
            <label htmlFor="password" style={registerFormStyles.label}>
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
              autoComplete="new-password"
              style={{
                ...registerFormStyles.input,
                ...(errors.password ? registerFormStyles.inputError : {}),
              }}
            />
            <span style={registerFormStyles.helperText}>
              Must be at least 8 characters with a mix of letters and numbers.
            </span>
            {errors.password ? (
              <div
                id="password-error"
                style={registerFormStyles.errorText}
                role="alert"
              >
                {errors.password}
              </div>
            ) : null}
          </div>

          <div style={registerFormStyles.field}>
            <label htmlFor="confirmPassword" style={registerFormStyles.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(event) =>
                updateField("confirmPassword", event.target.value)
              }
              required
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              autoComplete="new-password"
              style={{
                ...registerFormStyles.input,
                ...(errors.confirmPassword
                  ? registerFormStyles.inputError
                  : {}),
              }}
            />
            {errors.confirmPassword ? (
              <div
                id="confirmPassword-error"
                style={registerFormStyles.errorText}
                role="alert"
              >
                {errors.confirmPassword}
              </div>
            ) : null}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          style={{
            ...registerFormStyles.submitButton,
            ...(submitting ? registerFormStyles.submitButtonDisabled : {}),
          }}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      {serverMessage ? (
        <div style={registerFormStyles.serverMessage} role="alert">
          {serverMessage}
        </div>
      ) : null}
    </AuthLayout>
  );
}
