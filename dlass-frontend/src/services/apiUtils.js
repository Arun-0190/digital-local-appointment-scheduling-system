export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

export const API_URL = `${API_BASE_URL}/api`;

export function toAssetUrl(path, cacheKey = "") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalized}`;
  return cacheKey ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(cacheKey)}` : url;
}

export function initials(name = "") {
  const clean = name.trim();
  if (!clean) return "D";
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
