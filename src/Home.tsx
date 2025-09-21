import { useEffect, useState } from "react";
import { authFetch, clearToken, type AuthUser } from "./auth";

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await authFetch("/api/me");
      if (!res.ok) {
        clearToken();
        window.location.href = "/login";
        return;
      }
      const data: AuthUser = await res.json();
      if (mounted) setUser(data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function onLogout(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    clearToken();
    window.location.href = "/login";
  }

  return (
    <div>
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <a href="#" onClick={onLogout}>
          Log out
        </a>
      </div>
      <h1>{user ? `Welcome, ${user.name}` : "Loading..."}</h1>
    </div>
  );
}
