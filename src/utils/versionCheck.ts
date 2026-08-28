export const UPDATE_CHECK_URL = "https://raw.githubusercontent.com/Mustaq47/Budget-Tracker-/main/package.json";
export const DOWNLOAD_URL = "https://cozify-finance.vercel.app/";

export async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(UPDATE_CHECK_URL, { cache: "no-store" });
    const data = await res.json();
    return data.version || null;
  } catch {
    return null;
  }
}

export function compareVersions(current: string, latest: string): number {
  const c = current.split(".").map(Number);
  const l = latest.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((l[i] || 0) > (c[i] || 0)) return 1;
    if ((l[i] || 0) < (c[i] || 0)) return -1;
  }
  return 0;
}
