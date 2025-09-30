import { useEffect, useMemo, useState } from "react";
import { authFetch, setToken, type AuthResponse } from "./auth";
import { useNavigate, Link } from "react-router-dom";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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
      const response = await authFetch("/api/register", {
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
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name ? <div id="name-error">{errors.name}</div> : null}
        </div>

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

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            required
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirmPassword-error" : undefined
            }
          />
          {errors.confirmPassword ? (
            <div id="confirmPassword-error">{errors.confirmPassword}</div>
          ) : null}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
      {serverMessage ? <p>{serverMessage}</p> : null}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
