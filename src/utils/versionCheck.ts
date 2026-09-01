export const PRIMARY_UPDATE_URL = "https://raw.githubusercontent.com/Mustaq47/Budget-Tracker-/master/package.json";
export const FALLBACK_UPDATE_URL = "https://raw.githubusercontent.com/Mustaq47/Budget-Tracker-/main/package.json";
export const DOWNLOAD_URL = "https://cozify-finance.vercel.app/";

export async function fetchLatestVersion(): Promise<string | null> {
  const urls = [PRIMARY_UPDATE_URL, FALLBACK_UPDATE_URL];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.version === "string") {
          return data.version.trim();
        }
      }
    } catch {
      // try next fallback url
    }
  }
  return null;
}

export function compareVersions(current: string, latest: string): number {
  if (!current || !latest) return 0;
  const c = current.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const l = latest.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const cv = c[i] || 0;
    const lv = l[i] || 0;
    if (lv > cv) return 1;
    if (lv < cv) return -1;
  }
  return 0;
}
