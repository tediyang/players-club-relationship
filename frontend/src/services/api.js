const APP_ENV = import.meta.env.VITE_API_ENV;
export let API_BASE;

if (APP_ENV == 'production') {
  API_BASE = import.meta.env.VITE_API_BASE_URL
} else {
  API_BASE = 'api'
}


export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || "Request failed");
  }

  return payload;
}
