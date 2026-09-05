// Small deterministic helpers shared across mock data files so that demo
// dates stay stable across renders instead of reshuffling on every reload.

/** Deterministic ISO timestamp offset backward from a fixed demo "now". */
export const DEMO_NOW = new Date('2026-09-05T16:00:00Z');

export function daysAgo(days: number, hourOffset = 0): string {
  const ms = DEMO_NOW.getTime() - days * 86400000 - hourOffset * 3600000;
  return new Date(ms).toISOString();
}

export function daysFromNow(days: number): string {
  return new Date(DEMO_NOW.getTime() + days * 86400000).toISOString();
}
