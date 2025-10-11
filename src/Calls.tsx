import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Sidebar from "./components/Sidebar";
import { authFetch, clearToken, type AuthUser } from "./auth";
import { CallFilterState, useCallsQuery } from "./hooks/useCallsQuery";

export default function Calls() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [filters] = useState<CallFilterState>({ status: "completed" });
  const { data, meta, loading, load } = useCallsQuery();
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const response = await authFetch("/me");
      if (!response.ok) {
        clearToken();
        window.location.href = "/login";
        return;
      }
      const authenticatedUser: AuthUser = await response.json();
      if (isMounted) setUser(authenticatedUser);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    load({ filters });
  }, [filters, load]);

  useEffect(() => {
    if (data.length > 0 && selectedCallId === null) {
      setSelectedCallId(data[0].id);
    }
  }, [data, selectedCallId]);

  function handleLogout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    clearToken();
    window.location.href = "/login";
  }

  function handleLoadOlderCalls() {
    if (!meta?.nextCursor) return;
    load({ filters, cursor: meta.nextCursor });
  }

  const selectedCall = useMemo(
    () => data.find((call) => call.id === selectedCallId) ?? null,
    [data, selectedCallId]
  );
  const sidebarBusinessLabel = user?.name ?? "855-RILAWNS";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f6f7fb 0%, #ffffff 60%, #f6f1ff 100%)",
        color: "#2d1f47",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar activeItem="calls" businessLabel={sidebarBusinessLabel} />
      <main
        style={{
          flex: 1,
          padding: "42px 48px 72px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h1 style={{ margin: 0, fontSize: "30px", color: "#311b63" }}>
              Calls
            </h1>
            <p style={{ margin: 0, fontSize: "16px", color: "#756597" }}>
              Review recordings, transcripts, and caller details from your
              inbox.
            </p>
          </div>
          <a
            href="#"
            onClick={handleLogout}
            style={{
              fontWeight: 600,
              color: "#5a189a",
              textDecoration: "none",
            }}
          >
            Log out
          </a>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "28px",
            alignItems: "flex-start",
          }}
        >
          <article
            style={{
              borderRadius: "24px",
              border: "1px solid #ede3ff",
              backgroundColor: "#ffffff",
              boxShadow: "0 22px 48px rgba(60, 15, 115, 0.15)",
              padding: "24px 0 16px",
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 180px)",
            }}
          >
            <header style={{ padding: "0 24px 16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      textTransform: "uppercase",
                      color: "#7c6f92",
                      fontWeight: 600,
                    }}
                  >
                    Inbox
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#2d1f47",
                    }}
                  >
                    Archived ({data.length})
                  </span>
                </div>
                <button
                  type="button"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e6defb",
                    backgroundColor: "#ffffff",
                    color: "#5a189a",
                    fontWeight: 600,
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                >
                  Filter
                </button>
              </div>
            </header>
            <div style={{ overflowY: "auto", padding: "0 8px" }}>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {loading && data.length === 0 ? (
                  <li
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#756597",
                    }}
                  >
                    Loading calls...
                  </li>
                ) : null}
                {data.map((call) => {
                  const isSelected = call.id === selectedCallId;
                  const displayName = call.callerName ?? "Unknown caller";
                  const timestamp = call.startedAt
                    ? new Date(call.startedAt).toLocaleString()
                    : "Unknown time";
                  return (
                    <li key={call.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCallId(call.id)}
                        style={{
                          width: "100%",
                          border: "none",
                          borderRadius: "16px",
                          backgroundColor: isSelected ? "#f1ecff" : "#ffffff",
                          boxShadow: isSelected
                            ? "0 12px 28px rgba(60, 15, 115, 0.18)"
                            : "none",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 700, color: "#2d1f47" }}>
                            {displayName}
                          </span>
                          <span style={{ fontSize: "12px", color: "#9183aa" }}>
                            {timestamp}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#9183aa" }}>
                            {call.fromNumber ?? "Unknown number"}
                          </span>
                          <span
                            aria-hidden="true"
                            style={{
                              fontSize: "12px",
                              color: call.isStarred ? "#7c3aed" : "#c4b5fd",
                              fontWeight: 700,
                            }}
                          >
                            ★
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#665983",
                          }}
                        >
                          Status: {call.status}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {meta?.hasMore ? (
                <div style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={handleLoadOlderCalls}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e6defb",
                      backgroundColor: "#ffffff",
                      color: "#5a189a",
                      fontWeight: 600,
                      padding: "10px 18px",
                      cursor: "pointer",
                    }}
                  >
                    Load older calls
                  </button>
                </div>
              ) : null}
            </div>
          </article>

          <article
            style={{
              borderRadius: "24px",
              border: "1px solid #ede3ff",
              backgroundColor: "#ffffff",
              boxShadow: "0 24px 60px rgba(60, 15, 115, 0.15)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            {selectedCall ? (
              <div style={{ color: "#311b63" }}>
                <h2 style={{ margin: 0, fontSize: "22px" }}>
                  Call #{selectedCall.id}
                </h2>
                <p style={{ marginTop: "12px", color: "#5a4a7a" }}>
                  Detailed view coming soon. Caller:{" "}
                  {selectedCall.callerName ?? "Unknown"}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  minHeight: "420px",
                  color: "#7c6f92",
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: 600 }}>
                  Select a call to review the details
                </span>
                <span style={{ fontSize: "14px" }}>
                  Choose a call from the inbox to see details here.
                </span>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
