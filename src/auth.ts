export type AuthUser = {
  id: number;
  name: string;
  email: string;
  agent_profile?: {
    business_phone_number: string | null;
    business_overview?: string | null;
    core_services?: unknown[];
    faq?: unknown[];
  } | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

const TOKEN_KEY = "jwt_token";
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
  const trimmedValue = baseUrl.trim();
  const candidate = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue.replace(/^\/+/u, "")}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidate);
  } catch (parseError) {
    throw new Error(
      `Invalid API base URL configured via VITE_LARAVEL_URL: ${candidate}`,
      { cause: parseError }
    );
  }

  const normalizedPathname = parsedUrl.pathname.replace(/\/+$/u, "");

  if (normalizedPathname === "" || normalizedPathname === "/") {
    return parsedUrl.origin;
  }

  throw new Error(
    `VITE_LARAVEL_URL must not include a path. Remove '${normalizedPathname}' from ${candidate}.`
  );
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function buildApiUrl(pathAndQuery: string): string {
  assertNonEmptyEnvironmentVariable(apiBaseUrlFromEnv, "VITE_LARAVEL_URL");
  const normalizedApiBaseUrl = normalizeBaseUrl(apiBaseUrlFromEnv);
  if (isAbsoluteUrl(pathAndQuery)) {
    return pathAndQuery;
  }
  const normalizedPath = pathAndQuery.startsWith("/")
    ? pathAndQuery
    : `/${pathAndQuery}`;
  return `${normalizedApiBaseUrl}${normalizedPath}`;
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
  const resolvedInput = resolveAuthFetchInput(input);
  const response = await fetch(resolvedInput, {
    ...fetchOptions,
  });
  if (response.status === 401) {
    clearToken();
  }
  return response;
}

function resolveAuthFetchInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string") {
    return buildApiUrl(input);
  }

  if (input instanceof URL) {
    return input;
  }

  if (input instanceof Request) {
    if (!isAbsoluteUrl(input.url)) {
      throw new Error(
        "authFetch requires Request instances to provide absolute URLs."
      );
    }
    return input;
  }

  return input;
}
