import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Sidebar from "./components/Sidebar";
import { authFetch, clearToken, type AuthUser } from "./auth";

type CallInboxEntry = {
  id: string;
  callerName: string;
  callerNumber: string;
  archivedOnLabel: string;
  preview: string;
  isStarred: boolean;
};

type TranscriptMessage = {
  id: string;
  speaker: "agent" | "caller";
  content: string;
};

const archivedCalls: CallInboxEntry[] = [
  {
    id: "call-1",
    callerName: "Anonymous Caller",
    callerNumber: "(952) 555-0199",
    archivedOnLabel: "9/6/25",
    preview:
      "Caller asked whether the crew was still on track for aeration today.",
    isStarred: true,
  },
  {
    id: "call-2",
    callerName: "Anonymous Caller",
    callerNumber: "(952) 555-0111",
    archivedOnLabel: "9/5/25",
    preview: "Requested confirmation about the upcoming fertilization window.",
    isStarred: true,
  },
  {
    id: "call-3",
    callerName: "Anonymous Caller",
    callerNumber: "(612) 555-0195",
    archivedOnLabel: "9/5/25",
    preview: "Shared contact number to reschedule service visit.",
    isStarred: true,
  },
  {
    id: "call-4",
    callerName: "Anonymous Caller",
    callerNumber: "(763) 555-0108",
    archivedOnLabel: "9/5/25",
    preview: "Followed up about invoice that was emailed the prior week.",
    isStarred: true,
  },
  {
    id: "call-5",
    callerName: "Anonymous Caller",
    callerNumber: "(651) 555-0184",
    archivedOnLabel: "9/5/25",
    preview: "Asked for advice on watering schedule after recent rainfall.",
    isStarred: false,
  },
  {
    id: "call-6",
    callerName: "Anonymous Caller",
    callerNumber: "(763) 555-0212",
    archivedOnLabel: "9/4/25",
    preview: "Wanted to know if the crew could add leaf cleanup to the visit.",
    isStarred: false,
  },
];

const transcriptMessages: TranscriptMessage[] = [
  {
    id: "msg-1",
    speaker: "agent",
    content:
      "Hi, this is Aria with Eight Five Five R Lawns. Our office hours are 08:30 to 03:30 Monday to Friday. You can try calling back again during business hours, or I can do my best to help you now. What can I help you with?",
  },
  {
    id: "msg-2",
    speaker: "caller",
    content:
      "Uh, just checking to see if the crew was still coming out today for an aeration.",
  },
  {
    id: "msg-3",
    speaker: "agent",
    content:
      "You will receive a text message or email once your services are dispatched. Unfortunately, we cannot provide an exact time of arrival because the crew has a full day of scheduled stops. Is there anything else I can assist you with?",
  },
];

const archivedTotalCount = 713;

export default function Calls() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isComponentMounted = true;
    (async () => {
      const response = await authFetch("/api/me");
      if (!response.ok) {
        clearToken();
        window.location.href = "/login";
        return;
      }
      const authenticatedUser: AuthUser = await response.json();
      if (isComponentMounted) setUser(authenticatedUser);
    })();
    return () => {
      isComponentMounted = false;
    };
  }, []);

  function handleLogout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    clearToken();
    window.location.href = "/login";
  }

  const selectedCall = archivedCalls[0];
  const starredCount = useMemo(
    () => archivedCalls.filter((call) => call.isStarred).length,
    []
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
                    Archived ({archivedTotalCount})
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
                {archivedCalls.map((call) => {
                  const isSelected = call.id === selectedCall.id;
                  return (
                    <li key={call.id}>
                      <button
                        type="button"
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
                            {call.callerName}
                          </span>
                          <span style={{ fontSize: "12px", color: "#9183aa" }}>
                            {call.archivedOnLabel}
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
                            {call.callerNumber}
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
                          {call.preview}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
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
              gap: "24px",
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "22px", color: "#311b63" }}>
                    Fri, Sep 5, 2:43 PM
                  </h2>
                  <span style={{ fontSize: "13px", color: "#7c6f92" }}>
                    (5 days ago)
                  </span>
                </div>
                <div
                  style={{
                    borderRadius: "20px",
                    padding: "16px",
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "14px",
                    lineHeight: 1.5,
                    boxShadow: "0 18px 36px rgba(124, 58, 237, 0.35)",
                  }}
                >
                  Call summary content is intentionally blurred to mirror the
                  provided design preview.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "flex-end",
                }}
              >
                <audio controls style={{ width: "220px" }}>
                  <source src="" />
                </audio>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
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
                    ★ Unstar
                  </button>
                  <button
                    type="button"
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
                    Unarchive
                  </button>
                </div>
              </div>
            </header>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #ede3ff",
                    paddingBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#7c6f92",
                    }}
                  >
                    Transcript
                  </span>
                  <span style={{ fontSize: "12px", color: "#7c6f92" }}>
                    Highlights ({starredCount})
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {transcriptMessages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        alignSelf:
                          message.speaker === "agent"
                            ? "stretch"
                            : "flex-start",
                        borderRadius: "16px",
                        padding: "14px 18px",
                        backgroundColor:
                          message.speaker === "agent" ? "#e0e7ff" : "#f3f4f6",
                        color: "#1f2937",
                        boxShadow: "0 12px 30px rgba(60, 15, 115, 0.12)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                          marginBottom: "4px",
                        }}
                      >
                        {message.speaker === "agent" ? "Aria" : "Caller"}
                      </div>
                      <p
                        style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}
                      >
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <aside
                style={{
                  borderRadius: "18px",
                  border: "1px solid #f2eafd",
                  backgroundColor: "#fbf8ff",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
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
                      color: "#7c6f92",
                      fontWeight: 600,
                    }}
                  >
                    Caller Info
                  </span>
                  <strong style={{ color: "#311b63" }}>
                    {selectedCall.callerName}
                  </strong>
                  <span style={{ color: "#5a4a7a", fontSize: "14px" }}>
                    {selectedCall.callerNumber}
                  </span>
                </div>
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
                      color: "#7c6f92",
                      fontWeight: 600,
                    }}
                  >
                    Status
                  </span>
                  <span style={{ color: "#4b5563", fontSize: "14px" }}>
                    Archived • Starred
                  </span>
                </div>
                <button
                  type="button"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #e6defb",
                    backgroundColor: "#ffffff",
                    color: "#5a189a",
                    fontWeight: 600,
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                >
                  View Contact
                </button>
              </aside>
            </section>
          </article>
        </section>
      </main>
    </div>
  );
}
