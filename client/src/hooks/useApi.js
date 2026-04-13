import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const DEFAULT_TIMEOUT_MS = 15000;

// Hebrew error normalization for common HTTP failure modes.
const buildHebrewError = (err, status) => {
  if (err?.name === "AbortError") return "הבקשה בוטלה";
  if (err?.message === "TimeoutError") return "הבקשה ארכה זמן רב מדי, נסה שוב";
  if (status === 400) return "הבקשה אינה תקינה";
  if (status === 401) return "נדרשת התחברות מחדש";
  if (status === 403) return "אין הרשאה לבצע פעולה זו";
  if (status === 404) return "המשאב המבוקש לא נמצא";
  if (status === 409) return "קיימת התנגשות עם הנתונים הקיימים";
  if (status && status >= 500) return "שגיאת שרת, נסה שוב בעוד רגע";
  return err?.message || "אירעה שגיאה לא צפויה";
};

const readToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

// Merge an external AbortSignal with our internal controller so either can cancel.
const mergeSignals = (external, internal) => {
  if (!external) return internal.signal;
  if (external.aborted) internal.abort();
  else external.addEventListener("abort", () => internal.abort(), { once: true });
  return internal.signal;
};

// Core request helper used by every feature hook.
// Normalizes: base URL prefixing, JSON body serialization, auth header injection,
// timeout + AbortController cancellation, and Hebrew error messages.
export const apiFetch = async (path, options = {}) => {
  const {
    method = "GET",
    body,
    headers = {},
    token,
    signal: externalSignal,
    timeout = DEFAULT_TIMEOUT_MS,
    auth = true,
  } = options;

  const controller = new AbortController();
  const signal = mergeSignals(externalSignal, controller);
  const timer = setTimeout(() => {
    const timeoutError = new Error("TimeoutError");
    timeoutError.name = "TimeoutError";
    controller.abort(timeoutError);
  }, timeout);

  const authToken = auth ? token || readToken() : null;
  const url = /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      method,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      ...(body !== undefined
        ? { body: typeof body === "string" ? body : JSON.stringify(body) }
        : {}),
    });

    if (!response.ok) {
      let serverMessage;
      try {
        const payload = await response.json();
        serverMessage = payload?.message;
      } catch {
        serverMessage = undefined;
      }
      const error = new Error(
        serverMessage || buildHebrewError(null, response.status)
      );
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    if (err?.status) throw err;
    const normalized = new Error(buildHebrewError(err, err?.status));
    normalized.cause = err;
    normalized.aborted = err?.name === "AbortError";
    throw normalized;
  } finally {
    clearTimeout(timer);
  }
};

// Declarative fetch hook: pass a loader that receives `{ signal }` and returns a promise.
// Re-runs whenever `deps` change and cancels the previous in-flight request.
// Returns { data, loading, error, refetch, setData } for composable feature hooks.
export const useApi = (loader, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeController = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeController.current?.abort();
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    if (typeof loader !== "function") return;
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await loader({ signal: controller.signal });
      if (mountedRef.current && !controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (!err?.aborted && mountedRef.current && !controller.signal.aborted) {
        setError(err?.message || "שגיאה בטעינת הנתונים");
      }
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run, setData };
};
