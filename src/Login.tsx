import { useEffect, useMemo, useState } from "react";
import { setToken, type AuthResponse, getToken } from "./auth";

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
  const APP_ORIGIN =
    (import.meta.env.VITE_APP_ORIGIN as string | undefined) ||
    window.location.origin;
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
    // If already authenticated, redirect to Home
    if (getToken()) {
      window.location.replace(`${APP_ORIGIN}/`);
    }
  }, []);

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
      // Placeholder POST; adjust URL when backend endpoint is available
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Login failed");
      }
      const data: AuthResponse = await response.json();
      setToken(data.token);
      // Redirect to Home after successful login
      window.location.replace(`${APP_ORIGIN}/`);
    } catch (err) {
      setServerMessage((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? <div id="email-error">{errors.email}</div> : null}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password ? (
            <div id="password-error">{errors.password}</div>
          ) : null}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
      {serverMessage ? <p>{serverMessage}</p> : null}
      <p>
        Need an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
