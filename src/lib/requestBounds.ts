/** Deadlines for tester-facing I/O. Routes and clients import these. */

export const PAGE_FETCH_TIMEOUT_MS = 8_000;
export const CHAT_FETCH_TIMEOUT_MS = 3_000;
export const IMAGE_GEN_TIMEOUT_MS = 14_000;
export const SOFASCORE_WAIT_MS = 8_000;
export const GRADE_DEADLINE_MS = 4_000;

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = PAGE_FETCH_TIMEOUT_MS,
): Promise<Response> {
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

export function firstResolved<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}
