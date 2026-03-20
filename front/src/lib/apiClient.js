/**
 * Base da API Nest (porta 3000).
 * Dev: Vite proxy em /api → http://127.0.0.1:3000 (evita CORS).
 * Build: defina VITE_API_BASE=http://localhost:3000 se servir o front noutro host.
 */
const rawBase = import.meta.env.VITE_API_BASE ?? "/api";
const API_BASE = rawBase.replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const isForm = options.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data?.message
        ? Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message
        : typeof data === "string"
          ? data
          : `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
