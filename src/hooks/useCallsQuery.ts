import { useCallback, useMemo, useReducer } from "react";
import { authFetch } from "../auth";

export type CallFilterState = {
  status?: string;
  starred?: boolean;
  search?: string;
  after?: string;
  before?: string;
  toNumber?: string;
};

export type CallLayoutPreferences = {
  sectionOrder: string[];
  collapsedSections: Record<string, boolean>;
};

export type TranscriptMessage = {
  id: string;
  speaker: string;
  content: string;
  capturedAt: string | null;
};

export type CallSummary = {
  callerName?: string | null;
  reason?: string | null;
  notes?: string | null;
  [key: string]: unknown;
} | null;

export type CallListItem = {
  id: number;
  callSid: string | null;
  sessionId: string | null;
  callerName: string | null;
  fromNumber: string | null;
  toNumber: string | null;
  forwardedFrom: string | null;
  startedAt: string | null;
  isStarred: boolean;
  status: string;
  recordingUrl: string | null;
  summary: CallSummary;
  transcriptMessages: TranscriptMessage[];
  transcriptText: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ServerCall = {
  id: number;
  callSid: string | null;
  sessionId: string | null;
  callerName: string | null;
  fromNumber: string | null;
  toNumber: string | null;
  forwardedFrom: string | null;
  startedAt: string | null;
  isStarred: boolean;
  status: string;
  recordingUrl: string | null;
  summary: CallSummary;
  transcriptMessages: TranscriptMessage[];
  transcriptText: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ApiResponse = {
  data: ServerCall[];
  meta: {
    perPage: number;
    hasMore: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
};

type State = {
  items: CallListItem[];
  loading: boolean;
  error: string | null;
  meta: ApiResponse["meta"] | null;
  cursorByFilter: Record<string, string | null>;
};

type Action =
  | { type: "START" }
  | {
      type: "SUCCESS";
      payload: {
        items: CallListItem[];
        meta: ApiResponse["meta"];
        filterKey: string;
        nextCursor: string | null;
        append: boolean;
      };
    }
  | { type: "FAIL"; payload: { message: string } };

const initialState: State = {
  items: [],
  loading: false,
  error: null,
  meta: null,
  cursorByFilter: {},
};

function dedupeById(items: CallListItem[]): CallListItem[] {
  const seen = new Set<number>();
  const result: CallListItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: null };
    case "SUCCESS": {
      const { items, meta, filterKey, nextCursor, append } = action.payload;
      const nextItems = append ? dedupeById([...state.items, ...items]) : items;
      return {
        items: nextItems,
        loading: false,
        error: null,
        meta,
        cursorByFilter: {
          ...state.cursorByFilter,
          [filterKey]: nextCursor,
        },
      };
    }
    case "FAIL":
      return { ...state, loading: false, error: action.payload.message };
    default:
      return state;
  }
}

type FetchParams = {
  filters: CallFilterState;
  limit?: number;
  cursor?: string | null;
};

function buildQueryString(params: FetchParams): string {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.filters.status) searchParams.set("status", params.filters.status);
  if (params.filters.after) searchParams.set("after", params.filters.after);
  if (params.filters.before) searchParams.set("before", params.filters.before);
  if (params.filters.search) searchParams.set("search", params.filters.search);
  if (params.filters.toNumber)
    searchParams.set("to_number", params.filters.toNumber);
  if (typeof params.filters.starred === "boolean") {
    searchParams.set("starred", params.filters.starred ? "1" : "0");
  }
  const query = searchParams.toString();
  return query === "" ? "" : `?${query}`;
}

function buildFilterKey(filters: CallFilterState): string {
  return JSON.stringify(filters ?? {});
}

function mapCall(serverCall: ServerCall): CallListItem {
  return {
    id: serverCall.id,
    callSid: serverCall.callSid,
    sessionId: serverCall.sessionId,
    callerName: serverCall.callerName,
    fromNumber: serverCall.fromNumber,
    toNumber: serverCall.toNumber,
    forwardedFrom: serverCall.forwardedFrom,
    startedAt: serverCall.startedAt,
    isStarred: serverCall.isStarred,
    status: serverCall.status,
    recordingUrl: serverCall.recordingUrl,
    summary: serverCall.summary,
    transcriptMessages: serverCall.transcriptMessages ?? [],
    transcriptText: serverCall.transcriptText,
    endedAt: serverCall.endedAt,
    durationSeconds: serverCall.durationSeconds,
    createdAt: serverCall.createdAt,
    updatedAt: serverCall.updatedAt,
  };
}

type UseCallsQueryResult = {
  data: CallListItem[];
  loading: boolean;
  error: string | null;
  meta: ApiResponse["meta"] | null;
  load: (params: {
    filters: CallFilterState;
    cursor?: string | null;
    limit?: number;
  }) => Promise<void>;
  getStoredCursor: (filters: CallFilterState) => string | null;
};

export function useCallsQuery(): UseCallsQueryResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(
    async ({
      filters,
      cursor = null,
      limit = 25,
    }: {
      filters: CallFilterState;
      cursor?: string | null;
      limit?: number;
    }) => {
      dispatch({ type: "START" });
      try {
        const query = buildQueryString({ filters, cursor, limit });
        const response = await authFetch(`/calls${query}`);

        if (!response.ok) {
          const message = `Failed to load calls (${response.status})`;
          dispatch({ type: "FAIL", payload: { message } });
          return;
        }

        const json = (await response.json()) as ApiResponse;
        const mappedItems = json.data.map(mapCall);
        dispatch({
          type: "SUCCESS",
          payload: {
            items: mappedItems,
            meta: json.meta,
            filterKey: buildFilterKey(filters),
            nextCursor: json.meta.nextCursor,
            append: cursor !== null,
          },
        });
      } catch (error) {
        dispatch({
          type: "FAIL",
          payload: {
            message: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    },
    []
  );

  const getStoredCursor = useCallback(
    (filters: CallFilterState) =>
      state.cursorByFilter[buildFilterKey(filters)] ?? null,
    [state.cursorByFilter]
  );

  return useMemo(
    () => ({
      data: state.items,
      loading: state.loading,
      error: state.error,
      meta: state.meta,
      load,
      getStoredCursor,
    }),
    [state.items, state.loading, state.error, state.meta, load, getStoredCursor]
  );
}

export async function fetchCallLayoutPreferences(): Promise<CallLayoutPreferences> {
  const response = await authFetch("/call-layout");
  if (!response.ok) {
    return {
      sectionOrder: [],
      collapsedSections: {},
    };
  }

  const payload = (await response.json()) as
    | { data?: CallLayoutPreferences }
    | CallLayoutPreferences;

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = payload.data;
    if (data && typeof data === "object") {
      return {
        sectionOrder: Array.isArray(data.sectionOrder) ? data.sectionOrder : [],
        collapsedSections:
          (data.collapsedSections as Record<string, boolean>) ?? {},
      };
    }
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as CallLayoutPreferences;
    return {
      sectionOrder: Array.isArray(candidate.sectionOrder)
        ? candidate.sectionOrder
        : [],
      collapsedSections: candidate.collapsedSections ?? {},
    };
  }

  return {
    sectionOrder: [],
    collapsedSections: {},
  };
}

export async function saveCallLayoutPreferences(
  preferences: CallLayoutPreferences
): Promise<void> {
  const response = await authFetch("/call-layout", {
    method: "PUT",
    body: JSON.stringify({
      section_order: preferences.sectionOrder,
      collapsed_sections: preferences.collapsedSections,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to save call layout preferences (${response.status})`
    );
  }
}
