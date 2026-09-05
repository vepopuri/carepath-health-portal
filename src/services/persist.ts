// Tiny localStorage helper used by every mock service's mutable store so
// demo state (claims filed, payments made, prior auth requests, …) survives
// a page reload. Namespaced and versioned so a future shape change can force
// a reseed by bumping the version rather than guessing at migrations.
//
// Deliberately fails soft: if localStorage is unavailable (private
// browsing, storage quota, SSR) every function below just falls back to
// in-memory-only behavior instead of throwing.

const NAMESPACE = 'carepath_demo/v1';

export function loadPersisted<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}/${key}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function savePersisted<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${NAMESPACE}/${key}`, JSON.stringify(value));
  } catch {
    // Storage unavailable or full — the demo continues in-memory only.
  }
}

/** Initializes a store from localStorage if present, else from the given seed. */
export function initStore<T>(key: string, seed: T): T {
  return loadPersisted<T>(key) ?? seed;
}
