import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth/auth-store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type ApiRequestInit = Omit<RequestInit, "body"> & { body?: unknown };

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access: string };
    setTokens(data.access, refresh);
    return true;
  } catch {
    return false;
  }
}

async function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken();
  const ok = await refreshPromise;
  refreshPromise = null;
  if (!ok) {
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
  }
  return ok;
}

async function request<T>(
  path: string,
  init: ApiRequestInit = {},
  isRetry = false
): Promise<T> {
  const { body, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  headers.set("Content-Type", "application/json");
  const access = getAccessToken();
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !isRetry) {
    const refreshed = await doRefresh();
    if (refreshed) return request<T>(path, init, true);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? err.message ?? `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export type ApiRequestOptions = { signal?: AbortSignal };

export type PostMultipartOptions = {
  onProgress?: (loaded: number, total: number) => void;
};

function postMultipart<T>(
  path: string,
  fieldName: string,
  file: File,
  options?: PostMultipartOptions
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append(fieldName, file);

    xhr.open("POST", `${BASE_URL}${path}`);
    const access = getAccessToken();
    if (access) {
      xhr.setRequestHeader("Authorization", `Bearer ${access}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && options?.onProgress) {
        options.onProgress(e.loaded, e.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 401) {
        doRefresh().then((refreshed) => {
          if (refreshed) {
            postMultipart<T>(path, fieldName, file, options)
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error("Unauthorized"));
          }
        });
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.detail ?? err.message ?? `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}`));
        }
        return;
      }
      const text = xhr.responseText;
      resolve(text ? (JSON.parse(text) as T) : ({} as T));
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { method: "GET", ...options }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { method: "POST", body, ...options }),
  postMultipart: <T>(
    path: string,
    fieldName: string,
    file: File,
    options?: PostMultipartOptions
  ) => postMultipart<T>(path, fieldName, file, options),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { method: "PUT", body, ...options }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...options }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { method: "DELETE", ...options }),
};
