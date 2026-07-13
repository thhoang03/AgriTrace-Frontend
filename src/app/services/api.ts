const BASE_URL = "https://api.agritrace.vn/api/v1";

function getToken(): string | null {
  const auth = sessionStorage.getItem("agritrace_auth");
  if (!auth) return null;
  return JSON.parse(auth).accessToken ?? null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "API error");
  }
  return json.data as T;
}
