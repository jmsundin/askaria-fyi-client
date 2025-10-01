export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

const TOKEN_KEY = "jwt_token";
const API_PREFIX = "/api";
const apiBaseUrlFromEnv = import.meta.env.VITE_LARAVEL_URL as
  | string
  | undefined;

function assertNonEmptyEnvironmentVariable(
  value: string | undefined,
  variableName: string
): asserts value is string {
  if (!value) {
    throw new Error(`Missing environment variable: ${variableName}`);
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildApiUrl(pathAndQuery: string): string {
  assertNonEmptyEnvironmentVariable(apiBaseUrlFromEnv, "VITE_LARAVEL_URL");
  const normalizedApiBaseUrl = normalizeBaseUrl(apiBaseUrlFromEnv);
  return `${normalizedApiBaseUrl}${pathAndQuery}`;
}

function maybeResolveApiUrl(url: string): string {
  return url.startsWith(API_PREFIX) ? buildApiUrl(url) : url;
}

function resolveApiRequestInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string") {
    return maybeResolveApiUrl(input);
  }

  if (input instanceof URL) {
    const pathWithQuery = `${input.pathname}${input.search}${input.hash}`;
    if (!pathWithQuery.startsWith(API_PREFIX)) {
      return input;
    }
    return new URL(buildApiUrl(pathWithQuery));
  }

  if (input instanceof Request) {
    if (input.url.startsWith(API_PREFIX)) {
      throw new Error(
        "authFetch does not support Request instances with relative /api URLs."
      );
    }
    return input;
  }

  return input;
}

type AuthFetchOptions = RequestInit & {
  body?: BodyInit | null;
};

function logStorageError(actionDescription: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.warn(`Failed to ${actionDescription} the auth token.`, error);
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (storageError) {
    logStorageError("persist", storageError);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (storageError) {
    logStorageError("read", storageError);
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (storageError) {
    logStorageError("clear", storageError);
  }
}

function buildAuthHeaders(init: AuthFetchOptions): Headers {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}

function createAuthFetchOptions(init: AuthFetchOptions): RequestInit {
  return {
    ...init,
    headers: buildAuthHeaders(init),
    credentials: "include",
  };
}

export async function authFetch(
  input: RequestInfo | URL,
  init: AuthFetchOptions = {}
) {
  const fetchOptions = createAuthFetchOptions(init);
  const resolvedInput = resolveApiRequestInput(input);
  const response = await fetch(resolvedInput, {
    ...fetchOptions,
  });
  if (response.status === 401) {
    clearToken();
  }
  return response;
}
