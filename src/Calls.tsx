import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  TbChevronDown,
  TbGripVertical,
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarRightCollapseFilled,
} from "react-icons/tb";
import Sidebar from "./components/Sidebar";
import { authFetch, clearToken, type AuthUser } from "./auth";
import type {
  CallFilterState,
  CallLayoutPreferences,
  CallListItem,
  TranscriptMessage,
} from "./hooks/useCallsQuery";
import {
  fetchCallLayoutPreferences,
  saveCallLayoutPreferences,
  useCallsQuery,
} from "./hooks/useCallsQuery";
import "./Calls.css";

type SummaryEntry = {
  label: string;
  value: string | null;
};

type TimelineEntry = {
  id: string;
  speaker: "agent" | "caller" | "other";
  speakerLabel: string;
  timestampLabel: string;
  content: string;
};

function formatAbsoluteTimestamp(timestamp: string | null): string {
  if (!timestamp) return "Unknown time";
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeTimestamp(timestamp: string | null): string {
  if (!timestamp) return "";
  const now = Date.now();
  const target = new Date(timestamp).getTime();
  const diffMs = target - now;
  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }
  if (Math.abs(hours) < 48) {
    return formatter.format(hours, "hour");
  }
  return formatter.format(days, "day");
}

function formatDuration(durationSeconds: number | null): string {
  if (!durationSeconds) return "—";
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const minuteLabel = minutes > 0 ? `${minutes} min` : "";
  const secondLabel = seconds > 0 ? `${seconds} sec` : "";
  return (
    `${minuteLabel}${
      minuteLabel && secondLabel ? " " : ""
    }${secondLabel}`.trim() || "—"
  );
}

function buildTimeline(messages: TranscriptMessage[]): TimelineEntry[] {
  return messages.map((message) => {
    const timestampLabel = message.capturedAt
      ? new Date(message.capturedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    let speaker: "agent" | "caller" | "other" = "other";
    if (message.speaker === "agent") speaker = "agent";
    if (message.speaker === "caller") speaker = "caller";

    const speakerLabel =
      speaker === "agent"
        ? "Aria"
        : speaker === "caller"
        ? "Caller"
        : message.speaker;

    return {
      id: message.id,
      speaker,
      speakerLabel,
      timestampLabel,
      content: message.content,
    };
  });
}

function extractSummaryEntries(call: CallListItem): SummaryEntry[] {
  const summary = call.summary ?? {};
  const entries: SummaryEntry[] = [];

  const callerName =
    (typeof summary === "object" && summary && "callerName" in summary
      ? (summary as Record<string, unknown>).callerName
      : null) ?? call.callerName;
  entries.push({
    label: "Caller",
    value: callerName ? String(callerName) : null,
  });

  entries.push({ label: "Caller Phone", value: call.fromNumber });

  if (typeof summary === "object" && summary) {
    const summaryRecord = summary as Record<string, unknown>;

    if (summaryRecord.callbackPhone) {
      entries.push({
        label: "Callback Number",
        value: String(summaryRecord.callbackPhone),
      });
    }

    if (summaryRecord.reason) {
      entries.push({ label: "Reason", value: String(summaryRecord.reason) });
    }

    if (summaryRecord.urgency) {
      entries.push({
        label: "Urgency",
        value: String(summaryRecord.urgency).toUpperCase(),
      });
    }

    if (summaryRecord.callbackTime) {
      const callbackTime = String(summaryRecord.callbackTime);
      const formattedTime = formatAbsoluteTimestamp(callbackTime);
      entries.push({
        label: "Best Time to Call",
        value: formattedTime,
      });
    }

    if (summaryRecord.notes) {
      entries.push({ label: "Notes", value: String(summaryRecord.notes) });
    }

    if (summaryRecord.customerAvailability) {
      entries.push({
        label: "Availability",
        value: String(summaryRecord.customerAvailability),
      });
    }
  }

  if (
    !entries.some((entry) => entry.label === "Notes") &&
    call.transcriptText
  ) {
    const firstSentence = call.transcriptText.split(/(?<=[.!?])\s/)[0];
    entries.push({ label: "Notes", value: firstSentence });
  }

  return entries;
}

function extractSummaryTags(summary: CallListItem["summary"]): string[] {
  if (!summary || typeof summary !== "object") return [];
  const summaryRecord = summary as Record<string, unknown>;
  const candidates =
    summaryRecord.tags ?? summaryRecord.labels ?? summaryRecord.keywords;
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((tag) => (typeof tag === "string" ? tag : null))
    .filter((tag): tag is string => Boolean(tag));
}

function resolveCallerName(call: CallListItem): string {
  const summary = call.summary;
  if (summary && typeof summary === "object") {
    const summaryRecord = summary as Record<string, unknown>;
    const summaryCallerName = summaryRecord.callerName;
    if (typeof summaryCallerName === "string") {
      const trimmedSummaryCallerName = summaryCallerName.trim();
      if (trimmedSummaryCallerName !== "") {
        return trimmedSummaryCallerName;
      }
    }
  }

  if (typeof call.callerName === "string") {
    const trimmedCallerName = call.callerName.trim();
    if (trimmedCallerName !== "") {
      return trimmedCallerName;
    }
  }

  if (typeof call.fromNumber === "string") {
    const trimmedFromNumber = call.fromNumber.trim();
    if (trimmedFromNumber !== "") {
      return trimmedFromNumber;
    }
  }

  return "";
}

function extractCallReason(call: CallListItem): string | null {
  const summary = call.summary;
  if (summary && typeof summary === "object") {
    const summaryRecord = summary as Record<string, unknown>;
    if (typeof summaryRecord.reason === "string") {
      return summaryRecord.reason;
    }
  }
  return null;
}

function categorizeCustomer(
  call: CallListItem,
  allCalls: CallListItem[]
): string {
  const phoneNumber = call.fromNumber;
  if (!phoneNumber) return "New customer";

  const callsFromNumber = allCalls.filter(
    (c) => c.fromNumber === phoneNumber
  ).length;

  if (callsFromNumber > 10) return "Repeat customer";
  if (callsFromNumber > 1) return "Previous customer";
  return "New customer";
}

export default function Calls() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [filters, setFilters] = useState<CallFilterState>({});
  const { data, meta, loading, load } = useCallsQuery();
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [isStarUpdating, setIsStarUpdating] = useState(false);
  const [isArchiveUpdating, setIsArchiveUpdating] = useState(false);
  const [isInboxCollapsed, setIsInboxCollapsed] = useState(false);
  const [layoutPreferences, setLayoutPreferences] =
    useState<CallLayoutPreferences | null>(null);

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
      if (!isMounted) return;

      setUser(authenticatedUser);
      const businessPhoneNumber =
        authenticatedUser.agent_profile?.business_phone_number;
      setFilters((currentFilters) => ({
        ...currentFilters,
        toNumber: businessPhoneNumber ?? currentFilters.toNumber,
      }));
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    load({ filters });
  }, [user, filters, load]);

  useEffect(() => {
    if (!user) return;
    let isActive = true;
    (async () => {
      const preferences = await fetchCallLayoutPreferences();
      if (!isActive) return;
      setLayoutPreferences(preferences);
    })();
    return () => {
      isActive = false;
    };
  }, [user]);
  useEffect(() => {
    if (!user) return;
    let isActive = true;
    (async () => {
      const preferences = await fetchCallLayoutPreferences();
      if (!isActive) return;
      setLayoutPreferences(preferences);
    })();
    return () => {
      isActive = false;
    };
  }, [user]);

  const handleLayoutChange = useCallback(
    (preferences: CallLayoutPreferences) => {
      setLayoutPreferences(preferences);
    },
    []
  );

  const persistLayoutPreferences = useCallback(
    async (preferences: CallLayoutPreferences) => {
      try {
        await saveCallLayoutPreferences(preferences);
        setLayoutPreferences(preferences);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("Failed to persist call layout preferences", error);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (data.length > 0 && selectedCallId === null) {
      setSelectedCallId(data[0].id);
    }
  }, [data, selectedCallId]);

  const selectedCall = useMemo(
    () => data.find((call) => call.id === selectedCallId) ?? null,
    [data, selectedCallId]
  );

  const starredCount = useMemo(
    () => data.reduce((total, call) => (call.isStarred ? total + 1 : total), 0),
    [data]
  );

  const sidebarBusinessLabel =
    user?.agent_profile?.business_phone_number ?? user?.name ?? "Your Business";

  async function handleToggleStar(call: CallListItem) {
    if (isStarUpdating) return;
    setIsStarUpdating(true);
    try {
      const response = await authFetch(`/calls/${call.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_starred: !call.isStarred }),
      });
      if (!response.ok) return;
      await load({ filters });
    } finally {
      setIsStarUpdating(false);
    }
  }

  async function handleArchiveStatus(call: CallListItem, status: string) {
    if (isArchiveUpdating) return;
    setIsArchiveUpdating(true);
    try {
      const response = await authFetch(`/calls/${call.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return;
      await load({ filters });
    } finally {
      setIsArchiveUpdating(false);
    }
  }

  function handleLogout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    clearToken();
    window.location.href = "/login";
  }

  function handleLoadOlderCalls() {
    if (!meta?.nextCursor) return;
    load({ filters, cursor: meta.nextCursor });
  }

  return (
    <div className="calls-page">
      <Sidebar activeItem="calls" businessLabel={sidebarBusinessLabel} />
      <main className="calls-layout">
        <header className="calls-header">
          <div>
            <h1>Calls</h1>
            <p>
              Review recordings, transcripts, and caller details from your
              inbox.
            </p>
          </div>
          <a href="#" onClick={handleLogout} className="logout-link">
            Log out
          </a>
        </header>

        <section
          className={
            isInboxCollapsed ? "calls-content inbox-collapsed" : "calls-content"
          }
        >
          <article
            className={isInboxCollapsed ? "call-list collapsed" : "call-list"}
          >
            {isInboxCollapsed ? (
              <div className="A">
                <button
                  type="button"
                  className="call-list-toggle-button"
                  onClick={() => setIsInboxCollapsed(false)}
                  aria-label="Expand inbox"
                >
                  <TbLayoutSidebarRightCollapseFilled
                    size={20}
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : (
              <>
                <header className="call-list-header">
                  <div>
                    <span className="call-list-heading-label">Inbox</span>
                    <span className="call-list-heading-value">
                      Archived ({data.length})
                    </span>
                  </div>
                  <div className="call-list-header-actions">
                    <button type="button" className="call-list-filter-button">
                      Filter
                    </button>
                    <button
                      type="button"
                      className="call-list-toggle-button"
                      onClick={() => setIsInboxCollapsed(true)}
                      aria-label="Collapse inbox"
                    >
                      <TbLayoutSidebarLeftCollapseFilled
                        size={20}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </header>

                <div className="call-list-body">
                  {loading && data.length === 0 ? (
                    <div className="call-list-empty">Loading calls…</div>
                  ) : null}
                  <ul className="call-list-items">
                    {data.map((call) => {
                      const isSelected = call.id === selectedCallId;
                      const relativeLabel = formatRelativeTimestamp(
                        call.startedAt
                      );
                      const callerDisplayName = resolveCallerName(call);
                      const callReason = extractCallReason(call);
                      const customerCategory = categorizeCustomer(call, data);
                      const urgency =
                        call.summary &&
                        typeof call.summary === "object" &&
                        "urgency" in call.summary
                          ? String(call.summary.urgency)
                          : null;
                      const isUrgent = urgency === "high";
                      return (
                        <li key={call.id}>
                          <button
                            type="button"
                            className={
                              isSelected ? "call-item selected" : "call-item"
                            }
                            onClick={() => setSelectedCallId(call.id)}
                          >
                            <div className="call-item-heading">
                              <span className="call-item-name">
                                {isUrgent ? "🔴 " : ""}
                                {callerDisplayName}
                              </span>
                              <time className="call-item-time">
                                {formatAbsoluteTimestamp(call.startedAt)}
                              </time>
                            </div>
                            {callReason ? (
                              <p className="call-item-reason">{callReason}</p>
                            ) : null}
                            <div className="call-item-metadata">
                              <span className="call-item-category">
                                {customerCategory}
                              </span>
                              {relativeLabel ? (
                                <>
                                  <span className="call-item-separator">
                                    {" "}
                                    •{" "}
                                  </span>
                                  <span className="call-item-elapsed">
                                    {relativeLabel}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {meta?.hasMore ? (
                    <div className="call-list-footer">
                      <button
                        type="button"
                        className="call-list-load-more"
                        onClick={handleLoadOlderCalls}
                      >
                        Load older calls
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </article>

          <article className="call-details">
            {selectedCall ? (
              <SelectedCallDetails
                call={selectedCall}
                starredCount={starredCount}
                onToggleStar={() => handleToggleStar(selectedCall)}
                onArchive={() => handleArchiveStatus(selectedCall, "archived")}
                onUnarchive={() =>
                  handleArchiveStatus(selectedCall, "completed")
                }
                isStarUpdating={isStarUpdating}
                isArchiveUpdating={isArchiveUpdating}
                layoutPreferences={layoutPreferences}
                onLayoutChange={handleLayoutChange}
                onPersistLayout={persistLayoutPreferences}
              />
            ) : (
              <div className="call-details-empty">
                <span>Select a call to review the details</span>
                <span>Choose a call from the inbox to see details here.</span>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

type SelectedCallDetailsProps = {
  call: CallListItem;
  starredCount: number;
  onToggleStar: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  isStarUpdating: boolean;
  isArchiveUpdating: boolean;
  layoutPreferences: CallLayoutPreferences | null;
  onLayoutChange: (preferences: CallLayoutPreferences) => void;
  onPersistLayout: (preferences: CallLayoutPreferences) => void;
};

type CallSectionId = "summary" | "transcript" | "notes";

type CallDetailSection = {
  id: CallSectionId;
  label: string;
  content: ReactNode;
};

function SelectedCallDetails({
  call,
  starredCount,
  onToggleStar,
  onArchive,
  onUnarchive,
  isStarUpdating,
  isArchiveUpdating,
  layoutPreferences,
  onLayoutChange,
  onPersistLayout,
}: SelectedCallDetailsProps) {
  const timeline = useMemo(
    () => buildTimeline(call.transcriptMessages),
    [call.transcriptMessages]
  );
  const summaryEntries = useMemo(() => extractSummaryEntries(call), [call]);
  const summaryTags = useMemo(
    () => extractSummaryTags(call.summary),
    [call.summary]
  );

  const callTimestampLabel = formatAbsoluteTimestamp(call.startedAt);
  const relativeLabel = formatRelativeTimestamp(call.startedAt);
  const durationLabel = formatDuration(call.durationSeconds);
  const statusLabel = call.status === "archived" ? "Archived" : call.status;

  const sections = useMemo<CallDetailSection[]>(() => {
    const items: CallDetailSection[] = [
      {
        id: "summary",
        label: "Summary",
        content: (
          <div className="selected-call-summary">
            <div className="selected-call-summary-card">
              <h3>Call Summary</h3>
              <ul>
                {summaryEntries.map((entry) => (
                  <li key={entry.label}>
                    <span className="summary-label">{entry.label}</span>
                    <span className="summary-value">{entry.value ?? "—"}</span>
                  </li>
                ))}
              </ul>
              <div className="selected-call-tags">
                {summaryTags.map((tag) => (
                  <span key={tag} className="call-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <aside className="selected-call-sidebar">
              <div className="selected-call-sidebar-card">
                <h4>Caller</h4>
                <p>{call.callerName ?? "Unknown"}</p>
                <h4>Business Line</h4>
                <p>{call.toNumber ?? "—"}</p>
                <h4>Status</h4>
                <p>
                  {statusLabel}
                  {call.isStarred ? " • Starred" : ""}
                </p>
                <h4>Duration</h4>
                <p>{durationLabel}</p>
                <h4>Starred calls</h4>
                <p>{starredCount}</p>
                <button
                  type="button"
                  className="selected-call-action"
                  onClick={() => window.open("/app/contacts", "_self")}
                >
                  View Contact
                </button>
              </div>
              {call.recordingUrl ? (
                <div className="selected-call-recording">
                  <h4>Call Recording</h4>
                  <audio
                    controls
                    src={call.recordingUrl}
                    className="call-audio-player"
                  >
                    <track kind="captions" />
                  </audio>
                </div>
              ) : null}
            </aside>
          </div>
        ),
      },
      {
        id: "transcript",
        label: "Transcript",
        content: (
          <div className="selected-call-transcript">
            <div className="selected-call-transcript-header">
              <h3>Transcript</h3>
              <span className="selected-call-transcript-meta">
                Starred calls: {starredCount}
              </span>
            </div>
            {timeline.length === 0 ? (
              <div className="selected-call-transcript-empty">
                Transcript unavailable.
              </div>
            ) : (
              <ol className="selected-call-transcript-timeline">
                {timeline.map((entry) => (
                  <li
                    key={entry.id}
                    className={
                      entry.speaker === "agent"
                        ? "message agent"
                        : entry.speaker === "caller"
                        ? "message caller"
                        : "message"
                    }
                  >
                    <div className="message-content">
                      <span className="message-speaker">
                        {entry.speakerLabel}
                      </span>
                      <p>{entry.content}</p>
                    </div>
                    <time className="message-time">{entry.timestampLabel}</time>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ),
      },
    ];

    if (call.transcriptText) {
      items.push({
        id: "notes",
        label: "Transcript Notes",
        content: (
          <div className="selected-call-transcript-text">
            <h3>Transcript Notes</h3>
            <p>{call.transcriptText}</p>
          </div>
        ),
      });
    }

    return items;
  }, [
    call,
    durationLabel,
    starredCount,
    statusLabel,
    summaryEntries,
    summaryTags,
    timeline,
  ]);

  const sectionIds = useMemo<CallSectionId[]>(
    () => sections.map((section) => section.id),
    [sections]
  );

  const [sectionOrder, setSectionOrder] = useState<CallSectionId[]>(sectionIds);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<CallSectionId, boolean>
  >(() => {
    return sectionIds.reduce((accumulator, id) => {
      accumulator[id] = false;
      return accumulator;
    }, {} as Record<CallSectionId, boolean>);
  });
  const [activeDropTarget, setActiveDropTarget] =
    useState<CallSectionId | null>(null);
  const draggingSectionId = useRef<CallSectionId | null>(null);

  useEffect(() => {
    if (!layoutPreferences) return;
    const persistedOrder = layoutPreferences.sectionOrder.filter(
      (id): id is CallSectionId => sectionIds.includes(id as CallSectionId)
    );
    if (persistedOrder.length > 0) {
      setSectionOrder(persistedOrder);
    }
    setCollapsedSections((current) => {
      const next: Record<CallSectionId, boolean> = {} as Record<
        CallSectionId,
        boolean
      >;
      sectionIds.forEach((id) => {
        const saved = layoutPreferences.collapsedSections[id];
        if (saved === undefined || saved === null) {
          next[id] = current[id] ?? false;
        } else {
          next[id] = Boolean(saved);
        }
      });
      return next;
    });
  }, [layoutPreferences, sectionIds]);

  useEffect(() => {
    setSectionOrder((current) => {
      const retained = current.filter((id) => sectionIds.includes(id));
      const missing = sectionIds.filter((id) => !retained.includes(id));
      return [...retained, ...missing];
    });
    setCollapsedSections((current) => {
      const next: Record<CallSectionId, boolean> = {} as Record<
        CallSectionId,
        boolean
      >;
      sectionIds.forEach((id) => {
        next[id] = current[id] ?? false;
      });
      return next;
    });
  }, [sectionIds]);

  const orderedSections = useMemo<CallDetailSection[]>(() => {
    const sectionMap = new Map(
      sections.map((section) => [section.id, section])
    );
    const result: CallDetailSection[] = [];
    sectionOrder.forEach((id) => {
      const section = sectionMap.get(id);
      if (section) {
        result.push(section);
      }
    });
    sections.forEach((section) => {
      if (!sectionOrder.includes(section.id)) {
        result.push(section);
      }
    });
    return result;
  }, [sectionOrder, sections]);

  const persistLayout = useCallback(
    (order: CallSectionId[], collapsed: Record<CallSectionId, boolean>) => {
      onLayoutChange({
        sectionOrder: order,
        collapsedSections: collapsed,
      });
      onPersistLayout({
        sectionOrder: order,
        collapsedSections: collapsed,
      });
    },
    [onLayoutChange, onPersistLayout]
  );

  const toggleSection = useCallback(
    (sectionId: CallSectionId) => {
      setCollapsedSections((current) => {
        const next = {
          ...current,
          [sectionId]: !current[sectionId],
        };
        persistLayout(sectionOrder, next);
        return next;
      });
    },
    [persistLayout, sectionOrder]
  );

  const reorderSections = useCallback(
    (sourceId: CallSectionId, targetId: CallSectionId) => {
      if (sourceId === targetId) return;
      setSectionOrder((current) => {
        const next = [...current];
        const sourceIndex = next.indexOf(sourceId);
        const targetIndex = next.indexOf(targetId);
        if (sourceIndex === -1 || targetIndex === -1) return current;
        next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, sourceId);
        persistLayout(next, collapsedSections);
        return next;
      });
    },
    [collapsedSections, persistLayout]
  );

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, sectionId: CallSectionId) => {
      draggingSectionId.current = sectionId;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", sectionId);
    },
    []
  );

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>, sectionId: CallSectionId) => {
      event.preventDefault();
      setActiveDropTarget(sectionId);
    },
    []
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>, sectionId: CallSectionId) => {
      event.preventDefault();
      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
        return;
      }
      setActiveDropTarget((current) =>
        current === sectionId ? null : current
      );
    },
    []
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, targetId: CallSectionId) => {
      event.preventDefault();
      const sourceId =
        draggingSectionId.current ??
        ((event.dataTransfer.getData("text/plain") as CallSectionId | "") ||
          null);
      draggingSectionId.current = null;
      setActiveDropTarget(null);
      if (!sourceId || sourceId === targetId) return;
      reorderSections(sourceId, targetId);
    },
    [reorderSections]
  );

  const handleDragEnd = useCallback(() => {
    draggingSectionId.current = null;
    setActiveDropTarget(null);
  }, []);

  return (
    <div className="selected-call">
      <header className="selected-call-header">
        <div>
          <span>Call started at </span>
          <h2>{callTimestampLabel}</h2>
          {relativeLabel ? (
            <span className="selected-call-relative-time">{relativeLabel}</span>
          ) : null}
        </div>
        <div className="selected-call-actions">
          <button
            type="button"
            className="selected-call-action"
            onClick={onToggleStar}
            disabled={isStarUpdating}
          >
            {call.isStarred ? "Unstar" : "Star"}
          </button>
          {call.status === "archived" ? (
            <button
              type="button"
              className="selected-call-action"
              onClick={onUnarchive}
              disabled={isArchiveUpdating}
            >
              Unarchive
            </button>
          ) : (
            <button
              type="button"
              className="selected-call-action"
              onClick={onArchive}
              disabled={isArchiveUpdating}
            >
              Archive
            </button>
          )}
        </div>
      </header>
      <div className="selected-call-section-list">
        {orderedSections.map((section) => {
          const isCollapsed = collapsedSections[section.id] ?? false;
          const wrapperClassName = [
            "call-collapsible-section",
            isCollapsed ? "is-collapsed" : "",
            activeDropTarget === section.id ? "drop-target" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={section.id}
              className={wrapperClassName}
              onDragEnter={(event) => handleDragEnter(event, section.id)}
              onDragOver={handleDragOver}
              onDragLeave={(event) => handleDragLeave(event, section.id)}
              onDrop={(event) => handleDrop(event, section.id)}
            >
              {activeDropTarget === section.id ? (
                <div className="call-drop-indicator">
                  <span>Release to place here</span>
                </div>
              ) : null}
              <div className="call-collapsible-header">
                <button
                  type="button"
                  className="call-drag-handle"
                  draggable
                  onDragStart={(event) => handleDragStart(event, section.id)}
                  onDragEnd={handleDragEnd}
                  aria-label={`Move ${section.label}`}
                >
                  <TbGripVertical size={18} aria-hidden="true" />
                  <span className="sr-only">Move {section.label}</span>
                </button>
                <span className="call-collapsible-title">{section.label}</span>
                <button
                  type="button"
                  className="call-collapse-toggle"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`call-section-${section.id}`}
                >
                  <TbChevronDown
                    size={18}
                    aria-hidden="true"
                    className={
                      isCollapsed
                        ? "call-collapse-icon is-collapsed"
                        : "call-collapse-icon"
                    }
                  />
                  <span className="sr-only">
                    {isCollapsed ? "Expand" : "Collapse"} {section.label}
                  </span>
                </button>
              </div>
              <div
                id={`call-section-${section.id}`}
                className={
                  isCollapsed
                    ? "call-collapsible-body collapsed"
                    : "call-collapsible-body"
                }
              >
                {section.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
