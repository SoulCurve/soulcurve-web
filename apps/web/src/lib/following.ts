import { useSyncExternalStore } from "react";

// Kept in the browser until accounts get server-side storage (Neon).
const KEY = "soulcurve:following";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked (private mode): following still works for this tab.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFollowing() {
  const ids = useSyncExternalStore(subscribe, read);
  return {
    ids,
    isFollowing: (steamId: string) => ids.includes(steamId),
    toggle: (steamId: string) =>
      write(ids.includes(steamId) ? ids.filter((id) => id !== steamId) : [steamId, ...ids]),
  };
}
