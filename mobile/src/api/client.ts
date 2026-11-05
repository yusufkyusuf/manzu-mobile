import { API_BASE_URL, FORBIDDEN_PATHS, REQUEST_TIMEOUT_MS } from './config';
import { ApiError, normalizeErrorBody } from './errors';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: Method;
  body?: unknown;
  formData?: FormData;
  query?: Record<string, QueryValue>;
  /** Attach the Bearer token. Default true. */
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
  responseType?: 'json' | 'text';
}

interface ClientHooks {
  getToken: () => string | null;
  onUnauthorized: (error: ApiError) => void;
}

let hooks: ClientHooks = { getToken: () => null, onUnauthorized: () => {} };

export function configureApiClient(next: ClientHooks): void {
  hooks = next;
}

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const params = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${API_BASE_URL}${path}${params ? `?${params}` : ''}`;
}

export function assertAllowedPath(path: string): void {
  if (FORBIDDEN_PATHS.some((re) => re.test(path))) {
    throw new ApiError('This action is not available in the mobile app.', 0, 'FORBIDDEN_ENDPOINT');
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  assertAllowedPath(path);
  if (!API_BASE_URL) {
    throw new ApiError('API URL is not configured (EXPO_PUBLIC_API_URL).', 0, 'NOT_CONFIGURED');
  }

  const { method = 'GET', body, formData, query, auth = true, signal, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const headers: Record<string, string> = { Accept: options.responseType === 'text' ? 'text/csv, text/plain, */*' : 'application/json' };
  if (body !== undefined && !formData) headers['Content-Type'] = 'application/json';

  const token = auth ? hooks.getToken() : null;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (err) {
    if (timedOut) throw new ApiError('The request timed out. Check your connection and try again.', 0, 'TIMEOUT');
    if (signal?.aborted) throw err;
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text && options.responseType !== 'text') {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = undefined;
    }
  }

  if (!response.ok) {
    const error = normalizeErrorBody(response.status, parsed);
    if (response.status === 401 && auth && token) hooks.onUnauthorized(error);
    throw error;
  }

  return (options.responseType === 'text' ? text : parsed) as T;
}
