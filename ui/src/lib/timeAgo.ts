const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

export function timeAgo(date: Date | string, t?: (key: string, vars?: Record<string, string>) => string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.round((now - then) / 1000);

  // If no translation function provided, use English defaults
  if (!t) {
    if (seconds < MINUTE) return "just now";
    if (seconds < HOUR) {
      const m = Math.floor(seconds / MINUTE);
      return `${m}m ago`;
    }
    if (seconds < DAY) {
      const h = Math.floor(seconds / HOUR);
      return `${h}h ago`;
    }
    if (seconds < WEEK) {
      const d = Math.floor(seconds / DAY);
      return `${d}d ago`;
    }
    if (seconds < MONTH) {
      const w = Math.floor(seconds / WEEK);
      return `${w}w ago`;
    }
    const mo = Math.floor(seconds / MONTH);
    return `${mo}mo ago`;
  }

  // Use translations
  if (seconds < MINUTE) return t("timeAgo.justNow");
  if (seconds < HOUR) {
    const m = Math.floor(seconds / MINUTE);
    return t("timeAgo.minutesAgo", { count: String(m) });
  }
  if (seconds < DAY) {
    const h = Math.floor(seconds / HOUR);
    return t("timeAgo.hoursAgo", { count: String(h) });
  }
  if (seconds < WEEK) {
    const d = Math.floor(seconds / DAY);
    return t("timeAgo.daysAgo", { count: String(d) });
  }
  if (seconds < MONTH) {
    const w = Math.floor(seconds / WEEK);
    return t("timeAgo.weeksAgo", { count: String(w) });
  }
  const mo = Math.floor(seconds / MONTH);
  return t("timeAgo.monthsAgo", { count: String(mo) });
}
