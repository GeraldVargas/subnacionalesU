const API_URL = import.meta.env.VITE_API_URL;

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function csrf() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await parseBody(res);

  if (!res.ok) {
    const msg =
      typeof body === "string" ? body : body?.message || JSON.stringify(body);
    throw new Error(msg);
  }
  return body;
}

export const api = {
  csrf,
  get: (p) => request(p, { method: "GET" }),
  post: (p, d) =>
    request(p, { method: "POST", body: JSON.stringify(d ?? {}) }),
};
