import { useEffect, useMemo, useState } from "react";
import { authFetch, setToken, type AuthResponse, getToken } from "./auth";
import { useNavigate, Link } from "react-router-dom";

type LoginFormData = {
  email: string;
  password: string;
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
        Need an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
